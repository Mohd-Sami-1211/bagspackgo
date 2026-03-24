'use client';
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function PendingBookingNotification() {
  const [show, setShow] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    // Run on mount
    const checkPending = () => {
      try {
        const pendingStr = localStorage.getItem('pending_booking');
        if (!pendingStr) return;

        const pending = JSON.parse(pendingStr);
        if (pending.ignored) return;

        // If user is currently on the trip details page for the same booking, don't show the notification
        // Note: URL parsing might differ, we'll try to match exact paths or generic tripdetails 
        const currentPath = window.location.pathname;
        const pendingPath = new URL(pending.url, window.location.origin).pathname;
        if (currentPath === pendingPath || currentPath.includes('/tripdetails/')) {
           return;
        }

        // Check session storage if they hit Later
        if (sessionStorage.getItem('hide_pending_booking')) return;

        setBookingData(pending);
        setShow(true);

        // --- 24-hours Notification Logic ---
        const hoursPassed = Math.floor((Date.now() - pending.timestamp) / (1000 * 60 * 60));
        const notificationCount = pending.notificationCount || 0;
        const cycles = Math.floor(hoursPassed / 24);
        
        if (cycles > notificationCount) {
           const notificationsStr = localStorage.getItem('user_notifications') || '[]';
           let notifications = JSON.parse(notificationsStr);
           for (let i = notificationCount + 1; i <= cycles; i++) {
              notifications.unshift({
                 id: Date.now() + i,
                 title: 'Complete Your Booking',
                 message: 'You have a pending booking waiting to be completed. Access it here.',
                 url: pending.url,
                 date: new Date(pending.timestamp + (i * 24 * 60 * 60 * 1000)).toISOString(),
                 read: false
              });
           }
           localStorage.setItem('user_notifications', JSON.stringify(notifications));
           
           pending.notificationCount = cycles;
           localStorage.setItem('pending_booking', JSON.stringify(pending));
        }

      } catch (err) {
        console.error("Error reading pending booking", err);
      }
    };

    const t = setTimeout(checkPending, 800);
    return () => clearTimeout(t);
  }, []);

  if (!show || !bookingData) return null;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-auto right-4 sm:right-6 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white border border-emerald-500/30 rounded-2xl shadow-[0_20px_50px_-5px_max(rgba(16,185,129,0.3))] p-4 sm:p-5 max-w-sm w-full relative overflow-hidden flex flex-col ring-4 ring-emerald-50">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
        <div className="flex items-start gap-3">
          <div className="bg-emerald-50 p-2 rounded-xl mt-0.5 border border-emerald-100">
             <AlertCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex flex-col flex-1 pr-6">
            <h4 className="text-[15px] font-extrabold text-gray-900 tracking-tight leading-none mb-1">Pending Booking!</h4>
            <p className="text-[13px] font-semibold text-gray-500 leading-snug">
              You left a booking incomplete. Would you like to resume where you left off?
            </p>
          </div>
        </div>
        
        <div className="mt-5 flex items-center justify-between gap-3">
           <button
             onClick={() => {
                const pendingStr = localStorage.getItem('pending_booking');
                if (pendingStr) {
                   const pending = JSON.parse(pendingStr);
                   pending.ignored = true;
                   localStorage.setItem('pending_booking', JSON.stringify(pending));
                }
                setShow(false);
             }}
             className="flex-1 py-2 px-3 text-xs font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-xl transition-colors border border-gray-100"
           >
             Ignore
           </button>
           <button
             onClick={() => {
                sessionStorage.setItem('hide_pending_booking', 'true');
                setShow(false);
             }}
             className="flex-1 py-2 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-100"
           >
             Later
           </button>
           <a
             href={bookingData.url}
             className="flex-1 py-2 px-3 text-center text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm shadow-emerald-200"
           >
             Resume
           </a>
        </div>
      </div>
    </div>
  );
}
