import React from 'react';
import { useTranslation } from '../../services/i18n';

interface HowToModalProps {
  onClose: () => void;
}

const HowToModal: React.FC<HowToModalProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="p-8 sm:p-10 overflow-y-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t('howTo.title')}</h2>
          </div>
          <div className="space-y-6 text-slate-600 dark:text-slate-300">
            <div className="space-y-4">
              {[
                { key: 1, title: t('howTo.step1Title'), desc: t('howTo.step1Desc') },
                { key: 2, title: t('howTo.step2Title'), desc: t('howTo.step2Desc') },
                { key: 3, title: t('howTo.step3Title'), desc: t('howTo.step3Desc') },
                { key: 4, title: t('howTo.step4Title'), desc: t('howTo.step4Desc') },
                { key: 5, title: t('howTo.step5Title'), desc: t('howTo.step5Desc') },
                { key: 6, title: t('howTo.step6Title'), desc: t('howTo.step6Desc') },
              ].map(step => (
                <div key={step.key} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-black">{step.key}</span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToModal;
