import { Link } from 'react-router-dom';
import { routes } from '@/app/routes';
import { backState } from '@/nav/backNav';
import { SCHEDULE_BACK, TOURNAMENTS_BACK } from '@/nav/backDefaults';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { DetailBackButton } from '@/ui/DetailBackButton';
import { PageHeader } from '@/ui/PageHeader';

export function TournamentsPage() {
  const { tournaments } = useTournamentsContext();
  const sorted = [...tournaments].sort((a, b) =>
    b.startDate.localeCompare(a.startDate),
  );

  return (
    <div className="rs-stack">
      <DetailBackButton fallback={SCHEDULE_BACK} />
      <PageHeader title="Tournaments" />
      {sorted.length === 0 ? (
        <div className="rs-placeholder-card">
          <p>No tournaments yet.</p>
          <Link to={routes.tournamentNew}>Create a tournament</Link>
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
                <span className="rs-pill">Tournament</span>
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
