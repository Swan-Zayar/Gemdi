import { db, storage } from './firebaseCLI';
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
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import type { StudySession } from './types';
import { geminiService } from './gemini';
import { validateUploadFile } from './fileValidation';

const SESSIONS_COLLECTION = 'studySessions';
const STORAGE_TEMP_FOLDER = 'temp-pdfs';

export async function saveSession(session: StudySession): Promise<void> {
  const ref = doc(db, SESSIONS_COLLECTION, session.id);
  await setDoc(ref, session, { merge: true });
}

export async function getSessionsForUser(userId: string): Promise<StudySession[]> {
  try {
    if (import.meta.env.DEV) console.log('Fetching sessions for user:', userId);
    const q = query(
      collection(db, SESSIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const sessions = snap.docs.map((d) => d.data() as StudySession);
    if (import.meta.env.DEV) console.log('Found sessions:', sessions.length);
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
 * Process uploaded file and create a new study session using Cloud Storage
 */
export async function processAndCreateSession(
  file: File,
  userId: string,
  customPrompt?: string
): Promise<StudySession> {
  let storagePath: string | null = null;

  try {
    if (import.meta.env.DEV) console.log('Processing file:', file.name);

    const fileError = validateUploadFile(file);
    if (fileError) {
      throw new Error(fileError);
    }
    
    // Step 1: Upload file to Firebase Storage
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-z0-9.-]/gi, '_');
    storagePath = `${STORAGE_TEMP_FOLDER}/${userId}/${timestamp}_${sanitizedFileName}`;

    if (import.meta.env.DEV) console.log('Uploading file to Storage:', storagePath);
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);

    if (import.meta.env.DEV) console.log('File uploaded successfully, processing with Gemini...');

    // Step 2: Call Cloud Function with storage path
    const result = await geminiService.processStudyContent(
      storagePath,
      file.name,
      file.type,
      customPrompt,
      file.size
    );

    if (import.meta.env.DEV) console.log('Study materials generated, creating session...');

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

    if (import.meta.env.DEV) console.log('Session object created:', newSession);
    if (import.meta.env.DEV) console.log('Saving session to Firebase...');
    
    // Save to Firebase with error handling
    try {
      await saveSession(newSession);
      if (import.meta.env.DEV) console.log('Session saved successfully!');
    } catch (saveError) {
      console.error('Firebase save error:', saveError);
      throw new Error(`Failed to save to Firebase: ${saveError}`);
    }

    return newSession;
  } catch (error) {
    console.error('Error processing file:', error);
    
    // Cleanup: delete the uploaded file if processing failed
    if (storagePath) {
      try {
        if (import.meta.env.DEV) console.log('Cleaning up Storage file after error:', storagePath);
        const storageRef = ref(storage, storagePath);
        await deleteObject(storageRef);
      } catch (cleanupErr) {
        console.error('Failed to cleanup Storage file:', cleanupErr);
      }
    }
    
    throw error;
  }
}