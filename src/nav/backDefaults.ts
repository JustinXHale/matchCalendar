import type { Location } from 'react-router-dom';
import { routes } from '@/app/routes';
import type { BackNav } from '@/nav/backNav';

export const SCHEDULE_BACK: BackNav = { to: routes.schedule, label: 'Schedule' };
export const MONEY_BACK: BackNav = { to: routes.money, label: 'Money' };
export const INSIGHTS_BACK: BackNav = { to: routes.insights, label: 'Insights' };
export const TOURNAMENTS_BACK: BackNav = { to: routes.tournaments, label: 'Tournaments' };

export function backFromLocation(location: Location): BackNav {
  const { pathname } = location;
  if (pathname.startsWith(routes.money)) return MONEY_BACK;
  if (pathname.startsWith(routes.insights)) return INSIGHTS_BACK;
  if (pathname.startsWith(routes.tournaments)) return TOURNAMENTS_BACK;
  return SCHEDULE_BACK;
}

export function tournamentBack(tournamentId: string): BackNav {
  return { to: routes.tournamentDetail(tournamentId), label: 'Tournament' };
}

export function matchBack(matchId: string): BackNav {
  return { to: routes.matchDetail(matchId), label: 'Match' };
}
