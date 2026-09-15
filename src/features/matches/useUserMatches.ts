import { useMatchesContext } from '@/features/matches/MatchesProvider';

export function useUserMatches() {
  const { matches } = useMatchesContext();

  return {
    matches,
    isLoading: false,
    error: null,
  };
}
