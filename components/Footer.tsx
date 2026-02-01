
import React from 'react';
import { GemdiLogo } from './Header';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-12 pb-8 px-6">
      <div className="max-w-7xl mx-auto glass-panel rounded-4xl p-8 chic-shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <GemdiLogo className="w-6 h-6" />
              <span className="text-lg font-black tracking-tighter text-slate-900 dark:text-white">Gemdi</span>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-slate-400 dark:text-slate-500 text-xs font-medium leading-relaxed max-w-lg">
                AI study app compatible for anyone around the world. <br/> Engineered for equality, built for dreamers.
              </p>
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 dark:text-slate-600">
                {currentYear} Swan's Lab.
              </p>
            </div>
          </div>
        </div>   
      </div>
    </footer>
  );
};

export default Footer;
