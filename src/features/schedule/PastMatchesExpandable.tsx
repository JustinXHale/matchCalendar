import { useMemo } from 'react';
import { getHistoryMatches } from '@/features/matches/matchQueries';
import { useMatches } from '@/features/matches/useMatches';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { ExpandableFormCard } from '@/ui/forms/ExpandableFormCard';
import { ScheduleItemList } from '@/ui/ScheduleItemList';

export function PastMatchesExpandable() {
  const { matches } = useMatches();
  const { getTournamentById } = useTournamentsContext();
  const pastMatches = useMemo(() => getHistoryMatches(matches), [matches]);

  if (pastMatches.length === 0) {
    return null;
  }

  const summary = `${pastMatches.length} game${pastMatches.length === 1 ? '' : 's'}`;

  return (
    <ExpandableFormCard title="Past games" summary={summary}>
      <ScheduleItemList
        matches={pastMatches}
        getTournamentById={getTournamentById}
        allowTimelineExpand
      />
    </ExpandableFormCard>
  );
}
