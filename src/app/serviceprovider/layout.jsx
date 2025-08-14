'use client';
import { motion } from 'framer-motion';
import ProviderNavbar from '@/components/serviceprovider/ProviderNavbar';

export default function ServiceProviderLayout({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-[#F2FFFC] min-h-screen w-full"
    >
      <ProviderNavbar />
      <div className="pt-[80px]">{children}</div>
    </motion.div>
  );
}
