import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Match } from '@/domain/match';
import {
  matchFromFirestore,
  matchToFirestore,
} from '@/services/firestore/matchFirestore';
import { requireDb } from '@/services/firebase';

function matchesCollection(uid: string) {
  return collection(requireDb(), 'users', uid, 'matches');
}

export function subscribeMatches(
  uid: string,
  onMatches: (matches: Match[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    matchesCollection(uid),
    (snapshot) => {
      const matches = snapshot.docs.map((document) =>
        matchFromFirestore(document.id, document.data() as Record<string, unknown>),
      );
      onMatches(matches);
    },
    (error) => onError?.(error),
  );
}

export async function listMatches(uid: string): Promise<Match[]> {
  const snapshot = await getDocs(matchesCollection(uid));
  return snapshot.docs.map((document) =>
    matchFromFirestore(document.id, document.data() as Record<string, unknown>),
  );
}

export async function deleteMatch(uid: string, matchId: string): Promise<void> {
  const ref = doc(requireDb(), 'users', uid, 'matches', matchId);
  await deleteDoc(ref);
}

export async function upsertMatch(uid: string, match: Match): Promise<void> {
  const ref = doc(requireDb(), 'users', uid, 'matches', match.id);
  await setDoc(ref, matchToFirestore({ ...match, ownerUid: uid }));
}

export async function upsertMatches(uid: string, matches: Match[]): Promise<void> {
  for (const match of matches) {
    await upsertMatch(uid, match);
  }
}
