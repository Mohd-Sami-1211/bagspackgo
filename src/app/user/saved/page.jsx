'use client';
import { Suspense } from 'react';
import SavedMainContent from 'src/components/user/SavedMainContent';

export default function SavedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] justify-center items-center bg-emerald-50/40">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-100 border-t-emerald-600"></div>
      </div>
    }>
      <SavedMainContent />
    </Suspense>
  );
}
