
import React from 'react';
import { UserLocal } from '../types';
import { ThemeMode } from '../services/storage';

interface HeaderProps {
  user: UserLocal | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onDashboardClick: () => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const GemdiLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#2dd4bf" />
      </linearGradient>
    </defs>
    <path d="M50 5 L90 35 L50 95 L10 35 Z" fill="url(#gemGradient)" className="drop-shadow-xl" />
    <path d="M50 5 L90 35 L50 45 Z" fill="white" fillOpacity="0.1" />
    <path d="M50 5 L10 35 L50 45 Z" fill="black" fillOpacity="0.05" />
    <path d="M32 45 L45 58 L68 32" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogout, onDashboardClick, onLogoClick, onProfileClick, currentTheme, onThemeChange }) => {
  const modes: ThemeMode[] = ['light', 'dark'];
  const activeIndex = modes.indexOf(currentTheme);

  return (
    <nav className="sticky top-0 z-50 px-3 sm:px-6 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-4 sm:px-8 py-2 sm:py-3 rounded-3xl sm:rounded-[2.5rem] chic-shadow border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2 sm:gap-4 cursor-pointer group" onClick={onLogoClick}>
          <GemdiLogo className="w-8 h-8 sm:w-10 sm:h-10 transform-gpu transition-all duration-500 group-hover:scale-110" />
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Gemdi</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-8">
          {/* Refined Theme Switcher */}
          <div className="relative bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-full flex items-center w-15 sm:w-22 h-8 sm:h-9">
            <div 
              className={`absolute h-6 sm:h-7 w-6.5 sm:w-9.5 bg-white dark:bg-slate-700 rounded-full shadow-sm transition-all duration-300 z-0 ${
                activeIndex === 1 ? 'translate-x-6.5 sm:translate-x-10' : 'translate-x-0'
              }`}
            ></div>
            {modes.map(mode => (
              <button 
                key={mode} 
                onClick={() => onThemeChange(mode)} 
                className={`relative z-10 flex-1 flex items-center justify-center h-full transition-colors ${
                  currentTheme === mode ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-500'
                }`}
                aria-label={`Switch to ${mode} mode`}
              >
                {mode === 'light' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l.707.707M6.343 6.343l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                  </svg>
                )}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-3 sm:gap-6">
              <div 
                className="flex items-center gap-2 sm:gap-3 bg-white/50 dark:bg-slate-800/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer group"
                onClick={onProfileClick}
              >
                <img src={user.avatar} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover" alt="Profile" />
                <span className="hidden sm:block text-xs font-bold text-slate-600 dark:text-slate-300">{user.name.split(' ')[0]}</span>
              </div>
              <button onClick={onLogout} className="text-[10px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors">
                <span className="hidden sm:inline">Log Out</span>
                <svg className="sm:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7"></path>
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick} 
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
