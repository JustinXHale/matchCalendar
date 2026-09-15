import { Button } from '@patternfly/react-core';
import { InsightsSummaryView } from '@/features/insights/InsightsSummaryView';
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

export function ProfilePlatformInsightsPanel({
  data,
  loading,
  error,
  onRefresh,
}: Props) {
  return (
    <div className="rs-stack rs-insights-page">
      <div className="rs-profile-panel-header">
        <p className="rs-page-lede">
          All members · aggregated schedule, travel, and money
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
        <p className="rs-form-hint">Loading platform insights…</p>
      ) : data ? (
        <>
          <p className="rs-detail-meta">
            Across {data.memberCount} member{data.memberCount === 1 ? '' : 's'} ·
            updated {formatWhen(data.generatedAt)}
          </p>
          <InsightsSummaryView summary={data.insights} idPrefix="platform-insights" />
        </>
      ) : null}
    </div>
  );
}
