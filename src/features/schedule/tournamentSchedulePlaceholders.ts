import type { Match } from '@/domain/match';
import type { Tournament } from '@/domain/tournament';
import { tournamentTimelineMatch } from '@/features/tournaments/tournamentEvent';

const PLACEHOLDER_PREFIX = 'schedule-tournament:';

type TournamentSchedulePlaceholder = Match & {
  scheduleTournamentEndAt: Date;
};

function localDate(date: string, endOfDay = false): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0,
  );
}

function tournamentPlaceholder(
  tournament: Tournament,
): TournamentSchedulePlaceholder {
  return {
    ...tournamentTimelineMatch(tournament),
    id: `${PLACEHOLDER_PREFIX}${tournament.id}`,
    tournamentId: tournament.id,
    kickoffAt: localDate(tournament.startDate),
    scheduleTournamentEndAt: localDate(tournament.endDate, true),
  };
}

export function isTournamentSchedulePlaceholder(
  match: Match,
): match is TournamentSchedulePlaceholder {
  return match.id.startsWith(PLACEHOLDER_PREFIX);
}

/**
 * Makes an empty tournament visible in schedule views without persisting a
 * fake child match. Once real child matches exist, they remain the source for
 * the tournament's schedule group.
 */
export function withStandaloneTournamentPlaceholders(
  matches: Match[],
  tournaments: Tournament[],
): Match[] {
  const tournamentIdsWithMatches = new Set(
    matches.flatMap((match) => match.tournamentId ? [match.tournamentId] : []),
  );
  const placeholders = tournaments
    .filter((tournament) => !tournamentIdsWithMatches.has(tournament.id))
    .map(tournamentPlaceholder);

  return [...matches, ...placeholders];
}

export function tournamentScheduleEndAt(match: Match): Date | undefined {
  return isTournamentSchedulePlaceholder(match)
    ? match.scheduleTournamentEndAt
    : undefined;
}

export function removeTournamentSchedulePlaceholders(matches: Match[]): Match[] {
  return matches.filter((match) => !isTournamentSchedulePlaceholder(match));
}
