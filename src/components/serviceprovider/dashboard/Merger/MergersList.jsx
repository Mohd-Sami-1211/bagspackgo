'use client';
import { useState } from 'react';
import MergersApproval from '@/components/serviceprovider/dashboard/Merger/MergersApproval';
import MergersScheduled from '@/components/serviceprovider/dashboard/Merger/MergersScheduled';

export default function MergersList(){
  const [tab, setTab] = useState('approval');
  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        {['approval','scheduled','inprogress'].map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-3 py-2 rounded-xl border ${tab===t?'bg-emerald-50 border-emerald-200 text-emerald-700':'bg-white'}`}>{t.replace(/\b\w/g, m=>m.toUpperCase())}</button>
        ))}
      </div>
      {tab==='approval' && <MergersApproval/>}
      {tab==='scheduled' && <MergersScheduled/>}
      {tab==='inprogress' && <MergersScheduled inprogress />}
    </div>
  );
}
