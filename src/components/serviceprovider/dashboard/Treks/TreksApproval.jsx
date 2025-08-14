'use client';

const items = [
  { id: 'K-76', title: 'Kedarnath Trek', date: '2025-09-02', slots: 12 },
  { id: 'V-10', title: 'Valley of Flowers', date: '2025-08-29', slots: 10 },
];

export default function TreksApproval(){
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map(it => (
        <div key={it.id} className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-neutral-500">{it.id}</div>
          <div className="font-semibold mt-1">{it.title}</div>
          <div className="text-sm">Starts {it.date} • {it.slots} slots</div>
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 rounded-xl bg-emerald-600 text-white">Approve</button>
            <button className="px-3 py-2 rounded-xl border">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}