'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Compass, MapPin } from 'lucide-react';
import { useOffbeatList } from '@/lib/useTripCache';
import OffbeatSearchControls from '@/components/home/OffbeatSection/OffbeatSearchControls';
import { OffbeatDestinationCard, OffbeatEmptyState, OffbeatGridSkeleton } from '@/components/home/OffbeatSection/OffbeatDestinationCard';

const SLIDE_INTERVAL = 5000;
const FALLBACK_IMAGE = '/images/hero-kashmir-v3.webp';

export default function OffbeatsLandingPage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [region, setRegion] = useState('All');
    const pointerStart = useRef(0);
    const { data: featuredData, isLoading: featuredLoading } = useOffbeatList(
        { featured: true, region, page: 1, limit: 24, sort: 'popular' },
        { dedupingInterval: 0, keepPreviousData: false, revalidateIfStale: true }
    );
    const { data: latestData, isLoading: latestLoading, error } = useOffbeatList(
        { region, page: 1, limit: 24, sort: 'newest' },
        { keepPreviousData: false }
    );
    const selectedFeatured = featuredData?.data || [];
    const destinations = latestData?.data || [];
    const featuredIds = new Set(selectedFeatured.map((destination) => destination._id));
    const allSelectedFeatured = [
        ...selectedFeatured,
        ...destinations.filter((destination) => destination.featured && !featuredIds.has(destination._id)),
    ];
    const featured = allSelectedFeatured.length > 0
        ? allSelectedFeatured
        : region !== 'All'
            ? destinations.slice(0, 1)
            : [];
    const heroLoading = featuredLoading || (region !== 'All' && selectedFeatured.length === 0 && latestLoading);
    const noDestinationsForRegion = region !== 'All' && !latestLoading && !error && destinations.length === 0;
    const activeFeatured = featured[currentSlide];

    useEffect(() => setCurrentSlide(0), [region]);

    useEffect(() => {
        if (currentSlide >= featured.length) setCurrentSlide(0);
    }, [currentSlide, featured.length]);

    useEffect(() => {
        if (featured.length <= 1) return undefined;
        const timer = window.setInterval(() => {
            setCurrentSlide((current) => (current + 1) % featured.length);
        }, SLIDE_INTERVAL);
        return () => window.clearInterval(timer);
    }, [featured.length]);

    const finishSwipe = (event) => {
        if (featured.length <= 1) return;
        const end = event.clientX ?? event.changedTouches?.[0]?.clientX ?? pointerStart.current;
        const distance = end - pointerStart.current;
        if (Math.abs(distance) < 45) return;
        setCurrentSlide((current) => distance < 0
            ? (current + 1) % featured.length
            : (current - 1 + featured.length) % featured.length);
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8f6f0] text-[#17372f]">
            {noDestinationsForRegion ? (
                <section className="relative min-h-[520px] bg-[#f8f6f0] px-4 pb-14 pt-[5.1rem] sm:px-6 lg:px-8">
                    <Suspense fallback={null}>
                        <OffbeatSearchControls light region={region} onRegionChange={setRegion} className="mx-auto max-w-7xl" />
                    </Suspense>
                    <div className="mx-auto mt-16 max-w-7xl">
                        <OffbeatEmptyState title="More destinations are coming" text={`Our next hidden gems from ${region} will appear here soon.`} />
                    </div>
                </section>
            ) : (
            <section
                className="relative isolate min-h-[610px] overflow-hidden bg-[#0f1014] text-white lg:min-h-[680px]"
                onMouseDown={(event) => { pointerStart.current = event.clientX; }}
                onMouseUp={finishSwipe}
                onTouchStart={(event) => { pointerStart.current = event.touches[0].clientX; }}
                onTouchEnd={finishSwipe}
            >
                {heroLoading && !activeFeatured && <div className="absolute inset-0 animate-pulse bg-[#17191d]" />}

                {activeFeatured && (
                    <AnimatePresence mode="wait">
                        <motion.div key={activeFeatured._id} initial={{ opacity: 0, scale: 1.025 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0">
                            <img src={activeFeatured.coverPhoto || FALLBACK_IMAGE} alt="" className="h-full w-full object-cover" draggable={false} onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
                        </motion.div>
                    </AnimatePresence>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/60 to-[#0f1014]/35 md:hidden" />
                <div
                    className="absolute inset-0 hidden md:block"
                    style={{ background: 'linear-gradient(90deg, rgba(15,16,20,0.78) 0%, rgba(15,16,20,0.48) 27%, rgba(15,16,20,0.14) 48%, transparent 66%)' }}
                />
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 via-black/10 to-transparent" />

                <Suspense fallback={null}>
                    <OffbeatSearchControls region={region} onRegionChange={setRegion} className="absolute right-4 top-[5.1rem] z-40 sm:right-6 lg:right-10" />
                </Suspense>

                {activeFeatured ? (
                    <div className="relative z-20 mx-auto flex min-h-[610px] max-w-7xl items-end px-4 pb-12 pt-44 sm:px-6 sm:pb-16 md:items-center md:pb-8 lg:min-h-[680px] lg:px-8">
                        <AnimatePresence mode="wait">
                            <motion.div key={`copy-${activeFeatured._id}`} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.45 }} className="max-w-xl">
                                <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#d9bd86]"><Compass className="h-4 w-4" /> Featured offbeat</p>
                                <h1 className="font-serif text-5xl leading-[0.94] tracking-[-0.045em] sm:text-6xl lg:text-7xl">{activeFeatured.title}</h1>
                                <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-white/80"><MapPin className="h-4 w-4 text-[#d9bd86]" /> {activeFeatured.destination}, {activeFeatured.region}</p>
                                <p className="mt-5 max-w-lg text-sm leading-6 text-white/75 sm:text-base">{activeFeatured.shortDescription}</p>
                                <Link href={`/user/offbeats/${activeFeatured._id}`} className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#17372f] shadow-xl transition hover:-translate-y-0.5 hover:bg-white/90">Explore & book <ArrowRight className="h-4 w-4" /></Link>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                ) : !heroLoading && (
                    <div className="relative z-20 mx-auto flex min-h-[610px] max-w-7xl items-end px-4 pb-20 pt-44 sm:px-6 md:items-center lg:min-h-[680px] lg:px-8">
                        <div className="max-w-xl"><p className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[#d9bd86]">Offbeats</p><h1 className="font-serif text-5xl leading-[0.96] tracking-[-0.04em] sm:text-6xl">Find the places maps rarely mention.</h1><p className="mt-5 text-white/70">Select featured destinations from the admin dashboard to present them here.</p></div>
                    </div>
                )}

                {featured.length > 1 && (
                    <div className="absolute bottom-6 right-5 z-30 flex gap-2 sm:right-8">
                        {featured.map((item, index) => <button key={item._id} type="button" onClick={() => setCurrentSlide(index)} aria-label={`Show ${item.title}`} className={`h-1.5 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/45 hover:bg-white/75'}`} />)}
                    </div>
                )}
            </section>
            )}

            {!noDestinationsForRegion && <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 border-b border-[#17372f]/10 pb-7">
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9b7440]">Explore quietly extraordinary places</p>
                        <h2 className="font-serif text-4xl leading-none tracking-[-0.035em] sm:text-5xl">{region === 'All' ? 'More offbeat destinations' : `${region} destinations`}</h2>
                    </div>
                    {latestLoading ? <OffbeatGridSkeleton /> : error ? <OffbeatEmptyState title="Destinations could not be loaded" text="Please refresh the page and try again." /> : destinations.length === 0 ? <OffbeatEmptyState title="More destinations are coming" text="Our next hidden gems will appear here soon." /> : (
                        <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {destinations.map((destination) => <OffbeatDestinationCard key={destination._id} destination={destination} />)}
                        </motion.div>
                    )}
                </div>
            </section>}
        </div>
    );
}
