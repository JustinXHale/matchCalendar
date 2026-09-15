import {
  GoogleAuthProvider,
  OAuthProvider,
  deleteUser,
  getRedirectResult,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type AuthProvider,
  type User,
} from 'firebase/auth';
import {
  isMissingRedirectStateError,
  prefersAuthRedirect,
} from '@/services/authPlatform';
import { auth, isFirebaseConfigured } from '@/services/firebase';

export { isMissingRedirectStateError, prefersAuthRedirect } from '@/services/authPlatform';

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

const POPUP_BLOCKED_HELP =
  'Sign-in pop-up was blocked. Allow pop-ups for this site, or open it in Safari or Chrome (not an in-app browser), then try again.';

async function signInWithProvider(
  provider: AuthProvider,
): Promise<User | null> {
  const a = requireAuth();

  if (prefersAuthRedirect()) {
    await signInWithRedirect(a, provider);
    return null;
  }

  try {
    const result = await signInWithPopup(a, provider);
    return result.user;
  } catch (err) {
    if (isPopupBlockedError(err)) {
      await signInWithRedirect(a, provider);
      return null;
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

function isRequiresRecentLogin(err: unknown): boolean {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: unknown }).code)
      : '';
  return code === 'auth/requires-recent-login';
}

async function reauthenticateCurrentUser(user: User): Promise<void> {
  const providerId =
    user.providerData.find(
      (provider) =>
        provider.providerId === 'google.com' ||
        provider.providerId === 'apple.com',
    )?.providerId ?? user.providerData[0]?.providerId;

  if (providerId === 'google.com') {
    await reauthenticateWithPopup(user, new GoogleAuthProvider());
    return;
  }

  if (providerId === 'apple.com') {
    const apple = new OAuthProvider('apple.com');
    apple.addScope('email');
    apple.addScope('name');
    await reauthenticateWithPopup(user, apple);
    return;
  }

  throw new Error(
    'For your security, sign out, sign in again, then retry account deletion.',
  );
}

export async function deleteFirebaseAuthUser(): Promise<void> {
  const a = requireAuth();
  const user = a.currentUser;
  if (!user) {
    throw new Error('Not signed in.');
  }

  try {
    await deleteUser(user);
  } catch (err) {
    if (!isRequiresRecentLogin(err)) {
      throw err;
    }
    await reauthenticateCurrentUser(user);
    await deleteUser(user);
  }
}

export function accountDeletionErrorMessage(err: unknown): string {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: unknown }).code)
      : '';
  const message = err instanceof Error ? err.message : String(err);

  if (code === 'permission-denied' || message.includes('permission-denied')) {
    return 'Could not delete data. Firestore rules may need to be updated and redeployed.';
  }
  if (isPopupBlockedError(err)) {
    return POPUP_BLOCKED_HELP;
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Confirmation was cancelled. Your account was not deleted.';
  }
  if (isRequiresRecentLogin(err)) {
    return 'Sign out, sign in again, then retry account deletion.';
  }
  return message || 'Account deletion failed.';
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
