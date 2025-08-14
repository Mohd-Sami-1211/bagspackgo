'use client';
import { useState } from 'react';
import TripsApproval from '@/components/serviceprovider/dashboard/Trips/TripsApproval';
import TripsScheduled from '@/components/serviceprovider/dashboard/Trips/TripsScheduled';

export default function TripsList(){
  const [tab, setTab] = useState('approval');
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        {['approval','scheduled','inprogress'].map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-2 rounded-xl border ${tab===t?'bg-emerald-50 border-emerald-200 text-emerald-700':'bg-white'}`}>{t.replace(/\b\w/g, m=>m.toUpperCase())}</button>
        ))}
      </div>
      {tab==='approval' && <TripsApproval/>}
      {tab==='scheduled' && <TripsScheduled/>}
      {tab==='inprogress' && <TripsScheduled inprogress />}
    </div>
  );
}
