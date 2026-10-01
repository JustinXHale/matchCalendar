import assert from 'node:assert/strict';
import { flightLookupToSegmentPatch } from '../src/features/matches/flightImport';

const patch = flightLookupToSegmentPatch({
  id: 'DL1073-2026-10-02',
  number: 'DL1073',
  status: 'Expected',
  airline: 'Delta Air Lines',
  departure: {
    airportCode: 'SAT',
    airportName: 'San Antonio International Airport',
    scheduledUtc: '2026-10-02T10:30:00Z',
  },
  arrival: {
    airportCode: 'ATL',
    airportName: 'Hartsfield-Jackson Atlanta International Airport',
    scheduledUtc: '2026-10-02T12:53:00Z',
  },
}, {
  flightNumber: 'DL1073',
  departureDate: '2026-10-02',
  importedAt: new Date('2026-09-30T12:00:00Z'),
});

assert.equal(patch.airline, 'Delta Air Lines');
assert.equal(patch.flightNumber, 'DL1073');
assert.equal(patch.flightLookupDepartureDate, '2026-10-02');
assert.equal(patch.departureAirport, 'SAT');
assert.equal(patch.arrivalAirport, 'ATL');
assert.equal(patch.departureAt?.toISOString(), '2026-10-02T10:30:00.000Z');
assert.equal(patch.arrivalAt?.toISOString(), '2026-10-02T12:53:00.000Z');
assert.equal(patch.providerImport?.expiresAt.toISOString(), '2026-10-06T12:00:00.000Z');

const partial = flightLookupToSegmentPatch({
  id: 'partial',
  number: 'UA1',
  status: 'Unknown',
  departure: { airportName: 'Unknown origin' },
  arrival: { airportName: 'Unknown destination' },
}, {
  flightNumber: 'UA1',
  departureDate: '2026-10-02',
});
assert.equal(partial.departureAt, undefined);
assert.equal(partial.arrivalAt, undefined);

console.log('Flight import mapping checks passed.');
