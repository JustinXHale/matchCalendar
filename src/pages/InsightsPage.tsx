import { createInsightsDemoData } from '@/demo/insightsDemoData';
import { useMemo } from 'react';
import { useMatches } from '@/features/matches/useMatches';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { getInsightsSummary } from '@/features/insights/insightsSummary';
import { InsightsSummaryView } from '@/features/insights/InsightsSummaryView';
import { PageHeader } from '@/ui/PageHeader';

export function InsightsPage() {
  const { matches, isDemo } = useMatches();
  const { tournaments } = useTournamentsContext();
  const sample = useMemo(createInsightsDemoData, []);
  const summary = useMemo(
    () =>
      isDemo
        ? getInsightsSummary(sample.matches, sample.tournaments)
        : getInsightsSummary(matches, tournaments),
    [matches, tournaments, isDemo, sample],
  );

  return (
    <div className="rs-stack rs-insights-page">
      <PageHeader title="Insights" />
      <p className="rs-page-lede">Your events, travel, and money at a glance · All time</p>
      <InsightsSummaryView summary={summary} />
    </div>
  );
}
