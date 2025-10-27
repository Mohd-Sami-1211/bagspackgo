'use client';
import { Suspense, useState } from 'react';
import Sidebar from 'src/components/serviceprovider/dashboard/Sidebar';
import ProviderNavbar from 'src/components/serviceprovider/dashboard/ProviderNavbar';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <Suspense fallback={<div className="p-6">Loading dashboard…</div>}>
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