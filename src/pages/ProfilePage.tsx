import { Button, FormGroup, TextInput } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/app/routes';
import { POSITION_OPTIONS } from '@/domain/matchConstants';
import type { PositionPreset } from '@/domain/match';
import { useDemoMode } from '@/demo/DemoModeContext';
import { accountDeletionErrorMessage } from '@/services/auth';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMatchesContext } from '@/features/matches/MatchesProvider';
import { useMatches } from '@/features/matches/useMatches';
import { useProfile } from '@/features/profile/ProfileProvider';
import {
  clearLocalAppData,
  deleteMatchCalendarData,
  deleteUserProfileAndAccount,
} from '@/services/accountDeletion';
import { DangerConfirmModal } from '@/ui/DangerConfirmModal';
import { PageHeader } from '@/ui/PageHeader';
import { ProfileAvatar } from '@/ui/ProfileAvatar';

type DeleteModalKind = 'calendar-data' | 'account' | null;

function MinutesBeforeInput({
  id,
  minutes,
  onCommit,
}: {
  id: string;
  minutes: number;
  onCommit: (minutes: number) => void;
}) {
  const [draft, setDraft] = useState(() => String(minutes));

  useEffect(() => {
    setDraft(String(minutes));
  }, [minutes]);

  const commit = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setDraft(String(minutes));
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setDraft(String(minutes));
      return;
    }

    onCommit(parsed);
    setDraft(String(parsed));
  };

  return (
    <TextInput
      id={id}
      type="number"
      inputMode="numeric"
      min={0}
      value={draft}
      onChange={(_event, value) => setDraft(value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
      }}
    />
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { replaceAllMatches } = useMatchesContext();
  const { matches, matchReadySyncing, matchReadyLastSyncedAt, syncMatchReady } =
    useMatches();
  const { isDemoMode, disableDemoMode } = useDemoMode();
  const [deleteModal, setDeleteModal] = useState<DeleteModalKind>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
      <PageHeader title="Profile" />
      <div className="rs-detail-card">
        {profile.isLive ? (
          <p className="rs-form-hint">
            Signed in — your schedule syncs to your account.
          </p>
        ) : (
          <p className="rs-form-hint">
            {isDemoMode
              ? 'Demo preview — sample data only.'
              : 'Local mode — your data stays in this browser until you sign in.'}
          </p>
        )}

        <ProfileAvatar
          displayName={profile.displayName}
          photoUrl={profile.photoUrl}
          size="md"
        />

        {profile.isLive ? (
          <>
            <p className="rs-detail-card__primary">{profile.displayName}</p>
            {profile.email && <p className="rs-detail-meta">{profile.email}</p>}
          </>
        ) : (
          <FormGroup label="Display name" fieldId="profile-name">
            <TextInput
              id="profile-name"
              value={profile.displayName}
              onChange={(_event, value) => updateProfile({ displayName: value })}
            />
          </FormGroup>
        )}

        <FormGroup label="Default position" fieldId="profile-position">
          <select
            id="profile-position"
            className="rs-select"
            value={profile.defaultPositionPreset}
            onChange={(event) =>
              updateProfile({
                defaultPositionPreset: event.target.value as PositionPreset,
              })
            }
          >
            {POSITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormGroup>

        <div className="rs-form-row">
          <FormGroup
            label="Arrive at pitch (min before kickoff)"
            fieldId="profile-arrival"
          >
            <MinutesBeforeInput
              id="profile-arrival"
              minutes={profile.pitchArrivalMinutesBeforeKickoff}
              onCommit={(pitchArrivalMinutesBeforeKickoff) =>
                updateProfile({ pitchArrivalMinutesBeforeKickoff })
              }
            />
          </FormGroup>
          <FormGroup
            label="Arrive at airport (min before flight)"
            fieldId="profile-airport-arrival"
          >
            <MinutesBeforeInput
              id="profile-airport-arrival"
              minutes={profile.airportArrivalMinutesBeforeFlight}
              onCommit={(airportArrivalMinutesBeforeFlight) =>
                updateProfile({ airportArrivalMinutesBeforeFlight })
              }
            />
          </FormGroup>
        </div>
      </div>

      {profile.isLive && (
        <section className="rs-form-section">
          <h2 className="rs-form-section-title">MatchReadyTX</h2>
          <p className="rs-form-hint">
            Import confirmed assignments from MatchReadyTX into your personal
            calendar. Notes, pay status, travel, and expenses you add here are
            never overwritten.
          </p>
          {matchReadyLastSyncedAt && (
            <p className="rs-detail-meta">
              Last synced{' '}
              {new Date(matchReadyLastSyncedAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
          <Button
            variant="secondary"
            isBlock
            isDisabled={matchReadySyncing}
            onClick={() => void syncMatchReady(true)}
          >
            {matchReadySyncing ? 'Syncing MatchReady…' : 'Sync MatchReady now'}
          </Button>
        </section>
      )}

      {profile.isLive && (
        <section className="rs-form-section">
          <h2 className="rs-form-section-title">Account</h2>
          <p className="rs-form-hint">
            You sign in with the same Google or Apple account used for
            MatchReadyTX. Match Calendar stores your personal schedule separately
            under your user record.
          </p>
          <Button variant="secondary" isBlock onClick={() => void handleSignOut()}>
            Sign out
          </Button>
        </section>
      )}

      {profile.isLive && (
        <section className="rs-form-section">
          <h2 className="rs-form-section-title">Your data</h2>
          <p className="rs-form-hint">
            Permanently delete your Match Calendar matches, tournaments, and
            preferences from Firestore. Your sign-in and MatchReadyTX profile stay
            intact.
          </p>
          <Button
            variant="danger"
            isBlock
            onClick={() => {
              setDeleteError(null);
              setDeleteModal('calendar-data');
            }}
          >
            Delete my Match Calendar data
          </Button>
        </section>
      )}

      {profile.isLive && (
        <section className="rs-form-section">
          <h2 className="rs-form-section-title">Delete account</h2>
          <p className="rs-form-hint">
            Permanently delete your shared profile document, all Match Calendar
            data, and your Firebase sign-in for this project. MatchReadyTX org
            membership and assignment history may still exist until removed there.
          </p>
          <Button
            variant="danger"
            isBlock
            onClick={() => {
              setDeleteError(null);
              setDeleteModal('account');
            }}
          >
            Delete my profile &amp; account
          </Button>
        </section>
      )}

      {!profile.isLive && (
        <section className="rs-form-section">
          <h2 className="rs-form-section-title">Data</h2>
          <p className="rs-form-hint">
            {matches.length} match{matches.length === 1 ? '' : 'es'} stored locally.
          </p>
          <Button variant="danger" isBlock onClick={clearData}>
            Clear all local data
          </Button>
        </section>
      )}

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
