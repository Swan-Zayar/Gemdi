import React, { useState, useEffect, useCallback } from 'react';
import { auth } from './firebaseCLI';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import Header from './components/Header';
import Landing from './components/Landing';
import LoginModal from './components/LoginModal';
import ProfileModal from './components/ProfileModal';
import Dashboard from './components/Dashboard';
import StudyPlanView from './components/StudyPlanView';
import QuizView from './components/QuizView';
import FlashcardView from './components/FlashcardView';
import ProcessingOverlay from './components/ProcessingOverlay';
import Footer from './components/Footer';
import { AppState, StudySession, QuizQuestion } from './types';

type ThemeMode = 'light' | 'dark';
import { storageService as localStorageService } from './services/storage';
import * as sessionStorageService from './firebaseStorageService';
import { geminiService } from './services/gemini';
import { intelligenceService } from './services/intelligence';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [activeStepTitle, setActiveStepTitle] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [neuralInsight, setNeuralInsight] = useState<string>('');
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [isQuizReady, setIsQuizReady] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(localStorageService.getTheme());

  /** Listen to Firebase auth state changes */
  useEffect(() => {
    console.log('Setting up Firebase auth listener...');
    
    const timeout = setTimeout(() => {
      console.warn('Firebase auth initialization timed out after 5 seconds');
      setLoadingAuth(false);
    }, 5000);
  
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
        clearTimeout(timeout);
        
        if (firebaseUser) {
          console.log('User authenticated:', firebaseUser.uid);
          setUser(firebaseUser);
          setAppState(AppState.DASHBOARD);
          try {
            const userSessions = await sessionStorageService.getSessionsForUser(firebaseUser.uid);
            console.log('Sessions loaded:', userSessions.length);
            setSessions(userSessions || []);
            if (userSessions && userSessions.length > 0) {
              intelligenceService.learnFromSessions(userSessions)
                .then(setNeuralInsight)
                .catch(err => console.warn('Intelligence service error:', err));
            }
          } catch (error) {
            console.error('Error loading user sessions:', error);
            setSessions([]);
          }
        } else {
          console.log('No user, showing landing page');
          setUser(null);
          setAppState(AppState.LANDING);
          setSessions([]);
        }
        setLoadingAuth(false);
        console.log('Loading auth set to false');
      },
      (error) => {
        console.error('Firebase auth error:', error);
        clearTimeout(timeout);
        setLoadingAuth(false);
      }
    );
  
    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  /** Theme persistence */
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorageService.saveTheme(theme);
  }, [theme]);

  /** File upload handler */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsProcessing(true);
    
    try {
      // Process the file and create a session
      // This is where you'd call your file processing service
      const newSession = await sessionStorageService.processAndCreateSession(
        file, 
        user.uid
      );
      
      // Add the new session to the list
      setSessions(prev => [newSession, ...prev]);
      
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Failed to process file. Please try again.');
    } finally {
      setIsProcessing(false);
      // Reset file input
      event.target.value = '';
    }
  };
  /** Prefetch quiz */
  const prefetchQuiz = useCallback(async (session: StudySession) => {
    if (!session.studyPlan || isQuizLoading) return;
    setIsQuizLoading(true);
    setIsQuizReady(false);
    try {
      const quiz = await geminiService.generateQuiz(session.studyPlan);
      setCurrentQuiz(quiz);
      setIsQuizReady(true);
    } catch (e) {
      console.warn(e);
    } finally {
      setIsQuizLoading(false);
    }
  }, [isQuizLoading]);

  useEffect(() => {
    if (appState === AppState.STUDY_PLAN && activeSession && !isQuizReady && !isQuizLoading) {
      prefetchQuiz(activeSession);
    }
  }, [appState, activeSession, isQuizReady, isQuizLoading, prefetchQuiz]);

  /** Login handler (from LoginModal) */
  const handleLogin = async (loggedInUser: User) => {
    console.log('handleLogin called for:', loggedInUser.uid);
    setUser(loggedInUser);
    setIsLoginModalOpen(false);
    setAppState(AppState.DASHBOARD);

    try {
      const userSessions = await sessionStorageService.getSessionsForUser(loggedInUser.uid);
      console.log('Sessions loaded in handleLogin:', userSessions?.length || 0);
      setSessions(userSessions || []);
      
      if (userSessions && userSessions.length > 0) {
        intelligenceService.learnFromSessions(userSessions)
          .then(setNeuralInsight)
          .catch(err => console.warn('Intelligence service error:', err));
      }
    } catch (error) {
      console.error('Error loading user sessions after login:', error);
      setSessions([]); // Set empty sessions on error
    }
  };

  /** Logout handler */
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Error signing out from Firebase', e);
    }
    setUser(null);
    localStorageService.saveUser(null);
    setAppState(AppState.LANDING);
    setActiveSession(null);
    setSessions([]);
  };

  /** Safely get first name from user */
  const getFirstName = () => {
    if (!user) return '';
    // Use displayName from Firebase user
    return user.displayName?.split(' ')[0] ?? '';
  };

  /** Update active session */
  const updateActiveSession = (updated: StudySession) => {
    setActiveSession(updated);
    sessionStorageService.saveSession(updated).catch(console.error);
    if (user) {
      sessionStorageService.getSessionsForUser(user.uid).then(setSessions).catch(console.error);
    }
  };

  // Better loading screen with spinner
  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300">
      <Header
        user={user}
        displayName={getFirstName()}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onDashboardClick={() => setAppState(AppState.DASHBOARD)}
        onLogoClick={() => setAppState(AppState.LANDING)}
        onProfileClick={() => setIsProfileModalOpen(true)}
        currentTheme={theme}
        onThemeChange={setTheme}
      />

      <main className="grow w-full max-w-7xl mx-auto px-4">
        {user ? (
          <>
            {appState === AppState.DASHBOARD && (
              <Dashboard
                  sessions={sessions}
                  onUpload={handleFileUpload}
                  onOpenSession={(s) => {
                  setActiveSession(s);
                  setAppState(AppState.STUDY_PLAN);
                }}
                onDeleteSession={async (id) => {
                  await sessionStorageService.deleteSession(id);
                  if (user) {
                    const updated = await sessionStorageService.getSessionsForUser(user.uid);
                    setSessions(updated);
                  }
                }}
                neuralInsight={neuralInsight}
              />
            )}

            {appState === AppState.STUDY_PLAN && activeSession && (
              <StudyPlanView
                session={activeSession}
                isQuizReady={isQuizReady}
                onViewFlashcards={() => {
                  setActiveStepTitle(null);
                  setAppState(AppState.FLASHCARDS);
                }}
                onStepAction={(title) => {
                  setActiveStepTitle(title);
                  setAppState(AppState.FLASHCARDS);
                }}
                onStartQuiz={async () => setAppState(AppState.QUIZ)}
              />
            )}

            {appState === AppState.FLASHCARDS && activeSession && (
              <FlashcardView
                flashcards={activeSession.flashcards || []}
                onBack={() => {
                  setActiveStepTitle(null);
                  setAppState(AppState.STUDY_PLAN);
                }}
                onComplete={(r) => {
                  const c = activeSession.completedSteps || [];
                  const updatedSteps = activeStepTitle && !c.includes(activeStepTitle) ? [...c, activeStepTitle] : c;
                  updateActiveSession({
                    ...activeSession,
                    drillCompleted: true,
                    performanceRating: r,
                    completedSteps: updatedSteps,
                  });
                  setActiveStepTitle(null);
                  setAppState(AppState.STUDY_PLAN);
                }}
              />
            )}

            {appState === AppState.QUIZ && currentQuiz.length > 0 && (
              <QuizView
                questions={currentQuiz}
                onBack={() => setAppState(AppState.STUDY_PLAN)}
                onComplete={(s, t) => {
                  updateActiveSession({
                    ...activeSession!,
                    quizHistory: [{ score: s, total: t, date: new Date().toISOString() }, ...(activeSession?.quizHistory || [])],
                  });
                  setAppState(AppState.STUDY_PLAN);
                }}
              />
            )}
          </>
        ) : (
          <Landing onGetStarted={() => setIsLoginModalOpen(true)} />
        )}
      </main>

      <Footer />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
      {user && <ProfileModal user={user} isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} onUpdate={() => {}} />}
      {isProcessing && <ProcessingOverlay />}
    </div>
  );
};

export default App;