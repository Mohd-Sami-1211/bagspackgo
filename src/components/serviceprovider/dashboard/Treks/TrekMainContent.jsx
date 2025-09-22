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
    elevation: 13,
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

// Trek Card Component
function TrekCard({ trek }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 120, damping: 12 }}
      className="rounded-2xl border bg-white shadow-md hover:shadow-xl transition-all p-6 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-neutral-500">{trek.id}</span>
        <span
          className={`px-3 py-1 text-xs rounded-full ${
            trek.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-700'
              : trek.status === 'Scheduled'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {trek.status}
        </span>
      </div>

      {/* Trek Name & Location */}
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Mountain className="w-4 h-4 text-green-600" /> {trek.name}
      </h3>
      <p className="text-sm text-neutral-600 flex items-center gap-1">
        <MapPin className="w-4 h-4 text-green-600" /> {trek.location}
      </p>

      {/* Details */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-neutral-600 mt-2">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-green-600" /> {trek.date}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-green-600" /> {trek.days} days
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-green-600" /> {trek.members} members
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-600" /> {trek.difficulty}
        </div>
      </div>

      {/* Elevation & Price */}
      <div className="flex justify-between items-center text-sm text-neutral-700">
        <p>Max Elevation: {trek.elevation}k ft</p>
        <p className="font-semibold text-green-700 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> ₹{trek.price.toLocaleString()}
        </p>
      </div>

      {/* Requested By */}
      <p className="text-sm text-neutral-600 flex items-center gap-1">
        <UserCircle2 className="w-4 h-4 text-green-600" /> Requested by {trek.requestedBy}
      </p>

      {/* Actions */}
      <div className="flex gap-3 mt-3">
        {trek.status === 'Pending' && (
          <>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:opacity-90 transition">
              Approve
            </button>
            <button className="px-4 py-2 rounded-xl border hover:bg-neutral-50 transition">
              Decline
            </button>
          </>
        )}
        {trek.status === 'Scheduled' && (
          <button className="px-4 py-2 rounded-xl border hover:bg-neutral-50 transition">
            Cancel
          </button>
        )}
        {trek.status === 'Completed' && (
          <>
            <button className="px-4 py-2 rounded-xl border hover:bg-neutral-50 transition">
              Feedback
            </button>
            <button className="px-4 py-2 rounded-xl border hover:bg-neutral-50 transition">
              Share
            </button>
          </>
        )}
        <button className="ml-auto text-green-600 font-medium hover:underline">
          View Details
        </button>
      </div>
    </motion.div>
  );
}

// Main Component
export default function TrekMainContent() {
  const [filter, setFilter] = useState('All');

  const filteredTreks =
    filter === 'All' ? treksData : treksData.filter((t) => t.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-neutral-800">Trek Management</h2>
        <p className="text-neutral-600">Manage and review all trekking requests</p>
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-3">
        {['All', 'Pending', 'Scheduled', 'Completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl border transition ${
              filter === f
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredTreks.map((trek) => (
          <TrekCard key={trek.id} trek={trek} />
        ))}
      </div>
    </div>
  );
}
