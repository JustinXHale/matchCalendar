import type { FlightInfo, FlightSegment } from '@/domain/match';

export function emptyFlightSegment(): FlightSegment {
  return { id: crypto.randomUUID() };
}

export function emptyFlight(): FlightInfo {
  return { segments: [emptyFlightSegment()] };
}

export function getFlightSegments(flight?: FlightInfo): FlightSegment[] {
  if (!flight?.segments?.length) {
    return [emptyFlightSegment()];
  }

  return flight.segments;
}

const MAX_CONNECTION_MS = 18 * 60 * 60 * 1000;

function normalizedAirport(value?: string): string | undefined {
  const normalized = value?.trim().toUpperCase();
  return normalized || undefined;
}

/**
 * Returns the departures where the traveler needs to enter an airport.
 * Same-airport connections within 18 hours remain part of one journey.
 */
export function getFlightJourneyStarts(flight?: FlightInfo): FlightSegment[] {
  const departures = getFlightSegments(flight)
    .filter((segment): segment is FlightSegment & { departureAt: Date } =>
      segment.departureAt instanceof Date &&
      !Number.isNaN(segment.departureAt.getTime()))
    .sort((a, b) => a.departureAt.getTime() - b.departureAt.getTime());

  return departures.filter((segment, index) => {
    if (index === 0) return true;

    const previous = departures[index - 1];
    if (!(previous.arrivalAt instanceof Date)) return true;

    const connectionMs = segment.departureAt.getTime() - previous.arrivalAt.getTime();
    const previousArrival = normalizedAirport(previous.arrivalAirport);
    const nextDeparture = normalizedAirport(segment.departureAirport);
    const sameAirport = !previousArrival || !nextDeparture ||
      previousArrival === nextDeparture;

    return connectionMs < 0 || connectionMs > MAX_CONNECTION_MS || !sameAirport;
  });
}

export function normalizeFlight(flight?: FlightInfo): FlightInfo {
  if (!flight) return emptyFlight();

  return {
    ...flight,
    segments: getFlightSegments(flight),
  };
}

export function hasFlightSegmentData(segment: FlightSegment): boolean {
  return Boolean(
    segment.airline ||
      segment.flightNumber ||
      segment.departureAirport ||
      segment.arrivalAirport ||
      segment.departureAt ||
      segment.arrivalAt ||
      segment.confirmation,
  );
}

export function countFlightSegments(flight?: FlightInfo): number {
  if (!flight) return 0;

  return getFlightSegments(flight).filter(hasFlightSegmentData).length;
}

export function hasFlightData(flight?: FlightInfo): boolean {
  if (!flight) return false;

  return Boolean(
    flight.segments?.some(hasFlightSegmentData) ||
      flight.notes ||
      flight.selfPaid ||
      flight.amountPaid ||
      flight.reimbursementStatus ||
      flight.reimbursedAmount ||
      flight.reimbursedAt,
  );
}

export function compactFlight(flight: FlightInfo): FlightInfo | undefined {
  if (!hasFlightData(flight)) return undefined;

  const segments = flight.segments?.filter(hasFlightSegmentData);

  return {
    ...flight,
    segments: segments?.length ? segments : undefined,
  };
}
