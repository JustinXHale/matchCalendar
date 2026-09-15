import type { Match } from '@/domain/match';

export function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

export function getMonthGrid(year: number, month: number): Date[] {
  const first = startOfMonth(year, month);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const days: Date[] = [];
  const cursor = new Date(start);

  for (let index = 0; index < 42; index += 1) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function getMatchDates(matches: Match[]): Set<string> {
  const dates = new Set<string>();
  for (const match of matches) {
    dates.add(toDateKey(match.kickoffAt));
  }
  return dates;
}

export function getMatchesForDate(matches: Match[], date: Date): Match[] {
  return matches
    .filter((match) => isSameCalendarDay(match.kickoffAt, date))
    .sort((a, b) => a.kickoffAt.getTime() - b.kickoffAt.getTime());
}

export function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}
