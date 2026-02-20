'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Users, Plus, Edit3, Eye, Trash2,
  PlayCircle, CheckCircle2, Share2, DollarSign, Loader2, AlertCircle
} from 'lucide-react';

function StatusPill({ status }) {
  const map = {
    'Live': 'bg-emerald-100 text-emerald-800',
    'Upcoming': 'bg-blue-100 text-blue-800',
    'Past': 'bg-neutral-100 text-neutral-800',
    'Draft': 'bg-yellow-100 text-yellow-800',
  };

  const icons = {
    'Live': <PlayCircle className="w-3 h-3" />,
    'Upcoming': <Clock className="w-3 h-3" />,
    'Past': <CheckCircle2 className="w-3 h-3" />,
    'Draft': <Edit3 className="w-3 h-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {icons[status]}
      {status}
    </span>
  );
}

function EventCard({ event, onAction }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -2 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center border border-emerald-100 overflow-hidden">
              {event.poster ? (
                <img src={event.poster} alt="" className="w-full h-full object-cover" />
              ) : (
                <Calendar className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">{event.title}</h3>
              <p className="text-sm text-neutral-600">{event.eventType}</p>
            </div>
          </div>
          <StatusPill status={event.displayStatus} />
        </div>

        {event.about && (
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{event.about}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-neutral-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{event.bookedSlots}/{event.totalSlots} booked</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>₹{event.pricePerSlot?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
          <Clock className="w-4 h-4" />
          <span>{event.duration} day{event.duration > 1 ? 's' : ''}</span>
          {event.rating > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>⭐ {event.rating.toFixed(1)}</span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2 flex-wrap">
            {event.displayStatus === 'Upcoming' && (
              <>
                <button
                  onClick={() => onAction('view', event)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => onAction('publish', event)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                >
                  <PlayCircle className="w-4 h-4" />
                  Publish
                </button>
              </>
            )}

            {event.displayStatus === 'Live' && (
              <>
                <button
                  onClick={() => onAction('view', event)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => onAction('share', event)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </>
            )}

            {event.displayStatus === 'Past' && (
              <button
                onClick={() => onAction('view', event)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            )}
          </div>

          <button
            onClick={() => onAction('delete', event)}
            className="p-2 rounded-lg border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-200 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function EventMainContent() {
  const [activeTab, setActiveTab] = useState('live');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

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
      console.error('Fetch events error:', err);
      setError('Failed to connect. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Categorize events into Live / Upcoming / Past
  const categorizeEvent = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);

    if (event.status === 'cancelled') return 'Past';
    if (event.status === 'completed') return 'Past';
    if (event.status === 'draft') return 'Upcoming';

    // Published events: check date
    if (eventDate < now) return 'Past';
    return 'Live';
  };

  const categorizedEvents = events.map(e => ({
    ...e,
    displayStatus: categorizeEvent(e)
  }));

  const tabs = [
    { key: 'live', label: 'Live Events', count: categorizedEvents.filter(e => e.displayStatus === 'Live').length },
    { key: 'upcoming', label: 'Upcoming', count: categorizedEvents.filter(e => e.displayStatus === 'Upcoming').length },
    { key: 'past', label: 'Past Events', count: categorizedEvents.filter(e => e.displayStatus === 'Past').length },
  ];

  const filteredEvents = categorizedEvents.filter(event => {
    switch (activeTab) {
      case 'live': return event.displayStatus === 'Live';
      case 'upcoming': return event.displayStatus === 'Upcoming';
      case 'past': return event.displayStatus === 'Past';
      default: return true;
    }
  });

  async function handleAction(type, event) {
    switch (type) {
      case 'publish':
        // TODO: Call PATCH API to publish a draft event
        alert(`Publish event: ${event.title} (coming soon)`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
          // TODO: Call DELETE API
          alert(`Delete event: ${event.title} (coming soon)`);
        }
        break;
      case 'view':
      case 'edit':
      case 'manage':
      case 'share':
      case 'analytics':
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)}: ${event.title} (coming soon)`);
        break;
      default:
        break;
    }
  }

  const handleHostEvent = () => {
    router.push('/serviceprovider/dashboard/events/hostevent');
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Events Management</h1>
            <p className="text-neutral-600 mt-1">Manage and organize your community events</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-neutral-500 font-medium">Loading your events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Events Management</h1>
          <p className="text-neutral-600 mt-1">Manage and organize your community events</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleHostEvent}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Host New Event
        </motion.button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
          <button onClick={fetchEvents} className="ml-auto text-sm font-semibold text-red-600 hover:underline">Retry</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
                }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="wait">
          {filteredEvents.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 px-6 rounded-lg border-2 border-dashed border-neutral-200"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                No {tabs.find(t => t.key === activeTab)?.label.toLowerCase()}
              </h3>
              <p className="text-neutral-600 mb-4 max-w-sm mx-auto">
                {activeTab === 'live'
                  ? 'Publish an upcoming event to make it live, or host a new event.'
                  : activeTab === 'upcoming'
                    ? 'Save an event as draft while hosting to see it here.'
                    : 'Completed and past events will appear here.'}
              </p>
              <button
                onClick={handleHostEvent}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" />
                Host New Event
              </button>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} onAction={handleAction} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}