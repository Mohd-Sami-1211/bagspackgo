'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';

export default function WelcomePage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/serviceprovider/dashboard');
        }, 4000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="fixed inset-0 z-50 w-full h-[100dvh] flex flex-col items-center justify-center bg-[#F2FFFC] overflow-hidden m-0 p-0">
            {/* Background decorations */}
            <motion.div
                className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-200/50 rounded-full blur-[120px] mix-blend-multiply pointer-events-none"
                animate={{ x: [-50, 50, -50], y: [-50, 50, -50] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
                className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-300/40 rounded-full blur-3xl mix-blend-multiply pointer-events-none"
                animate={{ x: [50, -50, 50], y: [50, -50, 50] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-6 py-4 md:py-12"
            >
                {/* Logo with Glow */}
                <div className="relative mb-10 md:mb-14 flex flex-col items-center justify-center w-full">
                    <motion.div
                        className="absolute bg-emerald-400 rounded-full blur-[80px] opacity-20 w-80 h-40"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
                        transition={{ duration: 5, repeat: Infinity }}
                    />
                    <div className="relative w-64 h-24 sm:w-80 sm:h-28 flex items-center justify-center z-10">
                        <Image src="/images/logo.svg" alt="bagspackgo" fill className="object-contain drop-shadow-sm pointer-events-none" priority />
                    </div>
                </div>

                {/* Animated checkmark */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    className="mb-6 relative flex justify-center"
                >
                    <div className="absolute bg-emerald-200 rounded-full w-20 h-20 blur-xl opacity-50" />
                    <CheckCircle className="w-16 h-16 text-emerald-500 relative z-10 drop-shadow-md" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 tracking-tight text-center"
                >
                    Welcome Aboard!
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="text-lg text-gray-600 mb-12 max-w-md text-center leading-relaxed"
                >
                    Your guide application has been successfully approved! Get ready to manage your trips and grow your business with bagspackgo.
                </motion.p>

                {/* Loader */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-3 h-3 bg-emerald-500 rounded-full"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                        ))}
                    </div>
                    <span className="text-emerald-700 font-semibold tracking-wide text-sm mt-1 uppercase">Loading your dashboard</span>
                </motion.div>
            </motion.div>
        </div>
    );
}
