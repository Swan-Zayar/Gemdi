import { db } from './firebaseCLI';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import type { StudySession } from './types';

const SESSIONS_COLLECTION = 'studySessions';

export async function saveSession(session: StudySession): Promise<void> {
  const ref = doc(db, SESSIONS_COLLECTION, session.id);
  await setDoc(ref, session, { merge: true });
}

export async function getSessionsForUser(userId: string): Promise<StudySession[]> {
  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as StudySession);
}

export async function deleteSession(id: string): Promise<void> {
  const ref = doc(db, SESSIONS_COLLECTION, id);
  await deleteDoc(ref);
}