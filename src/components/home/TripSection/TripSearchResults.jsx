'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripPackages } from '@/lib/useTripCache';
import GuideCard from './TripGuideCard';
import GuideListSkeleton from './GuideListSkeleton';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Calendar as CalendarIcon, Filter, Search as SearchIcon, ChevronDown, ArrowLeft, Plus, Minus, PackageOpen, Sparkles } from 'lucide-react';
import data from 'src/data/data.json';
import { Button } from '@/components/ui/button';



const availableValues = ['kashmir'];
const activeOptions = (data.destinations || []).filter(d => availableValues.includes(d.value));
const otherOptions = (data.destinations || []).filter(d => !availableValues.includes(d.value)).map(dest => ({
  ...dest,
  isDisabled: true,
}));

const destinationOptions = [
  ...activeOptions,
  {
    label: 'Available Soon',
    options: otherOptions
  }
];

const RESULTS_PAGE_SIZE = 12;

const findDestination = (val) => {
  return (data.destinations || []).find(d => d.value === val) || null;
};

const SearchResults = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Filter/sort state
  const [sortOption, setSortOption] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  // Parse and validate search parameters
  const getValidParam = (param, defaultValue) => {
    const value = searchParams.get(param);
    return value !== null && value !== '' ? value : defaultValue;
  };

  const destination = getValidParam('destination', '');
  const category = ['individual', 'couple', 'group'].includes(searchParams.get('category'))
    ? searchParams.get('category')
    : 'individual';
  const daysRange = getValidParam('daysRange', '');
  
  // Support both old peopleRange and new peopleCount params
  const peopleCountParam = getValidParam('peopleCount', '');
  const peopleRangeParam = getValidParam('peopleRange', '');
  const peopleCount = peopleCountParam ? parseInt(peopleCountParam) || 1 : (peopleRangeParam ? parseInt(peopleRangeParam.split('-')[0]) || 1 : 1);
  
  const dateParam = searchParams.get('date');
  const date = dateParam && !isNaN(new Date(dateParam).getTime())
    ? new Date(dateParam)
    : null;

  const daysOptions = [
    { value: '0-3', label: '0-3 days' },
    { value: '3-5', label: '3-5 days' },
    { value: '5-7', label: '5-7 days' },
    { value: '7-9', label: '7-9 days' },
    { value: 'other', label: 'Others' }
  ];

  const getDaysRangeLabel = (value) => {
    const option = daysOptions.find(opt => opt.value === value);
    return option ? option.label : 'Any';
  };

  const getPackagesInRange = (guide, daysRange) => {
    if (!daysRange || !guide.packages || guide.packages.length === 0) return [];
    const [minDays, maxDays] = daysRange.split('-').map(Number);
    return guide.packages.filter(pkg => pkg.days >= minDays && pkg.days <= maxDays);
  };

  // Get destination label for display  
  const destinationLabel = useMemo(() => {
    const dest = data.destinations.find(d => d.value === destination);
    return dest ? dest.label : destination ? destination.charAt(0).toUpperCase() + destination.slice(1) : '';
  }, [destination]);

  const [editableDestination, setEditableDestination] = useState(destination);
  const [editableCategory, setEditableCategory] = useState(category);
  const [editableDaysRange, setEditableDaysRange] = useState(daysOptions.find(opt => opt.value === daysRange) || null);
  const [editablePeopleCount, setEditablePeopleCount] = useState(peopleCount);
  const [editableDate, setEditableDate] = useState(date);
  const [page, setPage] = useState(1);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const queryParams = useMemo(() => {
    const p = {};
    if (destination) p.destination = destination;
    if (daysRange) p.daysRange = daysRange;
    if (peopleCount) p.peopleCount = peopleCount.toString();
    if (category) p.category = category;
    p.page = page;
    p.limit = RESULTS_PAGE_SIZE;
    return p;
  }, [destination, daysRange, peopleCount, category, page]);

  const { data: fetchResult, isLoading: loading } = useTripPackages(queryParams);

  const allGuides = fetchResult?.success ? fetchResult.data : [];
  const otherGuides = fetchResult?.success ? (fetchResult.otherPackages || []) : [];
  const pagination = fetchResult?.pagination || {};

  useEffect(() => {
    setPage(1);
  }, [destination, daysRange, peopleCount, category]);

  const guides = useMemo(() => {
    let results = allGuides;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(guide => guide.name.toLowerCase().includes(query));
    }
    
    // Flatten guides into items with their specific packages
    let flatItems = [];
    results.forEach(guide => {
      const packagesInRange = getPackagesInRange(guide, daysRange);
      if (!daysRange || packagesInRange.length === 0) {
        flatItems.push({ guide, pkg: null });
      } else {
        packagesInRange.forEach(pkg => flatItems.push({ guide, pkg }));
      }
    });

    if (sortOption === 'recommended') {
      const getRecommendedPrice = (item) => {
        const pkg = item.pkg;
        const tiers = pkg?.pricingTiers || [];
        if (tiers.length) {
          const matchingTier = tiers.find((tier) => peopleCount >= tier.minPeople && peopleCount <= tier.maxPeople)
            || [...tiers].sort((a, b) => a.maxPeople - b.maxPeople)[0];
          if (matchingTier) {
            const price = Number(matchingTier.price || 0);
            const discount = Number(matchingTier.discount || 0);
            return discount > 0 ? price * (1 - discount / 100) : price;
          }
        }
        const rawPrice = pkg?.price ?? item.guide.price;
        if (rawPrice && typeof rawPrice === 'object') {
          return Number(rawPrice[category] || rawPrice.individual || rawPrice.couple || Object.values(rawPrice)[0] || Number.POSITIVE_INFINITY);
        }
        return Number(rawPrice) || Number.POSITIVE_INFINITY;
      };
      const shuffle = (items) => {
        const shuffled = [...items];
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
          const randomIndex = Math.floor(Math.random() * (index + 1));
          [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
        }
        return shuffled;
      };
      const ranked = [...flatItems].sort((a, b) => getRecommendedPrice(a) - getRecommendedPrice(b));
      return [...shuffle(ranked.slice(0, 4)), ...shuffle(ranked.slice(4))];
    }

    const [field, order] = sortOption.split('-');
    return flatItems.sort((a, b) => {
      if (field === 'price') {
        const getPrice = (item) => {
          const pkg = item.pkg;
          if (pkg) {
            const tiers = pkg.pricingTiers || [];
            let matchedTier = tiers.find(t => peopleCount >= t.minPeople && peopleCount <= t.maxPeople);
            if (!matchedTier && tiers.length > 0) {
              const sortedTiers = [...tiers].sort((a, b) => a.maxPeople - b.maxPeople);
              matchedTier = peopleCount > sortedTiers[sortedTiers.length - 1].maxPeople 
                ? sortedTiers[sortedTiers.length - 1] 
                : sortedTiers[0];
            }
            if (matchedTier) {
              const basePrice = Number(matchedTier.price || 0);
              const disc = Number(matchedTier.discount || 0);
              return disc > 0 ? basePrice * (1 - disc / 100) : basePrice;
            }
            let p = pkg.price;
            if (typeof p === 'object' && p !== null) {
              return Number(p[category] || p.individual || Object.values(p)[0] || 0);
            }
            return Number(p || 0);
          }
          let p = item.guide.price;
          if (typeof p === 'object' && p !== null) {
            return Number(p[category] || p.individual || Object.values(p)[0] || 0);
          }
          return Number(p || 0);
        };
        const aPrice = getPrice(a);
        const bPrice = getPrice(b);
        return order === 'desc' ? bPrice - aPrice : aPrice - bPrice;
      }
      
      const valA = Number(a.guide[field]) || 0;
      const valB = Number(b.guide[field]) || 0;
      return order === 'desc' ? valB - valA : valA - valB;
    });
  }, [allGuides, searchQuery, sortOption, daysRange, category, peopleCount]);

  const handleApplyChanges = () => {
    setIsApplying(true);
    const params = {
      destination: editableDestination || destination,
      category: editableCategory || category,
      daysRange: editableDaysRange?.value || '',
      peopleCount: editablePeopleCount.toString(),
      ...(editableDate && { date: editableDate.toISOString() })
    };
    const queryString = new URLSearchParams(params).toString();
    router.push(`/user/trip/guidelist?${queryString}`);
    setIsEditing(false);
    setIsApplying(false);
  };

  const handleCancel = () => {
    setEditableDestination(destination);
    setEditableCategory(category);
    setEditableDaysRange(daysOptions.find(opt => opt.value === daysRange) || null);
    setEditablePeopleCount(peopleCount);
    setEditableDate(date);
    setIsEditing(false);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    setActiveFilter(option);
    setShowSortDropdown(false);
  };

  const clearFilter = (e) => {
    e.stopPropagation();
    setSortOption('recommended');
    setActiveFilter(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#f8f6f0] pt-16">
        <div className="max-w-7xl mx-auto px-4">
           <GuideListSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f6f0] font-sans pb-12">
      {/* Refined Header - Single Line Action Bar */}
      <div className="sticky top-16 z-[30] w-full border-b border-[#17372f]/10 bg-[#f8f6f0]/95 shadow-sm backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-slate-600 shrink-0"
            >
              <ArrowLeft size={18} />
            </Button>

            {/* Search Bar */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Find a guide..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-xl border border-[#17372f]/12 bg-white/80 px-4 py-2 pl-10 text-sm font-medium text-[#17372f] transition-all focus:border-[#1d6b55] focus:outline-none focus:ring-2 focus:ring-[#1d6b55]/10 sm:py-2.5"
                ref={searchInputRef}
              />
              <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1d6b55]" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Sort Toggle */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="shrink-0 border-[#17372f]/15 bg-white font-medium text-[#17372f] hover:bg-[#edf3ee]"
                >
                  <Filter size={16} className="mr-2" />
                  <span className="hidden sm:inline">
                    {activeFilter ? [
                      { value: 'rating-desc', label: 'Highest Rating' },
                      { value: 'rating-asc', label: 'Lowest Rating' },
                      { value: 'price-desc', label: 'Highest Price' },
                      { value: 'price-asc', label: 'Lowest Price' },
                      { value: 'reviews-desc', label: 'Most Reviews' },
                    ].find(opt => opt.value === activeFilter)?.label || 'Sort' : 'Sort'}
                  </span>
                  <ChevronDown size={14} className={`ml-2 hidden sm:inline transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
                </Button>
                
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[40] overflow-hidden"
                    >
                      {activeFilter && (
                        <button
                          onClick={clearFilter}
                          className="w-full text-left px-5 py-2.5 text-xs sm:text-sm text-red-600 hover:bg-red-50 font-bold border-b border-gray-100 flex items-center justify-between"
                        >
                          Clear Sort
                          <X size={14} />
                        </button>
                      )}
                      {[
                        { value: 'rating-desc', label: 'Highest Rating' },
                        { value: 'rating-asc', label: 'Lowest Rating' },
                        { value: 'price-desc', label: 'Highest Price' },
                        { value: 'price-asc', label: 'Lowest Price' },
                        { value: 'reviews-desc', label: 'Most Reviews' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSortChange(opt.value)}
                          className={`w-full text-left px-5 py-2.5 text-xs sm:text-sm transition-colors ${
                            activeFilter === opt.value ? 'bg-[#1d6b55] text-white font-bold' : 'text-gray-600 hover:bg-[#edf3ee]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modify Button */}
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                  <Button onClick={handleApplyChanges} disabled={isApplying}>
                    {isApplying ? 'Applying...' : 'Apply'}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#17372f] text-white hover:bg-[#214b40]"
                >
                  <CalendarIcon size={16} className="hidden sm:inline mr-2" />
                  <span>Modify</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Modify Form (Expandable) */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-visible mb-6"
            >
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-emerald-50 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Destination</label>
                  <Select
                    options={destinationOptions}
                    value={findDestination(editableDestination)}
                    onChange={(opt) => setEditableDestination(opt?.value || '')}
                    classNamePrefix="react-select"
                    styles={selectStyles}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Type</label>
                  <Select
                    options={data.categories}
                    value={data.categories.find(c => c.value === editableCategory)}
                    onChange={(opt) => setEditableCategory(opt.value)}
                    styles={selectStyles}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={editableDate}
                      onChange={setEditableDate}
                      className="w-full bg-[#F9FAFB] border border-gray-300 min-h-[36px] px-3 rounded-lg text-[0.85rem] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Duration</label>
                  <Select options={daysOptions} value={editableDaysRange} onChange={setEditableDaysRange} styles={selectStyles} />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">
                    {editableCategory === 'couple' ? 'Couples' : 'People'}
                  </label>
                  <div className="flex items-center bg-[#F9FAFB] border border-gray-300 rounded-lg h-[38px] hover:border-emerald-400 transition-all">
                    <button
                      type="button"
                      onClick={() => setEditablePeopleCount(prev => Math.max(prev - 1, 1))}
                      disabled={editablePeopleCount <= 1}
                      className="flex items-center justify-center w-10 h-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-l-lg transition-colors disabled:opacity-30"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="flex-1 text-center text-sm font-bold text-gray-800 select-none tabular-nums">
                      {editablePeopleCount}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditablePeopleCount(prev => Math.min(prev + 1, 50))}
                      className="flex items-center justify-center w-10 h-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-r-lg transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Body */}
        <div className="space-y-6 pb-6 pt-2 sm:pt-3">
          <div className="flex flex-col gap-4 border-b border-[#17372f]/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9b7440]">Your package shortlist</p>
              <h1 className="font-serif text-4xl leading-none tracking-[-0.04em] text-[#17372f] sm:text-5xl">
                {destinationLabel ? `${destinationLabel} trips` : 'Trip packages'}
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#60716c]">
                {guides.length > 0 ? `${guides.length} package option${guides.length === 1 ? '' : 's'} matched to your trip details.` : 'Adjust your trip details to find the right package.'}
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#17372f]/10 bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#526761]">
              <span className="h-2 w-2 rounded-full bg-[#1d6b55]" />
              {category === 'couple' ? 'Couple' : category === 'group' ? 'Group' : 'Individual'} · {peopleCount} traveller{peopleCount === 1 ? '' : 's'}
            </div>
          </div>

          <div className="grid gap-6">
            {guides.length === 0 ? (
              /* ──────── NO RESULTS: Friendly "Sorry" + Other Packages ──────── */
              <div className="space-y-8">
                {/* Sorry Message */}
                <div className="rounded-[1.5rem] border border-[#17372f]/10 bg-white px-6 py-16 text-center shadow-[0_18px_50px_-38px_rgba(23,55,47,0.55)]">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 border border-slate-200">
                    <PackageOpen className="h-8 w-8 text-[#1d6b55]" />
                  </div>
                  <h3 className="mb-2 font-serif text-2xl tracking-[-0.025em] text-[#17372f]">
                    No Exact Matches Found
                  </h3>
                  <p className="mx-auto max-w-md text-sm leading-6 text-[#60716c]">
                    {otherGuides.length > 0 
                      ? <>We couldn&apos;t find packages matching your exact criteria. But don&apos;t worry — we have other amazing offerings{destinationLabel ? ` in ${destinationLabel}` : ''} for you!</>
                      : <>No trip packages are currently available for this destination. Please try another location or check back soon!</>
                    }
                  </p>
                </div>

                {/* Other Packages Section */}
                {otherGuides.length > 0 && (
                  <div>
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-600" />
                        More Packages{destinationLabel ? ` in ${destinationLabel}` : ''}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">Here are other available trip packages that you might love:</p>
                    </div>
                    <div className="grid gap-6">
                      {otherGuides.map((guide, index) => {
                        return guide.packages.map((pkg, pIdx) => (
                          <div key={`other-${guide.id}-${pkg.id}`}>
                            <GuideCard guide={guide} category={category} daysRange={null} peopleCount={peopleCount} date={date} selectedPackage={pkg} />
                          </div>
                        ));
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ──────── HAS RESULTS: Main Results + "More Packages" Bonus ──────── */
              <>
                {guides.map((item, index) => (
                  <motion.div key={item.pkg ? `${item.guide.id}-${item.pkg.id}` : item.guide.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <GuideCard guide={item.guide} category={category} daysRange={daysRange} peopleCount={peopleCount} date={date} selectedPackage={item.pkg} />
                  </motion.div>
                ))}

                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 border-t border-[#17372f]/10 pt-7">
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page <= 1}
                      className="rounded-full border border-[#17372f]/15 bg-white px-4 py-2 text-sm font-semibold text-[#526761] transition hover:bg-[#edf3ee] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-semibold text-[#60716c]">Page {page} of {pagination.totalPages}</span>
                    <button
                      type="button"
                      onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                      disabled={!pagination.hasMore}
                      className="rounded-full bg-[#17372f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#214b40] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* ── "More Packages" Bonus Section ── */}
                {otherGuides.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-200">
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-600" />
                        More Packages{destinationLabel ? ` in ${destinationLabel}` : ''}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">Explore more trip packages available to find your perfect getaway:</p>
                    </div>
                    <div className="grid gap-6">
                      {otherGuides.map((guide, index) => {
                        return guide.packages.map((pkg, pIdx) => (
                          <div key={`other-${guide.id}-${pkg.id}`}>
                            <GuideCard guide={guide} category={category} daysRange={null} peopleCount={peopleCount} date={date} selectedPackage={pkg} />
                          </div>
                        ));
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '36px',
    fontSize: '0.85rem',
    borderColor: state.isFocused ? '#10b981' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #10b981' : null,
    '&:hover': { borderColor: state.isFocused ? '#10b981' : '#d1d5db' },
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 50,
    marginTop: '4px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 50 }),
  menuList: (provided) => ({ ...provided, padding: '4px', fontSize: '0.85rem' }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '6px',
    backgroundColor: state.isSelected ? '#f1f5f9' : state.isFocused ? '#f8fafc' : 'white',
    color: '#0f172a',
    margin: '4px 0',
    padding: '8px 12px',
    transition: 'all 0.15s ease-out',
    '&:active': { backgroundColor: '#e2e8f0', color: '#0f172a' },
    '&:hover:not(:active)': { backgroundColor: '#f1f5f9', boxShadow: 'none' },
  }),
};

export default SearchResults;
