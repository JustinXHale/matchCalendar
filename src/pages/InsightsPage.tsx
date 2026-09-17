import { createInsightsDemoData } from '@/demo/insightsDemoData';
import { useMemo, useState } from 'react';
import { useMatches } from '@/features/matches/useMatches';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { InsightsDateFilter } from '@/features/insights/InsightsDateFilter';
import {
  filterInsightsData,
  formatInsightsRangeLabel,
  isInsightsDateRangeActive,
  isValidInsightsDateRange,
  type InsightsDateRange,
} from '@/features/insights/insightsRange';
import { getInsightsSummary } from '@/features/insights/insightsSummary';
import { InsightsSummaryView } from '@/features/insights/InsightsSummaryView';
import { PageHeader } from '@/ui/PageHeader';

export function InsightsPage() {
  const { matches, isDemo } = useMatches();
  const { tournaments } = useTournamentsContext();
  const [dateRange, setDateRange] = useState<InsightsDateRange>({});
  const sample = useMemo(createInsightsDemoData, []);
  const sourceMatches = isDemo ? sample.matches : matches;
  const sourceTournaments = isDemo ? sample.tournaments : tournaments;
  const filtered = useMemo(
    () =>
      isInsightsDateRangeActive(dateRange) && isValidInsightsDateRange(dateRange)
        ? filterInsightsData(sourceMatches, sourceTournaments, dateRange)
        : { matches: sourceMatches, tournaments: sourceTournaments },
    [dateRange, sourceMatches, sourceTournaments],
  );
  const summary = useMemo(
    () => getInsightsSummary(filtered.matches, filtered.tournaments),
    [filtered],
  );
  const rangeLabel = formatInsightsRangeLabel(dateRange);

  return (
    <div className="rs-stack rs-insights-page">
      <PageHeader title="Insights" />
      <p className="rs-page-lede">
        Your events, travel, and money at a glance · {rangeLabel}
      </p>
      <InsightsDateFilter range={dateRange} onChange={setDateRange} />
      {summary.eventCount === 0 && isInsightsDateRangeActive(dateRange) && isValidInsightsDateRange(dateRange) ? (
        <div className="rs-placeholder-card">
          <p>No events fall within this date range.</p>
        </div>
      ) : null}
      <InsightsSummaryView summary={summary} />
    </div>
  );
}
