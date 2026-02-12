
import React, { useRef } from 'react';
import { GemdiLogo } from './GemdiLogo';

interface LandingProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted, onLoginClick }) => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* ── Nav Bar ── */}
      <nav className="sticky top-0 z-50 w-full h-18 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 md:px-12 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <GemdiLogo className="w-7 h-7" gradientId="navGrad" />
          <span className="text-[22px] font-extrabold text-slate-900 dark:text-white tracking-tight">Gemdi</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo(featuresRef)} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Features</button>
          <button onClick={() => scrollTo(howItWorksRef)} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">How It Works</button>
          <button className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onLoginClick} className="hidden sm:block text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-5 py-2.5 rounded-full transition-colors">Log In</button>
          <button onClick={onGetStarted} className="text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-5 py-2.5 rounded-full transition-colors">Get Started</button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="flex flex-col items-center text-center px-6 md:px-12 pt-16 pb-12 md:pt-20 md:pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-[13px] font-semibold text-indigo-500 dark:text-indigo-400">AI-Powered Study Companion</span>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-1 mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ letterSpacing: '-1.5px' }}>Master Your Notes</h1>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-indigo-500 dark:text-indigo-400 tracking-tight" style={{ letterSpacing: '-1.5px' }}>with Gemdi</h1>
        </div>

        {/* Subtitle */}
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mb-8" style={{ lineHeight: 1.6 }}>
          Transform dense course materials into structured study plans, interactive flashcards, and adaptive quizzes — all powered by AI.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button onClick={onGetStarted} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-base px-7 py-3.5 rounded-full transition-colors">
            Start Learning Free
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
          <button onClick={() => scrollTo(howItWorksRef)} className="flex items-center gap-2 border-[1.5px] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-base px-7 py-3.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            See How It Works
          </button>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section ref={featuresRef} className="flex flex-col items-center px-6 md:px-12 py-16">
        <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 tracking-[2px] uppercase mb-4">WHY GEMDI</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white text-center mb-12" style={{ letterSpacing: '-0.5px' }}>Built for how you actually study</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* Card 1 — Deep Extraction */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col gap-5">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="M13.3 16.3 15 18"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deep Extraction</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed" style={{ lineHeight: 1.65 }}>Upload any PDF or DOCX. Our AI reads and understands your material, extracting key concepts, definitions, and relationships.</p>
          </div>

          {/* Card 2 — Smart Roadmaps */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col gap-5">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart Roadmaps</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed" style={{ lineHeight: 1.65 }}>Get a structured study plan broken into phases. Each step builds on the last, guiding you from fundamentals to mastery.</p>
          </div>

          {/* Card 3 — Active Recall */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col gap-5">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M12 18v-5l-1.5 1"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Recall</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed" style={{ lineHeight: 1.65 }}>Auto-generated flashcards and quizzes drill your knowledge. Rate your confidence and track mastery over time.</p>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section ref={howItWorksRef} className="flex flex-col items-center bg-white dark:bg-slate-800 px-6 md:px-12 py-16">
        <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 tracking-[2px] uppercase mb-4">HOW IT WORKS</span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white text-center mb-12" style={{ letterSpacing: '-0.5px' }}>From upload to mastery in 3 steps</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          {/* Step 1 */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-[22px] font-extrabold text-white">1</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Material</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Drop in your PDF or DOCX course files</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-[22px] font-extrabold text-white">2</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Generates Plan</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Gemini AI creates a structured roadmap with flashcards and quizzes</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center">
              <span className="text-[22px] font-extrabold text-white">3</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Study & Master</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Drill with active recall, track confidence, and achieve mastery</p>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="flex flex-col items-center text-center px-6 md:px-12 py-20" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
        <h2 className="text-3xl md:text-[40px] font-extrabold text-white mb-6" style={{ letterSpacing: '-0.5px' }}>Ready to study smarter?</h2>
        <p className="text-base text-white/80 max-w-md leading-relaxed mb-8" style={{ lineHeight: 1.5 }}>Join now to transform your study habits with Gemdi.</p>
        <button onClick={onGetStarted} className="flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-600 font-bold text-base px-8 py-4 rounded-full transition-colors">
          Get Started — It's Free
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full h-16 bg-slate-900 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2">
          <GemdiLogo className="w-5 h-5" gradientId="footLandGrad" />
          <span className="text-base font-bold text-white">Gemdi</span>
        </div>
        <span className="text-[13px] text-white/50">2025 Gemdi. Built by Swan's Lab.</span>
      </footer>
    </div>
  );
};

export default Landing;
