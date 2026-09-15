import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBed,
  faCar,
  faPlane,
} from '@fortawesome/free-solid-svg-icons';
import {
  formatCardDate,
  formatCurrency,
  formatMatchTime,
  getMatchDisplayTitle,
} from '@/domain/matchDisplay';
import type { Match } from '@/domain/match';
import { routes } from '@/app/routes';
import { useProfile } from '@/features/profile/ProfileProvider';
import {
  buildMatchTimeline,
  hasFlightData,
  hasGroundData,
  hasLodgingData,
  hasMeaningfulTimeline,
} from '@/features/timeline/matchTimeline';
import { MatchTimeline } from '@/ui/MatchTimeline';

type Props = {
  match: Match;
  variant?: 'hero' | 'row';
  allowTimelineExpand?: boolean;
  embedded?: boolean;
  detailTo?: string;
};

function TeamLine({
  name,
  side,
}: {
  name: string;
  side: 'H' | 'A';
}) {
  return (
    <span className="rs-assignment__team">
      <span className="rs-assignment__ha" aria-hidden>({side})</span>
      <span className="rs-assignment__team-name">{name}</span>
    </span>
  );
}

export function MatchCard({
  match,
  variant = 'row',
  allowTimelineExpand = false,
  embedded = false,
  detailTo,
}: Props) {
  const { profile } = useProfile();
  const [timelineOpen, setTimelineOpen] = useState(false);
  const isTournamentChild = Boolean(match.tournamentId);
  const { month, day, weekday } = formatCardDate(match);
  const title = getMatchDisplayTitle(match);
  const home = match.home?.trim();
  const away = match.away?.trim();
  const pay =
    match.expectedPay != null
      ? formatCurrency(match.expectedPay, match.payCurrency)
      : null;
  const showTeams = Boolean(home || away);
  const showEventTitle = Boolean(match.title?.trim() && showTeams);
  const showTimeline =
    allowTimelineExpand && !isTournamentChild && hasMeaningfulTimeline(match);
  const timelineItems = showTimeline
    ? buildMatchTimeline(match, profile)
    : [];
  const hasHotel = !isTournamentChild && hasLodgingData(match);
  const hasFlight = !isTournamentChild && hasFlightData(match);
  const hasCar = !isTournamentChild && hasGroundData(match);

  const rowClass = [
    'rs-assignment',
    match.status === 'cancelled' ? 'rs-assignment--cancelled' : '',
    variant === 'hero' ? 'rs-assignment--hero' : '',
    timelineOpen ? 'rs-assignment--timeline-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const toggleTimeline = () => {
    setTimelineOpen((value) => !value);
  };

  const Wrapper = embedded ? 'div' : 'li';

  return (
    <Wrapper className="rs-assignment-wrap">
      <div className={rowClass}>
        <div className="rs-assignment__row">
          <Link className="rs-assignment__main" to={detailTo ?? routes.matchDetail(match.id)}>
            <div className="rs-assignment__date" aria-hidden>
              <span className="rs-assignment__month">{month}</span>
              <span className="rs-assignment__day">{day}</span>
              <span className="rs-assignment__weekday">{weekday}</span>
              <span className="rs-assignment__time">{formatMatchTime(match)}</span>
            </div>

            <div className="rs-assignment__content">
              <div className="rs-assignment__chips" aria-label="Role and pay">
                <span className="rs-pill rs-assignment__chip">{match.position}</span>
                {pay ? (
                  <span className="rs-pill rs-assignment__chip rs-assignment__chip--pay">
                    {pay}
                  </span>
                ) : null}
                {match.payStatus === 'unpaid' && match.status !== 'cancelled' ? (
                  <span className="rs-pill rs-pill--urgent rs-assignment__chip">
                    Unpaid
                  </span>
                ) : null}
                {match.payStatus === 'paid' && <span className="rs-pill rs-assignment__chip">Paid</span>}
                {match.payStatus === 'donated' ? (
                  <span className="rs-pill rs-assignment__chip">Donated</span>
                ) : null}
                {match.status === 'cancelled' ? (
                  <span className="rs-pill rs-pill--urgent rs-assignment__chip">
                    Cancelled
                  </span>
                ) : null}
              </div>

              {showEventTitle ? (
                <p className="rs-assignment__event-title">{match.title}</p>
              ) : null}

              {showTeams ? (
                <div
                  className="rs-assignment__teams"
                  aria-label={home && away ? `${home} vs ${away}` : title}
                >
                  {home ? <TeamLine name={home} side="H" /> : null}
                  {away ? <TeamLine name={away} side="A" /> : null}
                </div>
              ) : (
                <p className="rs-assignment__title">{title}</p>
              )}

              <p className="rs-assignment__venue">{match.location}</p>

              {(hasHotel || hasFlight || hasCar) && (
                <div className="rs-assignment__travel" aria-label="Travel">
                  {hasHotel ? (
                    <button
                      type="button"
                      className="rs-assignment__travel-link"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (showTimeline) toggleTimeline();
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
                        if (showTimeline) toggleTimeline();
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
                        if (showTimeline) toggleTimeline();
                      }}
                    >
                      <FontAwesomeIcon icon={faCar} aria-hidden />
                      Car
                    </button>
                  ) : null}
                </div>
              )}
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
          <div className="rs-assignment__timeline-panel" aria-label="Match timeline">
            <MatchTimeline items={timelineItems} />
          </div>
        ) : null}

      </div>
    </Wrapper>
  );
}
