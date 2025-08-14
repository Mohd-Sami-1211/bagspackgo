'use client';

const items = [
  { id: 'T-120', title: 'Srinagar City Delight', date: '2025-08-20', guests: 6 },
  { id: 'T-121', title: 'Pahalgam Lakeside', date: '2025-08-23', guests: 4 },
];

export default function TripsApproval(){
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