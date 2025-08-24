'use client';
import { Suspense, useState } from 'react';
import DashboardMainContent from '@/components/serviceprovider/dashboard/DashboardMainContent';
import Sidebar from '@/components/serviceprovider/dashboard/Sidebar';
import ProviderNavbar from '@/components/serviceprovider/dashboard/ProviderNavbar';

export default function DashboardPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <Suspense fallback={<div className="p-6">Loading dashboard…</div>}>
      <div className="min-h-screen bg-neutral-50">
        <ProviderNavbar 
          isSidebarCollapsed={isSidebarCollapsed} 
          setIsSidebarCollapsed={setIsSidebarCollapsed} 
        />
        <div className="flex">
          <Sidebar 
            isCollapsed={isSidebarCollapsed} 
            setIsCollapsed={setIsSidebarCollapsed} 
          />
          <main
            className={`flex-1 overflow-auto transition-all duration-500 ease-in-out  
              ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`} 
          >
            <div className="p-2 mt-4">
              <DashboardMainContent />
            </div>
          </main>
        </div>
      </div>
    </Suspense>
  );
}
