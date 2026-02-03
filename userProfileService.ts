import { db } from './firebaseCLI';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  userId: string;
  username: string;
  avatar: string;
  createdAt: string;
}

const PROFILES_COLLECTION = 'userProfiles';

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const ref = doc(db, PROFILES_COLLECTION, profile.userId);
  await setDoc(ref, profile, { merge: true });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const ref = doc(db, PROFILES_COLLECTION, userId);
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const ref = doc(db, PROFILES_COLLECTION, userId);
  await setDoc(ref, updates, { merge: true });
}
