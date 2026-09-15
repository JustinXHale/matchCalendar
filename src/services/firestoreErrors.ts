export function firestoreErrorMessage(err: unknown): string {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: unknown }).code)
      : '';
  const message = err instanceof Error ? err.message : String(err);

  if (code === 'permission-denied' || message.includes('permission-denied')) {
    return 'Could not access your data. Sign in again or check that Firestore rules are deployed.';
  }
  if (code === 'unavailable' || message.includes('offline')) {
    return 'You appear to be offline. Your change will sync when you reconnect.';
  }
  if (code === 'resource-exhausted') {
    return 'Too many requests. Wait a moment and try again.';
  }
  return 'Something went wrong saving your data. Please try again.';
}
