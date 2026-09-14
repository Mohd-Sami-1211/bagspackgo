import React, { Suspense } from 'react';
import NotificationsContent from '@/components/user/NotificationsContent';

export default function NotificationsPage() {
  return (
    <Suspense fallback={
       <div className="flex min-h-[70vh] justify-center items-center bg-emerald-50/40">
         <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-100 border-t-emerald-600"></div>
       </div>
    }>
      <NotificationsContent />
    </Suspense>
  );
}
