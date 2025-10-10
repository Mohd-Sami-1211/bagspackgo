'use client';

import { motion } from 'framer-motion';

export default function MergerLayout({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white"
    >
      {children}
    </motion.main>
  );
}