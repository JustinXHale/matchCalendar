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
