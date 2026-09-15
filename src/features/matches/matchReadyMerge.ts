import type { Match, PayStatus } from '@/domain/match';
import { defaultPayStatusForForm } from '@/features/matches/matchFormUtils';
import type { MatchReadyAssignmentDto } from '@/services/matchReadyTypes';

export type MatchReadyMergeResult = {
  toUpsert: Match[];
  toDelete: string[];
  created: number;
  updated: number;
  removed: number;
};

export const MATCH_READY_SYNC_THROTTLE_MS = 15 * 60 * 1000;

function payStatusForImport(
  dto: MatchReadyAssignmentDto,
): PayStatus {
  if (dto.expectedPay && dto.expectedPay > 0) return 'unpaid';
  return defaultPayStatusForForm(dto.status);
}

function sourceOwnedFieldsEqual(
  existing: Match,
  dto: MatchReadyAssignmentDto,
): boolean {
  return (
    existing.kickoffAt.toISOString() === new Date(dto.kickoffAt).toISOString() &&
    (existing.timezone ?? '') === (dto.timezone ?? '') &&
    (existing.home ?? '') === (dto.home ?? '') &&
    (existing.away ?? '') === (dto.away ?? '') &&
    (existing.title ?? '') === (dto.title ?? '') &&
    existing.location === dto.location &&
    existing.position === dto.position &&
    (existing.positionPreset ?? '') === dto.positionPreset &&
    existing.matchType === dto.matchType &&
    (existing.competition ?? '') === (dto.competition ?? '') &&
    (existing.expectedPay ?? null) === (dto.expectedPay ?? null) &&
    (existing.payCurrency ?? 'USD') === (dto.payCurrency ?? 'USD') &&
    existing.status === dto.status
  );
}

function createMatchFromDto(
  dto: MatchReadyAssignmentDto,
  ownerUid: string,
  syncedAt: Date,
): Match {
  const now = syncedAt;
  return {
    id: crypto.randomUUID(),
    ownerUid,
    kickoffAt: new Date(dto.kickoffAt),
    timezone: dto.timezone,
    home: dto.home,
    away: dto.away,
    title: dto.title,
    location: dto.location,
    position: dto.position,
    positionPreset: dto.positionPreset,
    matchType: dto.matchType,
    competition: dto.competition,
    status: dto.status,
    expectedPay: dto.expectedPay,
    payCurrency: dto.payCurrency ?? 'USD',
    payStatus: payStatusForImport(dto),
    source: {
      type: 'matchreadytx',
      externalId: dto.externalId,
      importedAt: now,
      lastSyncedAt: now,
    },
    createdAt: now,
    updatedAt: now,
  };
}

function updateMatchFromDto(
  existing: Match,
  dto: MatchReadyAssignmentDto,
  syncedAt: Date,
): Match {
  const importedAt =
    existing.source.type === 'matchreadytx'
      ? existing.source.importedAt
      : syncedAt;

  return {
    ...existing,
    kickoffAt: new Date(dto.kickoffAt),
    timezone: dto.timezone,
    home: dto.home,
    away: dto.away,
    title: dto.title,
    location: dto.location,
    position: dto.position,
    positionPreset: dto.positionPreset,
    customPosition:
      dto.positionPreset === 'other' ? existing.customPosition : undefined,
    matchType: dto.matchType,
    customMatchType:
      dto.matchType === 'other' ? existing.customMatchType : undefined,
    competition: dto.competition,
    expectedPay: dto.expectedPay,
    payCurrency: dto.payCurrency ?? existing.payCurrency ?? 'USD',
    status: dto.status,
    source: {
      type: 'matchreadytx',
      externalId: dto.externalId,
      importedAt,
      lastSyncedAt: syncedAt,
    },
    updatedAt: syncedAt,
  };
}

function pickPreferredImportMatch(
  left: Match,
  right: Match,
): Match {
  const leftImported =
    left.source.type === 'matchreadytx' ? left.source.importedAt : left.createdAt;
  const rightImported =
    right.source.type === 'matchreadytx' ? right.source.importedAt : right.createdAt;
  return leftImported <= rightImported ? left : right;
}

export function planMatchReadyImportCleanup(
  existing: Match[],
  imported: MatchReadyAssignmentDto[],
): string[] {
  const activeExternalIds = new Set(imported.map((dto) => dto.externalId));
  const keepByExternalId = new Map<string, Match>();
  const toDelete = new Set<string>();

  for (const match of existing) {
    if (match.source.type !== 'matchreadytx') continue;

    if (match.status === 'cancelled' || !activeExternalIds.has(match.source.externalId)) {
      toDelete.add(match.id);
      continue;
    }

    const kept = keepByExternalId.get(match.source.externalId);
    if (!kept) {
      keepByExternalId.set(match.source.externalId, match);
      continue;
    }

    const preferred = pickPreferredImportMatch(kept, match);
    toDelete.add(preferred.id === kept.id ? match.id : kept.id);
    keepByExternalId.set(match.source.externalId, preferred);
  }

  return [...toDelete];
}

export function mergeMatchReadyImports(
  existing: Match[],
  imported: MatchReadyAssignmentDto[],
  ownerUid: string,
  syncedAt = new Date(),
): MatchReadyMergeResult {
  const toDelete = planMatchReadyImportCleanup(existing, imported);
  const deleteIds = new Set(toDelete);

  const byExternalId = new Map<string, Match>();
  for (const match of existing) {
    if (match.source.type !== 'matchreadytx' || deleteIds.has(match.id)) continue;
    const current = byExternalId.get(match.source.externalId);
    if (!current) {
      byExternalId.set(match.source.externalId, match);
      continue;
    }
    byExternalId.set(
      match.source.externalId,
      pickPreferredImportMatch(current, match),
    );
  }

  const toUpsert: Match[] = [];
  let created = 0;
  let updated = 0;

  for (const dto of imported) {
    if (dto.status === 'cancelled') continue;

    const current = byExternalId.get(dto.externalId);
    if (!current) {
      toUpsert.push(createMatchFromDto(dto, ownerUid, syncedAt));
      created += 1;
      continue;
    }

    if (sourceOwnedFieldsEqual(current, dto)) {
      continue;
    }

    toUpsert.push(updateMatchFromDto(current, dto, syncedAt));
    updated += 1;
  }

  return { toUpsert, toDelete, created, updated, removed: toDelete.length };
}
