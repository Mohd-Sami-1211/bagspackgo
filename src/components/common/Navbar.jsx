// components/common/Navbar.jsx
'use client';
import Image from 'next/image';
import { CalendarCheck, Headphones, LogIn, UserPlus, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

// Get initials from name: "Mohd Samiullah" → "MS"
function getInitials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return words[0][0].toUpperCase();
}

export default function Navbar() {
  const [showSignIn, setShowSignIn] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isAuthenticated, loading, logout, openAuthModal } = useAuth();
  const dropdownRef = useRef(null);

  // Only treat as "user authenticated" if the role is 'user' (not provider/admin)
  const isUserAccount = isAuthenticated && user?.role === 'user';
  const isProviderAccount = isAuthenticated && user?.role === 'provider';

  // Animate Sign In / Sign Up toggle (only when not logged in as user)
  useEffect(() => {
    if (isUserAccount) return;
    const interval = setInterval(() => {
      setShowSignIn((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, [isUserAccount]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-green-300 shadow-md px-3 sm:px-6 py-3 flex items-center justify-between relative">

      {/* Logo Section */}
      <a
        href="/"
        className="inline-block w-[110px] sm:w-[150px] h-[35px] sm:h-[40px] overflow-hidden relative rounded-3xl bg-white flex-shrink-0"
      >
        <Image
          src="/images/logo.svg"
          alt="Logo"
          fill
          className="object-contain"
          priority
        />
      </a>

      {/* Right Side */}
      <div className="flex items-center space-x-3 sm:space-x-4 text-white/90 text-[14px] sm:text-[15px] font-semibold relative">

        {/* Bookings */}
        <div className="relative group flex items-center justify-center">
          <a
            href="/user/bookings"
            className="peer flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20 hover:text-black transition-colors"
          >
            <CalendarCheck size={18} />
            <span className="hidden sm:inline">Bookings</span>
          </a>
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-green-700 text-xs px-2 py-[2px] rounded shadow-md opacity-0 group-hover:opacity-100 peer-focus:opacity-100 transition-all duration-200 sm:hidden">
            Bookings
          </span>
        </div>

        {/* Help */}
        <div className="relative group flex items-center justify-center">
          <a
            href="/user/help"
            className="peer flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20 hover:text-black transition-colors"
          >
            <Headphones size={18} />
            <span className="hidden sm:inline">Help</span>
          </a>
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-green-700 text-xs px-2 py-[2px] rounded shadow-md opacity-0 group-hover:opacity-100 peer-focus:opacity-100 transition-all duration-200 sm:hidden">
            Help
          </span>
        </div>

        {/* ─── Auth Section ─── */}
        {loading ? (
          // Loading skeleton
          <div className="w-24 h-8 bg-white/30 rounded animate-pulse" />
        ) : isProviderAccount ? (
          // 🟡 Logged in as PROVIDER — show provider pill, not a user account
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 bg-white text-amber-600 rounded-full px-3 py-1 hover:bg-amber-50 transition-colors text-sm font-semibold border border-amber-200"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Provider</span>
              <ChevronDown size={12} className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-52 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Provider Account</p>
                  <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{user.username}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email || user.phone}</p>
                </div>
                {/* Go to Dashboard / Application */}
                <a
                  href={user?.applicationStatus === 'approved' ? "/serviceprovider/dashboard" : "/serviceprovider"}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <LayoutDashboard size={16} />
                  {user?.applicationStatus === 'approved' ? 'Go to Dashboard' : 'Complete Application'}
                </a>
                {/* Logout */}
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : isUserAccount ? (
          // ✅ Logged in as USER — show initials + name + dropdown
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 bg-white text-green-700 rounded-full p-1 hover:bg-green-50 transition-colors"
            >
              {/* Initials Circle */}
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                {getInitials(user.username)}
              </div>
              <ChevronDown size={14} className={`mr-1 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-48 z-50 overflow-hidden">
                {/* User info */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.username}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email || user.phone}</p>
                </div>
                {/* Logout */}
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          // ❌ Not logged in — show Sign In / Sign Up toggle
          <button
            onClick={() => openAuthModal()}
            className="relative h-8 w-24 sm:w-28 overflow-hidden bg-white text-green-600 rounded hover:bg-green-100 transition-all duration-700 ease-in-out text-sm font-semibold flex-shrink-0"
          >
            <div
              className="absolute top-0 left-0 w-full transition-transform duration-700"
              style={{ transform: `translateY(${showSignIn ? '0%' : '-50%'})` }}
            >
              <div className="flex items-center justify-center gap-1 h-8">
                <LogIn size={14} />
                <span>Sign In</span>
              </div>
              <div className="flex items-center justify-center gap-1 h-8">
                <UserPlus size={14} />
                <span>Sign Up</span>
              </div>
            </div>
          </button>
        )}
      </div>
    </nav>
  );
}
