import type { FlightInfo, FlightSegment } from '@/domain/match';
import {
  getFlightSegments,
  hasFlightSegmentData,
} from '@/features/matches/flightUtils';

export const DRIVING_SPEED_MPH = 65;

export function formatTravelDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0m';

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function drivingMinutesFromMiles(miles: number): number {
  if (!Number.isFinite(miles) || miles <= 0) return 0;
  return Math.round((miles / DRIVING_SPEED_MPH) * 60);
}

export function getSegmentFlightMinutes(segment: FlightSegment): number | null {
  if (!segment.departureAt || !segment.arrivalAt) return null;

  const minutes = Math.round(
    (segment.arrivalAt.getTime() - segment.departureAt.getTime()) / 60_000,
  );
  return minutes > 0 ? minutes : null;
}

export function getTotalFlightMinutes(flight?: FlightInfo): number | null {
  if (!flight) return null;

  let total = 0;
  let hasLeg = false;

  for (const segment of getFlightSegments(flight)) {
    if (!hasFlightSegmentData(segment)) continue;
    const minutes = getSegmentFlightMinutes(segment);
    if (minutes == null) continue;
    total += minutes;
    hasLeg = true;
  }

  return hasLeg ? total : null;
}
