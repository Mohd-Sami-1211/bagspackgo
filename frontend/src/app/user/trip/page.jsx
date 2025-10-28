'use client';
import { motion } from 'framer-motion';
import TripMainContent from 'src/components/home/TripSection/TripMainContent';

export default function TripPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      <TripMainContent />
    </motion.div>
  );
}
