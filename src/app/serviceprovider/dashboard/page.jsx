'use client';
import { Suspense } from 'react';
import DashboardMainContent from '@/components/serviceprovider/dashboard/DashboardMainContent';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading dashboard…</div>}>
      <DashboardMainContent />
    </Suspense>
  );
}