import { Navigate } from 'react-router-dom';
import { routes } from '@/app/routes';

export function TournamentCreatePage() {
  return (
    <Navigate
      to={routes.fullMatch}
      replace
      state={{ tournamentContainer: true }}
    />
  );
}
