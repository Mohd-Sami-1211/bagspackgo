'use client';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import NotificationPanel from './NotificationPanel';

export default function ProviderNavbar({ isSidebarCollapsed, setIsSidebarCollapsed }) {
  return (
    <header className="bg-green-300 backdrop-blur border-b fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          {/* Sidebar toggle */}
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
          {/* Live notification bell + panel */}
          <NotificationPanel />
        </nav>
      </div>
    </header>
  );
}
