import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../firebaseCLI';
import { GemdiLogo } from './GemdiLogo';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

type LoginStep = 'MODE_SELECT' | 'EMAIL' | 'PASSWORD_ENTRY' | 'SIGNUP';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [step, setStep] = useState<LoginStep>('MODE_SELECT');
  const [mode, setMode] = useState<'login' | 'signup' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [providers, setProviders] = useState<string[]>([]);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const requirements = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('MODE_SELECT');
      setMode(null);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError('');
      setProviders([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && (step === 'MODE_SELECT' || step === 'EMAIL')) {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isOpen, step]);

  const handleEmailNext = async () => {
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError("Please enter a valid email.");
      return;
    }

    try {
      const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
      setProviders(methods || []);
      setEmail(normalizedEmail);
      
      if (mode === 'login') {
        // Login mode - require existing account
        if (!methods || methods.length === 0) {
          setError("No account found with this email. Would you like to sign up instead?");
          return;
        }
        setStep('PASSWORD_ENTRY');
      } else if (mode === 'signup') {
        // Signup mode - check if account already exists
        if (methods && methods.length > 0) {
          // Email already exists - automatically switch to login mode
          setMode('login');
          setStep('PASSWORD_ENTRY');
          return;
        }
        setStep('SIGNUP');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to verify email.');
    }
  };

  const handlePasswordLogin = async () => {
    setError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      onLogin(cred.user); // Pass Firebase User directly
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError(err.message || 'Login failed.');
      }
    }
  };

  const handleSignup = async () => {
    setError('');
    
    // Validate password requirements
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

    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      // Double-check if user already exists
      const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);
      if (methods && methods.length > 0) {
        setError("An account with this email already exists. Please sign in instead.");
        setStep('PASSWORD_ENTRY');
        return;
      }

      // Create new account
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      onLogin(cred.user); // Pass Firebase User directly
    } catch (err: any) {
      console.error(err);
      
      // Handle specific Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setError("An account with this email already exists. Please sign in instead.");
        setStep('PASSWORD_ENTRY');
      } else if (err.code === 'auth/weak-password') {
        setError("Password is too weak. Please use a stronger password.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address.");
      } else {
        setError(err.message || 'Signup failed.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onLogin(result.user); // Pass Firebase User directly
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up blocked. Please allow pop-ups for this site.');
      } else {
        setError(err.message || 'Google sign-in failed.');
      }
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setError('✓ Password reset email sent. Check your inbox.');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError(err.message || 'Failed to send password reset email.');
      }
    }
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
      <div className="bg-white dark:bg-slate-800 w-full max-w-100 rounded-[2.5rem] p-10 chic-shadow border border-slate-100 dark:border-slate-700 relative animate-slideUp overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex flex-col items-center gap-4 mb-8 w-full">
          <div className="relative w-14 h-14 drop-shadow-xl">
            <GemdiLogo className="w-full h-full" gradientId="gemGradientModal" />
          </div>
          <div className="text-center">
            <h2 className="text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight">
              {step === 'MODE_SELECT' ? 'Welcome to Gemdi' : step === 'EMAIL' ? (mode === 'login' ? 'Log In' : 'Create Account') : step === 'PASSWORD_ENTRY' ? 'Welcome Back!' : 'Set Your Password'}
            </h2>
            <p className="text-slate-400 dark:text-slate-500 font-bold mt-1 text-[10px] uppercase tracking-[3px]">
              {step === 'MODE_SELECT' ? 'Choose an option to get started' : step === 'EMAIL' ? (mode === 'login' ? 'Enter your login credentials' : 'Sign up for a new account') : step === 'PASSWORD_ENTRY' ? 'Enter your password' : 'Create a secure password'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {step === 'MODE_SELECT' && (
            <>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMode('login');
                    setStep('EMAIL');
                    setError('');
                  }}
                  className="w-full h-13 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold rounded-2xl tracking-[3px] text-[13px] uppercase hover:bg-blue-600 dark:hover:bg-blue-400 transition-all"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMode('signup');
                    setStep('EMAIL');
                    setError('');
                  }}
                  className="w-full h-13 bg-blue-500 text-white font-extrabold rounded-2xl tracking-[3px] text-[13px] uppercase hover:bg-blue-600 transition-all"
                >
                  Sign Up
                </button>
              </div>

              <div className="flex items-center gap-3 h-5">
                <div className="grow border-t border-slate-100 dark:border-slate-700"></div>
                <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-[3px] shrink-0">Or Continue With</span>
                <div className="grow border-t border-slate-100 dark:border-slate-700"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full h-13 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-600 font-extrabold rounded-2xl tracking-[3px] text-[13px] uppercase hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
            </>
          )}

          {step === 'EMAIL' && (
            <>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmailNext()}
                className="w-full h-13 px-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                autoFocus
              />

              <button onClick={handleEmailNext} className="w-full h-13 bg-blue-500 text-white font-extrabold rounded-2xl tracking-[3px] text-[13px] uppercase hover:bg-blue-600 transition-all">
                Continue with Email
              </button>

              <div className="flex items-center gap-3 h-5">
                <div className="grow border-t border-slate-100 dark:border-slate-700"></div>
                <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-[3px] shrink-0">Or</span>
                <div className="grow border-t border-slate-100 dark:border-slate-700"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full h-13 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-600 font-extrabold rounded-2xl tracking-[3px] text-[13px] uppercase hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button 
                onClick={() => setStep('MODE_SELECT')}
                className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-500"
              >
                Back to Options
              </button>
            </>
          )}

          {step === 'PASSWORD_ENTRY' && (
            <>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center gap-3 border border-blue-100 dark:border-blue-800/50">
                <div className="w-8 h-8 rounded-full bg-blue-500 shrink-0 flex items-center justify-center text-white font-extrabold text-xs">
                  {email ? email[0].toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-[3px]">Signed in as</p>
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
                className="w-full h-13 px-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
              />

              <button onClick={handlePasswordLogin} className="w-full h-13 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold rounded-2xl tracking-[3px] text-[13px] uppercase hover:bg-blue-600 transition-all">
                Access Vault
              </button>

              <div className="flex items-center gap-3 h-5">
                <div className="grow border-t border-slate-100 dark:border-slate-700"></div>
                <span className="text-[8px] font-extrabold text-slate-300 uppercase tracking-[3px] shrink-0">Or</span>
                <div className="grow border-t border-slate-100 dark:border-slate-700"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full h-13 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-600 font-extrabold rounded-2xl tracking-[3px] text-[13px] uppercase hover:bg-slate-50 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {providers.length > 0 && !providers.includes('password') && (
                <p className="text-[11px] text-slate-500 mt-2">
                  This account doesn't use a password. <button onClick={handleGoogleSignIn} className="underline">Sign in with Google</button>.
                </p>
              )}

              {providers.includes('password') && (
                <button onClick={handlePasswordReset} className="w-full text-[10px] font-extrabold text-slate-400 uppercase tracking-[3px] hover:text-blue-500">Forgot Password?</button>
              )}

              {providers.includes('google.com') && (
                <button onClick={handleGoogleSignIn} className="w-full h-13 bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-600 font-extrabold rounded-2xl tracking-[3px] text-[13px] uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-3">Sign in with Google</button>
              )}

              <button onClick={() => setStep('MODE_SELECT')} className="w-full text-[10px] font-extrabold text-slate-400 uppercase tracking-[3px] hover:text-blue-500">
                {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </button>
            </>
          )}

          {step === 'SIGNUP' && (
            <>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Create Password"
                  autoFocus
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-13 px-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                />

                {/* Vault Security Criteria */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Security Requirements</p>
                  {[
                    { met: requirements.length, label: "Minimum 8 characters" },
                    { met: requirements.number, label: "Contains a number (0-9)" },
                    { met: requirements.special, label: "Special symbol (!@#$)" }
                  ].map((req, i) => (
                    <div key={i} className={`flex items-center gap-2 transition-all ${req.met ? 'text-blue-500' : 'text-slate-300 dark:text-slate-600'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${req.met ? 'bg-blue-500 border-blue-500' : 'border-slate-200 dark:border-slate-700'}`}>
                        {req.met && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wide">{req.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-1 h-1 px-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`flex-1 rounded-full transition-colors ${getPasswordStrength() >= i ? 'bg-blue-500' : 'bg-slate-100 dark:bg-slate-700'}`}></div>
                  ))}
                </div>

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSignup()}
                  className="w-full h-13 px-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                />
              </div>

              <button onClick={handleSignup} className="w-full h-13 bg-blue-500 text-white font-extrabold rounded-2xl tracking-[3px] text-[13px] uppercase hover:bg-blue-600 transition-all">
                Create Account
              </button>

              <button onClick={() => setStep('MODE_SELECT')} className="w-full text-[10px] font-extrabold text-slate-400 uppercase tracking-[3px] hover:text-blue-500">
                Already have an account? Log In
              </button>
            </>
          )}

          {error && (
            <div className={`p-3 rounded-xl text-center ${error.startsWith('✓') ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;