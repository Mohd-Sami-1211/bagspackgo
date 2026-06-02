'use client';
// src/components/home/EventSection/EventMainContent.jsx

import { memo, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCcw, SlidersHorizontal, Calendar } from 'lucide-react';
import { destinations as STATIC_DESTINATIONS } from 'src/data/data.json';
import { Button } from '@/components/ui/button';
import EventCard from 'src/components/home/EventSection/EventCard';
import SearchBar from 'src/components/common/SearchBar';
import FilterPanel, { EMPTY_FILTERS, SORT_OPTIONS } from 'src/components/home/EventSection/FilterPanel';

// ─── Constants ────────────────────────────────────────────────────────────────

const LIMIT = 20;

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const buildQueryString = (page, filters, search) => {
  const params = new URLSearchParams();
  params.set('page',  String(page));
  params.set('limit', String(LIMIT));
  
  if (search)  params.set('search', search);
  if (filters.destination?.length)   params.set('destination', filters.destination.join(','));
  if (filters.organizer?.length) params.set('organizer', filters.organizer.join(','));
  if (filters.type?.length)  params.set('type', filters.type.join(','));
  if (filters.sort)  params.set('sort', filters.sort);
  if (filters.date) params.set('dateFilter', filters.date);
  if (filters.dateRange?.start) params.set('dateStart', filters.dateRange.start.toISOString());
  if (filters.dateRange?.end) params.set('dateEnd', filters.dateRange.end.toISOString());
  return params.toString();
};

// ─── Skeleton / Loader components ─────────────────────────────────────────────

const EventSkeleton = () => (
  <div className="w-full mt-1 sm:mt-5 py-8 px-4 bg-white/50 rounded-2xl shadow-sm min-h-[60vh]">
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      <div className="hidden lg:block lg:w-1/4 space-y-6">
        <div className="h-8 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
      <div className="w-full lg:w-3/4 space-y-6">
        <div className="flex justify-between items-center mb-10">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-full w-1/3 animate-pulse" />
        </div>
        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />)}
      </div>
    </div>
  </div>
);

const BottomLoader = () => (
  <div className="flex justify-center items-center py-8 gap-3">
    <div className="w-5 h-5 border-[3px] border-green-200 border-t-green-500 rounded-full animate-spin" />
    <span className="text-sm text-neutral-500 font-medium">Loading more events...</span>
  </div>
);

// ─── ActiveFilterTags ─────────────────────────────────────────────────────────

const ActiveFilterTags = memo(({ filters, onClear }) => {
  const labels = filters._labels ?? { destinations: {}, organizers: {} };

  const resolveDestLabel = (id) =>
    STATIC_DESTINATIONS.find(d => d.value === id)?.label ||
    labels.destinations?.[id] ||
    id;

  const resolveOrgLabel = (id) => labels.organizers?.[id] || id;

  const hasAny =
    filters.destination.length > 0 || filters.organizer.length > 0 ||
    filters.type.length > 0 || filters.date ||
    filters.dateRange?.start || filters.dateRange?.end || filters.sort;

  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
      {filters.destination.map(id => (
        <div key={`dest-${id}`} className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
          {resolveDestLabel(id)}
          <X size={14} className="ml-1 cursor-pointer hover:text-red-200" onClick={() => onClear('destination', id)} />
        </div>
      ))}
      {filters.organizer.map(id => (
        <div key={`org-${id}`} className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
          {resolveOrgLabel(id)}
          <X size={14} className="ml-1 cursor-pointer hover:text-red-200" onClick={() => onClear('organizer', id)} />
        </div>
      ))}
      {filters.type.map(type => (
        <div key={`type-${type}`} className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
          {type}
          <X size={14} className="ml-1 cursor-pointer hover:text-red-200" onClick={() => onClear('type', type)} />
        </div>
      ))}
      {filters.date && (
        <div className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
          {filters.date}
          <X size={14} className="ml-1 cursor-pointer hover:text-red-200" onClick={() => onClear('date')} />
        </div>
      )}
      {(filters.dateRange?.start || filters.dateRange?.end) && (
        <div className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
          {filters.dateRange.start ? formatDate(filters.dateRange.start) : 'Any'} – {filters.dateRange.end ? formatDate(filters.dateRange.end) : 'Any'}
          <X size={14} className="ml-1 cursor-pointer hover:text-red-200" onClick={() => onClear('dateRange')} />
        </div>
      )}
      {filters.sort && (
        <div className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
          {SORT_OPTIONS.find(o => o.value === filters.sort)?.label || filters.sort}
          <X size={14} className="ml-1 cursor-pointer hover:text-red-200" onClick={() => onClear('sort')} />
        </div>
      )}
    </div>
  );
});
ActiveFilterTags.displayName = 'ActiveFilterTags';

