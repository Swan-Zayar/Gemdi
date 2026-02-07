
import React, { useState } from 'react';
import { UserLocal } from '../types';
import { ThemeMode } from '../services/theme';
import { AVATARS } from '../src/avatars';

interface ProfileModalProps {
  user: UserLocal;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: UserLocal) => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
  {
    mode: 'light',
    label: 'Light',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m0-11.314L7.05 7.05m10.314 10.314l1.414 1.414" />
        <circle cx="12" cy="12" r="4" strokeWidth="2.5" />
      </svg>
    )
  },
  {
    mode: 'dark',
    label: 'Dark',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    )
  },
  {
    mode: 'system',
    label: 'System',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 20h8" />
      </svg>
    )
  }
];

const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onUpdate, themeMode, onThemeChange }) => {
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(themeMode);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleSave = () => {
    onUpdate({ ...user, name, avatar: selectedAvatar });
    if (selectedTheme !== themeMode) {
      onThemeChange(selectedTheme);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-1001 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-[3rem] p-8 sm:p-10 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Profile Settings</h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side - Avatar Section */}
          <div className="flex flex-col items-center md:w-1/2 lg:w-2/5">
            <div 
              className={`relative group mb-6 cursor-pointer ${
                isDragging ? 'ring-4 ring-indigo-500 ring-offset-2' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={selectedAvatar} className="w-32 h-32 rounded-4xl border-4 border-indigo-50 dark:border-slate-700 shadow-2xl object-cover transition-transform group-hover:scale-105" alt="Avatar" />
              <div className="absolute inset-0 bg-black/40 rounded-4xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="flex flex-wrap justify-center gap-3 max-w-xs">
              {AVATARS.map((avatar) => (
                <button 
                  key={avatar.name}
                  onClick={() => setSelectedAvatar(avatar.src)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${selectedAvatar === avatar.src ? 'border-indigo-600 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                </button>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                title="Upload custom image"
              >
                <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side - Settings Section */}
          <div className="flex flex-col md:w-1/2 lg:w-3/5 space-y-6">
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
              <input 
                type="text" 
                disabled
                value={user.email}
                className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.mode}
                    onClick={() => {
                      setSelectedTheme(option.mode);
                      onThemeChange(option.mode);
                    }}
                    aria-label={option.label}
                    title={option.label}
                    className={`py-3 rounded-2xl border transition-all flex items-center justify-center ${selectedTheme === option.mode ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    {option.icon}
                    <span className="sr-only">{option.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                System uses your OS appearance. <br/>
                Note: Make sure the website theme doesn't conflict with your OS theme for best experience.
              </p>
            </div>

            <button onClick={handleSave} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-3xl tracking-widest uppercase text-sm hover:shadow-2xl transition-all active:scale-95">
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
