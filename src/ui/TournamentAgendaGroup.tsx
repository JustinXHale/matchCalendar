import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBed,
  faCar,
  faPlane,
} from '@fortawesome/free-solid-svg-icons';
import type { Match } from '@/domain/match';
import type { Tournament } from '@/domain/tournament';
import { formatIsoDateCard } from '@/domain/matchDisplay';
import { routes } from '@/app/routes';
import { backState, type BackNav } from '@/nav/backNav';
import { tournamentBack } from '@/nav/backDefaults';
import { useProfile } from '@/features/profile/ProfileProvider';
import { tournamentTimelineMatch } from '@/features/tournaments/tournamentEvent';
import {
  buildMatchTimeline,
  hasFlightData,
  hasGroundData,
  hasLodgingData,
  hasMeaningfulTimeline,
} from '@/features/timeline/matchTimeline';
import { MatchCard } from '@/ui/MatchCard';
import { MatchTimeline } from '@/ui/MatchTimeline';

type Props = {
  tournament: Tournament;
  matches: Match[];
  defaultExpanded?: boolean;
  allowTimelineExpand?: boolean;
  back?: BackNav;
};

export function TournamentAgendaGroup({
  tournament,
  matches,
  defaultExpanded = false,
  allowTimelineExpand = false,
  back,
}: Props) {
  const matchBackTarget = back ?? tournamentBack(tournament.id);
  const { profile } = useProfile();
  const [matchesExpanded, setMatchesExpanded] = useState(defaultExpanded);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const matchLabel = `${matches.length} match${matches.length === 1 ? '' : 'es'}`;
  const { month, day, weekday } = formatIsoDateCard(tournament.startDate);

  const timelineMatch = useMemo(
    () => tournamentTimelineMatch(tournament),
    [tournament],
  );
  const showTimeline =
    allowTimelineExpand && hasMeaningfulTimeline(timelineMatch);
  const timelineItems = showTimeline
    ? buildMatchTimeline(timelineMatch, profile)
    : [];
  const hasHotel = hasLodgingData(timelineMatch);
  const hasFlight = hasFlightData(timelineMatch);
  const hasCar = hasGroundData(timelineMatch);

  const assignmentClass = [
    'rs-assignment',
    timelineOpen ? 'rs-assignment--timeline-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const toggleTimeline = () => {
    setTimelineOpen((value) => !value);
  };

  return (
    <li className="rs-tournament-agenda-group">
      <div className={assignmentClass}>
        <div className="rs-assignment__row">
          <Link
            to={routes.tournamentDetail(tournament.id)}
            className="rs-assignment__main"
            state={back ? backState(back) : undefined}
          >
            <div className="rs-assignment__date" aria-hidden>
              <span className="rs-assignment__month">{month}</span>
              <span className="rs-assignment__day">{day}</span>
              <span className="rs-assignment__weekday">{weekday}</span>
            </div>

            <div className="rs-assignment__content">
              <div className="rs-assignment__chips">
                <span className="rs-pill rs-assignment__chip">Tournament</span>
              </div>

              <p className="rs-assignment__title">{tournament.title}</p>

              <p className="rs-assignment__venue">
                {tournament.startDate} — {tournament.endDate}
                {tournament.location ? `\n${tournament.location}` : ''}
              </p>

              {(hasHotel || hasFlight || hasCar) && showTimeline ? (
                <div className="rs-assignment__travel" aria-label="Travel">
                  {hasHotel ? (
                    <button
                      type="button"
                      className="rs-assignment__travel-link"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleTimeline();
                      }}
                    >
                      <FontAwesomeIcon icon={faBed} aria-hidden />
                      Hotel
                    </button>
                  ) : null}
                  {hasFlight ? (
                    <button
                      type="button"
                      className="rs-assignment__travel-link"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleTimeline();
                      }}
                    >
                      <FontAwesomeIcon icon={faPlane} aria-hidden />
                      Flight
                    </button>
                  ) : null}
                  {hasCar ? (
                    <button
                      type="button"
                      className="rs-assignment__travel-link"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleTimeline();
                      }}
                    >
                      <FontAwesomeIcon icon={faCar} aria-hidden />
                      Car
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Link>

          {showTimeline ? (
            <button
              type="button"
              className="rs-assignment__timeline-tab"
              aria-expanded={timelineOpen}
              aria-label={timelineOpen ? 'Hide timeline' : 'Show timeline'}
              onClick={toggleTimeline}
            >
              <span className="rs-assignment__timeline-tab-text">Timeline</span>
            </button>
          ) : null}
        </div>

        {timelineOpen && showTimeline ? (
          <div
            className="rs-assignment__timeline-panel"
            aria-label="Tournament timeline"
          >
            <MatchTimeline items={timelineItems} />
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="rs-tournament-agenda-group__toggle"
        aria-expanded={matchesExpanded}
        onClick={() => setMatchesExpanded((value) => !value)}
      >
        {matchesExpanded ? `Hide ${matchLabel}` : `Show ${matchLabel}`}
      </button>

      {matchesExpanded ? (
        <ul className="rs-list rs-tournament-agenda-group__matches">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              embedded
              back={matchBackTarget}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
