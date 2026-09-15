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

    let unsubscribe: (() => void) | undefined;

    void (async () => {
      try {
        await completeRedirectSignIn();
      } catch (err) {
        console.warn('Redirect sign-in failed', err);
      }

      unsubscribe = subscribeAuth((nextUser) => {
        setUser(nextUser);
        setAuthReady(true);
      });
    })();

    return () => unsubscribe?.();
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
