'use client';
import { useState } from 'react';
import EventsScheduled from '@/components/serviceprovider/dashboard/Events/EventsScheduled';
import NewEventModal from '@/components/serviceprovider/dashboard/Events/NewEventModal';

export default function EventsList(){
  const [tab, setTab] = useState('inprogress');
  const [open, setOpen] = useState(false);
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['inprogress','scheduled'].map(t => (
            <button key={t} onClick={()=>setTab(t)} className={`px-3 py-2 rounded-xl border ${tab===t?'bg-emerald-50 border-emerald-200 text-emerald-700':'bg-white'}`}>{t.replace(/\b\w/g, m=>m.toUpperCase())}</button>
          ))}
        </div>
        <button onClick={()=>setOpen(true)} className="rounded-xl bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700">Host New Event</button>
      </div>
      <EventsScheduled inprogress={tab==='inprogress'} />
      <NewEventModal open={open} onClose={()=>setOpen(false)} />
    </div>
  );
}
