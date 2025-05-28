'use client';
import EventMainContent from '@/components/home/EventSection/EventMainContent';
import { motion } from 'framer-motion';

export default function EventsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      <EventMainContent />
    </motion.div>
  );
}