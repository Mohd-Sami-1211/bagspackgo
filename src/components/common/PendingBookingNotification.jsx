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
        if (currentPath === pendingPath || currentPath.includes('/tripdetails/') || currentPath.includes('/trekdetails/') || currentPath.includes('/eventdetails/')) {
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
    <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 sm:left-auto sm:right-6 pointer-events-none z-[9999] flex justify-center sm:justify-end px-4 sm:px-0 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-5 w-full max-w-[340px] sm:max-w-sm relative overflow-hidden flex flex-col pointer-events-auto">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
             <AlertCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex flex-col flex-1 pr-1 text-left">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">Pending Booking</h4>
            <p className="text-xs font-medium text-slate-500 leading-snug">
              You left a booking incomplete. Would you like to resume where you left off?
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-end gap-2">
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
             className="cursor-pointer py-1.5 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
           >
             Ignore
           </button>
           <button
             onClick={() => {
                sessionStorage.setItem('hide_pending_booking', 'true');
                setShow(false);
             }}
             className="cursor-pointer py-1.5 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
           >
             Later
           </button>
           <a
             href={bookingData.url}
             className="cursor-pointer py-1.5 px-3 text-center text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
           >
             Resume
           </a>
        </div>
      </div>
    </div>
  );
}
