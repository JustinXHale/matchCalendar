import type { PositionPreset } from '@/domain/match';
import { isLanguagePreference, type LanguagePreference } from '@/i18n/languages';
import { readJson, STORAGE_KEYS, writeJson } from '@/services/localStore';

export type LocalProfile = {
  displayName: string;
  defaultPositionPreset: PositionPreset;
  pitchArrivalMinutesBeforeKickoff: number;
  airportArrivalMinutesBeforeFlight: number;
  languagePreference: LanguagePreference;
};

const DEFAULT_PROFILE: LocalProfile = {
  displayName: '',
  defaultPositionPreset: 'referee',
  pitchArrivalMinutesBeforeKickoff: 60,
  airportArrivalMinutesBeforeFlight: 120,
  languagePreference: 'auto',
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
      languagePreference: isLanguagePreference(raw.languagePreference)
        ? raw.languagePreference
        : 'auto',
    };
  }

  return {
    ...DEFAULT_PROFILE,
    displayName: raw.displayName ?? '',
    pitchArrivalMinutesBeforeKickoff:
      raw.pitchArrivalMinutesBeforeKickoff ?? 60,
    airportArrivalMinutesBeforeFlight:
      raw.airportArrivalMinutesBeforeFlight ?? 120,
    languagePreference: isLanguagePreference(raw.languagePreference)
      ? raw.languagePreference
      : 'auto',
  };
}

export function saveProfile(profile: LocalProfile): void {
  writeJson(STORAGE_KEYS.profile, profile);
}
