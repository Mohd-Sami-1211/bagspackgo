import React, { Suspense } from 'react';
import NotificationsContent from '@/components/user/NotificationsContent';

export default function NotificationsPage() {
  return (
    <Suspense fallback={
       <div className="flex justify-center items-center h-64">
         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
       </div>
    }>
      <NotificationsContent />
    </Suspense>
  );
}
