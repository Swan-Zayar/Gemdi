
import React, { useState, useEffect } from 'react';
import { UserLocal } from '../types';
import { useTranslation } from '../services/i18n';

interface HeaderProps {
  user: UserLocal | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onLogoClick: () => void;
  onProfileClick: () => void;
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

const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogout, onLogoClick, onProfileClick }) => {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 px-3 sm:px-6 py-3 sm:py-4">
      <div 
        className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-4 sm:px-8 py-2 sm:py-3 rounded-3xl sm:rounded-[2.5rem] chic-shadow border border-slate-200/50 dark:border-slate-700/50 cursor-pointer transition-all hover:border-slate-300/50 dark:hover:border-slate-600/50"
        onClick={scrollToTop}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 cursor-pointer group" onClick={onLogoClick}>
            <GemdiLogo className="w-8 h-8 sm:w-10 sm:h-10 transform-gpu transition-all duration-500 group-hover:scale-110" />
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">Gemdi</span>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowHowTo(true);
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 flex items-center justify-center transition-all group"
            title="How to use Gemdi"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-8">
          {/* Local Time Display */}
          <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <svg className="w-4 h-4 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              {formatTime(currentTime)}
            </span>
          </div>

          {user ? (
            <div className="flex items-center gap-3 sm:gap-6">
              <div 
                className="flex items-center gap-2 sm:gap-3 bg-white/50 dark:bg-slate-800/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 cursor-pointer group"
                onClick={onProfileClick}
              >
                <img key={user.avatar} src={user.avatar} className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover" alt="Profile" />
                <span className="hidden sm:block text-xs font-bold text-slate-600 dark:text-slate-300">{user.name?.split(' ')[0] || 'User'}
                </span>
              </div>
              <button onClick={onLogout} className="text-[10px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors">
                <span className="hidden sm:inline">{t('common.logout')}</span>
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
              {t('common.login')}
            </button>
          )}
        </div>
      </div>

      {showHowTo && (
        <div className="fixed inset-0 z-1002 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn" onClick={() => setShowHowTo(false)}>
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowHowTo(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors z-10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="p-8 sm:p-10 overflow-y-auto">
              <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('howTo.title')}</h2>
            </div>

            <div className="space-y-6 text-slate-600 dark:text-slate-300">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">1</span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white mb-2">{t('howTo.step1Title')}</h3>
                    <p className="text-sm leading-relaxed">{t('howTo.step1Desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">2</span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white mb-2">{t('howTo.step2Title')}</h3>
                    <p className="text-sm leading-relaxed">{t('howTo.step2Desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">3</span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white mb-2">{t('howTo.step3Title')}</h3>
                    <p className="text-sm leading-relaxed">{t('howTo.step3Desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">4</span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white mb-2">{t('howTo.step4Title')}</h3>
                    <p className="text-sm leading-relaxed">{t('howTo.step4Desc')}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <span className="text-indigo-600 dark:text-indigo-400 font-black">5</span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white mb-2">{t('howTo.step5Title')}</h3>
                    <p className="text-sm leading-relaxed">{t('howTo.step5Desc')}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                  <span className="font-black">{t('howTo.proTip')}</span> {t('howTo.proTipDesc')}
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
