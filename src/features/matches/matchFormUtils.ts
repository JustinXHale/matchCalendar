import type {
  CustomField,
  Match,
  MatchContact,
  PayStatus,
  PositionPreset,
} from '@/domain/match';
import {
  inferPositionPreset,
  resolvePositionLabel,
} from '@/domain/matchConstants';
import type { MatchFormValues } from '@/features/matches/matchValidation';
import type { Tournament } from '@/domain/tournament';
import { isTournamentLumpPay } from '@/features/tournaments/tournamentFormUtils';
import { LOCAL_OWNER_UID } from '@/services/localStore';

export function createEmptyMatchForm(
  defaultPositionPreset: PositionPreset = 'referee',
): MatchFormValues {
  const now = new Date();
  return {
    date: toDateInputValue(now),
    time: toTimeInputValue(now),
    title: '',
    home: '',
    away: '',
    location: '',
    positionPreset: defaultPositionPreset,
    customPosition: '',
    matchType: 'xvs',
    customMatchType: '',
    competition: '',
    status: 'upcoming',
    expectedPay: '',
    payStatus: 'not_tracked',
    paidAmount: '',
    paidAt: '',
    paymentMethod: '',
    payOwedBy: '',
    uniform: '',
    parking: '',
    notes: '',
  };
}

export function matchToFormValues(match: Match): MatchFormValues {
  const positionInfo = match.positionPreset
    ? {
        preset: match.positionPreset,
        customPosition: match.customPosition ?? '',
      }
    : inferPositionPreset(match.position);

  return {
    date: toDateInputValue(match.kickoffAt),
    time: toTimeInputValue(match.kickoffAt),
    title: match.title ?? '',
    home: match.home ?? '',
    away: match.away ?? '',
    location: match.location,
    positionPreset: positionInfo.preset,
    customPosition: positionInfo.customPosition ?? '',
    matchType: match.matchType ?? 'xvs',
    customMatchType: match.customMatchType ?? '',
    competition: match.competition ?? '',
    status: match.status,
    expectedPay: match.expectedPay != null ? String(match.expectedPay) : '',
    payStatus: match.payStatus,
    paidAmount: match.paidAmount != null ? String(match.paidAmount) : '',
    paidAt: match.paidAt ? toDateTimeInputValue(match.paidAt) : '',
    paymentMethod: match.paymentMethod ?? '',
    payOwedBy: match.payOwedBy ?? '',
    uniform: match.uniform ?? '',
    parking: match.parking ?? '',
    notes: match.notes ?? '',
  };
}

export function createTournamentChildFormValues(
  parent: Tournament,
  defaultPositionPreset: PositionPreset,
): MatchFormValues {
  const defaults = parent.matchDefaults ?? {};
  return {
    ...createEmptyMatchForm(defaultPositionPreset),
    ...defaults,
    date: parent.startDate,
    location: parent.location ?? '',
    expectedPay:
      isTournamentLumpPay(parent) ? '' : (defaults.expectedPay ?? ''),
    paidAmount: '',
    paidAt: '',
    payStatus: 'not_tracked',
    title: '',
    home: '',
    away: '',
  };
}

export function resolveTournamentChildExpectedPay(
  values: MatchFormValues,
  parentDefaultPay?: string,
): number | undefined {
  const explicit = parseOptionalNumber(values.expectedPay);
  if (explicit != null) return explicit;
  return parseOptionalNumber(parentDefaultPay ?? '');
}

