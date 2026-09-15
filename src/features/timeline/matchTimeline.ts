import type { Match } from '@/domain/match';
import type { LocalProfile } from '@/features/profile/localProfile';
import { getFlightSegments, hasFlightSegmentData } from '@/features/matches/flightUtils';

export type TimelineItemKind = 'factual' | 'derived' | 'custom';

export type TimelineItem = {
  id: string;
  kind: TimelineItemKind;
  at: Date;
  label: string;
  detail?: string;
};

export function hasFlightData(match: Match): boolean {
  return Boolean(
    match.flight?.segments?.some(hasFlightSegmentData) ||
      match.flight?.notes ||
      match.flight?.selfPaid,
  );
}

export function hasLodgingData(match: Match): boolean {
  return Boolean(
    match.lodging?.checkInDate ||
      match.lodging?.checkOutDate ||
      match.lodging?.propertyName,
  );
}

export function hasGroundData(match: Match): boolean {
  return Boolean(
    match.groundTravel?.pickupAt ||
      match.groundTravel?.returnAt ||
      match.groundTravel?.provider,
  );
}

export function hasMeaningfulTimeline(match: Match): boolean {
  return (
    hasFlightData(match) ||
    hasLodgingData(match) ||
    hasGroundData(match) ||
    (match.customItinerary?.length ?? 0) > 0
  );
}

function dateFromYmd(date: string, hours = 12, minutes = 0): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function buildMatchTimeline(
  match: Match,
  profile: Pick<
    LocalProfile,
    'pitchArrivalMinutesBeforeKickoff' | 'airportArrivalMinutesBeforeFlight'
  >,
): TimelineItem[] {
  const items: TimelineItem[] = [];

  const firstDeparture = getFlightSegments(match.flight)
    .map((segment) => segment.departureAt)
    .filter((value): value is Date => value instanceof Date)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const airportArrivalMinutes =
    match.airportArrivalOverrideMinutes ??
    profile.airportArrivalMinutesBeforeFlight;

  if (firstDeparture && airportArrivalMinutes > 0) {
    items.push({
      id: 'arrive-airport',
      kind: 'derived',
      at: new Date(firstDeparture.getTime() - airportArrivalMinutes * 60_000),
      label: 'Arrive at airport',
      detail: `${airportArrivalMinutes} min before first flight`,
    });
  }

  for (const segment of getFlightSegments(match.flight)) {
    if (!hasFlightSegmentData(segment)) continue;

    if (segment.departureAt) {
      items.push({
        id: `flight-departure-${segment.id}`,
        kind: 'factual',
        at: segment.departureAt,
        label: 'Flight departure',
        detail: [segment.departureAirport, segment.airline, segment.flightNumber].filter(Boolean).join(' '),
      });
    }

    if (segment.arrivalAt) {
      items.push({
        id: `flight-arrival-${segment.id}`,
        kind: 'factual',
        at: segment.arrivalAt,
        label: 'Flight arrival',
        detail: [segment.arrivalAirport, segment.confirmation].filter(Boolean).join(' · '),
      });
    }
  }

  if (match.groundTravel?.pickupAt) {
    items.push({
      id: 'ground-pickup',
      kind: 'factual',
      at: match.groundTravel.pickupAt,
      label: 'Rental pickup',
      detail: match.groundTravel.provider,
    });
  }

  if (match.lodging?.checkInDate) {
    items.push({
      id: 'lodging-check-in',
      kind: 'factual',
      at: dateFromYmd(match.lodging.checkInDate, 15),
      label: 'Hotel check-in',
      detail: match.lodging.propertyName,
    });
  }

  const arrivalMinutes =
    match.pitchArrivalOverrideMinutes ??
    profile.pitchArrivalMinutesBeforeKickoff;

  if (arrivalMinutes > 0) {
    items.push({
      id: 'arrive-pitch',
      kind: 'derived',
      at: new Date(match.kickoffAt.getTime() - arrivalMinutes * 60_000),
      label: 'Arrive at pitch',
      detail: `${arrivalMinutes} min before kickoff`,
    });
  }

  items.push({
    id: 'kickoff',
    kind: 'factual',
    at: match.kickoffAt,
    label: 'Match kickoff',
    detail: match.location,
  });

  if (match.lodging?.checkOutDate) {
    items.push({
      id: 'lodging-check-out',
      kind: 'factual',
      at: dateFromYmd(match.lodging.checkOutDate, 11),
      label: 'Hotel check-out',
      detail: match.lodging.propertyName,
    });
  }

  if (match.groundTravel?.returnAt) {
    items.push({
      id: 'ground-return',
      kind: 'factual',
      at: match.groundTravel.returnAt,
      label: 'Rental return',
      detail: match.groundTravel.provider,
    });
  }

  for (const custom of match.customItinerary ?? []) {
    if (!(custom.at instanceof Date) || Number.isNaN(custom.at.getTime())) continue;
    items.push({
      id: custom.id,
      kind: 'custom',
      at: custom.at,
      label: custom.label,
      detail: custom.notes,
    });
  }

  return items.sort((a, b) => a.at.getTime() - b.at.getTime());
}

export function matchHasTravelIndicators(match: Match): boolean {
  return hasMeaningfulTimeline(match);
}
