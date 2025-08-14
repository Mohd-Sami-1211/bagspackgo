'use client';

export default function OverviewStats() {
  const cards = [
    { label: 'Total Bookings (30d)', value: 128, sub: '+12% vs last month' },
    { label: 'Approval Queue', value: 5, sub: '2 Trips • 2 Treks • 1 Merger' },
    { label: 'Avg. Rating', value: '4.7', sub: 'based on 186 reviews' },
    { label: 'Earnings (30d)', value: '₹ 2,48,500', sub: '+18% vs last month' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border bg-white p-4 hover:shadow-sm transition">
          <div className="text-xs text-neutral-500">{c.label}</div>
          <div className="mt-2 text-2xl font-semibold">{c.value}</div>
          <div className="text-xs text-emerald-700 mt-1">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}