'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, CreditCard, MapPin, Clock, Package, QrCode, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

/* ── Status pill ── */
function StatusPill({ status }) {
  const map = {
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {status === 'confirmed' ? '✅ Confirmed' : status === 'pending' ? '⏳ Pending Payment' : '❌ Cancelled'}
    </span>
  );
}

/* ── Booking Card ── */
function TripBookingCard({ booking }) {
  const [expanded, setExpanded] = useState(false);

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';
  const fmtAmount = (a) => `₹${Number(a || 0).toLocaleString('en-IN')}`;

  const travelers = booking.personalDetails?.personalDetails || [];
  const contact = booking.personalDetails?.contactDetails || {};
  const arrival = booking.arrivalDeparture?.arrival || {};
  const departure = booking.arrivalDeparture?.departure || {};

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.07)' }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-2xl bg-white border border-neutral-100 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex gap-4 p-5 md:p-6 items-start">
        {/* Icon */}
        <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-100 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">{booking.packageName}</h3>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {booking.destination}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400 font-mono">{booking.bookingRef}</span>
              <StatusPill status={booking.status} />
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span>{fmtDate(booking.startDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>{booking.days} days</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>{booking.numPeople} {booking.category === 'couple' ? 'couple' : 'person(s)'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold text-emerald-700">{fmtAmount(booking.totalAmount)}</span>
            </div>
          </div>

          {/* Booked by */}
          <div className="mt-3 text-sm text-gray-500">
            Booked by <span className="font-medium text-gray-800">{booking.bookedBy}</span>
            {booking.bookedByEmail && <span className="text-gray-400"> · {booking.bookedByEmail}</span>}
            {booking.bookedByPhone && <span className="text-gray-400"> · {booking.bookedByPhone}</span>}
          </div>

          {/* Expand button */}
          <button
            onClick={() => setExpanded(v => !v)}
            className="mt-3 flex items-center gap-1 text-xs text-emerald-600 hover:underline font-medium"
          >
            {expanded ? <><ChevronUp className="w-3 h-3" /> Hide details</> : <><ChevronDown className="w-3 h-3" /> View traveller details</>}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100 bg-gray-50 px-5 md:px-6 py-4 space-y-4"
          >
            {/* Contact */}
            {(contact.email || contact.mobile) && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Contact</p>
                <p className="text-sm text-gray-700">{contact.email}{contact.mobile ? ` · ${contact.mobile}` : ''}</p>
              </div>
            )}

            {/* Travellers */}
            {travelers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Travellers</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {travelers.map((t, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                      <p className="font-medium text-gray-800">{t.name || `Traveller ${i + 1}`}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{t.gender} · Age {t.age} · {t.nationality}</p>
                      {t.idType && <p className="text-gray-400 text-xs">{t.idType}: {t.idNumber}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Arrival/Departure */}
            {(arrival.city || departure.city) && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Travel Info</p>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  {arrival.city && <div><span className="font-medium">Arrival:</span> {arrival.city}{arrival.time ? `, ${arrival.time}` : ''}</div>}
                  {departure.city && <div><span className="font-medium">Departure:</span> {departure.city}{departure.time ? `, ${departure.time}` : ''}</div>}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="flex gap-4 text-sm text-gray-600">
              <div><span className="font-medium">Start:</span> {fmtDate(booking.startDate)}</div>
              <div><span className="font-medium">End:</span> {fmtDate(booking.endDate)}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="border-t border-neutral-100 px-5 py-2 bg-gradient-to-t from-white to-transparent">
        <div className="text-xs text-neutral-400 flex items-center gap-2">
          <QrCode className="w-3 h-3" />
          <span>Ref: {booking.bookingRef}</span>
          <span className="ml-auto">Booked {new Date(booking.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
      </div>
    </motion.article>
  );
}

/* ── Main component ── */
const FILTERS = ['All', 'confirmed', 'pending', 'cancelled'];

export default function TripMainContent() {
  const [filter, setFilter] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/provider/trip-bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.data || []);
      } else {
        setError(data.message || 'Failed to load bookings');
      }
    } catch (e) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  const counts = {
    All: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Trip Bookings</h2>
          <p className="text-sm text-gray-500 mt-0.5">All bookings for your trip packages</p>
        </div>
        <div className="flex-1" />
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition flex items-center gap-1.5 ${filter === f ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
              }`}
          >
            <span className="capitalize">{f === 'All' ? 'All' : f}</span>
            <span className={`text-xs rounded-full px-1.5 py-0.5 ${filter === f ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading bookings...</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl border border-red-100 bg-red-50 text-center text-red-600">
          <p>{error}</p>
          <button onClick={fetchBookings} className="mt-3 text-sm underline text-red-500">Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 text-center">
          <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-medium text-neutral-600">
            {filter === 'All' ? 'No bookings yet' : `No ${filter} bookings`}
          </h3>
          <p className="text-sm text-neutral-400 mt-1">
            {filter === 'All'
              ? 'When users book your packages, they will appear here.'
              : `You have no ${filter} trip bookings.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(booking => (
              <TripBookingCard key={booking.id} booking={booking} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
