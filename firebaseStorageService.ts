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
import { geminiService } from './services/gemini';

const SESSIONS_COLLECTION = 'studySessions';

export async function saveSession(session: StudySession): Promise<void> {
  const ref = doc(db, SESSIONS_COLLECTION, session.id);
  await setDoc(ref, session, { merge: true });
}

export async function getSessionsForUser(userId: string): Promise<StudySession[]> {
  try {
    console.log('Fetching sessions for user:', userId);
    const q = query(
      collection(db, SESSIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const sessions = snap.docs.map((d) => d.data() as StudySession);
    console.log('Found sessions:', sessions.length);
    return sessions;
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    // If it's an index error, provide helpful message
    if (error?.code === 'failed-precondition' || error?.message?.includes('index')) {
      console.error('Firestore index required. Please deploy indexes with: firebase deploy --only firestore:indexes');
    }
    throw error;
  }
}

export async function deleteSession(id: string): Promise<void> {
  const ref = doc(db, SESSIONS_COLLECTION, id);
  await deleteDoc(ref);
}

/**
 * Process uploaded file and create a new study session
 */
export async function processAndCreateSession(
  file: File,
  userId: string
): Promise<StudySession> {
  try {
    console.log('Processing file:', file.name);
    
    // Convert file to base64
    const fileBase64 = await fileToBase64(file);
    
    console.log('File converted to base64, processing with Gemini...');

    // Process with Gemini (this does everything in one call)
    const result = await geminiService.processStudyContent(
      fileBase64,
      file.name,
      file.type
    );

    console.log('Study materials generated, creating session...');

    // Create the session object
    const newSession: StudySession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      fileName: file.name,
      fileType: file.type,
      createdAt: new Date().toISOString(),
      studyPlan: result.studyPlan,
      flashcards: result.flashcards,
      drillCompleted: false,
      isPotentiallyInvalid: !result.isStudyMaterial,
      completedSteps: [],
      quizHistory: []
    };

    console.log('Session object created:', newSession);
    console.log('Saving session to Firebase...');
    
    // Save to Firebase with error handling
    try {
      await saveSession(newSession);
      console.log('Session saved successfully!');
    } catch (saveError) {
      console.error('Firebase save error:', saveError);
      throw new Error(`Failed to save to Firebase: ${saveError}`);
    }
    
    return newSession;
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
}

/**
 * Convert file to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}