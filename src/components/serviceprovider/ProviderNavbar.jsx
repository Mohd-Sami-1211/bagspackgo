'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bell, UserRound } from 'lucide-react';

export default function ProviderNavbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b"
    >
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-white font-black">BG</span>
          <span className="font-semibold">BagspackGo • Providers</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/serviceprovider" className="text-sm hover:opacity-80">Apply</Link>
          <Link href="/serviceprovider/dashboard" className="text-sm hover:opacity-80">Dashboard</Link>
          <button className="relative p-2 rounded-xl hover:bg-neutral-100">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 text-[10px] grid place-items-center bg-emerald-500 text-white rounded-full">3</span>
          </button>
          <button className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200">
            <UserRound className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </motion.header>
  );
}
