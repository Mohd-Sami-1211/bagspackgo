'use client';
import { useState } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="relative p-2 rounded-xl hover:bg-neutral-100">
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] grid place-items-center bg-rose-500 text-white rounded-full">2</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border bg-white shadow">
          <div className="p-3 text-sm border-b">Notifications</div>
          <ul className="max-h-72 overflow-auto text-sm">
            <li className="px-3 py-2 hover:bg-neutral-50">2 trips awaiting approval</li>
            <li className="px-3 py-2 hover:bg-neutral-50">Payment for Trek #482 received</li>
            <li className="px-3 py-2 hover:bg-neutral-50">Merger room M-103 reached capacity</li>
          </ul>
        </div>
      )}
    </div>
  );
}
