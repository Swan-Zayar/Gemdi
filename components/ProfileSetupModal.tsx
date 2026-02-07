import React, { useState } from 'react';
import { AVATARS, DEFAULT_AVATAR } from '../src/avatars';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onComplete: (username: string, avatar: string) => void;
}

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onComplete }) => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATAR || '');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
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

  const handleComplete = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    onComplete(username.trim(), selectedAvatar);
  };

  return (
    <div className="fixed inset-0 z-1001 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[3rem] p-8 sm:p-10 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Welcome to Gemdi!</h2>

        <div className="space-y-8">
          {/* Avatar Selection */}
          <div className="flex flex-col items-center">
            <div 
              className={`relative group mb-6 cursor-pointer ${
                isDragging ? 'ring-4 ring-indigo-500 ring-offset-2' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={selectedAvatar} className="w-24 h-24 rounded-4xl border-4 border-indigo-50 dark:border-slate-700 shadow-2xl object-cover transition-transform group-hover:scale-105" alt="Avatar" />
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
            
            <div className="flex flex-wrap justify-center gap-3">
              {AVATARS.map((avatar) => (
                <button 
                  key={avatar.name}
                  onClick={() => setSelectedAvatar(avatar.src)}
                  className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${selectedAvatar === avatar.src ? 'border-indigo-600 scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                </button>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="w-10 h-10 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                title="Upload custom image"
              >
                <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Choose Your Username</label>
            <input 
              type="text" 
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                setError('');
              }}
              onKeyDown={e => e.key === 'Enter' && handleComplete()}
              placeholder="Enter a username..."
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs font-bold mt-2 ml-2">{error}</p>
            )}
          </div>

          <button 
            onClick={handleComplete} 
            className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-3xl tracking-widest uppercase text-sm hover:shadow-2xl transition-all active:scale-95"
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
