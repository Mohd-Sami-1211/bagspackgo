'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, ArrowRight, CheckCircle, Loader2, Eye, EyeOff, X, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/* ─────────────────────────────────────────────────────
   Small helper: OTP input (4 boxes)
───────────────────────────────────────────────────── */
function OTPInput({ value, onChange, disabled }) {
    const digits = (value + '    ').slice(0, 4).split('');
    const inputRef = [useState(null), useState(null), useState(null), useState(null)].map(r => r[0]);

    const handleKey = (idx, e) => {
        if (e.key === 'Backspace') {
            const next = value.slice(0, idx ? idx - 1 : 0) + ' '.repeat(4 - Math.max(0, idx - 1) - 1);
            onChange(value.slice(0, idx > 0 ? idx - 1 : 0));
            if (idx > 0 && inputRef[idx - 1]) inputRef[idx - 1].focus();
            return;
        }
        if (e.key >= '0' && e.key <= '9') {
            const newVal = (value + e.key).slice(0, 4);
            onChange(newVal);
            if (idx < 3 && inputRef[idx + 1]) inputRef[idx + 1].focus();
        }
    };

    return (
        <div className="flex gap-3 justify-center">
            {[0, 1, 2, 3].map(idx => (
                <input
                    key={idx}
                    ref={el => { inputRef[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[idx] || ''}
                    onKeyDown={e => handleKey(idx, e)}
                    disabled={disabled}
                    onChange={() => { }} // controlled via onKeyDown
                    className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all
                        text-gray-900 border-gray-200 focus:border-green-500 focus:bg-green-50
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ caretColor: 'transparent' }}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────
   Main UserAuthGate
───────────────────────────────────────────────────── */
export default function UserAuthGate({ onAuthenticated }) {
    const { onLogin } = useAuth();

    // 'login' or 'signup'
    const [mode, setMode] = useState('login');

    // LOGIN states
    const [loginId, setLoginId] = useState('');       // phone/email
    const [loginOTP, setLoginOTP] = useState('');
    const [loginStep, setLoginStep] = useState('id'); // 'id' | 'otp'

    // SIGNUP states
    const [signupId, setSignupId] = useState('');     // phone used for OTP
    const [signupOTP, setSignupOTP] = useState('');
    const [signupStep, setSignupStep] = useState('id'); // 'id' | 'otp' | 'details'
    const [signupName, setSignupName] = useState('');
    const [signupDOB, setSignupDOB] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendCountdown, setResendCountdown] = useState(0);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (resendCountdown <= 0) return;
        const t = setTimeout(() => setResendCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [resendCountdown]);

    const clearMessages = () => { setError(''); setSuccess(''); };

    /* ── SEND OTP ── */
    const sendOTP = async (identifier, purpose) => {
        setLoading(true);
        clearMessages();
        try {
            const res = await fetch('/api/auth/user-send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, purpose }),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.message);
                if (data.notRegistered && purpose === 'login') {
                    // Suggest signup
                    setError(data.message + ' Click "Sign Up" below.');
                }
                return false;
            }
            setSuccess(`OTP sent! Check your ${identifier.includes('@') ? 'email' : 'phone'}.`);
            setResendCountdown(60);
            return true;
        } catch {
            setError('Network error. Please try again.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    /* ── VERIFY OTP + LOGIN/SIGNUP ── */
    const verifyOTP = async ({ identifier, otp, purpose, name, dob }) => {
        setLoading(true);
        clearMessages();
        try {
            const res = await fetch('/api/auth/user-otp-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, otp, purpose, name, dob }),
            });
            const data = await res.json();
            if (!data.success) {
                setError(data.message);
                return false;
            }
            // Update auth context
            onLogin(data.user);
            setSuccess(data.message);
            setTimeout(() => onAuthenticated?.(data.user), 700);
            return true;
        } catch {
            setError('Network error. Please try again.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    /* ── LOGIN FLOW ── */
    const handleLoginSendOTP = async () => {
        if (!loginId.trim()) return setError('Enter your mobile number or email');
        const ok = await sendOTP(loginId.trim(), 'login');
        if (ok) setLoginStep('otp');
    };

    const handleLoginVerify = async () => {
        if (loginOTP.length < 4) return setError('Enter the 4-digit OTP');
        await verifyOTP({ identifier: loginId.trim(), otp: loginOTP, purpose: 'login' });
    };

    /* ── SIGNUP FLOW ── */
    const handleSignupSendOTP = async () => {
        if (!signupId.trim()) return setError('Enter your mobile number or email');
        const ok = await sendOTP(signupId.trim(), 'signup');
        if (ok) setSignupStep('otp');
    };

    const handleSignupVerifyOTP = async () => {
        if (signupOTP.length < 4) return setError('Enter the 4-digit OTP');
        setLoading(true);
        clearMessages();
        // Just validate OTP exists (backend will also validate on final submit)
        // For UX: move to details step
        try {
            // We'll do a lightweight check by trying a dummy verify — actually just move forward
            // Real verification happens at /api/auth/user-otp-login
            setLoading(false);
            setSignupStep('details');
            clearMessages();
        } catch {
            setError('Something went wrong. Try again.');
            setLoading(false);
        }
    };

    const handleSignupComplete = async () => {
        if (!signupName.trim() || signupName.trim().length < 2) return setError('Enter your full name (min 2 chars)');
        await verifyOTP({
            identifier: signupId.trim(),
            otp: signupOTP,
            purpose: 'signup',
            name: signupName.trim(),
            dob: signupDOB || undefined,
        });
    };

    const switchMode = (m) => {
        setMode(m);
        clearMessages();
        setLoginStep('id'); setLoginOTP('');
        setSignupStep('id'); setSignupOTP(''); setSignupName(''); setSignupDOB('');
    };

    /* ── RENDER ── */
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>

            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="bg-slate-900 p-8 text-center relative">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-3xl">🎒</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {mode === 'login' ? 'Welcome Back!' : 'Join bagspackgo'}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {mode === 'login' ? 'Sign in to continue booking' : 'Create your free account'}
                    </p>
                </div>

                <div className="p-8">
                    {/* Mode tabs */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                        {['login', 'signup'].map(m => (
                            <button key={m} onClick={() => switchMode(m)}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === m
                                    ? 'bg-white text-green-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'}`}>
                                {m === 'login' ? 'Sign In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {/* ── LOGIN ── */}
                        {mode === 'login' && (
                            <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                                {loginStep === 'id' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Mobile Number or Email
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="9876543210 or you@email.com"
                                                value={loginId}
                                                onChange={e => { setLoginId(e.target.value); clearMessages(); }}
                                                onKeyDown={e => e.key === 'Enter' && handleLoginSendOTP()}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-900"
                                            />
                                        </div>
                                        <button onClick={handleLoginSendOTP} disabled={loading}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                                        </button>
                                    </div>
                                )}
                                {loginStep === 'otp' && (
                                    <div className="space-y-5">
                                        <button onClick={() => { setLoginStep('id'); clearMessages(); }}
                                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition">
                                            <ChevronLeft className="w-4 h-4" /> Back
                                        </button>
                                        <p className="text-sm text-gray-600 text-center">
                                            Enter the OTP sent to <strong>{loginId}</strong>
                                        </p>
                                        <OTPInput value={loginOTP} onChange={setLoginOTP} disabled={loading} />
                                        <button onClick={handleLoginVerify} disabled={loading || loginOTP.length < 4}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify & Sign In <CheckCircle className="w-4 h-4" /></>}
                                        </button>
                                        <p className="text-center text-sm text-gray-500">
                                            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` :
                                                <button onClick={() => sendOTP(loginId.trim(), 'login')} className="text-green-600 font-medium hover:underline">Resend OTP</button>}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ── SIGNUP ── */}
                        {mode === 'signup' && (
                            <motion.div key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                {signupStep === 'id' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                Mobile Number or Email
                                            </label>
                                            <input type="text" placeholder="9876543210 or you@email.com"
                                                value={signupId}
                                                onChange={e => { setSignupId(e.target.value); clearMessages(); }}
                                                onKeyDown={e => e.key === 'Enter' && handleSignupSendOTP()}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-900" />
                                        </div>
                                        <button onClick={handleSignupSendOTP} disabled={loading}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                                        </button>
                                    </div>
                                )}
                                {signupStep === 'otp' && (
                                    <div className="space-y-5">
                                        <button onClick={() => { setSignupStep('id'); clearMessages(); }}
                                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition">
                                            <ChevronLeft className="w-4 h-4" /> Back
                                        </button>
                                        <p className="text-sm text-gray-600 text-center">Enter OTP sent to <strong>{signupId}</strong></p>
                                        <OTPInput value={signupOTP} onChange={setSignupOTP} disabled={loading} />
                                        <button onClick={handleSignupVerifyOTP} disabled={loading || signupOTP.length < 4}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify OTP <ArrowRight className="w-4 h-4" /></>}
                                        </button>
                                        <p className="text-center text-sm text-gray-500">
                                            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` :
                                                <button onClick={() => sendOTP(signupId.trim(), 'signup')} className="text-green-600 font-medium hover:underline">Resend OTP</button>}
                                        </p>
                                    </div>
                                )}
                                {signupStep === 'details' && (
                                    <div className="space-y-4">
                                        <button onClick={() => { setSignupStep('otp'); clearMessages(); }}
                                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition">
                                            <ChevronLeft className="w-4 h-4" /> Back
                                        </button>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Full Name *</label>
                                            <input type="text" placeholder="Your full name"
                                                value={signupName}
                                                onChange={e => { setSignupName(e.target.value); clearMessages(); }}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date of Birth (optional)</label>
                                            <input type="date" value={signupDOB}
                                                onChange={e => setSignupDOB(e.target.value)}
                                                max={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-gray-900" />
                                        </div>
                                        <button onClick={handleSignupComplete} disabled={loading || !signupName.trim()}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60">
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <CheckCircle className="w-4 h-4" /></>}
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Error / Success */}
                    <AnimatePresence>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 text-center flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" /> {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p className="mt-5 text-center text-xs text-gray-400">
                        By continuing you agree to our Terms & Privacy Policy
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
