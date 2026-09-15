import type { Match } from '@/domain/match';

export type ScheduleMatchItem = {
  type: 'match';
  match: Match;
};

export type ScheduleTournamentItem = {
  type: 'tournament';
  tournamentId: string;
  matches: Match[];
};

export type ScheduleListItem = ScheduleMatchItem | ScheduleTournamentItem;

export function buildScheduleListItems(matches: Match[]): ScheduleListItem[] {
  const items: ScheduleListItem[] = [];
  const seenTournamentIds = new Set<string>();

  for (const match of matches) {
    if (match.tournamentId) {
      if (seenTournamentIds.has(match.tournamentId)) continue;

      seenTournamentIds.add(match.tournamentId);
      items.push({
        type: 'tournament',
        tournamentId: match.tournamentId,
        matches: matches.filter(
          (entry) => entry.tournamentId === match.tournamentId,
        ),
      });
      continue;
    }

    items.push({ type: 'match', match });
  }

  return items;
}

export type AgendaNextItem =
  | { type: 'match'; match: Match }
  | { type: 'tournament'; tournamentId: string; matches: Match[] }
  | null;

export function splitAgendaNext(upcoming: Match[]): {
  next: AgendaNextItem;
  rest: Match[];
} {
  if (upcoming.length === 0) {
    return { next: null, rest: [] };
  }

  const first = upcoming[0];

  if (first.tournamentId) {
    const tournamentId = first.tournamentId;
    const tournamentMatches = upcoming.filter(
      (match) => match.tournamentId === tournamentId,
    );
    const rest = upcoming.filter((match) => match.tournamentId !== tournamentId);

    return {
      next: { type: 'tournament', tournamentId, matches: tournamentMatches },
      rest,
    };
  }

  return {
    next: { type: 'match', match: first },
    rest: upcoming.slice(1),
  };
}
