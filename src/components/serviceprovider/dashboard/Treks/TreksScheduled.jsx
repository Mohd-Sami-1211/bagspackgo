'use client';

const items = [
  { id: 'KS-33', title: 'Kashmir Great Lakes', date: '2025-08-22', status: 'Scheduled' },
  { id: 'KS-34', title: 'Tarsar Marsar', date: '2025-08-16', status: 'In Progress' },
];

export default function TreksScheduled({ inprogress = false }){
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