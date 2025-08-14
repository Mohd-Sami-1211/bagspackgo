'use client';
import OverviewStats from './overview/OverviewStats';
import OverviewGraphs from './overview/OverviewGraphs';

export default function DashboardMainContent() {
  return (
    <div className="grid gap-6">
      <OverviewStats />
      <OverviewGraphs />
    </div>
  );
}