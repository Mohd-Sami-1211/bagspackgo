'use client';
import { useState } from 'react';

// TripsApproval component
function TripsApproval() {
  const items = [
    { id: 'T-120', title: 'Srinagar City Delight', date: '2025-08-20', guests: 6 },
    { id: 'T-121', title: 'Pahalgam Lakeside', date: '2025-08-23', guests: 4 },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map(it => (
        <div key={it.id} className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-neutral-500">{it.id}</div>
          <div className="font-semibold mt-1">{it.title}</div>
          <div className="text-sm">{it.date} • {it.guests} guests</div>
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 rounded-xl bg-emerald-600 text-white">Approve</button>
            <button className="px-3 py-2 rounded-xl border">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// TripsScheduled component
function TripsScheduled({ inprogress = false }) {
  const items = [
    { id: 'TS-90', title: 'Gulmarg Ski Day', date: '2025-08-18', status: 'Scheduled' },
    { id: 'TS-91', title: 'Dal Lake Sunset', date: '2025-08-17', status: 'In Progress' },
  ];
  
  const filtered = items.filter(it => inprogress ? it.status === 'In Progress' : it.status === 'Scheduled');
  
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {filtered.map(it => (
        <div key={it.id} className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-neutral-500">{it.id}</div>
          <div className="font-semibold mt-1">{it.title}</div>
          <div className="text-sm">{it.date} • {it.status}</div>
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 rounded-xl border">Reschedule</button>
            <button className="px-3 py-2 rounded-xl border">Cancel</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Main component
export default function TripMainContent() {
  const [tab, setTab] = useState('approval');
  
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        {['approval','scheduled','inprogress'].map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`px-3 py-2 rounded-xl border ${
              tab === t 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-white'
            }`}
          >
            {t.replace(/\b\w/g, m => m.toUpperCase())}
          </button>
        ))}
      </div>
      
      {tab === 'approval' && <TripsApproval />}
      {tab === 'scheduled' && <TripsScheduled />}
      {tab === 'inprogress' && <TripsScheduled inprogress />}
    </div>
  );
}