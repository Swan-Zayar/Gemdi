
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
}

const AVATAR_OPTIONS = [
  'Midnight', 'Aurora', 'Oxford', 'Scholar', 'Neural', 'Cyber', 'Classic'
];

const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdate({ ...user, name, avatar: selectedAvatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[3rem] p-8 sm:p-10 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Profile Settings</h2>

        <div className="space-y-8">
          <div className="flex flex-col items-center">
            <div className="relative group mb-6">
              <img src={selectedAvatar} className="w-24 h-24 rounded-[2rem] border-4 border-indigo-50 dark:border-slate-700 shadow-2xl object-cover transition-transform group-hover:scale-105" alt="Avatar" />
              <div className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3">
              {AVATAR_OPTIONS.map(opt => {
                const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${opt}`;
                return (
                  <button 
                    key={opt}
                    onClick={() => setSelectedAvatar(url)}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${selectedAvatar === url ? 'border-indigo-600 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={url} alt={opt} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Display Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Identity (Email)</label>
              <input 
                type="text" 
                disabled
                value={user.email}
                className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <button onClick={handleSave} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-[1.5rem] tracking-widest uppercase text-sm hover:shadow-2xl transition-all active:scale-95">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
