'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, MapPin, Clock, CheckCircle2, XCircle, Share2, UserCircle2 } from 'lucide-react';

// Data arrays
const mergersData = [
  {
    id: 'M-301',
    title: 'Kashmir Backpackers Merge',
    date: '2025-08-25',
    members: '8/10',
    destination: 'Srinagar, Kashmir',
    days: 5,
    requestedBy: 'Adventure Seekers Group',
    category: 'Backpackers',
    status: 'Pending',
  },
  {
    id: 'M-302',
    title: 'Uttarakhand Weekend Merge',
    date: '2025-08-28',
    members: '5/8',
    destination: 'Rishikesh, Uttarakhand',
    days: 3,
    requestedBy: 'Weekend Warriors',
    category: 'Weekend Trip',
    status: 'Pending',
  },
  {
    id: 'MS-10',
    title: 'Dal Lake Group',
    date: '2025-08-19',
    status: 'Scheduled',
    destination: 'Dal Lake, Srinagar',
    days: 4,
    requestedBy: 'Lake Lovers Society',
    category: 'Group Tour',
    members: '10/10',
  },
  {
    id: 'MS-11',
    title: 'Auli Snow Buddies',
    date: '2025-08-15',
    status: 'In Progress',
    destination: 'Auli, Uttarakhand',
    days: 6,
    requestedBy: 'Snow Adventure Club',
    category: 'Ski Trip',
    members: '7/8',
  },
];

function StatusPill({ status }) {
  const map = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Scheduled: 'bg-emerald-100 text-emerald-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Completed: 'bg-green-100 text-green-800',
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

function MergerCard({ merger, onAction }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ translateY: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.06)' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full rounded-2xl bg-gradient-to-br from-white via-white to-neutral-50 border border-neutral-100 shadow-sm overflow-hidden"
    >
      {/* Hero area */}
      <div className="flex gap-4 p-6 md:p-8 items-start">
        <div className="min-w-[90px] flex-shrink-0">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-tr from-green-50 to-emerald-50 flex items-center justify-center border border-neutral-100">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M17 20H7C4.79086 20 3 18.2091 3 16V8C3 5.79086 4.79086 4 7 4H17C19.2091 4 21 5.79086 21 8V16C21 18.2091 19.2091 20 17 20Z" stroke="#059669" strokeWidth="1.2"/>
              <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="#10B981" strokeWidth="1.2"/>
              <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="#10B981"/>
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <h3 className="text-lg md:text-xl font-semibold text-neutral-900 flex items-center gap-3 truncate">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="truncate">{merger.title}</span>
            </h3>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-neutral-500">{merger.id}</span>
              <StatusPill status={merger.status} />
            </div>
          </div>

          <p className="mt-2 text-sm text-neutral-600 truncate">
            Requested by <span className="font-medium text-neutral-800">{merger.requestedBy}</span>
          </p>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <div className="truncate">{merger.date}</div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <div>{merger.days} days</div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <div>{merger.members} members</div>
            </div>
            <div className="flex items-center gap-2">
              <UserCircle2 className="w-4 h-4" />
              <div className="truncate">{merger.category}</div>
            </div>
          </div>

          {/* Actions row */}
          <div className="mt-5 flex items-center gap-3">
            {merger.status === 'Pending' && (
              <>
                <button
                  onClick={() => onAction('approve', merger)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md hover:brightness-95 focus:outline-none"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>

                <button
                  onClick={() => onAction('reject', merger)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 focus:outline-none"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </>
            )}

            {merger.status === 'Scheduled' && (
              <>
                <button
                  onClick={() => onAction('reschedule', merger)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 focus:outline-none"
                >
                  Reschedule
                </button>

                <button
                  onClick={() => onAction('cancel', merger)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 focus:outline-none"
                >
                  Cancel
                </button>
              </>
            )}

            {merger.status === 'In Progress' && (
              <>
                <button
                  onClick={() => onAction('update', merger)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium shadow-md hover:brightness-95 focus:outline-none"
                >
                  Update Progress
                </button>

                <button
                  onClick={() => onAction('share', merger)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 focus:outline-none"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </>
            )}

            <button
              onClick={() => onAction('details', merger)}
              className="ml-auto text-sm font-medium text-emerald-600 hover:underline"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Footer with subtle divider */}
      <div className="border-t border-neutral-100 px-6 py-3 bg-gradient-to-t from-transparent to-white">
        <div className="text-xs text-neutral-500 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <circle cx="5" cy="5" r="5" fill="#10B981" />
            </svg>
            <span>
              {merger.status === 'Pending' ? 'Awaiting approval' : 
               merger.status === 'Scheduled' ? 'Merge scheduled' : 
               merger.status === 'In Progress' ? 'Merge in progress' : 'Merge completed'}
            </span>
          </div>
          <div className="ml-auto text-right">
            <span className="font-medium text-neutral-700">Destination</span>
            <div className="text-xs text-neutral-500">{merger.destination}</div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function MergerMainContent() {
  const [activeTab, setActiveTab] = useState('approval');
  const [mergers, setMergers] = useState(mergersData);

  // Filter mergers based on active tab
  const filteredMergers = mergers.filter(merger => {
    switch (activeTab) {
      case 'approval':
        return merger.status === 'Pending';
      case 'scheduled':
        return merger.status === 'Scheduled';
      case 'inprogress':
        return merger.status === 'In Progress';
      default:
        return true;
    }
  });

  function handleAction(type, merger) {
    if (type === 'approve') {
      setMergers(prev => prev.map(m => m.id === merger.id ? { ...m, status: 'Scheduled' } : m));
    }
    if (type === 'reject') {
      setMergers(prev => prev.map(m => m.id === merger.id ? { ...m, status: 'Rejected' } : m));
    }
    if (type === 'cancel') {
      setMergers(prev => prev.map(m => m.id === merger.id ? { ...m, status: 'Cancelled' } : m));
    }
    if (type === 'reschedule') {
      alert(`Reschedule merger: ${merger.title}`);
    }
    if (type === 'update') {
      alert(`Update progress for: ${merger.title}`);
    }
    if (type === 'share') {
      alert(`Share merger: ${merger.title}`);
    }
    if (type === 'details') {
      alert(`View details for: ${merger.title}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
        <h2 className="text-xl font-semibold">Mergers</h2>
        <div className="flex-1" />

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'approval', label: 'Approval', count: mergers.filter(m => m.status === 'Pending').length },
            { key: 'scheduled', label: 'Scheduled', count: mergers.filter(m => m.status === 'Scheduled').length },
            { key: 'inprogress', label: 'In Progress', count: mergers.filter(m => m.status === 'In Progress').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition flex items-center gap-2 ${
                activeTab === tab.key 
                  ? 'bg-emerald-500 text-white border-emerald-500' 
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-neutral-100'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {filteredMergers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 rounded-xl border border-dashed border-neutral-200 text-center text-neutral-500"
          >
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-neutral-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-neutral-400" />
            </div>
            No mergers found in {activeTab.replace(/\b\w/g, m => m.toUpperCase())}
          </motion.div>
        ) : (
          filteredMergers.map((merger) => (
            <MergerCard key={merger.id} merger={merger} onAction={handleAction} />
          ))
        )}
      </div>
    </div>
  );
}