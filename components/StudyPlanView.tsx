
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { StudySession, StudyStep } from '../types';

interface StudyPlanViewProps {
  session: StudySession;
  isQuizReady: boolean;
  onViewFlashcards: () => void;
  onStepAction: (stepTitle: string) => void;
  onStartQuiz: () => void;
  onBack: () => void;
}

const formatMath = (text: string) => {
  if (typeof window === 'undefined' || !(window as any).katex) return text;
  
  // Replace double dollar signs first (block mode)
  let processed = text.replace(/\$\$\s*([\s\S]+?)\s*\$\$/g, (_, math) => {
    try {
      return (window as any).katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
    } catch (e) {
      return `$$${math}$$`;
    }
  });

  // Replace single dollar signs (inline mode)
  processed = processed.replace(/\$([^\$]+)\$/g, (_, math) => {
    try {
      return (window as any).katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch (e) {
      return `$${math}$`;
    }
  });

  return processed;
};

const StudyPlanView: React.FC<StudyPlanViewProps> = ({ session,  onViewFlashcards, onStepAction, onStartQuiz, onBack }) => {
  const [selectedStep, setSelectedStep] = useState<StudyStep | null>(null);
  const plan = session.studyPlan;

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
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg sm:text-2xl shrink-0">
              {plan.steps.indexOf(selectedStep) + 1}
            </div>
            <div className="pt-0.5">
              <h3 className="font-black text-xl sm:text-3xl text-slate-900 dark:text-white leading-tight tracking-tight mb-2">{selectedStep.title}</h3>
              <div className="flex flex-wrap items-center gap-2">
                {isStepCompleted(selectedStep.title) && (
                  <span className="text-[9px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50/50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-100/50 dark:border-emerald-800/50 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
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
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="grow overflow-y-auto px-6 sm:px-10 pb-10 custom-scrollbar scroll-smooth">
          <div className="space-y-8 sm:space-y-12">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="space-y-6">
                {selectedStep.detailedNotes.split('\n').filter(l => l.trim()).map((line, i) => {
                  const trimmed = line.trim();
                  const isListItem = trimmed.startsWith('-') || trimmed.startsWith('*');
                  
                  if (isListItem) {
                    // Inline bullet point character with hanging indent CSS
                    const bulletText = '• ' + trimmed.replace(/^[-*]\s*/, '').trim();
                    return (
                      <div key={i} className="pl-6 -indent-4 mb-3">
                        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-medium" 
                           dangerouslySetInnerHTML={{ __html: formatMath(bulletText) }}>
                        </p>
                      </div>
                    );
                  }

                  const isHeader = trimmed.length < 50 && (trimmed.toUpperCase() === trimmed || trimmed.includes(':'));

                  return (
                    <div key={i} className="group/line">
                       {isHeader ? (
                         <div className="mt-8 mb-4">
                           <h4 className="text-slate-900 dark:text-white font-black text-xs sm:text-sm uppercase tracking-[0.25em] border-l-4 border-indigo-600 pl-5 py-2 bg-indigo-50/30 dark:bg-indigo-900/20 rounded-r-xl"
                               dangerouslySetInnerHTML={{ __html: formatMath(trimmed.replace(/:$/, '')) }}>
                           </h4>
                         </div>
                       ) : (
                         <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed font-medium pl-6 border-l border-slate-100 dark:border-slate-800"
                            dangerouslySetInnerHTML={{ __html: formatMath(trimmed) }}>
                         </p>
                       )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="py-10">
              <div className="bg-slate-900 dark:bg-black p-8 sm:p-14 rounded-[2.5rem] sm:rounded-[3.5rem] text-white text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mr-32 -mt-32"></div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 dark:bg-slate-800 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 mx-auto border border-white/10">
                   <svg className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h4 className="font-black text-2xl sm:text-3xl mb-4 tracking-tight">Active Recall Lab</h4>
                <p className="text-slate-400 font-bold text-base sm:text-lg mb-10 max-w-sm mx-auto">Verify your comprehension of this phase.</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); onStepAction(selectedStep.title); setSelectedStep(null); }}
                  className="w-full sm:w-auto px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all active:scale-95"
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
    <div className={`max-w-6xl mx-auto space-y-6 sm:space-y-10 animate-fadeIn pb-16 transition-all duration-500 ${selectedStep ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100 blur-0'}`}>
      {session.isPotentiallyInvalid && (
        <div className="mx-2 sm:mx-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-start gap-4 sm:gap-5 shadow-sm">
           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
             <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
           </div>
           <div>
             <h4 className="text-amber-900 dark:text-amber-100 font-black text-base sm:text-lg tracking-tight">Note Quality Warning</h4>
             <p className="text-amber-700 dark:text-amber-400 font-medium text-xs sm:text-sm leading-relaxed max-w-2xl">
               {session.validityWarning || "Gemdi detected that this file might not be a standard course note."}
             </p>
           </div>
        </div>
      )}
      <button 
          onClick={onBack}
          className="group flex items-center gap-2 sm:gap-3 py-2 mb-6 font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
             <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M15 19l-7-7 7-7"></path></svg>
          </div>
          <span className="hidden sm:inline">Back to Dashboard</span>
      </button>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4">
        <div className="relative text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] mb-3 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
            Roadmap Live
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{session.sessionName}</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold mt-2 text-sm sm:text-base">From <span className="text-indigo-600 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-900/50">{session.fileName}</span></p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-2 sm:px-0">
          <button 
            onClick={onViewFlashcards}
            className="group relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-400 text-slate-900 dark:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black chic-shadow flex items-center justify-center gap-3 transition-all active:scale-95 text-sm sm:text-base"
          >
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            Study Cards
          </button>
          <button 
            onClick={onStartQuiz}
            className="group relative bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-indigo-600 dark:hover:bg-indigo-100 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black chic-shadow flex items-center justify-center gap-3 transition-all active:scale-95 text-sm sm:text-base overflow-hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Start Unit Quiz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2 sm:px-4">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl sm:rounded-4xl border border-slate-100 dark:border-slate-700 chic-shadow relative overflow-hidden group">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 sm:w-1.5 sm:h-6 bg-indigo-600 rounded-full"></span>
              Overview
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-medium" 
               dangerouslySetInnerHTML={{ __html: formatMath(plan.overview) }}></p>
          </div>

          {session.quizHistory && session.quizHistory.length > 0 && (
            <div className="bg-slate-900 dark:bg-black p-6 sm:p-8 rounded-3xl sm:rounded-4xl text-white chic-shadow relative overflow-hidden">
               <h3 className="text-base sm:text-lg font-black mb-4 flex items-center gap-2">
                <span className="w-1 h-4 sm:w-1.5 sm:h-4 bg-emerald-500 rounded-full"></span>
                Mastery History
               </h3>
               <div className="space-y-3 sm:space-y-4">
                 {session.quizHistory.slice(0, 3).map((h, i) => (
                   <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 dark:bg-slate-800/50 border border-white/10 dark:border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[8px] sm:text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{new Date(h.date).toLocaleDateString()}</span>
                        <span className="text-xs sm:text-sm font-bold text-emerald-400">Score: {h.score}/{h.total}</span>
                      </div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="px-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Study Masterplan</h3>
            <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] sm:text-xs">Select a module to expand materials</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {plan.steps.map((step, index) => {
              const completed = isStepCompleted(step.title);
              return (
                <div 
                  key={index} 
                  onClick={() => setSelectedStep(step)}
                  className={`group cursor-pointer p-4 sm:p-6 rounded-3xl sm:rounded-4xl border transition-all md:tilt-card flex items-center gap-4 sm:gap-6 chic-shadow ${completed ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-900/10' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900/50'}`}
                >
                  <div className="shrink-0">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xl sm:text-2xl transition-all duration-500 shadow-inner ${completed ? 'bg-emerald-500 text-white' : 'bg-slate-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:text-white'}`}>
                      {completed ? (
                        <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                      ) : (index + 1)}
                    </div>
                  </div>
                  
                  <div className="grow min-w-0">
                    <h4 className={`font-black text-base sm:text-lg tracking-tight transition-colors truncate ${completed ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>{step.title}</h4>
                    <p className="text-slate-400 dark:text-slate-500 text-[10px] sm:text-sm font-bold truncate">{step.description}</p>
                  </div>
                  
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-slate-50 dark:border-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:border-indigo-200 dark:group-hover:border-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </div>
              );
            })}
          </div>
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
