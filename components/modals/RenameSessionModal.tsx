import React from 'react';
import { useTranslation } from '../../services/i18n';

interface RenameSessionModalProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const RenameSessionModal: React.FC<RenameSessionModalProps> = ({ value, onChange, onSave, onCancel }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn" onClick={onCancel}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-4xl p-8 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-center mb-2">{t('dashboard.renameSession')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">{t('dashboard.enterNewName')}</p>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSave();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder={t('dashboard.sessionName')}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-base text-slate-700 dark:text-slate-300 mb-6"
          autoFocus
        />
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-2xl tracking-widest uppercase text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-all active:scale-95">
            {t('common.cancel')}
          </button>
          <button onClick={onSave} className="flex-1 py-3 bg-blue-600 text-white font-black rounded-2xl tracking-widest uppercase text-sm hover:bg-blue-700 transition-all active:scale-95">
            {t('dashboard.rename')}
          </button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-4">
          <span className="font-bold text-blue-600 dark:text-blue-400">Enter</span> / <span className="font-bold">Esc</span>
        </p>
      </div>
    </div>
  );
};

export default RenameSessionModal;
