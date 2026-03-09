'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, MapPin, Clock,
  Mountain, Package, RefreshCw, ArrowUpRight,
  CheckCircle2, XCircle
} from 'lucide-react';

/* ── status config — only confirmed & cancelled ── */
const STATUS_CFG = {
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    bar: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200',
    bar: 'bg-rose-400',
    icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.confirmed;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${cfg.badge}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

/* ── single booking card ── */
function TrekBookingCard({ booking, index }) {
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fmtAmt = (a) => `₹${Number(a || 0).toLocaleString('en-IN')}`;
  const cfg = STATUS_CFG[booking.status] || STATUS_CFG.confirmed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
    >
      <Link href={`/serviceprovider/dashboard/treks/${booking.id}`} className="group block">
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden
                        hover:shadow-md hover:border-emerald-200 transition-all duration-300">

          {/* Status colour strip at top */}
          <div className={`h-1 w-full ${cfg.bar}`} />

          <div className="p-5 flex flex-col md:flex-row md:items-center gap-5">

            {/* ── Left: icon + title ── */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Icon bubble */}
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100
                              flex items-center justify-center shrink-0
                              group-hover:bg-emerald-100 transition-colors">
                <Mountain className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="min-w-0 flex-1">
                {/* ref + booked date */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    #{booking.bookingRef}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Booked {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>

                {/* package name */}
                <h3 className="text-base font-bold text-gray-900 truncate leading-snug">
                  {booking.packageName}
                </h3>

                {/* destination */}
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {booking.destination}
                </p>
              </div>
            </div>

            {/* ── Right: chips + amount + status ── */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 shrink-0">

              {/* Date chip */}
              <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 leading-none">Date</p>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{fmtDate(booking.startDate)}</p>
                </div>
              </div>

              {/* Duration chip */}
              <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 leading-none">Duration</p>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{booking.days}D</p>
                </div>
              </div>

              {/* Trekkers chip */}
              <div className="flex items-center gap-1.5 bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2">
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 leading-none">Trekkers</p>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{booking.numPeople}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Amount</p>
                <p className="text-lg font-black text-emerald-600">{fmtAmt(booking.totalAmount)}</p>
              </div>

              {/* Status + arrow */}
              <div className="flex items-center gap-2">
                <StatusBadge status={booking.status} />
                <div className="w-8 h-8 rounded-full bg-neutral-50 border border-neutral-100
                                flex items-center justify-center
                                group-hover:bg-emerald-500 group-hover:border-emerald-500
                                transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── page-level stat card ── */
function StatBubble({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ── filters — only All, confirmed, cancelled ── */
const FILTERS = ['All', 'confirmed', 'cancelled'];

export default function TrekMainContent() {
  const [filter, setFilter] = useState('All');
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

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="space-y-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Trek Bookings</h2>
          <p className="text-sm text-neutral-500 mt-1">All reservations for your trek packages</p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl
                     bg-white border border-neutral-200 text-sm font-semibold text-gray-600
                     hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Summary stat row ── */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatBubble label="Total Bookings" value={counts.All} icon={Package} color="bg-emerald-500" />
          <StatBubble label="Confirmed" value={counts.confirmed} icon={CheckCircle2} color="bg-teal-500" />
          <StatBubble label="Cancelled" value={counts.cancelled} icon={XCircle} color="bg-rose-400" />
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 rounded-xl">
        {FILTERS.map(f => {
          const labels = { All: 'All', confirmed: 'Confirmed', cancelled: 'Cancelled' };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2
                ${filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-neutral-500 hover:text-gray-700'
                }`}
            >
              {labels[f]}
              <span className={`text-[11px] min-w-[20px] text-center px-1.5 py-0.5 rounded-md font-bold
                ${filter === f ? 'bg-emerald-100 text-emerald-700' : 'bg-white/60 text-neutral-500'}`}>
                {counts[f] ?? bookings.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Content area ── */}
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-24">
          <div className="w-11 h-11 rounded-full border-[3px] border-emerald-100 border-t-emerald-500 animate-spin" />
          <p className="text-sm text-neutral-400 font-medium">Loading bookings…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <XCircle className="w-10 h-10 text-rose-300" />
          <p className="text-sm font-semibold text-rose-500">{error}</p>
          <button onClick={fetchBookings} className="text-sm text-emerald-600 font-semibold underline">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center">
            <Mountain className="w-7 h-7 text-neutral-300" />
          </div>
          <div className="text-center">
            <h3 className="text-base font-bold text-neutral-600">
              {filter === 'All' ? 'No trek bookings yet' : `No ${filter} bookings`}
            </h3>
            <p className="text-sm text-neutral-400 mt-1">
              {filter === 'All'
                ? 'When users book your trek packages, they will appear here.'
                : `You have no ${filter} trek bookings right now.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((booking, i) => (
              <TrekBookingCard key={booking.id} booking={booking} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
