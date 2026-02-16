import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Flashcard } from '../types';
import { renderMathToHtml } from '../services/mathRender';
import { GemdiLogo } from './GemdiLogo';

interface FlashcardViewProps {
  flashcards: Flashcard[];
  stepTitle?: string | null;
  onBack: () => void;
  onComplete: (rating?: number) => void;
}

const FlashcardView: React.FC<FlashcardViewProps> = ({ flashcards, stepTitle, onBack, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const tiltRef = useRef({ x: 0, y: 0 });

  // Handle empty flashcards
  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">No Flashcards Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
              {stepTitle
                ? `No flashcards were generated for "${stepTitle}". Try studying the full session instead.`
                : "No flashcards available for this session."}
            </p>
            <button
              onClick={onBack}
              className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:bg-blue-600 dark:hover:bg-blue-100 transition-all active:scale-95"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const card = flashcards[currentIndex];
  const isFirstCard = currentIndex === 0;
  const isLastCard = currentIndex === flashcards.length - 1;

  const handleNext = () => {
    if (isLastCard) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
  };

  const handlePrev = () => {
    if (isFirstCard) return;
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showRating) return;
    if (e.code === 'Space') {
      e.preventDefault();
      setIsFlipped(prev => !prev);
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      if (!isFirstCard) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => prev - 1), 150);
      }
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      if (!isLastCard) {
        setIsFlipped(false);
        setTimeout(() => setCurrentIndex((prev) => prev + 1), 150);
      }
    }
  }, [showRating, isFirstCard, isLastCard]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (showRating) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 border border-slate-100 dark:border-slate-700 shadow-lg text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 dark:bg-blue-900/30 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Drill Complete.</h2>
            <p className="text-slate-400 dark:text-slate-500 font-medium mb-8 sm:mb-10 text-sm sm:text-base">How confident are you with this specific material style?</p>

            <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl transition-all ${selectedRating === star ? 'bg-blue-600 text-white scale-110 shadow-xl' : 'bg-slate-50 dark:bg-slate-700 text-slate-300 dark:text-slate-500 hover:text-blue-400'}`}
                >
                  {star}
                </button>
              ))}
            </div>

            <button
              onClick={() => onComplete(selectedRating || undefined)}
              className="w-full py-4 sm:py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-extrabold text-base sm:text-lg hover:bg-blue-600 dark:hover:bg-blue-100 transition-all shadow-xl active:scale-95"
            >
              Update Neural Profile & Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!card) return null;

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    tiltRef.current = {
      x: (0.5 - y) * 10,
      y: (x - 0.5) * 12,
    };

    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.setProperty('--tilt-x', `${tiltRef.current.x}deg`);
        cardRef.current.style.setProperty('--tilt-y', `${tiltRef.current.y}deg`);
      }
      frameRef.current = null;
    });
  };

  const handlePointerLeave: React.PointerEventHandler<HTMLDivElement> = () => {
    setIsHovering(false);
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    tiltRef.current = { x: 0, y: 0 };
    if (cardRef.current) {
      cardRef.current.style.setProperty('--tilt-x', '0deg');
      cardRef.current.style.setProperty('--tilt-y', '0deg');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col animate-fadeIn">
      {/* Inline Header */}
      <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-2.5">
          <GemdiLogo className="w-6 h-6" gradientId="fcGrad" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Gemdi</span>
        </div>
        {stepTitle && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{stepTitle}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 transition-colors"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-10">
        {/* Progress Section */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Card {currentIndex + 1} of {flashcards.length}</span>
          <div className="flex items-center gap-1">
            {flashcards.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i < currentIndex
                    ? 'w-2 h-2 bg-emerald-500'
                    : i === currentIndex
                    ? 'w-2.5 h-2.5 bg-blue-500'
                    : 'w-2 h-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card Area with nav buttons */}
        <div className="flex items-center gap-8">
          {/* Previous button */}
          <button
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            disabled={isFirstCard}
            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all shrink-0 ${
              isFirstCard
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-900 dark:hover:bg-blue-600 hover:text-white hover:border-transparent active:scale-95'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>

          {/* Flashcard */}
          <div
            className="perspective-2000 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            onPointerMove={handlePointerMove}
            onPointerEnter={() => setIsHovering(true)}
            onPointerLeave={handlePointerLeave}
            style={{ width: 560, height: 380 }}
          >
            <div
              ref={cardRef}
              className="relative w-full h-full transform-style-3d"
              style={{
                transform: `rotateY(${isFlipped ? 180 : 0}deg) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) scale(${isHovering ? 1.02 : 1})`,
                transition: isHovering ? 'transform 80ms linear' : 'transform 500ms ease',
                willChange: 'transform',
                ['--tilt-x' as any]: '0deg',
                ['--tilt-y' as any]: '0deg',
              }}
            >
              {/* Card Front */}
              <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center backface-hidden border border-slate-200/50 dark:border-slate-700/50"
                style={{ boxShadow: '0 8px 32px -4px rgba(15, 23, 42, 0.08)' }}
              >
                {/* QUESTION label */}
                <span className="mb-6 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-500 text-[11px] font-bold rounded-full tracking-wider uppercase">
                  QUESTION
                </span>
                <h3
                  className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-relaxed max-w-115 text-center"
                  style={{ letterSpacing: '-0.3px', lineHeight: 1.4 }}
                  dangerouslySetInnerHTML={{ __html: renderMathToHtml(card.question) }}
                />
                <p className="mt-6 text-sm text-slate-400 dark:text-slate-500">Tap card to reveal answer</p>
              </div>

              {/* Card Back */}
              <div className="absolute inset-0 bg-slate-900 dark:bg-black text-white rounded-xl p-12 flex flex-col items-center justify-center text-center rotate-y-180 backface-hidden border-4 border-blue-500/20"
                style={{ boxShadow: '0 8px 32px -4px rgba(15, 23, 42, 0.2)' }}
              >
                <div className="grow flex flex-col items-center justify-center">
                  <h3
                    className="text-lg font-bold text-white leading-relaxed max-w-115 mb-8"
                    dangerouslySetInnerHTML={{ __html: renderMathToHtml(card.answer) }}
                  />

                  {isLastCard && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowRating(true); }}
                      className="group bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-extrabold text-lg shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 animate-fadeIn"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Finish Drill
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            disabled={isLastCard}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 ${
              isLastCard
                ? 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-lg'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-400 dark:text-slate-500">Space</kbd>
            <span className="text-xs text-slate-400 dark:text-slate-500">Flip card</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-400 dark:text-slate-500">&larr;</kbd>
            <span className="text-xs text-slate-400 dark:text-slate-500">Previous</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-400 dark:text-slate-500">&rarr;</kbd>
            <span className="text-xs text-slate-400 dark:text-slate-500">Next</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardView;
