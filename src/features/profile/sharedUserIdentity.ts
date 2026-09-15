import { doc, getDoc } from 'firebase/firestore';
import { requireDb } from '@/services/firebase';

export type SharedUserIdentity = {
  displayName?: string;
  photoUrl?: string;
};

/** Read-only identity from MatchReadyTX `users/{uid}` when Auth omits photo/name. */
export async function fetchSharedUserIdentity(
  uid: string,
): Promise<SharedUserIdentity> {
  const snapshot = await getDoc(doc(requireDb(), 'users', uid));
  if (!snapshot.exists()) return {};

  const data = snapshot.data();
  return {
    displayName:
      typeof data.displayName === 'string' ? data.displayName : undefined,
    photoUrl: typeof data.photoUrl === 'string' ? data.photoUrl : undefined,
  };
}
