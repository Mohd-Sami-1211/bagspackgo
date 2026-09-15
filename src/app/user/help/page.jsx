'use client';
import { Suspense } from 'react';
import HelpMainContent from 'src/components/home/HelpSection/HelpMainContent';

export default function HelpPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center bg-emerald-50/40 text-sm font-semibold text-emerald-700">Loading help content...</div>}>
      <HelpMainContent />
    </Suspense>
  );
}
