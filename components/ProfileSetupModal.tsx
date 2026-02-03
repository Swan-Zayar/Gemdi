import React, { useState } from 'react';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onComplete: (username: string, avatar: string) => void;
}

const AVATAR_OPTIONS = [
  'Midnight', 'Aurora', 'Oxford', 'Scholar', 'Neural', 'Cyber', 'Classic', 'Phoenix', 'Nova', 'Zenith'
];

const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, onComplete }) => {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(`https://api.dicebear.com/7.x/avataaars/svg?seed=Scholar`);
  const [error, setError] = useState('');

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-1001 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[3rem] p-8 sm:p-12 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Welcome to Gemdi!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Let's set up your profile</p>
        </div>

        <div className="space-y-8">
          {/* Avatar Selection */}
          <div className="flex flex-col items-center">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Choose Your Avatar</label>
            <div className="relative group mb-6">
              <img src={selectedAvatar} className="w-24 h-24 rounded-3xl border-4 border-indigo-100 dark:border-slate-700 shadow-xl object-cover transition-transform" alt="Avatar" />
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 max-w-sm">
              {AVATAR_OPTIONS.map(opt => {
                const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${opt}`;
                return (
                  <button 
                    key={opt}
                    onClick={() => setSelectedAvatar(url)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${selectedAvatar === url ? 'border-indigo-600 scale-110 shadow-lg' : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100 hover:scale-105'}`}
                  >
                    <img src={url} alt={opt} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Choose Your Username</label>
            <input 
              type="text" 
              value={username}
              onChange={e => {
                setUsername(e.target.value);
                setError('');
              }}
              onKeyDown={e => e.key === 'Enter' && handleComplete()}
              placeholder="Enter a username..."
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs font-bold mt-2 ml-2">{error}</p>
            )}
          </div>

          <button 
            onClick={handleComplete} 
            className="w-full py-5 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-black rounded-3xl tracking-widest uppercase text-sm hover:shadow-2xl transition-all active:scale-95 hover:from-indigo-700 hover:to-purple-700"
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupModal;
