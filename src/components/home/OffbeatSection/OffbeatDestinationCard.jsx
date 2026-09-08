'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, MapPin } from 'lucide-react';

const FALLBACK_IMAGE = '/images/hero-kashmir-v3.webp';

export function OffbeatDestinationCard({ destination }) {
    return (
        <motion.article variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } }} className="group overflow-hidden rounded-[1.75rem] border border-[#17372f]/10 bg-white shadow-[0_16px_45px_-32px_rgba(23,55,47,0.5)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_25px_55px_-30px_rgba(23,55,47,0.45)]">
            <Link href={`/user/offbeats/${destination._id}`} className="block">
                <div className="relative h-64 overflow-hidden bg-[#dfe7e1]">
                    <img src={destination.coverPhoto || FALLBACK_IMAGE} alt={destination.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                    <p className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-semibold text-white/90"><MapPin className="h-3.5 w-3.5" /> {destination.destination}, {destination.region}</p>
                </div>
                <div className="p-5 sm:p-6">
                    <h3 className="font-serif text-2xl leading-[1.05] tracking-[-0.025em] text-[#17372f]">{destination.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#60716c]">{destination.shortDescription}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1d6b55]">Explore destination <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </div>
            </Link>
        </motion.article>
    );
}

export function OffbeatGridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse overflow-hidden rounded-[1.75rem] bg-white"><div className="h-64 bg-[#dfe7e1]" /><div className="space-y-3 p-6"><div className="h-7 w-2/3 rounded bg-slate-200" /><div className="h-4 rounded bg-slate-100" /><div className="h-4 w-4/5 rounded bg-slate-100" /></div></div>
            ))}
        </div>
    );
}

export function OffbeatEmptyState({ title, text }) {
    return (
        <div className="rounded-[1.75rem] border border-[#17372f]/10 bg-white px-6 py-20 text-center">
            <Compass className="mx-auto h-10 w-10 text-[#9b7440]" />
            <h3 className="mt-5 font-serif text-3xl tracking-[-0.025em]">{title}</h3>
            <p className="mt-2 text-sm text-[#60716c]">{text}</p>
        </div>
    );
}
