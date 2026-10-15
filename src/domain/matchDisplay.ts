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

export function formatMatchTime(match: Match, locale?: string): string {
  return match.kickoffAt.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: match.timezone,
  });
}

export function formatCurrency(amount: number, currency = 'USD', locale = 'en-US'): string {
  const normalized = currency.trim().toUpperCase() || 'USD';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: normalized,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCardDate(match: Match, locale?: string): {
  month: string;
  day: string;
  weekday: string;
} {
  const month = match.kickoffAt
    .toLocaleDateString(locale, {
      month: 'short',
      timeZone: match.timezone,
    })
    .replace(/\.$/, '')
    .toUpperCase();
  const day = match.kickoffAt.toLocaleDateString(locale, {
    day: 'numeric',
    timeZone: match.timezone,
  });
  const weekday = `${match.kickoffAt
    .toLocaleDateString(locale, {
      weekday: 'short',
      timeZone: match.timezone,
    })
    .replace(/\.$/, '')}.`;

  return { month, day, weekday };
}

export function formatIsoDateCard(isoDate: string, locale?: string): {
  month: string;
  day: string;
  weekday: string;
} {
  const [year, monthIndex, dayNum] = isoDate.split('-').map(Number);
  const date = new Date(year, monthIndex - 1, dayNum);

  const month = date
    .toLocaleDateString(locale, { month: 'short' })
    .replace(/\.$/, '')
    .toUpperCase();
  const day = date.toLocaleDateString(locale, { day: 'numeric' });
  const weekday = `${date
    .toLocaleDateString(locale, { weekday: 'short' })
    .replace(/\.$/, '')}.`;

  return { month, day, weekday };
}
