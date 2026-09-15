import type { PositionPreset } from '@/domain/match';
import { readJson, STORAGE_KEYS, writeJson } from '@/services/localStore';

export type LocalProfile = {
  displayName: string;
  defaultPositionPreset: PositionPreset;
  pitchArrivalMinutesBeforeKickoff: number;
  airportArrivalMinutesBeforeFlight: number;
};

const DEFAULT_PROFILE: LocalProfile = {
  displayName: '',
  defaultPositionPreset: 'referee',
  pitchArrivalMinutesBeforeKickoff: 60,
  airportArrivalMinutesBeforeFlight: 120,
};

export function loadProfile(): LocalProfile {
  const raw = readJson<Partial<LocalProfile> & { defaultPosition?: string }>(
    STORAGE_KEYS.profile,
    {},
  );

  if (raw.defaultPositionPreset) {
    return {
      displayName: raw.displayName ?? '',
      defaultPositionPreset: raw.defaultPositionPreset,
      pitchArrivalMinutesBeforeKickoff:
        raw.pitchArrivalMinutesBeforeKickoff ?? 60,
      airportArrivalMinutesBeforeFlight:
        raw.airportArrivalMinutesBeforeFlight ?? 120,
    };
  }

  return {
    ...DEFAULT_PROFILE,
    displayName: raw.displayName ?? '',
    pitchArrivalMinutesBeforeKickoff:
      raw.pitchArrivalMinutesBeforeKickoff ?? 60,
    airportArrivalMinutesBeforeFlight:
      raw.airportArrivalMinutesBeforeFlight ?? 120,
  };
}

export function saveProfile(profile: LocalProfile): void {
  writeJson(STORAGE_KEYS.profile, profile);
}
