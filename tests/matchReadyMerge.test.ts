import assert from 'node:assert/strict';
import {
  mergeMatchReadyImports,
  planMatchReadyImportCleanup,
} from '../src/features/matches/matchReadyMerge';
import type { Match } from '../src/domain/match';
import type { MatchReadyAssignmentDto } from '../src/services/matchReadyTypes';

const syncedAt = new Date('2026-09-15T12:00:00.000Z');

const dto: MatchReadyAssignmentDto = {
  externalId: 'lonestar:match-1',
  orgId: 'lonestar',
  matchId: 'match-1',
  kickoffAt: '2026-10-15T19:00:00.000Z',
  timezone: 'America/Chicago',
  home: 'Austin Huns',
  away: 'Dallas RFC',
  location: 'Central Park, Austin, TX',
  position: 'Referee',
  positionPreset: 'referee',
  matchType: 'xvs',
  expectedPay: 100,
  payCurrency: 'USD',
  status: 'upcoming',
  matchReadyStatus: 'locked_confirmed',
};

const existing: Match = {
  id: 'local-1',
  ownerUid: 'user-1',
  kickoffAt: new Date('2026-10-15T19:00:00.000Z'),
  timezone: 'America/Chicago',
  home: 'Austin Huns',
  away: 'Dallas RFC',
  location: 'Central Park, Austin, TX',
  position: 'Referee',
  positionPreset: 'referee',
  matchType: 'xvs',
  status: 'upcoming',
  expectedPay: 100,
  payCurrency: 'USD',
  payStatus: 'paid',
  paidAmount: 100,
  notes: 'Bring whites',
  source: {
    type: 'matchreadytx',
    externalId: 'lonestar:match-1',
    importedAt: new Date('2026-09-01T00:00:00.000Z'),
  },
  createdAt: new Date('2026-09-01T00:00:00.000Z'),
  updatedAt: new Date('2026-09-01T00:00:00.000Z'),
};

const created = mergeMatchReadyImports([], [dto], 'user-1', syncedAt);
assert.equal(created.created, 1);
assert.equal(created.updated, 0);
assert.equal(created.toUpsert[0]?.payStatus, 'unpaid');

const refreshed = mergeMatchReadyImports(
  [existing],
  [{ ...dto, location: 'New Field, Austin, TX' }],
  'user-1',
  syncedAt,
);
assert.equal(refreshed.updated, 1);
assert.equal(refreshed.toUpsert[0]?.location, 'New Field, Austin, TX');
assert.equal(refreshed.toUpsert[0]?.notes, 'Bring whites');
assert.equal(refreshed.toUpsert[0]?.payStatus, 'paid');

const unchanged = mergeMatchReadyImports([existing], [dto], 'user-1', syncedAt);
assert.equal(unchanged.toUpsert.length, 0);

const cancelledImport: Match = {
  ...existing,
  id: 'cancelled-1',
  status: 'cancelled',
};
const cleanup = planMatchReadyImportCleanup(
  [existing, cancelledImport],
  [dto],
);
assert.ok(cleanup.includes('cancelled-1'));

const duplicate: Match = {
  ...existing,
  id: 'duplicate-1',
  source: { ...existing.source },
};
const dedupe = planMatchReadyImportCleanup([existing, duplicate], [dto]);
assert.equal(dedupe.length, 1);
assert.ok(dedupe.includes('duplicate-1') || dedupe.includes('local-1'));

const skipCancelledDto = mergeMatchReadyImports(
  [],
  [{ ...dto, externalId: 'lonestar:cancelled', status: 'cancelled' }],
  'user-1',
  syncedAt,
);
assert.equal(skipCancelledDto.created, 0);

console.log('MatchReady merge checks passed.');
