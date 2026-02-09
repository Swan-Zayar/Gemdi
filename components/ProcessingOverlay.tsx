
import React, { useState, useEffect } from 'react';
import { GemdiLogo } from './GemdiLogo';

const MESSAGES = [
  "Synthesizing study plan...",
  "Scanning for key concepts...",
  "Distilling theorems...",
  "Mapping linguistic structures...",
  "Generating recall flashcards...",
  "Preparing study vault...",
  "Finalizing extraction..."
];

const ProcessingOverlay: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-1000 w-full h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center justify-center text-center p-4 w-full max-w-lg animate-fadeIn gap-10 sm:gap-14">
        
        {/* Logo Section - Perfectly Centered halo */}
        <div className="relative w-40 h-40 sm:w-56 sm:h-56 flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          
          <div className="relative w-24 h-24 sm:w-36 sm:h-36 animate-float-slow drop-shadow-2xl">
            <GemdiLogo className="w-full h-full" gradientId="gemGradientOverlay" />
          </div>

          <div className="absolute top-0 left-0 w-4 h-4 bg-indigo-200 dark:bg-indigo-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-purple-300 dark:bg-purple-500 rounded-full animate-pulse delay-500"></div>
        </div>
        
        {/* Text Section */}
        <div className="w-full space-y-6 sm:space-y-8">
          <div className="space-y-2">
            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-600">Gemdi is working...</h2>
            <div className="h-8 sm:h-12 flex items-center justify-center">
               <p className="text-slate-900 dark:text-white font-black text-xl sm:text-3xl tracking-tight transition-all duration-500">
                 {MESSAGES[msgIndex]}
               </p>
            </div>
          </div>
          
          <div className="mx-auto max-w-xs px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 chic-shadow">
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
              Deeper analysis in progress <br />
              <span className="text-indigo-500 dark:text-indigo-400">May take up to 90 seconds for larger files</span>
            </p>
          </div>
        </div>
        
        {/* Progress Section */}
        <div className="w-40 sm:w-56 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full relative overflow-hidden shadow-inner">
          <div className="h-full bg-indigo-600 dark:bg-indigo-500 animate-loadingLine shadow-[0_0_15px_#4f46e5]"></div>
        </div>
      </div>

      <style>{`
        @keyframes loadingLine {
          0% { width: 0%; transform: translateX(-100%); }
          100% { width: 100%; transform: translateX(100%); }
        }
        .animate-loadingLine {
          animation: loadingLine 3s infinite cubic-bezier(0.65, 0, 0.35, 1);
        }
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ProcessingOverlay;
