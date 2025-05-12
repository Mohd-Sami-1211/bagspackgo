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
    <nav className="flex items-center justify-between px-6 py-4 bg-green-400 shadow-md">
      <div className="flex items-center">
        <a href="/" className="inline-block w-[150px] h-[40px] overflow-hidden relative rounded-3xl bg-white">
          <Image 
            src="/images/logo.svg" 
            alt="Logo" 
            fill 
            className="object-contain" 
            priority 
          />
        </a>
      </div>

      <div className="flex items-center space-x-4 text-white/90 text-[15px] font-semibold">
        <a href="/bookings" className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20 hover:text-black transition-colors">
          <CalendarCheck size={16} />
          Bookings
        </a>
        <a href="/help" className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20 hover:text-black transition-colors">
          <Headphones size={16} />
          Help
        </a>
        
        {/* Exact replica of AnimatedAuthButton */}
        <a
          href={showSignIn ? '/signin' : '/signup'}
          className="relative h-8 w-28 overflow-hidden bg-white text-green-600 rounded hover:bg-green-100 transition-all duration-700 ease-in-out text-sm font-semibold"
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