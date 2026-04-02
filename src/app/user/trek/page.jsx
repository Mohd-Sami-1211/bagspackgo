'use client';
import { motion } from 'framer-motion';
import TrekMainContent from 'src/components/home/TrekSection/TrekMainContent';

export default function TrekPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      <TrekMainContent />
    </motion.div>
  );
}
