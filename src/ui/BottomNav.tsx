import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faChartLine,
  faDollarSign,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { routes } from '@/app/routes';
import { countNeedsClosureMatches } from '@/features/matches/matchQueries';
import { useMatches } from '@/features/matches/useMatches';
import { AddAction } from '@/ui/AddAction';

const navIconClass = 'rs-bottom-nav__icon';

const items = [
  {
    to: routes.schedule,
    label: 'Schedule',
    icon: (
      <FontAwesomeIcon icon={faCalendarDays} className={navIconClass} aria-hidden />
    ),
    isActive: (pathname: string) =>
      pathname === routes.schedule ||
      pathname.startsWith(routes.agenda) ||
      pathname.startsWith(routes.calendar),
  },
  {
    to: routes.money,
    label: 'Money',
    icon: (
      <FontAwesomeIcon icon={faDollarSign} className={navIconClass} aria-hidden />
    ),
    isActive: (pathname: string) =>
      pathname.startsWith(routes.money) ||
      pathname.startsWith(routes.history),
  },
  {
    to: routes.insights,
    label: 'Insights',
    icon: (
      <FontAwesomeIcon icon={faChartLine} className={navIconClass} aria-hidden />
    ),
    isActive: (pathname: string) => pathname.startsWith(routes.insights),
  },
  {
    to: routes.profile,
    label: 'Profile',
    icon: <FontAwesomeIcon icon={faUser} className={navIconClass} aria-hidden />,
    isActive: (pathname: string) =>
      pathname.startsWith(routes.profile) || pathname.startsWith(routes.about),
  },
];

export function BottomNav() {
  const location = useLocation();
  const { matches } = useMatches();
  const needsClosureCount = countNeedsClosureMatches(matches);
  const left = items.slice(0, 2);
  const right = items.slice(2);

  return (
    <nav className="rs-bottom-nav" aria-label="Primary">
      {left.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={() =>
            item.isActive(location.pathname) ? 'active' : undefined
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
      <AddAction />
      {right.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={() =>
            item.isActive(location.pathname) ? 'active' : undefined
          }
        >
          {item.icon}
          <span>{item.label}</span>
          {item.to === routes.money && needsClosureCount > 0 ? (
            <span className="rs-bottom-nav__badge" aria-label={`${needsClosureCount} matches need settlement`}>
              {needsClosureCount}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}
