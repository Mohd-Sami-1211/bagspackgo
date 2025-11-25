'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, Plus, Edit3, Eye, Trash2, PlayCircle, CheckCircle2, Share2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addCompanyEvent } from 'src/slices/providerCompanySlice';
import axios from 'axios';
// Helper to calculate event status based on date/time & duration
function calculateStatus(event) {
  const now = new Date();
  // Parse event date and time (assuming ISO or compatible format)
  const start = new Date(`${event.date.split('T')[0]}T${event.pickupPoints[0].time}:00`);
  // Calculate end time by adding duration (in hours)
  const end = new Date(start.getTime() + (Number(event.duration) || 0) * 60 * 60 * 1000);

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
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
              <p className="text-sm text-neutral-600">{event.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">{event.eventId}</span>
            <StatusPill status={dynamicStatus} />
          </div>
        </div>

        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">{event.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm text-neutral-600 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{event.date.split('T')[0]} at {event.pickupPoints[0].time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{event.totalSlots} attendees</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{event.duration} hours</span>
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

export default function EventMainContent({companyEvents}) {
  // Get events from redux store
  const [activeTab, setActiveTab] = useState('live');
  const dipatch = useDispatch();
  const currentCompany = useSelector((store)=>store.providerCompany.currentCompany);
  const companyId = currentCompany._id;
  const router = useRouter();
  useEffect(()=>{
    async function fetchDetails(){
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/getCompanyEvents?companyId=${companyId}`);
      const backendMessage = res?.data?.message;
      if(backendMessage=="Events Found"){
        dipatch(addCompanyEvent(res?.data?.data))
      }
    }
    if(companyEvents.length==0){
      fetchDetails();
    }
  },[])

  // Calculate dynamic statuses for UI count and filtering
  const eventsWithDynamicStatus = companyEvents.map(e => ({
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
        // handle publish logic here (e.g. update DB or redux, then UI updates automatically)
        alert(`Publishing event: ${event.title}`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
          // Dispatch redux action or update local copy
          alert(`Deleted event: ${event.title}`);
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

  const handleHostEvent = () => {
    router.push('/serviceprovider/dashboard/events/hostevent');
  };

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
              onClick={handleHostEvent}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
            >
              <Plus className="w-4 h-4" />
              Host New Event
            </button>
          </motion.div>
        ) : (
          filteredEvents.map((event) => (
            <EventCard key={event.eventId} event={event} onAction={handleAction} />
          ))
        )}
      </div>
    </div>
  );
}
