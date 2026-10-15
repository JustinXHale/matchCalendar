import { NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faChartLine,
  faCircleInfo,
  faDollarSign,
} from '@fortawesome/free-solid-svg-icons';
import { routes } from '@/app/routes';
import { countNeedsClosureMatches } from '@/features/matches/matchQueries';
import { useMatches } from '@/features/matches/useMatches';
import { AddAction } from '@/ui/AddAction';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translations';

const navIconClass = 'rs-bottom-nav__icon';

const items = [
  {
    to: routes.schedule,
    label: 'nav.schedule' as TranslationKey,
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
    label: 'nav.money' as TranslationKey,
    icon: (
      <FontAwesomeIcon icon={faDollarSign} className={navIconClass} aria-hidden />
    ),
    isActive: (pathname: string) =>
      pathname.startsWith(routes.money) ||
      pathname.startsWith(routes.history),
  },
  {
    to: routes.insights,
    label: 'nav.insights' as TranslationKey,
    icon: (
      <FontAwesomeIcon icon={faChartLine} className={navIconClass} aria-hidden />
    ),
    isActive: (pathname: string) => pathname.startsWith(routes.insights),
  },
  {
    to: routes.about,
    label: 'nav.about' as TranslationKey,
    icon: (
      <FontAwesomeIcon icon={faCircleInfo} className={navIconClass} aria-hidden />
    ),
    isActive: (pathname: string) => pathname.startsWith(routes.about),
  },
];

export function BottomNav() {
  const location = useLocation();
  const { matches } = useMatches();
  const { t } = useI18n();
  const needsClosureCount = countNeedsClosureMatches(matches);
  const left = items.slice(0, 2);
  const right = items.slice(2);

  return (
    <nav className="rs-bottom-nav" aria-label={t('nav.primary')}>
      {left.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={() =>
            item.isActive(location.pathname) ? 'active' : undefined
          }
        >
          {item.icon}
          <span>{t(item.label)}</span>
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
          <span>{t(item.label)}</span>
          {item.to === routes.money && needsClosureCount > 0 ? (
            <span className="rs-bottom-nav__badge" aria-label={t('nav.settlementCount', { count: needsClosureCount })}>
              {needsClosureCount}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}
