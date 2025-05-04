'use client';
import { useState, useEffect } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

export default function AnimatedAuthButton() {
  const [showSignIn, setShowSignIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowSignIn((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
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
  );
}