'use client';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ServiceProviderLayout({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until auth check is complete
    if (loading) return;

    // If not authenticated, redirect to sign-in
    if (!isAuthenticated) {
      router.replace('/signin');
      return;
    }

    // If authenticated but not a provider, redirect to user dashboard
    if (user?.role !== 'provider') {
      router.replace('/user/trip');
      return;
    }
  }, [loading, isAuthenticated, user, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2FFFC]">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-emerald-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-emerald-600 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authorized (redirect is happening)
  if (!isAuthenticated || user?.role !== 'provider') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-[#F2FFFC] min-h-screen pt-[80px] w-full -mt-20"
    >
      {children}
    </motion.div>
  );
}