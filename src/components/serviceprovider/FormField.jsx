'use client';
import { motion } from 'framer-motion';

export default function FormField({ label, hint, error, children, required }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1"
    >
      <label className="text-sm font-medium">{label}{required && <span className="text-rose-500">*</span>}</label>
      {children}
      <div className="text-xs text-neutral-500">{hint}</div>
      {error && <div className="text-xs text-rose-600">{error}</div>}
    </motion.div>
  );
}