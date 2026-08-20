'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
    X, Mail, Key, User, Phone, LogIn, UserPlus, Shield, ChevronRight, Loader2, RefreshCw
} from 'lucide-react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';

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

function AuthModalContent() {
    const { isAuthModalOpen, closeAuthModal, onLogin, authModalOptions } = useAuth();
    const isClosable = authModalOptions?.closable !== false;
    const hideTabs = authModalOptions?.hideTabs === true;
    
    // Global Tab: 'user' | 'provider'
    const [tab, setTab] = useState('user');
    const [loading, setLoading] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState('');
    const contentRef = useRef(null);

    useEffect(() => {
        if (error && contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [error]);

    // === USER STATE ===
    const [userStep, setUserStep] = useState('EMAIL'); // EMAIL, OTP, DETAILS
    const [userEmail, setUserEmail] = useState('');
    const [userOtp, setUserOtp] = useState(['', '', '', '']);
    const [userDetails, setUserDetails] = useState({ name: '', phone: '' });

    // === PROVIDER STATE ===
    const [providerMode, setProviderMode] = useState('signin'); // signin, signup, forgot
    const [providerStep, setProviderStep] = useState('FORM'); // FORM, OTP
    const [providerData, setProviderData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [providerOtp, setProviderOtp] = useState(['', '', '', '']);
    const [passwordCheck, setPasswordCheck] = useState({ isValid: false, errors: [], strength: 0 });

    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let t;
        if (resendTimer > 0) t = setTimeout(() => setResendTimer(r => r - 1), 1000);
        return () => clearTimeout(t);
    }, [resendTimer]);

    useEffect(() => {
        setPasswordCheck(validatePasswordClient(providerData.password));
    }, [providerData.password]);

    // Reset or Restore state when opening modal
    useEffect(() => {
        if (!isAuthModalOpen) return;
        
        setError('');
        setLoading(false);
        setUserOtp(['', '', '', '']);
        setUserDetails({ name: '', phone: '' });
        setProviderOtp(['', '', '', '']);

        // Quick persistent state restore (lasts 5 mins)
        const savedRaw = localStorage.getItem('bgp_auth_state');
        if (savedRaw) {
            try {
                const saved = JSON.parse(savedRaw);
                const elapsedSecs = Math.floor((Date.now() - saved.timestamp) / 1000);
                
                if (elapsedSecs < 300) { // Under 5 minutes
                    setTab(saved.tab || 'user');
                    setResendTimer(Math.max(0, 60 - elapsedSecs));
                    
                    if (saved.tab === 'user' && saved.userStep === 'OTP') {
                        setUserStep('OTP');
                        setUserEmail(saved.userEmail || '');
                    } else if (saved.tab === 'provider' && saved.providerStep === 'OTP') {
                        setProviderMode(saved.providerMode || 'signin');
                        setProviderStep('OTP');
                        setProviderData(prev => ({ ...prev, email: saved.providerEmail || '' }));
                    } else {
                        throw new Error('Fallback cleanly');
                    }
                    return; // Recovered! Setup skips fallback
                } else {
                    localStorage.removeItem('bgp_auth_state');
                }
            } catch (e) {
                // Ignore parsing errors, let it fallback to default reset
            }
        }

        // Default Reset
        if (authModalOptions?.tab) setTab(authModalOptions.tab);
        else if (authModalOptions?.hideTabs) setTab('user');
        else if (tab !== 'user' && tab !== 'provider') setTab('user'); // sanity
        
        setUserStep('EMAIL');
        setUserEmail('');
        setProviderMode('signin');
        setProviderStep('FORM');
        setProviderData({ name: '', email: '', password: '', confirmPassword: '' });
        setResendTimer(0);

    }, [isAuthModalOpen, authModalOptions]); // Reset or focus tab based on options on open

    // Constantly persist steps
    useEffect(() => {
        if (userStep === 'OTP' || providerStep === 'OTP') {
            localStorage.setItem('bgp_auth_state', JSON.stringify({
                tab, userStep, userEmail, providerStep, providerMode, providerEmail: providerData.email, timestamp: Date.now()
            }));
        } else {
            localStorage.removeItem('bgp_auth_state');
        }
    }, [userStep, providerStep, tab, userEmail, providerMode, providerData.email]);


    // ------------------------------------------------------------------------
    // USER ACTIONS
    // ------------------------------------------------------------------------
    const handleUserSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!userEmail) { setError('Email required'); return; }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/user-send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: userEmail, purpose: 'auth' })
            });
            const data = await res.json();

            if (res.ok) {
                setUserStep('OTP');
                setResendTimer(60);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleUserVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        const code = userOtp.join('');
        if (code.length < 4) { setError('Enter 4-digit OTP'); return; }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/user-otp-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: userEmail, otp: code, purpose: 'auth', name: '' })
            });
            const data = await res.json();
            
            if (res.ok) {
                localStorage.removeItem('bgp_auth_state');
                onLogin(data.user);
                // Check if user lacks name/phone (ie. just signed up, or old account without details)
                if (!data.user.username || data.user.username === '' || !data.user.phone || data.user.phone.startsWith('00')) {
                    setUserStep('DETAILS'); // Proceed to collect details BEFORE closing
                } else {
                    closeAuthModal();
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUserDetailsSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/user-update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: userDetails.name, phone: userDetails.phone })
            });
            const data = await res.json();
            if (res.ok) {
                onLogin(data.user); // update context with new name
                closeAuthModal();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to update details');
        } finally {
            setLoading(false);
        }
    };

    // --- GOOGLE LOGIN ---
    const handleGoogleAuth = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setError('');
            setLoading(true);
            try {
                const res = await fetch('/api/auth/google-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ credential: tokenResponse.access_token })
                });
                const data = await res.json();
                
                if (res.ok) {
                    localStorage.removeItem('bgp_auth_state');
                    onLogin(data.user);
                    if (!data.user.username || data.user.username === '' || !data.user.phone || data.user.phone.startsWith('00')) {
                        setUserStep('DETAILS'); // Proceed to collect missing details
                    } else {
                        closeAuthModal();
                    }
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError('Google setup failed. Try another method.');
            } finally {
                setLoading(false);
            }
        },
        onError: () => setError('Google verification failed'),
    });

    // ------------------------------------------------------------------------
    // PROVIDER ACTIONS
    // ------------------------------------------------------------------------
    const handleProviderSignin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: providerData.email, password: providerData.password, role: 'provider' })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.removeItem('bgp_auth_state');
                onLogin(data.user);

                // If on the companion page, don't redirect — let the user stay and browse
                const isOnCompanionPage = window.location.pathname.includes('/companion');
                if (authModalOptions?.stayOnPage || isOnCompanionPage) {
                    closeAuthModal();
                    setLoading(false);
                    return;
                }

                setIsRedirecting(true);
                if (data.user.applicationStatus === 'approved') {
                    window.location.href = '/serviceprovider/dashboard'; // Force layout refresh for provider side
                } else {
                    window.location.href = '/serviceprovider';
                }
            } else {
                setError(data.message);
                setLoading(false);
            }
        } catch (err) {
             setError('Failed to connect');
             setLoading(false);
        }
    };

    const handleProviderSignupStart = async (e) => {
        e.preventDefault();
        setError('');
        if (!passwordCheck.isValid) { 
            setError('Password too weak. Needs: ' + passwordCheck.errors.join(', ')); 
            return; 
        }
        if (providerData.password !== providerData.confirmPassword) { setError('Passwords do not match'); return; }
        
        setLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: providerData.email, role: 'provider' })
            });
            const data = await res.json();
            if (res.ok) {
                setProviderStep('OTP');
                setResendTimer(60);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleProviderSignupVerify = async (e) => {
        e.preventDefault();
        setError('');
        const code = providerOtp.join('');
        if (code.length < 4) { setError('Enter OTP'); return; }

        setLoading(true);
        try {
            // Verify OTP
            const verifyRes = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: providerData.email, otp: code })
            });
            const verifyData = await verifyRes.json();
            
            if (!verifyRes.ok) {
                setError(verifyData.message);
                setLoading(false);
                return;
            }

            // Create provider account
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: providerData.email,
                    identifierType: 'email',
                    role: 'provider',
                    name: providerData.name,
                    email: providerData.email,
                    password: providerData.password
                })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.removeItem('bgp_auth_state');
                setProviderMode('signin');
                setProviderStep('FORM');
                setProviderData({ ...providerData, password: '', confirmPassword: '' }); // Clear password, let them log in
                setError('');
                // Note: user must login now or we just auto-login. For safety, redirect to signin mode.
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleProviderForgotStart = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/provider-forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: providerData.email })
            });
            const data = await res.json();
            if (res.ok) {
                setProviderStep('OTP');
                setResendTimer(60);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleProviderForgotReset = async (e) => {
        e.preventDefault();
        setError('');
        const code = providerOtp.join('');
        if (!passwordCheck.isValid) { setError('New password too weak'); return; }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/provider-reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: providerData.email, otp: code, newPassword: providerData.password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.removeItem('bgp_auth_state');
                setProviderMode('signin');
                setProviderStep('FORM');
                setProviderData({ ...providerData, password: '', confirmPassword: '' });
                setError('');
            } else {
                setError(data.message);
            }
        } catch (err) {
             setError('Failed to reset');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthModalOpen) return null;

    if (isRedirecting) {
        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#F2FFFC]"
            >
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-10 w-10 text-emerald-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <h2 className="text-xl font-bold text-emerald-800">Signing in...</h2>
                    <p className="text-sm text-emerald-600 font-medium animate-pulse">Please wait while we prepare your dashboard</p>
                </div>
            </motion.div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 sm:p-6"
                onClick={() => isClosable && closeAuthModal()}
            >
                <motion.div 
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    transition={{ type: "spring", bounce: 0.35, duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header with Close Button */}
                    <div className="flex items-center justify-end px-6 pt-6 pb-2 relative z-20">
                        {isClosable && (
                            <button 
                                onClick={closeAuthModal} 
                                className="p-2 -mr-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {/* Header Tabs */}
                    {!hideTabs && (
                        <div className="flex w-full mt-1 relative z-10 px-6 pb-2">
                            <div className="bg-gray-100 rounded-2xl w-full p-1 flex relative">
                                <motion.div 
                                    className="absolute bg-white shadow border border-gray-200 rounded-xl h-[calc(100%-8px)] top-1 w-[calc(50%-4px)] z-0"
                                    animate={{ left: tab === 'user' ? '4px' : 'calc(50%)' }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                />
                                <button 
                                    onClick={() => { setTab('user'); setError(''); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold z-10 transition-colors ${tab === 'user' ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <User size={16} /> Traveler
                                </button>
                                <button 
                                    onClick={() => { setTab('provider'); setError(''); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold z-10 transition-colors ${tab === 'provider' ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Shield size={16} /> Partner
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Content Area */}
                    <div ref={contentRef} className="px-6 sm:px-8 pt-4 pb-6 sm:pb-8 flex-1 overflow-y-auto w-full hide-scrollbar">
                        
                        {/* Error message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }} 
                                    className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2 mb-6"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mx-1 flex-shrink-0" /> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* =========================================
                                       USER TAB
                        ============================================= */}
                        {tab === 'user' && (
                            <AnimatePresence mode="wait">
                                {/* EMAIL STEP */}
                                {userStep === 'EMAIL' && (
                                    <motion.div key="user-email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold text-gray-900">Welcome</h2>
                                            <p className="text-sm text-gray-500 mt-1">Sign in to book adventures.</p>
                                        </div>

                                        <button onClick={() => handleGoogleAuth()} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-gray-700 transition">
                                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                                            Continue with Google
                                        </button>

                                        <div className="flex items-center gap-4 py-2">
                                            <div className="flex-1 h-px bg-gray-200"></div>
                                            <p className="text-xs font-semibold text-gray-400">OR</p>
                                            <div className="flex-1 h-px bg-gray-200"></div>
                                        </div>

                                        <form onSubmit={handleUserSendOtp} className="space-y-4">
                                            <div className="relative group">
                                                <input type="email" required autoComplete="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder="Enter your email" />
                                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500 transition-colors" />
                                            </div>
                                            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Continue with Email'}
                                            </button>
                                            <p className="text-[10px] text-center text-gray-400 mt-4 px-4 leading-relaxed">
                                                By continuing, you agree to bagspackgo&apos;s{' '}
                                                <Link href="/terms" target="_blank" className="text-emerald-600 font-semibold hover:underline">Terms of Service</Link>
                                                {' '}and{' '}
                                                <Link href="/privacy" target="_blank" className="text-emerald-600 font-semibold hover:underline">Privacy Policy</Link>.
                                            </p>
                                        </form>
                                    </motion.div>
                                )}

                                {/* OTP STEP */}
                                {userStep === 'OTP' && (
                                    <motion.div key="user-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                        <div className="text-center mb-6">
                                            <h2 className="text-2xl font-bold text-gray-900">Verify Email</h2>
                                            <p className="text-sm text-gray-500 mt-2">Code sent to <span className="font-semibold text-emerald-600">{userEmail}</span></p>
                                            <button onClick={() => setUserStep('EMAIL')} className="text-xs text-emerald-600 hover:underline mt-1 font-medium">Wrong email?</button>
                                        </div>
                                        <form onSubmit={handleUserVerifyOtp} className="space-y-6">
                                            <div className="flex gap-3 justify-center">
                                                {userOtp.map((digit, i) => (
                                                    <input key={`u-otp-${i}`} id={`u-otp-${i}`} type="text" maxLength={1} value={digit}
                                                        className="w-14 h-16 text-center text-3xl font-bold bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (isNaN(val)) return;
                                                            const newOtp = [...userOtp]; newOtp[i] = val; setUserOtp(newOtp);
                                                            if (val && i < 3) document.getElementById(`u-otp-${i + 1}`).focus();
                                                        }}
                                                        onKeyDown={(e) => { if (e.key === 'Backspace' && !userOtp[i] && i > 0) document.getElementById(`u-otp-${i - 1}`).focus(); }}
                                                    />
                                                ))}
                                            </div>
                                            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify OTP'}
                                            </button>
                                        </form>

                                        <p className="text-center text-sm text-gray-500 pt-4">
                                            {resendTimer > 0 ? (
                                                <>Resend OTP in <b>{resendTimer}s</b></>
                                            ) : (
                                                <button onClick={handleUserSendOtp} className="text-emerald-600 font-semibold hover:underline">
                                                    Resend OTP
                                                </button>
                                            )}
                                        </p>
                                    </motion.div>
                                )}

                                {/* DETAILS STEP - only after verify */}
                                {userStep === 'DETAILS' && (
                                    <motion.div key="user-details" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <User className="w-8 h-8 text-emerald-600" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900">Just one more step</h2>
                                            <p className="text-sm text-gray-500 mt-2">Finish setting up your account so we can assist you better with bookings.</p>
                                        </div>
                                        <form onSubmit={handleUserDetailsSubmit} className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                                                <div className="relative group">
                                                    <input type="text" required autoComplete="name" value={userDetails.name} onChange={e => setUserDetails({ ...userDetails, name: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder="Enter Name" />
                                                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mobile Number</label>
                                                <div className="relative group">
                                                    <input type="tel" required autoComplete="tel" value={userDetails.phone} onChange={e => setUserDetails({ ...userDetails, phone: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder="10-digit number" />
                                                    <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" />
                                                </div>
                                            </div>
                                            <button type="submit" disabled={loading} className="w-full py-3.5 mt-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Start Exploring'}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}


                        {/* =========================================
                                     PROVIDER TAB
                        ============================================= */}
                        {tab === 'provider' && (
                            <AnimatePresence mode="wait">
                                {/* MAIN FORM: Sign In | Sign Up | Forgot */}
                                {providerStep === 'FORM' && (
                                    <motion.div key="provider-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                                        <div className="text-center mb-8">
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {providerMode === 'signin' ? 'Partner Login' : providerMode === 'signup' ? 'Partner Signup' : 'Reset Password'}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {providerMode === 'signin' ? 'Manage your services and bookings' : providerMode === 'signup' ? 'Join us and grow your business' : 'Enter your email to receive recovery code'}
                                            </p>
                                        </div>

                                        <form onSubmit={
                                            providerMode === 'signin' ? handleProviderSignin : 
                                            providerMode === 'signup' ? handleProviderSignupStart : 
                                            handleProviderForgotStart
                                        } className="space-y-4">
                                            
                                            {/* Name field (Signup only) */}
                                            {providerMode === 'signup' && (
                                                <div className="relative group">
                                                    <input type="text" required autoComplete="name" value={providerData.name} onChange={e => setProviderData({ ...providerData, name: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder="Name" />
                                                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" />
                                                </div>
                                            )}

                                            {/* Email field (Always) */}
                                            <div className="relative group">
                                                <input type="email" required autoComplete="email" value={providerData.email} onChange={e => setProviderData({ ...providerData, email: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder="Email address" />
                                                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" />
                                            </div>

                                            {/* Password field (Signin / Signup) */}
                                            {providerMode !== 'forgot' && (
                                                <div className="space-y-1">
                                                    <div className="relative group">
                                                        <input type="password" required autoComplete={providerMode === 'signup' ? "new-password" : "current-password"} value={providerData.password} onChange={e => setProviderData({ ...providerData, password: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder={providerMode === 'signup' ? 'Set password' : 'Password'} />
                                                        <Key className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" />
                                                    </div>
                                                    
                                                    {/* Password Strength (Signup only) */}
                                                    {providerMode === 'signup' && providerData.password && (
                                                        <div className="flex gap-1 mt-2 mb-2 h-1 overflow-hidden rounded-full">
                                                            {[1, 2, 3, 4, 5].map(i => <div key={i} className={`flex-1 h-full transition-colors ${i <= passwordCheck.strength ? (passwordCheck.strength < 3 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-gray-200'}`} />)}
                                                        </div>
                                                    )}

                                                    {/* Confirm Password (Signup only) */}
                                                    {providerMode === 'signup' && (
                                                        <div className="relative group mt-2 space-y-1">
                                                            <input type="password" required autoComplete="new-password" value={providerData.confirmPassword} onChange={e => setProviderData({ ...providerData, confirmPassword: e.target.value })} className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${providerData.confirmPassword && providerData.password !== providerData.confirmPassword ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'}`} placeholder="Confirm password" />
                                                            <Key className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" />
                                                        </div>
                                                    )}

                                                    {/* Forgot Pwd link (Signin only) */}
                                                    {providerMode === 'signin' && (
                                                        <div className="flex justify-end pt-1">
                                                            <button type="button" onClick={() => setProviderMode('forgot')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">Forgot password?</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-2">
                                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                                    providerMode === 'signin' ? <><LogIn className="w-5 h-5" /> Sign In</> :
                                                    providerMode === 'signup' ? <><ChevronRight className="w-5 h-5" /> Continue</> :
                                                    <><RefreshCw className="w-5 h-5" /> Send Reset Link</>
                                                )}
                                            </button>
                                            {providerMode === 'signup' && (
                                                <p className="text-[10px] text-center text-gray-400 mt-4 px-4 leading-relaxed">
                                                    By signing up as a provider, you agree to bagspackgo&apos;s{' '}
                                                    <Link href="/provider-terms" target="_blank" className="text-emerald-600 font-semibold hover:underline">Provider Terms</Link>
                                                    {' '}and{' '}
                                                    <Link href="/provider-privacy" target="_blank" className="text-emerald-600 font-semibold hover:underline">Privacy Policy</Link>.
                                                </p>
                                            )}
                                        </form>

                                        {/* Toggle Signin / Signup / Cancel forgot */}
                                        <div className="text-center mt-6">
                                            {providerMode === 'forgot' ? (
                                                <button onClick={() => setProviderMode('signin')} className="text-sm text-gray-500 hover:text-emerald-600 font-medium">Back to login</button>
                                            ) : (
                                                <p className="text-sm text-gray-500">
                                                    {providerMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                                                    <button onClick={() => setProviderMode(providerMode === 'signin' ? 'signup' : 'signin')} className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
                                                        {providerMode === 'signin' ? 'Apply Now' : 'Log In'}
                                                    </button>
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* OTP STEP: For Signup Verification OR Forgot Reset */}
                                {providerStep === 'OTP' && (
                                    <motion.div key="provider-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                        <div className="text-center mb-6">
                                            <h2 className="text-2xl font-bold text-gray-900">{providerMode === 'signup' ? 'Verify Email' : 'Set New Password'}</h2>
                                            <p className="text-sm text-gray-500 mt-2">Code sent to <span className="font-semibold text-emerald-600">{providerData.email}</span></p>
                                            <button onClick={() => setProviderStep('FORM')} className="text-xs text-emerald-600 hover:underline mt-1 font-medium">Wrong email?</button>
                                        </div>

                                        <form onSubmit={providerMode === 'signup' ? handleProviderSignupVerify : handleProviderForgotReset} className="space-y-6">
                                            <div className="flex gap-3 justify-center">
                                                {providerOtp.map((digit, i) => (
                                                    <input key={`p-otp-${i}`} id={`p-otp-${i}`} type="text" maxLength={1} value={digit}
                                                        className="w-14 h-16 text-center text-3xl font-bold bg-gray-50 border border-gray-200 rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (isNaN(val)) return;
                                                            const newOtp = [...providerOtp]; newOtp[i] = val; setProviderOtp(newOtp);
                                                            if (val && i < 3) document.getElementById(`p-otp-${i + 1}`).focus();
                                                        }}
                                                        onKeyDown={(e) => { if (e.key === 'Backspace' && !providerOtp[i] && i > 0) document.getElementById(`p-otp-${i - 1}`).focus(); }}
                                                    />
                                                ))}
                                            </div>

                                            {/* If resetting password, we need the new password input here too */}
                                            {providerMode === 'forgot' && (
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">New Password</label>
                                                    <div className="relative group">
                                                        <input type="password" required autoComplete="new-password" value={providerData.password} onChange={e => setProviderData({ ...providerData, password: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all" placeholder="Enter new password" />
                                                        <Key className="w-5 h-5 text-gray-400 absolute left-3 top-3.5 group-focus-within:text-emerald-500" />
                                                    </div>
                                                    {providerData.password && (
                                                        <div className="flex gap-1 mt-2 h-1 overflow-hidden rounded-full">
                                                            {[1, 2, 3, 4, 5].map(i => <div key={i} className={`flex-1 h-full transition-colors ${i <= passwordCheck.strength ? (passwordCheck.strength < 3 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-gray-200'}`} />)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <button type="submit" disabled={loading || (providerMode==='forgot' && !passwordCheck.isValid) || providerOtp.join('').length < 4} className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : providerMode === 'signup' ? 'Complete Sign Up' : 'Update Password'}
                                            </button>
                                        </form>

                                        <p className="text-center text-sm text-gray-500 pt-4">
                                            {resendTimer > 0 ? (
                                                <>Resend in <b>{resendTimer}s</b></>
                                            ) : (
                                                <button onClick={providerMode === 'signup' ? handleProviderSignupStart : handleProviderForgotStart} className="text-emerald-600 font-semibold hover:underline">
                                                    Resend Code
                                                </button>
                                            )}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default function AuthModal() {
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID"}>
            <AuthModalContent />
        </GoogleOAuthProvider>
    );
}
