import type {
  Match,
  MatchContact,
  MatchTypePreset,
  PositionPreset,
} from '@/domain/match';
import { validateAmount, validateContacts } from '@/features/forms/formValidation';
import { resolvePositionLabel } from '@/domain/matchConstants';

export type MatchFormValues = {
  date: string;
  time: string;
  title: string;
  home: string;
  away: string;
  location: string;
  positionPreset: PositionPreset;
  customPosition: string;
  matchType: MatchTypePreset;
  customMatchType: string;
  competition: string;
  status: Match['status'];
  expectedPay: string;
  payStatus: Match['payStatus'];
  paidAmount: string;
  paidAt: string;
  paymentMethod: Match['paymentMethod'] | '';
  payOwedBy: string;
  uniform: string;
  parking: string;
  notes: string;
};

export type MatchFormErrors = Partial<
  Record<keyof MatchFormValues | 'teams' | 'position' | 'expectedPay', string>
>;

function validateCoreIdentity(values: MatchFormValues): MatchFormErrors {
  const errors: MatchFormErrors = {};

  if (!values.date) errors.date = 'Date is required';
  if (!values.time) errors.time = 'Time is required';

  const position = resolvePositionLabel(
    values.positionPreset,
    values.customPosition,
  );
  if (!position.trim() || position === 'Other') {
    if (values.positionPreset === 'other' && !values.customPosition.trim()) {
      errors.position = 'Enter a position or choose a preset';
    }
  }

  if (!values.matchType) {
    errors.matchType = 'Match type is required';
  }

  if (values.matchType === 'other' && !values.customMatchType.trim()) {
    errors.customMatchType = 'Enter a match type';
  }

  const hasIdentity =
    Boolean(values.title.trim()) ||
    Boolean(values.home.trim()) ||
    Boolean(values.away.trim());

  if (!hasIdentity) {
    errors.teams = 'Enter a title or at least one team';
  }

  return errors;
}

export function validateMatchForm(values: MatchFormValues): MatchFormErrors {
  const errors = validateCoreIdentity(values);

  if (!values.location.trim()) {
    errors.location = 'Location is required';
  }

  const expectedPayError = validateAmount(values.expectedPay, 'Expected pay');
  if (expectedPayError) errors.expectedPay = expectedPayError;

  const paidAmountError = validateAmount(values.paidAmount, 'Paid amount');
  if (paidAmountError) errors.paidAmount = paidAmountError;

  return errors;
}

export function validateTournamentChildMatchForm(
  values: MatchFormValues,
): MatchFormErrors {
  const errors = validateCoreIdentity(values);
  const expectedPayError = validateAmount(values.expectedPay, 'Expected pay');
  if (expectedPayError) errors.expectedPay = expectedPayError;
  return errors;
}

export function validateMatchContacts(contacts: MatchContact[]): string | undefined {
  return validateContacts(contacts);
}

export function hasFormErrors(errors: MatchFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
