import { loadMatches } from '@/features/matches/matchRepository';
import { upsertMatches } from '@/features/matches/matchFirestoreRepository';
import {
  getCalendarSettings,
  saveCalendarSettings,
} from '@/features/profile/calendarSettingsRepository';
import { loadProfile } from '@/features/profile/localProfile';
import { loadTournaments } from '@/features/tournaments/tournamentRepository';
import { upsertTournaments } from '@/features/tournaments/tournamentFirestoreRepository';
import { LOCAL_OWNER_UID, STORAGE_KEYS } from '@/services/localStore';

function clearLocalData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.matches);
    localStorage.removeItem(STORAGE_KEYS.tournaments);
    localStorage.removeItem(STORAGE_KEYS.profile);
  } catch {
    /* ignore */
  }
}

export async function migrateLocalDataToFirestore(uid: string): Promise<void> {
  const settings = await getCalendarSettings(uid);
  if (settings.migratedFromLocalAt) return;

  const localMatches = loadMatches();
  const localTournaments = loadTournaments();
  const localProfile = loadProfile();

  const hasLocalMatches = localMatches.some(
    (match) => match.ownerUid === LOCAL_OWNER_UID,
  );
  const hasLocalTournaments = localTournaments.length > 0;
  const hasLocalProfile =
    localProfile.displayName.length > 0 ||
    localProfile.defaultPositionPreset !== 'referee' ||
    localProfile.pitchArrivalMinutesBeforeKickoff !== 60 ||
    localProfile.airportArrivalMinutesBeforeFlight !== 120;

  if (!hasLocalMatches && !hasLocalTournaments && !hasLocalProfile) {
    await saveCalendarSettings(uid, {
      ...settings,
      migratedFromLocalAt: new Date().toISOString(),
    });
    return;
  }

  if (hasLocalMatches) {
    await upsertMatches(
      uid,
      localMatches.map((match) => ({
        ...match,
        ownerUid: uid,
      })),
    );
  }

  if (hasLocalTournaments) {
    await upsertTournaments(
      uid,
      localTournaments.map((tournament) => ({
        ...tournament,
        ownerUid: uid,
      })),
    );
  }

  await saveCalendarSettings(uid, {
    defaultPositionPreset: localProfile.defaultPositionPreset,
    pitchArrivalMinutesBeforeKickoff:
      localProfile.pitchArrivalMinutesBeforeKickoff,
    airportArrivalMinutesBeforeFlight:
      localProfile.airportArrivalMinutesBeforeFlight,
    migratedFromLocalAt: new Date().toISOString(),
  });

  clearLocalData();
}
