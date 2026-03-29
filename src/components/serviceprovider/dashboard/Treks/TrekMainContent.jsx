'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, MapPin, Clock,
  Mountain, Package, RefreshCw, ArrowUpRight,
  XCircle, Search, History, Mail, Phone
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtAmt = (a) => `₹${Number(a || 0).toLocaleString('en-IN')}`;

/* ─── status map ──────────────────────────────────────── */
const S = {
  confirmed: { label: 'Upcoming',  pill: 'bg-emerald-100 text-emerald-700',  bar: 'bg-emerald-500', ring: 'ring-emerald-200' },
  completed: { label: 'Completed', pill: 'bg-indigo-100  text-indigo-700',   bar: 'bg-indigo-500',  ring: 'ring-indigo-200'  },
  cancelled: { label: 'Cancelled', pill: 'bg-rose-100    text-rose-600',     bar: 'bg-rose-400',    ring: 'ring-rose-200'    },
  pending:   { label: 'Pending',   pill: 'bg-amber-100   text-amber-700',    bar: 'bg-amber-400',   ring: 'ring-amber-200'   },
  cancellation_requested: { label: 'Cancellation Req.', pill: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500', ring: 'ring-orange-200' },
  refund_initiated: { label: 'Refund Sent', pill: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500', ring: 'ring-blue-200' },
};

/* ─── filter tabs ─────────────────────────────────────── */
const TABS = [
  { key: 'confirmed', label: 'Upcoming',  Icon: Mountain  },
  { key: 'completed', label: 'Past',      Icon: History   },
  { key: 'cancelled', label: 'Cancelled', Icon: XCircle   },
];

/* ─── info chip ───────────────────────────────────────── */
function Chip({ icon: Icon, color, label }) {
  return (
    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5">
      <Icon className={`w-3 h-3 ${color} shrink-0`} />
      <span className="text-[11px] font-medium text-gray-600 whitespace-nowrap">{label}</span>
    </div>
  );
}

/* ─── card ────────────────────────────────────────────── */
function BookingCard({ booking, index }) {
  const isCancelled = ['cancelled', 'cancellation_requested', 'refund_initiated'].includes(booking.status);
  const s = isCancelled ? S.cancelled : (S[booking.status] || S.confirmed);

  const ensureString = (val) => {
    if (!val) return '';
    if (typeof val === 'object') return val.label || val.value || 'N/A';
    return String(val);
  };

  const pName = ensureString(booking.packageName);
  const dest = ensureString(booking.destination);
  const user = ensureString(booking.personalDetails?.firstName || booking.bookedBy);
  const contactEmail = ensureString(booking.personalDetails?.contactDetails?.email) || ensureString(booking.bookedByEmail) || 'N/A';
  const contactPhone = ensureString(booking.personalDetails?.contactDetails?.mobile) || ensureString(booking.bookedByPhone) || 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
    >
      <Link href={`/serviceprovider/dashboard/treks/${booking.id}`}>
        <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden
                        hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">

          {/* Top accent strip */}
          <div className={`h-0.5 w-full ${s.bar}`} />

          <div className="p-4 sm:p-5">
            {/* Row A — ref chip · date · status pill · arrow */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <code className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md tracking-widest">
                #{booking.bookingRef}
              </code>
              <span className="text-[11px] text-gray-400">{fmtDate(booking.createdAt)}</span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${s.pill}`}>
                  {s.label}
                </span>
                <span className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center
                                 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all duration-300 shrink-0">
                  <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
                </span>
              </span>
            </div>

            {/* Row B — package name + destination */}
            <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-0.5 truncate">
              {pName}
            </h3>
            <div className="flex flex-col gap-1.5 text-[12px] text-gray-400 mb-4">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{dest || 'Destination not set'}</span>
                <span className="text-gray-200 px-0.5">·</span>
                <span>By <span className="text-gray-600 font-semibold">{user || 'User'}</span></span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-gray-500"><Mail className="w-3 h-3 shrink-0" /> <span className="truncate max-w-[140px]">{contactEmail}</span></span>
                <span className="flex items-center gap-1 text-gray-500"><Phone className="w-3 h-3 shrink-0" /> <span>{contactPhone}</span></span>
              </div>
            </div>

            {/* Row C — chips + amount */}
            <div className="flex flex-wrap gap-2">
                <Chip icon={Calendar} color="text-emerald-500" label={fmtDate(booking.startDate)} />
                <Chip icon={Clock}    color="text-sky-500"     label={`${booking.days || '—'} days`} />
                <Chip icon={Users}    color="text-violet-500"  label={`${booking.numPeople} guests`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── main ────────────────────────────────────────────── */
export default function TrekMainContent() {
  const [tab,      setTab]      = useState('confirmed');
  const [search,   setSearch]   = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/provider/trek-bookings');
      const d = await r.json();
      if (d.success) setBookings(d.data || []);
      else setError(d.message || 'Failed to load');
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const counts = {
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => ['cancelled', 'cancellation_requested', 'refund_initiated'].includes(b.status)).length,
  };

  const q    = search.toLowerCase();
  const list = bookings
    .filter(b => {
      if (tab === 'cancelled') return ['cancelled', 'cancellation_requested', 'refund_initiated'].includes(b.status);
      return b.status === tab;
    })
    .sort((a, b) => {
      if (tab === 'cancelled') {
        const dateA = new Date(a.cancellationDetails?.requestedAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.cancellationDetails?.requestedAt || b.updatedAt || 0).getTime();
        return dateB - dateA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .filter(b => !q || b.packageName?.toLowerCase().includes(q) || b.bookingRef?.toLowerCase().includes(q));

  return (
    <div className="w-full space-y-5 pb-6">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Title */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow shadow-emerald-200 shrink-0">
            <Mountain className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[17px] font-black text-gray-900 tracking-tight truncate">Trek Bookings</h1>
            <p className="text-[11px] text-gray-400">{bookings.length} total reservations</p>
          </div>
        </div>

        {/* Search + actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search */}
          <div className="relative hidden sm:block w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full pl-8 pr-3 py-2 text-[12px] bg-white border border-gray-200 rounded-xl placeholder-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
            />
          </div>
          <Link
            href="/serviceprovider/dashboard/settings/packages?tab=trek"
            className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:border-emerald-300 hover:text-emerald-600 transition-all whitespace-nowrap"
          >
            <Package size={13} />
            <span className="hidden sm:inline">Packages</span>
          </Link>
          <button
            onClick={load} disabled={loading}
            className="flex items-center justify-center w-9 h-9 bg-white border border-gray-200 rounded-xl text-gray-400 hover:border-emerald-300 hover:text-emerald-600 transition-all active:scale-95 disabled:opacity-40"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="sm:hidden relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search bookings…"
          className="w-full pl-9 pr-3 py-2.5 text-[12px] bg-white border border-gray-200 rounded-xl placeholder-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
        />
      </div>

      {/* ── Filter tabs (full width) ───────────────────── */}
      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-[11px] sm:text-[12px] font-semibold transition-all duration-200
              ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab === key && (
              <motion.div
                layoutId="trek-tab-bg"
                className="absolute inset-0 bg-white rounded-xl shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
              />
            )}
            <span className="relative flex items-center gap-1 sm:gap-1.5">
              <Icon size={11} />
              <span className="truncate">{label}</span>
              <span className={`text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded-full leading-none shrink-0
                ${tab === key ? (S[key]?.pill || 'bg-gray-100 text-gray-500') : 'bg-gray-200 text-gray-400'}`}>
                {counts[key]}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* ── Result label ───────────────────────────────────── */}
      {!loading && !error && (
        <p className="text-[11px] text-gray-400 font-medium -mb-2 px-0.5">
          {list.length} {S[tab]?.label.toLowerCase()} booking{list.length !== 1 ? 's' : ''}
          {search && ` · matching "${search}"`}
        </p>
      )}

      {/* ── Content ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-24">
          <div className="w-8 h-8 rounded-full border-[3px] border-gray-100 border-t-emerald-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading bookings…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-20 rounded-2xl border-2 border-dashed border-rose-100 bg-rose-50/30">
          <XCircle className="w-10 h-10 text-rose-300" />
          <p className="text-sm font-semibold text-rose-500">{error}</p>
          <button onClick={load} className="text-sm text-emerald-600 font-semibold hover:underline">Retry</button>
        </div>
      ) : list.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 py-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/40"
        >
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center">
            <Mountain className="w-6 h-6 text-gray-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-400">
              {search ? `No results for "${search}"` : `No ${S[tab]?.label.toLowerCase()} bookings yet`}
            </p>
            <p className="text-xs text-gray-300 mt-1">They'll show up here when available.</p>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {list.map((b, i) => <BookingCard key={b.id} booking={b} index={i} />)}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
