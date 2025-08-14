'use client';

export default function NewEventModal({ open, onClose }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-lg">
        <div className="text-lg font-semibold">Host New Event</div>
        <form className="mt-4 grid gap-3">
          <input className="rounded-xl border px-3 py-2" placeholder="Event Title"/>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="rounded-xl border px-3 py-2"/>
            <input type="time" className="rounded-xl border px-3 py-2"/>
          </div>
          <textarea className="rounded-xl border px-3 py-2" placeholder="Description" rows={4}></textarea>
          <div className="flex items-center justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded-xl border">Cancel</button>
            <button className="px-3 py-2 rounded-xl bg-emerald-600 text-white">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
