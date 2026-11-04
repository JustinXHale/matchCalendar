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
import { dateKeyInTimezone } from '@/domain/matchTimezone';
import { routes } from '@/app/routes';
import { backState, type BackNav } from '@/nav/backNav';
import { tournamentBack } from '@/nav/backDefaults';
import { useProfile } from '@/features/profile/ProfileProvider';
import { flightExpandCardTitle } from '@/features/matches/flightDistance';
import { tournamentTimelineMatch } from '@/features/tournaments/tournamentEvent';
import {
  buildTournamentTimeline,
  TOURNAMENT_BOUNDARY_IDS,
} from '@/features/tournaments/tournamentTimeline';
import {
  hasFlightData,
  hasGroundData,
  hasLodgingData,
  hasMeaningfulTimeline,
} from '@/features/timeline/matchTimeline';
import { MatchCard } from '@/ui/MatchCard';
import { MatchTimeline } from '@/ui/MatchTimeline';
import { AssignmentChips } from '@/ui/AssignmentChips';
import { useI18n } from '@/i18n/I18nProvider';

type Props = {
  tournament: Tournament;
  matches: Match[];
  defaultExpanded?: boolean;
  allowTimelineExpand?: boolean;
  back?: BackNav;
};

function formatShortDate(date: string, locale?: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

export function TournamentAgendaGroup({
  tournament,
  matches,
  defaultExpanded = false,
  allowTimelineExpand = false,
  back,
}: Props) {
  const matchBackTarget = back ?? tournamentBack(tournament.id);
  const { profile } = useProfile();
  const { locale, t } = useI18n();
  const [matchesExpanded, setMatchesExpanded] = useState(defaultExpanded);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const matchLabel = matches.length === 1
    ? t('calendar.oneMatch')
    : t('calendar.matchCount', { count: matches.length });
  const { month, day, weekday } = formatIsoDateCard(tournament.startDate, locale);

  const timelineMatch = useMemo(
    () => tournamentTimelineMatch(tournament),
    [tournament],
  );
  const showTimeline =
    allowTimelineExpand && hasMeaningfulTimeline(timelineMatch);
  const timelineItems = showTimeline
    ? buildTournamentTimeline(tournament, profile)
    : [];
  const firstTravelItem = timelineItems.find(
    (item) => !TOURNAMENT_BOUNDARY_IDS.has(item.id),
  );
  const travelStartDate = firstTravelItem
    ? firstTravelItem.precision === 'date' && firstTravelItem.dateKey
      ? firstTravelItem.dateKey
      : dateKeyInTimezone(firstTravelItem.at, profile.homeTimezone)
    : undefined;
  const hasHotel = hasLodgingData(timelineMatch);
  const hasFlight = hasFlightData(timelineMatch);
  const hasCar = hasGroundData(timelineMatch);
  const flightLabel = flightExpandCardTitle(timelineMatch.flight);

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
              <AssignmentChips
                match={timelineMatch}
                primaryLabel={t('tournaments.item')}
              />

              <p className="rs-assignment__title">{tournament.title}</p>

              <p className="rs-assignment__venue">
                {tournament.startDate} — {tournament.endDate}
                {tournament.location ? `\n${tournament.location}` : ''}
                {travelStartDate && travelStartDate < tournament.startDate
                  ? `\nTravel begins ${formatShortDate(travelStartDate, locale)}`
                  : ''}
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
                      {flightLabel}
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
            <MatchTimeline
              items={timelineItems}
              timeZone={profile.homeTimezone}
              venueTimeZone={timelineMatch.timezone}
            />
          </div>
        ) : null}
      </div>

      {matches.length > 0 ? (
        <button
          type="button"
          className="rs-tournament-agenda-group__toggle"
          aria-expanded={matchesExpanded}
          onClick={() => setMatchesExpanded((value) => !value)}
        >
          {matchesExpanded ? `Hide ${matchLabel}` : `Show ${matchLabel}`}
        </button>
      ) : null}

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
