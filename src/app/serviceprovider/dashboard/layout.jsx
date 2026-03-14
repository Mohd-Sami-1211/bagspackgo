'use client';
import { Suspense, useState } from 'react';
import Sidebar from 'src/components/serviceprovider/dashboard/Sidebar';
import ProviderNavbar from 'src/components/serviceprovider/dashboard/ProviderNavbar';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }) {
  // isMobileOpen: controls the slide-in drawer on mobile
  // isDesktopCollapsed: controls collapse/expand on md+ screens
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Navbar hamburger press: toggle drawer on mobile, collapse on desktop
  const handleNavbarToggle = () => {
    setIsMobileOpen(prev => !prev);
    setIsDesktopCollapsed(prev => !prev);
  };

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
          isSidebarCollapsed={isDesktopCollapsed}
          setIsSidebarCollapsed={handleNavbarToggle}
        />

        {/* ── Mobile backdrop: tap outside drawer to close ── */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/50 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className="flex pt-16">
          {/* ── Sidebar ──
              Mobile: off-screen by default (-translate-x-full), slides in when isMobileOpen
              Desktop (md+): always visible, toggling isDesktopCollapsed changes its width  */}
          <div
            className={[
              'fixed top-0 left-0 h-full z-40',
              'transition-transform duration-300 ease-in-out',
              // Mobile: slide in/out
              isMobileOpen ? 'translate-x-0' : '-translate-x-full',
              // Desktop: always visible
              'md:translate-x-0',
            ].join(' ')}
          >
            <Sidebar
              isCollapsed={isDesktopCollapsed}
              setIsCollapsed={setIsDesktopCollapsed}
            />
          </div>

          {/* ── Main content ──
              Mobile: no left margin (sidebar is overlay)
              Desktop: margin matches sidebar width (collapsed or expanded) */}
          <main
            className={[
              'flex-1 overflow-auto transition-all duration-300 ease-in-out',
              'ml-0',
              isDesktopCollapsed ? 'md:ml-20' : 'md:ml-72',
            ].join(' ')}
          >
            <div className="p-3 sm:p-5 md:p-6">
              {children}
            </div>
          </main>
        </div>
      </motion.div>
    </Suspense>
  );
}