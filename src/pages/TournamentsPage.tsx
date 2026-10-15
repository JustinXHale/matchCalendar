import { Link } from 'react-router-dom';
import { routes } from '@/app/routes';
import { backState } from '@/nav/backNav';
import { SCHEDULE_BACK, TOURNAMENTS_BACK } from '@/nav/backDefaults';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { DetailBackButton } from '@/ui/DetailBackButton';
import { PageHeader } from '@/ui/PageHeader';
import { useI18n } from '@/i18n/I18nProvider';

export function TournamentsPage() {
  const { tournaments } = useTournamentsContext();
  const { t } = useI18n();
  const sorted = [...tournaments].sort((a, b) =>
    b.startDate.localeCompare(a.startDate),
  );

  return (
    <div className="rs-stack">
      <DetailBackButton fallback={SCHEDULE_BACK} />
      <PageHeader title={t('tournaments.title')} />
      {sorted.length === 0 ? (
        <div className="rs-placeholder-card">
          <p>{t('tournaments.empty')}</p>
          <Link to={routes.tournamentNew}>{t('tournaments.create')}</Link>
        </div>
      ) : (
        <ul className="rs-tournament-list">
          {sorted.map((tournament) => (
            <li key={tournament.id}>
              <Link
                to={routes.tournamentDetail(tournament.id)}
                className="rs-tournament-card"
                state={backState(TOURNAMENTS_BACK)}
              >
                <span className="rs-pill">{t('tournaments.item')}</span>
                <strong>{tournament.title}</strong>
                <span>
                  {tournament.startDate} — {tournament.endDate}
                </span>
                {tournament.location ? <span>{tournament.location}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