// ─── EventMainContent ─────────────────────────────────────────────────────────

const EventMainContent = () => {
  // ── Events ──────────────────────────────────────────────────────────────────
  const [events,       setEvents]       = useState([]);
  const [page,         setPage]         = useState(1);
  const [hasMore,      setHasMore]      = useState(true);
  const [loading,      setLoading]      = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [totalCount,   setTotalCount]   = useState(0);

  // ── Applied filters (committed state; temp state lives in FilterPanel) ──────
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });

  // ── Mobile filter drawer ─────────────────────────────────────────────────────
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── Search ───────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const observerRef    = useRef(null);
  const fetchingRef    = useRef(false);

  const searchQueryRef = useRef('');
  const hasMounted     = useRef(false);

  useEffect(() => { searchQueryRef.current = searchQuery; }, [searchQuery]);

  // ─── Event fetching ──────────────────────────────────────────────────────────

  const fetchEvents = useCallback(async (
    fetchPage, currentFilters, currentSearch, append = false, isSearch = false,
  ) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    if (append) {
      setFetchingMore(true);
    } else if (!isSearch) {
      setLoading(true);
      setEvents([]);
    }

    try {
      const qs   = buildQueryString(fetchPage, currentFilters, currentSearch);
      const res  = await fetch(`/api/events?${qs}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setEvents(prev => append ? [...prev, ...json.events] : json.events);
      setHasMore(json.hasMore);
      setTotalCount(json.total);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
      setFetchingMore(false);
      fetchingRef.current = false;
    }
  }, []);


  useEffect(() => { fetchEvents(1, EMPTY_FILTERS, ''); }, [fetchEvents]);

  useEffect(() => {
    if (!hasMounted.current) { hasMounted.current = true; return; }
    setPage(1);
    fetchEvents(1, filters, searchQuery, false, true);
  }, [searchQuery]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !fetchingRef.current && !loading) {
          const next = page + 1;
          setPage(next);
          fetchEvents(next, filters, searchQuery, true);
        }
      },
      { threshold: 0.1 },
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, filters, searchQuery, fetchEvents]);

  const handleApply = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setMobileFiltersOpen(false);
    fetchEvents(1, newFilters, searchQueryRef.current);
  }, [fetchEvents]);


  const handleReset = useCallback(() => {
    const empty = { ...EMPTY_FILTERS };
    setFilters(empty);
    setSearchQuery('');
    searchQueryRef.current = '';
    setPage(1);
    setMobileFiltersOpen(false);
    fetchEvents(1, empty, '');
  }, [fetchEvents]);


  const clearFilter = useCallback((filterType, value = null) => {
    setFilters(prev => {
      let updated;
      if (value && Array.isArray(prev[filterType])) {
        updated = { ...prev, [filterType]: prev[filterType].filter(i => i !== value) };
      } else if (filterType === 'dateRange') {
        updated = { ...prev, dateRange: { start: null, end: null } };
      } else {
        updated = { ...prev, [filterType]: Array.isArray(prev[filterType]) ? [] : null };
      }
      fetchEvents(1, updated, searchQueryRef.current);
      setPage(1);
      return updated;
    });
  }, [fetchEvents]);


  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const hasActiveFilters = useMemo(() =>
    filters.destination.length > 0 || filters.organizer.length > 0 ||
    filters.type.length > 0 || filters.date !== null || filters.sort !== null ||
    filters.dateRange?.start !== null || filters.dateRange?.end !== null,
  [filters]);

  const activeFilterCount = useMemo(() => [
    ...filters.destination, ...filters.organizer, ...filters.type,
    filters.date, filters.sort,
    (filters.dateRange?.start || filters.dateRange?.end) ? 'range' : null,
  ].filter(Boolean).length, [filters]);

  const headingText = useMemo(() => {
    if (searchQuery)      return 'Search Results';
    if (hasActiveFilters) return 'Filtered Events';
    return 'Top Events';
  }, [searchQuery, hasActiveFilters]);

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (loading) return <EventSkeleton />;

  if (!loading && events.length === 0 && !hasActiveFilters && !searchQuery) {
    return (
      <div className="w-full mt-4 sm:mt-10 py-16 px-4 bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="relative mb-6">
          <div className="bg-emerald-50 p-6 rounded-full border border-emerald-100">
            <Calendar size={48} className="text-emerald-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Upcoming Events</h2>
        <p className="text-gray-500 max-w-sm mx-auto mb-8 text-[15px] leading-relaxed">
          We're preparing new adventures and curated experiences. Check back later!
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="rounded-full px-6"><a href="/user/trip">Explore Trips</a></Button>
          <Button variant="outline" onClick={() => window.location.reload()} className="rounded-full px-6 gap-2">
            <RefreshCcw size={15} /> Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-2 px-3 sm:px-4 bg-gray-50/80 border-t border-gray-100 overflow-hidden mb-0 pb-8 min-h-screen">

      {/* ── Mobile header (search + filter toggle) ────────────────────────── */}
      <div className="lg:hidden px-2 pt-4 pb-2 space-y-3 -mt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-neutral-800 flex-1">{headingText}</h2>
          <button
            onClick={() => setMobileFiltersOpen(prev => !prev)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors
              ${mobileFiltersOpen
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-white border-neutral-200 text-neutral-700'}`}
          >
            <SlidersHorizontal size={16} /> Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        <div className="relative z-50">
          <SearchBar
            onSearch={handleSearch}
            initialValue={searchQuery}
          />
        </div>
      </div>

      {/* ── Mobile filter drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="px-2 pb-4">
              <FilterPanel
                appliedFilters={filters}
                onApply={handleApply}
                onReset={handleReset}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row h-full">
        <div className="hidden lg:block lg:w-1/4">
          <h2 className="text-2xl p-6 font-bold text-neutral-800">Filters</h2>
          
          <FilterPanel
            appliedFilters={filters}
            onApply={handleApply}
            onReset={handleReset}
          />
        </div>

        {/* ── Events list ─────────────────────────────────────────────────── */}
        <div className="w-full lg:w-3/4 p-3 sm:p-6 -mt-1.5">
          <div className="hidden lg:flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-800">{headingText}</h2>
              {totalCount > 0 && (
                <p className="text-sm text-neutral-500 mt-0.5">
                  {totalCount} event{totalCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="relative w-1/2 z-50">
              <SearchBar
                onSearch={handleSearch}
                initialValue={searchQuery}
              />
            </div>
          </div>

          <ActiveFilterTags filters={filters} onClear={clearFilter} />

          {events.length > 0 ? (
            <>
              <div className="space-y-4 sm:space-y-6">
                {events.map((event, index) => (
                  <EventCard key={`event-${event.id || event._id || index}`} event={event} />
                ))}
              </div>
              <div ref={observerRef} className="h-4 w-full" />
              {fetchingMore && <BottomLoader />}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-neutral-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-2">No events found</h3>
              <p className="text-neutral-500 text-sm mb-4">
                {searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your filters'}
              </p>
              <button
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                onClick={handleReset}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventMainContent;
