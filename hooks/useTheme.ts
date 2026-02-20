import { useState, useEffect } from 'react';
import { themeService, ThemeMode } from '../services/theme';

function applyThemeToDOM(mode: ThemeMode) {
  const root = document.documentElement;
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = mode === 'dark' || (mode === 'system' && mediaQuery.matches);
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  root.style.colorScheme = isDark ? 'dark' : 'light';
}

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(themeService.getTheme());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    applyThemeToDOM(themeMode);

    const handler = () => {
      if (themeMode === 'system') {
        applyThemeToDOM('system');
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeMode]);

  const handleThemeChange = (mode: ThemeMode) => {
    applyThemeToDOM(mode);
    setThemeMode(mode);
    themeService.saveTheme(mode);
  };

  return { themeMode, handleThemeChange };
}
