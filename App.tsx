import React, { useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import Landing from './components/Landing';
import LoginModal from './components/LoginModal';
import ProfileModal from './components/ProfileModal';
import ProfileSetupModal from './components/ProfileSetupModal';
import Dashboard from './components/Dashboard';
import StudyPlanView from './components/StudyPlanView';
import QuizView from './components/QuizView';
import FlashcardView from './components/FlashcardView';
import ProcessingOverlay from './components/ProcessingOverlay';
import { AppState, StudySession, QuizQuestion, UserLocal } from './types';
import { ThemeMode } from './services/theme';
import * as sessionStorageService from './services/firebaseStorageService';
import * as userProfileService from './services/userProfileService';
import { geminiService } from './services/gemini';
import { I18nProvider } from './services/i18n';
import { validateUploadFile } from './services/fileValidation';
import OnboardingTour from './components/OnboardingTour';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useFileUpload } from './hooks/useFileUpload';
import { useQuiz } from './hooks/useQuiz';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserLocal | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [activeStepTitle, setActiveStepTitle] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [studyStreak, setStudyStreak] = useState(0);
  const [isTourOpen, setIsTourOpen] = useState(false);

  const { themeMode, handleThemeChange } = useTheme();

  const { user, loadingAuth, loadingDashboard, handleLogin, handleLogout } = useAuth({
    onUserLoaded: ({ userProfile: profile, sessions: loadedSessions, studyStreak: streak }) => {
      setUserProfile(profile);
      setSessions(loadedSessions);
      setStudyStreak(streak);
      setAppState(AppState.DASHBOARD);
    },
    onSetProfileSetupOpen: (open) => {
      setIsProfileSetupOpen(open);
      if (open) setAppState(AppState.LANDING);
    },
    onLoggedOut: () => {
      setUserProfile(null);
      setAppState(AppState.LANDING);
      setActiveSession(null);
      setSessions([]);
    },
  });

  const handleLoginFromModal = async (loggedInUser: User) => {
    setIsLoginModalOpen(false);
    await handleLogin(loggedInUser);
  };

  const handleLogoutFromApp = async () => {
    await handleLogout();
  };

  const { overlayVisible, processingFileName, processingComplete, processingError,
    handleFileUpload, handleOverlayDismiss, handleOverlayCancel } = useFileUpload(
    user?.uid ?? null,
    userProfile?.customPrompt,
    (newSession) => setSessions(prev => [newSession, ...prev])
  );

  const { currentQuiz, isQuizLoading, handleStartQuiz } = useQuiz(
    activeSession,
    () => setAppState(AppState.QUIZ),
    () => setAppState(AppState.STUDY_PLAN)
  );

  /** Profile setup completion handler */
  const handleProfileSetupComplete = async (username: string, avatar: string) => {
    if (!user) return;

    const profile: userProfileService.UserProfile = {
      userId: user.uid,
      username,
      avatar,
      createdAt: new Date().toISOString(),
      language: userProfile?.language ?? 'en',
      ...(userProfile?.customPrompt ? { customPrompt: userProfile.customPrompt } : {}),
    };

    try {
      await userProfileService.saveUserProfile(profile);
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }

    setUserProfile({
      id: user.uid,
      name: username,
      email: user.email || '',
      avatar
    });

    setIsProfileSetupOpen(false);
    setAppState(AppState.DASHBOARD);
    setIsTourOpen(true);
  };

  const handleTourDone = async () => {
    setIsTourOpen(false);
    if (user) {
      await userProfileService.updateUserProfile(user.uid, { hasSeenTutorial: true });
    }
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

  const handleCustomPromptChange = async (prompt: string) => {
    if (!user || !userProfile) return;
    const updatedProfile = { ...userProfile, customPrompt: prompt };
    await userProfileService.updateUserProfile(user.uid, { customPrompt: prompt });
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
                customPrompt={userProfile?.customPrompt}
                onCustomPromptChange={handleCustomPromptChange}
                user={userProfile}
                onProfileClick={() => setIsProfileModalOpen(true)}
                studyStreak={studyStreak}
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
                onStartQuiz={handleStartQuiz}
                isQuizLoading={isQuizLoading}
                onBack={() => setAppState(AppState.DASHBOARD)}
                user={userProfile}
                onProfileClick={() => setIsProfileModalOpen(true)}
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
                onComplete={() => {
                  const c = activeSession.completedSteps || [];
                  const updatedSteps = activeStepTitle && !c.includes(activeStepTitle) ? [...c, activeStepTitle] : c;
                  const updatedSession = {
                    ...activeSession,
                    drillCompleted: true,
                    completedSteps: updatedSteps,
                  };
                  updateActiveSession(updatedSession);
                  setActiveStepTitle(null);
                  setAppState(AppState.STUDY_PLAN);
                }}
              />
            )}

            {appState === AppState.QUIZ && (
              <QuizView
                questions={currentQuiz}
                isLoading={isQuizLoading}
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
          <Landing onGetStarted={() => setIsLoginModalOpen(true)} onLoginClick={() => setIsLoginModalOpen(true)} />
        )}
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLoginFromModal} />
        {userProfile && (
          <ProfileModal
            user={userProfile}
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            onUpdate={handleProfileUpdate}
            onLogout={handleLogoutFromApp}
            themeMode={themeMode}
            onThemeChange={handleThemeChange}
          />
        )}
        <ProfileSetupModal isOpen={isProfileSetupOpen} onComplete={handleProfileSetupComplete} />
        {isTourOpen && appState === AppState.DASHBOARD && (
          <OnboardingTour onDone={handleTourDone} />
        )}
        {loadingDashboard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        )}
        {overlayVisible && (
          <ProcessingOverlay
            fileName={processingFileName}
            isComplete={processingComplete}
            error={processingError}
            onDismiss={handleOverlayDismiss}
            onCancel={handleOverlayCancel}
            allowMinimize
          />
        )}
      </div>
    </I18nProvider>
  );
};

export default App;
