'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, Info, AlertTriangle, Clock, X, Sparkles, CheckCheck } from 'lucide-react';
import AccountPageHeader from '@/components/user/AccountPageHeader';

const NotificationsContent = () => {
  const [page, setPage] = useState(1);
  const [view, setView] = useState('all');
  const { data, error, isLoading: loading, mutate } = useSWR(`/api/user/notifications?page=${page}&limit=10`, {
    dedupingInterval: 30000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });
  const notifications = data?.notifications || [];
  const pagination = data?.pagination || { page, total: notifications.length, totalPages: 1 };
  const unreadCount = Number(data?.unreadCount || 0);
  const visibleNotifications = view === 'unread' ? notifications.filter((notification) => !notification.read) : notifications;

  const markAllAsRead = async () => {
    await mutate((current) => current ? { ...current, unreadCount: 0, notifications: current.notifications.map((notification) => ({ ...notification, read: true })) } : current, { revalidate: false });
    const response = await fetch('/api/user/notifications', { method: 'PATCH' });
    if (!response.ok) await mutate();
  };

  const markAsRead = async (id) => {
    const target = notifications.find((notification) => notification.id === id);
    if (!target || target.read) return;
    await mutate((current) => current ? { ...current, unreadCount: Math.max(0, Number(current.unreadCount || 0) - 1), notifications: current.notifications.map((notification) => notification.id === id ? { ...notification, read: true } : notification) } : current, { revalidate: false });
    const response = await fetch(`/api/user/notifications?id=${id}`, { method: 'PATCH' });
    if (!response.ok) await mutate();
  };

  const removeNotification = async (id) => {
    const target = notifications.find((notification) => notification.id === id);
    await mutate((current) => current ? { ...current, unreadCount: Math.max(0, Number(current.unreadCount || 0) - (target?.read ? 0 : 1)), notifications: current.notifications.filter((notification) => notification.id !== id), pagination: { ...current.pagination, total: Math.max(0, Number(current.pagination?.total || 1) - 1) } } : current, { revalidate: false });
    const response = await fetch(`/api/user/notifications?id=${id}`, { method: 'DELETE' });
    if (!response.ok) await mutate();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100"><CheckCircle className="h-6 w-6 text-emerald-700" /></div>;
      case 'alert': return <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-100"><AlertTriangle className="h-6 w-6 text-rose-600" /></div>;
      case 'warning': return <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100"><AlertTriangle className="h-6 w-6 text-amber-700" /></div>;
      default: return <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100"><Info className="h-6 w-6 text-sky-700" /></div>;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) return `${diffInDays}d ago`;
    if (diffInHours > 0) return `${diffInHours}h ago`;
    if (diffInMins > 0) return `${diffInMins}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] justify-center items-center bg-emerald-50/40">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-100 border-t-emerald-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8f6] px-4 py-8 font-sans sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AccountPageHeader eyebrow="Updates centre" title="Notifications" description="Booking, payment and travel updates that matter to you." icon={Bell} trailing={<div className="flex items-center gap-3"><span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600">{unreadCount} unread</span>{unreadCount > 0 && <button onClick={markAllAsRead} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black text-emerald-700 transition hover:bg-emerald-50"><CheckCheck className="h-4 w-4" />Mark all as read</button>}</div>} />

        <div className="my-7 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setView('all')} className={`rounded-full border px-5 py-2.5 text-xs font-bold transition ${view === 'all' ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-emerald-50'}`}>All ({pagination.total})</button>
          <button onClick={() => setView('unread')} className={`rounded-full border px-5 py-2.5 text-xs font-bold transition ${view === 'unread' ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-emerald-50'}`}>Unread ({unreadCount})</button>
        </div>

          <main className="space-y-3">
            {error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm font-semibold text-red-700">Notifications could not be loaded. Please try again.</div> : (
              <AnimatePresence mode="popLayout">
                {visibleNotifications.length > 0 ? visibleNotifications.map((notif) => (
                  <motion.article key={notif.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} onClick={() => markAsRead(notif.id)} className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:p-5 ${notif.read ? 'border-slate-200 bg-white' : notif.type === 'alert' ? 'border-rose-100 bg-rose-50/70' : notif.type === 'warning' ? 'border-amber-100 bg-amber-50/70' : 'border-emerald-100 bg-emerald-50/55'}`}>
                    <div className="flex items-center gap-4">
                      {getIcon(notif.type)}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><h2 className="text-[15px] font-black text-slate-900 sm:text-base">{notif.title}</h2>{!notif.read && <span className="h-2 w-2 rounded-full bg-emerald-500" aria-label="Unread" />}</div>
                        <p className="mt-1 text-sm leading-5 text-slate-600">{notif.message}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-3"><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400"><Clock className="h-3.5 w-3.5" />{formatTime(notif.date)}</span><button onClick={(event) => { event.stopPropagation(); removeNotification(notif.id); }} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 opacity-70 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100" aria-label="Remove notification"><X className="h-4 w-4" /></button></div>
                    </div>
                  </motion.article>
                )) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white px-5 text-center"><div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50"><Bell className="h-7 w-7 text-emerald-500" /><Sparkles className="absolute right-2 top-2 h-4 w-4 text-emerald-300" /></div><h3 className="mt-5 text-lg font-black text-slate-800">You're all caught up</h3><p className="mt-1 max-w-sm text-sm text-slate-500">New booking and travel updates will appear here.</p></motion.div>
                )}
              </AnimatePresence>
            )}
            {pagination.totalPages > 1 && <div className="flex items-center justify-center gap-3 pt-4"><button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-40">Previous</button><span className="text-xs font-bold text-slate-500">Page {page} of {pagination.totalPages}</span><button disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40">Next</button></div>}
          </main>
      </div>
    </div>
  );
};

export default NotificationsContent;
