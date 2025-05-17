'use client';
import { motion } from 'framer-motion';

export default function GuideListLayout({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-[#F2FFFC] min-h-screen pt-[80px] w-full -mt-8"
    >
      {children}
    </motion.div>
  );
}
