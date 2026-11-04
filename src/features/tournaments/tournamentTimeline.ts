import type { Tournament } from '@/domain/tournament';
import type { LocalProfile } from '@/features/profile/localProfile';
import {
  buildMatchTimeline,
  type TimelineItem,
} from '@/features/timeline/matchTimeline';
import { tournamentTimelineMatch } from '@/features/tournaments/tournamentEvent';

export const TOURNAMENT_BOUNDARY_IDS = new Set([
  'tournament-start',
  'tournament-end',
]);

function dateFromYmd(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function boundaryItem(
  id: 'tournament-start' | 'tournament-end',
  date: string,
  label: string,
): TimelineItem {
  return {
    id,
    kind: 'factual',
    at: dateFromYmd(date),
    precision: 'date',
    dateKey: date,
    label,
  };
}

export function buildTournamentTimeline(
  tournament: Tournament,
  profile: Pick<
    LocalProfile,
    'pitchArrivalMinutesBeforeKickoff' | 'airportArrivalMinutesBeforeFlight'
  >,
): TimelineItem[] {
  const travelItems = buildMatchTimeline(
    tournamentTimelineMatch(tournament),
    profile,
    { includeMatchMilestones: false },
  );

  return [
    ...travelItems,
    boundaryItem('tournament-start', tournament.startDate, 'Tournament starts'),
    boundaryItem('tournament-end', tournament.endDate, 'Tournament ends'),
  ].sort((a, b) => a.at.getTime() - b.at.getTime());
}
