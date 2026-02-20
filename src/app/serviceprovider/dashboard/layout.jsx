'use client';
import { Suspense, useState } from 'react';
import Sidebar from 'src/components/serviceprovider/dashboard/Sidebar';
import ProviderNavbar from 'src/components/serviceprovider/dashboard/ProviderNavbar';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const LoadingFallback = (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#FAFAFA] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="text-center relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-20 animate-pulse" />
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center relative z-10">
            <svg className="animate-spin h-8 w-8 text-emerald-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Preparing Dashboard</h3>
          <p className="text-sm text-gray-500 mt-1 font-medium">Loading your services and metrics...</p>
        </div>
      </div>
    </div>
  );

  return (
    <Suspense fallback={LoadingFallback}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-neutral-50"
      >
        <ProviderNavbar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />
        <div className="flex pt-16">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
          <main
            className={`flex-1 overflow-auto transition-all duration-500 ease-in-out  
              ${isSidebarCollapsed ? 'ml-20' : 'ml-72'}`}
          >
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </motion.div>
    </Suspense>
  );
}