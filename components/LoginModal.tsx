
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

const GemdiLogoIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gemGradientModal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#2dd4bf" />
      </linearGradient>
    </defs>
    <path d="M50 5 L90 35 L50 95 L10 35 Z" fill="url(#gemGradientModal)" />
    <path d="M50 5 L90 35 L50 45 Z" fill="white" fillOpacity="0.1" />
    <path d="M50 5 L10 35 L50 45 Z" fill="black" fillOpacity="0.05" />
    <path d="M32 45 L45 58 L68 32" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type LoginStep = 'EMAIL' | 'PASSWORD_ENTRY' | 'SIGNUP';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [step, setStep] = useState<LoginStep>('EMAIL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const isConfigured = !GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE");

  const requirements = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('EMAIL');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isConfigured && step === 'EMAIL') {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isOpen, isConfigured, step]);


  const handleEmailNext = () => {
    setError('');
    if (!email || !email.includes('@')) {
      setError("Please enter a valid academic email.");
      return;
    }
    const existing = storageService.findUserByEmail(email);
    if (existing) {
      setStep('PASSWORD_ENTRY');
    } else {
      setStep('SIGNUP');
    }
  };

  const handleMockLogin = () => {
    const mockEmail = 'scholar@gemdi.io';
    const existing = storageService.findUserByEmail(mockEmail);
    
    if (existing) {
      onLogin(existing);
    } else {
      const newUser: User = {
        id: 'mock-user-123',
        name: 'Gemdi Scholar',
        email: mockEmail,
        password: 'Password123!', // Pre-filled for mock
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=mock-scholar`
      };
      storageService.registerUser(newUser);
      onLogin(newUser);
    }
  };

  const handlePasswordLogin = () => {
    setError('');
    const existing = storageService.findUserByEmail(email);
    if (existing && existing.password === password) {
      onLogin(existing);
    } else {
      setError("Incorrect password for this vault.");
    }
  };

  const handleSignup = () => {
    setError('');
    if (!requirements.length) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!requirements.number) {
      setError("Password requires at least one number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email: email.toLowerCase(),
      password: password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    storageService.registerUser(newUser);
    onLogin(newUser);
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (requirements.length) strength += 1;
    if (requirements.number) strength += 1;
    if (requirements.special) strength += 1;
    return strength;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2.5rem] p-8 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp overflow-hidden" onClick={e => e.stopPropagation()}>
        
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 mx-auto mb-4 drop-shadow-xl">
            <GemdiLogoIcon className="w-full h-full" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {step === 'EMAIL' ? 'Welcome' : step === 'PASSWORD_ENTRY' ? 'Welcome Back!' : 'New Vault'}
          </h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 text-[10px] uppercase tracking-widest">
            {step === 'EMAIL' ? 'Secure Academic Access' : step === 'PASSWORD_ENTRY' ? 'Enter Password' : 'Authenticate & Create Vault'}
          </p>
        </div>

        <div className="space-y-5">
          {step === 'EMAIL' && (
            <>
              {isConfigured && <div ref={googleBtnRef} className="w-full min-h-11"></div>}
              <div className="relative flex items-center py-2">
                <div className="grow border-t border-slate-100 dark:border-slate-700"></div>
                <span className="mx-3 text-[8px] font-black text-slate-300 uppercase tracking-widest">Or Login with</span>
                <div className="grow border-t border-slate-100 dark:border-slate-700"></div>
              </div>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
              />
              <button onClick={handleEmailNext} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl tracking-widest text-[11px] uppercase hover:bg-indigo-600 transition-all">
                Continue
              </button>
              
              <div className="relative flex items-center pt-2">
                <div className="grow border-t border-slate-100 dark:border-slate-700/50 border-dashed"></div>
              </div>

              <button 
                onClick={handleMockLogin} 
                className="w-full py-3 bg-transparent border-2 border-indigo-600/30 text-indigo-600 dark:text-indigo-400 font-black rounded-2xl tracking-widest text-[9px] uppercase hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                Quick Access (Mock Login)
              </button>
            </>
          )}

          {step === 'PASSWORD_ENTRY' && (
            <>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center gap-3 border border-indigo-100 dark:border-indigo-800/50">
                 <div className="w-8 h-8 rounded-full bg-indigo-600 shrink-0 flex items-center justify-center text-white font-black text-xs">
                    {email[0].toUpperCase()}
                 </div>
                 <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Signed in as</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{email}</p>
                 </div>
              </div>
              <input 
                type="password" 
                placeholder="Vault Password" 
                autoFocus
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePasswordLogin()}
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
              />
              <button onClick={handlePasswordLogin} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl tracking-widest text-[11px] uppercase hover:bg-indigo-600 transition-all">
                Access Vault
              </button>
              <button onClick={() => setStep('EMAIL')} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-500">Back</button>
            </>
          )}

          {step === 'SIGNUP' && (
            <>
              <div className="space-y-4">
                <input 
                  type="password" 
                  placeholder="Create Password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
                />
                
                {/* Vault Security Criteria */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Security Requirements</p>
                  
                  {[
                    { met: requirements.length, label: "Minimum 8 characters" },
                    { met: requirements.number, label: "Contains a number (0-9)" },
                    { met: requirements.special, label: "Special symbol (!@#$)" }
                  ].map((req, i) => (
                    <div key={i} className={`flex items-center gap-2 transition-all ${req.met ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${req.met ? 'bg-indigo-500 border-indigo-500' : 'border-slate-200 dark:border-slate-700'}`}>
                        {req.met && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide">{req.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-1 h-1 px-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`flex-1 rounded-full transition-colors ${getPasswordStrength() >= i ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-700'}`}></div>
                  ))}
                </div>

                <input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
                />
              </div>

              <button onClick={handleSignup} className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl tracking-widest text-[11px] uppercase hover:bg-slate-900 transition-all">
                Create Vault
              </button>
              <button onClick={() => setStep('EMAIL')} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-500">Change Email</button>
            </>
          )}

          {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center animate-pulse">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
