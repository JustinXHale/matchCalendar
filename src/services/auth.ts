import {
  GoogleAuthProvider,
  OAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type AuthProvider,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/services/firebase';

const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export function requireAuth() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(
      'Firebase Auth is not configured. Check VITE_FIREBASE_* in .env.local.',
    );
  }
  return auth;
}

function isPopupBlockedError(err: unknown): boolean {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: unknown }).code)
      : '';
  return (
    code === 'auth/popup-blocked' ||
    (err instanceof Error &&
      /popup/i.test(err.message) &&
      /blocked/i.test(err.message))
  );
}

export function isMissingRedirectStateError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes('missing initial state');
}

const POPUP_BLOCKED_HELP =
  'Sign-in pop-up was blocked. Allow pop-ups for this site, or open it in Safari or Chrome (not an in-app browser), then try again.';

async function signInWithProvider(
  provider: AuthProvider,
): Promise<User | null> {
  const a = requireAuth();
  try {
    const result = await signInWithPopup(a, provider);
    return result.user;
  } catch (err) {
    if (isPopupBlockedError(err)) {
      throw new Error(POPUP_BLOCKED_HELP);
    }
    throw err;
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  return signInWithProvider(googleProvider);
}

export async function signInWithApple(): Promise<User | null> {
  return signInWithProvider(appleProvider);
}

export async function completeRedirectSignIn(): Promise<User | null> {
  if (!isFirebaseConfigured || !auth) return null;
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (err) {
    if (isMissingRedirectStateError(err)) {
      console.warn('Ignoring stale redirect sign-in state', err);
      return null;
    }
    throw err;
  }
}

export async function signOutFirebase(): Promise<void> {
  if (!auth) return;
  await firebaseSignOut(auth);
}

export function subscribeAuth(
  onUser: (user: User | null) => void,
): () => void {
  if (!isFirebaseConfigured || !auth) {
    onUser(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, onUser);
}

export function authErrorMessage(
  provider: 'Google' | 'Apple',
  err: unknown,
): string {
  const message =
    err instanceof Error ? err.message : `${provider} sign-in failed.`;
  if (message.includes('auth/operation-not-allowed')) {
    return `${provider} sign-in is not enabled yet. In Firebase Console → Authentication → Sign-in method, enable ${provider}, then try again.`;
  }
  if (message.includes('auth/popup-closed-by-user')) {
    return 'Sign-in was cancelled.';
  }
  if (message.includes('auth/popup-blocked')) {
    return POPUP_BLOCKED_HELP;
  }
  if (message.includes('missing initial state')) {
    return 'Sign-in was interrupted by your browser. Open this site in Safari or Chrome, then try again.';
  }
  if (
    message.includes('invalid_client') ||
    message.includes('auth/invalid-credential')
  ) {
    return 'Apple sign-in is still finishing setup. Try Google, or re-save the Services ID in Apple Developer.';
  }
  return message;
}
