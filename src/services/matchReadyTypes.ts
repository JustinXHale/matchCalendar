import type { MatchTypePreset, PositionPreset } from '@/domain/match';

export type MatchReadyAssignmentDto = {
  externalId: string;
  orgId: string;
  matchId: string;
  kickoffAt: string;
  timezone?: string;
  home?: string;
  away?: string;
  title?: string;
  location: string;
  position: string;
  positionPreset: PositionPreset;
  matchType: MatchTypePreset;
  competition?: string;
  expectedPay?: number;
  payCurrency?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  matchReadyStatus: string;
  matchReadyUrl?: string;
};

export type SyncMatchReadyAssignmentsResult = {
  syncedAt: string;
  assignments: MatchReadyAssignmentDto[];
};
