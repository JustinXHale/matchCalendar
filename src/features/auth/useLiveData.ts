import { useDemoMode } from '@/demo/DemoModeContext';
import { useAuth } from '@/features/auth/AuthProvider';
import { isFirebaseConfigured } from '@/services/firebase';

export function useLiveData() {
  const { user, authReady } = useAuth();
  const { isDemoMode } = useDemoMode();

  const isLive =
    isFirebaseConfigured && authReady && Boolean(user) && !isDemoMode;

  return {
    isLive,
    uid: isLive ? user!.uid : undefined,
    authReady,
    isFirebaseConfigured,
  };
}
