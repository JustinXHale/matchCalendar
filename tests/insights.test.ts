import { createInsightsDemoData } from '../src/demo/insightsDemoData';
import assert from 'node:assert/strict';
import type { Match, Expense } from '../src/domain/match';
import type { Tournament } from '../src/domain/tournament';
import { buildMatchFromForm, createEmptyMatchForm } from '../src/features/matches/matchFormUtils';
import {
  filterInsightsData,
  formatInsightsRangeLabel,
  isValidInsightsDateRange,
} from '../src/features/insights/insightsRange';
import { getInsightsSummary } from '../src/features/insights/insightsSummary';

const now = new Date();
const expense = (id: string, category: Expense['category'], amount: number, reimbursedAmount = 0): Expense => ({
  id, category, amount, reimbursementStatus: reimbursedAmount ? 'reimbursed' : 'not_expected', reimbursedAmount, createdAt: now,
});
const match: Match = {
  ...buildMatchFromForm(createEmptyMatchForm()), id: 'match', createdAt: now, updatedAt: now,
  payStatus: 'paid', paidAmount: 200, competition: 'NCR',
  expenses: [expense('parking', 'parking', 80), expense('food', 'food', 60, 40), expense('flight', 'airfare', 500, 500),
    { ...expense('drive', 'miles_driven', 0), miles: 120 }, { ...expense('fly', 'miles_flown', 0), miles: 850 }],
};
const summary = getInsightsSummary([match], []);
assert.equal(summary.eventCount, 1);
assert.equal(summary.milesDriven, 120);
assert.equal(summary.drivenTrips, 1);
assert.equal(summary.milesFlown, 850);
assert.deepEqual(summary.topExpenses.map((row) => [row.label, row.outOfPocket]), [['Parking', 80], ['Food', 20]]);
assert.equal(summary.paid, 740);
assert.equal(summary.expenses, 640);
assert.equal(summary.net, 100);
assert.deepEqual(summary.organizations, [{ organization: 'NCR', income: 740, expenses: 640, net: 100 }]);

const parent: Tournament = {
  id: 'tournament', ownerUid: 'local', title: 'Cup', startDate: '2026-09-13', endDate: '2026-09-14', createdAt: now, updatedAt: now,
  matchDefaults: { competition: 'NCR' }, settlement: { payStatus: 'paid', paidAmount: 100 },
  expenses: [expense('hotel', 'lodging', 50)],
};
const child = { ...match, tournamentId: parent.id, competition: '', expenses: [] };
const tournamentSummary = getInsightsSummary([child], [parent]);
assert.equal(tournamentSummary.eventCount, 1);
assert.deepEqual(tournamentSummary.eventTypes, [{ label: 'Tournament', count: 1 }]);
assert.equal(tournamentSummary.positions.reduce((sum, row) => sum + row.count, 0), 1);
assert.equal(tournamentSummary.paid, 300);
assert.equal(tournamentSummary.expenses, 50);
assert.equal(tournamentSummary.organizations.length, 1);
assert.equal(tournamentSummary.organizations[0].net, 250);

const cancelled = getInsightsSummary([{ ...match, status: 'cancelled' }], []);
assert.equal(cancelled.eventCount, 0);
assert.equal(cancelled.positions.length, 0);
assert.equal(cancelled.expenses, 640); // Costs already incurred are still real.
assert.equal(getInsightsSummary([{ ...match, competition: '', payOwedBy: 'Union' }], []).organizations[0].organization, 'Union');
assert.equal(getInsightsSummary([{ ...match, competition: '', payOwedBy: undefined }], []).organizations[0].organization, 'Unassigned');
const empty = getInsightsSummary([], []);
assert.equal(empty.eventCount, 0);
assert.equal(empty.net, 0);
assert.equal(empty.flightSegments, 0);
assert.equal(empty.drivenTrips, 0);
assert.deepEqual(empty.topExpenses, []);
console.log('Insights ranking, mileage, organization, and tournament aggregation checks passed.');

const sample = createInsightsDemoData();
const sampleSummary = getInsightsSummary(sample.matches, sample.tournaments);
assert.equal(sampleSummary.eventCount, 52);
assert.equal(sampleSummary.organizations.length, 6);
assert.equal(sampleSummary.eventTypes.length, 5);
assert.equal(sampleSummary.positions.length, 5);
assert.equal(sampleSummary.topExpenses.length, 5);
assert.equal(sampleSummary.topExpenses[0].category, 'parking');
assert.ok(sampleSummary.milesDriven > 0 && sampleSummary.milesFlown > 0);
assert.ok(sampleSummary.flightSegments > 0);
assert.ok(sampleSummary.flightMinutes > 0);
assert.ok(sampleSummary.drivenTrips > 0);
assert.equal(new Set(sample.matches.map((match) => match.id)).size, sample.matches.length);

const springMatch: Match = {
  ...match,
  id: 'spring',
  kickoffAt: new Date(2026, 2, 15, 14),
};
const summerMatch: Match = {
  ...match,
  id: 'summer',
  kickoffAt: new Date(2026, 6, 10, 14),
};
const springTournament: Tournament = {
  ...parent,
  id: 'spring-cup',
  startDate: '2026-03-14',
  endDate: '2026-03-15',
};
const springChild = { ...child, id: 'spring-child', tournamentId: springTournament.id, kickoffAt: new Date(2026, 2, 14, 9) };

assert.equal(isValidInsightsDateRange({ startDate: '2026-03-01', endDate: '2026-05-31' }), true);
assert.equal(isValidInsightsDateRange({ startDate: '2026-06-01', endDate: '2026-05-31' }), false);
assert.equal(formatInsightsRangeLabel({}), 'All time');
assert.equal(
  formatInsightsRangeLabel({ startDate: '2026-03-01', endDate: '2026-05-31' }).includes('2026'),
  true,
);

const season = filterInsightsData(
  [springMatch, summerMatch, springChild],
  [springTournament],
  { startDate: '2026-03-01', endDate: '2026-05-31' },
);
assert.deepEqual(season.matches.map((item) => item.id).sort(), ['spring', 'spring-child']);
assert.deepEqual(season.tournaments.map((item) => item.id), ['spring-cup']);

const springSummary = getInsightsSummary(season.matches, season.tournaments);
assert.equal(springSummary.eventCount, 2);
assert.ok(springSummary.paid > 0);
assert.equal(springSummary.organizations.length, 1);
