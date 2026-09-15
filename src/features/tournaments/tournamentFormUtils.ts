import type {
  CustomItineraryItem,
  Expense,
  FlightInfo,
  GroundTravelInfo,
  LodgingInfo,
} from '@/domain/match';
import type { PositionPreset } from '@/domain/match';
import type { Tournament, TournamentPayScope } from '@/domain/tournament';
import { compactFlight, emptyFlight, normalizeFlight } from '@/features/matches/flightUtils';
import { createEmptyMatchForm } from '@/features/matches/matchFormUtils';
import type { MatchFormValues } from '@/features/matches/matchValidation';

export function tournamentPayScope(
  tournament: Pick<Tournament, 'payScope'>,
): TournamentPayScope {
  return tournament.payScope ?? 'tournament';
}

export function isTournamentLumpPay(
  tournament: Pick<Tournament, 'payScope'>,
): boolean {
  return tournamentPayScope(tournament) === 'tournament';
}

export type TournamentFormState = {
  startDate: string;
  endDate: string;
  payScope: TournamentPayScope;
  defaults: MatchFormValues;
  expenses: Expense[];
  customItinerary: CustomItineraryItem[];
  flight: FlightInfo;
  lodging: LodgingInfo;
  groundTravel: GroundTravelInfo;
};

export function createEmptyTournamentForm(
  defaultPositionPreset: PositionPreset = 'referee',
): TournamentFormState {
  return {
    startDate: '',
    endDate: '',
    payScope: 'tournament',
    defaults: createEmptyMatchForm(defaultPositionPreset),
    expenses: [],
    customItinerary: [],
    flight: emptyFlight(),
    lodging: {},
    groundTravel: {},
  };
}

export function tournamentToFormState(
  tournament: Tournament,
  defaultPositionPreset: PositionPreset,
): TournamentFormState {
  const defaults: MatchFormValues = {
    ...createEmptyMatchForm(defaultPositionPreset),
    ...tournament.matchDefaults,
    title: tournament.title,
    location: tournament.location ?? '',
    notes: tournament.notes ?? '',
  };

  return {
    startDate: tournament.startDate,
    endDate: tournament.endDate,
    payScope: tournamentPayScope(tournament),
    defaults,
    expenses: tournament.expenses ?? [],
    customItinerary: tournament.customItinerary ?? [],
    flight: normalizeFlight(tournament.flight) ?? emptyFlight(),
    lodging: tournament.lodging ?? {},
    groundTravel: tournament.groundTravel ?? {},
  };
}

export function hasLodgingData(lodging: LodgingInfo): boolean {
  return Boolean(
    lodging.propertyName ||
      lodging.address ||
      lodging.checkInDate ||
      lodging.checkOutDate ||
      lodging.confirmation ||
      lodging.notes ||
      lodging.selfPaid ||
      lodging.amountPaid ||
      lodging.reimbursementStatus ||
      lodging.reimbursedAmount ||
      lodging.reimbursedAt,
  );
}

export function hasGroundData(groundTravel: GroundTravelInfo): boolean {
  return Boolean(
    groundTravel.provider ||
      groundTravel.pickupAt ||
      groundTravel.returnAt ||
      groundTravel.confirmation ||
      groundTravel.notes ||
      groundTravel.selfPaid ||
      groundTravel.amountPaid ||
      groundTravel.reimbursementStatus ||
      groundTravel.reimbursedAmount ||
      groundTravel.reimbursedAt,
  );
}

export function buildTournamentPayload(state: TournamentFormState) {
  return {
    title: state.defaults.title.trim(),
    startDate: state.startDate,
    endDate: state.endDate,
    payScope: state.payScope,
    location: state.defaults.location.trim() || undefined,
    notes: state.defaults.notes.trim() || undefined,
    matchDefaults: state.defaults,
    expenses: state.expenses,
    customItinerary: state.customItinerary,
    flight: compactFlight(state.flight),
    lodging: hasLodgingData(state.lodging) ? state.lodging : undefined,
    groundTravel: hasGroundData(state.groundTravel) ? state.groundTravel : undefined,
  };
}

export function validateTournamentForm(state: TournamentFormState): string | undefined {
  if (!state.defaults.title.trim()) {
    return 'Enter an event title.';
  }
  if (!state.defaults.location.trim()) {
    return 'Enter a location.';
  }
  if (!state.startDate || !state.endDate) {
    return 'Enter start and end dates.';
  }
  if (state.endDate < state.startDate) {
    return 'End date must be on or after start date.';
  }
  if (state.defaults.matchType === 'tournament') {
    return 'Choose a game format for matches in this tournament.';
  }
  if (
    state.defaults.matchType === 'other' &&
    !state.defaults.customMatchType.trim()
  ) {
    return 'Enter a custom game format.';
  }
  return undefined;
}
