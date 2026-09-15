import { Timestamp } from 'firebase/firestore';

function isFirestoreTimestamp(value: unknown): value is Timestamp {
  return (
    value instanceof Timestamp ||
    (typeof value === 'object' &&
      value !== null &&
      'toDate' in value &&
      typeof (value as { toDate: () => Date }).toDate === 'function')
  );
}

export function dateToFirestore(value: Date): Timestamp {
  return Timestamp.fromDate(value);
}

export function dateFromFirestore(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (isFirestoreTimestamp(value)) return value.toDate();
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value);
  }
  return undefined;
}

export function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefined(item)) as T;
  }

  if (value && typeof value === 'object' && !(value instanceof Date) && !isFirestoreTimestamp(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, stripUndefined(entry)]),
    ) as T;
  }

  return value;
}

export function serializeDatesForFirestore<T>(value: T): T {
  if (value instanceof Date) {
    return dateToFirestore(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeDatesForFirestore(item)) as T;
  }

  if (value && typeof value === 'object' && !isFirestoreTimestamp(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        serializeDatesForFirestore(entry),
      ]),
    ) as T;
  }

  return value;
}

export function deserializeDatesFromFirestore<T>(value: T): T {
  if (isFirestoreTimestamp(value)) {
    return value.toDate() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => deserializeDatesFromFirestore(item)) as T;
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        deserializeDatesFromFirestore(entry),
      ]),
    ) as T;
  }

  return value;
}
