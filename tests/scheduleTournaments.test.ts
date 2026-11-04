import assert from 'node:assert/strict';
import type { Match } from '../src/domain/match';
import type { Tournament } from '../src/domain/tournament';
import { buildMatchFromForm, createEmptyMatchForm } from '../src/features/matches/matchFormUtils';
import { isHistoryMatch, isUpcomingMatch } from '../src/features/matches/matchQueries';
import {
  isTournamentSchedulePlaceholder,
  removeTournamentSchedulePlaceholders,
  withStandaloneTournamentPlaceholders,
} from '../src/features/schedule/tournamentSchedulePlaceholders';
import {
  calendarSettingsToFirestore,
  DEFAULT_CALENDAR_SETTINGS,
} from '../src/features/profile/calendarSettings';

const now = new Date(2026, 10, 4, 12);
const tournament: Tournament = {
  id: 'empty-tournament',
  ownerUid: 'owner',
  title: 'Empty Tournament',
  startDate: '2026-11-04',
  endDate: '2026-11-06',
  createdAt: now,
  updatedAt: now,
};

const schedule = withStandaloneTournamentPlaceholders([], [tournament]);
assert.equal(schedule.length, 1);
assert.equal(isTournamentSchedulePlaceholder(schedule[0]), true);
assert.equal(schedule[0].tournamentId, tournament.id);
assert.equal(isUpcomingMatch(schedule[0], new Date(2026, 10, 5, 12)), true);
assert.equal(isHistoryMatch(schedule[0], new Date(2026, 10, 7)), true);
assert.deepEqual(removeTournamentSchedulePlaceholders(schedule), []);

const child: Match = {
  ...buildMatchFromForm(createEmptyMatchForm()),
  id: 'child',
  ownerUid: 'owner',
  tournamentId: tournament.id,
  kickoffAt: new Date(2026, 10, 5, 9),
  createdAt: now,
  updatedAt: now,
};
assert.deepEqual(
  withStandaloneTournamentPlaceholders([child], [tournament]),
  [child],
);

const serializedSettings = calendarSettingsToFirestore({
  ...DEFAULT_CALENDAR_SETTINGS,
  homeTimezone: undefined,
  migratedFromLocalAt: undefined,
});
assert.equal('homeTimezone' in serializedSettings, false);
assert.equal('migratedFromLocalAt' in serializedSettings, false);
assert.equal(serializedSettings.matchReadySyncEnabled, true);

console.log('Standalone tournament scheduling and settings serialization checks passed.');
