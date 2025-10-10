'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, Plus, Edit3, Eye, Trash2, PlayCircle, CheckCircle2, Share2 } from 'lucide-react';

// Events data
const eventsData = [
  {
    id: 'E-44',
    title: 'Shikara Parade',
    date: '2025-08-15',
    time: '14:00',
    status: 'Live',
    location: 'Dal Lake, Srinagar',
    duration: '3 hours',
    attendees: '45/60',
    description: 'Traditional Shikara boat parade showcasing local culture and craftsmanship',
    category: 'Cultural Event',
  },
  {
    id: 'E-45',
    title: 'Himalayan Travel Fair',
    date: '2025-08-28',
    time: '10:00',
    status: 'Upcoming',
    location: 'Convention Center, Leh',
    duration: '6 hours',
    attendees: '23/100',
    description: 'Annual travel fair featuring Himalayan destinations and adventure activities',
    category: 'Exhibition',
  },
  {
    id: 'E-46',
    title: 'Kashmir Food Festival',
    date: '2025-09-05',
    time: '18:00',
    status: 'Upcoming',
    location: 'Mughal Gardens, Srinagar',
    duration: '4 hours',
    attendees: '12/80',
    description: 'Culinary event featuring traditional Kashmiri cuisine and live cooking demonstrations',
    category: 'Food Festival',
  },
  {
    id: 'E-47',
    title: 'Ladakh Photography Workshop',
    date: '2025-07-20',
    time: '09:00',
    status: 'Past',
    location: 'Leh Valley, Ladakh',
    duration: '8 hours',
    attendees: '30/30',
    description: 'Professional photography workshop capturing the beauty of Ladakh landscapes',
    category: 'Workshop',
  },
];

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
              <p className="text-sm text-neutral-600">{event.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">{event.id}</span>
            <StatusPill status={event.status} />
          </div>
        </div>

        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{event.date} at {event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{event.attendees} attendees</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{event.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            {event.status === 'Upcoming' && (
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
            
            {event.status === 'Live' && (
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
            
            {event.status === 'Past' && (
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

function NewEventModal({ open, onClose }) {
  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
      >
        <div className="p-6 border-b border-neutral-100">
          <h3 className="text-lg font-semibold text-neutral-900">Host New Event</h3>
          <p className="text-sm text-neutral-600 mt-1">Create a new event for your community</p>
        </div>
        
        <form className="p-6 grid gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Event Title</label>
            <input 
              className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
              placeholder="Enter event title"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Date</label>
              <input 
                type="date" 
                className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Time</label>
              <input 
                type="time" 
                className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
            <input 
              className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
              placeholder="Event venue"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
            <textarea 
              className="w-full rounded-lg border border-neutral-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
              placeholder="Describe your event"
              rows={4}
            />
          </div>
          
          <div className="flex items-center justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
            >
              Create Event
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function EventMainContent() {
  const [activeTab, setActiveTab] = useState('live');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [events, setEvents] = useState(eventsData);

  const tabs = [
    { key: 'live', label: 'Live Events', count: events.filter(e => e.status === 'Live').length },
    { key: 'upcoming', label: 'Upcoming', count: events.filter(e => e.status === 'Upcoming').length },
    { key: 'past', label: 'Past Events', count: events.filter(e => e.status === 'Past').length },
  ];

  const filteredEvents = events.filter(event => {
    switch (activeTab) {
      case 'live': return event.status === 'Live';
      case 'upcoming': return event.status === 'Upcoming';
      case 'past': return event.status === 'Past';
      default: return true;
    }
  });

  function handleAction(type, event) {
    switch (type) {
      case 'publish':
        setEvents(prev => prev.map(e => e.id === event.id ? { ...e, status: 'Live' } : e));
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
          setEvents(prev => prev.filter(e => e.id !== event.id));
        }
        break;
      case 'view':
      case 'edit':
      case 'manage':
      case 'share':
      case 'analytics':
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} event: ${event.title}`);
        break;
      default:
        break;
    }
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
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Host New Event
        </motion.button>
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

      {/* Events Grid */}
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
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
            >
              <Plus className="w-4 h-4" />
              Host New Event
            </button>
          </motion.div>
        ) : (
          filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} onAction={handleAction} />
          ))
        )}
      </div>

      <NewEventModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}