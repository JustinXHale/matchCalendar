import assert from 'node:assert/strict';
import type { FlightInfo } from '../src/domain/match';
import {
  drivingMinutesFromMiles,
  formatTravelDuration,
  getTotalFlightMinutes,
} from '../src/features/matches/travelDuration';
import { getInsightsSummary } from '../src/features/insights/insightsSummary';
import { buildMatchFromForm, createEmptyMatchForm } from '../src/features/matches/matchFormUtils';

assert.equal(formatTravelDuration(45), '45m');
assert.equal(formatTravelDuration(120), '2h');
assert.equal(formatTravelDuration(150), '2h 30m');

assert.equal(drivingMinutesFromMiles(65), 60);
assert.equal(drivingMinutesFromMiles(130), 120);

const departure = new Date(2026, 8, 5, 9, 0);
const arrival = new Date(2026, 8, 5, 11, 30);
const flight: FlightInfo = {
  segments: [
    {
      id: 'leg',
      departureAirport: 'DEN',
      arrivalAirport: 'IAH',
      departureAt: departure,
      arrivalAt: arrival,
    },
  ],
};
assert.equal(getTotalFlightMinutes(flight), 150);

const now = new Date();
const match = {
  ...buildMatchFromForm(createEmptyMatchForm()),
  id: 'duration',
  createdAt: now,
  updatedAt: now,
  kickoffAt: now,
  expenses: [{ ...{
    id: 'drive',
    category: 'miles_driven' as const,
    amount: 0,
    reimbursementStatus: 'not_expected' as const,
    createdAt: now,
  }, miles: 130 }],
  flight,
};
const summary = getInsightsSummary([match], []);
assert.equal(summary.flightMinutes, 150);
assert.equal(drivingMinutesFromMiles(summary.milesDriven), 120);

console.log('Travel duration formatting, flight minutes, and insights checks passed.');
