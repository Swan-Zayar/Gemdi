
import React, { useState, useEffect, useCallback } from 'react';
import { User, StudySession, AppState, QuizQuestion, StudyStep } from './types';
import { storageService, ThemeMode } from './services/storage';
import { geminiService } from './services/gemini';
import { intelligenceService } from './services/intelligence';
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
  const [theme, setTheme] = useState<ThemeMode>(storageService.getTheme());

  useEffect(() => {
    const savedUser = storageService.getUser();
    if (savedUser) {
      setUser(savedUser);
      setAppState(AppState.DASHBOARD);
      const userSessions = storageService.getSessionsForUser(savedUser.id);
      setSessions(userSessions);
      intelligenceService.learnFromSessions(userSessions).then(setNeuralInsight);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    storageService.saveTheme(theme);
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

  const handleLogin = (mockUser: User) => {
    setUser(mockUser);
    storageService.saveUser(mockUser);
    setIsLoginModalOpen(false);
    setAppState(AppState.DASHBOARD);
    const userSessions = storageService.getSessionsForUser(mockUser.id);
    setSessions(userSessions);
  };

  const handleLogout = () => {
    setUser(null);
    storageService.saveUser(null);
    setAppState(AppState.LANDING);
    setSessions([]);
  };

  const handleProfileUpdate = (updated: User) => {
    setUser(updated);
    storageService.saveUser(updated);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = (e.target?.result as string).split(',')[1];
        const { studyPlan, flashcards, isStudyMaterial, validityWarning } = await geminiService.processStudyContent(base64Data, file.name, file.type);
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
        storageService.saveSession(newSession);
        const updatedSessions = storageService.getSessionsForUser(user.id);
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
    storageService.saveSession(updated);
    if (user) setSessions(storageService.getSessionsForUser(user.id));
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
      <main className="flex-grow w-full max-w-7xl mx-auto px-4">
        {appState === AppState.LANDING && <Landing onGetStarted={() => setIsLoginModalOpen(true)} />}
        {appState === AppState.DASHBOARD && <Dashboard sessions={sessions} onUpload={handleFileUpload} onOpenSession={(s) => { setActiveSession(s); setAppState(AppState.STUDY_PLAN); }} onDeleteSession={(id) => { storageService.deleteSession(id); if(user) setSessions(storageService.getSessionsForUser(user.id)); }} neuralInsight={neuralInsight} />}
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
