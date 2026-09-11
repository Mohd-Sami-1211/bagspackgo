'use client';
import { useState, useEffect } from 'react';
import { ArrowUpRight, BookmarkCheck, X } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const hideForSession = () => {
    sessionStorage.setItem('hide_pending_booking', 'true');
    setShow(false);
  };

  const stopReminding = () => {
    const pendingStr = localStorage.getItem('pending_booking');
    if (pendingStr) {
      try {
        const pending = JSON.parse(pendingStr);
        pending.ignored = true;
        localStorage.setItem('pending_booking', JSON.stringify(pending));
      } catch (error) {
        console.error('Error updating pending booking', error);
      }
    }
    setShow(false);
  };

  return (
    <div className="pointer-events-none fixed bottom-[5.75rem] left-3 right-3 z-[160] flex justify-center sm:bottom-6 sm:left-auto sm:right-6 sm:justify-end">
      <motion.aside
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        aria-live="polite"
        className="pointer-events-auto relative w-full max-w-[410px] overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#122c26]/95 text-white shadow-[0_24px_70px_-22px_rgba(7,26,21,0.72)] backdrop-blur-xl"
      >
        <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent" />

        <button
          type="button"
          onClick={hideForSession}
          aria-label="Remind me later"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/65 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-4 sm:p-5">
          <div className="flex items-start gap-3.5 pr-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/20 bg-emerald-200/10 text-emerald-200">
              <BookmarkCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 pt-0.5 text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/75">Saved booking</p>
              <h4 className="mt-1 font-serif text-xl leading-tight tracking-[-0.02em] text-white">Your trip is still here</h4>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/62 sm:text-[13px]">
                Continue from where you stopped. Your selections are saved on this device.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={stopReminding}
              className="px-1 py-2 text-xs font-semibold text-white/55 transition hover:text-white"
            >
              Don&apos;t remind me
            </button>
            <a
              href={bookingData.url}
              className="ml-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#dce88b] px-5 text-sm font-bold text-[#17372f] shadow-[0_10px_30px_-14px_rgba(220,232,139,0.85)] transition hover:bg-[#e8f39e] active:scale-[0.98]"
            >
              Continue booking
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
