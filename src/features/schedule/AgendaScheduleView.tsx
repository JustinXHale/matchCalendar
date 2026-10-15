import { Button } from '@patternfly/react-core';
import { useLocation, useNavigate } from 'react-router-dom';
import { openQuickMatch } from '@/app/navigation';
import { groupAgendaMatches } from '@/features/matches/agendaGroups';
import { getUpcomingMatches } from '@/features/matches/matchQueries';
import { useMatches } from '@/features/matches/useMatches';
import { PastMatchesExpandable } from '@/features/schedule/PastMatchesExpandable';
import { splitAgendaNext } from '@/features/schedule/scheduleListItems';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { MatchCard } from '@/ui/MatchCard';
import { ScheduleItemList } from '@/ui/ScheduleItemList';
import { TournamentAgendaGroup } from '@/ui/TournamentAgendaGroup';
import { useI18n } from '@/i18n/I18nProvider';

export function AgendaScheduleView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { matches } = useMatches();
  const { getTournamentById } = useTournamentsContext();
  const { t } = useI18n();
  const upcoming = getUpcomingMatches(matches);
  const { next, rest } = splitAgendaNext(upcoming);
  const sections = groupAgendaMatches(rest);

  if (upcoming.length === 0) {
    return (
      <>
      <PastMatchesExpandable />
      <section className="rs-empty-state" aria-label={t('schedule.noMatchesYet')}>
        <h2 className="rs-empty-state__title">{t('schedule.noMatchesYet')}</h2>
        <p className="rs-empty-state__text">
          {t('schedule.addFirst')}
        </p>
        <Button
          variant="primary"
          isBlock
          onClick={() => openQuickMatch(navigate, location)}
        >
          {t('common.quickMatch')}
        </Button>
      </section>
      </>
    );
  }

  return (
    <>
      <PastMatchesExpandable />
      {next && (
        <section aria-label={t('schedule.nextMatch')}>
          <h2 className="rs-section-label">{t('schedule.nextMatch')}</h2>
          {next.type === 'match' ? (
            <ul className="rs-list">
              <MatchCard match={next.match} variant="hero" allowTimelineExpand />
            </ul>
          ) : (
            <ul className="rs-list">
              {(() => {
                const tournament = getTournamentById(next.tournamentId);
                if (!tournament) {
                  return next.matches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      variant="hero"
                      allowTimelineExpand
                    />
                  ));
                }

                return (
                  <TournamentAgendaGroup
                    tournament={tournament}
                    matches={next.matches}
                    defaultExpanded
                    allowTimelineExpand
                  />
                );
              })()}
            </ul>
          )}
        </section>
      )}

      {sections.map((section) => {
        const sectionLabel = t(`schedule.${section.key}` as 'schedule.today');
        return (
        <section key={section.key} aria-label={sectionLabel}>
          <h2 className="rs-section-label">{sectionLabel}</h2>
          <ScheduleItemList
            matches={section.matches}
            getTournamentById={getTournamentById}
            allowTimelineExpand
          />
        </section>
      );})}

      <div className="rs-agenda-quick-match">
        <Button
          variant="secondary"
          isBlock
          onClick={() => openQuickMatch(navigate, location)}
        >
          {t('common.quickMatch')}
        </Button>
      </div>
    </>
  );
}
