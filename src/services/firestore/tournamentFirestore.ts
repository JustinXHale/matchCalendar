import type { Tournament } from '@/domain/tournament';
import {
  deserializeDatesFromFirestore,
  serializeDatesForFirestore,
  stripUndefined,
} from '@/services/firestore/timestamps';

export function tournamentToFirestore(
  tournament: Tournament,
): Record<string, unknown> {
  const { id, ...rest } = tournament;
  void id;
  return stripUndefined(serializeDatesForFirestore(rest));
}

export function tournamentFromFirestore(
  id: string,
  data: Record<string, unknown>,
): Tournament {
  const revived = deserializeDatesFromFirestore(data) as Omit<Tournament, 'id'>;
  return {
    ...revived,
    id,
    payScope: revived.payScope ?? 'tournament',
    createdAt: revived.createdAt ?? new Date(),
    updatedAt: revived.updatedAt ?? new Date(),
  };
}
