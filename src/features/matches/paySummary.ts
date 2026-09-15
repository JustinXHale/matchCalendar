import type { Expense, ExpenseCategory, Match } from '@/domain/match';
import { formatExpenseCategory } from '@/domain/expenseCategories';
import {
  getTravelCostEntries,
  sumTravelExpenseAmount,
  travelCostAlreadyInExpenses,
  travelExpenseCategory,
} from '@/features/matches/travelFinance';

export type PaySummary = {
  matchCount: number;
  expectedTotal: number;
  paidTotal: number;
  unpaidExpectedTotal: number;
  expenseTotal: number;
  travelExpenseTotal: number;
  reimbursedTotal: number;
  outOfPocketTotal: number;
  netExpected: number;
  netPaid: number;
  netOutOfPocket: number;
};

export type CategoryRollupRow = {
  category: ExpenseCategory;
  label: string;
  amount: number;
  outOfPocket: number;
};

export type PositionRollupRow = {
  position: string;
  matchCount: number;
  expectedTotal: number;
  paidTotal: number;
  unpaidExpectedTotal: number;
  donatedCount: number;
  outOfPocketTotal: number;
};

export type UnpaidOwedRow = {
  owedBy: string;
  amount: number;
  matchCount: number;
};

const CATEGORY_DISPLAY_ORDER: ExpenseCategory[] = [
  'airfare',
  'lodging',
  'rental_car',
  'gas',
  'food',
  'rideshare',
  'parking',
  'tolls',
  'other',
];

export type MatchFinanceTotals = {
  expenseLineTotal: number;
  travelSelfPaidTotal: number;
  travelNotDuplicatedInExpenses: number;
  combinedExpenseTotal: number;
  reimbursedTotal: number;
  outOfPocketTotal: number;
};

export function sumExpenses(match: Match): number {
  return (match.expenses ?? []).reduce((total, expense) => total + expense.amount, 0);
}

export function sumReimbursed(expense: Expense): number {
  if (expense.reimbursementStatus !== 'reimbursed') return 0;
  return expense.reimbursedAmount ?? expense.amount;
}

export function expenseOutOfPocket(expense: Expense): number {
  return expense.amount - sumReimbursed(expense);
}

export function getMatchFinanceTotals(match: Match): MatchFinanceTotals {
  const expenseLineTotal = sumExpenses(match);
  const expenses = match.expenses ?? [];
  const travelEntries = getTravelCostEntries(match);
  const travelSelfPaidTotal = sumTravelExpenseAmount(match);
  const travelNotDuplicatedInExpenses = travelEntries
    .filter((entry) => !travelCostAlreadyInExpenses(entry, expenses))
    .reduce((total, entry) => total + entry.amount, 0);

  let reimbursedTotal = 0;
  for (const expense of expenses) {
    reimbursedTotal += sumReimbursed(expense);
  }
  reimbursedTotal += travelEntries
    .filter((entry) => !travelCostAlreadyInExpenses(entry, expenses))
    .reduce((total, entry) => total + (entry.amount - entry.outOfPocket), 0);

  const expenseOutOfPocketTotal = expenses.reduce(
    (total, expense) => total + expenseOutOfPocket(expense),
    0,
  );
  const travelOutOfPocketNotDuplicated = travelEntries
    .filter((entry) => !travelCostAlreadyInExpenses(entry, expenses))
    .reduce((total, entry) => total + entry.outOfPocket, 0);

  const combinedExpenseTotal = expenseLineTotal + travelNotDuplicatedInExpenses;
  const outOfPocketTotal = expenseOutOfPocketTotal + travelOutOfPocketNotDuplicated;

  return {
    expenseLineTotal,
    travelSelfPaidTotal,
    travelNotDuplicatedInExpenses,
    combinedExpenseTotal,
    reimbursedTotal,
    outOfPocketTotal,
  };
}

