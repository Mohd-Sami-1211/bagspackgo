'use client';
import { motion } from 'framer-motion';
import Sidebar from '@/components/serviceprovider/dashboard/Sidebar';
import ProfileHeader from '@/components/serviceprovider/dashboard/ProfileHeader';

export default function DashboardPageLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7FBFA]">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen">
          <ProfileHeader />
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 md:p-6"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}