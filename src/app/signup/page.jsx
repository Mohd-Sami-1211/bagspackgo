'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CheckCircle, ArrowRight, User as UserIcon, Mail, Phone, Lock, Calendar, Loader2
} from 'lucide-react';

const COMMON_PASSWORDS = [
  'password', '12345678', 'qwerty', 'admin', 'welcome', 'love', 'secret'
];

function validatePasswordClient(password) {
  if (!password) return { isValid: false, errors: [], strength: 0 };
  const errors = [];
  let strength = 0;
  if (password.length < 8) errors.push('Min 8 chars');
  else { strength++; if (password.length >= 12) strength++; }
  if (!/[A-Z]/.test(password)) errors.push('Uppercase'); else strength++;
  if (!/[a-z]/.test(password)) errors.push('Lowercase'); else strength++;
  if (!/\d/.test(password)) errors.push('Digit'); else strength++;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Special char'); else strength++;

  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Too common');
    strength = 0;
  }

  return { isValid: errors.length === 0, errors, strength };
}

export default function SignUpPage() {
  const router = useRouter();

  // State
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('user');
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [userData, setUserData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', dob: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordCheck, setPasswordCheck] = useState({ isValid: false, errors: [], strength: 0 });

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  // Helper Functions
  const validateIdentifier = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    if (emailRegex.test(input)) { setIdentifierType('email'); return true; }
    if (phoneRegex.test(input)) { setIdentifierType('phone'); return true; }
    return false;
  };

  const sendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, role }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setStep(2);
        setTimer(60);
      } else {
        setError(data.message);
      }
    } catch (err) { setError('Network error'); }
    finally { setLoading(false); }
  };

  const verifyOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp: otp.join('') }),
      });
      const data = await res.json();
      if (data.success) {
        setIsVerified(true);
        setStep(3);
        // Pre-fill verified data
        if (identifierType === 'email') setUserData(prev => ({ ...prev, email: identifier }));
        else setUserData(prev => ({ ...prev, phone: identifier }));
      } else {
        setError(data.message);
      }
    } catch (err) { setError('Verification failed'); }
    finally { setLoading(false); }
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordCheck.isValid) {
      setError('Password is too weak. Must contain uppercase, lowercase, number, special char.');
      return;
    }
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier, identifierType, role,
          name: userData.name,
          email: identifierType === 'phone' ? userData.email : identifier,
          phone: identifierType === 'email' ? userData.phone : identifier,
          dob: userData.dob,
          password: userData.password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(4); // Success screen
      } else {
        setError(data.message);
      }
    } catch (err) { setError('Registration failed'); }
    finally { setLoading(false); }
  };

  // Timer Effect
  useEffect(() => {
    let interval;
    if (timer > 0) interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Password Check Effect
  useEffect(() => {
    setPasswordCheck(validatePasswordClient(userData.password));
  }, [userData.password]);


  return (
    <div className="min-h-[100dvh] w-full flex bg-white font-sans text-gray-900 overflow-x-hidden">

      {/* 🎨 LEFT: Immersive Background */}
      <div className="fixed inset-0 md:relative md:w-1/2 lg:w-[55%] xl:w-[60%] flex-shrink-0 bg-black z-0">
        <Image src="/images/signin.jpg" alt="Adventure" fill className="object-cover opacity-60 md:opacity-100" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent md:bg-black/40 md:via-transparent" />

        <div className="hidden md:block absolute bottom-0 left-0 p-8 md:p-12 lg:p-16 text-white max-w-2xl z-10 w-full mb-0">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-none mb-6 tracking-tight">
              {step === 4 ? 'Adventure Awaits.' : 'Start Your Journey.'}
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light max-w-md leading-relaxed hidden sm:block">
              create account, verify identity, and explore the world with us.
            </p>
            {/* Progress Steps (Desktop) */}
            <div className="mt-12 hidden md:flex gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-emerald-500' : 'bg-white/20'}`} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 📝 RIGHT: Form Panel */}
      <div className="relative w-full md:w-1/2 lg:w-[45%] xl:w-[40%] flex items-center justify-center p-4 sm:p-8 z-10">
        <AnimatePresence mode="wait">

          {/* STEP 1 & 2 & 3 Wrappers */}
          {step < 4 && (
            <motion.div
              key="form-container"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-[480px] bg-white/95 backdrop-blur-xl md:bg-white rounded-3xl md:rounded-none shadow-2xl md:shadow-none p-6 sm:p-10 border border-white/20 md:border-none relative"
            >
              {/* Header */}
              <div className="mb-8">
                <Link href="/" className="inline-block mb-6">
                  <Image src="/images/logo.svg" alt="BagspackGo" width={140} height={40} className="object-contain" />
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-gray-900">Sign Up</h2>
                  <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Step {step} of 3</span>
                </div>
              </div>

              {/* Role Toggle (Only at Step 1) */}
              {step === 1 && (
                <div className="p-1 bg-gray-100/80 rounded-xl flex mb-8 relative">
                  <motion.div
                    className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm border border-black/5 z-0"
                    initial={false}
                    animate={{ left: role === 'user' ? '4px' : '50%', width: 'calc(50% - 4px)' }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                  {['user', 'provider'].map((r) => (
                    <button key={r} onClick={() => { setRole(r); setError(''); }} className={`flex-1 relative z-10 py-2.5 text-sm font-medium transition-colors ${role === r ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                      {r === 'user' ? 'Traveler' : 'Service Provider'}
                    </button>
                  ))}
                </div>
              )}

              {/* 🛑 Error Toast */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 🌟 STEP 1: Identifier Input */}
              {step === 1 && (
                <motion.form variants={containerVariants} initial="hidden" animate="visible" exit="exit" onSubmit={(e) => { e.preventDefault(); if (validateIdentifier(identifier)) sendOTP(); else setError('Invalid email/phone'); }}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email or Mobile Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-lg placeholder-gray-400 outline-none"
                          placeholder="e.g. name@email.com"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="animate-spin" /> : <>Continue <ArrowRight size={20} /></>}
                    </button>
                    <p className="text-center text-sm text-gray-500 mt-4">Already have an account? <Link href="/signin" className="text-emerald-600 font-bold hover:underline">Log in</Link></p>
                  </div>
                </motion.form>
              )}

              {/* 🌟 STEP 2: OTP Verification */}
              {step === 2 && (
                <motion.form variants={containerVariants} initial="hidden" animate="visible" exit="exit" onSubmit={(e) => { e.preventDefault(); verifyOTP(); }}>
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <p className="text-gray-500 text-lg">Enter the 4-digit code sent to</p>
                      <p className="text-emerald-600 font-bold text-xl mt-1">{identifier}</p>
                      <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-400 underline mt-2 hover:text-gray-600">Change?</button>
                    </div>

                    <div className="flex gap-3 justify-center">
                      {otp.map((digit, i) => (
                        <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                          className="w-14 h-16 text-center text-3xl font-bold bg-white border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                          onChange={(e) => {
                            const val = e.target.value;
                            if (isNaN(val)) return;
                            const newOtp = [...otp]; newOtp[i] = val; setOtp(newOtp);
                            if (val && i < 3) document.getElementById(`otp-${i + 1}`).focus();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !otp[i] && i > 0) {
                              document.getElementById(`otp-${i - 1}`).focus();
                            }
                          }}
                        />
                      ))}
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                      {loading ? <Loader2 className="animate-spin" /> : 'Verify Code'}
                    </button>

                    <div className="text-center">
                      {timer > 0 ? <p className="text-sm text-gray-400 font-medium">Resend in 00:{timer < 10 ? `0${timer}` : timer}</p> : <button type="button" onClick={sendOTP} className="text-sm text-emerald-600 font-bold hover:underline">Resend Code</button>}
                    </div>
                  </div>
                </motion.form>
              )}

              {/* 🌟 STEP 3: Details & Password */}
              {step === 3 && (
                <motion.form variants={containerVariants} initial="hidden" animate="visible" exit="exit" onSubmit={registerUser} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                      <div className="relative group">
                        <input type="text" required value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder="John Doe" />
                        <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" />
                      </div>
                    </div>
                    {/* DOB */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Date of Birth</label>
                      <div className="relative group">
                        <input type="date" required value={userData.dob} onChange={e => setUserData({ ...userData, dob: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all text-gray-600" />
                        <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" />
                      </div>
                    </div>
                    {/* Alternate Contact (Email if Phone used, Phone if Email used) */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">{identifierType === 'email' ? 'Mobile Number' : 'Email Address'}</label>
                      <div className="relative group">
                        <input
                          type={identifierType === 'email' ? 'text' : 'email'}
                          required
                          value={identifierType === 'email' ? userData.phone : userData.email}
                          onChange={e => identifierType === 'email' ? setUserData({ ...userData, phone: e.target.value }) : setUserData({ ...userData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                          placeholder={identifierType === 'email' ? '10-digit mobile' : 'name@example.com'}
                        />
                        {identifierType === 'email' ? <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" /> : <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" />}
                      </div>
                    </div>
                    {/* Confirm Password Added */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Set Password</label>
                      <div className="relative group">
                        <input type="password" required value={userData.password} onChange={e => setUserData({ ...userData, password: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder="••••••••" />
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" />
                      </div>
                      {/* Password Strength Meter */}
                      <div className="flex gap-1 mt-2 h-1 overflow-hidden rounded-full">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className={`flex-1 h-full transition-colors ${i <= passwordCheck.strength ? (passwordCheck.strength < 3 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-gray-200'}`} />)}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Must contain 8+ chars, uppercase, lowercase, digit, special char.</p>
                    </div>
                    {/* Confirm Password Field */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Confirm Password</label>
                      <div className="relative group">
                        <input type="password" required value={userData.confirmPassword} onChange={e => setUserData({ ...userData, confirmPassword: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder="••••••••" />
                        <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading || !passwordCheck.isValid} className="w-full py-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <Loader2 className="animate-spin" /> : 'Complete Registration'}
                  </button>
                </motion.form>
              )}

            </motion.div>
          )}

          {/* 🌟 STEP 4: SUCCESS */}
          {step === 4 && (
            <motion.div
              key="success-container"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center border border-white/40 backdrop-blur-xl"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Aboard!</h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Your account has been successfully created. You are now ready to start your journey.</p>

              <button
                onClick={() => router.push(`/signin?role=${role === 'user' ? 'user' : 'provider'}`)}
                className="w-full py-4 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

// Simple icon component for success screen
function CheckCircle2({ className }) {
  return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
}