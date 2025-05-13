'use client';
import { motion } from 'framer-motion';
import TrekSearchInput from '@/components/home/TrekSection/TrekSearchInput';

export default function TrekPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-[80vh] mt-14"
    >
      <TrekSearchInput />
    </motion.div>
  );
}