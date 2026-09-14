'use client';
import { motion } from 'framer-motion';

export default function HelpLayout({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen w-full bg-gradient-to-b from-emerald-50/60 via-white to-slate-50"
    >
      {children}
    </motion.div>
  );
}
