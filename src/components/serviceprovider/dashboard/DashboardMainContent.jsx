'use client';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Data for charts
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

// Sub-components
function OverviewStats() {
  const cards = [
    { label: 'Total Bookings (30d)', value: 128, sub: '+12% vs last month' },
    { label: 'Approval Queue', value: 5, sub: '2 Trips • 2 Treks • 1 Merger' },
    { label: 'Avg. Rating', value: '4.7', sub: 'based on 186 reviews' },
    { label: 'Earnings (30d)', value: '₹ 2,48,500', sub: '+18% vs last month' },
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, index) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-xl border bg-white p-4 hover:shadow-sm transition-all duration-300"
        >
          <div className="text-xs text-neutral-500">{c.label}</div>
          <div className="mt-2 text-xl font-semibold">{c.value}</div>
          <div className="text-xs text-emerald-700 mt-1">{c.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}

function OverviewGraphs() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="rounded-xl border bg-white p-4 lg:col-span-2">
        <div className="text-sm font-medium mb-2">Earnings (₹k) — last 5 months</div>
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
      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm font-medium mb-2">Pipeline</div>
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

// Main Dashboard Component
export default function DashboardMainContent() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 -mt-3"
        >
          <h1 className="text-2xl font-bold text-green-700">Dashboard Overview</h1>
          <p className="text-neutral-600">Welcome back! Here's what's happening with your business today.</p>
        </motion.div>
        
        <div className="grid gap-6">
          <OverviewStats />
          <OverviewGraphs />
          
          {/* Additional content sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-white p-4">
              <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
              <div className="space-y-3">
                {[
                  { action: 'New booking', detail: 'Trek to Himalayas', time: '2 hours ago' },
                  { action: 'Payment received', detail: '₹12,500 from Rahul S.', time: '5 hours ago' },
                  { action: 'Review added', detail: '5 stars for Beach Trip', time: '1 day ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center mt-1">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-sm text-neutral-600">{activity.detail}</p>
                      <p className="text-xs text-neutral-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="rounded-xl border bg-white p-4">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Create Trip', color: 'bg-blue-500' },
                  { label: 'Add Trek', color: 'bg-emerald-500' },
                  { label: 'Manage Bookings', color: 'bg-amber-500' },
                  { label: 'View Calendar', color: 'bg-purple-500' },
                ].map((action, index) => (
                  <button
                    key={index}
                    className={`p-3 rounded-lg text-white text-sm font-medium ${action.color} hover:opacity-90 transition-opacity`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}