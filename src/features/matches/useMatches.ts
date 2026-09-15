import { useDemoMode } from '@/demo/DemoModeContext';
import { useUserMatches } from './useUserMatches';

export function useMatches() {
  const { isDemoMode } = useDemoMode();
  return { ...useUserMatches(), isDemo: isDemoMode };
}
