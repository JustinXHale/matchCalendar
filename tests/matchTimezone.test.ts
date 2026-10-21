import assert from 'node:assert/strict';
import {
  dateKeyInTimezone,
  formatTimezoneShort,
  utcToZonedWall,
  zonedWallToUtc,
} from '../src/domain/matchTimezone';

const summerKickoff = zonedWallToUtc(
  '2026-07-18',
  '19:00',
  'America/New_York',
);
assert.equal(summerKickoff.toISOString(), '2026-07-18T23:00:00.000Z');
assert.deepEqual(utcToZonedWall(summerKickoff, 'America/New_York'), {
  date: '2026-07-18',
  time: '19:00',
});
assert.deepEqual(utcToZonedWall(summerKickoff, 'America/Chicago'), {
  date: '2026-07-18',
  time: '18:00',
});

const winterKickoff = zonedWallToUtc(
  '2026-12-12',
  '19:00',
  'America/New_York',
);
assert.equal(winterKickoff.toISOString(), '2026-12-13T00:00:00.000Z');
assert.ok(['ET', 'EST', 'EDT'].includes(
  formatTimezoneShort('America/New_York', summerKickoff),
));

const afterMidnightUtc = new Date('2026-07-19T00:30:00.000Z');
assert.equal(
  dateKeyInTimezone(afterMidnightUtc, 'America/New_York'),
  '2026-07-18',
);
