import { httpsCallable } from 'firebase/functions';
import type { FlightLookupOption } from '@/features/matches/flightImport';
import { requireFunctions } from '@/services/firebase';

type FlightImportAccessResult = {
  enabled: boolean;
};

type FlightSearchResult = {
  flights: FlightLookupOption[];
};

type SetFlightImportAccessResult = {
  uid: string;
  enabled: boolean;
};

export async function hasFlightImportAccess(): Promise<boolean> {
  const callable = httpsCallable<Record<string, never>, FlightImportAccessResult>(
    requireFunctions(),
    'getMatchCalendarFlightImportAccess',
  );
  const result = await callable({});
  return result.data.enabled;
}

export async function searchFlightData(
  flightNumber: string,
  departureDate: string,
  departureAirport: string,
): Promise<FlightLookupOption[]> {
  const callable = httpsCallable<
    {
      flightNumber: string;
      departureDate: string;
      departureAirport: string;
    },
    FlightSearchResult
  >(requireFunctions(), 'searchMatchCalendarFlights');
  const result = await callable({
    flightNumber,
    departureDate,
    departureAirport,
  });
  return result.data.flights;
}

export async function setFlightImportAccess(
  uid: string,
  enabled: boolean,
): Promise<SetFlightImportAccessResult> {
  const callable = httpsCallable<
    { uid: string; enabled: boolean },
    SetFlightImportAccessResult
  >(requireFunctions(), 'setMatchCalendarFlightImportAccess');
  const result = await callable({ uid, enabled });
  return result.data;
}

export function flightImportAccessErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: string }).code ?? '')
      : '';

  if (code === 'functions/permission-denied') {
    return 'You are not authorized to manage flight import access.';
  }
  if (code === 'functions/unauthenticated') {
    return 'Sign in to manage flight import access.';
  }
  if (typeof error === 'object' && error && 'message' in error) {
    const message = String((error as { message?: string }).message ?? '').trim();
    if (message) return message;
  }
  return 'Could not update flight import access. Try again in a moment.';
}

export function flightImportErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error && 'code' in error
      ? String((error as { code?: string }).code ?? '')
      : '';

  if (code === 'functions/permission-denied') {
    return 'Flight import is not enabled for this account.';
  }
  if (code === 'functions/unauthenticated') {
    return 'Sign in to import flight data.';
  }
  if (code === 'functions/resource-exhausted') {
    return 'The flight lookup limit has been reached. Try again later.';
  }
  if (code === 'functions/not-found') {
    return 'No matching flight was found.';
  }
  if (typeof error === 'object' && error && 'message' in error) {
    const message = String((error as { message?: string }).message ?? '').trim();
    if (message) return message;
  }
  return 'Could not look up that flight. Try again in a moment.';
}
