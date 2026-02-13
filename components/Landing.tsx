
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GemdiLogo } from './GemdiLogo';

interface LandingProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
}

/** Hook that cycles through phrases with a typewriter typing/deleting effect */
function useTypewriter(phrases: string[], typingMs = 80, deletingMs = 40, pauseMs = 1500): string {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIndex];

    if (!isDeleting && charCount < current.length) {
      const id = setTimeout(() => setCharCount(c => c + 1), typingMs);
      return () => clearTimeout(id);
    }

    if (!isDeleting && charCount === current.length) {
      const id = setTimeout(() => setIsDeleting(true), pauseMs);
      return () => clearTimeout(id);
    }

    if (isDeleting && charCount > 0) {
      const id = setTimeout(() => setCharCount(c => c - 1), deletingMs);
      return () => clearTimeout(id);
    }

    if (isDeleting && charCount === 0) {
      setIsDeleting(false);
      setPhraseIndex(i => (i + 1) % phrases.length);
    }
  }, [charCount, isDeleting, phraseIndex, phrases, typingMs, deletingMs, pauseMs]);

  return phrases[phraseIndex].slice(0, charCount);
}

/** Hook that tracks whether the element is currently in view (toggles on scroll) */
function useInView(threshold = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

const HERO_PHRASES = [
  'Master Your Notes',
  'Ace Every Exam',
  'Learn Anything Faster',
  'Unlock Your Potential',
  'Study Without Limits',
];

const Landing: React.FC<LandingProps> = ({ onGetStarted, onLoginClick }) => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const heroText = useTypewriter(HERO_PHRASES);

  const [featuresInViewRef, featuresVisible] = useInView(0.1);
  const [howItWorksInViewRef, howItWorksVisible] = useInView(0.1);
  const [ctaInViewRef, ctaVisible] = useInView(0.15);

  /** Merge two refs into one callback ref */
  const mergeRefs = useCallback(
    (scrollRef: React.RefObject<HTMLDivElement | null>, inViewRef: React.RefObject<HTMLDivElement | null>) => {
      return (node: HTMLDivElement | null) => {
        (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        (inViewRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      };
    },
    []
  );

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* ── Animation Keyframes ── */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-18px); }
        }
        @keyframes floatSlower {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(12px); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes drawLine {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
          50%      { box-shadow: 0 0 20px 4px rgba(255,255,255,0.15); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.4); opacity: 0.7; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }

        .anim-blink { animation: blink 0.7s step-end infinite; }
        .anim-fade-in-down { animation: fadeInDown 0.6s ease-out both; }
        .anim-fade-in-up   { animation: fadeInUp 0.6s ease-out both; }
        .anim-fade-in       { animation: fadeIn 0.5s ease-out both; }
        .anim-scale-in      { animation: scaleIn 0.5s ease-out both; }
        .anim-float-slow    { animation: floatSlow 6s ease-in-out infinite; }
        .anim-float-slower  { animation: floatSlower 8s ease-in-out infinite; }
        .anim-pulse-glow    { animation: pulseGlow 2.5s ease-in-out infinite; }
        .anim-pulse-dot     { animation: pulseDot 2s ease-in-out infinite; }

        .anim-delay-100 { animation-delay: 100ms; }
        .anim-delay-200 { animation-delay: 200ms; }
        .anim-delay-300 { animation-delay: 300ms; }
        .anim-delay-400 { animation-delay: 400ms; }
        .anim-delay-500 { animation-delay: 500ms; }
        .anim-delay-600 { animation-delay: 600ms; }
        .anim-delay-700 { animation-delay: 700ms; }

        .anim-draw-line {
          animation: drawLine 0.8s ease-out both;
          animation-delay: 300ms;
        }
      `}</style>

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
          <button onClick={onGetStarted} className="text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-5 py-2.5 rounded-full transition-colors hover:scale-105 transform duration-200">Get Started</button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative flex flex-col items-center text-center px-6 md:px-12 pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden">
        {/* Floating decorative orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute -top-20 -left-24 w-72 h-72 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl anim-float-slow" />
          <div className="absolute top-10 -right-20 w-56 h-56 bg-purple-400/15 dark:bg-purple-500/10 rounded-full blur-3xl anim-float-slower" />
          <div className="absolute -bottom-16 left-1/3 w-64 h-64 bg-cyan-400/10 dark:bg-cyan-500/8 rounded-full blur-3xl anim-float-slow anim-delay-300" />
        </div>

        {/* Badge */}
        <div className="relative inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full mb-8 anim-fade-in-down">
          <span className="w-2 h-2 rounded-full bg-indigo-500 anim-pulse-dot" />
          <span className="text-[13px] font-semibold text-indigo-500 dark:text-indigo-400">AI-Powered Study Companion</span>
        </div>

        {/* Title */}
        <div className="relative flex flex-col items-center gap-1 mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight anim-fade-in-up anim-delay-100 whitespace-nowrap" style={{ letterSpacing: '-1.5px', minHeight: '1.2em' }}>
            {heroText}
            <span className="anim-blink text-indigo-500 dark:text-indigo-400 font-light">|</span>
          </h1>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-indigo-500 dark:text-indigo-400 tracking-tight anim-fade-in-up anim-delay-300" style={{ letterSpacing: '-1.5px' }}>with Gemdi</h1>
        </div>

        {/* Subtitle */}
        <p className="relative text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed mb-8 anim-fade-in anim-delay-500" style={{ lineHeight: 1.6 }}>
          Transform dense course materials into structured study plans, interactive flashcards, and adaptive quizzes — all powered by AI.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center gap-4">
          <button onClick={onGetStarted} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-base px-7 py-3.5 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25 anim-fade-in-up anim-delay-500">
            Start Learning Free
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
          <button onClick={() => scrollTo(howItWorksRef)} className="flex items-center gap-2 border-[1.5px] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-base px-7 py-3.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 anim-fade-in-up anim-delay-700">
            <svg className="w-4 h-4 anim-pulse-dot" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            See How It Works
          </button>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section ref={mergeRefs(featuresRef, featuresInViewRef)} className="flex flex-col items-center px-6 md:px-12 py-16">
        <span className={`text-xs font-bold text-indigo-500 dark:text-indigo-400 tracking-[2px] uppercase mb-4 transition-all duration-500 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>WHY GEMDI</span>
        <h2 className={`text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white text-center mb-12 transition-all duration-500 delay-100 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ letterSpacing: '-0.5px' }}>Built for how you actually study</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {/* Card 1 — Deep Extraction */}
          <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col gap-5 transition-all duration-500 delay-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="M13.3 16.3 15 18"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deep Extraction</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed" style={{ lineHeight: 1.65 }}>Upload any PDF or DOCX. Our AI reads and understands your material, extracting key concepts, definitions, and relationships.</p>
          </div>

          {/* Card 2 — Smart Roadmaps */}
          <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col gap-5 transition-all duration-500 delay-[350ms] hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart Roadmaps</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed" style={{ lineHeight: 1.65 }}>Get a structured study plan broken into phases. Each step builds on the last, guiding you from fundamentals to mastery.</p>
          </div>

          {/* Card 3 — Active Recall */}
          <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col gap-5 transition-all duration-500 delay-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M12 18v-5l-1.5 1"/></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Recall</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed" style={{ lineHeight: 1.65 }}>Auto-generated flashcards and quizzes drill your knowledge. Rate your confidence and track mastery over time.</p>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section ref={mergeRefs(howItWorksRef, howItWorksInViewRef)} className="flex flex-col items-center bg-white dark:bg-slate-800 px-6 md:px-12 py-16">
        <span className={`text-xs font-bold text-indigo-500 dark:text-indigo-400 tracking-[2px] uppercase mb-4 transition-all duration-500 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>HOW IT WORKS</span>
        <h2 className={`text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white text-center mb-12 transition-all duration-500 delay-100 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ letterSpacing: '-0.5px' }}>From upload to mastery in 3 steps</h2>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          {/* Connecting line between steps (desktop only) */}
          <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%] h-[2px] z-0">
            <div className={`h-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-amber-500 rounded-full ${howItWorksVisible ? 'anim-draw-line' : 'w-0'}`} />
          </div>

          {/* Step 1 */}
          <div className={`relative z-10 flex flex-col items-center gap-4 text-center transition-all duration-500 delay-200 ${howItWorksVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-[22px] font-extrabold text-white">1</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Material</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Drop in your PDF or DOCX course files</p>
          </div>

          {/* Step 2 */}
          <div className={`relative z-10 flex flex-col items-center gap-4 text-center transition-all duration-500 delay-[400ms] ${howItWorksVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-[22px] font-extrabold text-white">2</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Generates Plan</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Gemini AI creates a structured roadmap with flashcards and quizzes</p>
          </div>

          {/* Step 3 */}
          <div className={`relative z-10 flex flex-col items-center gap-4 text-center transition-all duration-500 delay-[600ms] ${howItWorksVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="text-[22px] font-extrabold text-white">3</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Study & Master</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Drill with active recall, track confidence, and achieve mastery</p>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section ref={ctaInViewRef} className={`flex flex-col items-center text-center px-6 md:px-12 py-20 transition-all duration-700 ${ctaVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)' }}>
        <h2 className="text-3xl md:text-[40px] font-extrabold text-white mb-6" style={{ letterSpacing: '-0.5px' }}>Ready to study smarter?</h2>
        <p className="text-base text-white/80 max-w-md leading-relaxed mb-8" style={{ lineHeight: 1.5 }}>Join now to transform your study habits with Gemdi.</p>
        <button onClick={onGetStarted} className={`flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-600 font-bold text-base px-8 py-4 rounded-full transition-all duration-200 hover:scale-105 ${ctaVisible ? 'anim-pulse-glow' : ''}`}>
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
