import React, { useState, useEffect } from 'react';
import { signInAnonymously, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, Mail, Lock, Phone, Smartphone, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playHaptic } from '../lib/haptics';

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<'main' | 'email_login' | 'email_signup' | 'phone'>('main');
  
  // Email/Password states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // for signup
  
  // Phone auth states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // Initialize RecaptchaVerifier for phone auth
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  const triggerError = (msg: string) => {
    playHaptic();
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  const handleUserSync = async (user: any, name?: string) => {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        fullName: name || user.displayName || 'Vexox User',
        username: (name || user.displayName || 'user').toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000),
        bio: 'Welcome to my Vexox profile!',
        followersCount: 0,
        followingCount: 0,
        streaks: 0,
        profilePictureUrl: user.photoURL || null,
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      playHaptic();
      setLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleUserSync(result.user);
      onSuccess();
    } catch (err: any) {
      triggerError(err.message || 'Failed to login with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) return triggerError('Please fill all fields');
    try {
      playHaptic();
      setLoading(true);
      setError('');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await handleUserSync(result.user, fullName);
      onSuccess();
    } catch (err: any) {
      triggerError(err.message || 'Failed to signup.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return triggerError('Please fill all fields');
    try {
      playHaptic();
      setLoading(true);
      setError('');
      await signInWithEmailAndPassword(auth, email, password);
      // user sync can be skipped on login, but ensuring profile exists:
      await handleUserSync(auth.currentUser);
      onSuccess();
    } catch (err: any) {
      triggerError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return triggerError('Enter a valid phone number with country code');
    try {
      playHaptic();
      setLoading(true);
      setError('');
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier as any);
      setConfirmationResult(result);
    } catch (err: any) {
      triggerError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return triggerError('Enter OTP');
    try {
      playHaptic();
      setLoading(true);
      setError('');
      const result = await confirmationResult.confirm(otp);
      await handleUserSync(result.user);
      onSuccess();
    } catch (err: any) {
      triggerError('Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] w-full p-6 text-center relative overflow-hidden bg-black">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-900/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amethyst-900/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      {/* Error Toast */}
      <AnimatePresence>
         {error && (
            <motion.div 
               initial={{ opacity: 0, y: -50 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="absolute top-10 w-full max-w-sm px-4 z-50"
            >
               <div className="bg-red-500/10 backdrop-blur-[25px] border border-red-500/30 text-red-200 text-sm font-semibold px-4 py-3 rounded-2xl shadow-[0_4px_30px_rgba(239,68,68,0.3)]">
                 {error}
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div id="recaptcha-container"></div>

      <div className="z-10 w-full max-w-xs flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-gradient-to-br from-amethyst-600 to-fuchsia-600 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-[0_0_40px_rgba(168,85,247,0.6)] mb-6 border border-white/20"
        >
          V
        </motion.div>
        
        <h1 className="text-3xl font-display font-bold text-white mb-2 drop-shadow-md">Vexox</h1>
        <p className="text-amethyst-200/80 text-sm font-medium mb-10">
          Enter the Immersive Network.
        </p>

        <AnimatePresence mode="wait">
          {authMode === 'main' && (
            <motion.div key="main" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col w-full gap-3">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white text-charcoal font-bold py-3.5 px-6 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Continue with Google
                  </>
                )}
              </button>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => { playHaptic(); setAuthMode('email_login'); }}
                  disabled={loading}
                  className="flex-1 bg-white/5 backdrop-blur-md text-white font-semibold py-3.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button
                  onClick={() => { playHaptic(); setAuthMode('phone'); }}
                  disabled={loading}
                  className="flex-1 bg-white/5 backdrop-blur-md text-white font-semibold py-3.5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" /> Phone
                </button>
              </div>
            </motion.div>
          )}

          {authMode === 'email_login' && (
             <motion.form key="email_login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col w-full gap-3" onSubmit={handleEmailLogin}>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-amethyst-500/50 focus:bg-white/10 transition-all font-medium text-sm" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-amethyst-500/50 focus:bg-white/10 transition-all font-medium text-sm" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-amethyst-600 hover:bg-amethyst-500 text-white font-bold py-3.5 rounded-2xl shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all active:scale-95 flex justify-center items-center mt-2">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
                </button>
                <div className="flex justify-between items-center mt-4">
                  <button type="button" onClick={() => setAuthMode('main')} className="text-white/50 text-xs font-semibold hover:text-white transition-colors">Back</button>
                  <button type="button" onClick={() => setAuthMode('email_signup')} className="text-amethyst-400 text-xs font-bold hover:text-amethyst-300 transition-colors">Create Account</button>
                </div>
             </motion.form>
          )}

          {authMode === 'email_signup' && (
             <motion.form key="email_signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col w-full gap-3" onSubmit={handleEmailSignup}>
                <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-white/30 focus:outline-none focus:border-amethyst-500/50 focus:bg-white/10 transition-all font-medium text-sm" />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-white/30 focus:outline-none focus:border-amethyst-500/50 focus:bg-white/10 transition-all font-medium text-sm" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-white placeholder-white/30 focus:outline-none focus:border-amethyst-500/50 focus:bg-white/10 transition-all font-medium text-sm" />
                <button type="submit" disabled={loading} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-3.5 rounded-2xl shadow-[0_0_15px_rgba(217,70,239,0.3)] transition-all active:scale-95 flex justify-center items-center mt-2">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
                </button>
                <div className="flex justify-between items-center mt-4">
                  <button type="button" onClick={() => setAuthMode('email_login')} className="text-white/50 text-xs font-semibold hover:text-white transition-colors">Existing User?</button>
                  <button type="button" onClick={() => setAuthMode('main')} className="text-white/50 text-xs font-semibold hover:text-white transition-colors">Cancel</button>
                </div>
             </motion.form>
          )}

          {authMode === 'phone' && (
             <motion.form key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col w-full gap-3" onSubmit={confirmationResult ? handleVerifyOtp : handleSendOtp}>
                {!confirmationResult ? (
                  <>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input type="tel" placeholder="+1 234 567 8900" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-amethyst-500/50 focus:bg-white/10 transition-all font-medium text-sm" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl shadow-[0_0_15px_rgba(5,150,105,0.3)] transition-all active:scale-95 flex justify-center items-center mt-2 border border-emerald-500/50">
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Code'}
                    </button>
                  </>
                ) : (
                  <>
                    <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-center tracking-[0.5em] text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all font-bold text-lg" maxLength={6} />
                    <button type="submit" disabled={loading} className="w-full bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl shadow-[0_0_15px_rgba(5,150,105,0.3)] transition-all active:scale-95 flex justify-center items-center mt-2 border border-emerald-500/50">
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                    </button>
                  </>
                )}
                
                <div className="flex justify-start items-center mt-4">
                  <button type="button" onClick={() => { setAuthMode('main'); setConfirmationResult(null); }} className="text-white/50 text-xs font-semibold hover:text-white transition-colors">Back</button>
                </div>
             </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

