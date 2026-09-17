import type { Expense, Match, PayStatus } from '@/domain/match';
import { formatExpenseCategory } from '@/domain/expenseCategories';
import { formatCurrency } from '@/domain/matchDisplay';
import { getTravelCostEntries, travelCostAlreadyInExpenses } from '@/features/matches/travelFinance';

export function needsMatchClosure(match: Match, now = new Date()): boolean {
  return match.status === 'upcoming' && match.kickoffAt < now;
}

export function isPayLineOpen(match: Match): boolean {
  if (match.payStatus === 'donated') return false;
  if (match.payStatus === 'paid') return false;
  if (match.payStatus === 'unpaid') return true;
  if (match.payStatus === 'not_tracked') return match.status !== 'cancelled' || match.expectedPay != null;
  return false;
}

export function countOpenSettlementItems(match: Match, now = new Date()): number {
  return getOpenSettlementLabels(match, now).length;
}

export function getPendingExpenseReimbursements(match: Match): Expense[] {
  return (match.expenses ?? []).filter(
    (expense) => expense.reimbursementStatus === 'pending',
  );
}

export function getOpenSettlementLabels(match: Match, now = new Date()): string[] {
  const labels: string[] = [];

  if (needsMatchClosure(match, now)) {
    labels.push('Match not marked complete');
  }
  if (isPayLineOpen(match)) {
    labels.push('Match fee not recorded');
  }

  for (const expense of getPendingExpenseReimbursements(match)) {
    labels.push(formatExpenseCategory(expense.category));
  }

  for (const entry of getTravelCostEntries(match)) {
    if (entry.reimbursementStatus === 'pending' && !travelCostAlreadyInExpenses(entry, match.expenses ?? [])) {
      labels.push(entry.label);
    }
  }

  return labels;
}

export function isSettlementFullyResolved(match: Match, now = new Date()): boolean {
  return getOpenSettlementLabels(match, now).length === 0;
}

export function needsSettlementAttention(match: Match, now = new Date()): boolean {
  return !isSettlementFullyResolved(match, now);
}

export function formatPayStatusSummary(match: Match): string {
  if (match.payStatus === 'paid' && match.paidAmount != null) {
    return `Paid ${formatCurrency(match.paidAmount, match.payCurrency)}`;
  }
  if (match.payStatus === 'unpaid') {
    return match.payOwedBy ? `Unpaid · ${match.payOwedBy}` : 'Unpaid';
  }
  if (match.payStatus === 'donated') return 'Donated / free';
  return 'Pay not recorded';
}

export function getSettlementSummaryLabel(match: Match, now = new Date()): string {
  if (needsSettlementAttention(match, now)) {
    const open = countOpenSettlementItems(match, now);
    return open > 0 ? `Finish settlement · ${open} open` : 'Finish settlement';
  }
  return `Settled · ${formatPayStatusSummary(match)}`;
}

export function markExpenseReimbursed(
  match: Match,
  expenseId: string,
): Partial<Match> {
  const expenses = match.expenses?.map((expense) => {
    if (expense.id !== expenseId) return expense;

    return {
      ...expense,
      reimbursementStatus: 'reimbursed' as const,
      reimbursedAmount: expense.reimbursedAmount ?? expense.amount,
      reimbursedAt: expense.reimbursedAt ?? new Date(),
    };
  });

  return expenses ? { expenses } : {};
}

export function markExpensePending(
  match: Match,
  expenseId: string,
): Partial<Match> {
  const expenses = match.expenses?.map((expense) => {
    if (expense.id !== expenseId) return expense;

    return {
      ...expense,
      reimbursementStatus: 'pending' as const,
      reimbursedAmount: undefined,
      reimbursedAt: undefined,
    };
  });

  return expenses ? { expenses } : {};
}

export function markExpenseNotExpected(
  match: Match,
  expenseId: string,
): Partial<Match> {
  const expenses = match.expenses?.map((expense) => {
    if (expense.id !== expenseId) return expense;

    return {
      ...expense,
      reimbursementStatus: 'not_expected' as const,
      reimbursedAmount: undefined,
      reimbursedAt: undefined,
    };
  });

  return expenses ? { expenses } : {};
}

export function updateExpenseAmount(
  match: Match,
  expenseId: string,
  amount: number,
): Partial<Match> {
  const expenses = match.expenses?.map((expense) =>
    expense.id === expenseId ? { ...expense, amount,
      reimbursedAmount: expense.reimbursementStatus === 'reimbursed' && expense.reimbursedAmount === expense.amount
        ? amount : expense.reimbursedAmount,
    } : expense,
  );

  return expenses ? { expenses } : {};
}

export type PayLineChoice = PayStatus | 'unset';

export function payLineChoiceFromMatch(match: Match): PayLineChoice {
  if (match.payStatus === 'not_tracked') return 'unset';
  return match.payStatus;
}
