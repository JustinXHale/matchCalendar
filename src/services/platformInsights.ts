import { httpsCallable } from 'firebase/functions';
import { requireFunctions } from '@/services/firebase';
import type { PlatformInsightsResult } from '@/services/platformInsightsTypes';

export async function fetchPlatformInsights(): Promise<PlatformInsightsResult> {
  const callable = httpsCallable<Record<string, never>, PlatformInsightsResult>(
    requireFunctions(),
    'getMatchCalendarPlatformInsights',
  );
  const result = await callable({});
  return result.data;
}

export function platformInsightsErrorMessage(err: unknown): string {
  const code =
    typeof err === 'object' && err && 'code' in err
      ? String((err as { code?: string }).code ?? '')
      : '';
  if (code === 'functions/permission-denied') {
    return 'You are not authorized to view platform member data.';
  }
  if (code === 'functions/unauthenticated') {
    return 'Sign in to view platform member data.';
  }
  if (typeof err === 'object' && err && 'message' in err) {
    const message = String((err as { message?: string }).message ?? '').trim();
    if (message) return message;
  }
  return 'Could not load platform member data. Try again in a moment.';
}
