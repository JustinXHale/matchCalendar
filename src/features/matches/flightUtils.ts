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
