'use client';
import { Suspense } from 'react';
import BookingMainContent from 'frontend/src/components/home/BookingSection/BookingMainContent';

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <BookingMainContent />
    </Suspense>
  );
}