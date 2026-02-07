
export interface UserLocal {
  id: string;
  name: string;
  email: string;
  avatar: string;
  password?: string; // Stored in mock registry
  learnedPreferences?: string;
  language?: string; // User's preferred language
  customPrompt?: string; // Custom instructions for Gemini processing
}

export interface Flashcard {
  question: string;
  answer: string;
  category?: string;
  stepTitle?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface StudyStep {
  title: string;
  description: string;
  detailedNotes: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  overview: string;
  steps: StudyStep[];
  topics: string[];
}

export interface StudySession {
  id: string;
  userId: string; // Scoped to user
  fileName: string;
  sessionName?: string; // Custom name set by user
  fileType: string;
  createdAt: string;
  studyPlan?: StudyPlan;
  flashcards?: Flashcard[];
  completedSteps?: string[]; 
  drillCompleted?: boolean;   
  performanceRating?: number; 
  isPotentiallyInvalid?: boolean; 
  validityWarning?: string;       
  quizHistory?: { score: number; total: number; date: string }[];
}

export enum AppState {
  LANDING,
  LOGIN,
  DASHBOARD,
  STUDY_PLAN,
  FLASHCARDS,
  QUIZ,
  PROCESSING
}
