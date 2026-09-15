import type { Match } from '@/domain/match';
import { migrateMatches } from '@/features/matches/matchMigration';
import { readJson, STORAGE_KEYS, writeJson } from '@/services/localStore';

export function loadMatches(): Match[] {
  const matches = readJson<Match[]>(STORAGE_KEYS.matches, []);
  const migrated = migrateMatches(matches);
  const needsPersist =
    matches.length !== migrated.length ||
    matches.some((match, index) => {
      const migratedMatch = migrated[index];
      const legacyContact = (match as Match & { contact?: string }).contact;
      return (
        !match.matchType ||
        match.expenses?.some((expense) => !expense.reimbursementStatus) ||
        match.id !== migratedMatch?.id ||
        JSON.stringify(match.flight) !== JSON.stringify(migratedMatch?.flight) ||
        Boolean(legacyContact && !migratedMatch?.contacts?.length)
      );
    });

  if (needsPersist) {
    persistMatches(migrated);
  }

  return migrated;
}

export function persistMatches(matches: Match[]): void {
  writeJson(STORAGE_KEYS.matches, matches);
}

export function updateMatchRecord(
  matches: Match[],
  matchId: string,
  patch: Partial<Match>,
): Match | undefined {
  const index = matches.findIndex((match) => match.id === matchId);
  if (index < 0) return undefined;

  const updated: Match = {
    ...matches[index],
    ...patch,
    id: matches[index].id,
    updatedAt: new Date(),
  };

  return updated;
}

export function replaceMatches(matches: Match[]): void {
  persistMatches(matches);
}

export function removeMatchRecord(
  matches: Match[],
  matchId: string,
): Match[] {
  return matches.filter((match) => match.id !== matchId);
}
