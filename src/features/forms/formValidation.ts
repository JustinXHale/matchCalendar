import type {
  Expense,
  FlightInfo,
  FlightSegment,
  GroundTravelInfo,
  LodgingInfo,
  MatchContact,
} from '@/domain/match';

export function isValidDateRange(start: string, end: string): boolean {
  if (!start || !end) return false;
  return end >= start;
}

export function validateLodgingDates(lodging: LodgingInfo): string | undefined {
  if (lodging.checkInDate && lodging.checkOutDate) {
    if (lodging.checkOutDate < lodging.checkInDate) {
      return 'Check-out must be on or after check-in.';
    }
  }
  return undefined;
}

export function validateGroundTravelTimes(
  groundTravel: GroundTravelInfo,
): string | undefined {
  if (groundTravel.pickupAt && groundTravel.returnAt) {
    if (groundTravel.returnAt.getTime() < groundTravel.pickupAt.getTime()) {
      return 'Return must be after pickup.';
    }
  }
  return undefined;
}

export function validateFlightSegments(flight: FlightInfo): string | undefined {
  for (const segment of flight.segments ?? []) {
    const error = validateFlightSegment(segment);
    if (error) return error;
  }
  return undefined;
}

function validateFlightSegment(segment: FlightSegment): string | undefined {
  if (segment.departureAt && segment.arrivalAt) {
    if (segment.arrivalAt.getTime() < segment.departureAt.getTime()) {
      return 'Flight arrival must be after departure.';
    }
  }
  return undefined;
}

export function validateAmount(
  value: string | number | undefined,
  label = 'Amount',
): string | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return `${label} must be a valid number.`;
  if (parsed < 0) return `${label} cannot be negative.`;
  return undefined;
}

export function validateMileage(miles: number | undefined): string | undefined {
  if (miles === undefined) return undefined;
  if (!Number.isFinite(miles) || miles < 0) {
    return 'Mileage cannot be negative.';
  }
  return undefined;
}

export function validateExpense(expense: Expense): string | undefined {
  const amountError = validateAmount(expense.amount, 'Expense amount');
  if (amountError) return amountError;

  if (
    expense.category === 'miles_driven' ||
    expense.category === 'miles_flown'
  ) {
    const milesError = validateMileage(expense.miles);
    if (milesError) return milesError;
  }

  return undefined;
}

export function validateExpenses(expenses: Expense[]): string | undefined {
  for (const expense of expenses) {
    const error = validateExpense(expense);
    if (error) return error;
  }
  return undefined;
}

export function validateContactEmail(email?: string): string | undefined {
  const trimmed = email?.trim();
  if (!trimmed) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return undefined;
}

export function validateContacts(contacts: MatchContact[]): string | undefined {
  for (const contact of contacts) {
    const emailError = validateContactEmail(contact.email);
    if (emailError) return emailError;
  }
  return undefined;
}

export function validateTravelSections(input: {
  flight: FlightInfo;
  lodging: LodgingInfo;
  groundTravel: GroundTravelInfo;
}): string | undefined {
  return (
    validateFlightSegments(input.flight) ??
    validateLodgingDates(input.lodging) ??
    validateGroundTravelTimes(input.groundTravel)
  );
}
