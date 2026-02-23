import React, { useRef, useState, useEffect } from 'react';
import { StudySession, UserLocal } from '../types';
import { useTranslation } from '../services/i18n';
import { validateCustomPrompt } from '../services/validation';
import { GemdiLogo } from './GemdiLogo';
import { useCountUp } from '../hooks/useCountUp';
import { useFlipAnimation } from '../hooks/useFlipAnimation';
import DashboardBackground from './DashboardBackground';
import HowToModal from './modals/HowToModal';
import DeleteSessionModal from './modals/DeleteSessionModal';
import RenameSessionModal from './modals/RenameSessionModal';
import CustomPromptModal from './modals/CustomPromptModal';

interface DashboardProps {
  sessions: StudySession[];
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenSession: (session: StudySession) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  customPrompt?: string;
  onCustomPromptChange: (prompt: string) => void;
  user: UserLocal | null;
  onProfileClick: () => void;
  studyStreak?: number;
}

const Dashboard: React.FC<DashboardProps> = ({ sessions, onUpload, onOpenSession, onDeleteSession, onRenameSession, customPrompt, onCustomPromptChange, user, onProfileClick, studyStreak = 0 }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCustomPromptModal, setShowCustomPromptModal] = useState(false);
  const [tempPrompt, setTempPrompt] = useState(customPrompt || '');
  const [promptError, setPromptError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const { deletingSession, triggerDelete } = useFlipAnimation(sessions, onDeleteSession);
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

  const timeOfDay =
    currentTime.getHours() < 12 ? 'morning' :
    currentTime.getHours() < 17 ? 'afternoon' : 'evening';

  const animSessions = useCountUp(sessions.length);
  const animCards    = useCountUp(totalCards);
  const animQuizzes  = useCountUp(quizzesPassed);
  const animStreak   = useCountUp(studyStreak);

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
    if (!sessionToDelete) return;
    setShowDeleteModal(false);
    triggerDelete(sessionToDelete);
    setSessionToDelete(null);
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

  const handleCardTiltMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = -(e.clientY - r.top  - r.height / 2) / (r.height / 2) * 5;
    const y =  (e.clientX - r.left - r.width  / 2) / (r.width  / 2) * 5;
    el.style.transform = `perspective(900px) rotateX(${x}deg) rotateY(${y}deg) translateY(-4px)`;
    el.style.transition = 'none';
  };

  const handleCardTiltLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.transform = '';
    el.style.transition = 'transform 0.5s ease-out, box-shadow 0.2s ease-out';
  };

  const getFileTypeBadge = (fileType: string) => {
    const ext = fileType.split('/')[1]?.toUpperCase() || 'DOC';
    if (ext === 'PDF' || fileType.includes('pdf')) {
      return { text: 'PDF', bg: 'bg-red-500/10 dark:bg-red-500/15', color: 'text-red-500' };
    }
    return { text: 'DOCX', bg: 'bg-blue-500/10 dark:bg-blue-500/15', color: 'text-blue-500' };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fadeIn">
      <DashboardBackground />
      {/* Inline Header */}
      <header className="h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <GemdiLogo className="w-6 h-6" gradientId="dashGrad" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Gemdi</span>
        </div>
        <div className="hidden sm:flex flex-col items-center gap-0.5">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Good {timeOfDay}, {user?.name?.split(' ')[0] || 'there'}!
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
            {formatTime(currentTime)}
          </p>
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
            data-tour="profile-btn"
            className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden"
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
      <div className="relative z-10 px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* Upload Section */}
        <div
          data-tour="upload-area"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl p-8 sm:p-10"
          style={{ background: 'linear-gradient(135deg, #2563EB 0%, #0B1020 100%)' }}
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
              data-tour="customize-ai"
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
        <div data-tour="stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/55 dark:bg-white/[0.04] backdrop-blur-2xl rounded-2xl p-5 border border-white/70 dark:border-white/10">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">{t('dashboard.totalSessions')}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{animSessions}</p>
          </div>
          <div className="bg-white/55 dark:bg-white/[0.04] backdrop-blur-2xl rounded-2xl p-5 border border-white/70 dark:border-white/10">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 dark:bg-violet-500/15 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">{t('dashboard.cardsReviewed')}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{animCards}</p>
          </div>
          <div className="bg-white/55 dark:bg-white/[0.04] backdrop-blur-2xl rounded-2xl p-5 border border-white/70 dark:border-white/10">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">{t('dashboard.quizzesPassed')}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{animQuizzes}</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #0B1020 100%)' }}>
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-white/70 mb-2">{t('dashboard.studyStreak')}</p>
            <p className="text-3xl font-extrabold text-white">{animStreak} {studyStreak === 1 ? t('dashboard.day') : t('dashboard.days')}</p>
            <p className="text-xs font-medium text-white/80 mt-1">
              {studyStreak >= 7 ? t('dashboard.streakFire') : studyStreak >= 3 ? t('dashboard.streakKeepUp') : studyStreak >= 1 ? t('dashboard.streakGreatStart') : t('dashboard.streakBuild')}
            </p>
          </div>
        </div>

        {/* Study Vault */}
        <section data-tour="study-vault">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight">{t('dashboard.studyVault')}</h3>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/55 dark:bg-white/[0.05] backdrop-blur-xl border border-white/70 dark:border-white/10">
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
            <div className="bg-white/55 dark:bg-white/[0.04] backdrop-blur-2xl rounded-2xl p-16 text-center border border-dashed border-white/60 dark:border-white/10">
              <div className="w-16 h-16 bg-black/[0.04] dark:bg-white/[0.06] rounded-2xl flex items-center justify-center mb-6 mx-auto text-slate-300 dark:text-slate-600">
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
                    data-session-card={session.id}
                    className={`group bg-white/55 dark:bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/70 dark:border-white/10 overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-blue-500/10 transition-all duration-300 flex flex-col ${deletingSession === session.id ? 'animate-disappear' : ''}`}
                    onClick={() => onOpenSession(session)}
                    onMouseMove={handleCardTiltMove}
                    onMouseLeave={handleCardTiltLeave}
                  >
                    {/* Top accent stripe */}
                    <div
                      className="h-1"
                      style={{
                        background: session.fileType?.includes('pdf')
                          ? 'linear-gradient(90deg, #ef4444, #f97316)'
                          : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                      }}
                    />
                    {/* Card Top */}
                    <div className="p-5 flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badge.bg} ${badge.color}`}>
                          {badge.text}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => startEditing(e, session)}
                            className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
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
                            <span className="text-[11px] font-bold text-blue-500">{progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
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
                    <div className="flex items-center gap-2 px-5 py-3 border-t border-black/[0.06] dark:border-white/[0.06] bg-white/20 dark:bg-white/[0.02] justify-end">
                      {isComplete ? (
                        <>
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {t('dashboard.mastered')}
                          </span>
                          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 text-xs font-semibold text-blue-500">
                            {t('dashboard.review')}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 text-xs font-semibold text-blue-500">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            {t('dashboard.study')}
                          </span>
                          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 text-xs font-semibold text-emerald-500">
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

      {showHowTo && <HowToModal onClose={() => setShowHowTo(false)} />}

      {showDeleteModal && (
        <DeleteSessionModal onConfirm={handleDelete} onCancel={cancelDelete} />
      )}

      {showRenameModal && (
        <RenameSessionModal
          value={renameName}
          onChange={setRenameName}
          onSave={saveRename}
          onCancel={cancelRename}
        />
      )}

      {showCustomPromptModal && (
        <CustomPromptModal
          value={tempPrompt}
          onChange={(v) => { setTempPrompt(v); setPromptError(null); }}
          onSave={handleSaveCustomPrompt}
          onClose={() => setShowCustomPromptModal(false)}
          error={promptError}
        />
      )}

      {/* Footer */}
      <footer className="relative z-10 mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm">
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
