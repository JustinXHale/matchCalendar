import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { routes } from '@/app/routes';
import { useDemoMode } from '@/demo/DemoModeContext';
import { accountDeletionErrorMessage } from '@/services/auth';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMatchesContext } from '@/features/matches/MatchesProvider';
import { useProfile } from '@/features/profile/ProfileProvider';
import { isPlatformAdmin } from '@/features/platform/platformAdmin';
import {
  clearLocalAppData,
  deleteMatchCalendarData,
  deleteUserProfileAndAccount,
} from '@/services/accountDeletion';
import {
  fetchPlatformInsights,
  platformInsightsErrorMessage,
} from '@/services/platformInsights';
import type { PlatformInsightsResult } from '@/services/platformInsightsTypes';
import { DangerConfirmModal } from '@/ui/DangerConfirmModal';
import { PageHeader } from '@/ui/PageHeader';
import {
  ProfileSectionTabs,
  type ProfileSectionTab,
} from '@/ui/ProfileSectionTabs';
import { ProfileMembersPanel } from '@/pages/profile/ProfileMembersPanel';
import { ProfilePlatformInsightsPanel } from '@/pages/profile/ProfilePlatformInsightsPanel';
import { ProfileSettingsPanel } from '@/pages/profile/ProfileSettingsPanel';

type DeleteModalKind = 'calendar-data' | 'account' | null;

const PROFILE_PANEL_ID = 'profile-section-panel';

function resolveTab(
  raw: string | null,
  showAdminTabs: boolean,
): ProfileSectionTab {
  if (!showAdminTabs) return 'profile';
  if (raw === 'members' || raw === 'insights') return raw;
  return 'profile';
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { replaceAllMatches } = useMatchesContext();
  const { disableDemoMode } = useDemoMode();
  const [deleteModal, setDeleteModal] = useState<DeleteModalKind>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [platformData, setPlatformData] = useState<PlatformInsightsResult | null>(
    null,
  );
  const [platformLoading, setPlatformLoading] = useState(false);
  const [platformError, setPlatformError] = useState<string | null>(null);

  const showAdminTabs = isPlatformAdmin(
    user?.uid,
    user?.email ?? profile.email,
  );
  const tab = resolveTab(searchParams.get('tab'), showAdminTabs);

  const tabOptions = useMemo(
    () =>
      showAdminTabs
        ? [
            { key: 'profile' as const, label: 'Profile' },
            { key: 'members' as const, label: 'Members' },
            { key: 'insights' as const, label: 'Insights' },
          ]
        : [{ key: 'profile' as const, label: 'Profile' }],
    [showAdminTabs],
  );

  const setTab = (nextTab: ProfileSectionTab) => {
    if (nextTab === 'profile') {
      setSearchParams({}, { replace: true });
      return;
    }
    setSearchParams({ tab: nextTab }, { replace: true });
  };

  const loadPlatformData = useCallback(async () => {
    if (!showAdminTabs || !profile.isLive) return;

    setPlatformLoading(true);
    setPlatformError(null);

    try {
      const result = await fetchPlatformInsights();
      setPlatformData(result);
    } catch (err) {
      setPlatformError(platformInsightsErrorMessage(err));
    } finally {
      setPlatformLoading(false);
    }
  }, [profile.isLive, showAdminTabs]);

  useEffect(() => {
    if (tab === 'profile' || !showAdminTabs || !profile.isLive) return;
    if (platformData || platformLoading) return;
    void loadPlatformData();
  }, [tab, showAdminTabs, profile.isLive, platformData, platformLoading, loadPlatformData]);

  const clearData = () => {
    clearLocalAppData();
    replaceAllMatches([]);
    disableDemoMode();
  };

  const handleSignOut = async () => {
    disableDemoMode();
    await signOut();
    navigate(routes.login, { replace: true });
  };

  const closeDeleteModal = () => {
    if (deleteBusy) return;
    setDeleteModal(null);
    setDeleteError(null);
  };

  const runDeleteCalendarData = async () => {
    if (!user) return;

    setDeleteBusy(true);
    setDeleteError(null);

    try {
      await deleteMatchCalendarData(user.uid);
      clearLocalAppData();
      replaceAllMatches([]);
      disableDemoMode();
      setDeleteModal(null);
      navigate(routes.schedule, { replace: true });
    } catch (err) {
      setDeleteError(accountDeletionErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  const runDeleteAccount = async () => {
    if (!user) return;

    setDeleteBusy(true);
    setDeleteError(null);

    try {
      await deleteUserProfileAndAccount(user.uid);
      disableDemoMode();
      setDeleteModal(null);
      navigate(routes.login, { replace: true });
    } catch (err) {
      setDeleteError(accountDeletionErrorMessage(err));
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <div className="rs-stack">
      <PageHeader
        title="Profile"
        actions={
          tabOptions.length > 1 ? (
            <ProfileSectionTabs
              tab={tab}
              options={tabOptions}
              onChange={setTab}
              panelId={PROFILE_PANEL_ID}
            />
          ) : undefined
        }
      />

      <div
        id={PROFILE_PANEL_ID}
        role="tabpanel"
        tabIndex={-1}
        className="rs-profile-panel"
      >
        {tab === 'profile' && (
          <ProfileSettingsPanel
            onDeleteCalendarData={() => {
              setDeleteError(null);
              setDeleteModal('calendar-data');
            }}
            onDeleteAccount={() => {
              setDeleteError(null);
              setDeleteModal('account');
            }}
            onSignOut={() => void handleSignOut()}
            onClearLocalData={clearData}
          />
        )}

        {tab === 'members' && showAdminTabs && (
          <ProfileMembersPanel
            data={platformData}
            loading={platformLoading}
            error={platformError}
            onRefresh={loadPlatformData}
          />
        )}

        {tab === 'insights' && showAdminTabs && (
          <ProfilePlatformInsightsPanel
            data={platformData}
            loading={platformLoading}
            error={platformError}
            onRefresh={loadPlatformData}
          />
        )}
      </div>

      <DangerConfirmModal
        isOpen={deleteModal === 'calendar-data'}
        title="Delete Match Calendar data?"
        description="This removes every match, tournament, and Calendar preference stored for your account. It cannot be undone."
        confirmLabel="Delete Calendar data"
        isBusy={deleteBusy}
        error={deleteError}
        onClose={closeDeleteModal}
        onConfirm={() => void runDeleteCalendarData()}
      />

      <DangerConfirmModal
        isOpen={deleteModal === 'account'}
        title="Delete profile and account?"
        description="This removes your Match Calendar data, your users profile document in Firestore, and your Google or Apple sign-in for this Firebase project. MatchReadyTX league data is not removed automatically."
        confirmLabel="Delete profile and account"
        typedConfirmPhrase="DELETE"
        isBusy={deleteBusy}
        error={deleteError}
        onClose={closeDeleteModal}
        onConfirm={() => void runDeleteAccount()}
      />
    </div>
  );
}
