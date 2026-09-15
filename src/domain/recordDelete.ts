import type { Match } from '@/domain/match';

export function isManualMatch(match: Match): boolean {
  return match.source.type === 'manual';
}
