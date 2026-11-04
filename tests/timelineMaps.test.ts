import assert from 'node:assert/strict';
import { buildMatchFromForm, createEmptyMatchForm } from '../src/features/matches/matchFormUtils';
import { buildMatchTimeline } from '../src/features/timeline/matchTimeline';
import { directionsUrl } from '../src/utils/maps';

const baseMatch = buildMatchFromForm({
  ...createEmptyMatchForm(),
  location: '1 Stadium Way, Austin, TX',
  date: '2026-10-17',
  time: '15:00',
});
const match = {
  ...baseMatch,
  lodging: {
    propertyName: 'Example Hotel',
    address: '100 Main St, Austin, TX',
    checkInDate: '2026-10-16',
    checkOutDate: '2026-10-18',
  },
};

const items = buildMatchTimeline(match, {
  pitchArrivalMinutesBeforeKickoff: 60,
  airportArrivalMinutesBeforeFlight: 120,
});

assert.deepEqual(items.find((item) => item.id === 'lodging-check-in')?.mapLocation, {
  label: '100 Main St, Austin, TX',
  query: 'Example Hotel, 100 Main St, Austin, TX',
});
assert.equal(items.find((item) => item.id === 'lodging-check-in')?.precision, 'date');
assert.equal(items.find((item) => item.id === 'lodging-check-in')?.dateKey, '2026-10-16');
assert.equal(items.find((item) => item.id === 'lodging-check-out')?.precision, 'date');
assert.equal(
  items.find((item) => item.id === 'arrive-pitch')?.mapLocation?.query,
  '1 Stadium Way, Austin, TX',
);
assert.equal(
  items.find((item) => item.id === 'kickoff')?.mapLocation?.query,
  '1 Stadium Way, Austin, TX',
);
assert.equal(
  directionsUrl('100 Main St, Austin, TX'),
  'https://www.google.com/maps/dir/?api=1&destination=100%20Main%20St%2C%20Austin%2C%20TX',
);

console.log('Timeline map-link checks passed.');

const roundTrip = {
  ...baseMatch,
  flight: {
    segments: [
      {
        id: 'outbound-1',
        departureAirport: 'SAT',
        arrivalAirport: 'IAH',
        departureAt: new Date(2026, 10, 12, 16, 19),
        arrivalAt: new Date(2026, 10, 12, 17, 25),
      },
      {
        id: 'outbound-2',
        departureAirport: 'IAH',
        arrivalAirport: 'SGF',
        departureAt: new Date(2026, 10, 12, 20),
        arrivalAt: new Date(2026, 10, 12, 21, 48),
      },
      {
        id: 'return-1',
        departureAirport: 'SGF',
        arrivalAirport: 'IAH',
        departureAt: new Date(2026, 10, 15, 16, 56),
        arrivalAt: new Date(2026, 10, 15, 19),
      },
      {
        id: 'return-2',
        departureAirport: 'IAH',
        arrivalAirport: 'SAT',
        departureAt: new Date(2026, 10, 15, 21, 45),
        arrivalAt: new Date(2026, 10, 15, 22, 51),
      },
    ],
  },
};
const roundTripItems = buildMatchTimeline(roundTrip, {
  pitchArrivalMinutesBeforeKickoff: 60,
  airportArrivalMinutesBeforeFlight: 60,
});
const airportArrivals = roundTripItems.filter(
  (item) => item.label === 'Arrive at airport',
);
assert.equal(airportArrivals.length, 2);
assert.equal(airportArrivals[0].at.getTime(), new Date(2026, 10, 12, 15, 19).getTime());
assert.equal(airportArrivals[1].at.getTime(), new Date(2026, 10, 15, 15, 56).getTime());

console.log('Round-trip airport arrival checks passed.');
