'use client';
import { motion } from 'framer-motion';

export default function ReviewJourneyLayout({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full bg-[#f5f8f6]"
    >
      {children}
    </motion.div>
  );
}
