import React from 'react';
import { useTranslation } from '../../services/i18n';

interface DeleteSessionModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteSessionModal: React.FC<DeleteSessionModalProps> = ({ onConfirm, onCancel }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[1002] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn" onClick={onCancel}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-4xl p-8 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight text-center mb-2">{t('dashboard.deleteSession')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-8">
          {t('dashboard.deleteWarning')}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-black rounded-2xl tracking-widest uppercase text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-all active:scale-95">
            {t('common.cancel')}
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white font-black rounded-2xl tracking-widest uppercase text-sm hover:bg-red-700 transition-all active:scale-95">
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSessionModal;
