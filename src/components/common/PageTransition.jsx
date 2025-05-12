// src/components/common/PageTransition.jsx
'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PageTransition({ children, keyProp }) {
  const router = useRouter();

  // Optional: Prefetch routes when component mounts
  useEffect(() => {
    const prefetchRoutes = async () => {
      await Promise.all([
        router.prefetch('/trip'),
        router.prefetch('/trek'),
        router.prefetch('/hotels'),
        router.prefetch('/flights'),
        router.prefetch('/merger')
      ]);
    };
    prefetchRoutes();
  }, [router]);

  return (
    <motion.div
      key={keyProp || null}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        duration: 0.3
      }}
    >
      {children}
    </motion.div>
  );
}