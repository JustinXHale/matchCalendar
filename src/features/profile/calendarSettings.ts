import type { PositionPreset } from '@/domain/match';

export const CALENDAR_SETTINGS_DOC_ID = 'settings';

export type CalendarSettings = {
  defaultPositionPreset: PositionPreset;
  pitchArrivalMinutesBeforeKickoff: number;
  airportArrivalMinutesBeforeFlight: number;
  migratedFromLocalAt?: string;
  matchReadyLastSyncedAt?: string;
  matchReadySyncEnabled?: boolean;
};

export const DEFAULT_CALENDAR_SETTINGS: CalendarSettings = {
  defaultPositionPreset: 'referee',
  pitchArrivalMinutesBeforeKickoff: 60,
  airportArrivalMinutesBeforeFlight: 120,
  matchReadySyncEnabled: true,
};
