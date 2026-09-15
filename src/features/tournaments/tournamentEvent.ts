import type { Match } from '@/domain/match';
import type { Tournament } from '@/domain/tournament';
import { buildMatchFromForm, createEmptyMatchForm } from '@/features/matches/matchFormUtils';

/** A shared event for finance and timeline views; never persisted as a child match. */
export function tournamentEvent(tournament: Tournament): Match {
  const base = buildMatchFromForm({
    ...createEmptyMatchForm(),
    ...tournament.matchDefaults,
    date: tournament.startDate,
    time: '00:00',
    title: tournament.title,
    location: tournament.location ?? '',
  });
  return {
    ...base,
    ...tournament.settlement,
    id: tournament.id,
    ownerUid: tournament.ownerUid,
    kickoffAt: new Date(`${tournament.endDate}T23:59:59`),
    createdAt: tournament.createdAt,
    updatedAt: tournament.updatedAt,
    flight: tournament.flight,
    lodging: tournament.lodging,
    groundTravel: tournament.groundTravel,
    expenses: tournament.expenses,
    customItinerary: tournament.customItinerary,
  };
}

/** Synthetic match for parent-level timeline (travel + shared itinerary). */
export function tournamentTimelineMatch(tournament: Tournament): Match {
  const event = tournamentEvent(tournament);
  const [year, month, day] = tournament.startDate.split('-').map(Number);

  return {
    ...event,
    kickoffAt: new Date(year, month - 1, day, 8, 0, 0, 0),
    title: tournament.title,
    location: tournament.location ?? event.location,
  };
}
