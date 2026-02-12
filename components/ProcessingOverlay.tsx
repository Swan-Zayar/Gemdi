import React, { useState, useEffect, useRef } from 'react';
import { GemdiLogo } from './GemdiLogo';

interface ProcessingOverlayProps {
  fileName?: string;
  isComplete?: boolean;
  error?: string | null;
  onDismiss?: () => void;
  onCancel?: () => void;
  allowMinimize?: boolean;
}

type Phase = 'processing' | 'completing' | 'done' | 'error';

const STAGES = [
  { minSec: 0, label: "Uploading to cloud...", detail: "Preparing your document" },
  { minSec: 8, label: "Processing document...", detail: "Extracting content from pages" },
  { minSec: 20, label: "Analyzing key concepts...", detail: "AI is reading your material" },
  { minSec: 45, label: "Generating study plan...", detail: "Structuring topics and steps" },
  { minSec: 90, label: "Creating flashcards...", detail: "Building recall exercises" },
  { minSec: 150, label: "Synthesizing notes...", detail: "Polishing detailed notes" },
  { minSec: 240, label: "Almost there...", detail: "Finalizing your study session" },
];

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  fileName,
  isComplete = false,
  error = null,
  onDismiss,
  onCancel,
  allowMinimize = false,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>('processing');
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const startRef = useRef(Date.now());
  const rafRef = useRef<number | null>(null);
  const completionStartRef = useRef<number | null>(null);
  const completionFromRef = useRef(0);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Elapsed time ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Asymptotic progress during processing phase
  useEffect(() => {
    if (phase === 'processing') {
      setDisplayProgress(Math.min(95, 100 * (1 - Math.exp(-elapsed / 120))));
    }
  }, [elapsed, phase]);

  // Transition to completing phase when isComplete flips
  useEffect(() => {
    if (isComplete && phase === 'processing') {
      completionFromRef.current = displayProgress;
      completionStartRef.current = null;
      setPhase('completing');
    }
  }, [isComplete, phase, displayProgress]);

  // Transition to error phase
  useEffect(() => {
    if (error && phase === 'processing') {
      setPhase('error');
    }
  }, [error, phase]);

  // RAF animation for completing phase (animate to 100%)
  useEffect(() => {
    if (phase !== 'completing') return;

    const animate = (timestamp: number) => {
      if (completionStartRef.current === null) {
        completionStartRef.current = timestamp;
      }
      const elapsed = timestamp - completionStartRef.current;
      const duration = 800;
      const t = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - t, 3);
      const from = completionFromRef.current;
      const current = from + (100 - from) * eased;
      setDisplayProgress(current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Hold at 100% for 400ms then show done
        doneTimerRef.current = setTimeout(() => {
          setPhase('done');
          // Auto-expand if minimized when completion arrives
          setIsMinimized(false);
        }, 400);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (doneTimerRef.current !== null) clearTimeout(doneTimerRef.current);
    };
  }, [phase]);

  // Pick current stage based on elapsed time
  const currentStage = [...STAGES].reverse().find(s => elapsed >= s.minSec) || STAGES[0];

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const truncatedName = fileName
    ? fileName.length > 36 ? fileName.slice(0, 33) + '...' : fileName
    : null;

  // --- Minimized widget ---
  if (isMinimized) {
    const pct = Math.round(displayProgress);
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-1000 bg-white dark:bg-slate-800 rounded-2xl chic-shadow border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform"
        style={{ width: 260 }}
      >
        {/* Progress ring */}
        <div className="relative w-10 h-10 shrink-0">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-100 dark:text-slate-700" />
            <circle
              cx="20" cy="20" r={radius} fill="none" strokeWidth="3"
              stroke="currentColor"
              className="text-indigo-500"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-indigo-500 tabular-nums">{pct}%</span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          {truncatedName && (
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{truncatedName}</p>
          )}
          <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Processing...</p>
        </div>

        {/* Expand icon */}
        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
        </svg>
      </div>
    );
  }

  // --- Done card ---
  if (phase === 'done') {
    return (
      <div className="fixed inset-0 z-1000 w-full h-full bg-slate-900/60 backdrop-blur-xl flex items-center justify-center animate-fadeIn">
        <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-10 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp text-center flex flex-col items-center gap-5">
          {/* Green checkmark */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">All Done!</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">Your study session is ready</p>
          </div>

          {truncatedName && (
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium bg-slate-50 dark:bg-slate-700/50 px-4 py-2 rounded-xl truncate max-w-full">
              {truncatedName}
            </p>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold tabular-nums">
            Processed in {formatTime(elapsed)}
          </p>

          <button
            onClick={onDismiss}
            className="w-full mt-2 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-colors text-sm"
          >
            View Session
          </button>
        </div>

        <style>{`
          .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
          .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  // --- Error card ---
  if (phase === 'error') {
    return (
      <div className="fixed inset-0 z-1000 w-full h-full bg-slate-900/60 backdrop-blur-xl flex items-center justify-center animate-fadeIn">
        <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-10 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp text-center flex flex-col items-center gap-5">
          {/* Red X icon */}
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Processing Failed</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">Something went wrong</p>
          </div>

          <p className="text-sm text-red-500 dark:text-red-400 font-medium bg-red-50 dark:bg-red-500/10 px-4 py-3 rounded-xl w-full">
            {error}
          </p>

          {truncatedName && (
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate max-w-full">
              {truncatedName}
            </p>
          )}

          <button
            onClick={onDismiss}
            className="w-full mt-2 py-3.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl transition-colors text-sm"
          >
            Dismiss
          </button>
        </div>

        <style>{`
          .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
          .animate-slideUp { animation: slideUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  // --- Full processing overlay ---
  return (
    <div className="fixed inset-0 z-1000 w-full h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl flex items-center justify-center overflow-hidden">

      {/* Minimize / Cancel buttons (top-right) */}
      {allowMinimize && phase === 'processing' && (
        <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-8 h-8 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Minimize"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
            title="Cancel"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-col items-center justify-center text-center p-4 w-full max-w-120 animate-fadeIn gap-12">

        {/* Logo */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="relative w-28 h-28 animate-float-slow drop-shadow-2xl">
            <GemdiLogo className="w-full h-full" gradientId="gemGradientOverlay" />
          </div>
        </div>

        {/* Status */}
        <div className="w-full flex flex-col items-center gap-2">
          <h2 className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-slate-300 dark:text-slate-600">Processing</h2>
          <p className="text-slate-900 dark:text-white font-extrabold text-2xl tracking-tight transition-all duration-700">
            {phase === 'completing' ? 'Wrapping up...' : currentStage.label}
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium transition-all duration-700">
            {phase === 'completing' ? 'Almost there' : currentStage.detail}
          </p>
          {truncatedName && (
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate max-w-xs">
              {truncatedName}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-500 tabular-nums">{Math.round(displayProgress)}%</span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tabular-nums">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Time estimate */}
        <div className="max-w-xs px-5 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-relaxed text-center">
            {elapsed < 60 ? (
              <>Typical processing time: <span className="text-indigo-500 dark:text-indigo-400">1-3 minutes</span></>
            ) : elapsed < 180 ? (
              <>Larger documents take longer — <span className="text-indigo-500 dark:text-indigo-400">hang tight</span></>
            ) : (
              <>Still working on your <span className="text-indigo-500 dark:text-indigo-400">large document</span> — almost done</>
            )}
          </p>
        </div>
      </div>

      <style>{`
        .animate-float-slow {
          animation: floatSlow 5s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulseSlow 4s ease-in-out infinite;
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProcessingOverlay;
