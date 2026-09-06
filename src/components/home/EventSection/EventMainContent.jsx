'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Star, Ticket, Search,
  ChevronDown, ArrowLeft, Clock, RefreshCcw,
  Sparkles, Eye, X, Users, ArrowRight, Filter
} from 'lucide-react';
import EventCard from 'src/components/home/EventSection/EventCard';
import { useEventsList } from '@/lib/useTripCache';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const CAROUSEL_INTERVAL = 5000;
const CARDS_PER_SECTION = 6;
const CARDS_PER_PAGE = 12;

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function EventMainContent() {
  const [viewMode, setViewMode] = useState('default');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const dragStartX = useRef(0);
  const isDragging = useRef(false);

  // Expanded View States
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [expandedPage, setExpandedPage] = useState(1);
  const [accumulatedAll, setAccumulatedAll] = useState([]);

  // Data Fetching
  const liveQueryParams = useMemo(() => {
    if (viewMode === 'all-live') {
      return { tab: 'upcoming', page: expandedPage, limit: CARDS_PER_PAGE, search: searchQuery, sort: sortBy };
    }
    return { tab: 'upcoming', limit: 20 };
  }, [viewMode, expandedPage, searchQuery, sortBy]);

  const recentQueryParams = useMemo(() => {
    if (viewMode === 'all-recent') {
      return { tab: 'past', page: expandedPage, limit: CARDS_PER_PAGE, search: searchQuery, sort: sortBy };
    }
    return { tab: 'past', limit: CARDS_PER_SECTION };
  }, [viewMode, expandedPage, searchQuery, sortBy]);

  const { data: liveData, isLoading: liveLoading, isValidating: liveValidating } = useEventsList(liveQueryParams);
  const { data: recentData, isLoading: recentLoading, isValidating: recentValidating } = useEventsList(recentQueryParams);

  const liveEvents = liveData?.events || [];
  const recentEvents = recentData?.events || [];
  const carouselEvents = liveEvents.slice(0, 5);
  const gridLiveEvents = liveEvents.slice(0, CARDS_PER_SECTION);
  const gridRecentEvents = recentEvents.slice(0, CARDS_PER_SECTION);
  const hasMoreLive = (liveData?.total || 0) > CARDS_PER_SECTION;
  const hasMoreRecent = (recentData?.total || 0) > CARDS_PER_SECTION;

  // Pagination Accumulator
  useEffect(() => {
    const data = viewMode === 'all-live' ? liveData : viewMode === 'all-recent' ? recentData : null;
    if (!data?.events) return;
    setAccumulatedAll(prev => {
      if (expandedPage === 1) return data.events;
      const ids = new Set(prev.map(e => e.id));
      return [...prev, ...data.events.filter(e => !ids.has(e.id))];
    });
  }, [liveData, recentData, viewMode, expandedPage]);

  useEffect(() => {
    setExpandedPage(1);
    setAccumulatedAll([]);
  }, [viewMode, searchQuery, sortBy]);

  // Carousel auto-slide
  useEffect(() => {
    if (!isAutoPlaying || carouselEvents.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselEvents.length);
    }, CAROUSEL_INTERVAL);
    return () => clearInterval(timer);
  }, [isAutoPlaying, carouselEvents.length]);

  useEffect(() => {
    if (carouselEvents.length > 0 && currentSlide >= carouselEvents.length) {
      setCurrentSlide(0);
    }
  }, [carouselEvents.length, currentSlide]);

  // Drag handlers
  const handlePointerDown = useCallback((e) => {
    dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    isDragging.current = true;
    setIsAutoPlaying(false);
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? 0;
    const delta = endX - dragStartX.current;
    if (delta < -50) {
      setCurrentSlide(prev => (prev + 1) % carouselEvents.length);
    } else if (delta > 50) {
      setCurrentSlide(prev => (prev - 1 + carouselEvents.length) % carouselEvents.length);
    }
    setTimeout(() => setIsAutoPlaying(true), CAROUSEL_INTERVAL);
  }, [carouselEvents.length]);

  // View Handlers
  const openViewAll = useCallback((mode) => {
    setViewMode(mode);
    setSearchInput('');
    setSearchQuery('');
    setSortBy('');
    setExpandedPage(1);
    setAccumulatedAll([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeViewAll = useCallback(() => {
    setViewMode('default');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const expandedHasMore = viewMode === 'all-live' ? liveData?.hasNextPage : recentData?.hasNextPage;
  const expandedIsValidating = viewMode === 'all-live' ? liveValidating : recentValidating;

  /* ═══════════════════════════════════════════════════════════════════════
     EXPANDED "VIEW ALL" MODE
     ═══════════════════════════════════════════════════════════════════════ */
  if (viewMode !== 'default') {
    const title = viewMode === 'all-live' ? 'All Live Events' : 'Recent Events';
    const isLoading = viewMode === 'all-live' ? liveLoading : recentLoading;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-neutral-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <button onClick={closeViewAll} className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors font-medium text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="h-5 w-px bg-neutral-200" />
            <h1 className="text-lg font-bold text-neutral-800">{title}</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input type="text" placeholder="Search events..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="pl-10 h-11 rounded-xl bg-white border-neutral-200" />
            </form>
            <div className="relative">
              <select className="h-11 appearance-none bg-white border border-neutral-200 text-neutral-700 py-2 pl-4 pr-10 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="">Sort: Recommended</option>
                <option value="date_asc">Date: Nearest First</option>
                <option value="date_desc">Date: Farthest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {isLoading && accumulatedAll.length === 0 ? (
            <SkeletonGrid count={6} />
          ) : accumulatedAll.length === 0 ? (
            <EmptyState onReset={() => { setSearchInput(''); setSearchQuery(''); setSortBy(''); }} />
          ) : (
            <>
              <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {accumulatedAll.map((event) => <EventCard key={event.id} event={event} />)}
              </motion.div>
              {expandedHasMore && (
                <div className="mt-12 flex justify-center">
                  <Button onClick={() => setExpandedPage(p => p + 1)} disabled={expandedIsValidating} variant="outline" className="px-8 py-6 rounded-xl border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50 font-semibold text-base">
                    {expandedIsValidating ? <span className="flex items-center gap-2"><RefreshCcw className="w-5 h-5 animate-spin" />Loading...</span> : 'Load More Events'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     DEFAULT VIEW
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* ────────────────────────────────────────────────────────────────────
          SECTION 1 — LIVE EVENTS CAROUSEL (Full Background Poster)
          ──────────────────────────────────────────────────────────────────── */}
      <section className="relative w-full mb-12">
        {liveLoading && carouselEvents.length === 0 ? (
          <div className="w-full h-[450px] md:h-[500px] lg:h-[600px] bg-[#0f1014] animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-neutral-800" />
          </div>
        ) : carouselEvents.length === 0 ? (
          <div className="w-full h-[450px] md:h-[500px] lg:h-[600px] bg-[#0f1014] flex flex-col items-center justify-center text-white">
            <Sparkles className="w-10 h-10 mb-4 text-emerald-300" />
            <h2 className="text-2xl font-bold mb-2">Stay Tuned</h2>
            <p className="text-emerald-200 text-sm">New events are coming soon!</p>
          </div>
        ) : (
          <div
            className="relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing group"
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseLeave={() => { isDragging.current = false; }}
            onTouchStart={handlePointerDown}
            onTouchEnd={handlePointerUp}
          >
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/20 z-30">
              <motion.div className="h-full bg-emerald-400" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: CAROUSEL_INTERVAL / 1000, ease: 'linear' }} key={`progress-${currentSlide}`} />
            </div>

            <div className="flex transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {carouselEvents.map((event) => (
                <div key={event.id} className="w-full flex-shrink-0">
                  <CarouselSlide event={event} />
                </div>
              ))}
            </div>

            {carouselEvents.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {carouselEvents.map((_, i) => (
                  <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }} className={`h-1.5 rounded-full transition-all duration-400 ${i === currentSlide ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`} aria-label={`Slide ${i + 1}`} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          SECTION 2 — LIVE EVENTS CARDS GRID
          ──────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Live Events</h2>
          {hasMoreLive && (
            <button onClick={() => openViewAll('all-live')} className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-bold transition-colors group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {liveLoading ? (
          <SkeletonGrid count={CARDS_PER_SECTION} />
        ) : gridLiveEvents.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-sm">No live events right now. Check back soon!</div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {gridLiveEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </motion.div>
        )}
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          SECTION 3 — RECENT EVENTS CARDS GRID
          ──────────────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Recent Events</h2>
          {hasMoreRecent && (
            <button onClick={() => openViewAll('all-recent')} className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-bold transition-colors group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {recentLoading ? (
          <SkeletonGrid count={CARDS_PER_SECTION} />
        ) : gridRecentEvents.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 text-sm">No recent events yet.</div>
        ) : (
          <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {gridRecentEvents.map((event) => <EventCard key={event.id} event={event} />)}
          </motion.div>
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CAROUSEL SLIDE — Hotstar Inspired Layout (Full Poster visibility)
   ═══════════════════════════════════════════════════════════════════════════ */
function CarouselSlide({ event }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="relative w-full h-[450px] md:h-[500px] lg:h-[600px] bg-[#0f1014] overflow-hidden flex items-center group">
      
      {/* ── Layer 1: Ambient Blurred Background ── */}
      {/* This fills the wide screen with the poster's colors without cropping the main focal image */}
      <img
        src={event.image || '/images/EventCover.webp'}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[40px] scale-110"
        draggable={false}
      />
      
      {/* ── Layer 2: The Full Uncropped Poster ── */}
      {/* Using object-contain ensures the entire poster is visible. Aligned to the right on desktop, top on mobile. */}
      <div className="absolute inset-0 flex justify-end">
        <img
          src={event.image || '/images/EventCover.webp'}
          alt={event.name}
          className="w-full md:w-[70%] lg:w-[60%] h-full object-contain md:object-right object-top md:object-center drop-shadow-2xl transition-transform duration-1000 group-hover:scale-105 md:pr-10"
          draggable={false}
          onError={(e) => { e.target.src = '/images/events/default.jpg'; }}
        />
      </div>

      {/* ── Layer 3: Hotstar-style Seamless Gradients ── */}
      {/* Fades from dark left/bottom into the image on the right/top */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/90 to-transparent md:bg-gradient-to-r md:from-[#0f1014] md:via-[#0f1014]/90 md:to-transparent" />
      <div className="absolute inset-y-0 left-0 w-full md:w-3/4 bg-gradient-to-r from-[#0f1014] via-[#0f1014]/80 to-transparent hidden md:block" />

      {/* ── Layer 4: Floating Content ── */}
      <div className="absolute bottom-8 md:bottom-auto md:top-1/2 md:-translate-y-1/2 left-4 md:left-12 lg:left-20 z-20 max-w-[90%] md:max-w-[55%] lg:max-w-[45%] flex flex-col gap-4 lg:gap-5">
        
        {/* Title */}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight text-white drop-shadow-2xl tracking-tight">
          {event.name}
        </h2>

        {/* Hotstar-style Meta Tags */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm font-bold text-white/80">
          <span className="text-emerald-400">{formattedDate}</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>{event.duration || '1 day'}</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span>{event.slotsLeft > 0 ? `${event.slotsLeft} Spots Left` : <span className="text-red-400">Sold Out</span>}</span>
          <span className="w-1 h-1 rounded-full bg-white/40" />
          <span className="px-2 py-0.5 bg-white/10 rounded-md backdrop-blur-md text-white/90 border border-white/10">
            {event.type || 'Event'}
          </span>
          {event.rating > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {event.rating?.toFixed(1)}
              </span>
            </>
          )}
        </div>

        {/* Description / Extra Info */}
        <p className="text-white/70 text-sm md:text-base leading-relaxed line-clamp-2 md:line-clamp-3 font-medium">
          Located in <strong className="text-white">{event.destination || event.destinationId}</strong>. 
          Organized by <strong className="text-white">{event.guideName || 'Local Organizer'}</strong>. 
          Book your tickets now to secure your spot for this amazing experience!
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-2">
          {/* Primary Watch/View Button (Hotstar Play Button style) */}
          <Link
            href={`/user/events/eventdetails/${event.id}`}
            className="flex items-center gap-2 px-8 py-3.5 lg:py-4 bg-white hover:bg-neutral-200 text-black text-sm lg:text-base font-extrabold rounded-xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95"
          >
            <Eye className="w-5 h-5 lg:w-6 lg:h-6" /> View Details
          </Link>

          {/* Price Indicator */}
          <div className="hidden md:flex flex-col justify-center ml-2 border-l border-white/20 pl-6">
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-0.5">Price</span>
            <span className="text-xl lg:text-2xl font-black text-white leading-none">
              ₹{event.price?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SKELETON GRID
   ═══════════════════════════════════════════════════════════════════════════ */
function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
          <div className="h-48 bg-neutral-200" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-neutral-200 rounded w-3/4" />
            <div className="h-4 bg-neutral-100 rounded w-1/2" />
            <div className="flex justify-between pt-3 mt-2 border-t border-neutral-100">
              <div className="h-6 bg-neutral-200 rounded w-1/4" />
              <div className="h-9 bg-neutral-200 rounded-xl w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════════════════════════════════════════════ */
function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
        <Search className="w-8 h-8 text-emerald-400" />
      </div>
      <h3 className="text-xl font-bold text-neutral-800 mb-2">No Events Found</h3>
      <p className="text-neutral-500 max-w-md mx-auto mb-6 text-sm">
        We couldn't find any events matching your search.
      </p>
      <Button onClick={onReset} variant="outline" className="rounded-xl">Clear Filters</Button>
    </div>
  );
}