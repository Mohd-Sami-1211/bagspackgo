'use client';
import { motion } from 'framer-motion';

export default function HelpLayout({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-gradient-to-br from-green-50 to-blue-50 min-h-screen pt-[80px] w-full "
    >
      {children}
    </motion.div>
  );
}
