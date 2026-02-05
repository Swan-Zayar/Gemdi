
const THEME_KEY = 'gemdi_theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export const storageService = {
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
    return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'system';
  }
};
