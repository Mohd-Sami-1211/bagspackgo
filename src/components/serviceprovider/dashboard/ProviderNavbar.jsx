'use client';
import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';

export default function ProviderNavbar({ isSidebarCollapsed, setIsSidebarCollapsed }) {
  return (
    <header className="bg-green-300 backdrop-blur border-b fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          {/* Sidebar toggle button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 mr-2 rounded-md hover:bg-white/50 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/serviceprovider/dashboard" className="flex items-center gap-2">
            <div className="relative h-9 w-32">
              <img
                src="/images/logo.svg"
                alt="bagspackgo"
                className="object-contain rounded-2xl"
              />
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-xl bg-white/70 hover:bg-neutral-100 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] grid place-items-center bg-emerald-500 text-white rounded-full">3</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
