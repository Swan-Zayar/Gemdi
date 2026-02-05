const THEME_KEY = 'gemdi_theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export const themeService = {
  saveTheme: (theme: ThemeMode) => {
    localStorage.setItem(THEME_KEY, theme);
  },

  getTheme: (): ThemeMode => {
    return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'system';
  }
};
