import { Button, FormGroup } from '@patternfly/react-core';
import { FormTextInput } from '@/ui/forms/FormTextInput';
import { useEffect, useState } from 'react';
import { POSITION_OPTIONS } from '@/domain/matchConstants';
import type { PositionPreset } from '@/domain/match';
import { useDemoMode } from '@/demo/DemoModeContext';
import { useMatches } from '@/features/matches/useMatches';
import { useProfile } from '@/features/profile/ProfileProvider';
import { ExpandableFormCard } from '@/ui/forms/ExpandableFormCard';
import { ProfileAvatar } from '@/ui/ProfileAvatar';

type Props = {
  onDeleteCalendarData: () => void;
  onDeleteAccount: () => void;
  onSignOut: () => void;
  onClearLocalData: () => void;
};

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
    <FormTextInput
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

export function ProfileSettingsPanel({
  onDeleteCalendarData,
  onDeleteAccount,
  onSignOut,
  onClearLocalData,
}: Props) {
  const { profile, updateProfile } = useProfile();
  const { matches, matchReadySyncing, matchReadyLastSyncedAt, syncMatchReady } =
    useMatches();
  const { isDemoMode } = useDemoMode();

  return (
    <>
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
            <FormTextInput
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
          <Button variant="secondary" isBlock onClick={() => void onSignOut()}>
            Sign out
          </Button>
        </section>
      )}

      {profile.isLive ? (
        <ExpandableFormCard
          title="Deletion"
          summary="Remove Calendar data or account"
        >
          <div className="rs-form-stack">
            <div className="rs-form-stack rs-form-stack--compact">
              <p className="rs-form-hint">
                Remove your matches, tournaments, and preferences. Your sign-in
                and MatchReadyTX profile stay intact.
              </p>
              <Button variant="danger" isBlock onClick={onDeleteCalendarData}>
                Delete my Match Calendar data
              </Button>
            </div>
            <div className="rs-form-stack rs-form-stack--compact">
              <p className="rs-form-hint">
                Also removes your shared profile document and Firebase sign-in
                for this project. MatchReadyTX org data may still exist until
                removed there.
              </p>
              <Button variant="danger" isBlock onClick={onDeleteAccount}>
                Delete my profile &amp; account
              </Button>
            </div>
          </div>
        </ExpandableFormCard>
      ) : (
        <ExpandableFormCard
          title="Local data"
          summary={`${matches.length} match${matches.length === 1 ? '' : 'es'} on this device`}
        >
          <div className="rs-form-stack rs-form-stack--compact">
            <p className="rs-form-hint">
              Clear matches and preferences stored in this browser only.
            </p>
            <Button variant="danger" isBlock onClick={onClearLocalData}>
              Clear all local data
            </Button>
          </div>
        </ExpandableFormCard>
      )}
    </>
  );
}
