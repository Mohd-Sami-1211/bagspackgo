'use client';

import { motion } from 'framer-motion';

export default function MergerLayout({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-white"
    >
      <div className="container mx-auto py-8">
        {children}
      </div>
    </motion.div>
  );
}