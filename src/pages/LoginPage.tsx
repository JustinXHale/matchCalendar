import { Button } from '@patternfly/react-core';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { routes } from '@/app/routes';
import { useDemoMode } from '@/demo/DemoModeContext';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  AppleSignInButton,
  GoogleSignInButton,
} from '@/features/auth/SocialSignInButtons';
import {
  authErrorMessage,
  signInWithApple,
  signInWithGoogle,
} from '@/services/auth';
import { isFirebaseConfigured } from '@/services/firebase';
import { PwaInstallCard } from '@/ui/PwaInstallCard';
import { ThemeToggle } from '@/ui/ThemeToggle';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, authReady } = useAuth();
  const { enableDemoMode, disableDemoMode, isDemoMode } = useDemoMode();
  const [authNote, setAuthNote] = useState<string | null>(null);
  const [busyProvider, setBusyProvider] = useState<'google' | 'apple' | null>(
    null,
  );

  if (isFirebaseConfigured && authReady && user && !isDemoMode) {
    return <Navigate to={routes.schedule} replace />;
  }

  const busy = busyProvider != null;

  const tryDemo = () => {
    enableDemoMode();
    navigate(routes.schedule);
  };

  const onGoogle = async () => {
    if (!isFirebaseConfigured) {
      setAuthNote(
        'Firebase is not configured. Add VITE_FIREBASE_* to .env.local, or use Try demo.',
      );
      return;
    }
    setBusyProvider('google');
    setAuthNote(null);
    try {
      disableDemoMode();
      const signedInUser = await signInWithGoogle();
      if (!signedInUser) setBusyProvider(null);
    } catch (err) {
      setAuthNote(authErrorMessage('Google', err));
      setBusyProvider(null);
    }
  };

  const onApple = async () => {
    if (!isFirebaseConfigured) {
      setAuthNote(
        'Firebase is not configured. Add VITE_FIREBASE_* to .env.local, or use Try demo.',
      );
      return;
    }
    setBusyProvider('apple');
    setAuthNote(null);
    try {
      disableDemoMode();
      const signedInUser = await signInWithApple();
      if (!signedInUser) setBusyProvider(null);
    } catch (err) {
      setAuthNote(authErrorMessage('Apple', err));
      setBusyProvider(null);
    }
  };

  return (
    <div className="rs-signin rs-page-pad">
      <header className="rs-signin__hero">
        <h1 className="rs-signin__title">Match Calendar</h1>
        <p className="rs-signin__lede">
          Personal referee schedule, travel, and pay records
        </p>
      </header>

      <section className="rs-signin__providers" aria-label="Sign in">
        <GoogleSignInButton
          busy={busyProvider === 'google'}
          disabled={busy}
          onClick={() => void onGoogle()}
        />
        <AppleSignInButton
          busy={busyProvider === 'apple'}
          disabled={busy}
          onClick={() => void onApple()}
        />
        <Button
          variant="link"
          isBlock
          className="rs-signin__provider"
          isDisabled={busy}
          onClick={tryDemo}
        >
          Try demo
        </Button>
        {authNote && (
          <p className="rs-signin__note" role="status">
            {authNote}
          </p>
        )}
      </section>

      <PwaInstallCard className="rs-signin__pwa" />

      <div className="rs-signin__build-row">
        <ThemeToggle />
      </div>
    </div>
  );
}
