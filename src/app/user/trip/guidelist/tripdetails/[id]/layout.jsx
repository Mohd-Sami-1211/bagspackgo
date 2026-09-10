'use client';
import { motion } from 'framer-motion';

export default function TripDetailsLayout({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen w-full bg-[#f4f3ee]"
    >
      {children}
    </motion.div>
  );
}
