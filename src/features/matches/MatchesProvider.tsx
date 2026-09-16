import { createDemoMatches } from '@/demo/demoMatches';
import { useDemoMode } from '@/demo/DemoModeContext';
import { useLiveData } from '@/features/auth/useLiveData';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { Match } from '@/domain/match';
import {
  deleteMatch as deleteMatchDoc,
  subscribeMatches,
  upsertMatch,
} from '@/features/matches/matchFirestoreRepository';
import { isManualMatch } from '@/domain/recordDelete';
import { runMatchReadySync } from '@/features/matches/matchReadySync';
import { getCalendarSettings } from '@/features/profile/calendarSettingsRepository';
import {
  loadMatches,
  persistMatches,
  removeMatchRecord,
  updateMatchRecord,
} from '@/features/matches/matchRepository';
import { migrateLocalDataToFirestore } from '@/services/localDataMigration';
import { firestoreErrorMessage } from '@/services/firestoreErrors';
import { useAppToast } from '@/ui/AppToastProvider';

type MatchesContextValue = {
  matches: Match[];
  createMatch: (
    data: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Match>;
  updateMatch: (
    matchId: string,
    patch: Partial<Match>,
  ) => Promise<Match | undefined>;
  deleteMatch: (matchId: string) => Promise<boolean>;
  replaceAllMatches: (matches: Match[]) => void;
  dataReady: boolean;
  matchReadySyncing: boolean;
  matchReadyLastSyncedAt?: string;
  syncMatchReady: (force?: boolean) => Promise<void>;
};

const MatchesContext = createContext<MatchesContextValue | null>(null);

export function MatchesProvider({ children }: { children: ReactNode }) {
  const { pushError, pushInfo } = useAppToast();
  const { isDemoMode } = useDemoMode();
  const { isLive, uid } = useLiveData();
  const [realMatches, setRealMatches] = useState<Match[]>(() => loadMatches());
  const [demoMatches, setDemoMatches] = useState<Match[]>(createDemoMatches);
  const [dataReady, setDataReady] = useState(!isLive);
  const [matchReadySyncing, setMatchReadySyncing] = useState(false);
  const [matchReadyLastSyncedAt, setMatchReadyLastSyncedAt] = useState<string>();
  const [matchesSubscribed, setMatchesSubscribed] = useState(false);
  const autoSyncStartedRef = useRef(false);
  const matches = isDemoMode ? demoMatches : realMatches;
  const setMatches = isDemoMode ? setDemoMatches : setRealMatches;

  useEffect(() => {
    if (!isLive || !uid) {
      setDataReady(true);
      return;
    }

    let active = true;
    setDataReady(false);

    void migrateLocalDataToFirestore(uid)
      .catch((error) => {
        console.error('Local data migration failed', error);
        pushError(firestoreErrorMessage(error));
      })
      .finally(() => {
        if (!active) return;
        setDataReady(true);
      });

    const unsubscribe = subscribeMatches(
      uid,
      (nextMatches) => {
        setRealMatches(nextMatches);
        setDataReady(true);
        setMatchesSubscribed(true);
      },
      (error) => pushError(firestoreErrorMessage(error)),
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [isLive, pushError, uid]);

  const syncMatchReady = useCallback(
    async (force = false) => {
      if (!isLive || !uid || isDemoMode) return;
      setMatchReadySyncing(true);
      try {
        const outcome = await runMatchReadySync(uid, { force });
        if (!outcome) return;
        setMatchReadyLastSyncedAt(new Date().toISOString());
        const changed = outcome.created + outcome.updated + outcome.removed;
        if (changed > 0) {
          const parts: string[] = [];
          const upserted = outcome.created + outcome.updated;
          if (upserted > 0) {
            parts.push(
              `${upserted} updated`,
            );
          }
          if (outcome.removed > 0) {
            parts.push(`${outcome.removed} removed`);
          }
          pushInfo(`MatchReady sync: ${parts.join(', ')}.`);
        }
      } catch (error) {
        console.error('MatchReady sync failed', error);
        pushError(firestoreErrorMessage(error));
      } finally {
        setMatchReadySyncing(false);
      }
    },
    [isDemoMode, isLive, pushError, pushInfo, uid],
  );

  useEffect(() => {
    if (!isLive || !uid) {
      setMatchesSubscribed(false);
      autoSyncStartedRef.current = false;
      return;
    }

    void getCalendarSettings(uid)
      .then((settings) => {
        if (settings.matchReadyLastSyncedAt) {
          setMatchReadyLastSyncedAt(settings.matchReadyLastSyncedAt);
        }
      })
      .catch((error) => {
        console.error('Failed to load MatchReady sync settings', error);
      });
  }, [isLive, uid]);

  useEffect(() => {
    if (!isLive || !uid || isDemoMode || !matchesSubscribed) {
      if (!isLive || !uid || isDemoMode) {
        autoSyncStartedRef.current = false;
      }
      return;
    }
    if (autoSyncStartedRef.current) return;
    autoSyncStartedRef.current = true;
    void syncMatchReady(false);
  }, [isDemoMode, isLive, matchesSubscribed, syncMatchReady, uid]);

  const persistLocal = useCallback(
    (next: Match[]) => {
      if (!isDemoMode && !isLive) persistMatches(next);
    },
    [isDemoMode, isLive],
  );

  const createMatch = useCallback(
    async (data: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date();
      const match: Match = {
        ...data,
        id: crypto.randomUUID(),
        ownerUid: isLive && uid ? uid : data.ownerUid,
        createdAt: now,
        updatedAt: now,
      };

      if (isLive && uid) {
        try {
          await upsertMatch(uid, match);
        } catch (error) {
          pushError(firestoreErrorMessage(error));
          throw error;
        }
        return match;
      }

      setMatches((current) => {
        const next = [...current, match];
        persistLocal(next);
        return next;
      });

      return match;
    },
    [isLive, persistLocal, pushError, setMatches, uid],
  );

  const updateMatch = useCallback(
    async (matchId: string, patch: Partial<Match>) => {
      if (isLive && uid) {
        const updated = updateMatchRecord(matches, matchId, patch);
        if (!updated) return undefined;
        try {
          await upsertMatch(uid, updated);
        } catch (error) {
          pushError(firestoreErrorMessage(error));
          throw error;
        }
        return updated;
      }

      let updated: Match | undefined;
      setMatches((current) => {
        updated = updateMatchRecord(current, matchId, patch);
        if (!updated) return current;
        const next = current.map((match) =>
          match.id === matchId ? updated! : match,
        );
        persistLocal(next);
        return next;
      });

      return updated;
    },
    [isLive, matches, persistLocal, pushError, setMatches, uid],
  );

  const deleteMatch = useCallback(
    async (matchId: string): Promise<boolean> => {
      const target = matches.find((match) => match.id === matchId);
      if (!target || !isManualMatch(target)) return false;

      if (isLive && uid) {
        try {
          await deleteMatchDoc(uid, matchId);
          return true;
        } catch (error) {
          console.error('Delete match failed', error);
          pushError(firestoreErrorMessage(error));
          return false;
        }
      }

      setMatches((current) => {
        const next = removeMatchRecord(current, matchId);
        persistLocal(next);
        return next;
      });
      return true;
    },
    [isLive, matches, persistLocal, pushError, setMatches, uid],
  );

  const replaceAllMatches = useCallback(
    (next: Match[]) => {
      if (isLive && uid) {
        for (const match of next) {
          void upsertMatch(uid, match).catch((error) => {
            pushError(firestoreErrorMessage(error));
          });
        }
        return;
      }
      persistLocal(next);
      setMatches(next);
    },
    [isLive, persistLocal, pushError, setMatches, uid],
  );

  const value = useMemo(
    () => ({
      matches,
      createMatch,
      updateMatch,
      deleteMatch,
      replaceAllMatches,
      dataReady,
      matchReadySyncing,
      matchReadyLastSyncedAt,
      syncMatchReady,
    }),
    [
      matches,
      createMatch,
      updateMatch,
      deleteMatch,
      replaceAllMatches,
      dataReady,
      matchReadySyncing,
      matchReadyLastSyncedAt,
      syncMatchReady,
    ],
  );

  return (
    <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>
  );
}

export function useMatchesContext(): MatchesContextValue {
  const context = useContext(MatchesContext);
  if (!context) {
    throw new Error('useMatchesContext must be used within MatchesProvider');
  }
  return context;
}
