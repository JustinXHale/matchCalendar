import type { Match } from '@/domain/match';

export function getMatchDisplayTitle(match: Match): string {
  if (match.title?.trim()) return match.title.trim();

  const home = match.home?.trim();
  const away = match.away?.trim();

  if (home && away) return `${home} vs ${away}`;
  if (home) return home;
  if (away) return away;

  return 'Match';
}

export function formatMatchDate(match: Match): string {
  return match.kickoffAt.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: match.timezone,
  });
}

export function formatMatchTime(match: Match): string {
  return match.kickoffAt.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: match.timezone,
  });
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCardDate(match: Match): {
  month: string;
  day: string;
  weekday: string;
} {
  const month = match.kickoffAt
    .toLocaleDateString(undefined, {
      month: 'short',
      timeZone: match.timezone,
    })
    .replace(/\.$/, '')
    .toUpperCase();
  const day = match.kickoffAt.toLocaleDateString(undefined, {
    day: 'numeric',
    timeZone: match.timezone,
  });
  const weekday = `${match.kickoffAt
    .toLocaleDateString(undefined, {
      weekday: 'short',
      timeZone: match.timezone,
    })
    .replace(/\.$/, '')}.`;

  return { month, day, weekday };
}

export function formatIsoDateCard(isoDate: string): {
  month: string;
  day: string;
  weekday: string;
} {
  const [year, monthIndex, dayNum] = isoDate.split('-').map(Number);
  const date = new Date(year, monthIndex - 1, dayNum);

  const month = date
    .toLocaleDateString(undefined, { month: 'short' })
    .replace(/\.$/, '')
    .toUpperCase();
  const day = date.toLocaleDateString(undefined, { day: 'numeric' });
  const weekday = `${date
    .toLocaleDateString(undefined, { weekday: 'short' })
    .replace(/\.$/, '')}.`;

  return { month, day, weekday };
}
