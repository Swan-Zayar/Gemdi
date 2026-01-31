
import React, { useState } from 'react';
import { Flashcard } from '../types';

interface FlashcardViewProps {
  flashcards: Flashcard[];
  onBack: () => void;
  onComplete: (rating?: number) => void;
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

const FlashcardView: React.FC<FlashcardViewProps> = ({ flashcards, onBack, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const card = flashcards[currentIndex];
  const isFirstCard = currentIndex === 0;
  const isLastCard = currentIndex === flashcards.length - 1;

  const handleNext = () => {
    if (isLastCard) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 150);
  };

  const handlePrev = () => {
    if (isFirstCard) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => prev - 1);
    }, 150);
  };

  if (showRating) {
    return (
      <div className="max-w-xl mx-auto py-12 sm:py-24 px-4 text-center animate-fadeIn">
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 border border-slate-100 dark:border-slate-700 chic-shadow">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-inner">
             <svg className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Drill Complete.</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold mb-8 sm:mb-10 text-sm sm:text-base">How confident are you with this specific material style?</p>
          
          <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                onClick={() => setSelectedRating(star)}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl transition-all ${selectedRating === star ? 'bg-indigo-600 text-white scale-110 shadow-xl' : 'bg-slate-50 dark:bg-slate-700 text-slate-300 dark:text-slate-500 hover:text-indigo-400'}`}
              >
                {star}
              </button>
            ))}
          </div>

          <button 
            onClick={() => onComplete(selectedRating || undefined)}
            className="w-full py-4 sm:py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-base sm:text-lg hover:bg-indigo-600 dark:hover:bg-indigo-100 transition-all shadow-xl active:scale-95"
          >
            Update Neural Profile & Save
          </button>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 animate-fadeIn py-6 sm:py-12 px-4 flex flex-col min-h-[80vh]">
      <div className="flex items-center justify-between px-2 sm:px-6 shrink-0">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 sm:gap-3 font-black text-[10px] sm:text-sm uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
             <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M15 19l-7-7 7-7"></path></svg>
          </div>
          <span className="hidden sm:inline">Exit Drill</span>
        </button>
        <div className="flex flex-col items-end">
           <span className="text-[8px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Session Progress</span>
           <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-none">
                {currentIndex + 1} <span className="text-slate-200 dark:text-slate-700">/</span> {flashcards.length}
              </span>
              <div className="w-20 sm:w-32 h-1.5 sm:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-indigo-500 transition-all duration-500" 
                   style={{width: `${((currentIndex + 1) / flashcards.length) * 100}%`}}
                 ></div>
              </div>
           </div>
        </div>
      </div>

      <div 
        className="perspective-2000 cursor-pointer h-[50vh] sm:h-[60vh] w-full flex-grow relative"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Card Front */}
          <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-16 flex flex-col items-center justify-center text-center chic-shadow border border-slate-50 dark:border-slate-700 backface-hidden shadow-2xl overflow-hidden">
            <div className="absolute top-6 left-6 sm:top-12 sm:left-12 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center">
               <span className="text-indigo-600 dark:text-indigo-400 font-black">?</span>
            </div>
            {card.category && (
              <span className="mb-6 sm:mb-10 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-indigo-100 dark:border-indigo-800/50">
                {card.category}
              </span>
            )}
            <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-lg"
                dangerouslySetInnerHTML={{ __html: formatMath(card.question) }}>
            </h3>
            <div className="mt-12 sm:mt-20 flex items-center gap-3 text-slate-300 dark:text-slate-600 animate-pulse">
               <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Tap to Flip</span>
               <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 bg-slate-900 dark:bg-black text-white rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-10 flex flex-col items-center justify-center text-center chic-shadow rotate-y-180 backface-hidden shadow-2xl border-4 border-indigo-500/20 overflow-y-auto custom-scrollbar">
            <div className="absolute top-6 right-6 sm:top-12 sm:right-12 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
               <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
            </div>
            
            <div className="flex-grow flex flex-col items-center justify-center py-10">
              <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white leading-relaxed max-w-lg mb-8"
                  dangerouslySetInnerHTML={{ __html: formatMath(card.answer) }}>
              </h3>
              
              {isLastCard && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowRating(true); }}
                  className="group relative bg-emerald-500 hover:bg-emerald-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 sm:gap-4 animate-fadeIn"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Finish Drill
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 sm:gap-8 shrink-0">
        <button 
          onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
          disabled={isFirstCard}
          className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-slate-600 dark:text-slate-300 chic-shadow border border-slate-100 dark:border-slate-700 transition-all ${isFirstCard ? 'opacity-20 cursor-not-allowed' : 'bg-white dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-indigo-600 hover:text-white active:scale-95'}`}
        >
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(); }} 
          disabled={isLastCard} 
          className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-white chic-shadow transition-all ${isLastCard ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 active:scale-95 shadow-xl'}`}>
          <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default FlashcardView;
