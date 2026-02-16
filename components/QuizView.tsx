import React, { useEffect, useState } from 'react';
import { QuizQuestion } from '../types';
import { renderMathToHtml } from '../services/mathRender';
import { GemdiLogo } from './GemdiLogo';

interface QuizViewProps {
  questions: QuizQuestion[];
  isLoading?: boolean;
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, isLoading, onBack, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [katexReady, setKatexReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).katex) {
      setKatexReady(true);
      return;
    }

    const interval = window.setInterval(() => {
      if ((window as any).katex) {
        setKatexReady(true);
        window.clearInterval(interval);
      }
    }, 50);

    return () => window.clearInterval(interval);
  }, []);

  if (isLoading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4 animate-fadeIn">
        <div className="flex flex-col items-center gap-8">
          <div className="animate-float">
            <GemdiLogo className="w-20 h-20" gradientId="quizLoadGrad" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Generating your quiz...</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">10-20 unique questions based on your study material</p>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '300ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '600ms' }} />
          </div>
          <button
            onClick={onBack}
            className="mt-4 flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            Cancel
          </button>
        </div>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }
          .animate-float { animation: float 2.5s ease-in-out infinite; }
        `}</style>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) setScore(s => s + 1);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 animate-fadeIn">
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 text-center chic-shadow border border-slate-100 dark:border-slate-700 overflow-hidden relative w-full max-w-2xl">
          <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-emerald-400 to-blue-500"></div>

          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
             <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{percentage}%</span>
          </div>

          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Unit Mastered.</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold mb-10 text-lg">
            You scored {score} out of {questions.length} correct.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10 text-left">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
               <span className="block text-[10px] font-extrabold text-slate-300 dark:text-slate-600 uppercase tracking-[3px] mb-1">Status</span>
               <span className={`text-lg font-extrabold ${percentage >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                 {percentage >= 80 ? 'Mastery Achieved' : 'Needs Review'}
               </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
               <span className="block text-[10px] font-extrabold text-slate-300 dark:text-slate-600 uppercase tracking-[3px] mb-1">Rank</span>
               <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                 {percentage === 100 ? 'Architect' : percentage >= 80 ? 'Senior' : 'Scholar'}
               </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={() => onComplete(score, questions.length)}
              className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-extrabold text-lg hover:bg-blue-600 dark:hover:bg-blue-100 transition-all shadow-xl active:scale-95"
            >
              Save Results to Vault
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 text-slate-400 dark:text-slate-600 font-extrabold hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-[3px] text-[10px]"
            >
              Discard & Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col animate-fadeIn" data-katex-ready={katexReady ? '1' : '0'}>
      {/* Full-width Header Bar */}
      <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:-translate-x-0.5 transition-transform text-slate-500 dark:text-slate-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <GemdiLogo className="w-7 h-7" gradientId="quizGrad" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Gemdi</span>
        </div>
        <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-[2px]">Unit Mastery Quiz</span>
        <span className="text-xl font-extrabold text-slate-900 dark:text-white">
          {currentIndex + 1} <span className="text-slate-200 dark:text-slate-700">/</span> {questions.length}
        </span>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-12 md:px-50 py-12">
        <div className="bg-white dark:bg-slate-800 rounded-[3rem] py-12 px-8 sm:px-14 border border-slate-100 dark:border-slate-700 chic-shadow w-full flex flex-col gap-8">
          <div>
            <div className="inline-block px-3.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold rounded-lg uppercase tracking-[2px] mb-8 border border-blue-100 dark:border-blue-800/50">
              Conceptual Inquiry
            </div>
            <h3 className="text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.4]"
                dangerouslySetInnerHTML={{ __html: renderMathToHtml(currentQuestion.question) }}>
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isAnsweredCorrect = isAnswered && option === currentQuestion.correctAnswer;
              const isAnsweredWrong = isAnswered && isSelected && option !== currentQuestion.correctAnswer;

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={`text-left py-5 px-6 rounded-2xl border-2 transition-all flex items-center justify-between ${
                    isAnsweredCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-900 dark:text-emerald-100'
                      : isAnsweredWrong
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100'
                      : isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-white'
                      : 'border-slate-100 dark:border-slate-700 hover:border-blue-200 bg-slate-50 dark:bg-slate-900/50'
                  }`}
                >
                  <span className="font-bold text-base" dangerouslySetInnerHTML={{ __html: renderMathToHtml(option) }}></span>
                  <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ml-4 ${
                    isAnsweredCorrect
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isAnsweredWrong
                      ? 'bg-red-500 border-red-500 text-white'
                      : isSelected
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}>
                    {(isAnsweredCorrect || (isSelected && !isAnswered)) && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                    )}
                    {isAnsweredWrong && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12"></path></svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered ? (
            <div className="animate-slideUp flex flex-col gap-6">
              <div className={`p-8 rounded-3xl border ${selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100'}`}>
                <h4 className={`text-[10px] font-extrabold uppercase tracking-[3px] mb-2 ${selectedOption === currentQuestion.correctAnswer ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  Neural Explanation
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-base font-medium leading-relaxed italic"
                   dangerouslySetInnerHTML={{ __html: renderMathToHtml(currentQuestion.explanation) }}>
                </p>
              </div>
              <button
                onClick={handleNext}
                className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-extrabold text-lg hover:bg-blue-600 dark:hover:bg-blue-100 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                {currentIndex < questions.length - 1 ? 'Next Phase' : 'Masterplan Finalized'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleCheckAnswer}
              disabled={!selectedOption}
              className={`w-full h-14 rounded-2xl font-extrabold text-lg transition-all shadow-xl active:scale-95 ${
                selectedOption
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              Verify Selection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;
