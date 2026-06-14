'use client';

import { useState, useEffect } from 'react';
import { RefreshCcw, AlertTriangle, WifiOff } from 'lucide-react';

export default function ErrorPage({ message = 'Something went wrong.', onRetry }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial status
    setIsOffline(!navigator.onLine);

    const handleOffline = () => setIsOffline(true);
    const handleOnline  = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online',  handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online',  handleOnline);
    };
  }, []);

  const icon    = isOffline ? WifiOff : AlertTriangle;
  const heading = isOffline ? "You're offline"     : 'Something went wrong';
  const subtext = isOffline ? 'Check your internet connection and try again.' : message;
  const hint    = isOffline ? 'Waiting for connection...' : 'This might be a network issue or a temporary server error.';

  const Icon = icon;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 bg-gray-50">

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 max-w-md w-full flex flex-col items-center">

        {/* Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border ${
          isOffline
            ? 'bg-amber-50 border-amber-100'
            : 'bg-red-50 border-red-100'
        }`}>
          <Icon size={40} className={isOffline ? 'text-amber-400' : 'text-red-400'} />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{heading}</h2>

        {/* Message */}
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto mb-2">
          {subtext}
        </p>

        <p className="text-gray-400 text-xs mb-8 flex items-center gap-1.5">
          <WifiOff size={12} />
          {hint}
        </p>

        {/* Retry button — hide when offline since there's no point retrying */}
        {onRetry && !isOffline && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-sm transition-all"
          >
            <RefreshCcw size={16} />
            Retry
          </button>
        )}

        {/* When back online — show retry */}
        {onRetry && isOffline && (
          <button
            disabled
            className="flex items-center gap-2 px-8 py-3 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed"
          >
            <WifiOff size={16} />
            Waiting for connection
          </button>
        )}

        {/* Fallback */}
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
        >
          Or refresh the page
        </button>

      </div>
    </div>
  );
}