'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, CreditCard, UserCircle2, MapPin, Clock, Mountain, TrendingUp } from 'lucide-react';

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

// Trek Card Component
function TrekCard({ trek }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="rounded-2xl border bg-white shadow-md p-5 flex flex-col gap-3 hover:shadow-xl"
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

      {/* Trek Name and Location */}
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Mountain className="w-4 h-4 text-green-600" /> {trek.name}
      </h3>
      <div className="text-sm text-neutral-600 flex items-center gap-1">
        <MapPin className="w-4 h-4 text-green-600" /> {trek.location}
      </div>

      {/* Trek Details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-neutral-600">
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

      {/* Elevation and Pricing */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-neutral-600">
          Max Elevation: {trek.elevation}k ft
        </div>
        <div className="font-semibold text-green-700 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> ₹{trek.price.toLocaleString()}
        </div>
      </div>

      {/* Requested By */}
      <div className="text-sm text-neutral-600 flex items-center gap-1">
        <UserCircle2 className="w-4 h-4 text-green-600" /> Requested by {trek.requestedBy}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        {trek.status === 'Pending' && (
          <>
            <button className="px-3 py-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white hover:bg-green-600 transition">
              Approve
            </button>
            <button className="px-3 py-2 rounded-xl border hover:bg-neutral-50 transition">
              Decline
            </button>
          </>
        )}
        {trek.status === 'Scheduled' && (
          <>
            <button className="px-3 py-2 rounded-xl border hover:bg-neutral-50 transition">
              Reschedule
            </button>
            <button className="px-3 py-2 rounded-xl border hover:bg-neutral-50 transition">
              Cancel
            </button>
          </>
        )}
        {trek.status === 'Completed' && (
          <>
            <button className="px-3 py-2 rounded-xl border hover:bg-neutral-50 transition">
              Feedback
            </button>
            <button className="px-3 py-2 rounded-xl border hover:bg-neutral-50 transition">
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
        <h2 className="text-2xl font-bold text-neutral-800">Trek Management</h2>
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
                ? 'bg-green-400 text-white border-green-400'
                : 'bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTreks.map((trek) => (
          <TrekCard key={trek.id} trek={trek} />
        ))}
      </div>
    </div>
  );
}