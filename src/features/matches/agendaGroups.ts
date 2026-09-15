import type { Match } from '@/domain/match';
import { getUpcomingMatches } from '@/features/matches/matchQueries';

export type AgendaSectionKey = 'today' | 'tomorrow' | 'thisWeek' | 'later';

export type AgendaSection = {
  key: AgendaSectionKey;
  label: string;
  matches: Match[];
};

const SECTION_LABELS: Record<AgendaSectionKey, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  thisWeek: 'This Week',
  later: 'Later',
};

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const day = next.getDay();
  const daysUntilSunday = 7 - day;
  next.setDate(next.getDate() + daysUntilSunday);
  next.setHours(23, 59, 59, 999);
  return next;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getSectionKey(match: Match, now: Date): AgendaSectionKey {
  const kickoff = match.kickoffAt;
  const today = startOfDay(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = endOfWeek(now);

  if (isSameDay(kickoff, today)) return 'today';
  if (isSameDay(kickoff, tomorrow)) return 'tomorrow';
  if (kickoff > tomorrow && kickoff <= weekEnd) return 'thisWeek';
  return 'later';
}

export function groupAgendaMatches(
  matches: Match[],
  now = new Date(),
): AgendaSection[] {
  const upcoming = getUpcomingMatches(matches, now);
  const buckets: Record<AgendaSectionKey, Match[]> = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
  };

  for (const match of upcoming) {
    buckets[getSectionKey(match, now)].push(match);
  }

  return (['today', 'tomorrow', 'thisWeek', 'later'] as AgendaSectionKey[])
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({
      key,
      label: SECTION_LABELS[key],
      matches: buckets[key],
    }));
}
