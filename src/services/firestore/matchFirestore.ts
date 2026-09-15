import type { Match } from '@/domain/match';
import {
  deserializeDatesFromFirestore,
  serializeDatesForFirestore,
  stripUndefined,
} from '@/services/firestore/timestamps';

export function matchToFirestore(match: Match): Record<string, unknown> {
  const { id, ...rest } = match;
  void id;
  return stripUndefined(serializeDatesForFirestore(rest));
}

export function matchFromFirestore(
  id: string,
  data: Record<string, unknown>,
): Match {
  const revived = deserializeDatesFromFirestore(data) as Omit<Match, 'id'>;
  return {
    ...revived,
    id,
    kickoffAt: revived.kickoffAt ?? new Date(),
    createdAt: revived.createdAt ?? new Date(),
    updatedAt: revived.updatedAt ?? new Date(),
    source: revived.source ?? { type: 'manual' },
  };
}
