import type { FlightSegment } from '@/domain/match';

export type FlightLookupMovement = {
  airportCode?: string;
  airportName: string;
  scheduledUtc?: string;
  scheduledLocal?: string;
  revisedUtc?: string;
  revisedLocal?: string;
  timeZone?: string;
};

export type FlightLookupOption = {
  id: string;
  number: string;
  status: string;
  airline?: string;
  departure: FlightLookupMovement;
  arrival: FlightLookupMovement;
};

export const FLIGHT_IMPORT_RETENTION_MS = 6 * 24 * 60 * 60 * 1000;

function optionalDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Maps only available provider values so an incomplete result cannot erase manual data. */
export function flightLookupToSegmentPatch(
  flight: FlightLookupOption,
  lookup: { flightNumber: string; departureDate: string; importedAt?: Date },
): Partial<FlightSegment> {
  const departureAt = optionalDate(flight.departure.scheduledUtc);
  const arrivalAt = optionalDate(flight.arrival.scheduledUtc);
  const importedAt = lookup.importedAt ?? new Date();

  return {
    ...(flight.airline ? { airline: flight.airline } : {}),
    ...(flight.number ? { flightNumber: flight.number } : {}),
    flightLookupDepartureDate: lookup.departureDate,
    ...(flight.departure.airportCode || flight.departure.airportName
      ? { departureAirport: flight.departure.airportCode || flight.departure.airportName }
      : {}),
    ...(flight.arrival.airportCode || flight.arrival.airportName
      ? { arrivalAirport: flight.arrival.airportCode || flight.arrival.airportName }
      : {}),
    ...(departureAt ? { departureAt } : {}),
    ...(arrivalAt ? { arrivalAt } : {}),
    providerImport: {
      provider: 'aerodatabox',
      lookupFlightNumber: lookup.flightNumber,
      importedAt,
      expiresAt: new Date(importedAt.getTime() + FLIGHT_IMPORT_RETENTION_MS),
    },
  };
}

export function hasAeroDataBoxImport(segment: FlightSegment): boolean {
  return segment.providerImport?.provider === 'aerodatabox';
}
