'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronDown, Loader2, MapPin, Search, X } from 'lucide-react';
import { useOffbeatSuggestions } from '@/lib/useTripCache';

const FALLBACK_IMAGE = '/images/hero-kashmir-v3.webp';
const REGIONS = ['All', 'Kashmir', 'Jammu', 'Chenab Valley'];

export default function OffbeatSearchControls({ className = '', region: selectedRegion, onRegionChange, light = false }) {
    const router = useRouter();
    const pathname = usePathname();
    const currentParams = useSearchParams();
    const currentSearch = currentParams.get('search') || '';
    const currentRegion = selectedRegion || currentParams.get('region') || 'All';
    const [draftSearch, setDraftSearch] = useState(currentSearch);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [regionOpen, setRegionOpen] = useState(false);
    const controlsRef = useRef(null);

    useEffect(() => setDraftSearch(currentSearch), [currentSearch]);

    useEffect(() => {
        const timeout = window.setTimeout(() => setDebouncedSearch(draftSearch.trim()), 280);
        return () => window.clearTimeout(timeout);
    }, [draftSearch]);

    useEffect(() => {
        const close = (event) => {
            if (!controlsRef.current?.contains(event.target)) {
                setShowSuggestions(false);
                setSearchOpen(false);
                setRegionOpen(false);
            }
        };
        document.addEventListener('pointerdown', close);
        return () => document.removeEventListener('pointerdown', close);
    }, []);

    const { data, isLoading } = useOffbeatSuggestions(
        showSuggestions ? debouncedSearch : '',
        { region: currentRegion }
    );
    const suggestions = data?.suggestions || [];

    const navigateToResults = (updates) => {
        const next = pathname === '/user/offbeats/results'
            ? new URLSearchParams(currentParams.toString())
            : new URLSearchParams();

        next.delete('sort');
        if (pathname !== '/user/offbeats/results' && currentRegion !== 'All') {
            next.set('region', currentRegion);
        }

        Object.entries(updates).forEach(([key, value]) => {
            if (!value || value === 'All') next.delete(key);
            else next.set(key, value);
        });
        next.delete('page');

        const hasASelection = Boolean(next.get('search') || next.get('region'));
        router.push(hasASelection ? `/user/offbeats/results?${next.toString()}` : '/user/offbeats');
    };

    const submitSearch = (event) => {
        event.preventDefault();
        if (!searchOpen && window.innerWidth < 640) {
            setSearchOpen(true);
            return;
        }
        setShowSuggestions(false);
        setSearchOpen(false);
        navigateToResults({ search: draftSearch.trim() });
    };

    const chooseSuggestion = (suggestion) => {
        setDraftSearch(suggestion.title);
        setShowSuggestions(false);
        setSearchOpen(false);
        navigateToResults({ search: suggestion.title });
    };

    const changeRegion = (value) => {
        setRegionOpen(false);
        if (onRegionChange) {
            onRegionChange(value);
            return;
        }
        navigateToResults({ region: value });
    };

    const surfaceClasses = light
        ? 'border-[#17372f]/15 bg-white text-[#17372f] shadow-sm'
        : 'border-white/25 bg-black/35 text-white shadow-lg backdrop-blur-xl';
    const inputClasses = light
        ? 'text-[#17372f] placeholder:text-[#71817c]'
        : 'text-white placeholder:text-white/55';
    const iconClasses = light
        ? 'border-[#17372f]/10 bg-[#17372f]/5 text-[#17372f] hover:bg-[#17372f]/10'
        : 'border-white/15 bg-white/10 text-white hover:bg-white/20';

    return (
        <div ref={controlsRef} className={`flex items-start justify-end gap-2 ${className}`}>
            <div className="relative">
                <form onSubmit={submitSearch} className={`flex h-11 overflow-hidden rounded-full border transition-[width] duration-300 ${surfaceClasses} ${searchOpen ? 'w-[min(72vw,290px)]' : 'w-11'} sm:w-[310px]`}>
                    <input
                        value={draftSearch}
                        onChange={(event) => {
                            setDraftSearch(event.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Search destinations"
                        aria-label="Search offbeat destinations"
                        className={`${searchOpen ? 'block' : 'hidden'} min-w-0 flex-1 bg-transparent px-4 text-sm sm:block ${inputClasses}`}
                    />
                    {draftSearch && searchOpen && (
                        <button type="button" onClick={() => {
                            setDraftSearch('');
                            if (currentSearch) navigateToResults({ search: '' });
                        }} className={`px-1 ${light ? 'text-[#60716c] hover:text-[#17372f]' : 'text-white/60 hover:text-white'}`} aria-label="Clear search">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                    <button type="submit" className={`flex h-11 w-11 shrink-0 items-center justify-center border-l transition ${iconClasses}`} aria-label="Search">
                        <Search className="h-[18px] w-[18px]" />
                    </button>
                </form>

                <AnimatePresence>
                    {showSuggestions && debouncedSearch.length >= 2 && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 z-50 mt-2 w-[min(84vw,320px)] overflow-hidden rounded-2xl border border-black/5 bg-white p-1.5 text-[#17372f] shadow-2xl">
                            {isLoading ? (
                                <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Finding destinations…</div>
                            ) : suggestions.length ? suggestions.map((suggestion) => (
                                <button key={suggestion.id} type="button" onClick={() => chooseSuggestion(suggestion)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#edf3ee]">
                                    <img src={suggestion.coverPhoto || FALLBACK_IMAGE} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                                    <span className="min-w-0">
                                        <span className="block truncate text-sm font-semibold">{suggestion.title}</span>
                                        <span className="block truncate text-xs text-slate-500">{suggestion.destination}, {suggestion.region}</span>
                                    </span>
                                    {suggestion.exact && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[#9b7440]">Exact</span>}
                                </button>
                            )) : <p className="px-4 py-3 text-sm text-slate-500">No close destination found.</p>}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className={`relative ${searchOpen ? 'hidden sm:block' : 'block'}`}>
                <button
                    type="button"
                    onClick={() => {
                        setRegionOpen((open) => !open);
                        setShowSuggestions(false);
                    }}
                    aria-expanded={regionOpen}
                    className={`flex h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold tracking-[-0.01em] transition ${surfaceClasses} ${light ? 'hover:border-[#17372f]/30 hover:bg-white' : 'hover:bg-black/50'}`}
                >
                    <MapPin className={`h-[17px] w-[17px] shrink-0 ${light ? 'text-[#9b7440]' : 'text-[#d9bd86]'}`} />
                    <span className="max-w-[100px] truncate sm:max-w-[135px]">{currentRegion === 'All' ? 'All regions' : currentRegion}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 opacity-65 transition-transform ${regionOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {regionOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.18 }}
                            className="absolute right-0 z-50 mt-2 w-[min(76vw,220px)] overflow-hidden rounded-2xl border border-[#17372f]/10 bg-[#fffdf8] p-1.5 text-[#17372f] shadow-[0_20px_50px_-20px_rgba(15,16,20,0.55)]"
                        >
                            <p className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9b7440]">Choose a region</p>
                            {REGIONS.map((region) => (
                                <button
                                    key={region}
                                    type="button"
                                    onClick={() => changeRegion(region)}
                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${currentRegion === region ? 'bg-[#e8efe9] font-semibold text-[#17372f]' : 'text-[#526761] hover:bg-[#f1f4ef]'}`}
                                >
                                    <span>{region === 'All' ? 'All regions' : region}</span>
                                    {currentRegion === region && <Check className="h-4 w-4 text-[#1d6b55]" />}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
