'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, UserCircle, Save, Loader2, AlertTriangle, CheckCircle2, ShieldCheck, Mail, User } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
    const { admin, checkAuth } = useAdmin();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (admin) {
            setName(admin.name || '');
            setEmail(admin.email || '');
        }
    }, [admin]);

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword && newPassword !== confirmPassword) {
            return setError('New passwords do not match');
        }

        setLoading(true);
        try {
            const payload = { name, email };
            if (newPassword) {
                payload.currentPassword = currentPassword;
                payload.newPassword = newPassword;
            }

            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                setSuccess('Settings updated successfully!');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                await checkAuth(); // Refresh context
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-rose-500" /> Admin Settings
                </h1>
                <p className="text-gray-500">Manage your administrative profile and security credentials.</p>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
                </motion.div>
            )}

            {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {success}
                </motion.div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
                {/* Profile Section */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <UserCircle className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Profile Details</h2>
                            <p className="text-sm text-gray-500">Update your name and contact email.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1 font-mono">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text" required value={name} onChange={e => setName(e.target.value)}
                                    className="w-full bg-gray-800/60 border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1 font-mono">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-gray-800/60 border border-gray-700 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                            <Lock className="w-8 h-8 text-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Security & Password</h2>
                            <p className="text-sm text-gray-500">Ensure your administrative account stays secure.</p>
                        </div>
                    </div>

                    <div className="space-y-6 max-w-xl">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1 font-mono">Current Password</label>
                            <input
                                type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Leave blank if not changing"
                                className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all"
                            />
                        </div>

                        {currentPassword && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1 font-mono">New Password</label>
                                    <input
                                        type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required={!!currentPassword} placeholder="Min. 8 characters" minLength={8}
                                        className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1 font-mono">Confirm New</label>
                                    <input
                                        type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required={!!currentPassword} placeholder="Repeat new password"
                                        className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 outline-none transition-all"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <button type="submit" disabled={loading} className="px-8 py-4 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
