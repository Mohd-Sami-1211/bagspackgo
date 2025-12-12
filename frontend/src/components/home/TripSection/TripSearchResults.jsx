'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import GuideCard from './TripGuideCard';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Calendar as CalendarIcon, Filter, Search as SearchIcon, ChevronDown } from 'lucide-react';
import data from 'src/data/data.json';

const SearchResults = () => {
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
  const [guides, setGuides] = useState([]);
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
  const count = Math.max(1, parseInt(getValidParam('count', '1')));
  const dateParam = searchParams.get('date');
  const date = dateParam && !isNaN(new Date(dateParam).getTime()) 
    ? new Date(dateParam) 
    : null;

  // Days range options (should match the options in TripSearchInput)
  const daysOptions = [
    { value: '0-3', label: '0-3 days' },
    { value: '3-5', label: '3-5 days' },
    { value: '5-7', label: '5-7 days' },
    { value: '7-9', label: '7-9 days' },
    { value: 'other', label: 'Others' }
  ];

  // Get label for display
  const getDaysRangeLabel = (value) => {
    const option = daysOptions.find(opt => opt.value === value);
    return option ? option.label : 'Any';
  };

  // Function to get packages within selected range
  const getPackagesInRange = (guide, daysRange) => {
    if (!daysRange || !guide.packages || guide.packages.length === 0) {
      return []; // Return empty array if no days range or no packages
    }

    // Parse the days range (e.g., "3-5" -> minDays=3, maxDays=5)
    const [minDays, maxDays] = daysRange.split('-').map(Number);
    
    // Get all packages within this range
    return guide.packages.filter(pkg => {
      const packageDays = pkg.days;
      return packageDays >= minDays && packageDays <= maxDays;
    });
  };

  // Editable parameters
  const [editableDestination, setEditableDestination] = useState(destination);
  const [editableCategory, setEditableCategory] = useState(category);
  const [editableDaysRange, setEditableDaysRange] = useState(
    daysOptions.find(opt => opt.value === daysRange) || null
  );
  const [editableCount, setEditableCount] = useState(count);
  const [editableDate, setEditableDate] = useState(date);

  // Debounced search function
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {
      // Search logic handled in useEffect
    }, 300));
  }, [searchTimeout]);

  // Fetch and filter guides
  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        let results = data.guides;
        
        // Filter by destination if specified
        if (destination) {
          results = results.filter(guide => 
            guide.location.toLowerCase().includes(destination.toLowerCase())
          );
        }
        
        // Filter by days range if specified
        if (daysRange) {
          results = results.filter(guide => {
            const packagesInRange = getPackagesInRange(guide, daysRange);
            return packagesInRange.length > 0; // Show guides that have at least one package in range
          });
        }
        
        // Apply search query filters
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          results = results.filter(guide => 
            guide.name.toLowerCase().includes(query)
          );
        }
        
        // Sort results
        results = sortGuides(results, sortOption);
        setGuides(results);
      } catch (error) {
        console.error('Error loading guides:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuides();
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [destination, daysRange, sortOption, searchQuery]);

  const sortGuides = (guides, option) => {
    const [field, order] = option.split('-');
    return [...guides].sort((a, b) => {
      if (field === 'price') {
        // For price sorting, use the base daily rate
        const aPrice = a.price[category] || a.price.individual;
        const bPrice = b.price[category] || b.price.individual;
        return order === 'desc' ? bPrice - aPrice : aPrice - bPrice;
      }
      return order === 'desc' ? b[field] - a[field] : a[field] - b[field];
    });
  };

  const handleApplyChanges = () => {
    setIsApplying(true);
    
    const params = {
      destination: editableDestination || destination,
      category: editableCategory || category,
      daysRange: editableDaysRange?.value || '',
      count: editableCount || count,
      ...(editableDate && { date: editableDate.toISOString() })
    };

    const queryString = new URLSearchParams(params).toString();
    router.push(`/user/trip/guidelist?${queryString}`);
    
    // Reset editing state after navigation
    setIsEditing(false);
    setIsApplying(false);
  };

  const handleCancel = () => {
    setEditableDestination(destination);
    setEditableCategory(category);
    setEditableDaysRange(daysOptions.find(opt => opt.value === daysRange) || null);
    setEditableCount(count);
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
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 to-blue-50 -mt-20 mb-10">
      {/* Search Parameters Bar */}
      <div className="w-full bg-white border-b-2">
        <div className=" px-4 py-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {isEditing ? 'Modify Your Trip' : `Your Trip to ${destination || 'All Destinations'}`}
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
                  className="px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium flex items-center gap-2"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {/* Destination Field */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-2.5 sm:p-3 rounded-lg">
              <label className="block text-[11px] sm:text-xs text-gray-900 mb-0.5 sm:mb-1">Destination</label>
              {isEditing ? (
                <div className="relative z-50">
                  <Select
                    options={data.destinations}
                    value={
                      editableDestination
                        ? { value: editableDestination, label: editableDestination }
                        : null
                    }
                    onChange={(option) => setEditableDestination(option?.value || '')}
                    placeholder="Enter place to search"
                    classNamePrefix="react-select"
                    isClearable
                    styles={{
                      ...inlineSelectStyles,
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: '32px',
                        height: '32px',
                        fontSize: '13px',
                        fontWeight: '500',
                        borderColor: state.isFocused ? '#10b981' : '#d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 1px #10b981' : 'none',
                        '&:hover': {
                          borderColor: state.isFocused ? '#10b981' : '#d1d5db',
                        },
                        width: '100%',
                        padding: '0 0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                      }),
                      input: (provided) => ({
                        ...provided,
                        margin: 0,
                        padding: 0,
                        width: '100%',
                        color: '#111827',
                        fontSize: '13px',
                        fontWeight: '500',
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: '#6b7280',
                        fontSize: '13px',
                        fontWeight: '400',
                        width: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: '#111827',
                        fontSize: '13px',
                        fontWeight: '500',
                        width: '100%',
                      }),
                    }}
                  />
                </div>
              ) : (
                <p className="font-medium text-xs sm:text-sm h-[32px] sm:h-[36px] flex items-center text-gray-900">
                  {destination || 'Any'}
                </p>
              )}
            </div>

            {/* Category Field */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-2.5 sm:p-3 rounded-lg">
              <label className="block text-[11px] sm:text-xs text-gray-900 mb-0.5 sm:mb-1">Package Type</label>
              {isEditing ? (
                <Select
                  options={data.categories}
                  value={data.categories.find((cat) => cat.value === editableCategory)}
                  onChange={(option) => setEditableCategory(option.value)}
                  classNamePrefix="react-select"
                  styles={{
                    ...inlineSelectStyles,
                    control: (provided, state) => ({
                      ...provided,
                      height: '32px',
                      minHeight: '32px',
                      fontSize: '13px',
                      fontWeight: '500',
                      borderColor: state.isFocused ? '#10b981' : '#d1d5db',
                      boxShadow: state.isFocused ? '0 0 0 1px #10b981' : 'none',
                      '&:hover': {
                        borderColor: state.isFocused ? '#10b981' : '#d1d5db',
                      },
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: '#111827',
                      fontSize: '13px',
                      fontWeight: '500',
                    }),
                  }}
                />
              ) : (
                <p className="font-medium text-xs sm:text-sm h-[32px] sm:h-[36px] flex items-center text-gray-900 capitalize">
                  {category}
                </p>
              )}
            </div>

            {/* Date Field */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-2.5 sm:p-3 rounded-lg">
              <label className="block text-[11px] sm:text-xs text-gray-900 mb-0.5 sm:mb-1">Travel Date</label>
              {isEditing ? (
                <div className="relative h-[32px] sm:h-[36px]">
                  <DatePicker
                    selected={editableDate}
                    onChange={setEditableDate}
                    placeholderText="Select date"
                    className="w-full p-1 border border-gray-300 rounded text-xs sm:text-sm bg-white pl-2 pr-7 sm:pr-8 h-[32px] sm:h-[36px] focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    popperClassName="z-50"
                    calendarClassName="border-0 shadow-lg"
                    showPopperArrow={false}
                  />
                  <CalendarIcon className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 h-3.5 sm:h-4 w-3.5 sm:w-4 text-gray-400" />
                </div>
              ) : (
                <p className="font-medium text-xs sm:text-sm h-[32px] sm:h-[36px] flex items-center text-gray-900">
                  {date
                    ? date.toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Not specified'}
                </p>
              )}
            </div>

            {/* Days Range Field */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-2.5 sm:p-3 rounded-lg">
              <label className="block text-[11px] sm:text-xs text-gray-900 mb-0.5 sm:mb-1">Duration</label>
              {isEditing ? (
                <Select
                  options={daysOptions}
                  value={editableDaysRange}
                  onChange={setEditableDaysRange}
                  placeholder="Select days range"
                  classNamePrefix="react-select"
                  isClearable
                  styles={{
                    ...inlineSelectStyles,
                    control: (provided, state) => ({
                      ...provided,
                      height: '32px',
                      minHeight: '32px',
                      fontSize: '13px',
                      fontWeight: '500',
                      borderColor: state.isFocused ? '#10b981' : '#d1d5db',
                      boxShadow: state.isFocused ? '0 0 0 1px #10b981' : 'none',
                      '&:hover': {
                        borderColor: state.isFocused ? '#10b981' : '#d1d5db',
                      },
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: '#111827',
                      fontSize: '13px',
                      fontWeight: '500',
                    }),
                  }}
                />
              ) : (
                <p className="font-medium text-xs sm:text-sm h-[32px] sm:h-[36px] flex items-center text-gray-900">
                  {getDaysRangeLabel(daysRange)}
                </p>
              )}
            </div>

            {/* Count Field */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-2.5 sm:p-3 rounded-lg">
              <label className="block text-[11px] sm:text-xs text-gray-900 mb-0.5 sm:mb-1">
                {category === 'couple' ? 'Couples' : 'People'}
              </label>
              {isEditing ? (
                <div className="flex items-center h-[32px] sm:h-[36px] bg-white border border-gray-300 rounded overflow-hidden focus-within:ring-1 focus-within:ring-green-500 focus-within:border-green-500">
                  <button
                    type="button"
                    onClick={() =>
                      setEditableCount((prev) => Math.max(1, prev === '' ? 0 : parseInt(prev) - 1))
                    }
                    className="px-2 text-gray-600 hover:bg-gray-100 h-full flex items-center"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={editableCount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditableCount(value === '' ? '' : Math.max(1, parseInt(value) || 1));
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '' || e.target.value === '0') {
                        setEditableCount(1);
                      }
                    }}
                    className="flex-1 text-center border-x border-gray-300 text-xs sm:text-sm h-full w-12 focus:outline-none font-medium text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setEditableCount((prev) => (prev === '' ? 2 : parseInt(prev) + 1))
                    }
                    className="px-2 text-gray-600 hover:bg-gray-100 h-full flex items-center"
                  >
                    +
                  </button>
                </div>
              ) : (
                <p className="font-medium text-xs sm:text-sm h-[32px] sm:h-[36px] flex items-center text-gray-900">
                  {count}{' '}
                  {category === 'couple'
                    ? count === 1
                      ? 'couple'
                      : 'couples'
                    : count === 1
                    ? 'person'
                    : 'people'}
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
            {guides.length} {guides.length === 1 ? 'Guide' : 'Guides'} Available
            {daysRange && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                (Showing guides with {getDaysRangeLabel(daysRange)} packages)
              </span>
            )}
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
                      {activeFilter === 'reviews-desc' && 'Most Reviews'}
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
              
              {/* Dropdown Menu */}
              {showSortDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute sm:right-0 sm:left-auto left-[0%] -translate-x-1/2 mt-2 w-56 max-w-[90vw] bg-white rounded-md shadow-lg z-50 border border-gray-200"
                >
                  <div className="p-2">
                    <div
                      className="px-3 py-2 text-sm hover:bg-green-50 rounded cursor-pointer"
                      onClick={() => handleSortChange('rating-desc')}
                    >
                      Highest Rating
                    </div>
                    <div
                      className="px-3 py-2 text-sm hover:bg-green-50 rounded cursor-pointer"
                      onClick={() => handleSortChange('rating-asc')}
                    >
                      Lowest Rating
                    </div>
                    <div
                      className="px-3 py-2 text-sm hover:bg-green-50 rounded cursor-pointer"
                      onClick={() => handleSortChange('price-desc')}
                    >
                      Highest Price
                    </div>
                    <div
                      className="px-3 py-2 text-sm hover:bg-green-50 rounded cursor-pointer"
                      onClick={() => handleSortChange('price-asc')}
                    >
                      Lowest Price
                    </div>
                    <div
                      className="px-3 py-2 text-sm hover:bg-green-50 rounded cursor-pointer"
                      onClick={() => handleSortChange('reviews-desc')}
                    >
                      Most Reviews
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

        {/* Guides List */}
        <div className="grid gap-6">
          {guides.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                {daysRange ? `No guides found with ${getDaysRangeLabel(daysRange)} packages` : 'No guides found'}
              </div>
              <p className="text-gray-400">
                Try adjusting your search criteria or select a different duration range
              </p>
            </div>
          ) : (
            guides.map((guide, index) => {
              // Get all packages for this guide within the selected range
              const packagesInRange = getPackagesInRange(guide, daysRange);
              
              // If no daysRange selected, show all packages (or just the guide)
              if (!daysRange || packagesInRange.length === 0) {
                return (
                  <motion.div
                    key={guide.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GuideCard 
                      guide={guide}
                      category={category}
                      daysRange={daysRange}
                      count={count}  
                      date={date}
                      packagesInRange={packagesInRange}
                    />
                  </motion.div>
                );
              }
              
              // If there are packages in range, create a card for EACH package
              return packagesInRange.map((pkg, pkgIndex) => (
                <motion.div
                  key={`${guide.id}-${pkg.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index * 0.05) + (pkgIndex * 0.02) }}
                >
                  <GuideCard 
                    guide={guide}
                    category={category}
                    daysRange={daysRange}
                    count={count}  
                    date={date}
                    selectedPackage={pkg} // Pass the specific package
                  />
                </motion.div>
              ));
            })
          )}
        </div>
      </div>
    </div>
  );
};

const inlineSelectStyles = {
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

export default SearchResults;