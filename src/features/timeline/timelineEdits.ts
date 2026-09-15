import type { Match } from '@/domain/match';
import { getFlightSegments } from '@/features/matches/flightUtils';

function minutesBefore(anchor: Date, at: Date): number {
  return Math.max(0, Math.round((anchor.getTime() - at.getTime()) / 60_000));
}

export function getFirstFlightDeparture(match: Match): Date | undefined {
  return getFlightSegments(match.flight)
    .map((segment) => segment.departureAt)
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => a.getTime() - b.getTime())[0];
}

export function applyTimelineTimeEdit(
  match: Match,
  itemId: string,
  newAt: Date,
): Partial<Match> {
  if (itemId === 'arrive-pitch') {
    return {
      pitchArrivalOverrideMinutes: minutesBefore(match.kickoffAt, newAt),
    };
  }

  if (itemId === 'arrive-airport') {
    const firstDeparture = getFirstFlightDeparture(match);
    if (!firstDeparture) return {};

    return {
      airportArrivalOverrideMinutes: minutesBefore(firstDeparture, newAt),
    };
  }

  const customItem = match.customItinerary?.find((item) => item.id === itemId);
  if (customItem) {
    return {
      customItinerary: (match.customItinerary ?? []).map((item) =>
        item.id === itemId ? { ...item, at: newAt } : item,
      ),
    };
  }

  return {};
}
