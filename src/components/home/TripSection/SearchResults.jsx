'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import GuideCard from './GuideCard';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Calendar as CalendarIcon, Filter, Search as SearchIcon, ChevronDown } from 'lucide-react';
import data from '@/data/data.json';

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
  const days = Math.max(1, parseInt(getValidParam('days', '1')));
  const count = Math.max(1, parseInt(getValidParam('count', '1')));
  const dateParam = searchParams.get('date');
  const date = dateParam && !isNaN(new Date(dateParam).getTime()) 
    ? new Date(dateParam) 
    : null;

  // Editable parameters
  const [editableDestination, setEditableDestination] = useState(destination);
  const [editableCategory, setEditableCategory] = useState(category);
  const [editableDays, setEditableDays] = useState(days);
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
        
        // Apply search query filters
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          results = results.filter(guide => 
            guide.name.toLowerCase().includes(query) ||
            guide.bio.toLowerCase().includes(query) ||
            (guide.specialties?.some(s => s.toLowerCase().includes(query)))
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
  }, [destination, sortOption, searchQuery]);

  const sortGuides = (guides, option) => {
    const [field, order] = option.split('-');
    return [...guides].sort((a, b) => {
      if (field === 'price') {
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
      days: editableDays || days,
      count: editableCount || count,
      ...(editableDate && { date: editableDate.toISOString() })
    };

    const queryString = new URLSearchParams(params).toString();
    router.push(`/trip/guidelist?${queryString}`);
    
    // Reset editing state after navigation
    setIsEditing(false);
    setIsApplying(false);
  };

  const handleCancel = () => {
    setEditableDestination(destination);
    setEditableCategory(category);
    setEditableDays(days);
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
    <div className="min-h-screen w-full bg-[#e9ffeeee] -mt-20 mb-10">
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Destination Field */}
            <div className="bg-[#c8fcd5e7] p-3 rounded-lg relative">
              <label className="block text-xs text-gray-900 mb-1">Destination</label>
              {isEditing ? (
                <div className="relative">
                  <Select
                    options={data.destinations}
                    value={editableDestination ? 
                      { value: editableDestination, label: editableDestination } : 
                      null
                    }
                    onChange={(option) => setEditableDestination(option?.value || '')}
                    placeholder="Enter place to search"
                    classNamePrefix="react-select"
                    isClearable
                    styles={{
                      ...inlineSelectStyles,
                      clearIndicator: (provided) => ({
                        ...provided,
                        display: 'none'
                      })
                    }}
                  />
                  {editableDestination && (
                    <div 
                      onClick={() => setEditableDestination('')}
                      className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X size={16} />
                    </div>
                  )}
                </div>
              ) : (
                <p className="font-medium">{destination || 'Any'}</p>
              )}
            </div>

            {/* Category Field */}
            <div className="bg-[#c8fcd5e7] p-3 rounded-lg">
              <label className="block text-xs text-gray-900 mb-1">Package Type</label>
              {isEditing ? (
                <Select
                  options={data.categories}
                  value={data.categories.find(cat => cat.value === editableCategory)}
                  onChange={(option) => setEditableCategory(option.value)}
                  classNamePrefix="react-select"
                  styles={inlineSelectStyles}
                />
              ) : (
                <p className="font-medium capitalize">{category}</p>
              )}
            </div>

            {/* Date Field */}
            <div className="bg-[#c8fcd5e7] p-3 rounded-lg relative">
              <label className="block text-xs text-gray-900 mb-1">Travel Date</label>
              {isEditing ? (
                <div className="relative">
                  <DatePicker
                    selected={editableDate}
                    onChange={setEditableDate}
                    placeholderText="Select date"
                    className="w-full p-1 border border-gray-300 rounded text-sm bg-white pl-2 pr-8"
                    popperClassName="z-50"
                    calendarClassName="border-0 shadow-lg"
                    showPopperArrow={false}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                    {editableDate && (
                      <div 
                        onClick={() => setEditableDate(null)}
                        className="text-gray-400 hover:text-gray-600 mr-1 cursor-pointer"
                      >
                        <X size={16} />
                      </div>
                    )}
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ) : (
                <p className="font-medium">
                  {date ? date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not specified'}
                </p>
              )}
            </div>

            {/* Days Field */}
            <div className="bg-[#c8fcd5e7] p-3 rounded-lg">
              <label className="block text-xs text-gray-900 mb-1">Duration</label>
              {isEditing ? (
                <div className="flex items-center">
                  <div 
                    onClick={() => setEditableDays(prev => Math.max(1, prev - 1))}
                    className="px-2 text-gray-600 hover:bg-gray-100 rounded-l cursor-pointer"
                  >
                    -
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={editableDays}
                    onChange={(e) => setEditableDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center border-x border-gray-300 text-sm w-12"
                  />
                  <div 
                    onClick={() => setEditableDays(prev => prev + 1)}
                    className="px-2 text-gray-600 hover:bg-gray-100 rounded-r cursor-pointer"
                  >
                    +
                  </div>
                </div>
              ) : (
                <p className="font-medium">{days} day{days > 1 ? 's' : ''}</p>
              )}
            </div>

            {/* Count Field */}
            <div className="bg-[#c8fcd5e7] p-3 rounded-lg">
              <label className="block text-xs text-gray-900 mb-1">
                {category === 'couple' ? 'Couples' : 'People'}
              </label>
              {isEditing ? (
                <div className="flex items-center">
                  <div 
                    onClick={() => setEditableCount(prev => Math.max(1, prev - 1))}
                    className="px-2 text-gray-600 hover:bg-gray-100 rounded-l cursor-pointer"
                  >
                    -
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={editableCount}
                    onChange={(e) => setEditableCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 text-center border-x border-gray-300 text-sm w-12"
                  />
                  <div 
                    onClick={() => setEditableCount(prev => prev + 1)}
                    className="px-2 text-gray-600 hover:bg-gray-100 rounded-r cursor-pointer"
                  >
                    +
                  </div>
                </div>
              ) : (
                <p className="font-medium">{count} {category === 'couple' ? 'couples' : 'people'}</p>
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
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
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
          {guides.map((guide, index) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GuideCard 
                guide={guide}
                category={category}
                days={days}
              />
            </motion.div>
          ))}
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