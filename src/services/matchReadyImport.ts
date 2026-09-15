import { httpsCallable } from 'firebase/functions';
import { requireFunctions } from '@/services/firebase';
import type { SyncMatchReadyAssignmentsResult } from '@/services/matchReadyTypes';

export async function fetchMatchReadyAssignments(
  force = false,
): Promise<SyncMatchReadyAssignmentsResult> {
  const callable = httpsCallable<
    { force?: boolean },
    SyncMatchReadyAssignmentsResult
  >(requireFunctions(), 'syncMatchReadyAssignments');
  const result = await callable(force ? { force: true } : {});
  return result.data;
}
