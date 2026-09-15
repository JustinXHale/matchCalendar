import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  writeBatch,
  type CollectionReference,
} from 'firebase/firestore';
import { requireDb } from '@/services/firebase';
import { deleteFirebaseAuthUser } from '@/services/auth';
import { STORAGE_KEYS } from '@/services/localStore';

const DELETE_BATCH_SIZE = 400;

async function deleteCollection(colRef: CollectionReference): Promise<void> {
  const db = requireDb();

  while (true) {
    const snapshot = await getDocs(query(colRef, limit(DELETE_BATCH_SIZE)));
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((document) => batch.delete(document.ref));
    await batch.commit();
  }
}

export function clearLocalAppData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.matches);
    localStorage.removeItem(STORAGE_KEYS.tournaments);
    localStorage.removeItem(STORAGE_KEYS.profile);
    localStorage.removeItem('match-calendar-demo-mode');
  } catch {
    /* ignore */
  }
}

/** Removes Match Calendar Firestore data for the signed-in user. */
export async function deleteMatchCalendarData(uid: string): Promise<void> {
  const db = requireDb();
  const userRef = doc(db, 'users', uid);

  await Promise.all([
    deleteCollection(collection(userRef, 'matches')),
    deleteCollection(collection(userRef, 'tournaments')),
    deleteCollection(collection(userRef, 'matchCalendar')),
  ]);
}

/** Removes Calendar data, the shared user profile doc, and the Auth account. */
export async function deleteUserProfileAndAccount(uid: string): Promise<void> {
  await deleteMatchCalendarData(uid);
  await deleteDoc(doc(requireDb(), 'users', uid));
  await deleteFirebaseAuthUser();
  clearLocalAppData();
}
