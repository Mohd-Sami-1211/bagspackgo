'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Bookmark,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  Compass,
  Headphones,
  LayoutDashboard,
  LogIn,
  LogOut,
  Plane,
  UserCheck,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const primaryLinks = [
  { label: 'Trips', href: '/user/trip', icon: Plane },
  { label: 'Offbeats', href: '/user/offbeats', icon: Compass },
  { label: 'Events', href: '/user/events', icon: CalendarDays },
  { label: 'Companion', href: '/user/companion', icon: UserCheck },
];

function getInitials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : words[0][0].toUpperCase();
}

function PrimaryLinks({ pathname, mobile = false, overlay = false }) {
  return (
    <div className={mobile ? 'grid grid-cols-4' : 'flex items-center gap-1'}>
      {primaryLinks.map((item) => {
        const Icon = item.icon;
        const isActive = pathname?.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={
              mobile
                ? `flex min-w-0 flex-col items-center gap-1 border-b-2 px-1 py-2.5 text-[11px] font-bold transition-colors ${
                    isActive
                      ? overlay
                        ? 'border-[#ffd45c] bg-white/10 text-white'
                        : 'border-emerald-600 bg-emerald-50/70 text-emerald-800'
                      : overlay
                        ? 'border-transparent text-white/70 hover:text-white'
                        : 'border-transparent text-slate-500 hover:text-emerald-700'
                  }`
                : `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                    isActive
                      ? overlay
                        ? 'bg-white/15 text-white backdrop-blur-md'
                        : 'bg-emerald-50 text-emerald-800'
                      : overlay
                        ? 'text-white/75 hover:bg-white/10 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
                  }`
            }
          >
            <Icon size={mobile ? 17 : 16} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isAuthenticated, loading, logout, openAuthModal } = useAuth();
  const dropdownRef = useRef(null);

  const isUserAccount = isAuthenticated && user?.role === 'user';
  const isProviderAccount = isAuthenticated && user?.role === 'provider';
  const isLanding = pathname === '/' || pathname === '/user/trip';

  useEffect(() => {
    setShowDropdown(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className={`z-[100] w-full ${isLanding ? 'absolute left-0 top-0 border-b border-white/15 bg-transparent text-white' : 'sticky top-0 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl'}`}>
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link
              href="/"
              className="relative h-10 w-[128px] shrink-0 overflow-hidden rounded-full bg-white sm:w-[150px]"
              aria-label="bagspackgo home"
            >
              <Image src="/images/logo.svg" alt="bagspackgo" fill priority className="object-contain" />
            </Link>

            <div className="hidden md:block">
              <PrimaryLinks pathname={pathname} overlay={isLanding} />
            </div>

            <div className="relative flex shrink-0 items-center" ref={dropdownRef}>
              {loading ? (
                <div className="h-9 w-24 animate-pulse rounded-full bg-slate-100" />
              ) : isProviderAccount ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDropdown((open) => !open)}
                    className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700 transition-colors hover:bg-amber-100"
                  >
                    <LayoutDashboard size={15} />
                    <span className="hidden sm:inline">Provider</span>
                    <ChevronDown size={13} className={showDropdown ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-2xl">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">Provider account</p>
                        <p className="mt-1 truncate text-sm font-bold text-slate-900">{user.username}</p>
                        <p className="truncate text-xs text-slate-500">{user.email || user.phone}</p>
                      </div>
                      <Link
                        href={user?.applicationStatus === 'approved' ? '/serviceprovider/dashboard' : '/serviceprovider'}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                      >
                        <LayoutDashboard size={16} />
                        {user?.applicationStatus === 'approved' ? 'Go to dashboard' : 'Complete application'}
                      </Link>
                      <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} /> Log out
                      </button>
                    </div>
                  )}
                </>
              ) : isUserAccount ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDropdown((open) => !open)}
                    className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 p-1 text-emerald-800 transition-colors hover:bg-emerald-100"
                    aria-label="Open account menu"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-extrabold text-white">
                      {getInitials(user.username)}
                    </span>
                    <ChevronDown size={14} className={`mr-1 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-2xl">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="truncate text-sm font-bold text-slate-900">{user.username}</p>
                        <p className="truncate text-xs text-slate-500">{user.email || user.phone}</p>
                      </div>
                      <div className="border-b border-slate-100 py-1">
                        <AccountLink href="/user/bookings" icon={CalendarCheck}>Bookings</AccountLink>
                        <AccountLink href="/user/saved" icon={Bookmark}>Saved</AccountLink>
                        <AccountLink href="/user/notifications" icon={Bell}>Notifications</AccountLink>
                        <AccountLink href="/user/help" icon={Headphones}>Help</AccountLink>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDropdown(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} /> Log out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={openAuthModal}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold shadow-sm transition-all sm:px-5 ${isLanding ? 'bg-white text-[#173e35] hover:-translate-y-0.5 hover:bg-white/90' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}
                >
                  <LogIn size={16} />
                  <span>Sign in</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </nav>

      <div className="fixed bottom-3 left-3 right-3 z-[110] overflow-hidden rounded-2xl border border-white/20 bg-[#17372f]/80 px-1 shadow-[0_10px_35px_rgba(10,33,28,0.28)] backdrop-blur-xl md:hidden">
        <PrimaryLinks pathname={pathname} mobile overlay />
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-950">Log out?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">You can sign back in whenever you are ready to plan again.</p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AccountLink({ href, icon: Icon, children }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-emerald-700">
      <Icon size={16} /> {children}
    </Link>
  );
}
