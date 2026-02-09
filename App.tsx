import React, { useState, useEffect, useCallback } from 'react';
import { auth } from './firebaseCLI';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import Header from './components/Header';
import Landing from './components/Landing';
import LoginModal from './components/LoginModal';
import ProfileModal from './components/ProfileModal';
import ProfileSetupModal from './components/ProfileSetupModal';
import Dashboard from './components/Dashboard';
import StudyPlanView from './components/StudyPlanView';
import QuizView from './components/QuizView';
import FlashcardView from './components/FlashcardView';
import ProcessingOverlay from './components/ProcessingOverlay';
import Footer from './components/Footer';
import { AppState, StudySession, QuizQuestion, UserLocal } from './types';
import { themeService, ThemeMode } from './services/theme';
import * as sessionStorageService from './firebaseStorageService';
import * as userProfileService from './userProfileService';
import { geminiService } from './services/gemini';
import { intelligenceService } from './services/intelligence';
import { I18nProvider } from './services/i18n';
import { validateUploadFile } from './services/fileValidation';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserLocal | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [activeStepTitle, setActiveStepTitle] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [neuralInsight, setNeuralInsight] = useState<string>('');
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [isQuizReady, setIsQuizReady] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(themeService.getTheme());

  /** Shared: load profile + sessions for a given Firebase user */
  const loadUserData = async (firebaseUser: User) => {
    setLoadingDashboard(true);

    const profile = await userProfileService.getUserProfile(firebaseUser.uid);
    if (profile) {
      setUserProfile({
        id: profile.userId,
        name: profile.username,
        email: firebaseUser.email || '',
        avatar: profile.avatar,
        language: profile.language || 'en',
        customPrompt: profile.customPrompt
      });
      setAppState(AppState.DASHBOARD);
    } else {
      setIsProfileSetupOpen(true);
      setAppState(AppState.LANDING);
      setLoadingDashboard(false);
    }

    try {
      const userSessions = await sessionStorageService.getSessionsForUser(firebaseUser.uid);
      if (import.meta.env.DEV) console.log('Sessions loaded:', userSessions.length);
      setSessions(userSessions || []);
      if (userSessions && userSessions.length > 0) {
        intelligenceService.learnFromSessions(userSessions)
          .then(setNeuralInsight)
          .catch(err => console.warn('Intelligence service error:', err));
      }
    } catch (error) {
      console.error('Error loading user sessions:', error);
      setSessions([]);
    } finally {
      if (profile) {
        setLoadingDashboard(false);
      }
    }
  };

  /** Listen to Firebase auth state changes */
  useEffect(() => {
    if (import.meta.env.DEV) console.log('Setting up Firebase auth listener...');
    
    const timeout = setTimeout(() => {
      console.warn('Firebase auth initialization timed out after 5 seconds');
      setLoadingAuth(false);
    }, 5000);
  
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (import.meta.env.DEV) console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
        clearTimeout(timeout);
        
        if (firebaseUser) {
          if (import.meta.env.DEV) console.log('User authenticated:', firebaseUser.uid);
          setUser(firebaseUser);
          await loadUserData(firebaseUser);
        } else {
          if (import.meta.env.DEV) console.log('No user, showing landing page');
          setUser(null);
          setAppState(AppState.LANDING);
          setSessions([]);
          setLoadingDashboard(false);
        }
        setLoadingAuth(false);
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

  /** Apply theme preference */
  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (mode: ThemeMode) => {
      if (mode === 'dark') {
        root.classList.add('dark');
        return;
      }
      if (mode === 'light') {
        root.classList.remove('dark');
        return;
      }
      if (mediaQuery.matches) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    applyTheme(themeMode);

    const handler = (e: MediaQueryListEvent) => {
      if (themeMode === 'system') {
        if (e.matches) root.classList.add('dark');
        else root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeMode]);

  /** File upload handler */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const fileError = validateUploadFile(file);
    if (fileError) {
      alert(fileError);
      event.target.value = '';
      return;
    }

    setIsProcessing(true);
    
    try {
      const newSession = await sessionStorageService.processAndCreateSession(
        file, 
        user.uid,
        userProfile?.customPrompt
      );
      
      setSessions(prev => [newSession, ...prev]);
      
    } catch (error: any) {
      console.error('Error processing file:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      const userMessage = errorMessage.includes('API key') 
        ? 'API configuration error. Please contact support.'
        : errorMessage.includes('quota')
        ? 'API quota exceeded. Please try again later.'
        : errorMessage.includes('size')
        ? 'File is too large. Please use a file under 50MB.'
        : `Failed to process file: ${errorMessage}`;
      alert(userMessage);
    } finally {
      setIsProcessing(false);
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
    if (import.meta.env.DEV) console.log('handleLogin called for:', loggedInUser.uid);
    setUser(loggedInUser);
    setIsLoginModalOpen(false);
    await loadUserData(loggedInUser);
  };

  /** Profile setup completion handler */
  const handleProfileSetupComplete = async (username: string, avatar: string) => {
    if (!user) return;

    const profile: userProfileService.UserProfile = {
      userId: user.uid,
      username,
      avatar,
      createdAt: new Date().toISOString(),
      language: userProfile?.language,
      customPrompt: userProfile?.customPrompt
    };

    await userProfileService.saveUserProfile(profile);
    
    setUserProfile({
      id: user.uid,
      name: username,
      email: user.email || '',
      avatar
    });
    
    setIsProfileSetupOpen(false);
    setAppState(AppState.DASHBOARD);
  };

  /** Logout handler */
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Error signing out from Firebase', e);
    }
    setUser(null);
    setUserProfile(null);
    setAppState(AppState.LANDING);
    setActiveSession(null);
    setSessions([]);
  };

  /** Update active session */
  const updateActiveSession = (updated: StudySession) => {
    setActiveSession(updated);
    sessionStorageService.saveSession(updated).catch(console.error);
    setSessions(prev => prev.map(session => session.id === updated.id ? updated : session));
  };

  /** Update user profile */
  const handleProfileUpdate = async (updatedProfile: UserLocal) => {
    if (!user) return;

    const updates: Partial<userProfileService.UserProfile> = {
      username: updatedProfile.name,
      avatar: updatedProfile.avatar,
      language: updatedProfile.language,
      customPrompt: updatedProfile.customPrompt
    };

    if (updates.language === undefined) delete updates.language;
    if (updates.customPrompt === undefined) delete updates.customPrompt;

    await userProfileService.updateUserProfile(user.uid, updates);
    
    setUserProfile(updatedProfile);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    themeService.saveTheme(mode);
  };

  const handleCustomPromptChange = async (prompt: string) => {
    if (!user || !userProfile) return;
    
    const updatedProfile = { ...userProfile, customPrompt: prompt };
    await userProfileService.updateUserProfile(user.uid, {
      customPrompt: prompt
    });
    setUserProfile(updatedProfile);
  };


  /** Rename session */
  const handleRenameSession = async (id: string, newName: string) => {
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    const updatedSession = { ...session, sessionName: newName };
    await sessionStorageService.saveSession(updatedSession);

    setSessions(prev => prev.map(s => s.id === id ? updatedSession : s));

    if (activeSession?.id === id) {
      setActiveSession(updatedSession);
    }
  };

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
    <I18nProvider defaultLanguage={(userProfile?.language as any) || 'en'}>
      <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300">
        <Header
          user={userProfile}
          onLoginClick={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onLogoClick={() => setAppState(user ? AppState.DASHBOARD : AppState.LANDING)}
          onProfileClick={() => setIsProfileModalOpen(true)}
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
                  setSessions(prev => prev.filter(session => session.id !== id));
                  if (activeSession?.id === id) {
                    setActiveSession(null);
                  }
                }}
                onRenameSession={handleRenameSession}
                neuralInsight={neuralInsight}
                customPrompt={userProfile?.customPrompt}
                onCustomPromptChange={handleCustomPromptChange}
              />
            )}

            {appState === AppState.STUDY_PLAN && activeSession && (
              <StudyPlanView
                session={activeSession}
                onViewFlashcards={() => {
                  setActiveStepTitle(null);
                  setAppState(AppState.FLASHCARDS);
                }}
                onStepAction={(title) => {
                  setActiveStepTitle(title);
                  setAppState(AppState.FLASHCARDS);
                }}
                onStartQuiz={async () => setAppState(AppState.QUIZ)}
                onBack={() => setAppState(AppState.DASHBOARD)}
              />
            )}

            {appState === AppState.FLASHCARDS && activeSession && (
              <FlashcardView
                flashcards={activeStepTitle 
                  ? (activeSession.flashcards || []).filter(fc => fc.stepTitle === activeStepTitle)
                  : activeSession.flashcards || []}
                stepTitle={activeStepTitle}
                onBack={() => {
                  setActiveStepTitle(null);
                  setAppState(AppState.STUDY_PLAN);
                }}
                onComplete={(r) => {
                  const c = activeSession.completedSteps || [];
                  const updatedSteps = activeStepTitle && !c.includes(activeStepTitle) ? [...c, activeStepTitle] : c;
                  const updatedSession = {
                    ...activeSession,
                    drillCompleted: true,
                    performanceRating: r,
                    completedSteps: updatedSteps,
                  };
                  updateActiveSession(updatedSession);
                  
                  if (sessions && sessions.length > 0) {
                    intelligenceService.learnFromSessions(sessions)
                      .then(setNeuralInsight)
                      .catch(err => console.warn('Intelligence service error:', err));
                  }
                  
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
      {userProfile && (
        <ProfileModal
          user={userProfile}
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdate={handleProfileUpdate}
          themeMode={themeMode}
          onThemeChange={handleThemeChange}
        />
      )}
      <ProfileSetupModal isOpen={isProfileSetupOpen} onComplete={handleProfileSetupComplete} />
      {(isProcessing || loadingDashboard) && <ProcessingOverlay />}
      </div>
    </I18nProvider>
  );
};

export default App;