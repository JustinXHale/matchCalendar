import { createDemoMatches } from '@/demo/demoMatches';
import { useDemoMode } from '@/demo/DemoModeContext';
import { useLiveData } from '@/features/auth/useLiveData';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Match } from '@/domain/match';
import { upsertMatch, subscribeMatches } from '@/features/matches/matchFirestoreRepository';
import {
  loadMatches,
  persistMatches,
  updateMatchRecord,
} from '@/features/matches/matchRepository';
import { migrateLocalDataToFirestore } from '@/services/localDataMigration';

type MatchesContextValue = {
  matches: Match[];
  createMatch: (
    data: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Match;
  updateMatch: (matchId: string, patch: Partial<Match>) => Match | undefined;
  replaceAllMatches: (matches: Match[]) => void;
  dataReady: boolean;
};

const MatchesContext = createContext<MatchesContextValue | null>(null);

export function MatchesProvider({ children }: { children: ReactNode }) {
  const { isDemoMode } = useDemoMode();
  const { isLive, uid } = useLiveData();
  const [realMatches, setRealMatches] = useState<Match[]>(() => loadMatches());
  const [demoMatches, setDemoMatches] = useState<Match[]>(createDemoMatches);
  const [dataReady, setDataReady] = useState(!isLive);
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
      })
      .finally(() => {
        if (!active) return;
        setDataReady(true);
      });

    const unsubscribe = subscribeMatches(uid, (nextMatches) => {
      setRealMatches(nextMatches);
      setDataReady(true);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [isLive, uid]);

  const persistLocal = useCallback(
    (next: Match[]) => {
      if (!isDemoMode && !isLive) persistMatches(next);
    },
    [isDemoMode, isLive],
  );

  const createMatch = useCallback(
    (data: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date();
      const match: Match = {
        ...data,
        id: crypto.randomUUID(),
        ownerUid: isLive && uid ? uid : data.ownerUid,
        createdAt: now,
        updatedAt: now,
      };

      if (isLive && uid) {
        void upsertMatch(uid, match);
        return match;
      }

      setMatches((current) => {
        const next = [...current, match];
        persistLocal(next);
        return next;
      });

      return match;
    },
    [isLive, persistLocal, setMatches, uid],
  );

  const updateMatch = useCallback(
    (matchId: string, patch: Partial<Match>) => {
      if (isLive && uid) {
        const updated = updateMatchRecord(matches, matchId, patch);
        if (!updated) return undefined;
        void upsertMatch(uid, updated);
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
    [isLive, matches, persistLocal, setMatches, uid],
  );

  const replaceAllMatches = useCallback(
    (next: Match[]) => {
      if (isLive && uid) {
        for (const match of next) {
          void upsertMatch(uid, match);
        }
        return;
      }
      persistLocal(next);
      setMatches(next);
    },
    [isLive, persistLocal, setMatches, uid],
  );

  const value = useMemo(
    () => ({
      matches,
      createMatch,
      updateMatch,
      replaceAllMatches,
      dataReady,
    }),
    [matches, createMatch, updateMatch, replaceAllMatches, dataReady],
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
