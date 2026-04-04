'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Mail, Key, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/admin/auth/me').then(r => r.json()).then(data => {
            if (data.needsSetup) {
                router.replace('/admin/setup');
            } else if (data.authenticated) {
                router.replace('/admin/dashboard');
            } else {
                setChecking(false);
            }
        }).catch(() => setChecking(false));
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                router.replace('/admin/dashboard');
            } else {
                setError(data.message || 'Invalid credentials.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-sm"
            >
                {/* Brand */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4"
                    >
                        <Shield className="w-8 h-8 text-emerald-400" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">bagspackgo</h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium">Admin Panel</p>
                </div>

                <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-lg font-bold text-white mb-6">Sign in to continue</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                            </motion.div>
                        )}

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type="email" required autoComplete="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full bg-gray-800/60 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                                    placeholder="admin@bagspackgo.com" />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input type={showPwd ? 'text' : 'password'} required autoComplete="current-password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    className="w-full bg-gray-800/60 border border-gray-700 rounded-xl pl-10 pr-11 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                                    placeholder="Your password" />
                                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                            className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
                        </motion.button>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-600 mt-6">
                    Restricted access — authorised personnel only.
                </p>
            </motion.div>
        </div>
    );
}
