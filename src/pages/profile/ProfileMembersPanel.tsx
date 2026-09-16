import { Button } from '@patternfly/react-core';
import type { PlatformInsightsResult } from '@/services/platformInsightsTypes';

type Props = {
  data: PlatformInsightsResult | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
};

function formatWhen(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatJoined(value: string | null): { date: string; time: string | null } {
  if (!value) return { date: '—', time: null };
  const joined = new Date(value);
  return {
    date: joined.toLocaleDateString(undefined, { dateStyle: 'medium' }),
    time: joined.toLocaleTimeString(undefined, { timeStyle: 'short' }),
  };
}

export function ProfileMembersPanel({ data, loading, error, onRefresh }: Props) {
  const members = data?.members ?? [];

  return (
    <div className="rs-stack">
      <div className="rs-profile-panel-header">
        <p className="rs-page-lede">
          {data
            ? `${data.memberCount} member${data.memberCount === 1 ? '' : 's'} with Match Calendar data`
            : 'Members who signed in and use Match Calendar'}
        </p>
        <Button
          variant="secondary"
          isDisabled={loading}
          onClick={() => void onRefresh()}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {error && <p className="rs-form-error" role="alert">{error}</p>}

      {loading && !data ? (
        <p className="rs-form-hint">Loading members…</p>
      ) : members.length ? (
        <ul className="rs-member-list" aria-label="Match Calendar members">
          {members.map((member) => {
            const joined = formatJoined(member.authCreatedAt);
            return (
              <li key={member.uid} className="rs-member-row">
                <div className="rs-member-row__identity">
                  <span className="rs-member-row__name">{member.displayName}</span>
                  {member.email && (
                    <span className="rs-member-row__email">{member.email}</span>
                  )}
                  <span className="rs-member-row__activity">
                    {member.matchCount} match{member.matchCount === 1 ? '' : 'es'}
                    {' · '}
                    {member.tournamentCount} tournament
                    {member.tournamentCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="rs-member-row__joined">
                  <span className="rs-member-row__date">{joined.date}</span>
                  {joined.time && (
                    <span className="rs-member-row__time">{joined.time}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rs-form-hint">No members yet.</p>
      )}

      {data?.generatedAt && (
        <p className="rs-detail-meta">
          Updated {formatWhen(data.generatedAt)}
        </p>
      )}
    </div>
  );
}
