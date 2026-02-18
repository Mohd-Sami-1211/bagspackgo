'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, AlertTriangle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LogoutPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout(); // Calls /api/auth/logout, clears cookie, redirects to /signin
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border p-6 text-center"
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-16 h-16 text-amber-400" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
          Ready to Sign Out?
        </h2>

        {/* Description */}
        <p className="text-sm text-neutral-600 mb-6">
          Are you sure you want to log out? You will need to sign in again to access your account.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition ${isLoggingOut ? 'opacity-70 cursor-not-allowed' : ''
              }`}
          >
            {isLoggingOut ? (
              <svg
                className="animate-spin w-5 h-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Sign Out
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
