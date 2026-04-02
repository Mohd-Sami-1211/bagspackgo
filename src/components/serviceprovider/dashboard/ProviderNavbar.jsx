'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import NotificationPanel from './NotificationPanel';

export default function ProviderNavbar({ isSidebarCollapsed, setIsSidebarCollapsed, onMobileToggle }) {
  return (
    <header className="bg-green-300 shadow-md flex-shrink-0 sticky top-0 z-30">
      <div className="mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile Sidebar toggle */}
          <button
            onClick={onMobileToggle}
            className="md:hidden p-2 mr-2 rounded-md text-white hover:bg-white/20 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Sidebar toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:block p-2 mr-2 rounded-md text-white hover:bg-white/20 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/serviceprovider/dashboard" className="inline-block w-[110px] sm:w-[150px] h-[35px] sm:h-[40px] overflow-hidden relative rounded-3xl bg-white flex-shrink-0">
            <Image
              src="/images/logo.svg"
              alt="bagspackgo"
              fill
              className="object-contain"
              priority
            />
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
