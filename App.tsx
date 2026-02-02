
import React, { useState, useEffect, useCallback } from 'react';
import { UserLocal, StudySession, AppState, QuizQuestion, StudyStep } from './types';
import { storageService as localStorageService, ThemeMode } from './services/storage';
import { geminiService } from './services/gemini';
import { intelligenceService } from './services/intelligence';
import * as sessionStorageService from './firebaseStorageService';
import { auth } from './firebaseCLI';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import Header from './components/Header';
import Landing from './components/Landing';
import LoginModal from './components/LoginModal';
import ProfileModal from './components/ProfileModal';
import Dashboard from './components/Dashboard';
import StudyPlanView from './components/StudyPlanView';
import FlashcardView from './components/FlashcardView';
import QuizView from './components/QuizView';
import ProcessingOverlay from './components/ProcessingOverlay';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
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
  const [loading, setLoading] = useState(true);

  // Monitor Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Load user sessions
        const userSessions = await sessionStorageService.getSessionsForUser(firebaseUser.uid);
        setSessions(userSessions);
        intelligenceService.learnFromSessions(userSessions).then(setNeuralInsight);
        setAppState(AppState.DASHBOARD);
      } else {
        setUser(null);
        setAppState(AppState.LANDING);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  // Check if user info exists in Firebase and set state accordingly



  // If existing user in Firebase Auth, load their info
  useEffect(() => {
    if (loading) return;
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      setUser(firebaseUser);
      sessionStorageService.getSessionsForUser(firebaseUser.uid).then((userSessions) => {
        setSessions(userSessions);
        intelligenceService.learnFromSessions(userSessions).then(setNeuralInsight);
      });
      setAppState(AppState.DASHBOARD);
    }
  }, [loading]);




  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorageService.saveTheme(theme);
  }, [theme]);

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

  // Login handler (called after Firebase Auth succeeds in LoginModal)
  const handleLogin = async (loggedInUser: UserLocal) => {
    setUser(loggedInUser);
    // Persist basic user info locally (no password) for UX only
    localStorageService.saveUser(loggedInUser);
    setIsLoginModalOpen(false);
    setAppState(AppState.DASHBOARD);

    // Load this user's study sessions from Firestore
    const userSessions = await sessionStorageService.getSessionsForUser(loggedInUser.id);
    setSessions(userSessions);
    intelligenceService.learnFromSessions(userSessions).then(setNeuralInsight);
  };

  const handleLogout = async () => {
    // Sign out from Firebase auth session
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

  const handleProfileUpdate = (updated: UserLocal) => {
    setUser(updated);
    localStorageService.saveUser(updated);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = (e.target?.result as string).split(',')[1];
        const {
          studyPlan,
          flashcards,
          isStudyMaterial,
          validityWarning,
        } = await geminiService.processStudyContent(base64Data, file.name, file.type);
        const newSession: StudySession = {
          id: crypto.randomUUID(),
          userId: user.id,
          fileName: file.name,
          fileType: file.type,
          createdAt: new Date().toISOString(),
          studyPlan,
          flashcards,
          completedSteps: [],
          drillCompleted: false,
          isPotentiallyInvalid: !isStudyMaterial,
          validityWarning: validityWarning
        };
        await sessionStorageService.saveSession(newSession);
        const updatedSessions = await sessionStorageService.getSessionsForUser(user.id);
        setSessions(updatedSessions);
        setActiveSession(newSession);
        setAppState(AppState.STUDY_PLAN);
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert("An error occurred during extraction.");
    }
  };

  const updateActiveSession = (updated: StudySession) => {
    setActiveSession(updated);
    // Persist updates to Firestore and refresh the session list for this user
    sessionStorageService.saveSession(updated).catch(console.error);
    if (user) {
      sessionStorageService
        .getSessionsForUser(user.id)
        .then(setSessions)
        .catch(console.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300">
      <Header 
        user={user} 
        onLoginClick={() => setIsLoginModalOpen(true)} 
        onLogout={handleLogout} 
        onDashboardClick={() => setAppState(AppState.DASHBOARD)} 
        onLogoClick={() => setAppState(AppState.LANDING)}
        onProfileClick={() => setIsProfileModalOpen(true)}
        currentTheme={theme}
        onThemeChange={setTheme}
      />
      <main className="grow w-full max-w-7xl mx-auto px-4">
        {appState === AppState.LANDING && <Landing onGetStarted={() => setIsLoginModalOpen(true)} />}
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
                const updated = await sessionStorageService.getSessionsForUser(user.id);
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
            onViewFlashcards={() => { setActiveStepTitle(null); setAppState(AppState.FLASHCARDS); }} 
            onStepAction={(title) => { setActiveStepTitle(title); setAppState(AppState.FLASHCARDS); }} 
            onStartQuiz={async () => setAppState(AppState.QUIZ)} 
          />
        )}
        {appState === AppState.FLASHCARDS && activeSession && (
          <FlashcardView 
            flashcards={activeSession.flashcards || []} 
            onBack={() => { setActiveStepTitle(null); setAppState(AppState.STUDY_PLAN); }} 
            onComplete={(r) => { 
              const c = activeSession.completedSteps || [];
              let updatedSteps = c;
              if (activeStepTitle && !c.includes(activeStepTitle)) {
                updatedSteps = [...c, activeStepTitle];
              }
              updateActiveSession({
                ...activeSession, 
                drillCompleted: true, 
                performanceRating: r,
                completedSteps: updatedSteps
              }); 
              setActiveStepTitle(null);
              setAppState(AppState.STUDY_PLAN); 
            }} 
          />
        )}
        {appState === AppState.QUIZ && currentQuiz.length > 0 && <QuizView questions={currentQuiz} onBack={() => setAppState(AppState.STUDY_PLAN)} onComplete={(s, t) => { updateActiveSession({...activeSession, quizHistory: [{score: s, total: t, date: new Date().toISOString()}, ...(activeSession.quizHistory || [])]}); setAppState(AppState.STUDY_PLAN); }} />}
      </main>
      <Footer />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
      {user && <ProfileModal user={user} isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} onUpdate={handleProfileUpdate} />}
      {isProcessing && <ProcessingOverlay />}
    </div>
  );
};

export default App;
