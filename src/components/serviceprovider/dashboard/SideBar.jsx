'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, CalendarDays, Mountain, RouteIcon as Route, UsersRound, Settings, Home, Bell } from 'lucide-react';

const items = [
  { href: '/serviceprovider/dashboard', label: 'Overview', icon: Home },
  { href: '/serviceprovider/dashboard/trips', label: 'Trips', icon: Route },
  { href: '/serviceprovider/dashboard/treks', label: 'Treks', icon: Mountain },
  { href: '/serviceprovider/dashboard/mergers', label: 'Mergers', icon: UsersRound },
  { href: '/serviceprovider/dashboard/events', label: 'Events', icon: CalendarDays },
  { href: '/serviceprovider/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 h-screen hidden md:block w-64 border-r bg-white px-3 py-4">
      <div className="mb-6 flex items-center gap-2">
        <div className="h-9 w-9 grid place-items-center rounded-xl bg-emerald-500 text-white font-black">BG</div>
        <div className="font-semibold">Provider Hub</div>
      </div>
      <nav className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-emerald-50 ${active ? 'bg-emerald-50 text-emerald-800' : ''}`}>
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
    </aside>
  );
}
