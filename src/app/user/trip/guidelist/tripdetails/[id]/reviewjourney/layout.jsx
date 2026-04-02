'use client';
import { motion } from 'framer-motion';

export default function ReviewJourneyLayout({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-green-50 to-blue-50 min-h-screen pt-[80px] w-full -mt-20"
    >
      {children}
    </motion.div>
  );
}