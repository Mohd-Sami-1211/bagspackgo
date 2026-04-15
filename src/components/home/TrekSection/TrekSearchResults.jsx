'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TrekCard from './TrekGuideCard';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Calendar as CalendarIcon, Filter, Search as SearchIcon, ChevronDown, ArrowLeft, Plus, Minus, PackageOpen, Sparkles } from 'lucide-react';
import data from 'src/data/data.json';
import { Button } from '@/components/ui/button';

const availableValues = ['kashmir', 'ladakh', 'bhaderwah', 'warwan-marwah-valley'];
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

const findDestination = (val) => {
  return (data.destinations || []).find(d => d.value === val) || null;
};

const TrekSearchResults = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchInputRef = useRef(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Filter/sort state
  const [sortOption, setSortOption] = useState('rating-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [allPackages, setAllPackages] = useState([]);
  const [otherPackagesList, setOtherPackagesList] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [trekOptions, setTrekOptions] = useState([]);

  // Parse and validate search parameters
  const getValidParam = (param, defaultValue) => {
    const value = searchParams.get(param);
    return value !== null && value !== '' ? value : defaultValue;
  };

  const destination = getValidParam('destination', '');
  const trekId = getValidParam('trek', '');
  
  // Support both old peopleRange and new peopleCount params
  const peopleCountParam = getValidParam('peopleCount', '');
  const peopleRangeParam = getValidParam('peopleRange', '');
  const peopleCount = peopleCountParam ? parseInt(peopleCountParam) || 1 : (peopleRangeParam ? parseInt(peopleRangeParam.split('-')[0]) || 1 : 1);
  
  const dateParam = searchParams.get('date');
  const date = dateParam && !isNaN(new Date(dateParam).getTime())
    ? new Date(dateParam)
    : null;

  // Get destination label for display  
  const destinationLabel = useMemo(() => {
    const dest = data.destinations.find(d => d.value === destination);
    return dest ? dest.label : destination ? destination.charAt(0).toUpperCase() + destination.slice(1) : '';
  }, [destination]);

  const [editableDestination, setEditableDestination] = useState(destination);
  const [editableTrek, setEditableTrek] = useState(trekId);
  const [editablePeopleCount, setEditablePeopleCount] = useState(peopleCount);
  const [editableDate, setEditableDate] = useState(date);

  // Generate trekOptions based on destination
  useEffect(() => {
    if (editableDestination && data?.treks) {
      const filteredTreks = data.treks.filter(trek =>
        trek.destinationId && trek.destinationId.toString() === editableDestination.toString()
      );
      setTrekOptions([
        { value: 'all_treks', label: 'All Treks' },
        ...filteredTreks.map(trek => ({
          value: trek.id,
          label: trek.name
        }))
      ]);
    } else {
      setTrekOptions([]);
    }
  }, [editableDestination]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const sortTreks = useCallback((treks, option) => {
    const [field, order] = option.split('-');
    return [...treks].sort((a, b) => {
      if (field === 'price') {
        // Extract price from pricingTiers or fallback to pkg.price
        const getPrice = (pkg) => {
          if (pkg.pricingTiers?.length > 0) {
            const tier = pkg.pricingTiers.find(t => peopleCount >= t.minPeople && peopleCount <= t.maxPeople) || pkg.pricingTiers[0];
            return Number(tier?.price || 0);
          }
          return Number(pkg.price || 0);
        };
        const aPrice = getPrice(a);
        const bPrice = getPrice(b);
        return order === 'desc' ? bPrice - aPrice : aPrice - bPrice;
      }
      const aVal = Number(a[field] || 0);
      const bVal = Number(b[field] || 0);
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [peopleCount]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const baseUrl = '/api/public/treks';
        const params = new URLSearchParams({
          destination: destination || '',
          trek: trekId || '',
          peopleCount: peopleCount.toString()
        });

        const res = await fetch(`${baseUrl}?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setAllPackages(json.data || []);
          setOtherPackagesList(json.otherPackages || []);
        }
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [destination, trekId, peopleCount]);

  const packages = useMemo(() => {
    let fetchedPackages = allPackages;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      fetchedPackages = fetchedPackages.filter(pkg =>
        pkg.name?.toLowerCase().includes(query) ||
        pkg.trekName?.toLowerCase().includes(query)
      );
    }
    return sortTreks(fetchedPackages, sortOption);
  }, [allPackages, searchQuery, sortOption, sortTreks]);

  const handleApplyChanges = () => {
    setIsApplying(true);
    const params = {
      destination: editableDestination || '',
      trek: editableTrek || '',
      peopleCount: editablePeopleCount.toString(),
      ...(editableDate && { date: editableDate.toISOString() })
    };
    const queryString = new URLSearchParams(params).toString();
    router.push(`/user/trek/guidelist?${queryString}`);
    setIsEditing(false);
    setIsApplying(false);
  };

  const handleCancel = () => {
    setEditableDestination(destination);
    setEditableTrek(trekId);
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
    setSortOption('rating-desc');
    setActiveFilter(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-50 -mt-12 flex flex-col items-center justify-center">
        <motion.div 
          key="loader"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-[13px] font-medium text-gray-400">Finding your perfect treks...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans pb-12 -mt-12np">
      {/* Refined Header - Single Line Action Bar */}
      <div className="w-full bg-white border-b sticky top-0 z-[30] shadow-sm">
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
                placeholder="Find a trek..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="bg-gray-50 border border-gray-100 text-gray-800 py-2 sm:py-2.5 px-4 pl-10 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-medium"
                ref={searchInputRef}
              />
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Sort Toggle */}
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="font-medium shrink-0"
                >
                  <Filter size={16} className="mr-2" />
                  <span className="hidden sm:inline">Sort</span>
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
                            activeFilter === opt.value ? 'bg-emerald-500 text-white font-bold' : 'text-gray-600 hover:bg-gray-50'
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
              <div className="bg-white rounded-2xl p-5 shadow-lg border border-emerald-50 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Destination</label>
                  <Select
                    options={destinationOptions}
                    value={findDestination(editableDestination)}
                    onChange={(opt) => {
                      setEditableDestination(opt?.value || '');
                      setEditableTrek('');
                    }}
                    classNamePrefix="react-select"
                    styles={selectStyles}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Trek Name</label>
                  <Select
                    options={trekOptions}
                    value={editableTrek ? trekOptions.find(t => t.value === editableTrek) : null}
                    onChange={(opt) => setEditableTrek(opt?.value || '')}
                    styles={selectStyles}
                    isDisabled={!editableDestination}
                    placeholder={editableDestination ? "Select Trek" : "Select Destination first"}
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
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">People</label>
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
        <div className="py-6 space-y-6">
          <div className="grid gap-6">
            {packages.length === 0 ? (
              /* ──────── NO RESULTS: Friendly "Sorry" + Other Packages ──────── */
              <div className="space-y-8">
                {/* Sorry Message */}
                <div className="text-center py-16 bg-white rounded-xl border shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 border border-slate-200">
                    <PackageOpen className="h-8 w-8 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No Exact Matches Found
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    {otherPackagesList.length > 0
                      ? <>We couldn&apos;t find trek packages matching your exact criteria. But don&apos;t worry — we have other amazing treks{destinationLabel ? ` in ${destinationLabel}` : ''} for you!</>
                      : <>No trek packages are currently available for this destination. Please try another location or check back soon!</>
                    }
                  </p>
                </div>

                {/* Other Packages Section */}
                {otherPackagesList.length > 0 && (
                  <div>
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-600" />
                        More Treks{destinationLabel ? ` in ${destinationLabel}` : ''}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">Here are other available trek packages that you might love:</p>
                    </div>
                    <div className="grid gap-6">
                      {otherPackagesList.map((pkg, index) => (
                        <div
                          key={pkg._id || index}
                        >
                          <TrekCard
                            pkg={pkg}
                            peopleCount={peopleCount}
                            date={date}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ──────── HAS RESULTS: Main Results + "More Packages" Bonus ──────── */
              <>
                {packages.map((pkg, index) => (
                  <motion.div
                    key={pkg._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TrekCard
                      pkg={pkg}
                      peopleCount={peopleCount}
                      date={date}
                    />
                  </motion.div>
                ))}

                {/* ── "More Packages" Bonus Section ── */}
                {otherPackagesList.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-slate-200">
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-600" />
                        More Treks{destinationLabel ? ` in ${destinationLabel}` : ''}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">Explore more trek packages available to find your perfect adventure:</p>
                    </div>
                    <div className="grid gap-6">
                      {otherPackagesList.map((pkg, index) => (
                        <div
                          key={`other-${pkg._id || index}`}
                        >
                          <TrekCard
                            pkg={pkg}
                            peopleCount={peopleCount}
                            date={date}
                          />
                        </div>
                      ))}
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

export default TrekSearchResults;