export function formValuesToKickoffAt(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

export function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function resolvePayStatusForExpectedPay(
  payStatus: PayStatus,
  expectedPay: string | number | undefined,
): PayStatus {
  const amount = typeof expectedPay === 'number'
    ? (Number.isFinite(expectedPay) ? expectedPay : undefined)
    : parseOptionalNumber(expectedPay ?? '');
  if (amount != null && amount > 0 && payStatus === 'not_tracked') {
    return 'unpaid';
  }
  return payStatus;
}

type BuildMatchOptions = {
  contacts?: MatchContact[];
  customFields?: CustomField[];
  location?: string;
  expectedPay?: number;
  tournamentId?: string;
};

export function buildMatchFromForm(
  values: MatchFormValues,
  existing?: Match,
  options?: BuildMatchOptions,
): Omit<Match, 'id' | 'createdAt' | 'updatedAt'> {
  const kickoffAt = formValuesToKickoffAt(values.date, values.time);
  const position = resolvePositionLabel(
    values.positionPreset,
    values.customPosition,
  );
  const paidAt = values.paidAt ? new Date(values.paidAt) : undefined;

  return {
    ownerUid: existing?.ownerUid ?? LOCAL_OWNER_UID,
    kickoffAt,
    timezone:
      existing?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    title: values.title.trim() || undefined,
    home: values.home.trim() || undefined,
    away: values.away.trim() || undefined,
    location: (options?.location ?? values.location).trim(),
    position,
    positionPreset: values.positionPreset,
    customPosition:
      values.positionPreset === 'other'
        ? values.customPosition.trim() || undefined
        : undefined,
    matchType: values.matchType,
    customMatchType:
      values.matchType === 'other'
        ? values.customMatchType.trim() || undefined
        : undefined,
    competition: values.competition.trim() || undefined,
    status: values.status,
    expectedPay: options?.expectedPay ?? parseOptionalNumber(values.expectedPay),
    payCurrency: existing?.payCurrency ?? 'USD',
    payStatus: resolvePayStatusForExpectedPay(
      values.payStatus,
      options?.expectedPay ?? values.expectedPay,
    ),
    paidAmount: parseOptionalNumber(values.paidAmount),
    paidAt: values.payStatus === 'paid' ? paidAt : undefined,
    paymentMethod: values.paymentMethod || undefined,
    payOwedBy: values.payOwedBy.trim() || undefined,
    contacts: options?.contacts ?? existing?.contacts,
    uniform: values.uniform.trim() || undefined,
    parking: values.parking.trim() || undefined,
    notes: values.notes.trim() || undefined,
    customFields: options?.customFields ?? existing?.customFields,
    customItinerary: existing?.customItinerary,
    pitchArrivalOverrideMinutes: existing?.pitchArrivalOverrideMinutes,
    airportArrivalOverrideMinutes: existing?.airportArrivalOverrideMinutes,
    flight: existing?.flight,
    lodging: existing?.lodging,
    groundTravel: existing?.groundTravel,
    expenses: existing?.expenses,
    tournamentId: options?.tournamentId ?? existing?.tournamentId,
    source: existing?.source ?? { type: 'manual' },
  };
}

export function buildTournamentChildMatchFromForm(
  values: MatchFormValues,
  parent: Tournament,
  existing?: Match,
  extras?: Pick<BuildMatchOptions, 'contacts' | 'customFields'>,
): Omit<Match, 'id' | 'createdAt' | 'updatedAt'> {
  const defaults = parent.matchDefaults ?? {};
  const mergedValues: MatchFormValues = {
    ...values,
    location: parent.location ?? values.location,
    competition: values.competition || defaults.competition || '',
    payOwedBy: values.payOwedBy || defaults.payOwedBy || '',
    uniform: values.uniform || defaults.uniform || '',
    parking: values.parking || defaults.parking || '',
    notes: values.notes || defaults.notes || '',
  };

  return buildMatchFromForm(mergedValues, existing, {
    ...extras,
    location: parent.location ?? mergedValues.location,
    expectedPay: isTournamentLumpPay(parent)
      ? undefined
      : resolveTournamentChildExpectedPay(values, defaults.expectedPay),
    tournamentId: parent.id,
  });
}

export function defaultPayStatusForForm(status: Match['status']): PayStatus {
  return status === 'completed' ? 'unpaid' : 'not_tracked';
}

function toDateInputValue(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function toTimeInputValue(date: Date): string {
  return [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
  ].join(':');
}

function toDateTimeInputValue(date: Date): string {
  return [toDateInputValue(date), 'T', toTimeInputValue(date)].join('');
}
