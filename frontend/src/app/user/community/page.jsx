'use client';
import { Suspense } from 'react';
import CommunityMainContent from 'frontend/src/components/home/CommunitySection/CommunityMainContent';

export default function CommunityPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    }>
      <CommunityMainContent />
    </Suspense>
  );
}