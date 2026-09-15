import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Tournament } from '@/domain/tournament';
import {
  tournamentFromFirestore,
  tournamentToFirestore,
} from '@/services/firestore/tournamentFirestore';
import { requireDb } from '@/services/firebase';

function tournamentsCollection(uid: string) {
  return collection(requireDb(), 'users', uid, 'tournaments');
}

export function subscribeTournaments(
  uid: string,
  onTournaments: (tournaments: Tournament[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    tournamentsCollection(uid),
    (snapshot) => {
      const tournaments = snapshot.docs.map((document) =>
        tournamentFromFirestore(
          document.id,
          document.data() as Record<string, unknown>,
        ),
      );
      onTournaments(tournaments);
    },
    (error) => onError?.(error),
  );
}

export async function upsertTournament(
  uid: string,
  tournament: Tournament,
): Promise<void> {
  const ref = doc(requireDb(), 'users', uid, 'tournaments', tournament.id);
  await setDoc(
    ref,
    tournamentToFirestore({ ...tournament, ownerUid: uid }),
  );
}

export async function upsertTournaments(
  uid: string,
  tournaments: Tournament[],
): Promise<void> {
  for (const tournament of tournaments) {
    await upsertTournament(uid, tournament);
  }
}
