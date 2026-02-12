import React, { useRef, useState, useEffect } from 'react';
import { StudySession, UserLocal } from '../types';
import { useTranslation } from '../services/i18n';
import { validateCustomPrompt } from '../services/validation';
import { GemdiLogo } from './GemdiLogo';

interface DashboardProps {
  sessions: StudySession[];
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenSession: (session: StudySession) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  neuralInsight: string;
  customPrompt?: string;
  onCustomPromptChange: (prompt: string) => void;
  user: UserLocal | null;
  onProfileClick: () => void;
  studyStreak?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ sessions, onUpload, onOpenSession, onDeleteSession, onRenameSession, neuralInsight, customPrompt, onCustomPromptChange, user, onProfileClick, studyStreak = 0 }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCustomPromptModal, setShowCustomPromptModal] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(customPrompt || '');
  const [promptError, setPromptError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [deletingSession, setDeletingSession] = useState<string | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameSessionId, setRenameSessionId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHowTo, setShowHowTo] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const userInitials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const filteredSessions = sessions.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (s.sessionName || s.fileName).toLowerCase().includes(q);
  });

  const totalCards = sessions.reduce((sum, s) => sum + (s.flashcards?.length || 0), 0);
  const quizzesPassed = sessions.reduce((sum, s) => sum + (s.quizHistory?.length || 0), 0);

  const startEditing = (e: React.MouseEvent, session: StudySession) => {
    e.stopPropagation();
    setRenameSessionId(session.id);
    setRenameName(session.sessionName || session.fileName);
    setShowRenameModal(true);
  };

  const saveRename = () => {
    if (renameSessionId && renameName.trim()) {
      onRenameSession(renameSessionId, renameName.trim());
    }
    setShowRenameModal(false);
    setRenameSessionId(null);
    setRenameName('');
  };

  const cancelRename = () => {
    setShowRenameModal(false);
    setRenameSessionId(null);
    setRenameName('');
  };

  const confirmDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (sessionToDelete) {
      setDeletingSession(sessionToDelete);
      setShowDeleteModal(false);
      setTimeout(() => {
        onDeleteSession(sessionToDelete);
        setSessionToDelete(null);
        setDeletingSession(null);
      }, 600);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSessionToDelete(null);
  };

  const handleSaveCustomPrompt = () => {
    const validation = validateCustomPrompt(tempPrompt);
    if (!validation.valid) {
      setPromptError(validation.error || 'Invalid prompt');
      return;
    }
    onCustomPromptChange(tempPrompt);
    setPromptError(null);
    setShowCustomPromptModal(false);
  };

  const handleOpenCustomPrompt = () => {
    setTempPrompt(customPrompt || '');
    setPromptError(null);
    setShowCustomPromptModal(true);
  };

  const getProgress = (session: StudySession) => {
    if (!session.studyPlan || session.studyPlan.steps.length === 0) return 0;
    return Math.round(((session.completedSteps?.length || 0) / session.studyPlan.steps.length) * 100);
  };

  const getFileTypeBadge = (fileType: string) => {
    const ext = fileType.split('/')[1]?.toUpperCase() || 'DOC';
    if (ext === 'PDF' || fileType.includes('pdf')) {
      return { text: 'PDF', bg: 'bg-red-50 dark:bg-red-900/20', color: 'text-red-500' };
    }
    return { text: 'DOCX', bg: 'bg-indigo-50 dark:bg-indigo-900/20', color: 'text-indigo-500' };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fadeIn">
      {/* Inline Header */}
      <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <GemdiLogo className="w-6 h-6" gradientId="dashGrad" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Gemdi</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium tabular-nums">{formatTime(currentTime)}</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHowTo(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">{t('dashboard.howToUse')}</span>
          </button>
          <button
            onClick={onProfileClick}
            className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              userInitials
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* Upload Section */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl p-8 sm:p-10"
          style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)' }}
        >
          <div>
            <h2 className="text-2xl font-extrabold text-white mb-3">{t('dashboard.uploadNewMaterial')}</h2>
            <p className="text-white/60 text-sm">{t('dashboard.dropPdfDocx')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-full font-semibold text-sm hover:bg-slate-100 transition-colors active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              {t('dashboard.chooseFile')}
            </button>
            <button
              onClick={handleOpenCustomPrompt}
              className="flex items-center gap-1.5 px-5 py-3 rounded-full border border-white/25 text-white text-sm font-medium hover:bg-white/10 transition-colors active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('dashboard.customizeAi')}
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onUpload}
            className="hidden"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">{t('dashboard.totalSessions')}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{sessions.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">{t('dashboard.cardsReviewed')}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalCards}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">{t('dashboard.quizzesPassed')}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{quizzesPassed}</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
            <p className="text-xs font-medium text-white/70 mb-2">{t('dashboard.studyStreak')}</p>
            <p className="text-3xl font-extrabold text-white">{studyStreak} {studyStreak === 1 ? t('dashboard.day') : t('dashboard.days')}</p>
            <p className="text-xs font-medium text-white/80 mt-1">
              {studyStreak >= 7 ? t('dashboard.streakFire') : studyStreak >= 3 ? t('dashboard.streakKeepUp') : studyStreak >= 1 ? t('dashboard.streakGreatStart') : t('dashboard.streakBuild')}
            </p>
          </div>
        </div>

        {/* Study Vault */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight">{t('dashboard.studyVault')}</h3>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('dashboard.searchSessions')}
                className="bg-transparent text-sm text-slate-600 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 outline-none w-40"
              />
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-16 text-center border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6 mx-auto text-slate-300 dark:text-slate-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">
                {searchQuery ? t('dashboard.noMatchingSessions') : t('dashboard.vaultEmpty')}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {searchQuery ? t('dashboard.tryDifferentSearch') : t('dashboard.startProcessing')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSessions.map((session) => {
                const progress = getProgress(session);
                const badge = getFileTypeBadge(session.fileType);
                const isComplete = progress === 100;

                return (
                  <div
                    key={session.id}
                    className={`group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col ${deletingSession === session.id ? 'animate-disappear' : ''}`}
                    onClick={() => onOpenSession(session)}
                  >
                    {/* Card Top */}
                    <div className="p-5 flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badge.bg} ${badge.color}`}>
                          {badge.text}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => startEditing(e, session)}
                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                            title={t('dashboard.rename')}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button
                            onClick={(e) => confirmDelete(e, session.id)}
                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title={t('common.delete')}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{session.sessionName || session.fileName}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{t('dashboard.created')} {new Date(session.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      {/* Progress */}
                      {session.studyPlan && session.studyPlan.steps.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{t('dashboard.progress')}</span>
                            <span className="text-[11px] font-bold text-indigo-500">{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}
                      {/* Quiz Score */}
                      {session.quizHistory && session.quizHistory.length > 0 && (() => {
                        const bestPct = Math.max(...session.quizHistory.map(q => Math.round((q.score / q.total) * 100)));
                        return (
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{t('dashboard.quiz')}</span>
                            <span className={`text-[11px] font-bold ${bestPct >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {bestPct}%
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    {/* Card Actions */}
                    <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-700 justify-end">
                      {isComplete ? (
                        <>
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {t('dashboard.mastered')}
                          </span>
                          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-xs font-semibold text-indigo-500">
                            {t('dashboard.review')}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-xs font-semibold text-indigo-500">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            {t('dashboard.study')}
                          </span>
                          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-xs font-semibold text-emerald-500">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            {t('dashboard.drill')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* How to Use Modal */}
      {showHowTo && (
        <div className="fixed inset-0 z-1002 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn" onClick={() => setShowHowTo(false)}>
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowHowTo(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors z-10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
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
                  {[
                    { key: 1, title: t('howTo.step1Title'), desc: t('howTo.step1Desc') },
                    { key: 2, title: t('howTo.step2Title'), desc: t('howTo.step2Desc') },
                    { key: 3, title: t('howTo.step3Title'), desc: t('howTo.step3Desc') },
                    { key: 4, title: t('howTo.step4Title'), desc: t('howTo.step4Desc') },
                    { key: 5, title: t('howTo.step5Title'), desc: t('howTo.step5Desc') },
                  ].map(step => (
                    <div key={step.key} className="flex gap-4">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <span className="text-indigo-600 dark:text-indigo-400 font-black">{step.key}</span>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white mb-2">{step.title}</h3>
                        <p className="text-sm leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-1002 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn" onClick={cancelDelete}>
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-4xl p-8 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-center mb-2">{t('dashboard.deleteSession')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
              {t('dashboard.deleteWarning')}
            </p>
            <div className="flex gap-3">
              <button onClick={cancelDelete} className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-2xl tracking-widest uppercase text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-all active:scale-95">
                {t('common.cancel')}
              </button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white font-black rounded-2xl tracking-widest uppercase text-sm hover:bg-red-700 transition-all active:scale-95">
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Confirmation Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-1002 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn" onClick={cancelRename}>
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-4xl p-8 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-center mb-2">{t('dashboard.renameSession')}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">{t('dashboard.enterNewName')}</p>
            <input
              type="text"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename();
                if (e.key === 'Escape') cancelRename();
              }}
              placeholder={t('dashboard.sessionName')}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-base text-slate-700 dark:text-slate-300 mb-6"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={cancelRename} className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-2xl tracking-widest uppercase text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-all active:scale-95">
                {t('common.cancel')}
              </button>
              <button onClick={saveRename} className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-2xl tracking-widest uppercase text-sm hover:bg-indigo-700 transition-all active:scale-95">
                {t('dashboard.rename')}
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-4">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">Enter</span> / <span className="font-bold">Esc</span>
            </p>
          </div>
        </div>
      )}

      {/* Custom Prompt Modal */}
      {showCustomPromptModal && (
        <div className="fixed inset-0 z-1002 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn" onClick={() => setShowCustomPromptModal(false)}>
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_32px_128px_-15px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 animate-slideUp flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Gradient Header */}
            <div className="px-8 sm:px-10 pt-8 sm:pt-10 pb-6 relative shrink-0" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)' }}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20"></div>
              <button onClick={() => setShowCustomPromptModal(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{t('dashboard.customizeAi')}</h2>
                  <p className="text-sm text-white/50 mt-1 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Applies to future uploads only
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 sm:px-10 py-6 space-y-5">
              <div>
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Custom Instructions</label>
                <textarea
                  value={tempPrompt}
                  onChange={(e) => { setTempPrompt(e.target.value); setPromptError(null); }}
                  placeholder="Add custom instructions for how Gemini should process your study materials..."
                  rows={5}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-slate-700 dark:text-slate-300 resize-none placeholder-slate-400 dark:placeholder-slate-600"
                  autoFocus
                />
                <div className="flex items-center justify-between mt-2 px-1">
                  <span className={`text-xs font-bold ${tempPrompt.length > 500 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                    {tempPrompt.length}/500 characters
                  </span>
                </div>
                {promptError && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl">
                    <p className="text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {promptError}
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-5">
                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Example Instructions</p>
                <div className="space-y-2.5">
                  {[
                    'Focus on practical examples and real-world applications',
                    'Include more mathematical proofs and derivations',
                    'Emphasize implementation details and code patterns',
                    'Add historical context and background information',
                  ].map((example, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 mt-1.5 shrink-0" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">&ldquo;{example}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 sm:px-10 pb-8 sm:pb-10 pt-4 flex gap-3 shrink-0">
              <button onClick={() => setShowCustomPromptModal(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-2xl tracking-widest uppercase text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 border border-slate-200 dark:border-slate-700">
                {t('common.cancel')}
              </button>
              <button onClick={handleSaveCustomPrompt} className="flex-1 py-3.5 bg-indigo-600 text-white font-black rounded-2xl tracking-widest uppercase text-sm hover:bg-indigo-700 transition-all active:scale-95">
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <GemdiLogo className="w-5 h-5" gradientId="footGrad" />
            <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Gemdi</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">&middot; AI Study Companion</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {new Date().getFullYear()} Swan's Lab
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
