'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Loader2, AlertTriangle, CheckCheck, Link as LinkIcon, Calendar, User, Package, FileText, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

export default function AdminNotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchNotifs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/notifications');
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifs();
    }, [fetchNotifs]);

    const markAsRead = async (id) => {
        try {
            const res = await fetch(`/api/admin/notifications/${id}`, { method: 'PATCH' });
            if (res.ok) {
                setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            }
        } catch (e) { console.error('Failed to mark read', e) }
    };

    const markAllRead = async () => {
        try {
            const res = await fetch(`/api/admin/notifications/mark-all-read`, { method: 'PATCH' });
            if (res.ok) {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            }
        } catch (e) { console.error('Failed', e) }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'BOOKING': return <Calendar className="w-5 h-5 text-violet-400" />;
            case 'USER': return <User className="w-5 h-5 text-blue-400" />;
            case 'PROVIDER': return <Case className="w-5 h-5 text-emerald-400" />;
            case 'APPLICATION': return <FileText className="w-5 h-5 text-amber-400" />;
            case 'SUPPORT': return <LifeBuoy className="w-5 h-5 text-sky-400" />;
            case 'PACKAGE': return <Package className="w-5 h-5 text-pink-400" />;
            default: return <Bell className="w-5 h-5 text-gray-400" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bell className="w-6 h-6 text-indigo-400" /> Notifications
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Platform activity updates and critical alerts.</p>
                </div>

                {unreadCount > 0 && (
                    <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-semibold transition-colors">
                        <CheckCheck className="w-4 h-4" /> Mark all as read
                    </button>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" /> {error}
                </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-800 flex items-center gap-3 bg-gray-900/50">
                    <div className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {unreadCount} Unread
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Recent Activity Log (Last 100)</p>
                </div>

                <div className="divide-y divide-gray-800/50 max-h-[70vh] overflow-y-auto scrollbar-thin">
                    <AnimatePresence>
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                                <p className="text-gray-500 text-sm">Loading activity...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <Bell className="w-12 h-12 text-gray-800 mb-4" />
                                <p className="text-gray-400 font-semibold">No notifications</p>
                                <p className="text-gray-600 text-sm mt-1">You're all caught up on platform activities.</p>
                            </div>
                        ) : notifications.map(notif => (
                            <motion.div key={notif._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 sm:p-6 flex items-start gap-4 sm:gap-6 hover:bg-gray-800/20 transition-colors ${!notif.isRead ? 'bg-gray-800/10' : ''}`}
                                onPointerEnter={() => !notif.isRead && markAsRead(notif._id)}
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 relative ${
                                    !notif.isRead ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-gray-800 text-gray-400'
                                }`}>
                                    {getIcon(notif.type)}
                                    {!notif.isRead && <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-gray-900 translate-x-1/3 -translate-y-1/3" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-base font-semibold truncate ${!notif.isRead ? 'text-white' : 'text-gray-300'}`}>
                                        {notif.title}
                                    </h4>
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                        {notif.description}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <span>{new Date(notif.createdAt).toLocaleString('en-GB')}</span>
                                        {notif.link && (
                                            <Link href={notif.link} className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                                                <LinkIcon className="w-3.5 h-3.5" /> View Original
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// simple fallback icon for provider case if import missing
function Case(props) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
}
