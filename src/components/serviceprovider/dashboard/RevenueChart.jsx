'use client';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
} from 'recharts';

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5">
      <div className="text-[11px] text-gray-400 mb-0.5">{label}</div>
      <div className="text-sm font-bold text-gray-900">
        {payload[0].value > 0 ? `₹${payload[0].value}k` : '₹0'}
      </div>
    </div>
  );
}

export default function RevenueChart({ data = [], loading = false }) {
  return (
    <div className={`h-48 transition-opacity duration-200 ${loading ? 'opacity-40' : 'opacity-100'}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: -22 }}>
          <defs>
            <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f3f4f6" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#d1d5db' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 10, fill: '#d1d5db' }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#rg)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}