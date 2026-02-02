
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  questions: QuizQuestion[];
  onBack: () => void;
  onComplete: (score: number, total: number) => void;
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

const QuizView: React.FC<QuizViewProps> = ({ questions, onBack, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

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
      <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 animate-fadeIn">
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-12 text-center chic-shadow border border-slate-100 dark:border-slate-700 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-emerald-400 to-indigo-500"></div>
          
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-inner">
             <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{percentage}%</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Unit Mastered.</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold mb-8 sm:mb-10 text-base sm:text-lg">
            You scored {score} out of {questions.length} correct.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 sm:mb-10 text-left">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-700">
               <span className="block text-[8px] sm:text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">Status</span>
               <span className={`text-base sm:text-lg font-black ${percentage >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                 {percentage >= 80 ? 'Mastery Achieved' : 'Needs Review'}
               </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-700">
               <span className="block text-[8px] sm:text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-1">Rank</span>
               <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
                 {percentage === 100 ? 'Architect' : percentage >= 80 ? 'Senior' : 'Scholar'}
               </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            <button 
              onClick={() => onComplete(score, questions.length)}
              className="w-full py-4 sm:py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl hover:bg-indigo-600 dark:hover:bg-indigo-100 transition-all shadow-xl active:scale-95"
            >
              Save Results to Vault
            </button>
            <button 
              onClick={onBack}
              className="w-full py-3 text-slate-400 dark:text-slate-600 font-black hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest text-[10px]"
            >
              Discard & Return
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-12 px-4 space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between px-2 sm:px-6">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 sm:gap-3 font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
             <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M15 19l-7-7 7-7"></path></svg>
          </div>
          <span className="hidden sm:inline">Quit Quiz</span>
        </button>
        <div className="flex flex-col items-end">
           <span className="text-[8px] sm:text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Unit Mastery Quiz</span>
           <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
                {currentIndex + 1} <span className="text-slate-200 dark:text-slate-700">/</span> {questions.length}
              </span>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-4xl sm:rounded-[3rem] p-6 sm:p-10 md:p-16 border border-slate-100 dark:border-slate-700 chic-shadow min-h-100 sm:min-h-125 flex flex-col justify-between">
        <div>
          <div className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[8px] sm:text-[10px] font-black rounded-lg uppercase tracking-widest mb-6 sm:mb-8 border border-indigo-100 dark:border-indigo-800/50">
            Conceptual Inquiry
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-8 sm:mb-12"
              dangerouslySetInnerHTML={{ __html: formatMath(currentQuestion.question) }}>
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isAnsweredCorrect = isAnswered && option === currentQuestion.correctAnswer;
              const isAnsweredWrong = isAnswered && isSelected && option !== currentQuestion.correctAnswer;

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={`group text-left p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all flex items-center justify-between ${
                    isAnsweredCorrect 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-900 dark:text-emerald-100' 
                      : isAnsweredWrong 
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100'
                      : isSelected
                      ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-white'
                      : 'border-slate-50 dark:border-slate-700 hover:border-indigo-200 bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
                >
                  <span className="font-bold text-sm sm:text-lg" dangerouslySetInnerHTML={{ __html: formatMath(option) }}></span>
                  <div className={`shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ml-4 ${
                    isAnsweredCorrect 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : isAnsweredWrong 
                      ? 'bg-red-500 border-red-500 text-white'
                      : isSelected
                      ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-600 dark:bg-indigo-400 text-white'
                      : 'border-slate-200 dark:border-slate-600'
                  }`}>
                    {(isAnsweredCorrect || (isSelected && !isAnswered)) && (
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                    )}
                    {isAnsweredWrong && (
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12"></path></svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 sm:mt-12">
          {isAnswered ? (
            <div className="animate-slideUp space-y-4 sm:space-y-6">
              <div className={`p-5 sm:p-8 rounded-2xl sm:rounded-3xl border ${selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-100'}`}>
                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2 ${selectedOption === currentQuestion.correctAnswer ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  Neural Explanation
                </h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base font-medium leading-relaxed italic"
                   dangerouslySetInnerHTML={{ __html: formatMath(currentQuestion.explanation) }}>
                </p>
              </div>
              <button 
                onClick={handleNext}
                className="w-full py-4 sm:py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl hover:bg-indigo-600 dark:hover:bg-indigo-100 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                {currentIndex < questions.length - 1 ? 'Next Phase' : 'Masterplan Finalized'}
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleCheckAnswer}
              disabled={!selectedOption}
              className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl transition-all shadow-xl active:scale-95 ${
                selectedOption 
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-slate-900' 
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
