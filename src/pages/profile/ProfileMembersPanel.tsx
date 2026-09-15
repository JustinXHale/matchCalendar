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
        <div
          className="rs-insight-table-scroll"
          role="region"
          aria-label="Match Calendar members"
          tabIndex={0}
        >
          <table className="rs-insight-table rs-member-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Signed up</th>
                <th scope="col">Calendar</th>
                <th scope="col">Matches</th>
                <th scope="col">Tournaments</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.uid}>
                  <th scope="row">{member.displayName}</th>
                  <td>{member.email ?? '—'}</td>
                  <td>{formatWhen(member.authCreatedAt)}</td>
                  <td>{formatWhen(member.calendarSeenAt)}</td>
                  <td>{member.matchCount}</td>
                  <td>{member.tournamentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
