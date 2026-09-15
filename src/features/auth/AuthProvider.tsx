import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import {
  completeRedirectSignIn,
  isMissingRedirectStateError,
  signOutFirebase,
  subscribeAuth,
} from '@/services/auth';
import { isFirebaseConfigured } from '@/services/firebase';

type AuthContextValue = {
  user: User | null;
  authReady: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    let cancelled = false;

    void completeRedirectSignIn().catch((err) => {
      if (isMissingRedirectStateError(err)) {
        console.warn('Stale redirect sign-in state on bootstrap', err);
        return;
      }
      console.error('Redirect sign-in failed', err);
    });

    const unsubscribe = subscribeAuth((nextUser) => {
      if (cancelled) return;
      setUser(nextUser);
      setAuthReady(true);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await signOutFirebase();
  }, []);

  const value = useMemo(
    () => ({ user, authReady, signOut }),
    [user, authReady, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
