import type { Match } from '@/domain/match';
import type { Tournament } from '@/domain/tournament';
import { isValidDateRange } from '@/features/forms/formValidation';

export type InsightsDateRange = {
  startDate?: string;
  endDate?: string;
};

export function isInsightsDateRangeActive(range: InsightsDateRange): boolean {
  return Boolean(range.startDate || range.endDate);
}

export function isValidInsightsDateRange(range: InsightsDateRange): boolean {
  if (range.startDate && range.endDate) {
    return isValidDateRange(range.startDate, range.endDate);
  }
  return true;
}

function matchDateKey(match: Match): string {
  const date = match.kickoffAt;
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function tournamentOverlapsRange(
  tournament: Tournament,
  range: InsightsDateRange,
): boolean {
  if (range.startDate && tournament.endDate < range.startDate) return false;
  if (range.endDate && tournament.startDate > range.endDate) return false;
  return true;
}

function matchInRange(
  match: Match,
  range: InsightsDateRange,
  includedTournamentIds: ReadonlySet<string>,
): boolean {
  if (match.tournamentId && includedTournamentIds.has(match.tournamentId)) {
    return true;
  }

  const dateKey = matchDateKey(match);
  if (range.startDate && dateKey < range.startDate) return false;
  if (range.endDate && dateKey > range.endDate) return false;
  return true;
}

export function filterInsightsData(
  matches: Match[],
  tournaments: Tournament[],
  range: InsightsDateRange,
): { matches: Match[]; tournaments: Tournament[] } {
  if (!isInsightsDateRangeActive(range) || !isValidInsightsDateRange(range)) {
    return { matches, tournaments };
  }

  const filteredTournaments = tournaments.filter((tournament) =>
    tournamentOverlapsRange(tournament, range),
  );
  const includedTournamentIds = new Set(filteredTournaments.map((tournament) => tournament.id));
  const filteredMatches = matches.filter((match) =>
    matchInRange(match, range, includedTournamentIds),
  );

  return { matches: filteredMatches, tournaments: filteredTournaments };
}

export function formatInsightsRangeLabel(range: InsightsDateRange): string {
  if (!isInsightsDateRangeActive(range)) return 'All time';

  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formatIsoDate = (isoDate: string) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return formatter.format(new Date(year, month - 1, day));
  };

  if (range.startDate && range.endDate) {
    return `${formatIsoDate(range.startDate)} – ${formatIsoDate(range.endDate)}`;
  }
  if (range.startDate) return `From ${formatIsoDate(range.startDate)}`;
  return `Through ${formatIsoDate(range.endDate!)}`;
}
