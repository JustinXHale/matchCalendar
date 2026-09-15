import { Button, FormGroup, TextInput } from '@patternfly/react-core';
import { Link, useNavigate } from 'react-router-dom';
import { routes } from '@/app/routes';
import { POSITION_OPTIONS } from '@/domain/matchConstants';
import type { PositionPreset } from '@/domain/match';
import { createDemoMatches } from '@/demo/demoMatches';
import { useDemoMode } from '@/demo/DemoModeContext';
import { useAuth } from '@/features/auth/AuthProvider';
import { useMatchesContext } from '@/features/matches/MatchesProvider';
import { useProfile } from '@/features/profile/ProfileProvider';
import { PageHeader } from '@/ui/PageHeader';
import { ProfileAvatar } from '@/ui/ProfileAvatar';

export function ProfilePage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { replaceAllMatches, matches } = useMatchesContext();
  const { isDemoMode, enableDemoMode, disableDemoMode } = useDemoMode();

  const loadSampleData = () => {
    replaceAllMatches(createDemoMatches());
    disableDemoMode();
  };

  const clearData = () => {
    replaceAllMatches([]);
    disableDemoMode();
  };

  const handleSignOut = async () => {
    disableDemoMode();
    await signOut();
    navigate(routes.login, { replace: true });
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
        <FormGroup
          label="Arrive at pitch (minutes before kickoff)"
          fieldId="profile-arrival"
        >
          <TextInput
            id="profile-arrival"
            type="number"
            inputMode="numeric"
            value={String(profile.pitchArrivalMinutesBeforeKickoff)}
            onChange={(_event, value) =>
              updateProfile({
                pitchArrivalMinutesBeforeKickoff: Number(value) || 60,
              })
            }
          />
        </FormGroup>
        <FormGroup
          label="Arrive at airport (minutes before first flight)"
          fieldId="profile-airport-arrival"
        >
          <TextInput
            id="profile-airport-arrival"
            type="number"
            inputMode="numeric"
            value={String(profile.airportArrivalMinutesBeforeFlight)}
            onChange={(_event, value) =>
              updateProfile({
                airportArrivalMinutesBeforeFlight: Number(value) || 120,
              })
            }
          />
        </FormGroup>
        <p className="rs-detail-meta">
          <Link to={routes.about}>About Match Calendar</Link>
        </p>
      </div>

      {profile.isLive && (
        <section className="rs-form-section">
          <h2 className="rs-form-section-title">Account</h2>
          <Button variant="secondary" isBlock onClick={() => void handleSignOut()}>
            Sign out
          </Button>
        </section>
      )}

      {!profile.isLive && (
        <section className="rs-form-section">
          <h2 className="rs-form-section-title">Data</h2>
          <p className="rs-form-hint">
            {matches.length} match{matches.length === 1 ? '' : 'es'} stored locally.
          </p>
          <div className="rs-form-actions">
            <Button variant="secondary" isBlock onClick={loadSampleData}>
              Load sample matches
            </Button>
            <Button variant="danger" isBlock onClick={clearData}>
              Clear all matches
            </Button>
          </div>
        </section>
      )}

      <section className="rs-form-section">
        <h2 className="rs-form-section-title">Preview</h2>
        <p className="rs-form-hint">
          Demo mode shows read-only sample data without changing your saved matches.
        </p>
        <Button
          variant="secondary"
          isBlock
          onClick={() =>
            isDemoMode ? disableDemoMode() : enableDemoMode()
          }
        >
          {isDemoMode ? 'Exit demo preview' : 'Preview demo data'}
        </Button>
      </section>
    </div>
  );
}