export function getPositionRollup(matches: Match[]): PositionRollupRow[] {
  const totals = new Map<
    string,
    {
      matchCount: number;
      expectedTotal: number;
      paidTotal: number;
      unpaidExpectedTotal: number;
      donatedCount: number;
      outOfPocketTotal: number;
    }
  >();

  for (const match of matches) {
    const position = match.position.trim() || 'Unspecified';
    const current = totals.get(position) ?? {
      matchCount: 0,
      expectedTotal: 0,
      paidTotal: 0,
      unpaidExpectedTotal: 0,
      donatedCount: 0,
      outOfPocketTotal: 0,
    };

    current.matchCount += 1;
    if (match.expectedPay != null && match.payStatus !== 'donated') {
      current.expectedTotal += match.expectedPay;
    }
    if (match.payStatus === 'unpaid' && match.expectedPay != null) {
      current.unpaidExpectedTotal += match.expectedPay;
    }
    if (match.paidAmount != null) current.paidTotal += match.paidAmount;
    if (match.payStatus === 'donated') current.donatedCount += 1;
    current.outOfPocketTotal += getMatchFinanceTotals(match).outOfPocketTotal;

    totals.set(position, current);
  }

  return [...totals.entries()]
    .map(([position, values]) => ({ position, ...values }))
    .sort((a, b) => b.expectedTotal - a.expectedTotal);
}

export function getUnpaidOwedRollup(matches: Match[]): UnpaidOwedRow[] {
  const totals = new Map<string, { amount: number; matchCount: number }>();

  for (const match of matches) {
    if (match.payStatus !== 'unpaid' || match.expectedPay == null) continue;

    const owedBy = match.payOwedBy?.trim() || 'Not specified';
    const current = totals.get(owedBy) ?? { amount: 0, matchCount: 0 };
    current.amount += match.expectedPay;
    current.matchCount += 1;
    totals.set(owedBy, current);
  }

  return [...totals.entries()]
    .map(([owedBy, values]) => ({ owedBy, ...values }))
    .sort((a, b) => b.amount - a.amount);
}

export function getCategoryRollup(matches: Match[]): CategoryRollupRow[] {
  const totals = new Map<ExpenseCategory, { amount: number; outOfPocket: number }>();

  for (const match of matches) {
    const expenses = match.expenses ?? [];

    for (const expense of expenses) {
      const current = totals.get(expense.category) ?? { amount: 0, outOfPocket: 0 };
      current.amount += expense.amount;
      current.outOfPocket += expenseOutOfPocket(expense);
      totals.set(expense.category, current);
    }

    for (const entry of getTravelCostEntries(match)) {
      if (travelCostAlreadyInExpenses(entry, expenses)) continue;

      const category = travelExpenseCategory(entry.source);
      const current = totals.get(category) ?? { amount: 0, outOfPocket: 0 };
      current.amount += entry.amount;
      current.outOfPocket += entry.outOfPocket;
      totals.set(category, current);
    }
  }

  return CATEGORY_DISPLAY_ORDER
    .map((category) => {
      const values = totals.get(category);
      if (!values || values.amount <= 0) return null;

      return {
        category,
        label: formatExpenseCategory(category),
        amount: values.amount,
        outOfPocket: values.outOfPocket,
      };
    })
    .filter((row): row is CategoryRollupRow => row != null);
}

export function getPaySummary(matches: Match[]): PaySummary {
  let expectedTotal = 0;
  let paidTotal = 0;
  let unpaidExpectedTotal = 0;
  let expenseTotal = 0;
  let travelExpenseTotal = 0;
  let reimbursedTotal = 0;
  let outOfPocketTotal = 0;

  for (const match of matches) {
    if (match.expectedPay != null && match.payStatus !== 'donated') {
      expectedTotal += match.expectedPay;
    }
    if (match.payStatus === 'unpaid' && match.expectedPay != null) {
      unpaidExpectedTotal += match.expectedPay;
    }
    if (match.paidAmount != null) paidTotal += match.paidAmount;

    const finance = getMatchFinanceTotals(match);
    expenseTotal += finance.expenseLineTotal;
    travelExpenseTotal += finance.travelNotDuplicatedInExpenses;
    reimbursedTotal += finance.reimbursedTotal;
    outOfPocketTotal += finance.outOfPocketTotal;
  }

  const combinedExpenses = expenseTotal + travelExpenseTotal;

  return {
    matchCount: matches.length,
    expectedTotal,
    paidTotal,
    unpaidExpectedTotal,
    expenseTotal: combinedExpenses,
    travelExpenseTotal,
    reimbursedTotal,
    outOfPocketTotal,
    netExpected: expectedTotal - combinedExpenses,
    netPaid: paidTotal - combinedExpenses,
    netOutOfPocket: paidTotal - outOfPocketTotal,
  };
}

/** Total received includes the match fee and reimbursements, each counted once. */
export function getSettlementPaidTotal(match: Match): number {
  const fee = match.payStatus === 'paid' ? match.paidAmount ?? match.expectedPay ?? 0 : 0;
  return fee + getMatchFinanceTotals(match).reimbursedTotal;
}
