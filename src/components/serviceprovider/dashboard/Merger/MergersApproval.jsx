'use client';

const items = [
  { id: 'M-301', title: 'Kashmir Backpackers Merge', date: '2025-08-25', members: '8/10' },
  { id: 'M-302', title: 'Uttarakhand Weekend Merge', date: '2025-08-28', members: '5/8' },
];

export default function MergersApproval(){
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map(it => (
        <div key={it.id} className="rounded-2xl border bg-white p-4">
          <div className="text-sm text-neutral-500">{it.id}</div>
          <div className="font-semibold mt-1">{it.title}</div>
          <div className="text-sm">{it.date} • Members {it.members}</div>
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 rounded-xl bg-emerald-600 text-white">Approve</button>
            <button className="px-3 py-2 rounded-xl border">Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}
