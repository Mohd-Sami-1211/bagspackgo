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
        ? `No matches found for “${search}”`
        : search
        ? `Results for “${search}”`
        : region !== 'All'
            ? `${region} destinations`
            : 'Offbeat destinations';

    return (
        <div className="min-h-screen bg-[#f8f6f0] text-[#17372f]">
            <header className="border-b border-[#17372f]/10 bg-[#f8f6f0] px-4 pb-8 pt-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <Link href="/user/offbeats" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#60716c] transition hover:text-[#17372f]"><ArrowLeft className="h-4 w-4" /> Back to Offbeats</Link>
                            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.23em] text-[#9b7440]">Destination results</p>
                            <h1 className="font-serif text-4xl leading-none tracking-[-0.035em] sm:text-5xl">{resultTitle}</h1>
                            {noExactMatch && suggestedQuery && (
                                <button type="button" onClick={useSuggestion} className="mt-3 text-left text-sm text-[#60716c] transition hover:text-[#17372f]">
                                    Did you mean <span className="font-semibold text-[#1d6b55]">“{suggestedQuery}”</span>?
                                </button>
                            )}
                        </div>
                        <OffbeatSearchControls light className="lg:max-w-[520px]" />
                    </div>
                </div>
            </header>

            <main className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <div className="mx-auto max-w-7xl">
                    {isLoading ? <OffbeatGridSkeleton /> : error ? <OffbeatEmptyState title="Results could not be loaded" text="Please refresh the page and try again." /> : destinations.length === 0 ? <OffbeatEmptyState title="Try another destination" text="Change the search or choose another region." /> : (
                        <>
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
