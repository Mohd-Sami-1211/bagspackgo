'use client';
import OverviewStats from '@/components/serviceprovider/dashboard/Overview/OverviewStats';
import OverviewGraphs from '@/components/serviceprovider/dashboard/Overview/OverviewGraphs';

export default function DashboardMainContent() {
  return (
    <div className="grid gap-6">
      <OverviewStats />
      <OverviewGraphs />
    </div>
  );
}