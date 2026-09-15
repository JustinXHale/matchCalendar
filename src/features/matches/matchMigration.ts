import type {
  Expense,
  FlightInfo,
  FlightSegment,
  GroundTravelInfo,
  LodgingInfo,
  Match,
  MatchContact,
  TravelSelfPaidInfo,
} from '@/domain/match';

type LegacyMatch = Match & {
  contact?: string;
};
import { hasFlightData } from '@/features/matches/flightUtils';
import {
  inferPositionPreset,
  resolvePositionLabel,
} from '@/domain/matchConstants';
import { normalizeReimbursementStatus } from '@/domain/reimbursement';

type LegacyFlightInfo = FlightInfo & {
  airline?: string;
  flightNumber?: string;
  departureAt?: Date;
  arrivalAt?: Date;
  confirmation?: string;
};

function migrateExpense(expense: Expense): Expense {
  return {
    ...expense,
    reimbursementStatus: normalizeReimbursementStatus(expense.reimbursementStatus),
  };
}

function migrateTravelSelfPaid<T extends TravelSelfPaidInfo>(info: T): T {
  if (!info.selfPaid) return info;

  return {
    ...info,
    reimbursementStatus: normalizeReimbursementStatus(info.reimbursementStatus),
  };
}

function migrateFlight(flight?: LegacyFlightInfo): FlightInfo | undefined {
  if (!flight) return undefined;

  const withSelfPaid = migrateTravelSelfPaid(flight);
  let segments: FlightSegment[] | undefined = withSelfPaid.segments;

  if (!segments?.length) {
    if (
      flight.airline ||
      flight.flightNumber ||
      flight.departureAt ||
      flight.arrivalAt ||
      flight.confirmation
    ) {
      segments = [
        {
          id: crypto.randomUUID(),
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          departureAt: flight.departureAt,
          arrivalAt: flight.arrivalAt,
          confirmation: flight.confirmation,
        },
      ];
    }
  }

  const migrated: FlightInfo = {
    selfPaid: withSelfPaid.selfPaid,
    amountPaid: withSelfPaid.amountPaid,
    reimbursementStatus: withSelfPaid.reimbursementStatus,
    reimbursedAmount: withSelfPaid.reimbursedAmount,
    reimbursedAt: withSelfPaid.reimbursedAt,
    segments,
    notes: withSelfPaid.notes,
  };

  return hasFlightData(migrated) ? migrated : undefined;
}

function migrateLodging(lodging?: LodgingInfo): LodgingInfo | undefined {
  return lodging ? migrateTravelSelfPaid(lodging) : undefined;
}

function migrateGroundTravel(
  groundTravel?: GroundTravelInfo,
): GroundTravelInfo | undefined {
  return groundTravel ? migrateTravelSelfPaid(groundTravel) : undefined;
}

function migrateContacts(match: LegacyMatch): MatchContact[] | undefined {
  if (match.contacts?.length) return match.contacts;
  const legacyContact = match.contact?.trim();
  if (!legacyContact) return undefined;

  return [
    {
      id: crypto.randomUUID(),
      name: legacyContact,
      order: 0,
    },
  ];
}

export function migrateMatch(match: Match): Match {
  const legacy = match as LegacyMatch;
  const inferred = match.positionPreset
    ? {
        preset: match.positionPreset,
        customPosition: match.customPosition,
      }
    : inferPositionPreset(match.position);

  const position =
    match.position?.trim() ||
    resolvePositionLabel(inferred.preset, inferred.customPosition);

  const contacts = migrateContacts(legacy);

  return {
    ...match,
    position,
    positionPreset: inferred.preset,
    customPosition: inferred.customPosition,
    matchType: match.matchType ?? 'xvs',
    contacts,
    expenses: match.expenses?.map(migrateExpense),
    flight: migrateFlight(match.flight as LegacyFlightInfo | undefined),
    lodging: migrateLodging(match.lodging),
    groundTravel: migrateGroundTravel(match.groundTravel),
  };
}

export function migrateMatches(matches: Match[]): Match[] {
  return matches.map(migrateMatch);
}
