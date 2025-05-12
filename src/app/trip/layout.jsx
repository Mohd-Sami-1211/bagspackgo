// src/app/trip/layout.jsx
'use client';
import { motion } from 'framer-motion';
import SharedLayout from '../SharedLayout';
import MainContent from '@/components/common/MainContent';
import LowerMain from "@/components/common/LowerMain";
import PageTransition from '@/components/common/PageTransition';
import { usePathname } from 'next/navigation';

export default function TripLayout({ children }) {
  const pathname = usePathname();

  return (
    <SharedLayout>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-[#F2FFFC] bg-[url('/images/hero.svg')] bg-no-repeat min-h-screen"
      >
        <div className="max-w-7xl mx-auto">
          {/* Page Content with Transition */}
          <PageTransition key={pathname}>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </PageTransition>

          {/* Animated Sections */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <MainContent />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <LowerMain />
          </motion.div>
        </div>
      </motion.main>
    </SharedLayout>
  );
}