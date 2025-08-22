'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Bell, 
  BarChart3, 
  CalendarDays, 
  Mountain, 
  UsersRound, 
  Settings, 
  Home,
  Menu,
  X,UserRound
} from 'lucide-react';
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

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={()=>setOpen(v=>!v)} className="relative p-2 rounded-xl hover:bg-neutral-100 transition-colors">
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] grid place-items-center bg-rose-500 text-white rounded-full">2</span>
      </button>
      {open && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-72 rounded-xl border bg-white shadow-lg z-50"
        >
          <div className="p-3 text-sm border-b font-medium">Notifications</div>
          <ul className="max-h-72 overflow-auto text-sm">
            <li className="px-3 py-2 hover:bg-neutral-50 transition-colors">2 trips awaiting approval</li>
            <li className="px-3 py-2 hover:bg-neutral-50 transition-colors">Payment for Trek #482 received</li>
            <li className="px-3 py-2 hover:bg-neutral-50 transition-colors">Merger room M-103 reached capacity</li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}

function ProfileHeader() {
  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
          <div>
            <div className="text-sm font-semibold">Wander North Co.</div>
            <div className="text-xs text-neutral-500">Profile completion: <span className="font-medium text-emerald-600">78%</span></div>
          </div>
        </div>
        <NotificationsBell />
      </div>
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = [
    { href: '/serviceprovider/dashboard', label: 'Overview', icon: Home },
    { href: '/serviceprovider/dashboard/trips', label: 'Trips', icon: BarChart3 },
    { href: '/serviceprovider/dashboard/treks', label: 'Treks', icon: Mountain },
    { href: '/serviceprovider/dashboard/mergers', label: 'Mergers', icon: UsersRound },
    { href: '/serviceprovider/dashboard/events', label: 'Events', icon: CalendarDays },
    { href: '/serviceprovider/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-md"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-64 border-r bg-white px-3 py-4 z-40 transform transition-transform duration-300 md:relative md:left-0 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 grid place-items-center rounded-xl bg-emerald-500 text-white font-black">BG</div>
            <div className="font-semibold">Provider Hub</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link 
                key={href} 
                href={href} 
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-emerald-50 transition-colors ${active ? 'bg-emerald-50 text-emerald-800' : ''}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 rounded-xl border bg-neutral-50 p-3">
          <div className="text-xs text-neutral-600">Notifications</div>
          <div className="mt-2 flex items-center gap-2 text-sm"><Bell className="h-4 w-4"/> 3 new this week</div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

function ProviderNavbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-white font-black">BG</span>
          <span className="font-semibold hidden sm:inline">BagspackGo • Providers</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/serviceprovider" className="text-sm hover:opacity-80 hidden sm:block">Apply</Link>
          <Link href="/serviceprovider/dashboard" className="text-sm hover:opacity-80 hidden sm:block">Dashboard</Link>
          <button className="relative p-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] grid place-items-center bg-emerald-500 text-white rounded-full">3</span>
          </button>
          <button className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors">
            <UserRound className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </header>
  );
}

// Main Dashboard Component
export default function DashboardMainContent() {
  return (
    <div className="min-h-screen bg-neutral-50 -mt-24">
      <ProviderNavbar />
      
      <div className="flex pt-16">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          <ProfileHeader />
          
          <div className="p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold">Dashboard Overview</h1>
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
        </main>
      </div>
    </div>
  );
}