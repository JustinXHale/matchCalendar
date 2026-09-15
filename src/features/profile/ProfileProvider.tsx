import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';

import type { PositionPreset } from '@/domain/match';
import { useAuth } from '@/features/auth/AuthProvider';
import { useLiveData } from '@/features/auth/useLiveData';
import {
  DEFAULT_CALENDAR_SETTINGS,
  type CalendarSettings,
} from '@/features/profile/calendarSettings';
import {
  saveCalendarSettings,
  subscribeCalendarSettings,
} from '@/features/profile/calendarSettingsRepository';
import {
  fetchSharedUserIdentity,
  type SharedUserIdentity,
} from '@/features/profile/sharedUserIdentity';
import {
  loadProfile,
  saveProfile,
  type LocalProfile,
} from '@/features/profile/localProfile';

export type AppProfile = {
  displayName: string;
  email?: string;
  photoUrl?: string;
  defaultPositionPreset: PositionPreset;
  pitchArrivalMinutesBeforeKickoff: number;
  airportArrivalMinutesBeforeFlight: number;
  isLive: boolean;
};

type ProfilePatch = Partial<
  Pick<
    AppProfile,
    | 'displayName'
    | 'defaultPositionPreset'
    | 'pitchArrivalMinutesBeforeKickoff'
    | 'airportArrivalMinutesBeforeFlight'
  >
>;

type ProfileContextValue = {
  profile: AppProfile;
  updateProfile: (patch: ProfilePatch) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

function localToAppProfile(local: LocalProfile): AppProfile {
  return {
    displayName: local.displayName,
    defaultPositionPreset: local.defaultPositionPreset,
    pitchArrivalMinutesBeforeKickoff: local.pitchArrivalMinutesBeforeKickoff,
    airportArrivalMinutesBeforeFlight: local.airportArrivalMinutesBeforeFlight,
    isLive: false,
  };
}

function resolvePhotoUrl(user: User, sharedIdentity: SharedUserIdentity): string | undefined {
  if (sharedIdentity.photoUrl) return sharedIdentity.photoUrl;
  if (user.photoURL) return user.photoURL;
  const googlePhoto = user.providerData.find(
    (provider) => provider.providerId === 'google.com',
  )?.photoURL;
  return googlePhoto ?? undefined;
}

function settingsToAppProfile(
  settings: CalendarSettings,
  user: User,
  sharedIdentity: SharedUserIdentity = {},
): AppProfile {
  return {
    displayName:
      user.displayName?.trim() ||
      sharedIdentity.displayName?.trim() ||
      user.email?.trim() ||
      'Official',
    email: user.email ?? undefined,
    photoUrl: resolvePhotoUrl(user, sharedIdentity),
    defaultPositionPreset: settings.defaultPositionPreset,
    pitchArrivalMinutesBeforeKickoff: settings.pitchArrivalMinutesBeforeKickoff,
    airportArrivalMinutesBeforeFlight: settings.airportArrivalMinutesBeforeFlight,
    isLive: true,
  };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { isLive, uid } = useLiveData();
  const [localProfile, setLocalProfile] = useState<LocalProfile>(() =>
    loadProfile(),
  );
  const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>(
    DEFAULT_CALENDAR_SETTINGS,
  );
  const [sharedIdentity, setSharedIdentity] = useState<SharedUserIdentity>({});

  useEffect(() => {
    if (!isLive || !uid) return;
    return subscribeCalendarSettings(uid, setCalendarSettings);
  }, [isLive, uid]);

  useEffect(() => {
    if (!isLive || !uid) {
      setSharedIdentity({});
      return;
    }

    void fetchSharedUserIdentity(uid)
      .then(setSharedIdentity)
      .catch((error) => {
        console.warn('Could not load shared user identity', error);
      });
  }, [isLive, uid]);

  const profile = useMemo<AppProfile>(() => {
    if (isLive && user) {
      return settingsToAppProfile(calendarSettings, user, sharedIdentity);
    }
    return localToAppProfile(localProfile);
  }, [calendarSettings, isLive, localProfile, sharedIdentity, user]);

  const updateProfile = useCallback(
    (patch: ProfilePatch) => {
      if (isLive && uid) {
        const nextSettings: CalendarSettings = {
          defaultPositionPreset:
            patch.defaultPositionPreset ?? calendarSettings.defaultPositionPreset,
          pitchArrivalMinutesBeforeKickoff:
            patch.pitchArrivalMinutesBeforeKickoff ??
            calendarSettings.pitchArrivalMinutesBeforeKickoff,
          airportArrivalMinutesBeforeFlight:
            patch.airportArrivalMinutesBeforeFlight ??
            calendarSettings.airportArrivalMinutesBeforeFlight,
          migratedFromLocalAt: calendarSettings.migratedFromLocalAt,
        };
        setCalendarSettings(nextSettings);
        void saveCalendarSettings(uid, nextSettings);
        return;
      }

      setLocalProfile((current) => {
        const next = { ...current, ...patch };
        saveProfile(next);
        return next;
      });
    },
    [calendarSettings, isLive, uid],
  );

  const value = useMemo(
    () => ({ profile, updateProfile }),
    [profile, updateProfile],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}
