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
  upsertTournament,
  subscribeTournaments,
} from '@/features/tournaments/tournamentFirestoreRepository';
import {
  loadTournaments,
  persistTournaments,
  updateTournamentRecord,
} from '@/features/tournaments/tournamentRepository';
import { LOCAL_OWNER_UID } from '@/services/localStore';

type TournamentsContextValue = {
  tournaments: Tournament[];
  createTournament: (
    data: Omit<Tournament, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt'>,
  ) => Tournament;
  updateTournament: (
    tournamentId: string,
    patch: Partial<Tournament>,
  ) => Tournament | undefined;
  getTournamentById: (tournamentId: string) => Tournament | undefined;
  dataReady: boolean;
};

const TournamentsContext = createContext<TournamentsContextValue | null>(null);

export function TournamentsProvider({ children }: { children: ReactNode }) {
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

    const unsubscribe = subscribeTournaments(uid, (nextTournaments) => {
      setRealTournaments(nextTournaments);
      setDataReady(true);
    });

    return unsubscribe;
  }, [isLive, uid]);

  const persistLocal = useCallback(
    (next: Tournament[]) => {
      if (!isDemoMode && !isLive) persistTournaments(next);
    },
    [isDemoMode, isLive],
  );

  const createTournament = useCallback(
    (
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
        void upsertTournament(uid, tournament);
        return tournament;
      }

      setTournaments((current) => {
        const next = [...current, tournament];
        persistLocal(next);
        return next;
      });

      return tournament;
    },
    [isLive, persistLocal, setTournaments, uid],
  );

  const updateTournament = useCallback(
    (tournamentId: string, patch: Partial<Tournament>) => {
      if (isLive && uid) {
        const updated = updateTournamentRecord(tournaments, tournamentId, patch);
        if (!updated) return undefined;
        void upsertTournament(uid, updated);
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
    [isLive, persistLocal, setTournaments, tournaments, uid],
  );

  const getTournamentById = useCallback(
    (tournamentId: string) =>
      tournaments.find((tournament) => tournament.id === tournamentId),
    [tournaments],
  );

  const value = useMemo(
    () => ({
      tournaments,
      createTournament,
      updateTournament,
      getTournamentById,
      dataReady,
    }),
    [
      tournaments,
      createTournament,
      updateTournament,
      getTournamentById,
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
