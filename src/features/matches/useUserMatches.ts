import { useMatchesContext } from '@/features/matches/MatchesProvider';

export function useUserMatches() {
  const {
    matches,
    dataReady,
    matchReadySyncing,
    matchReadyLastSyncedAt,
    syncMatchReady,
  } = useMatchesContext();

  return {
    matches,
    isLoading: !dataReady,
    error: null,
    matchReadySyncing,
    matchReadyLastSyncedAt,
    syncMatchReady,
  };
}
