import { useState, useEffect } from 'react';
import { auth } from '../services/firebaseCLI';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import * as sessionStorageService from '../services/firebaseStorageService';
import * as userProfileService from '../services/userProfileService';
import { StudySession, UserLocal } from '../types';

export interface UserLoadedPayload {
  userProfile: UserLocal;
  sessions: StudySession[];
  studyStreak: number;
}

interface UseAuthOptions {
  onUserLoaded: (payload: UserLoadedPayload) => void;
  onSetProfileSetupOpen: (open: boolean) => void;
  onLoggedOut: () => void;
}

export function useAuth({ onUserLoaded, onSetProfileSetupOpen, onLoggedOut }: UseAuthOptions) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const loadUserData = async (firebaseUser: User) => {
    setLoadingDashboard(true);

    let profile: userProfileService.UserProfile | null = null;
    try {
      profile = await userProfileService.getUserProfile(firebaseUser.uid);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoadingDashboard(false);
      return;
    }

    if (!profile) {
      onSetProfileSetupOpen(true);
      setLoadingDashboard(false);
      return;
    }

    const updatedDates = await userProfileService.recordLogin(
      firebaseUser.uid,
      profile.loginDates || []
    );
    const studyStreak = userProfileService.calculateStreak(updatedDates);

    const userProfile: UserLocal = {
      id: profile.userId,
      name: profile.username,
      email: firebaseUser.email || '',
      avatar: profile.avatar,
      language: profile.language || 'en',
      customPrompt: profile.customPrompt
    };

    let sessions: StudySession[] = [];
    try {
      sessions = await sessionStorageService.getSessionsForUser(firebaseUser.uid);
      if (import.meta.env.DEV) console.log('Sessions loaded:', sessions.length);
    } catch (error) {
      console.error('Error loading user sessions:', error);
    }

    onUserLoaded({ userProfile, sessions, studyStreak });
    setLoadingDashboard(false);
  };

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
          setLoadingDashboard(false);
          onLoggedOut();
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

  const handleLogin = async (loggedInUser: User) => {
    if (import.meta.env.DEV) console.log('handleLogin called for:', loggedInUser.uid);
    setUser(loggedInUser);
    await loadUserData(loggedInUser);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Error signing out from Firebase', e);
    }
    setUser(null);
    onLoggedOut();
  };

  return { user, loadingAuth, loadingDashboard, handleLogin, handleLogout };
}
