'use client';
import { Suspense } from 'react';
import BookingMainContent from 'src/components/home/BookingSection/BookingMainContent';

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] justify-center items-center bg-emerald-50/40">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-100 border-t-emerald-600"></div>
      </div>
    }>
      <BookingMainContent />
    </Suspense>
  );
}
