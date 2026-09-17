import assert from 'node:assert/strict';
import type { FlightInfo } from '../src/domain/match';
import {
  distanceBetweenAirports,
  flightExpandCardTitle,
  formatFlightMiles,
  getTotalFlightMiles,
  normalizeAirportCode,
} from '../src/features/matches/flightDistance';
import { buildMatchFromForm, createEmptyMatchForm } from '../src/features/matches/matchFormUtils';
import { getInsightsSummary } from '../src/features/insights/insightsSummary';

assert.equal(normalizeAirportCode(' san '), 'SAN');
assert.equal(normalizeAirportCode('SAN - San Diego'), 'SAN');
assert.equal(normalizeAirportCode(''), null);
assert.equal(normalizeAirportCode('San Diego International'), null);

const sanToLax = distanceBetweenAirports('SAN', 'LAX');
assert.ok(sanToLax != null && sanToLax >= 95 && sanToLax <= 120);

const unknown = distanceBetweenAirports('SAN', 'ZZZ');
assert.equal(unknown, null);

const flight: FlightInfo = {
  segments: [
    {
      id: 'out',
      departureAirport: 'MCO',
      arrivalAirport: 'TPA',
    },
    {
      id: 'back',
      departureAirport: 'TPA',
      arrivalAirport: 'MCO',
    },
  ],
};

const total = getTotalFlightMiles(flight);
assert.ok(total != null && total >= 150 && total <= 220);

const partialFlight: FlightInfo = {
  segments: [
    { id: 'known', departureAirport: 'SAN', arrivalAirport: 'LAX' },
    { id: 'unknown', departureAirport: 'ZZZ', arrivalAirport: 'SAN' },
  ],
};
assert.equal(getTotalFlightMiles(partialFlight), sanToLax);

assert.equal(getTotalFlightMiles(undefined), null);
assert.equal(formatFlightMiles(1001), '1,001 mi');
assert.equal(flightExpandCardTitle(flight), `Flight (${formatFlightMiles(total!)})`);
assert.equal(flightExpandCardTitle({ segments: [{ id: 'x', departureAirport: 'ZZZ' }] }), 'Flight');

const now = new Date();
const match = {
  ...buildMatchFromForm(createEmptyMatchForm()),
  id: 'flight-insights',
  createdAt: now,
  updatedAt: now,
  kickoffAt: now,
  flight,
};
const summary = getInsightsSummary([match], []);
assert.ok(summary.milesFlown >= 150);
assert.equal(summary.flightSegments, 2);

console.log('Flight distance normalization, haversine, and insights checks passed.');
