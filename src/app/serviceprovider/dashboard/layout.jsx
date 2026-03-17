'use client';
import { Suspense, useState, useEffect } from 'react';
import Sidebar from 'src/components/serviceprovider/dashboard/Sidebar';
import ProviderNavbar from 'src/components/serviceprovider/dashboard/ProviderNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Flash mobile drawer on first load to draw attention
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasFlashed = sessionStorage.getItem('providerSidebarFlashed');
      // md breakpoint is 768px in Tailwind
      if (!hasFlashed && window.innerWidth < 768) {
        // Wait a short moment after mounting
        const showTimer = setTimeout(() => {
          setIsMobileOpen(true);
          
          // Close it after a brief flash
          const hideTimer = setTimeout(() => {
            setIsMobileOpen(false);
            sessionStorage.setItem('providerSidebarFlashed', 'true');
          }, 1200);
          
          return () => clearTimeout(hideTimer);
        }, 800);
        
        return () => clearTimeout(showTimer);
      }
    }
  }, []);

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
      <div className="min-h-screen bg-neutral-50 flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-shrink-0 z-20">
          <Sidebar
            isCollapsed={isDesktopCollapsed}
            setIsCollapsed={setIsDesktopCollapsed}
          />
        </div>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobileOpen && (
            <>
              <motion.div
                key="mobile-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div
                key="mobile-drawer"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 h-full z-50 md:hidden flex"
              >
                <Sidebar
                  isCollapsed={false}
                  setIsCollapsed={setIsDesktopCollapsed}
                  onClose={() => setIsMobileOpen(false)}
                  isMobile={true}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden z-10">
          {/* Top Navbar */}
          <ProviderNavbar
             isSidebarCollapsed={isDesktopCollapsed}
             setIsSidebarCollapsed={setIsDesktopCollapsed}
             onMobileToggle={() => setIsMobileOpen(true)}
          />

          <main className="flex-1 overflow-auto p-4 sm:p-5 md:p-6 pb-20 md:pb-6 relative w-full">
            {children}
          </main>
        </div>
      </div>
    </Suspense>
  );
}