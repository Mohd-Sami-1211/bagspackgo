'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, MapPin, Clock,
  Mountain, Package, RefreshCw, ArrowRight,
  CheckCircle2, XCircle, TrendingUp, Search, Filter
} from 'lucide-react';

/* ── status config ── */
const STATUS_CFG = {
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    dot: 'bg-emerald-500',
    glow: 'shadow-emerald-100',
    bar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-rose-50 text-rose-600 border border-rose-200',
    dot: 'bg-rose-400',
    glow: 'shadow-rose-100',
    bar: 'bg-gradient-to-r from-rose-400 to-pink-400',
    icon: XCircle,
  },
};

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.confirmed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ── stat card ── */
function StatCard({ label, value, icon: Icon, gradient, sub }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} text-white shadow-lg`}>
      <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -right-1 w-14 h-14 rounded-full bg-white/5" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Icon className="w-4.5 h-4.5 text-white" />
          </div>
          {sub !== undefined && (
            <span className="text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">{sub}</span>
          )}
        </div>
        <p className="text-3xl font-black leading-none">{value}</p>
        <p className="text-white/70 text-xs font-medium mt-1 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}

/* ── single booking row ── */
function TrekBookingRow({ booking, index }) {
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fmtAmt = (a) => `₹${Number(a || 0).toLocaleString('en-IN')}`;
  const cfg = STATUS_CFG[booking.status] || STATUS_CFG.confirmed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <Link href={`/serviceprovider/dashboard/treks/${booking.id}`} className="group block">
        <div className="relative bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">

          {/* Left accent bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${cfg.bar} rounded-l-2xl`} />

          <div className="pl-5 pr-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4">

            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:from-emerald-100 group-hover:to-teal-100 transition-all">
              <Mountain className="w-5 h-5 text-emerald-600" />
            </div>

            {/* Title block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[10px] font-bold tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                  #{booking.bookingRef}
                </span>
                <span className="text-[11px] text-gray-400">
                  Booked {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 truncate">{booking.packageName}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                {booking.destination || 'Destination N/A'}
              </p>
            </div>

            {/* Data pills row */}
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Start</p>
                  <p className="text-xs font-semibold text-gray-700 whitespace-nowrap">{fmtDate(booking.startDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">Days</p>
                  <p className="text-xs font-semibold text-gray-700">{booking.days || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5">
                <Users className="w-3.5 h-3.5 text-violet-500" />
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase leading-none">People</p>
                  <p className="text-xs font-semibold text-gray-700">{booking.numPeople}</p>
                </div>
              </div>
            </div>

            {/* Amount + status */}
            <div className="flex items-center gap-3 shrink-0 sm:border-l sm:border-gray-100 sm:pl-4">
              <div className="text-right">
                <p className="text-[9px] text-gray-400 font-bold uppercase">Amount</p>
                <p className="text-base font-black text-emerald-600 leading-none whitespace-nowrap">{fmtAmt(booking.totalAmount)}</p>
              </div>
              <StatusPill status={booking.status} />
              <div className="w-7 h-7 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center
                              group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-all duration-300 shrink-0">
                <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
              </div>
            </div>

          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── filters ── */
const FILTERS = ['All', 'confirmed', 'cancelled'];
const FILTER_LABELS = { All: 'All', confirmed: 'Confirmed', cancelled: 'Cancelled' };

export default function TrekMainContent() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/provider/trek-bookings');
      const data = await res.json();
      if (data.success) setBookings(data.data || []);
      else setError(data.message || 'Failed to load bookings');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const counts = {
    All: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  const filtered = (filter === 'All' ? bookings : bookings.filter(b => b.status === filter))
    .filter(b => !search || b.packageName?.toLowerCase().includes(search.toLowerCase()) || b.bookingRef?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">

      {/* ── Header banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 rounded-2xl p-6 shadow-xl shadow-emerald-100">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mountain className="w-5 h-5 text-emerald-200" />
              <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest">Trek Management</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Trek Bookings</h2>
            <p className="text-emerald-100/80 text-sm mt-0.5">All reservations for your trek packages</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/serviceprovider/dashboard/settings/packages"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-white text-emerald-700 text-sm font-semibold
                         hover:bg-emerald-50 transition-all"
            >
              <Package className="w-4 h-4" />
              View Packages
            </Link>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-white/15 backdrop-blur text-white text-sm font-semibold border border-white/20
                         hover:bg-white/25 transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Bookings" value={counts.All} icon={Package}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
          <StatCard label="Confirmed" value={counts.confirmed} icon={CheckCircle2}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600" />
          <StatCard label="Cancelled" value={counts.cancelled} icon={XCircle}
            gradient="bg-gradient-to-br from-rose-400 to-pink-500" />
        </div>
      )}

      {/* ── Toolbar: filters + search ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Filter pills */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2
                ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {FILTER_LABELS[f]}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-bold min-w-[20px] text-center
                ${filter === f ? 'bg-emerald-100 text-emerald-700' : 'bg-white/70 text-gray-500'}`}>
                {counts[f] ?? bookings.length}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ref…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all"
          />
        </div>

        {/* Result count */}
        {!loading && (
          <span className="text-xs text-gray-400 font-medium sm:ml-auto shrink-0">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-10 h-10 rounded-full border-[3px] border-emerald-100 border-t-emerald-500 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading bookings…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16 rounded-2xl border-2 border-dashed border-rose-100 bg-rose-50/30">
          <XCircle className="w-10 h-10 text-rose-300" />
          <p className="text-sm font-semibold text-rose-500">{error}</p>
          <button onClick={fetchBookings} className="text-sm text-emerald-600 font-semibold hover:underline">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <div className="w-16 h-16 rounded-2xl bg-white shadow border border-gray-100 flex items-center justify-center">
            <Mountain className="w-7 h-7 text-gray-300" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-gray-500">
              {search ? 'No results found' : filter === 'All' ? 'No trek bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {search ? 'Try a different search term.' : 'When users book your trek packages, they will appear here.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence mode="popLayout">
            {filtered.map((booking, i) => (
              <TrekBookingRow key={booking.id} booking={booking} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
