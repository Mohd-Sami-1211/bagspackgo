'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
    Clock, CheckCircle2, Send, Hourglass, Mail, LogOut,
    RefreshCw, Shield, FileCheck, Building2, XCircle, AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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

export default function ApplicationPendingPage({ onResubmit }) {
    const { user, logout, checkAuth } = useAuth();
    const router = useRouter();
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

    const currentStatus = appData?.application?.status || 'pending';
    const isRejected = currentStatus === 'rejected';

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };

    return (
        <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#FAFAFA] text-gray-900 overflow-x-hidden p-4 sm:p-8 lg:p-12 relative -mt-5">
            
            <div className={`absolute top-0 left-0 w-full h-[45vh] bg-gradient-to-b ${isRejected ? 'from-rose-100/60' : 'from-amber-100/60'} to-transparent pointer-events-none`} />
            <motion.div className={`absolute -top-32 -right-32 w-96 h-96 ${isRejected ? 'bg-rose-200/40' : 'bg-amber-200/40'} rounded-full blur-[100px] pointer-events-none`} animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }} transition={{ duration: 8, repeat: Infinity }} />
            <motion.div className="absolute top-[40%] -left-32 w-80 h-80 bg-orange-100/40 rounded-full blur-[80px] pointer-events-none" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity }} />

            {/* Centered Form Wrapper */}
            <div className="relative z-10 w-full max-w-[600px] py-8">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring', damping: 25 }}
                    className="w-full bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-6 sm:p-10 border border-gray-100/80 overflow-hidden relative">
                    <div className={`absolute inset-0 bg-gradient-to-br from-white via-white ${isRejected ? 'to-rose-50/20' : 'to-amber-50/20'} pointer-events-none`} />
                    <div className="relative z-10">
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
                            className={`flex items-center gap-3 p-4 border rounded-2xl mb-6 ${isRejected ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
                            <motion.div animate={isRejected ? {} : { rotate: [0, 15, -15, 0] }} transition={isRejected ? {} : { repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isRejected ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                {isRejected ? <XCircle className="h-6 w-6" /> : <Hourglass className="h-6 w-6" />}
                            </motion.div>
                            <div>
                                <p className={`font-bold ${isRejected ? 'text-rose-800' : 'text-amber-800'}`}>
                                    {isRejected ? 'Application Rejected' : 'Under Review'}
                                </p>
                                <p className={`text-xs ${isRejected ? 'text-rose-600' : 'text-amber-600'}`}>
                                    {isRejected ? 'Please review the reason below and resubmit.' : 'Our team is verifying your documents'}
                                </p>
                            </div>
                        </motion.div>

                        {/* Admin Notes if rejected */}
                        {isRejected && appData?.application?.adminNotes && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                                        <span className="text-xs font-bold text-rose-800 uppercase tracking-widest">Admin Feedback</span>
                                    </div>
                                    <p className="text-sm text-rose-700 italic border-l-2 border-rose-300 pl-3 py-1">
                                        "{appData.application.adminNotes}"
                                    </p>
                                </div>
                            </motion.div>
                        )}

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
                        {!isRejected && (
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
                        )}

                        {/* Action buttons */}
                        <div className="space-y-2.5">
                            {isRejected ? (
                                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                    onClick={onResubmit}
                                    className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                                    Resubmit Application
                                </motion.button>
                            ) : (
                                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                    onClick={handleRefresh} disabled={refreshing}
                                    className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    {refreshing ? 'Checking...' : justChecked ? 'No updates yet' : 'Check for Updates'}
                                </motion.button>
                            )}
                            
                            <div className="flex flex-col sm:flex-row gap-2">
                                <a href="mailto:bagspackgo01@gmail.com"
                                    className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm">
                                    <Mail className="h-4 w-4" /> Write to Us
                                </a>
                                <button onClick={handleLogout}
                                    className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm">
                                    <LogOut className="h-4 w-4" /> Sign Out
                                </button>
                            </div>
                        </div>

                        <p className="text-center text-xs text-gray-500 font-medium mt-6 leading-relaxed">
                            {isRejected ? (
                                <>Please review the feedback and update your details.<br/>If you have questions, write to us.</>
                            ) : (
                                <>You can safely close this page.<br/>We will notify you via email when reviewed.</>
                            )}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
