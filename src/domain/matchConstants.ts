import type { MatchTypePreset, PositionPreset } from '@/domain/match';

export type PresetOption<T extends string> = {
  value: T;
  label: string;
};

export const MATCH_TYPE_OPTIONS: PresetOption<MatchTypePreset>[] = [
  { value: 'xvs', label: 'XVs' },
  { value: '10s', label: '10s' },
  { value: '7s', label: '7s' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'other', label: 'Other' },
];

/** Game format presets for tournament child defaults (not the container itself). */
export const CHILD_MATCH_TYPE_OPTIONS = MATCH_TYPE_OPTIONS.filter(
  (option) => option.value !== 'tournament',
);

export const POSITION_OPTIONS: PresetOption<PositionPreset>[] = [
  { value: 'referee', label: 'Referee' },
  { value: 'assistant_referee', label: 'Assistant Referee' },
  { value: 'tmo_cmo', label: 'TMO / CMO' },
  { value: 'fourth_official', label: '4th Official' },
  { value: 'other', label: 'Other' },
];

export function resolvePositionLabel(
  preset: PositionPreset,
  customPosition?: string,
): string {
  if (preset === 'other') {
    return customPosition?.trim() || 'Other';
  }

  const option = POSITION_OPTIONS.find((item) => item.value === preset);
  return option?.label ?? preset;
}

export function resolveMatchTypeLabel(
  matchType: MatchTypePreset,
  customMatchType?: string,
): string {
  if (matchType === 'other') {
    return customMatchType?.trim() || 'Other';
  }

  const option = MATCH_TYPE_OPTIONS.find((item) => item.value === matchType);
  return option?.label ?? matchType;
}

export function inferPositionPreset(position: string): {
  preset: PositionPreset;
  customPosition?: string;
} {
  const normalized = position.trim().toLowerCase();
  const match = POSITION_OPTIONS.find(
    (option) =>
      option.value !== 'other' &&
      option.label.toLowerCase() === normalized,
  );

  if (match) {
    return { preset: match.value };
  }

  return {
    preset: 'other',
    customPosition: position.trim() || undefined,
  };
}
