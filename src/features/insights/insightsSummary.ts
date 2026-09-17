import type { Match } from '@/domain/match';
import type { Tournament } from '@/domain/tournament';
import { resolveMatchTypeLabel, resolvePositionLabel } from '@/domain/matchConstants';
import { getTotalFlightMiles } from '@/features/matches/flightDistance';
import { countFlightSegments } from '@/features/matches/flightUtils';
import { getTotalFlightMinutes } from '@/features/matches/travelDuration';
import { getCategoryRollup, getMatchFinanceTotals, getSettlementPaidTotal } from '@/features/matches/paySummary';
import { tournamentEvent } from '@/features/tournaments/tournamentEvent';

export type CountRow = { label: string; count: number };
export type OrganizationRow = {
  organization: string;
  income: number;
  expenses: number;
  net: number;
};

function eventHasMilesDriven(event: Match): boolean {
  return (event.expenses ?? []).some(
    (expense) =>
      expense.category === 'miles_driven' &&
      Number.isFinite(expense.miles) &&
      (expense.miles ?? 0) > 0,
  );
}

function counts(labels: string[]): CountRow[] {
  const result = new Map<string, number>();
  for (const label of labels) result.set(label, (result.get(label) ?? 0) + 1);
  return [...result].map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function getInsightsSummary(matches: Match[], tournaments: Tournament[]) {
  const parents = new Map(tournaments.map((tournament) => [tournament.id, tournament]));
  const parentEvents = tournaments.map(tournamentEvent);
  // Shared tournament costs are included once, on their parent event.
  const financialEvents = [...matches, ...parentEvents];
  const activeMatches = matches.filter((match) => match.status !== 'cancelled');
  const activeParents = parentEvents.filter((match) => match.status !== 'cancelled');
  const eventTypes = counts([
    ...activeMatches.filter((match) => !match.tournamentId || !parents.has(match.tournamentId))
      .map((match) => resolveMatchTypeLabel(match.matchType, match.customMatchType)),
    ...activeParents.map(() => 'Tournament'),
  ]);
  const positions = counts([
    ...activeMatches,
    ...activeParents.filter((parent) => !activeMatches.some((match) => match.tournamentId === parent.id)),
  ].map((match) => match.positionPreset
    ? resolvePositionLabel(match.positionPreset, match.customPosition)
    : match.position.trim() || 'Other'));

  let milesDriven = 0;
  let drivenTrips = 0;
  let milesFlown = 0;
  let flightSegments = 0;
  let flightMinutes = 0;
  let paid = 0;
  let expenses = 0;
  const organizations = new Map<string, OrganizationRow>();
  for (const event of financialEvents) {
    for (const expense of event.expenses ?? []) {
      const miles = expense.miles ?? 0;
      if (!Number.isFinite(miles) || miles < 0) continue;
      if (expense.category === 'miles_driven') milesDriven += miles;
      if (expense.category === 'miles_flown') milesFlown += miles;
    }
    if (eventHasMilesDriven(event)) drivenTrips += 1;
    milesFlown += getTotalFlightMiles(event.flight) ?? 0;
    flightSegments += countFlightSegments(event.flight);
    flightMinutes += getTotalFlightMinutes(event.flight) ?? 0;
    const income = getSettlementPaidTotal(event);
    const costs = getMatchFinanceTotals(event).combinedExpenseTotal;
    paid += income;
    expenses += costs;
    const parent = event.tournamentId ? parents.get(event.tournamentId) : undefined;
    const organization = event.competition?.trim() || parent?.matchDefaults?.competition?.trim()
      || event.payOwedBy?.trim() || parent?.matchDefaults?.payOwedBy?.trim() || 'Unassigned';
    const key = organization.toLocaleLowerCase();
    const row = organizations.get(key) ?? { organization, income: 0, expenses: 0, net: 0 };
    row.income += income;
    row.expenses += costs;
    row.net = row.income - row.expenses;
    organizations.set(key, row);
  }
  return {
    eventTypes,
    eventCount: eventTypes.reduce((sum, row) => sum + row.count, 0),
    positions,
    milesDriven,
    drivenTrips,
    milesFlown,
    flightSegments,
    flightMinutes,
    paid,
    expenses,
    net: paid - expenses,
    topExpenses: getCategoryRollup(financialEvents)
      .filter((row) => row.outOfPocket > 0)
      .sort((a, b) => b.outOfPocket - a.outOfPocket || a.label.localeCompare(b.label))
      .slice(0, 5),
    organizations: [...organizations.values()].sort((a, b) => b.net - a.net || a.organization.localeCompare(b.organization)),
  };
}

export type InsightsSummary = ReturnType<typeof getInsightsSummary>;
