import type {
  Expense,
  ExpenseCategory,
  Match,
  ReimbursementStatus,
  TravelSelfPaidInfo,
} from '@/domain/match';
import { normalizeReimbursementStatus } from '@/domain/reimbursement';

export type TravelCostSource = 'flight' | 'lodging' | 'groundTravel';

export type TravelCostEntry = {
  source: TravelCostSource;
  label: string;
  amount: number;
  reimbursementStatus: ReimbursementStatus;
  reimbursedAmount: number;
  outOfPocket: number;
};

const TRAVEL_EXPENSE_CATEGORY: Record<TravelCostSource, ExpenseCategory> = {
  flight: 'airfare',
  lodging: 'lodging',
  groundTravel: 'rental_car',
};

function sumTravelReimbursed(info: TravelSelfPaidInfo): number {
  if (!info.selfPaid || info.amountPaid == null) return 0;
  if (info.reimbursementStatus !== 'reimbursed') return 0;
  return info.reimbursedAmount ?? info.amountPaid;
}

function entryFromTravel(
  source: TravelCostSource,
  label: string,
  info?: TravelSelfPaidInfo,
): TravelCostEntry | null {
  if (!info?.selfPaid || info.amountPaid == null) return null;

  const reimbursementStatus = normalizeReimbursementStatus(info.reimbursementStatus);
  const reimbursedAmount = sumTravelReimbursed(info);

  return {
    source,
    label,
    amount: info.amountPaid,
    reimbursementStatus,
    reimbursedAmount,
    outOfPocket: info.amountPaid - reimbursedAmount,
  };
}

export function getTravelCostEntries(match: Match): TravelCostEntry[] {
  const entries: TravelCostEntry[] = [];

  const flight = entryFromTravel('flight', 'Flight', match.flight);
  if (flight) entries.push(flight);

  const lodging = entryFromTravel('lodging', 'Lodging', match.lodging);
  if (lodging) entries.push(lodging);

  const ground = entryFromTravel(
    'groundTravel',
    'Car rental',
    match.groundTravel,
  );
  if (ground) entries.push(ground);

  return entries;
}

export function travelExpenseCategory(source: TravelCostSource): ExpenseCategory {
  return TRAVEL_EXPENSE_CATEGORY[source];
}

export function travelCostAlreadyInExpenses(
  entry: TravelCostEntry,
  expenses: Expense[],
): boolean {
  const category = travelExpenseCategory(entry.source);
  return expenses.some(
    (expense) =>
      expense.category === category &&
      Math.abs(expense.amount - entry.amount) < 0.005,
  );
}

export function buildExpenseFromTravelEntry(
  entry: TravelCostEntry,
): Expense {
  return {
    id: crypto.randomUUID(),
    category: travelExpenseCategory(entry.source),
    amount: entry.amount,
    note: `From ${entry.label.toLowerCase()}`,
    reimbursementStatus: entry.reimbursementStatus,
    reimbursedAmount:
      entry.reimbursementStatus === 'reimbursed'
        ? entry.reimbursedAmount
        : undefined,
    reimbursedAt:
      entry.reimbursementStatus === 'reimbursed' ? new Date() : undefined,
    createdAt: new Date(),
  };
}

export function suggestExpensesFromTravel(
  match: Match,
  existing: Expense[],
): Expense[] {
  return getTravelCostEntries(match)
    .filter((entry) => !travelCostAlreadyInExpenses(entry, existing))
    .map(buildExpenseFromTravelEntry);
}

export function hasPendingTravelReimbursement(match: Match): boolean {
  return getTravelCostEntries(match).some(
    (entry) => entry.reimbursementStatus === 'pending',
  );
}

export function hasSelfPaidGroundTravel(match: Match): boolean {
  return Boolean(
    match.groundTravel?.selfPaid && match.groundTravel.amountPaid != null,
  );
}

export function shouldSuggestGasExpense(match: Match, expenses: Expense[]): boolean {
  if (!hasSelfPaidGroundTravel(match)) return false;
  return !expenses.some((expense) => expense.category === 'gas');
}

export function sumTravelExpenseAmount(match: Match): number {
  return getTravelCostEntries(match).reduce(
    (total, entry) => total + entry.amount,
    0,
  );
}

export function sumTravelReimbursedAmount(match: Match): number {
  return getTravelCostEntries(match).reduce(
    (total, entry) => total + entry.reimbursedAmount,
    0,
  );
}

export function sumTravelOutOfPocket(match: Match): number {
  return getTravelCostEntries(match).reduce(
    (total, entry) => total + entry.outOfPocket,
    0,
  );
}

export function setTravelReimbursementStatus(
  match: Match,
  source: TravelCostSource,
  status: ReimbursementStatus,
): Partial<Match> {
  const applyStatus = (info: TravelSelfPaidInfo): TravelSelfPaidInfo => {
    if (status === 'reimbursed') {
      return {
        ...info,
        reimbursementStatus: 'reimbursed',
        reimbursedAmount: info.reimbursedAmount ?? info.amountPaid,
        reimbursedAt: info.reimbursedAt ?? new Date(),
      };
    }

    if (status === 'pending') {
      return {
        ...info,
        reimbursementStatus: 'pending',
        reimbursedAmount: undefined,
        reimbursedAt: undefined,
      };
    }

    return {
      ...info,
      reimbursementStatus: 'not_expected',
      reimbursedAmount: undefined,
      reimbursedAt: undefined,
    };
  };

  if (source === 'flight' && match.flight?.selfPaid) {
    return { flight: applyStatus(match.flight) };
  }

  if (source === 'lodging' && match.lodging?.selfPaid) {
    return { lodging: applyStatus(match.lodging) };
  }

  if (source === 'groundTravel' && match.groundTravel?.selfPaid) {
    return { groundTravel: applyStatus(match.groundTravel) };
  }

  return {};
}

export function markTravelReimbursed(
  match: Match,
  source: TravelCostSource,
): Partial<Match> {
  return setTravelReimbursementStatus(match, source, 'reimbursed');
}

export function markTravelPending(
  match: Match,
  source: TravelCostSource,
): Partial<Match> {
  return setTravelReimbursementStatus(match, source, 'pending');
}

export function markTravelNotExpected(
  match: Match,
  source: TravelCostSource,
): Partial<Match> {
  return setTravelReimbursementStatus(match, source, 'not_expected');
}
