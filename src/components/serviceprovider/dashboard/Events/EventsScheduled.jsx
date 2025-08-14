'use client';

const items = [
  { id: 'E-44', title: 'Shikara Parade', date: '2025-08-15', status: 'In Progress' },
  { id: 'E-45', title: 'Himalayan Travel Fair', date: '2025-08-28', status: 'Scheduled' },
];

export default function EventsScheduled({ inprogress = false }){
  const filtered = items.filter(it => inprogress ? it.status === 'In Progress' : it.status === 'Scheduled');
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {filtered.map(it => (
        <div key={it.id} className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-neutral-500">{it.id}</div>
          <div className="font-semibold mt-1">{it.title}</div>
          <div className="text-sm">{it.date} • {it.status}</div>
        </div>
      ))}
    </div>
  );
}
