'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
    Clock, CheckCircle2, Send, Hourglass, Mail, LogOut,
    RefreshCw, Shield, FileCheck, Building2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function TimelineTracker({ currentStatus }) {
    const steps = [
        { id: 'submitted', label: 'Submitted', desc: 'Application received', icon: Send },
        { id: 'pending', label: 'Under Review', desc: 'Being reviewed', icon: Hourglass },
        { id: 'approved', label: 'Approved', desc: 'Welcome aboard!', icon: CheckCircle2 },
    ];
    const statusIndex = { submitted: 0, pending: 1, approved: 2 };
    const activeIdx = statusIndex[currentStatus] ?? 1;

    return (
        <div className="flex items-center w-full max-w-sm mx-auto">
            {steps.map((step, idx) => {
                const Icon = step.icon;
                const done = idx < activeIdx;
                const active = idx === activeIdx;
                return (
                    <div key={step.id} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center relative">
                            <motion.div
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.15, type: 'spring', stiffness: 300 }}
                                className={`relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${done ? 'bg-emerald-500 text-white'
                                        : active ? 'bg-white border-2 border-emerald-500 text-emerald-600'
                                            : 'bg-gray-100 text-gray-400'
                                    }`}
                            >
                                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                {active && (
                                    <motion.div className="absolute inset-0 rounded-2xl border-2 border-emerald-400"
                                        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                                        transition={{ repeat: Infinity, duration: 2.5 }} />
                                )}
                                {done && (
                                    <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                                        <CheckCircle2 className="h-3 w-3 text-white" />
                                    </div>
                                )}
                            </motion.div>
                            <span className={`text-[11px] sm:text-xs mt-2 font-bold text-center ${done || active ? 'text-gray-800' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                            <span className={`text-[9px] sm:text-[10px] text-center ${done || active ? 'text-gray-500' : 'text-gray-300'}`}>
                                {step.desc}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div className="flex-1 mx-2 sm:mx-3 -mt-7">
                                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }}
                                        animate={{ width: done || (active && idx === 0) ? '100%' : '0%' }}
                                        transition={{ delay: idx * 0.2 + 0.3, duration: 0.6 }}
                                        className="h-full bg-emerald-500 rounded-full" />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function ApplicationPendingPage() {
    const { user, logout, checkAuth } = useAuth();
    const [appData, setAppData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [justChecked, setJustChecked] = useState(false);

    const fetchStatus = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await fetch('/api/provider/application-status');
            const data = await res.json();
            if (data.success) setAppData(data);
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setLoading(false);
            if (isRefresh) {
                setRefreshing(false);
                setJustChecked(true);
                setTimeout(() => setJustChecked(false), 3000);
            }
        }
    };

    useEffect(() => { fetchStatus(); }, []);

    const handleRefresh = async () => {
        await fetchStatus(true);
        await checkAuth();
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className="min-h-[100dvh] w-full flex bg-white font-sans text-gray-900 overflow-x-hidden">
            {/* LEFT: Immersive Image Panel */}
            <div className="fixed inset-0 md:relative md:w-1/2 lg:w-[55%] flex-shrink-0 bg-black z-0">
                <Image src="/images/signin.jpg" alt="Service Provider" fill className="object-cover opacity-40 md:opacity-100" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 md:bg-gradient-to-t md:from-black/80 md:via-black/30 md:to-transparent" />
                <div className="hidden md:flex flex-col justify-end absolute inset-0 p-8 lg:p-14 text-white z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="max-w-lg mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-1 w-8 bg-amber-400 rounded-full" />
                            <span className="text-amber-400 text-sm font-semibold tracking-wider uppercase">Under Review</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] mb-5 tracking-tight">
                            Almost There.
                        </h1>
                        <p className="text-lg text-white/80 leading-relaxed max-w-md">
                            Our team is reviewing your application. You will be notified once the review is complete.
                        </p>
                        <motion.div className="mt-10 flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl w-fit"
                            animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
                            <div className="h-10 w-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
                                <Hourglass className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Estimated review time</p>
                                <p className="text-xs text-white/60">1-2 business days</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT: Status Panel */}
            <div className="relative w-full md:w-1/2 lg:w-[45%] flex items-start md:items-center justify-center p-4 sm:p-6 md:p-8 z-10 min-h-[100dvh] overflow-y-auto">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                    className="w-full max-w-[480px] bg-white/95 backdrop-blur-xl md:bg-white rounded-3xl md:rounded-none shadow-2xl md:shadow-none p-6 sm:p-8 border border-white/20 md:border-none my-4 md:my-0">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href="/" className="inline-block mb-5">
                            <div className="w-[130px] h-[40px] relative">
                                <Image src="/images/logo.svg" alt="BagspackGo" fill className="object-contain" />
                            </div>
                        </Link>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Application Status</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {"Hi "}<span className="font-semibold text-gray-700">{user?.username || 'there'}</span>{", here is your application progress."}
                        </p>
                    </div>

                    {/* Status badge */}
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
                        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                            className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Hourglass className="h-6 w-6 text-amber-600" />
                        </motion.div>
                        <div>
                            <p className="font-bold text-amber-800">Under Review</p>
                            <p className="text-xs text-amber-600">Our team is verifying your documents</p>
                        </div>
                    </motion.div>

                    {/* Timeline tracker */}
                    <div className="mb-8">
                        <TimelineTracker currentStatus={appData?.application?.status || 'pending'} />
                    </div>

                    {/* Application details */}
                    <AnimatePresence>
                        {appData?.application && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-6">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                                    <FileCheck className="h-3.5 w-3.5 text-emerald-500" /> Application Details
                                </h3>
                                <div className="bg-gray-50 rounded-2xl border border-gray-100 divide-y divide-gray-100">
                                    {[
                                        { icon: Building2, label: 'Company', value: appData.application.companyName },
                                        { icon: Clock, label: 'Submitted', value: formatDate(appData.application.submittedAt) },
                                        { icon: RefreshCw, label: 'Last Updated', value: formatDate(appData.application.lastUpdated) },
                                    ].map((item) => (
                                        <div key={item.label} className="flex items-center gap-3 px-4 py-3">
                                            <div className="h-8 w-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                                                <item.icon className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                                                <p className="text-sm font-semibold text-gray-800 truncate">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* What happens next */}
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-1.5 mb-3">
                            <Shield className="h-3.5 w-3.5 text-blue-500" /> What Happens Next?
                        </h3>
                        <div className="space-y-2">
                            {[
                                'Our team will verify your documents and details',
                                'You will get an email once the review is complete',
                                'Once approved, full dashboard access is unlocked',
                            ].map((text, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                                    className="flex items-center gap-2.5 text-sm text-gray-600">
                                    <div className="h-6 w-6 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    </div>
                                    {text}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2.5">
                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                            onClick={handleRefresh} disabled={refreshing}
                            className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Checking...' : justChecked ? 'No updates yet' : 'Check for Updates'}
                        </motion.button>
                        <div className="flex gap-2">
                            <a href="mailto:providers@bagspackgo.com"
                                className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm">
                                <Mail className="h-4 w-4" /> Support
                            </a>
                            <button onClick={logout}
                                className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm">
                                <LogOut className="h-4 w-4" /> Sign Out
                            </button>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
                        You can safely close this page.<br />
                        We will notify you via email when reviewed.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
