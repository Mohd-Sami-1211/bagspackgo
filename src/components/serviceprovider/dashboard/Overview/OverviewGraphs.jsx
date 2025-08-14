'use client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const earnings = [
  { name: 'Apr', value: 120 },
  { name: 'May', value: 155 },
  { name: 'Jun', value: 140 },
  { name: 'Jul', value: 190 },
  { name: 'Aug', value: 220 },
];

const pipeline = [
  { name: 'Trips', scheduled: 12, pending: 3 },
  { name: 'Treks', scheduled: 8, pending: 2 },
  { name: 'Mergers', scheduled: 5, pending: 1 },
  { name: 'Events', scheduled: 2, pending: 0 },
];

export default function OverviewGraphs() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="rounded-2xl border bg-white p-4 md:col-span-2">
        <div className="text-sm font-medium">Earnings (₹k) — last 5 months</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={earnings}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-2xl border bg-white p-4">
        <div className="text-sm font-medium">Pipeline</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipeline}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="scheduled" fill="#34D399" radius={[6,6,0,0]} />
              <Bar dataKey="pending" fill="#A7F3D0" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}