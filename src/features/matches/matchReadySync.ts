import type { Match } from '@/domain/match';
import type { CalendarSettings } from '@/features/profile/calendarSettings';
import {
  getCalendarSettings,
  saveCalendarSettings,
} from '@/features/profile/calendarSettingsRepository';
import {
  MATCH_READY_SYNC_THROTTLE_MS,
  mergeMatchReadyImports,
} from '@/features/matches/matchReadyMerge';
import {
  deleteMatch,
  listMatches,
  upsertMatch,
} from '@/features/matches/matchFirestoreRepository';
import { fetchMatchReadyAssignments } from '@/services/matchReadyImport';

export type MatchReadySyncOutcome = {
  created: number;
  updated: number;
  removed: number;
  assignmentCount: number;
};

function shouldThrottleSync(
  settings: CalendarSettings,
  force: boolean,
): boolean {
  if (force) return false;
  if (settings.matchReadySyncEnabled === false) return true;
  const lastSyncedAt = settings.matchReadyLastSyncedAt;
  if (!lastSyncedAt) return false;
  const elapsed = Date.now() - Date.parse(lastSyncedAt);
  return !Number.isNaN(elapsed) && elapsed < MATCH_READY_SYNC_THROTTLE_MS;
}

export async function runMatchReadySync(
  uid: string,
  options: { force?: boolean; existingMatches?: Match[] } = {},
): Promise<MatchReadySyncOutcome | null> {
  const settings = await getCalendarSettings(uid);
  if (shouldThrottleSync(settings, Boolean(options.force))) {
    return null;
  }

  const existingMatches =
    options.existingMatches ?? (await listMatches(uid));

  const { syncedAt, assignments } = await fetchMatchReadyAssignments(
    Boolean(options.force),
  );
  const merged = mergeMatchReadyImports(
    existingMatches,
    assignments,
    uid,
    new Date(syncedAt),
  );

  for (const matchId of merged.toDelete) {
    await deleteMatch(uid, matchId);
  }

  for (const match of merged.toUpsert) {
    await upsertMatch(uid, match);
  }

  await saveCalendarSettings(uid, {
    ...settings,
    matchReadyLastSyncedAt: syncedAt,
  });

  return {
    created: merged.created,
    updated: merged.updated,
    removed: merged.removed,
    assignmentCount: assignments.length,
  };
}
