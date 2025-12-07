'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, Plus, Edit3, Eye, Trash2, PlayCircle, CheckCircle2, Share2, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';

// Helper to calculate event status based on date/time & duration
function calculateStatus(event) {
  const now = new Date();
  
  // Parse event date and time
  const startDate = new Date(event.date);
  const startTime = event.pickupPoints[0]?.time || '00:00';
  
  // Combine date and time
  const [hours, minutes] = startTime.split(':').map(Number);
  startDate.setHours(hours, minutes, 0, 0);
  
  // Calculate end time by adding duration (in days)
  const endDate = new Date(startDate.getTime() + (Number(event.duration) || 0) * 24 * 60 * 60 * 1000);

  if (now < startDate) return 'upcoming';
  if (now >= startDate && now <= endDate) return 'live';
  return 'past';
}

function StatusPill({ status }) {
  const map = {
    live: 'bg-emerald-100 text-emerald-800',
    upcoming: 'bg-blue-100 text-blue-800',
    past: 'bg-neutral-100 text-neutral-800',
  };

  const icons = {
    live: <PlayCircle className="w-3 h-3" />,
    upcoming: <Clock className="w-3 h-3" />,
    past: <CheckCircle2 className="w-3 h-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function EventCard({ event, onAction }) {
  // Calculate dynamic status here, overriding event.status
  const dynamicStatus = calculateStatus(event);

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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center border border-emerald-100">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-lg">{event.title}</h3>
              <p className="text-sm text-neutral-600">{event.category || event.eventType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">{event.eventId || 'N/A'}</span>
            <StatusPill status={dynamicStatus} />
          </div>
        </div>

        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{event.description || event.about || 'No description available'}</p>

        <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>
              {event.date ? new Date(event.date).toLocaleDateString() : 'Date not set'} at {event.pickupPoints?.[0]?.time || '00:00'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="truncate">{event.location || 'Location not set'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{event.totalSlots || 0} attendees</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{event.duration || 0} {event.duration === 1 ? 'day' : 'days'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            {dynamicStatus === 'upcoming' && (
              <>
                <button
                  onClick={() => onAction('view', event)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => onAction('edit', event)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
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

            {dynamicStatus === 'live' && (
              <>
                <button
                  onClick={() => onAction('manage', event)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                >
                  Manage Event
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

            {dynamicStatus === 'past' && (
              <>
                <button
                  onClick={() => onAction('view', event)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => onAction('analytics', event)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                >
                  Analytics
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAction('delete', event)}
              className="p-2 rounded-lg border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-200 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function EventMainContent() {
  const [activeTab, setActiveTab] = useState('live');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Get company ID from redux store
  const currentCompany = useSelector((store) => store.providerCompany.currentCompany);
  const companyId = currentCompany?._id;

  useEffect(() => {
    async function fetchEvents() {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/getCompanyEvents?companyId=${companyId}`,
          { withCredentials: true }
        );
        
        console.log('Events API Response:', res.data);
        
        const backendMessage = res?.data?.message;
        if (backendMessage === "Events Found") {
          setEvents(res?.data?.data || []);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, [companyId]);

  // Calculate dynamic statuses for UI count and filtering
  const eventsWithDynamicStatus = events.map(e => ({
    ...e,
    status: calculateStatus(e)
  }));

  const tabs = [
    { key: 'live', label: 'Live Events', count: eventsWithDynamicStatus.filter(e => e.status === 'live').length },
    { key: 'upcoming', label: 'Upcoming', count: eventsWithDynamicStatus.filter(e => e.status === 'upcoming').length },
    { key: 'past', label: 'Past Events', count: eventsWithDynamicStatus.filter(e => e.status === 'past').length },
  ];

  const filteredEvents = eventsWithDynamicStatus.filter(event => {
    switch (activeTab) {
      case 'live': return event.status === 'live';
      case 'upcoming': return event.status === 'upcoming';
      case 'past': return event.status === 'past';
      default: return true;
    }
  });

  function handleAction(type, event) {
    switch (type) {
      case 'publish':
        alert(`Publishing event: ${event.title}`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
          handleDeleteEvent(event._id);
        }
        break;
      case 'view':
        router.push(`/serviceprovider/dashboard/events/${event._id}`);
        break;
      case 'edit':
        router.push(`/serviceprovider/dashboard/events/edit/${event._id}`);
        break;
      case 'manage':
        router.push(`/serviceprovider/dashboard/events/manage/${event._id}`);
        break;
      case 'share':
        navigator.clipboard.writeText(`${window.location.origin}/event/${event._id}`);
        alert('Event link copied to clipboard!');
        break;
      case 'analytics':
        router.push(`/serviceprovider/dashboard/events/analytics/${event._id}`);
        break;
      default:
        break;
    }
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/deleteEvent/${eventId}`,
        { withCredentials: true }
      );
      
      if (res.data.success) {
        // Remove event from local state
        setEvents(prev => prev.filter(event => event._id !== eventId));
        alert('Event deleted successfully!');
      } else {
        alert('Failed to delete event. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleHostEvent = () => {
    router.push('/serviceprovider/dashboard/events/hostevent');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Events Management</h1>
          <p className="text-neutral-600 mt-1">Manage and organize your community events</p>
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading events...
            </div>
          )}
          
          {error && (
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}

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
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-neutral-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Loading Events</h3>
          <p className="text-neutral-600">Fetching your events from the server...</p>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 px-6 rounded-lg border-2 border-dashed border-red-200 bg-red-50"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Events</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </motion.div>
      ) : (
        /* Events Grid */
        <div className="grid grid-cols-1 gap-4">
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
                  ? 'Start by publishing an upcoming event to make it live.'
                  : 'Create your first event to get started.'}
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
            filteredEvents.map((event) => (
              <EventCard key={event._id || event.eventId} event={event} onAction={handleAction} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Add RefreshCw icon import
import { RefreshCw, AlertCircle } from 'lucide-react';