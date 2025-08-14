'use client';
import { Suspense } from 'react';
import HelpMainContent from '@/components/home/HelpSection/HelpMainContent';

export default function HelpPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading help content...</div>}>
      <HelpMainContent />
    </Suspense>
  );
}
