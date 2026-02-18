// components/common/Navbar.jsx
'use client';
import Image from 'next/image';
import { CalendarCheck, Headphones, LogIn, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [showSignIn, setShowSignIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowSignIn((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
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

      {/* Right Side Buttons */}
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
          {/* Tooltip (works on hover and tap) */}
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
          {/* Tooltip (works on hover and tap) */}
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-green-700 text-xs px-2 py-[2px] rounded shadow-md opacity-0 group-hover:opacity-100 peer-focus:opacity-100 transition-all duration-200 sm:hidden">
            Help
          </span>
        </div>

        {/* Sign In / Sign Up Animated Button */}
        <a
          href={showSignIn ? '/signin' : '/signup'}
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
        </a>
      </div>
    </nav>
  );
}
