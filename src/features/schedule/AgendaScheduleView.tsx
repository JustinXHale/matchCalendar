import { Button } from '@patternfly/react-core';
import { useLocation, useNavigate } from 'react-router-dom';
import { openQuickMatch } from '@/app/navigation';
import { groupAgendaMatches } from '@/features/matches/agendaGroups';
import { getUpcomingMatches } from '@/features/matches/matchQueries';
import { useMatches } from '@/features/matches/useMatches';
import { splitAgendaNext } from '@/features/schedule/scheduleListItems';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { MatchCard } from '@/ui/MatchCard';
import { ScheduleItemList } from '@/ui/ScheduleItemList';
import { TournamentAgendaGroup } from '@/ui/TournamentAgendaGroup';

export function AgendaScheduleView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { matches } = useMatches();
  const { getTournamentById } = useTournamentsContext();
  const upcoming = getUpcomingMatches(matches);
  const { next, rest } = splitAgendaNext(upcoming);
  const sections = groupAgendaMatches(rest);

  if (upcoming.length === 0) {
    return (
      <section className="rs-empty-state" aria-label="No matches yet">
        <h2 className="rs-empty-state__title">No matches yet</h2>
        <p className="rs-empty-state__text">
          Add your first match and keep the important details in one place.
        </p>
        <Button
          variant="primary"
          isBlock
          onClick={() => openQuickMatch(navigate, location)}
        >
          Quick Match
        </Button>
      </section>
    );
  }

  return (
    <>
      {next && (
        <section aria-label="Next match">
          <h2 className="rs-section-label">Next match</h2>
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

      {sections.map((section) => (
        <section key={section.key} aria-label={section.label}>
          <h2 className="rs-section-label">{section.label}</h2>
          <ScheduleItemList
            matches={section.matches}
            getTournamentById={getTournamentById}
            allowTimelineExpand
          />
        </section>
      ))}

      <div className="rs-agenda-quick-match">
        <Button
          variant="secondary"
          isBlock
          onClick={() => openQuickMatch(navigate, location)}
        >
          Quick Match
        </Button>
      </div>
    </>
  );
}
