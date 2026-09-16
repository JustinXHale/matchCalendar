import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { createDemoTournaments } from '@/demo/demoTournaments';
import { useDemoMode } from '@/demo/DemoModeContext';
import { useLiveData } from '@/features/auth/useLiveData';
import type { Tournament } from '@/domain/tournament';
import {
  deleteTournament as deleteTournamentDoc,
  subscribeTournaments,
  upsertTournament,
} from '@/features/tournaments/tournamentFirestoreRepository';
import {
  loadTournaments,
  persistTournaments,
  removeTournamentRecord,
  updateTournamentRecord,
} from '@/features/tournaments/tournamentRepository';
import { LOCAL_OWNER_UID } from '@/services/localStore';
import { firestoreErrorMessage } from '@/services/firestoreErrors';
import { useAppToast } from '@/ui/AppToastProvider';

type TournamentsContextValue = {
  tournaments: Tournament[];
  createTournament: (
    data: Omit<Tournament, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'>,
  ) => Promise<Tournament>;
  updateTournament: (
    tournamentId: string,
    patch: Partial<Tournament>,
  ) => Promise<Tournament | undefined>;
  getTournamentById: (tournamentId: string) => Tournament | undefined;
  deleteTournament: (tournamentId: string) => Promise<boolean>;
  dataReady: boolean;
};

const TournamentsContext = createContext<TournamentsContextValue | null>(null);

export function TournamentsProvider({ children }: { children: ReactNode }) {
  const { pushError } = useAppToast();
  const { isDemoMode } = useDemoMode();
  const { isLive, uid } = useLiveData();
  const [realTournaments, setRealTournaments] = useState<Tournament[]>(() =>
    loadTournaments(),
  );
  const [demoTournaments, setDemoTournaments] = useState<Tournament[]>(
    createDemoTournaments,
  );
  const [dataReady, setDataReady] = useState(!isLive);
  const tournaments = isDemoMode ? demoTournaments : realTournaments;
  const setTournaments = isDemoMode ? setDemoTournaments : setRealTournaments;

  useEffect(() => {
    if (!isLive || !uid) {
      setDataReady(true);
      return;
    }

    const unsubscribe = subscribeTournaments(
      uid,
      (nextTournaments) => {
        setRealTournaments(nextTournaments);
        setDataReady(true);
      },
      (error) => pushError(firestoreErrorMessage(error)),
    );

    return unsubscribe;
  }, [isLive, pushError, uid]);

  const persistLocal = useCallback(
    (next: Tournament[]) => {
      if (!isDemoMode && !isLive) persistTournaments(next);
    },
    [isDemoMode, isLive],
  );

  const createTournament = useCallback(
    async (
      data: Omit<Tournament, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'>,
    ) => {
      const now = new Date();
      const tournament: Tournament = {
        ...data,
        id: crypto.randomUUID(),
        ownerUid: isLive && uid ? uid : LOCAL_OWNER_UID,
        createdAt: now,
        updatedAt: now,
      };

      if (isLive && uid) {
        try {
          await upsertTournament(uid, tournament);
        } catch (error) {
          pushError(firestoreErrorMessage(error));
          throw error;
        }
        return tournament;
      }

      setTournaments((current) => {
        const next = [...current, tournament];
        persistLocal(next);
        return next;
      });

      return tournament;
    },
    [isLive, persistLocal, pushError, setTournaments, uid],
  );

  const updateTournament = useCallback(
    async (tournamentId: string, patch: Partial<Tournament>) => {
      if (isLive && uid) {
        const updated = updateTournamentRecord(tournaments, tournamentId, patch);
        if (!updated) return undefined;
        try {
          await upsertTournament(uid, updated);
        } catch (error) {
          pushError(firestoreErrorMessage(error));
          throw error;
        }
        return updated;
      }

      let updated: Tournament | undefined;
      setTournaments((current) => {
        updated = updateTournamentRecord(current, tournamentId, patch);
        if (!updated) return current;
        const next = current.map((tournament) =>
          tournament.id === tournamentId ? updated! : tournament,
        );
        persistLocal(next);
        return next;
      });

      return updated;
    },
    [isLive, persistLocal, pushError, setTournaments, tournaments, uid],
  );

  const getTournamentById = useCallback(
    (tournamentId: string) =>
      tournaments.find((tournament) => tournament.id === tournamentId),
    [tournaments],
  );

  const deleteTournament = useCallback(
    async (tournamentId: string): Promise<boolean> => {
      if (!tournaments.some((tournament) => tournament.id === tournamentId)) {
        return false;
      }

      if (isLive && uid) {
        try {
          await deleteTournamentDoc(uid, tournamentId);
          return true;
        } catch (error) {
          console.error('Delete tournament failed', error);
          pushError(firestoreErrorMessage(error));
          return false;
        }
      }

      setTournaments((current) => {
        const next = removeTournamentRecord(current, tournamentId);
        persistLocal(next);
        return next;
      });
      return true;
    },
    [isLive, persistLocal, pushError, setTournaments, tournaments, uid],
  );

  const value = useMemo(
    () => ({
      tournaments,
      createTournament,
      updateTournament,
      getTournamentById,
      deleteTournament,
      dataReady,
    }),
    [
      tournaments,
      createTournament,
      updateTournament,
      getTournamentById,
      deleteTournament,
      dataReady,
    ],
  );

  return (
    <TournamentsContext.Provider value={value}>
      {children}
    </TournamentsContext.Provider>
  );
}

export function useTournamentsContext(): TournamentsContextValue {
  const context = useContext(TournamentsContext);
  if (!context) {
    throw new Error(
      'useTournamentsContext must be used within TournamentsProvider',
    );
  }
  return context;
}
