import type { Tournament } from '@/domain/tournament';
import { readJson, STORAGE_KEYS, writeJson } from '@/services/localStore';

export function loadTournaments(): Tournament[] {
  return readJson<Tournament[]>(STORAGE_KEYS.tournaments, []).map(
    (tournament) => ({
      ...tournament,
      payScope: tournament.payScope ?? 'tournament',
    }),
  );
}

export function persistTournaments(tournaments: Tournament[]): void {
  writeJson(STORAGE_KEYS.tournaments, tournaments);
}

export function updateTournamentRecord(
  tournaments: Tournament[],
  tournamentId: string,
  patch: Partial<Tournament>,
): Tournament | undefined {
  const index = tournaments.findIndex(
    (tournament) => tournament.id === tournamentId,
  );
  if (index < 0) return undefined;

  return {
    ...tournaments[index],
    ...patch,
    id: tournaments[index].id,
    updatedAt: new Date(),
  };
}
