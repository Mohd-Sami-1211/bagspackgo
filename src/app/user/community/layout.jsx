'use client';
import { motion } from 'framer-motion';

export default function CommunityLayout({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50"
    >
      {children}
    </motion.div>
  );
}