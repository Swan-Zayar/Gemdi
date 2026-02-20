import React from 'react';
import { useTranslation } from '../../services/i18n';

interface CustomPromptModalProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
  error: string | null;
}

const CustomPromptModal: React.FC<CustomPromptModalProps> = ({ value, onChange, onSave, onClose, error }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[1002] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] rounded-t-[3rem] sm:rounded-[3rem] shadow-[0_32px_128px_-15px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 animate-slideUp flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Gradient Header */}
        <div className="px-8 sm:px-10 pt-8 sm:pt-10 pb-6 relative shrink-0" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #0B1020 100%)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20"></div>
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">{t('dashboard.customizeAi')}</h2>
              <p className="text-sm text-white/50 mt-1 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Applies to future uploads only
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 sm:px-10 py-6 space-y-5">
          <div>
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Custom Instructions</label>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Add custom instructions for how Gemini should process your study materials..."
              rows={5}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm text-slate-700 dark:text-slate-300 resize-none placeholder-slate-400 dark:placeholder-slate-600"
              autoFocus
            />
            <div className="flex items-center justify-between mt-2 px-1">
              <span className={`text-xs font-bold ${value.length > 500 ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'}`}>
                {value.length}/500 characters
              </span>
            </div>
            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl">
                <p className="text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-5">
            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Example Instructions</p>
            <div className="space-y-2.5">
              {[
                'Focus on practical examples and real-world applications',
                'Include more mathematical proofs and derivations',
                'Emphasize implementation details and code patterns',
                'Add historical context and background information',
              ].map((example, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">&ldquo;{example}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 sm:px-10 pb-8 sm:pb-10 pt-4 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black rounded-2xl tracking-widest uppercase text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 border border-slate-200 dark:border-slate-700">
            {t('common.cancel')}
          </button>
          <button onClick={onSave} className="flex-1 py-3.5 bg-blue-600 text-white font-black rounded-2xl tracking-widest uppercase text-sm hover:bg-blue-700 transition-all active:scale-95">
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomPromptModal;
