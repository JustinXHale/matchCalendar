import { doc, getDoc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore';
import {
  CALENDAR_SETTINGS_DOC_ID,
  DEFAULT_CALENDAR_SETTINGS,
  type CalendarSettings,
} from '@/features/profile/calendarSettings';
import { requireDb } from '@/services/firebase';

function settingsRef(uid: string) {
  return doc(requireDb(), 'users', uid, 'matchCalendar', CALENDAR_SETTINGS_DOC_ID);
}

export function calendarSettingsFromFirestore(
  data: Record<string, unknown> | undefined,
): CalendarSettings {
  if (!data) return DEFAULT_CALENDAR_SETTINGS;
  return {
    defaultPositionPreset:
      (data.defaultPositionPreset as CalendarSettings['defaultPositionPreset']) ??
      DEFAULT_CALENDAR_SETTINGS.defaultPositionPreset,
    pitchArrivalMinutesBeforeKickoff:
      typeof data.pitchArrivalMinutesBeforeKickoff === 'number'
        ? data.pitchArrivalMinutesBeforeKickoff
        : DEFAULT_CALENDAR_SETTINGS.pitchArrivalMinutesBeforeKickoff,
    airportArrivalMinutesBeforeFlight:
      typeof data.airportArrivalMinutesBeforeFlight === 'number'
        ? data.airportArrivalMinutesBeforeFlight
        : DEFAULT_CALENDAR_SETTINGS.airportArrivalMinutesBeforeFlight,
    migratedFromLocalAt:
      typeof data.migratedFromLocalAt === 'string'
        ? data.migratedFromLocalAt
        : undefined,
  };
}

export function subscribeCalendarSettings(
  uid: string,
  onSettings: (settings: CalendarSettings) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    settingsRef(uid),
    (snapshot) => {
      onSettings(
        calendarSettingsFromFirestore(
          snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined,
        ),
      );
    },
    (error) => onError?.(error),
  );
}

export async function getCalendarSettings(
  uid: string,
): Promise<CalendarSettings> {
  const snapshot = await getDoc(settingsRef(uid));
  return calendarSettingsFromFirestore(
    snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : undefined,
  );
}

export async function saveCalendarSettings(
  uid: string,
  settings: CalendarSettings,
): Promise<void> {
  await setDoc(settingsRef(uid), settings, { merge: true });
}
