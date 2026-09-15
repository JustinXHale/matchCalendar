import type { Timestamp } from 'firebase/firestore';

export type UserProfile = {
  uid: string;
  displayName?: string;
  email: string;
  photoUrl?: string;
  defaultPosition?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
