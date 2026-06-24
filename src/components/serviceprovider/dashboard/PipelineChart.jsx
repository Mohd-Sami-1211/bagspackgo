'use client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from 'recharts';

function PipelineTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5">
      <div className="text-[11px] text-gray-400 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="text-[11px] font-semibold text-gray-700">
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

export default function PipelineChart({ data = [] }) {
  return (
    <>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -32 }}>
            <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#d1d5db' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#d1d5db' }} axisLine={false} tickLine={false} />
            <Tooltip content={<PipelineTip />} />
            <Bar dataKey="scheduled" name="Confirmed" fill="#a7f3d0" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="pending"   name="Pending"   fill="#e5e7eb" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-200" /> Confirmed
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-gray-200" /> Pending
        </div>
      </div>
    </>
  );
}