import { useMemo } from 'react';
import { getHistoryMatches } from '@/features/matches/matchQueries';
import { useMatches } from '@/features/matches/useMatches';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { ExpandableFormCard } from '@/ui/forms/ExpandableFormCard';
import { ScheduleItemList } from '@/ui/ScheduleItemList';
import { useI18n } from '@/i18n/I18nProvider';

export function PastMatchesExpandable() {
  const { matches } = useMatches();
  const { getTournamentById } = useTournamentsContext();
  const { t } = useI18n();
  const pastMatches = useMemo(() => getHistoryMatches(matches), [matches]);

  if (pastMatches.length === 0) {
    return null;
  }

  const summary = pastMatches.length === 1
    ? t('schedule.oneGame')
    : t('schedule.gameCount', { count: pastMatches.length });

  return (
    <ExpandableFormCard title={t('schedule.pastGames')} summary={summary}>
      <ScheduleItemList
        matches={pastMatches}
        getTournamentById={getTournamentById}
        allowTimelineExpand
      />
    </ExpandableFormCard>
  );
}
