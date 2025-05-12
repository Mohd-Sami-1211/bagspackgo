// src/app/trek/layout.jsx
'use client';
import { motion } from 'framer-motion';
import SharedLayout from '../SharedLayout';
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
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-16">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center mb-10"
            >
              <div className="mb-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/90 shadow-md"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#28A745"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </motion.div>
              </div>
              
              <motion.h1
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-gray-900 mb-4"
              >
                Discover Amazing Treks
              </motion.h1>
              
              <motion.p
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-gray-700 max-w-2xl mx-auto"
              >
                Find your perfect mountain adventure
              </motion.p>
            </motion.div>

            {/* Page Content with Transition */}
            <PageTransition key={pathname}>
              <div className="flex justify-center px-4">
                {children}
              </div>
            </PageTransition>
          </section>
        </div>
      </motion.main>
    </SharedLayout>
  );
}