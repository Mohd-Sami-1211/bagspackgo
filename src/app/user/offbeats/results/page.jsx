'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useOffbeatList } from '@/lib/useTripCache';
import OffbeatSearchControls from '@/components/home/OffbeatSection/OffbeatSearchControls';
import { OffbeatDestinationCard, OffbeatEmptyState, OffbeatGridSkeleton } from '@/components/home/OffbeatSection/OffbeatDestinationCard';

const ITEMS_PER_PAGE = 9;

function OffbeatResultsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const search = searchParams.get('search') || '';
    const region = searchParams.get('region') || 'All';
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10));

    const { data, isLoading, isValidating, error } = useOffbeatList(
        { page, limit: ITEMS_PER_PAGE, search, region, sort: 'newest' },
        { keepPreviousData: false }
    );
    const destinations = data?.data || [];
    const pagination = data?.pagination || {};
    const noExactMatch = data?.matchType === 'nearest' || data?.matchType === 'none';
    const suggestedQuery = data?.suggestedQuery || (data?.matchType === 'nearest' ? destinations[0]?.title : null);

    const changePage = (nextPage) => {
        const next = new URLSearchParams(searchParams.toString());
        if (nextPage <= 1) next.delete('page');
        else next.set('page', String(nextPage));
        router.push(`/user/offbeats/results?${next.toString()}`, { scroll: false });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const useSuggestion = () => {
        if (!suggestedQuery) return;
        const next = new URLSearchParams(searchParams.toString());
        next.set('search', suggestedQuery);
        next.delete('page');
        router.push(`/user/offbeats/results?${next.toString()}`, { scroll: false });
    };

    const resultTitle = noExactMatch && search
        ? `We couldn't find “${search}”`
        : search
        ? `Destinations matching “${search}”`
        : region !== 'All'
            ? `${region} destinations`
            : 'Offbeat destinations';

    return (
        <div className="min-h-screen bg-[#f8f6f0] text-[#17372f]">
            <header className="border-b border-[#17372f]/10 bg-[#f8f6f0] px-4 pb-9 pt-[5.1rem] sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-12">
                        <div className="order-2 lg:order-1">
                            <Link href="/user/offbeats" className="mb-5 hidden items-center gap-2 text-sm font-semibold text-[#60716c] transition hover:text-[#17372f] lg:inline-flex"><ArrowLeft className="h-4 w-4" /> Back</Link>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.23em] text-[#9b7440]">Destination results</p>
                            <h1 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-[-0.035em] sm:text-5xl">{resultTitle}</h1>
                            {noExactMatch && search && (
                                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#60716c] sm:text-base">
                                    We could not find an exact destination with that name.
                                </p>
                            )}
                            {noExactMatch && suggestedQuery && (
                                <button type="button" onClick={useSuggestion} className="mt-4 rounded-full border border-[#1d6b55]/15 bg-white px-4 py-2 text-left text-sm text-[#60716c] shadow-sm transition hover:border-[#1d6b55]/30 hover:text-[#17372f]">
                                    Did you mean <span className="font-semibold text-[#1d6b55]">“{suggestedQuery}”</span>?
                                </button>
                            )}
                        </div>
                        <div className="order-1 flex min-w-0 items-start justify-between gap-2 lg:order-2 lg:block">
                            <Link href="/user/offbeats" className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-[#17372f]/15 bg-white px-3 text-sm font-semibold text-[#17372f] shadow-sm transition hover:border-[#17372f]/30 lg:hidden"><ArrowLeft className="h-4 w-4" /> Back</Link>
                            <OffbeatSearchControls light className="min-w-0 flex-1 lg:w-auto lg:max-w-[520px]" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="mx-auto max-w-7xl">
                    {isLoading ? <OffbeatGridSkeleton /> : error ? <OffbeatEmptyState title="Results could not be loaded" text="Please refresh the page and try again." /> : destinations.length === 0 ? <OffbeatEmptyState title="No possible matches yet" text="Try a different destination name or choose another region." /> : (
                        <>
                            {noExactMatch && (
                                <div className="mb-7">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9b7440]">Possible matches</p>
                                    <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em] sm:text-4xl">You may be looking for one of these places</h2>
                                </div>
                            )}
                            <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }} className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${isValidating ? 'opacity-60' : ''}`}>
                                {destinations.map((destination) => <OffbeatDestinationCard key={destination._id} destination={destination} />)}
                            </motion.div>

                            {(pagination.totalPages || 0) > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-3">
                                    <button type="button" disabled={page <= 1 || isValidating} onClick={() => changePage(page - 1)} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#17372f]/15 bg-white px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Previous</button>
                                    <span className="text-sm font-semibold text-[#5e716b]">{page} / {pagination.totalPages}</span>
                                    <button type="button" disabled={!pagination.hasMore || isValidating} onClick={() => changePage(page + 1)} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#17372f] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Next <ArrowRight className="h-4 w-4" /></button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function OffbeatResultsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen animate-pulse bg-[#f8f6f0]" />}>
            <OffbeatResultsContent />
        </Suspense>
    );
}
