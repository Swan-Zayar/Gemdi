
import React from 'react';

interface LandingProps {
  onGetStarted: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-16 lg:py-24 text-center relative overflow-hidden px-4">
      
      {/* Background Decorative Shapes */}
      <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 border-[15px] sm:border-[30px] border-slate-100 dark:border-slate-800/30 rounded-[2rem] sm:rounded-[4rem] rotate-12 -z-10 opacity-30 translate-x-1/2"></div>

      <div className="inline-block px-4 py-1.5 mb-6 sm:mb-8 text-[9px] sm:text-[10px] font-black tracking-[0.2em] text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800/50 relative z-10">
        Neural Study Engine
      </div>
      
      <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white mb-6 sm:mb-8 tracking-tighter leading-[1.1] sm:leading-[1.0] relative z-10 max-w-5xl">
        Master notes <br className="hidden sm:block" /> with
        <span className="text-indigo-600 dark:text-indigo-400"> Gemdi.</span>
      </h1>
      
      <p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-10 sm:mb-14 leading-relaxed font-bold relative z-10">
        Gemdi architecturally transforms course materials into deep-dive study plans 
        and interactive sessions. Engineered with Gemini 3 Pro.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-20 sm:mb-32 relative z-10 w-full sm:w-auto">
        <button 
          onClick={onGetStarted}
          className="w-full sm:w-auto px-12 py-4 sm:py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl shadow-2xl transition-all text-lg hover:bg-indigo-600 dark:hover:bg-indigo-50 active:scale-95"
        >
          Get Started
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl relative z-10">
        {[
          {
            icon: <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>,
            title: "Deep Extraction",
            desc: "Neural analysis that scans structure and logic."
          },
          {
            icon: <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>,
            title: "Roadmap Logic",
            desc: "Structured phases for actionable study steps."
          },
          {
            icon: <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
            title: "Recall Engine",
            desc: "Flashcards that make memory testing tactile."
          }
        ].map((item, i) => (
          <div key={i} className="group p-8 sm:p-10 bg-white dark:bg-slate-800 rounded-[2.5rem] chic-shadow border border-slate-100 dark:border-slate-700 text-left transition-all hover:-translate-y-2">
            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
              {item.icon}
            </div>
            <h3 className="font-black text-xl mb-2 text-slate-900 dark:text-white tracking-tight">{item.title}</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm font-bold leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Landing;
