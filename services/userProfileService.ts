import { db } from './firebaseCLI';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface UserProfile {
  userId: string;
  username: string;
  avatar: string;
  createdAt: string;
  language?: string;
  customPrompt?: string;
  loginDates?: string[];
  hasSeenTutorial?: boolean;
}

const PROFILES_COLLECTION = 'userProfiles';

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const ref = doc(db, PROFILES_COLLECTION, profile.userId);
  await setDoc(ref, profile, { merge: true });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const ref = doc(db, PROFILES_COLLECTION, userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
  const ref = doc(db, PROFILES_COLLECTION, userId);
  await setDoc(ref, updates, { merge: true });
}

/** Record today's login and return the updated loginDates array */
export async function recordLogin(userId: string, existing: string[] = []): Promise<string[]> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  if (existing.includes(today)) return existing;

  // Keep only last 90 days to avoid unbounded growth
  const updated = [...existing, today].slice(-90);
  await updateUserProfile(userId, { loginDates: updated } as Partial<UserProfile>);
  return updated;
}

/** Calculate consecutive-day streak ending before today (completed days only).
 *  First login day = 0. Two consecutive days = 1, etc. */
export function calculateStreak(loginDates: string[]): number {
  if (!loginDates || loginDates.length < 2) return 0;

  const unique = [...new Set(loginDates)].sort().reverse();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecent = new Date(unique[0] + 'T00:00:00');
  const diffFromToday = Math.round((today.getTime() - mostRecent.getTime()) / 86400000);

  // Streak only counts if the user logged in today or yesterday
  if (diffFromToday > 1) return 0;

  // Count consecutive days before today (exclude today itself)
  let streak = 0;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1] + 'T00:00:00');
    const curr = new Date(unique[i] + 'T00:00:00');
    const gap = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (gap === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
