import type { FlightInfo, FlightSegment } from '@/domain/match';
import airportRegistry from '@/features/matches/airportRegistry.json';
import { getFlightSegments } from '@/features/matches/flightUtils';

type AirportCoords = {
  lat: number;
  lon: number;
};

const EARTH_RADIUS_MILES = 3958.8;
const registry = airportRegistry as Record<string, AirportCoords>;

export function normalizeAirportCode(raw?: string): string | null {
  const trimmed = raw?.trim().toUpperCase();
  if (!trimmed) return null;

  if (/^[A-Z]{3}$/.test(trimmed)) {
    return trimmed;
  }

  const prefixMatch = trimmed.match(/^([A-Z]{3})(?:\s*[-–/]\s*.*)?$/);
  return prefixMatch?.[1] ?? null;
}

function lookupAirport(code: string): AirportCoords | null {
  return registry[code] ?? null;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function distanceBetweenAirports(
  departureCode: string,
  arrivalCode: string,
): number | null {
  const departure = lookupAirport(departureCode);
  const arrival = lookupAirport(arrivalCode);
  if (!departure || !arrival) return null;

  const dLat = toRadians(arrival.lat - departure.lat);
  const dLon = toRadians(arrival.lon - departure.lon);
  const lat1 = toRadians(departure.lat);
  const lat2 = toRadians(arrival.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_MILES * c);
}

export function getSegmentFlightMiles(segment: FlightSegment): number | null {
  const departureCode = normalizeAirportCode(segment.departureAirport);
  const arrivalCode = normalizeAirportCode(segment.arrivalAirport);
  if (!departureCode || !arrivalCode) return null;

  return distanceBetweenAirports(departureCode, arrivalCode);
}

export function getTotalFlightMiles(flight?: FlightInfo): number | null {
  if (!flight) return null;

  let total = 0;
  let hasLeg = false;

  for (const segment of getFlightSegments(flight)) {
    const miles = getSegmentFlightMiles(segment);
    if (miles == null) continue;
    total += miles;
    hasLeg = true;
  }

  return hasLeg ? total : null;
}

export function formatFlightMiles(miles: number): string {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(miles)} mi`;
}

export function flightExpandCardTitle(flight?: FlightInfo): string {
  const miles = getTotalFlightMiles(flight);
  return miles == null ? 'Flight' : `Flight (${formatFlightMiles(miles)})`;
}
