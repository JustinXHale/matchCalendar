import { useAuth } from '@/features/auth/AuthProvider';
import { useLiveData } from '@/features/auth/useLiveData';
import { useMatchesContext } from '@/features/matches/MatchesProvider';
import { useTournamentsContext } from '@/features/tournaments/TournamentsProvider';

export function AppDataGate({ children }: { children: React.ReactNode }) {
  const { authReady } = useAuth();
  const { isLive } = useLiveData();
  const { dataReady: matchesReady } = useMatchesContext();
  const { dataReady: tournamentsReady } = useTournamentsContext();

  if (isLive && (!authReady || !matchesReady || !tournamentsReady)) {
    return (
      <div className="rs-stack rs-auth-loading">
        <p className="rs-form-hint">Loading your schedule…</p>
      </div>
    );
  }

  return children;
}
