'use client';
import { motion } from 'framer-motion';
import SharedLayout from '../SharedLayout';
import TrekMainContent from '@/components/home/TrekSection/TrekMainContent';
import PageTransition from '@/components/common/PageTransition';
import { usePathname } from 'next/navigation';

export default function TrekLayout({ children }) {
  const pathname = usePathname();

  return (
    <SharedLayout>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-[#F2FFFC] bg-[url('/images/hero.svg')] bg-no-repeat min-h-screen"
      >
        {/* Children (constrained width) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageTransition key={pathname}>
            {children}
          </PageTransition>
        </div>

        {/* Full-width sections (no max-w container) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TrekMainContent /> {/* Now handles its own width */}
        </motion.div>
      </motion.main>
    </SharedLayout>
  );
}