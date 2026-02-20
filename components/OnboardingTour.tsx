import React, { useState, useEffect, useCallback } from 'react';

interface OnboardingTourProps {
  onDone: () => void;
}

const STEPS = [
  {
    selector: '[data-tour="upload-area"]',
    title: 'Start Here',
    description: 'Upload any PDF or DOCX file. Gemdi will turn it into a study plan, flashcards, and a quiz automatically.',
    side: 'bottom' as const,
  },
  {
    selector: '[data-tour="customize-ai"]',
    title: 'Customize the AI',
    description: 'Tell the AI how to process your material — focus on specific topics, add more examples, or adjust the depth of notes before uploading.',
    side: 'bottom' as const,
  },
  {
    selector: '[data-tour="study-vault"]',
    title: 'Your Study Sessions',
    description: 'All your processed materials appear here. Click any session to open your study plan.',
    side: 'top' as const,
  },
  {
    selector: '[data-tour="stats"]',
    title: 'Track Your Progress',
    description: 'See your total sessions, cards reviewed, quizzes completed, and daily study streak.',
    side: 'top' as const,
  },
  {
    selector: '[data-tour="profile-btn"]',
    title: 'Your Settings',
    description: 'Change your avatar, theme, and language preferences here.',
    side: 'bottom' as const,
  },
];

const TOOLTIP_WIDTH = 288; // w-72
const TOOLTIP_HEIGHT_ESTIMATE = 180;
const SPOT_PAD = 10;

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
    const el = document.querySelector(STEPS[step].selector);
    if (el) {
      setRect(el.getBoundingClientRect());
    } else {
      setRect(null);
    }
  }, [step]);

  useEffect(() => {
    const el = document.querySelector(STEPS[step].selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timer = setTimeout(updateRect, 350);
      window.addEventListener('resize', updateRect);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateRect);
      };
    } else {
      setRect(null);
    }
  }, [step, updateRect]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      onDone();
    }
  };

  const currentStep = STEPS[step];

  // Spotlight rect with padding
  const rx = rect ? rect.left - SPOT_PAD : 0;
  const ry = rect ? rect.top - SPOT_PAD : 0;
  const rw = rect ? rect.width + SPOT_PAD * 2 : 0;
  const rh = rect ? rect.height + SPOT_PAD * 2 : 0;

  // Tooltip position
  let tooltipTop: number;
  let tooltipLeft: number;

  if (rect) {
    if (currentStep.side === 'bottom') {
      tooltipTop = rect.bottom + SPOT_PAD + 12;
      tooltipLeft = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    } else {
      tooltipTop = rect.top - SPOT_PAD - TOOLTIP_HEIGHT_ESTIMATE - 12;
      tooltipLeft = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    }
    tooltipLeft = Math.max(8, Math.min(tooltipLeft, window.innerWidth - TOOLTIP_WIDTH - 8));
    tooltipTop = Math.max(8, tooltipTop);
  } else {
    // Centered fallback when element not found
    tooltipTop = window.innerHeight / 2 - TOOLTIP_HEIGHT_ESTIMATE / 2;
    tooltipLeft = window.innerWidth / 2 - TOOLTIP_WIDTH / 2;
  }

  return (
    <>
      {/* Darkened overlay with spotlight hole */}
      <svg
        className="fixed inset-0 w-screen h-screen"
        style={{ zIndex: 9998, pointerEvents: 'none' }}
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect x={rx} y={ry} width={rw} height={rh} rx="14" fill="black" />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(15,23,42,0.78)"
          mask="url(#tour-mask)"
        />
        {/* Highlight ring around target */}
        {rect && (
          <rect
            x={rx}
            y={ry}
            width={rw}
            height={rh}
            rx="14"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
          />
        )}
      </svg>

      {/* Tooltip card */}
      <div
        style={{
          position: 'fixed',
          top: tooltipTop,
          left: tooltipLeft,
          width: TOOLTIP_WIDTH,
          zIndex: 9999,
        }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-2xl border border-slate-100 dark:border-slate-700 animate-slideUp"
      >
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">
          Step {step + 1} of {STEPS.length}
        </p>
        <p className="font-extrabold text-slate-900 dark:text-white text-base mb-1">
          {currentStep.title}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          {currentStep.description}
        </p>
        <div className="flex items-center justify-between">
          <button
            onClick={onDone}
            className="text-slate-400 text-sm underline"
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-opacity active:scale-95"
          >
            {step < STEPS.length - 1 ? 'Next' : 'Get Started'}
          </button>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
