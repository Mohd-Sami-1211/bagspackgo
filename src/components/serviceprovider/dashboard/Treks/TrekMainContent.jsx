'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  CreditCard,
  UserCircle2,
  MapPin,
  Clock,
  Mountain,
  TrendingUp,
  Share2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

// Dummy treks data
const treksData = [
  {
    id: 'TR-101',
    name: 'Kashmir Great Lakes Trek',
    location: 'Sonamarg, Kashmir',
    date: '2025-07-15',
    difficulty: 'Moderate',
    days: 7,
    members: 8,
    requestedBy: 'Neha Patel',
    price: 12500,
    status: 'Pending',
    elevation: 13, // in 1000s of feet
  },
  {
    id: 'TR-102',
    name: 'Tarsar Marsar Lake Trek',
    location: 'Pahalgam, Kashmir',
    date: '2025-08-05',
    difficulty: 'Moderate to Difficult',
    days: 6,
    members: 6,
    requestedBy: 'Rahul Verma',
    price: 11000,
    status: 'Scheduled',
    elevation: 13.5,
  },
  {
    id: 'TR-103',
    name: 'Gulmarg Alpine Trek',
    location: 'Gulmarg, Kashmir',
    date: '2025-06-20',
    difficulty: 'Easy',
    days: 4,
    members: 12,
    requestedBy: 'Sanjay Kumar',
    price: 8500,
    status: 'Completed',
    elevation: 9.5,
  },
];

function StatusPill({ status }) {
  const map = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Scheduled: 'bg-emerald-100 text-emerald-800',
    Completed: 'bg-blue-100 text-blue-800',
  };
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
        map[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status}
    </span>
  );
}

// Trek Card Component
function TrekCard({ trek, onAction }) {
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
        {/* Trek Icon */}
        <div className="min-w-[90px] flex-shrink-0">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-tr from-green-50 to-emerald-50 flex items-center justify-center border border-neutral-100">
            <Mountain className="w-10 h-10 text-emerald-600" />
          </div>
        </div>

        {/* Trek Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <h3 className="text-lg md:text-xl font-semibold text-neutral-900 flex items-center gap-3 truncate">
              <span className="truncate">{trek.name}</span>
            </h3>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-neutral-500">{trek.id}</span>
              <StatusPill status={trek.status} />
            </div>
          </div>

          <p className="mt-2 text-sm text-neutral-600 truncate flex items-center gap-1">
            <MapPin className="w-4 h-4 text-emerald-600" /> {trek.location}
          </p>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <div className="truncate">{trek.date}</div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <div>{trek.days} days</div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <div>{trek.members} members</div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <div>{trek.difficulty}</div>
            </div>
          </div>

          {/* Elevation + Price */}
          <div className="mt-3 flex items-center justify-between text-sm text-neutral-600">
            <span>Elevation: {trek.elevation}k ft</span>
            <div className="font-semibold text-emerald-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> ₹{trek.price.toLocaleString()}
            </div>
          </div>

          {/* Actions row */}
          <div className="mt-5 flex items-center gap-3">
            {trek.status === 'Pending' && (
              <>
                <button
                  onClick={() => onAction('approve', trek)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md hover:brightness-95 focus:outline-none"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => onAction('decline', trek)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 focus:outline-none"
                >
                  <XCircle className="w-4 h-4" /> Decline
                </button>
              </>
            )}

            {trek.status === 'Scheduled' && (
              <button
                onClick={() => onAction('cancel', trek)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 focus:outline-none"
              >
                Cancel
              </button>
            )}

            {trek.status === 'Completed' && (
              <>
                <button
                  onClick={() => onAction('feedback', trek)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 focus:outline-none"
                >
                  Feedback
                </button>
                <button
                  onClick={() => onAction('share', trek)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 focus:outline-none"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </>
            )}

            <button
              onClick={() => onAction('details', trek)}
              className="ml-auto text-sm font-medium text-emerald-600 hover:underline"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-100 px-6 py-3 bg-gradient-to-t from-transparent to-white">
        <div className="text-xs text-neutral-500 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <circle cx="5" cy="5" r="5" fill="#10B981" />
            </svg>
            <span>
              {trek.status === 'Pending'
                ? 'Awaiting approval'
                : trek.status === 'Scheduled'
                ? 'Trek scheduled'
                : 'Trek completed'}
            </span>
          </div>
          <div className="ml-auto text-right">
            <span className="font-medium text-neutral-700">Requested by</span>
            <div className="text-xs text-neutral-500">{trek.requestedBy}</div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// Main Trek Component
export default function TrekMainContent() {
  const [filter, setFilter] = useState('All');
  const [treks, setTreks] = useState(treksData);

  const filteredTreks =
    filter === 'All' ? treks : treks.filter((t) => t.status === filter);

  function handleAction(type, trek) {
    if (type === 'approve') {
      setTreks((prev) =>
        prev.map((p) => (p.id === trek.id ? { ...p, status: 'Scheduled' } : p))
      );
    }
    if (type === 'decline') {
      setTreks((prev) =>
        prev.map((p) => (p.id === trek.id ? { ...p, status: 'Declined' } : p))
      );
    }
    if (type === 'cancel') {
      setTreks((prev) =>
        prev.map((p) => (p.id === trek.id ? { ...p, status: 'Cancelled' } : p))
      );
    }
    if (type === 'feedback') {
      alert(`Open feedback for ${trek.name}`);
    }
    if (type === 'share') {
      alert('Share trek dialog');
    }
    if (type === 'details') {
      alert(`Go to details for ${trek.id}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
        <h2 className="text-xl font-semibold">Treks</h2>
        <div className="flex-1" />

        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'Pending', 'Scheduled', 'Completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                filter === f
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {filteredTreks.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-neutral-200 text-center text-neutral-500">
            No treks found
          </div>
        ) : (
          filteredTreks.map((trek) => (
            <TrekCard key={trek.id} trek={trek} onAction={handleAction} />
          ))
        )}
      </div>
    </div>
  );
}
