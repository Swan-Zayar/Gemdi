import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { StudySession, StudyStep, NoteSection, UserLocal } from '../types';
import { renderMathToHtml } from '../services/mathRender';
import { GemdiLogo } from './GemdiLogo';

interface StudyPlanViewProps {
  session: StudySession;
  onViewFlashcards: () => void;
  onStepAction: (stepTitle: string) => void;
  onStartQuiz: () => void;
  isQuizLoading?: boolean;
  onBack: () => void;
  user?: UserLocal | null;
  onProfileClick?: () => void;
}

const StudyPlanView: React.FC<StudyPlanViewProps> = ({ session, onViewFlashcards, onStepAction, onStartQuiz, isQuizLoading, onBack, user, onProfileClick }) => {
  const [selectedStep, setSelectedStep] = useState<StudyStep | null>(null);
  const plan = session.studyPlan;

  const userInitials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  useEffect(() => {
    if (selectedStep) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedStep]);

  if (!plan) return null;

  const isStepCompleted = (title: string) => session.completedSteps?.includes(title);
  const totalSteps = plan.steps.length;
  const completedCount = session.completedSteps?.length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  // Determine the first non-completed step index for "current" highlighting
  const currentStepIndex = plan.steps.findIndex(s => !isStepCompleted(s.title));

  const modalContent = selectedStep && (
    <div
      className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-8 overflow-hidden"
      onClick={() => setSelectedStep(null)}
    >
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>

      <div
        className="w-full max-w-4xl h-[95vh] sm:h-auto sm:max-h-[90vh] bg-white dark:bg-slate-900 rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_32px_128px_-15px_rgba(0,0,0,0.5)] animate-slideUp flex flex-col relative border border-slate-100 dark:border-slate-800 z-10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-10 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-lg sm:text-2xl shrink-0">
              {plan.steps.indexOf(selectedStep) + 1}
            </div>
            <div className="pt-0.5">
              <h3 className="font-black text-xl sm:text-3xl text-slate-900 dark:text-white leading-tight tracking-tight mb-2">{selectedStep.title}</h3>
              <div className="flex flex-wrap items-center gap-2">
                {isStepCompleted(selectedStep.title) && (
                  <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-100/50 dark:border-emerald-800/50 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    Mastered
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedStep(null)}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grow overflow-y-auto px-6 sm:px-10 pb-10 custom-scrollbar scroll-smooth">
          <div className="space-y-8 sm:space-y-12">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              {Array.isArray(selectedStep.detailedNotes) ? (
                /* Structured notes format */
                <div className="space-y-8">
                  {(selectedStep.detailedNotes as NoteSection[]).map((section, sIndex) => (
                    <div key={sIndex}>
                      {/* Section Heading */}
                      <div className="mt-6 mb-4">
                        <h4 className="text-slate-900 dark:text-white font-black text-xs sm:text-sm uppercase tracking-[0.25em] border-l-4 border-blue-600 pl-5 py-2 bg-blue-50/30 dark:bg-blue-900/20 rounded-r-xl"
                          dangerouslySetInnerHTML={{ __html: renderMathToHtml(section.heading) }} />
                      </div>

                      {/* Body paragraph */}
                      {section.body && (
                        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-medium pl-6 mb-4 border-l-2 border-slate-200 dark:border-slate-700"
                          dangerouslySetInnerHTML={{ __html: renderMathToHtml(section.body) }} />
                      )}

                      {/* Bullet points */}
                      {section.bullets && section.bullets.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {section.bullets.map((bullet, bIndex) => (
                            <div key={bIndex} className="pl-6 -indent-4">
                              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-medium"
                                dangerouslySetInnerHTML={{ __html: renderMathToHtml('• ' + bullet) }} />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Formula boxes */}
                      {section.formulas && section.formulas.length > 0 && (
                        <div className="space-y-3">
                          {section.formulas.map((formula, fIndex) => (
                            <div key={fIndex} className="py-4 px-6 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-800/40 text-center overflow-x-auto">
                              <span className="text-slate-800 dark:text-slate-200"
                                dangerouslySetInnerHTML={{ __html: renderMathToHtml(formula) }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Legacy flat string format */
                <div className="space-y-6">
                  {String(selectedStep.detailedNotes).split('\n').filter(l => l.trim()).map((line, i) => {
                    const trimmed = line.trim();
                    const isListItem = trimmed.startsWith('-') || trimmed.startsWith('*');

                    if (isListItem) {
                      const bulletText = '• ' + trimmed.replace(/^[-*]\s*/, '').trim();
                      return (
                        <div key={i} className="pl-6 -indent-4 mb-3">
                          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-medium"
                            dangerouslySetInnerHTML={{ __html: renderMathToHtml(bulletText) }} />
                        </div>
                      );
                    }

                    const endsWithColon = trimmed.endsWith(':') && trimmed.length < 60;
                    const isAllCaps = trimmed.length < 50 && trimmed.length > 2 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
                    const isHeader = endsWithColon || isAllCaps;

                    return (
                      <div key={i} className="group/line">
                        {isHeader ? (
                          <div className="mt-8 mb-4">
                            <h4 className="text-slate-900 dark:text-white font-black text-xs sm:text-sm uppercase tracking-[0.25em] border-l-4 border-blue-600 pl-5 py-2 bg-blue-50/30 dark:bg-blue-900/20 rounded-r-xl"
                              dangerouslySetInnerHTML={{ __html: renderMathToHtml(trimmed.replace(/:$/, '')) }} />
                          </div>
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed font-medium pl-6 border-l border-slate-100 dark:border-slate-800"
                            dangerouslySetInnerHTML={{ __html: renderMathToHtml(trimmed) }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="py-10">
              <div className="bg-slate-900 dark:bg-black p-8 sm:p-14 rounded-[2.5rem] sm:rounded-[3.5rem] text-white text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32"></div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 dark:bg-slate-800 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 mx-auto border border-white/10">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h4 className="font-black text-2xl sm:text-3xl mb-4 tracking-tight">Active Recall Lab</h4>
                <p className="text-slate-400 font-bold text-base sm:text-lg mb-10 max-w-sm mx-auto">Verify your comprehension of this phase.</p>
                <button
                  onClick={(e) => { e.stopPropagation(); onStepAction(selectedStep.title); setSelectedStep(null); }}
                  className="w-full sm:w-auto px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all active:scale-95"
                >
                  {isStepCompleted(selectedStep.title) ? 'Restart Phase Drill' : 'Launch Phase Drill'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fadeIn">
      {/* Inline Header */}
      <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <GemdiLogo className="w-6 h-6" gradientId="spGrad" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Gemdi</span>
        </div>
        <div className="flex items-center gap-3">
          {session.quizHistory && session.quizHistory.length > 0 && (() => {
            const bestScore = Math.max(...session.quizHistory.map(q => Math.round((q.score / q.total) * 100)));
            return (
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${bestScore >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'}`}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Best: {bestScore}%
              </span>
            );
          })()}
          <button onClick={onProfileClick} className="cursor-pointer">
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                {userInitials}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className={`px-12 py-8 max-w-5xl mx-auto transition-all duration-500 ${selectedStep ? 'opacity-20 blur-sm pointer-events-none' : ''}`}>
        {/* Warning */}
        {session.isPotentiallyInvalid && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div>
              <h4 className="text-amber-900 dark:text-amber-100 font-bold text-base">Note Quality Warning</h4>
              <p className="text-amber-700 dark:text-amber-400 text-sm">{session.validityWarning || "Gemdi detected that this file might not be a standard course note."}</p>
            </div>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-colors mb-8"
        >
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m7-7l-7 7 7 7" /></svg>
          Back to Dashboard
        </button>

        {/* Title area */}
        <div className="mb-8">
          <h2 className="text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight" style={{ letterSpacing: '-0.5px' }}>
            {session.sessionName || session.fileName}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Study Roadmap &middot; {totalSteps} Steps &middot; {progressPercent}% Complete
          </p>
        </div>

        {/* Unit Quiz Card */}
        <div className="mb-8 bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full -mr-24 -mt-24"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
              <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-xl tracking-tight mb-1">Unit Quiz</h4>
              <p className="text-slate-400 font-medium text-sm">Test your understanding with 10-20 questions</p>
              {session.quizHistory && session.quizHistory.length > 0 && (
                <p className="text-slate-500 text-xs font-medium mt-1.5">
                  Last score: {Math.round((session.quizHistory[0].score / session.quizHistory[0].total) * 100)}% &middot; {session.quizHistory.length} attempt{session.quizHistory.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button
              onClick={onStartQuiz}
              disabled={isQuizLoading}
              className="px-8 py-3.5 bg-white text-slate-900 rounded-2xl font-extrabold text-sm hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            >
              {isQuizLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {session.quizHistory && session.quizHistory.length > 0 ? 'Retake Quiz' : 'Take Quiz'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Timeline Steps */}
        <div className="space-y-0">
          {plan.steps.map((step, index) => {
            const completed = isStepCompleted(step.title);
            const isCurrent = index === currentStepIndex;
            const isUpcoming = !completed && !isCurrent;
            const isLast = index === plan.steps.length - 1;
            const flashcardCount = (session.flashcards || []).filter(fc => fc.stepTitle === step.title).length;

            return (
              <div
                key={index}
                className="flex gap-5 cursor-pointer"
                onClick={() => setSelectedStep(step)}
                style={{ paddingBottom: isLast ? 0 : 24 }}
              >
                {/* Left indicator column */}
                <div className="flex flex-col items-center w-10 shrink-0">
                  {/* Circle */}
                  {completed ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  ) : isCurrent ? (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-extrabold text-base shrink-0">
                      {index + 1}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-[1.5px] border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 font-extrabold text-base shrink-0">
                      {index + 1}
                    </div>
                  )}
                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 mt-0 ${completed ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    />
                  )}
                </div>

                {/* Content card */}
                <div
                  className={`flex-1 rounded-2xl p-5 border transition-all ${
                    isCurrent
                      ? 'bg-white dark:bg-slate-800 border-2 border-blue-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  } ${isUpcoming ? 'opacity-70' : ''}`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white" dangerouslySetInnerHTML={{ __html: renderMathToHtml(step.title) }} />
                    {completed ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        Mastered
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[11px] font-semibold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">
                        In Progress
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                        Upcoming
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: renderMathToHtml(step.description) }} />

                  {/* Bottom row */}
                  <div className="flex items-center gap-3">
                    {isCurrent && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onStepAction(step.title); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-500 text-white text-[13px] font-semibold hover:bg-blue-600 transition-colors active:scale-95"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Active Recall Lab
                      </button>
                    )}
                    {flashcardCount > 0 && (
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{flashcardCount} Flashcards</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedStep && createPortal(modalContent, document.body)}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; margin: 16px 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }

        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
      `}</style>
    </div>
  );
};

export default StudyPlanView;
