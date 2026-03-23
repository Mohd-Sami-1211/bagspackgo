'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import TrekCard from './TrekGuideCard';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Calendar as CalendarIcon, Search as SearchIcon, ChevronDown, Mountain, Star } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

  // Filter/sort state
  const [sortOption, setSortOption] = useState('rating-desc');
  const [treks, setTreks] = useState([]);
  const [packages, setPackages] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);

  // Parse search parameters with proper validation
  const getValidParam = (param, defaultValue) => {
    const value = searchParams.get(param);
    return value !== null && value !== '' ? value : defaultValue;
  };

  // State initialization - KEY CHANGE: Using single state for individuals
  const destination = getValidParam('destination', '');
  const trekId = getValidParam('trek', '');
  const trekType = getValidParam('type', 'trekking');
  const peopleRangeParam = getValidParam('peopleRange', '');
  const dateParam = searchParams.get('date');
  const date = dateParam && !isNaN(new Date(dateParam).getTime())
    ? new Date(dateParam)
    : null;
  // Editable state
  const [editableDestination, setEditableDestination] = useState(destination);
  const [editableTrek, setEditableTrek] = useState(trekId);
  const [editableTrekType, setEditableTrekType] = useState(trekType);
  const [editablePeopleRange, setEditablePeopleRange] = useState(peopleRangeParam);
  const [editableDate, setEditableDate] = useState(date);

  // Search function with debounce
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {
      // Search logic handled in useEffect
    }, 300));
  }, [searchTimeout]);

  // Sorting functions
  const sortTreks = (treks, option) => {
    const [field, order] = option.split('-');
    return [...treks].sort((a, b) => {
      if (field === 'price') {
        return order === 'desc' ? (b.price || 0) - (a.price || 0) : (a.price || 0) - (b.price || 0);
      }
      return order === 'desc' ? (b[field] || 0) - (a[field] || 0) : (a[field] || 0) - (b[field] || 0);
    });
  };

  const sortGuides = (guides, option) => {
    const [field, order] = option.split('-');

    return [...guides].sort((a, b) => {
      // Sort by trek package price if trekId exists
      if (field === 'price' && trekId) {
        const aPkg = a.trekPackages?.find(pkg => pkg.trekId?.toString() === trekId.toString());
        const bPkg = b.trekPackages?.find(pkg => pkg.trekId?.toString() === trekId.toString());
        const aPrice = aPkg?.price ?? 0;
        const bPrice = bPkg?.price ?? 0;
        return order === 'desc' ? bPrice - aPrice : aPrice - bPrice;
      }

      // Sort by rating
      if (field === 'rating') {
        return order === 'desc'
          ? (b.rating || 0) - (a.rating || 0)
          : (a.rating || 0) - (b.rating || 0);
      }

      return 0;
    });
  };

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
          let fetchedPackages = json.data || [];

          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            fetchedPackages = fetchedPackages.filter(pkg =>
              pkg.name?.toLowerCase().includes(query) ||
              pkg.trekName?.toLowerCase().includes(query)
            );
          }

          fetchedPackages = sortTreks(fetchedPackages, sortOption);
          setPackages(fetchedPackages);
        }

      } catch (error) {
        console.error('Error loading results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [destination, trekId, trekType, sortOption, searchQuery]);


  // Apply changes handler
  const handleApplyChanges = () => {
    setIsApplying(true);

    const params = {
      destination: editableDestination || destination,
      trek: editableTrek || trekId,
      type: editableTrekType || trekType,
      peopleRange: editablePeopleRange || peopleRangeParam,
      ...(editableDate && { date: editableDate.toISOString() })
    };

    const queryString = new URLSearchParams(params).toString();
    router.push(`/user/trek/guidelist?${queryString}`);

    setIsEditing(false);
    setIsApplying(false);
  };

  // Cancel handler
  const handleCancel = () => {
    setEditableDestination(destination);
    setEditableTrek(trekId);
    setEditableTrekType(trekType);
    setEditablePeopleRange(peopleRangeParam);
    setEditableDate(date);
    setIsEditing(false);
  };

  // Sort handler
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
          <p className="text-[13px] font-medium text-gray-400">Loading finding your perfect Treks...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-blue-50 -mt-20 mb-10">
      {/* Search Parameters Bar */}
      <div className="w-full bg-white border-b-2">
        <div className="px-4 py-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Modify Your Trek' :
                `Browse ${trekType} Treks`}
            </h2>

            {isEditing ? (
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApplyChanges}
                  disabled={isApplying}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium flex items-center gap-2"
                >
                  {isApplying ? 'Applying...' : 'Apply Changes'}
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-green-100 hover:bg-green-300 hover:text-gray-900 text-gray-700 rounded-md text-sm font-medium flex items-center gap-2"
              >
                Modify Search
              </motion.button>
            )}
          </div>

          {/* Parameter Display/Edit */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Destination Field */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-3 rounded-lg">
              <label className="block text-xs text-gray-900 mb-1">Destination</label>
              {isEditing ? (
                <div className="relative">
                  <Select
                    options={data.destinations || []}
                    value={editableDestination ?
                      data.destinations.find(d => d.value === editableDestination) || null : null}
                    onChange={(option) => {
                      setEditableDestination(option?.value || '');
                      setEditableTrek('');
                    }}
                    placeholder="Select destination"
                    classNamePrefix="react-select"
                    isClearable
                    styles={greenSelectStyles}
                  />
                </div>
              ) : (
                <p className="font-medium text-sm h-[36px] flex items-center">
                  {editableDestination === 'all_treks' ? 'All Treks' : (data.destinations.find(d => d.value === destination)?.label || 'Any')}
                </p>
              )}
            </div>

            {/* Trek Name Field */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-3 rounded-lg">
              <label className="block text-xs text-gray-900 mb-1">Trek Name</label>
              <div className="relative">
                <p className="font-medium text-sm h-[36px] flex items-center truncate">
                  {trekId ? trekId : 'Not specified'}
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-3 rounded-lg">
              <label className="block text-xs text-gray-900 mb-1">Trek Date</label>
              {isEditing ? (
                <div className="relative">
                  <DatePicker
                    selected={editableDate}
                    onChange={setEditableDate}
                    placeholderText="Select date"
                    className="w-full p-2 border border-gray-300 rounded text-sm bg-white pl-2 pr-8 h-[36px]"
                    popperClassName="z-50"
                    calendarClassName="border-0 shadow-lg"
                    showPopperArrow={false}
                    minDate={new Date()}
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              ) : (
                <p className="font-medium text-sm h-[36px] flex items-center">
                  {date ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not specified'}
                </p>
              )}
            </div>

            {/* People Range Field */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-3 rounded-lg">
              <label className="block text-xs text-gray-900 mb-1">People Range</label>
              {isEditing ? (
                <div className="relative">
                  <Select
                    options={[
                      { value: '1-2', label: '1-2 People' },
                      { value: '3-5', label: '3-5 People' },
                      { value: '6-9', label: '6-9 People' },
                      { value: '10-15', label: '10-15 People' },
                      { value: '15+', label: '15+ People' }
                    ]}
                    value={editablePeopleRange ? { value: editablePeopleRange, label: `${editablePeopleRange} People` } : null}
                    onChange={(option) => setEditablePeopleRange(option?.value || '')}
                    placeholder="Select range"
                    classNamePrefix="react-select"
                    isClearable
                    styles={greenSelectStyles}
                  />
                </div>
              ) : (
                <p className="font-medium text-sm h-[36px] flex items-center">
                  {peopleRangeParam ? `${peopleRangeParam} people` : 'Select range'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Results Section */}
      <div className="w-full mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {`${packages.length} ${packages.length === 1 ? 'Package' : 'Packages'} Available`}
          </h3>

          <div className="flex items-center gap-3">
            {/* Sort By Dropdown */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="px-4 py-2 bg-white/90 text-green-700 border border-gray-300 rounded-md text-sm font-medium flex items-center gap-2 cursor-pointer"
              >
                {activeFilter ? (
                  <div className="flex items-center">
                    <span>
                      {activeFilter === 'rating-desc' && 'Highest Rating'}
                      {activeFilter === 'rating-asc' && 'Lowest Rating'}
                      {activeFilter === 'price-desc' && 'Highest Price'}
                      {activeFilter === 'price-asc' && 'Lowest Price'}
                    </span>
                    <div
                      onClick={clearFilter}
                      className="text-green-600 hover:text-green-800 ml-1 cursor-pointer"
                    >
                      <X size={16} />
                    </div>
                  </div>
                ) : (
                  <>
                    <span>Sort By</span>
                    <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                  </>
                )}
              </motion.div>

              {showSortDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                >
                  <div className="p-2">
                    <div
                      className="px-3 py-2 text-sm hover:bg-green-50 rounded cursor-pointer"
                      onClick={() => handleSortChange('rating-desc')}
                    >
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Highest Rating
                      </div>
                    </div>
                    <div
                      className="px-3 py-2 text-sm hover:bg-green-50 rounded cursor-pointer"
                      onClick={() => handleSortChange('rating-asc')}
                    >
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Lowest Rating
                      </div>
                    </div>
                    <div
                      className="px-3 py-2 text-sm hover:bg-green-50 rounded cursor-pointer"
                      onClick={() => handleSortChange('price-desc')}
                    >
                      <div className="flex items-center gap-2">
                        <Mountain className="h-4 w-4" />
                        Highest Price
                      </div>
                    </div>
                    <div
                      className="px-3 py-2 text-sm hover:bg-green-50 rounded cursor-pointer"
                      onClick={() => handleSortChange('price-asc')}
                    >
                      <div className="flex items-center gap-2">
                        <Mountain className="h-4 w-4" />
                        Lowest Price
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pl-10 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                ref={searchInputRef}
              />
              <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              {searchQuery && (
                <div
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={16} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="grid gap-6">
          {packages.length > 0 ? (
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
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-700">No packages found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search parameters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const greenSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '30px',
    fontSize: '0.875rem',
    borderColor: state.isFocused ? '#10b981' : '#d1d5db',
    borderRadius: '0.375rem',
    boxShadow: state.isFocused ? '0 0 0 1px #10b981' : 'none',
    '&:hover': { borderColor: '#10b981' },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
  }),
  input: (provided) => ({
    ...provided,
    margin: 0,
    padding: 0,
    color: '#374151',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    padding: '0 4px',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    padding: '4px',
    color: '#6b7280',
    '&:hover': {
      color: '#374151',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '0.875rem',
    padding: '8px 12px',
    backgroundColor: state.isSelected
      ? '#d1fae5'
      : state.isFocused
        ? '#ecfdf5'
        : 'white',
    color: state.isSelected ? '#065f46' : '#374151',
    '&:active': {
      backgroundColor: '#d1fae5',
    },
  }),
  menu: (provided) => ({
    ...provided,
    marginTop: '4px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#374151',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9ca3af',
  }),
};

export default TrekSearchResults;