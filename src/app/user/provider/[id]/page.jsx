import React, { Suspense, use } from 'react';
import ProviderProfileContent from '@/components/user/ProviderProfileContent';

export default function ProviderProfilePage({ params }) {
  const { id } = use(params);

  return (
    <Suspense fallback={
       <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
         <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
         <p className="text-gray-500 text-sm font-medium animate-pulse">Loading profile...</p>
       </div>
    }>
      <ProviderProfileContent providerId={id} />
    </Suspense>
  );
}
