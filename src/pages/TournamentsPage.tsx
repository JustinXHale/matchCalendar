import { Link } from 'react-router-dom';
import { routes } from '@/app/routes';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';
import { PageHeader } from '@/ui/PageHeader';

export function TournamentsPage() {
  const { tournaments } = useTournamentsContext();
  const sorted = [...tournaments].sort((a, b) =>
    b.startDate.localeCompare(a.startDate),
  );

  return (
    <div className="rs-stack">
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
