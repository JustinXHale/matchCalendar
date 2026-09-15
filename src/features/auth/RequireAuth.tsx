import { Navigate, useLocation } from 'react-router-dom';
import { routes } from '@/app/routes';
import { useDemoMode } from '@/demo/DemoModeContext';
import { useAuth } from '@/features/auth/AuthProvider';
import { isFirebaseConfigured } from '@/services/firebase';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useAuth();
  const { isDemoMode } = useDemoMode();
  const location = useLocation();

  if (!isFirebaseConfigured || isDemoMode) {
    return children;
  }

  if (!authReady) {
    return (
      <div className="rs-stack rs-auth-loading">
        <p className="rs-form-hint">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={routes.login} replace state={{ from: location }} />;
  }

  return children;
}
