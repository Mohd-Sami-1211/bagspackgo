import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, CreditCard, UserCircle2, MapPin, Clock, Share2, CheckCircle2, XCircle } from 'lucide-react';

const tripsData = [
  {
    id: 'T-120',
    destination: 'Srinagar City Delight',
    date: '2025-08-20',
    category: 'Individual',
    days: 5,
    members: 2,
    requestedBy: 'Arjun Mehta',
    price: 18000,
    status: 'Pending',
  },
  {
    id: 'T-121',
    destination: 'Pahalgam Lakeside',
    date: '2025-08-23',
    category: 'Couple',
    days: 3,
    members: 1,
    requestedBy: 'Riya Sharma',
    price: 24000,
    status: 'Scheduled',
  },
  {
    id: 'T-122',
    destination: 'Gulmarg Ski Adventure',
    date: '2025-08-15',
    category: 'Couple',
    days: 4,
    members: 2,
    requestedBy: 'Kabir Khan',
    price: 30000,
    status: 'Completed',
  },
];

function StatusPill({ status }) {
  const map = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Scheduled: 'bg-emerald-100 text-emerald-800',
    Completed: 'bg-blue-100 text-blue-800',
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

function TripCard({ trip, onAction }) {
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
              <path d="M12 2C14.7614 2 17 4.23858 17 7C17 11.25 12 18 12 18C12 18 7 11.25 7 7C7 4.23858 9.23858 2 12 2Z" stroke="#059669" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <h3 className="text-lg md:text-xl font-semibold text-neutral-900 flex items-center gap-3 truncate">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="truncate">{trip.destination}</span>
            </h3>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-neutral-500">{trip.id}</span>
              <StatusPill status={trip.status} />
            </div>
          </div>

          <p className="mt-2 text-sm text-neutral-600 truncate">Requested by <span className="font-medium text-neutral-800">{trip.requestedBy}</span></p>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <div className="truncate">{trip.date}</div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <div>{trip.days} days</div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <div>{trip.members} {trip.category}</div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <div className="font-semibold text-emerald-700">₹{trip.price.toLocaleString()}</div>
            </div>
          </div>

          {/* Actions row */}
          <div className="mt-5 flex items-center gap-3">
            {trip.status === 'Pending' && (
              <>
                <button
                  onClick={() => onAction('approve', trip)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-md hover:brightness-95 focus:outline-none"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>

                <button
                  onClick={() => onAction('decline', trip)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 focus:outline-none"
                >
                  <XCircle className="w-4 h-4" /> Decline
                </button>
              </>
            )}

            {trip.status === 'Scheduled' && (
              <>
                <button
                  onClick={() => onAction('cancel', trip)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 focus:outline-none"
                >
                  Cancel
                </button>
              </>
            )}

            {trip.status === 'Completed' && (
              <>
                <button
                  onClick={() => onAction('feedback', trip)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 focus:outline-none"
                >
                  Feedback
                </button>

                <button
                  onClick={() => onAction('share', trip)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-medium hover:bg-neutral-50 focus:outline-none"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </>
            )}

            <button
              onClick={() => onAction('details', trip)}
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
            <span>{trip.status === 'Pending' ? 'Awaiting approval' : trip.status === 'Scheduled' ? 'Trip scheduled' : 'Trip completed'}</span>
          </div>
          <div className="ml-auto text-right">
            <span className="font-medium text-neutral-700">Requested on</span>
            <div className="text-xs text-neutral-500">{trip.date}</div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function TripMainContent() {
  const [filter, setFilter] = useState('All');
  const [trips, setTrips] = useState(tripsData);

  const filteredTrips = filter === 'All' ? trips : trips.filter((t) => t.status === filter);

  function handleAction(type, trip) {
    if (type === 'approve') {
      setTrips((prev) => prev.map((p) => (p.id === trip.id ? { ...p, status: 'Scheduled' } : p)));
    }
    if (type === 'decline') {
      setTrips((prev) => prev.map((p) => (p.id === trip.id ? { ...p, status: 'Declined' } : p)));
    }
    if (type === 'cancel') {
      setTrips((prev) => prev.map((p) => (p.id === trip.id ? { ...p, status: 'Cancelled' } : p)));
    }
    if (type === 'feedback') {
      alert(`Open feedback for ${trip.destination}`);
    }
    if (type === 'share') {
      alert('Share dialog');
    }
    if (type === 'details') {
      alert(`Go to details for ${trip.id}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
        <h2 className="text-xl font-semibold">Trips</h2>
        <div className="flex-1" />

        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'Pending', 'Scheduled', 'Completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                filter === f ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {filteredTrips.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-neutral-200 text-center text-neutral-500">No trips found</div>
        ) : (
          filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onAction={handleAction} />
          ))
        )}
      </div>
    </div>
  );
}
