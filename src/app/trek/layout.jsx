'use client';
import { motion } from 'framer-motion';
import PageTransition from '@/components/common/PageTransition';
import { usePathname } from 'next/navigation';
import TrekMainContent from '@/components/home/TrekSection/TrekMainContent';

export default function TrekLayout({ children }) {
  const pathname = usePathname();
  const isGuideListPage = pathname.includes('/trek/guidelist'); // ✅ Correct path check

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`min-h-screen ${!isGuideListPage ? "bg-white/90 bg-[url('/images/hero.svg')] bg-no-repeat" : "bg-white"}`}
    >
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTransition key={pathname}>
          {children}
        </PageTransition>
      </div>

      {!isGuideListPage && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <TrekMainContent />
        </motion.div>
      )}
    </motion.main>
  );
}
