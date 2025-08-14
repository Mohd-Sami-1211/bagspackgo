'use client';
import NotificationsBell from '@/components/serviceprovider/dashboard/NotificationsBell';

export default function ProfileHeader() {
  return (
    <div className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
          <div>
            <div className="text-sm font-semibold">Wander North Co.</div>
            <div className="text-xs text-neutral-500">Profile completion: <span className="font-medium text-emerald-600">78%</span></div>
          </div>
        </div>
        <NotificationsBell />
      </div>
    </div>
  );
}