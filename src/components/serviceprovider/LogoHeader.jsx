'use client';
import { motion } from 'framer-motion';

export default function LogoHeader() {
  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="h-14 w-14 rounded-2xl bg-emerald-500 text-white grid place-items-center font-black text-xl">BG</div>
      <div className="text-xl font-semibold">Service Provider Application</div>
      <p className="text-sm text-neutral-600 text-center max-w-xl">Join BagspackGo and reach travelers who love authentic, local experiences. Tell us a bit about your company to get started.</p>
    </motion.div>
  );
}