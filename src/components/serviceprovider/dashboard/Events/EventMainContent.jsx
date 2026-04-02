'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Users, Plus, Edit3, Eye, Trash2,
  PlayCircle, CheckCircle2, Share2, IndianRupee, Loader2, AlertCircle,
  Sparkles, TrendingUp, ArrowRight, X, Send, Copy, Check
} from 'lucide-react';

/* ──────────────────────────────────────────────
   Status Badge
────────────────────────────────────────────── */
function StatusBadge({ status, deleteRequest }) {
  if (deleteRequest?.requested && deleteRequest?.adminStatus === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
        <Clock className="w-3 h-3" />
        Deletion Pending
      </span>
    );
  }

  const styles = {
    Live: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
    Past: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    Draft: 'bg-amber-100 text-amber-800 border-amber-200',
  };
  const icons = {
    Live: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />,
    Upcoming: <Clock className="w-3 h-3" />,
    Past: <CheckCircle2 className="w-3 h-3" />,
    Draft: <Edit3 className="w-3 h-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {icons[status]}
      {status}
    </span>
  );
}

/* ──────────────────────────────────────────────
   Share Modal
────────────────────────────────────────────── */
function ShareModal({ event, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/user/events/eventdetails/${event.id}`
    : `/user/events/eventdetails/${event.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: shareUrl,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">Share Event</h3>
              <p className="text-xs text-neutral-500">Share the event link with your audience</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 transition">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <p className="text-sm font-semibold text-neutral-700 mb-2 truncate">{event.title}</p>

        <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 mb-4">
          <p className="flex-1 text-xs text-neutral-600 truncate font-mono">{shareUrl}</p>
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'}`}
          >
            {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50 transition text-sm font-medium text-neutral-700"
          >
            <Copy className="w-4 h-4" /> Copy Link
          </button>
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:opacity-90 transition"
            >
              <Send className="w-4 h-4" /> Share
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Delete Request Modal
────────────────────────────────────────────── */
function DeleteRequestModal({ event, onClose, onSubmit, submitting }) {
  const [reason, setReason] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">Request Deletion</h3>
              <p className="text-xs text-neutral-500">This requires admin approval</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 transition">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-4">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Note:</span> Events cannot be directly deleted. Your deletion request will be sent to the admin for review and approval.
          </p>
        </div>

        <p className="text-sm font-semibold text-neutral-700 mb-3 truncate">"{event.title}"</p>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Reason for Deletion <span className="text-neutral-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g., Event cancelled due to venue issues, rescheduled, etc."
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none transition"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Event Card
────────────────────────────────────────────── */
function EventCard({ event, onAction }) {
  const ensureString = (val) => {
    if (!val) return '';
    if (typeof val === 'object') return val.label || val.value || 'N/A';
    return String(val);
  };

  const title = ensureString(event.title);
  const type = ensureString(event.eventType);
  const loc = ensureString(event.location);

  const formattedDate = new Date(event.date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const occupancyPercent = event.totalSlots > 0
    ? Math.round((event.bookedSlots / event.totalSlots) * 100)
    : 0;

  const hasPendingDelete = event.deleteRequest?.requested && event.deleteRequest?.adminStatus === 'pending';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer group ${hasPendingDelete ? 'border-orange-200 bg-orange-50/40' : 'border-neutral-200'}`}
      onClick={() => onAction('view', event)}
    >
      {/* Poster strip */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700">
        {event.poster ? (
          <img src={event.poster} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-14 h-14 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Status badge top-right */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={event.displayStatus} deleteRequest={event.deleteRequest} />
        </div>
        {/* Price tag bottom-left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1">
          <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
          <span className="text-sm font-bold text-neutral-900">{event.pricePerSlot?.toLocaleString('en-IN')}</span>
          <span className="text-xs text-neutral-500">/slot</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5" onClick={(e) => { /* card body click handled by article */ }}>
        <h3 className="font-bold text-neutral-900 text-base mb-0.5 line-clamp-1">{title}</h3>
        <p className="text-xs text-neutral-500 mb-3">{type}</p>

        {event.about && (
          <p className="text-neutral-600 text-sm line-clamp-2 mb-4 leading-relaxed">{event.about}</p>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-neutral-600 mb-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="truncate">{loc}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>{event.duration} day{event.duration > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span>{event.bookedSlots}/{event.totalSlots} booked</span>
          </div>
        </div>

        {/* Occupancy bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
            <span>Occupancy</span>
            <span className="font-semibold text-neutral-700">{occupancyPercent}%</span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${occupancyPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className={`h-full rounded-full ${occupancyPercent >= 80 ? 'bg-red-500' : occupancyPercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            />
          </div>
        </div>

        {/* Actions row */}
        <div className="flex items-center gap-2 pt-4 border-t border-neutral-100" onClick={(e) => e.stopPropagation()}>
          {/* View button (all statuses) */}
          <button
            onClick={() => onAction('view', event)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition"
          >
            <Eye className="w-3.5 h-3.5" /> View Details
          </button>

          {/* Publish (draft/upcoming only) */}
          {event.displayStatus === 'Upcoming' && (
            <button
              onClick={() => onAction('publish', event)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold hover:opacity-90 transition"
            >
              <PlayCircle className="w-3.5 h-3.5" /> Publish
            </button>
          )}

          {/* Share (live events) */}
          {event.displayStatus === 'Live' && (
            <button
              onClick={() => onAction('share', event)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          )}

          {/* Delete request (not already pending) */}
          {!hasPendingDelete ? (
            <button
              onClick={() => onAction('delete', event)}
              title="Request deletion"
              className="p-2 rounded-lg border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div
              title="Deletion pending admin approval"
              className="p-2 rounded-lg border border-orange-200 bg-orange-50 text-orange-500 cursor-default"
            >
              <Clock className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ──────────────────────────────────────────────
   Stats Card
────────────────────────────────────────────── */
function StatsBar({ events }) {
  const live = events.filter(e => e.displayStatus === 'Live').length;
  const upcoming = events.filter(e => e.displayStatus === 'Upcoming').length;
  const totalBooked = events.reduce((s, e) => s + (e.bookedSlots || 0), 0);
  const totalRevenue = events.reduce((s, e) => s + ((e.bookedSlots || 0) * (e.pricePerSlot || 0)), 0);

  const stats = [
    { label: 'Live Events', value: live, icon: PlayCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Upcoming', value: upcoming, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Bookings', value: totalBooked, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Est. Revenue', value: `₹${(totalRevenue / 1000).toFixed(1)}K`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
            <s.icon className={`w-4 h-4 ${s.color}`} />
          </div>
          <div>
            <p className="text-lg font-bold text-neutral-900">{s.value}</p>
            <p className="text-xs text-neutral-500">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Component
────────────────────────────────────────────── */
export default function EventMainContent() {
  const [activeTab, setActiveTab] = useState('live');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareEvent, setShareEvent] = useState(null);
  const [deleteEvent, setDeleteEvent] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/provider/events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      } else {
        setError(data.message || 'Failed to load events');
      }
    } catch (err) {
      setError('Failed to connect. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const categorizeEvent = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    if (event.status === 'cancelled' || event.status === 'completed') return 'Past';
    if (event.status === 'draft') return 'Upcoming';
    if (eventDate < now) return 'Past';
    return 'Live';
  };

  const categorizedEvents = events.map(e => ({
    ...e,
    displayStatus: categorizeEvent(e),
  }));

  const tabs = [
    { key: 'live', label: 'Live', count: categorizedEvents.filter(e => e.displayStatus === 'Live').length },
    { key: 'upcoming', label: 'Upcoming', count: categorizedEvents.filter(e => e.displayStatus === 'Upcoming').length },
    { key: 'past', label: 'Past', count: categorizedEvents.filter(e => e.displayStatus === 'Past').length },
  ];

  const filteredEvents = categorizedEvents.filter(e => {
    switch (activeTab) {
      case 'live': return e.displayStatus === 'Live';
      case 'upcoming': return e.displayStatus === 'Upcoming';
      case 'past': return e.displayStatus === 'Past';
      default: return true;
    }
  });

  async function handleAction(type, event) {
    switch (type) {
      case 'view':
        router.push(`/serviceprovider/dashboard/events/${event.id}`);
        break;
      case 'publish':
        if (confirm(`Publish "${event.title}"? It will be visible to users immediately.`)) {
          try {
            const res = await fetch(`/api/provider/events/${event.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'publish' }),
            });
            const data = await res.json();
            if (data.success) {
              showToast('Event published successfully!');
              fetchEvents();
            } else {
              showToast(data.message || 'Failed to publish', 'error');
            }
          } catch {
            showToast('Network error', 'error');
          }
        }
        break;
      case 'share':
        setShareEvent(event);
        break;
      case 'delete':
        setDeleteEvent(event);
        break;
      default:
        break;
    }
  }

  async function handleDeleteRequest(reason) {
    if (!deleteEvent) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/provider/events/${deleteEvent.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setDeleteEvent(null);
        showToast('Deletion request submitted. Awaiting admin approval.');
        fetchEvents();
      } else {
        showToast(data.message || 'Failed to submit request', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-44 bg-neutral-200 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-64 bg-neutral-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-emerald-100 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-72 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="flex items-center justify-center py-4 gap-3 text-neutral-500">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-sm">Loading your events&hellip;</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h1 className="text-2xl font-bold text-neutral-900">Events</h1>
            </div>
            <p className="text-neutral-500 text-sm">Manage, publish and track all your hosted events</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/serviceprovider/dashboard/events/hostevent')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-sm hover:shadow-md hover:shadow-emerald-200 transition"
          >
            <Plus className="w-4 h-4" />
            Host New Event
          </motion.button>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm font-medium">{error}</p>
            <button onClick={fetchEvents} className="ml-auto text-sm font-bold text-red-600 hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* ── Stats ── */}
        {categorizedEvents.length > 0 && <StatsBar events={categorizedEvents} />}

        {/* ── Tabs ── */}
        <div className="flex border-b border-neutral-200 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-3 px-4 text-sm font-semibold transition-colors ${activeTab === tab.key ? 'text-emerald-700' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              {tab.label}
              <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                {tab.count}
              </span>
              {activeTab === tab.key && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── Events Grid ── */}
        <AnimatePresence mode="wait">
          {filteredEvents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 px-6 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50"
            >
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">
                No {tabs.find(t => t.key === activeTab)?.label} Events
              </h3>
              <p className="text-neutral-500 text-sm max-w-xs mx-auto mb-6">
                {activeTab === 'live'
                  ? 'Publish an upcoming event to make it live, or host a new event to get started.'
                  : activeTab === 'upcoming'
                    ? 'Save an event as a draft while hosting. It will appear here before publishing.'
                    : 'Completed and past events will appear here once they are done.'}
              </p>
              <button
                onClick={() => router.push('/serviceprovider/dashboard/events/hostevent')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" />
                Host New Event
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} onAction={handleAction} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {shareEvent && (
          <ShareModal event={shareEvent} onClose={() => setShareEvent(null)} />
        )}
        {deleteEvent && (
          <DeleteRequestModal
            event={deleteEvent}
            onClose={() => setDeleteEvent(null)}
            onSubmit={handleDeleteRequest}
            submitting={deleting}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-semibold ${toast.type === 'error' ? 'bg-red-700 text-white border-red-800' : 'bg-neutral-900 text-white border-neutral-800'}`}
          >
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4 text-emerald-400" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}