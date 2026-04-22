'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, CheckCheck, Luggage, Mountain,
  CalendarDays, Info, ChevronRight, Loader2,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dy = Math.floor(h / 24);
  return dy === 1 ? 'yesterday' : `${dy}d ago`;
}

const TYPE_CFG = {
  trip_booking: {
    icon: Luggage,
    color: 'bg-blue-50 text-blue-600',
    dot:   'bg-blue-500',
    label: 'Trip',
  },
  trek_booking: {
    icon: Mountain,
    color: 'bg-emerald-50 text-emerald-600',
    dot:   'bg-emerald-500',
    label: 'Trek',
  },
  event: {
    icon: CalendarDays,
    color: 'bg-violet-50 text-violet-600',
    dot:   'bg-violet-500',
    label: 'Event',
  },
  system: {
    icon: Info,
    color: 'bg-gray-100 text-gray-500',
    dot:   'bg-gray-400',
    label: 'System',
  },
};

const FILTERS = ['All', 'Bookings', 'Events'];

function filterMap(f) {
  if (f === 'Bookings') return ['trip_booking', 'trek_booking'];
  if (f === 'Events')   return ['event'];
  return null; // All
}

// ── Notification Item ──────────────────────────────────────────────────────

function NotifItem({ n, onRead }) {
  const cfg  = TYPE_CFG[n.type] || TYPE_CFG.system;
  const Icon = cfg.icon;

  const handleClick = () => {
    if (!n.read) onRead(n.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      onClick={handleClick}
      className={`flex gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-gray-50 ${!n.read ? 'bg-emerald-50/40' : ''}`}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl ${cfg.color} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon size={16} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[12px] font-semibold text-gray-800 leading-tight">{n.title}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.color}`}>{cfg.label}</span>
          </div>
          {!n.read && <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0 mt-1`} />}
        </div>
        <p className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-2">{n.message}</p>
        <span className="text-[10px] text-gray-400 mt-1 block">{timeAgo(n.createdAt)}</span>
      </div>
    </motion.div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────

export default function NotificationPanel() {
  const [open, setOpen]             = useState(false);
  const [notifications, setNotifs]  = useState([]);
  const [unread, setUnread]         = useState(0);
  const [loading, setLoading]       = useState(false);
  const [filter, setFilter]         = useState('All');
  const panelRef = useRef(null);

  // Fetch notifications
  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/provider/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifs(data.notifications || []);
        setUnread(data.unreadCount ?? 0);
      }
    } catch {}
    finally { setLoading(false); }
  };

  // Initial load + poll every 60 s
  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, 60_000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handle(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Mark one read
  const markRead = async (id) => {
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
    setUnread(u => Math.max(0, u - 1));
    await fetch('/api/provider/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  // Mark all read
  const markAllRead = async () => {
    setNotifs(ns => ns.map(n => ({ ...n, read: true })));
    setUnread(0);
    await fetch('/api/provider/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });
  };

  const types = filterMap(filter);
  const visible = types ? notifications.filter(n => types.includes(n.type)) : notifications;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifs(); }}
        className="relative p-2 rounded-xl bg-white/70 hover:bg-neutral-100 transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold grid place-items-center bg-emerald-500 text-white rounded-full"
            >
              {unread > 99 ? '99+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute -right-2 sm:right-0 top-12 w-[320px] sm:w-[380px] bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-black/10 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
              <div>
                <h3 className="text-[14px] font-bold text-gray-900">Notifications</h3>
                {unread > 0 && (
                  <p className="text-[11px] text-emerald-600 font-medium">{unread} unread</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50"
                  >
                    <CheckCheck size={13} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-0.5 px-3 pt-2.5 pb-1 border-b border-gray-100">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    filter === f
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[420px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <Loader2 size={22} className="text-emerald-400 animate-spin" />
                  <p className="text-[12px] text-gray-400">Loading notifications…</p>
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Bell size={20} className="text-gray-300" />
                  </div>
                  <p className="text-[13px] font-medium text-gray-400">No notifications</p>
                  <p className="text-[11px] text-gray-300">New bookings & updates will appear here</p>
                </div>
              ) : (
                <AnimatePresence>
                  {visible.map((n, i) => (
                    <div key={n.id}>
                      <NotifItem n={n} onRead={markRead} />
                      {i < visible.length - 1 && <div className="border-b border-gray-50 mx-4" />}
                    </div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {visible.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2.5">
                <button
                  onClick={() => { fetchNotifs(); }}
                  className="w-full text-center text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors py-1"
                >
                  Refresh <ChevronRight size={11} className="inline" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
