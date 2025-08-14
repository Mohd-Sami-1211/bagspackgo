'use client';

import { motion } from 'framer-motion';
import MergerMainContent from '@/components/home/MergerSection/MergerMainContent';
export default function MergerPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      <MergerMainContent />
    </motion.div>
  );
}