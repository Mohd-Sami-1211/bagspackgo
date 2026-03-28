'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TrekCard from './TrekGuideCard';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Calendar as CalendarIcon, Filter, Search as SearchIcon, ChevronDown, ArrowLeft } from 'lucide-react';
import data from 'src/data/data.json';

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
  const [activeFilter, setActiveFilter] = useState(null);
  const [trekOptions, setTrekOptions] = useState([]);

  // Parse and validate search parameters
  const getValidParam = (param, defaultValue) => {
    const value = searchParams.get(param);
    return value !== null && value !== '' ? value : defaultValue;
  };

  const destination = getValidParam('destination', '');
  const trekId = getValidParam('trek', '');
  const peopleRangeParam = getValidParam('peopleRange', '');
  const dateParam = searchParams.get('date');
  const date = dateParam && !isNaN(new Date(dateParam).getTime())
    ? new Date(dateParam)
    : null;

  const peopleOptions = [
    { value: '1-2', label: '1-2 People' },
    { value: '3-5', label: '3-5 People' },
    { value: '6-9', label: '6-9 People' },
    { value: '10-15', label: '10-15 People' },
    { value: '15+', label: '15+ People' }
  ];

  const [editableDestination, setEditableDestination] = useState(destination);
  const [editableTrek, setEditableTrek] = useState(trekId);
  const [editablePeopleRange, setEditablePeopleRange] = useState(peopleRangeParam);
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
        const aPkg = a.trekPackages?.find(pkg => pkg.trekId?.toString() === trekId?.toString());
        const bPkg = b.trekPackages?.find(pkg => pkg.trekId?.toString() === trekId?.toString());
        const aPrice = aPkg?.price ?? a.price ?? 0;
        const bPrice = bPkg?.price ?? b.price ?? 0;
        return order === 'desc' ? bPrice - aPrice : aPrice - bPrice;
      }
      const aVal = a[field] || 0;
      const bVal = b[field] || 0;
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [trekId]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const baseUrl = '/api/public/treks';
        const params = new URLSearchParams({
          destination: destination || '',
          trek: trekId || '',
          peopleRange: peopleRangeParam || ''
        });

        const res = await fetch(`${baseUrl}?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setAllPackages(json.data || []);
        }
      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [destination, trekId, peopleRangeParam]);

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
      peopleRange: editablePeopleRange || '',
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
    setEditablePeopleRange(peopleRangeParam);
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
      <div className="min-h-screen bg-[#F2FFFC]">
        <motion.div 
          key="loader"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
        >
          <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-[13px] font-medium text-gray-400">Finding your perfect treks...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-blue-50 -mt-12">
      {/* Refined Header - Single Line Action Bar */}
      <div className="w-full bg-white border-b sticky top-12 z-[30] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => router.back()}
              className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-colors shrink-0"
            >
              <ArrowLeft size={20} />
            </motion.button>

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
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="p-2 sm:px-4 sm:py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-100 transition-colors border border-emerald-100/50 shadow-sm shrink-0"
                >
                  <Filter size={18} />
                  <span className="hidden sm:inline">Sort</span>
                  <ChevronDown size={14} className={`hidden sm:inline transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                
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
                  <button onClick={handleCancel} className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">Cancel</button>
                  <button onClick={handleApplyChanges} disabled={isApplying} className="px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-200">
                    {isApplying ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all flex items-center gap-1.5 shadow-md shadow-gray-200 hover:shadow-emerald-200"
                >
                  <CalendarIcon size={16} className="hidden sm:inline" />
                  <span>Modify</span>
                </button>
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
                    options={data.destinations}
                    value={editableDestination ? data.destinations.find(d => d.value === editableDestination) : null}
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
                  <Select 
                    options={peopleOptions} 
                    value={editablePeopleRange ? peopleOptions.find(p => p.value === editablePeopleRange) : null} 
                    onChange={(opt) => setEditablePeopleRange(opt?.value || '')} 
                    styles={selectStyles} 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Body */}
        <div className="py-6 space-y-6">
          <div className="grid gap-6">
            {packages.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-400 font-medium">No results found for your filters.</p>
              </div>
            ) : (
              packages.map((pkg, index) => (
                <motion.div
                  key={pkg._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TrekCard
                    pkg={pkg}
                    peopleRange={peopleRangeParam}
                    date={date}
                  />
                </motion.div>
              ))
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
    backgroundColor: state.isSelected ? '#a7f3d0' : state.isFocused ? '#d1fae5' : 'white',
    color: state.isSelected ? '#065f46' : '#1e293b',
    margin: '4px 0',
    padding: '8px 12px',
    transition: 'all 0.15s ease-out',
    '&:active': { backgroundColor: '#6ee7b7', color: '#064e3b' },
    '&:hover:not(:active)': { backgroundColor: '#d1fae5', boxShadow: 'inset 0 0 0 1px #a7f3d0' },
  }),
};

export default TrekSearchResults;