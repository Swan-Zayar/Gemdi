import React, { useEffect, useState } from 'react';
import { UserLocal } from '../types';
import { ThemeMode } from '../services/theme';
import { AVATARS } from '../src/avatars';
import { useTranslation, LANGUAGE_OPTIONS } from '../services/i18n';
import ImageCropModal from './ImageCropModal';
import { validateUsername } from '../services/validation';

interface ProfileModalProps {
  user: UserLocal;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: UserLocal) => Promise<void>;
  onLogout: () => void;
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

const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onUpdate, onLogout, themeMode, onThemeChange }) => {
  const { t, setLanguage } = useTranslation();
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(themeMode);
  const [selectedLanguage, setSelectedLanguage] = useState(user.language || 'en');
  const [nameError, setNameError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Preview theme in the DOM without persisting
  const previewTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  };

  const revertTheme = () => {
    previewTheme(themeMode);
  };

  useEffect(() => {
    if (!isOpen) return;
    setName(user.name);
    setSelectedAvatar(user.avatar);
    setSelectedTheme(themeMode);
    setSelectedLanguage(user.language || 'en');
    setNameError('');
    setSaveError('');
  }, [isOpen, user, themeMode]);

  if (!isOpen) return null;

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(t('profile.uploadImageFile'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageToCrop(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string) => {
    setSelectedAvatar(croppedImage);
    setImageToCrop(null);
  };

  const handleCropCancel = () => {
    setImageToCrop(null);
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

  const handleSave = async () => {
    const validation = validateUsername(name);
    if (!validation.valid) {
      setNameError(validation.error || 'Invalid username');
      return;
    }
    setIsSaving(true);
    setSaveError('');
    try {
      await onUpdate({ ...user, name, avatar: selectedAvatar, language: selectedLanguage });
      setLanguage(selectedLanguage as any);
      onThemeChange(selectedTheme);
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveError('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {imageToCrop && (
        <ImageCropModal
          image={imageToCrop}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
      <div className="fixed inset-0 z-1001 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn overflow-y-auto" onClick={() => { revertTheme(); onClose(); }}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-4xl p-10 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp my-auto max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header Row */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight">{t('profile.title')}</h2>
          <button onClick={() => { revertTheme(); onClose(); }} className="w-8 h-8 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Avatar Section */}
          <div className="flex flex-col items-center gap-6 md:w-1/2 lg:w-2/5">
            <div
              className={`relative group cursor-pointer ${
                isDragging ? 'ring-4 ring-blue-500 ring-offset-2' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={selectedAvatar} className="w-32 h-32 rounded-4xl border-4 border-blue-50 dark:border-slate-700 shadow-2xl object-cover transition-transform group-hover:scale-105" alt="Avatar" />
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
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${selectedAvatar === avatar.src ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                </button>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title={t('profile.uploadImage')}
              >
                <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Language Selection */}
            <div className="w-full flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[3px] text-center">{t('profile.language')}</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full h-13 px-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => { revertTheme(); onClose(); onLogout(); }}
              className="w-full h-12 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-extrabold rounded-3xl tracking-[3px] uppercase text-xs hover:bg-red-100 dark:hover:bg-red-900/30 transition-all active:scale-95 border border-red-100 dark:border-red-900/30 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </div>

          {/* Right Column - Settings Section */}
          <div className="flex flex-col gap-6 md:w-1/2 lg:w-3/5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[3px]">{t('profile.displayName')}</label>
              <input
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setNameError('');
                }}
                className="w-full h-13 px-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
              {nameError && (
                <p className="text-red-500 text-xs font-bold mt-1 ml-2">{nameError}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[3px]">{t('profile.email')}</label>
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full h-13 px-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-400 cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[3px]">{t('profile.theme')}</label>
              <div className="grid grid-cols-3 gap-3">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.mode}
                    onClick={() => {
                      setSelectedTheme(option.mode);
                      previewTheme(option.mode);
                    }}
                    aria-label={option.label}
                    title={option.label}
                    className={`h-13 rounded-2xl border transition-all flex items-center justify-center ${selectedTheme === option.mode ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}
                  >
                    {option.icon}
                    <span className="sr-only">{option.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1">
                {t('profile.themeNote')} <br/>
                {t('profile.themeWarning')}
              </p>
            </div>

            {saveError && (
              <p className="text-red-500 text-xs font-bold ml-2">{saveError}</p>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold rounded-3xl tracking-[3px] uppercase text-xs hover:shadow-2xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : t('profile.savePreferences')}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProfileModal;
