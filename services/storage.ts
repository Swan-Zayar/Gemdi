
import { User, StudySession } from '../types';

const USER_KEY = 'gemdi_current_user';
const REGISTRY_KEY = 'gemdi_user_registry';
const THEME_KEY = 'gemdi_theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export const storageService = {
  // --- User Auth ---
  saveUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      // Also update registry to ensure latest data (like avatar) is saved
      const registry = storageService.getRegistry();
      registry[user.email.toLowerCase()] = user;
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  getRegistry: (): Record<string, User> => {
    const data = localStorage.getItem(REGISTRY_KEY);
    return data ? JSON.parse(data) : {};
  },

  findUserByEmail: (email: string): User | null => {
    const registry = storageService.getRegistry();
    return registry[email.toLowerCase()] || null;
  },

  registerUser: (user: User) => {
    const registry = storageService.getRegistry();
    registry[user.email.toLowerCase()] = user;
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
  },

  // --- Sessions (Scoped by User ID) ---
  saveSession: (session: StudySession) => {
    const allSessions = storageService.getAllSessions();
    const existingIndex = allSessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      allSessions[existingIndex] = session;
    } else {
      allSessions.unshift(session);
    }
    localStorage.setItem('gemdi_sessions_v2', JSON.stringify(allSessions));
  },

  getAllSessions: (): StudySession[] => {
    const data = localStorage.getItem('gemdi_sessions_v2');
    return data ? JSON.parse(data) : [];
  },

  getSessionsForUser: (userId: string): StudySession[] => {
    return storageService.getAllSessions().filter(s => s.userId === userId);
  },

  deleteSession: (id: string) => {
    const sessions = storageService.getAllSessions().filter(s => s.id !== id);
    localStorage.setItem('gemdi_sessions_v2', JSON.stringify(sessions));
  },

  // --- Global ---
  saveTheme: (theme: ThemeMode) => {
    localStorage.setItem(THEME_KEY, theme);
  },

  getTheme: (): ThemeMode => {
    return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'light';
  }
};
