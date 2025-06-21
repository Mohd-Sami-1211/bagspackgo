'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronDown, ChevronUp, RefreshCcw, ArrowDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import MergeCard from '@/components/home/MergerSection/MergeCard';
import data from '@/data/data.json';
import { Search, Calendar, User, Tag, MapPin } from 'lucide-react';

const MergerMainContent = () => {
  // State for mergers and filters
  const [filteredMergers, setFilteredMergers] = useState([]);
  const [displayedMergers, setDisplayedMergers] = useState([]);
  const [displayCount, setDisplayCount] = useState(6);
  const [categorySearch, setCategorySearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [guideSearch, setGuideSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    destination: [],
    guide: [],
    date: null,
    dateRange: { start: null, end: null },
    category: [],
    sort: null
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeDateField, setActiveDateField] = useState('start');

  // Priority scoring function (reusable)
  const getPriorityScore = (text, query) => {
    if (!text || !query) return 0;
    
    const textStr = String(text);
    const queryStr = String(query);
    
    const lowerText = textStr.toLowerCase();
    const lowerQuery = queryStr.toLowerCase();
    
    if (lowerText.startsWith(lowerQuery)) return 3;
    if (lowerText.includes(lowerQuery)) return 2;
    if (lowerText.split(' ').some(word => word.startsWith(lowerQuery))) return 1;
    return 0;
  };

  // Unified search function with priority
  const performSearch = (query) => {
    if (!query || typeof query.trim !== 'function' || !query.trim()) {
      resetSearch();
      return;
    }
    
    const trimmedQuery = query.trim();
    setSearchQuery(trimmedQuery);
    setActiveSearch(true);
    setShowSuggestions(false);
    
    // Search mergers
    const foundMergers = getFilteredMergers(trimmedQuery);
    
    setDisplayedMergers(foundMergers);
  };

  // Reset search to original state
  const resetSearch = () => {
    setSearchQuery('');
    setActiveSearch(false);
    setShowSuggestions(false);
    setDisplayedMergers(filteredMergers.slice(0, displayCount));
  };

  // Enhanced suggestions generator
  const getPrioritySuggestions = useMemo(() => {
    const generateSuggestions = (query) => {
      if (!query || !query.trim()) return [];
      
      const q = query.toLowerCase();
      const categories = [
        {
          name: 'Mergers',
          data: data.mergers || [],
          fields: [
            { name: 'id', weight: 3 },
            { name: 'title', weight: 2 }
          ],
          icon: <Calendar className="mr-2 text-green-500" size={16} />
        },
        {
          name: 'Guides',
          data: data.guides || [],
          fields: [
            { name: 'name', weight: 3 }
          ],
          icon: <User className="mr-2 text-green-500" size={16} />
        },
        {
          name: 'Destinations',
          data: data.destinations || [],
          fields: [
            { name: 'label', weight: 3 }
          ],
          icon: <MapPin className="mr-2 text-green-500" size={16} />
        },
        {
          name: 'Categories',
          data: ['Male Only', 'Female Only', 'General'],
          fields: [
            { name: 'category', weight: 2 }
          ],
          icon: <Tag className="mr-2 text-green-500" size={16} />
        }
      ];

      return categories.map(category => {
        const items = category.data
          .map(item => {
            let priority = 0;
            
            category.fields.forEach(field => {
              const value = item[field.name] || item;
              priority += getPriorityScore(value, q) * field.weight;
            });

            return { ...item, priority, type: category.name.toLowerCase() };
          })
          .filter(item => item.priority > 0)
          .sort((a, b) => b.priority - a.priority)
          .slice(0, 5);

        return items.length > 0 ? {
          category: category.name,
          items,
          icon: category.icon
        } : null;
      }).filter(Boolean);
    };

    return generateSuggestions;
  }, [data]);

  // Filter mergers with enhanced priority
  const getFilteredMergers = useMemo(() => {
    const filterMergers = (query) => {
      if (!query || !query.trim()) return [];
      
      const q = query.toLowerCase();
      return (data.mergers || [])
        .map(merger => {
          let priority = 0;
          
          // Direct matches
          priority += getPriorityScore(merger?.id, q) * 3;
          priority += getPriorityScore(merger?.title, q) * 3;
          priority += getPriorityScore(merger?.category, q) * 2;
          
          // Destination matches
          if (merger.destination) {
            const destination = (data.destinations || [])
              .find(d => d.value === merger.destination);
            if (destination) {
              // Exact match gets highest priority
              if (destination.label.toLowerCase() === q) {
                priority += 20;
              }
              // Partial match
              else if (destination.label.toLowerCase().includes(q)) {
                priority += 10;
              }
              // Check destination keywords if they exist
              else if (destination.keywords?.some(kw => kw.toLowerCase().includes(q))) {
                priority += 8;
              }
            }
          }
          
          // Guide matches
          if (merger.guideId) {
            const guide = (data.guides || [])
              .find(g => g.id === merger.guideId);
            priority += getPriorityScore(guide?.name, q) * 2;
          }
          
          return { ...merger, priority };
        })
        .filter(merger => merger.priority > 0)
        .sort((a, b) => b.priority - a.priority);
    };

    return filterMergers;
  }, [data]);

  // Apply filters when component mounts or filters change
  useEffect(() => {
    let results = [...data.mergers];

    // Destination filter
    if (filters.destination.length > 0) {
      results = results.filter(merger => 
        filters.destination.includes(merger.destinationId)
      );
    }

    // Guide filter
    if (filters.guide.length > 0) {
      results = results.filter(merger => 
        filters.guide.includes(merger.guideId)
      );
    }

    // Category filter
    if ((filters.category || []).length > 0) {
      results = results.filter(merger => 
        (filters.category || []).includes(merger.category)
      );
    }

    // Date filter
    if (filters.date) {
      const today = new Date();
      switch (filters.date) {
        case 'Today':
          results = results.filter(merger => 
            new Date(merger.date).toDateString() === today.toDateString()
          );
          break;
        case 'Tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          results = results.filter(merger => 
            new Date(merger.date).toDateString() === tomorrow.toDateString()
          );
          break;
        case 'This Week':
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          results = results.filter(merger => {
            const mergerDate = new Date(merger.date);
            return mergerDate >= today && mergerDate <= nextWeek;
          });
          break;
        case 'This Month':
          const nextMonth = new Date(today);
          nextMonth.setMonth(today.getMonth() + 1);
          results = results.filter(merger => {
            const mergerDate = new Date(merger.date);
            return mergerDate >= today && mergerDate <= nextMonth;
          });
          break;
      }
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      results = results.filter(merger => {
        const mergerDate = new Date(merger.date);
        if (filters.dateRange.start && filters.dateRange.end) {
          return mergerDate >= new Date(filters.dateRange.start) && 
                 mergerDate <= new Date(filters.dateRange.end);
        } else if (filters.dateRange.start) {
          return mergerDate >= new Date(filters.dateRange.start);
        } else if (filters.dateRange.end) {
          return mergerDate <= new Date(filters.dateRange.end);
        }
        return true;
      });
    }

    // Sort filter
    if (filters.sort) {
      switch (filters.sort) {
        case 'Price: Low to High':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'Price: High to Low':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'Date: Nearest First':
          results.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case 'Date: Farthest First':
          results.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
      }
    } else {
      results.sort((a, b) => {
        if (a.slotsLeft !== b.slotsLeft) {
          return a.slotsLeft - b.slotsLeft;
        }
        return new Date(a.date) - new Date(b.date);
      });
    }

    setFilteredMergers(results);
  }, [filters]);

  // Update displayed mergers
  useEffect(() => {
    const hasFilters = Object.values(filters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : filter !== null && 
      !(typeof filter === 'object' && filter.start === null && filter.end === null)
    );

    if (hasFilters) {
      setDisplayedMergers(filteredMergers);
    } else if (!activeSearch) {
      setDisplayedMergers(filteredMergers.slice(0, displayCount));
    }
  }, [filteredMergers, filters, displayCount, activeSearch]);

  // Toggle dropdown
  const toggleDropdown = (dropdown) => {
    if (openDropdown !== dropdown) {
      setTempFilters({ ...filters });
    }
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Handle temporary filter changes
  const handleTempFilterChange = (filterType, value) => {
    setTempFilters(prev => {
      if (Array.isArray(prev[filterType])) {
        const current = [...prev[filterType]];
        const index = current.indexOf(value);
        if (index > -1) {
          current.splice(index, 1);
        } else {
          current.push(value);
        }
        return { ...prev, [filterType]: current };
      }
      return { ...prev, [filterType]: value };
    });
  };

  // Handle date range change
  const handleDateRangeChange = (date, type) => {
    setTempFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: date
      }
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setFilters({ ...tempFilters });
    setOpenDropdown(null);
    setDisplayCount(6);
  };

  // Clear specific filter
  const clearAppliedFilter = (filterType, value = null) => {
    if (value) {
      if (Array.isArray(filters[filterType])) {
        setFilters(prev => ({
          ...prev,
          [filterType]: prev[filterType].filter(item => item !== value)
        }));
      }
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: Array.isArray(prev[filterType]) ? [] : null,
        ...(filterType === 'dateRange' && { dateRange: { start: null, end: null } })
      }));
    }
  };

  // Reset all filters
  const resetAllFilters = () => {
    setFilters({
      destination: [],
      guide: [],
      date: null,
      dateRange: { start: null, end: null },
      category: [],
      sort: null
    });
    setTempFilters({
      destination: [],
      guide: [],
      date: null,
      dateRange: { start: null, end: null },
      category: [],
      sort: null
    });
    setDisplayCount(6);
    resetSearch();
  };

  // Get filtered guides based on selected destinations
  const getFilteredGuides = () => {
    if (filters.destination.length === 0) return data.guides;
    return data.guides.filter(guide => 
      filters.destination.includes(guide.location)
    );
  };

  // Helper functions
  const getDestinationLabel = (id) => {
    const destination = data.destinations.find(d => d.value === id);
    return destination ? destination.label : id;
  };

  const getGuideName = (id) => {
    const guide = data.guides.find(g => g.id === id);
    return guide ? guide.name : id;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const loadMoreMergers = () => {
    setDisplayCount(prev => prev + 6);
  };

  // Event handlers
  const handleSuggestionClick = (value) => {
    setSearchQuery(value);
    performSearch(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      performSearch(searchQuery);
    }
  };

  const handleSearchClick = () => {
    performSearch(searchQuery);
  };

  const hasFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter !== null && 
    !(typeof filter === 'object' && filter.start === null && filter.end === null)
  );

  if (data.mergers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto mt-8 py-2 px-4 bg-[#e9ffeeee] rounded-xl shadow-lg overflow-hidden mb-40">
        <div className="flex justify-center items-center h-64">
          <p>No mergers available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 py-2 px-4 bg-[#e9ffeeee] rounded-xl shadow-lg overflow-hidden mb-40">
      <div className="flex h-full">
        {/* Left Filters Section (25%) */}
        <div className="w-1/4">
          <h2 className='text-2xl p-6 font-bold text-gray-800'>Filters</h2>
          <div className="w-full bg-white/90 p-4 mb-3 rounded-lg">
            {/* Destination Filter */}
            <div className={`mb-6 shadow-sm p-3 rounded-lg ${filters.destination.length > 0 ? 'bg-green-50' : ''}`}>
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDropdown('destination')}
              >
                <h3 className="text-gray-700">Destination</h3>
                <div className="flex items-center">
                  {filters.destination.length > 0 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAppliedFilter('destination');
                        setDestinationSearch('');
                      }}
                      className="text-xs text-red-500 mr-2 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                  {openDropdown === 'destination' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
              
              <AnimatePresence>
                {openDropdown === 'destination' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 bg-white overflow-hidden"
                  >
                    <div className='p-2'>
                      <input
                        type="text"
                        placeholder="Search destinations..."
                        className="w-full p-2 text-sm border border-gray-300 rounded-md mb-2 focus:ring-1 focus:ring-green-400 focus:border-green-400 focus:outline-none"
                        value={destinationSearch}
                        onChange={(e) => setDestinationSearch(e.target.value)}
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {data.destinations
                          .filter(dest => 
                            dest.label.toLowerCase().includes(destinationSearch.toLowerCase())
                          )
                          .map(dest => (
                            <div 
                              key={dest.value} 
                              className={`flex items-center p-2 hover:bg-[#d1fae5] rounded-md cursor-pointer ${tempFilters.destination.includes(dest.value) ? 'bg-[#a7f3d0]' : ''}`}
                              onClick={() => handleTempFilterChange('destination', dest.value)}
                            >
                              <div className="flex items-center">
                                {tempFilters.destination.includes(dest.value) ? (
                                  <Check className="mr-2 text-green-600" size={16} />
                                ) : (
                                  <div className="w-4 h-4 mr-2 border border-gray-300 rounded-sm" />
                                )}
                                {dest.label}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 p-2 border-t border-gray-200">
                      <button 
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                        onClick={() => {
                          setOpenDropdown(null);
                          setDestinationSearch('');
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md"
                        onClick={applyFilters}
                      >
                        Apply
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Guide Filter */}
            <div className={`mb-6 shadow-sm p-3 rounded-lg ${(filters.guide || []).length > 0 ? 'bg-green-50' : ''}`}>
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDropdown('guide')}
              >
                <h3 className="text-gray-700">Guide</h3>
                <div className="flex items-center">
                  {(filters.guide || []).length > 0 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAppliedFilter('guide');
                        setGuideSearch('');
                      }}
                      className="text-xs text-red-500 mr-2 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                  {openDropdown === 'guide' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
              
              <AnimatePresence>
                {openDropdown === 'guide' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 bg-white overflow-hidden"
                  >
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search guides..."
                        className="w-full p-2 text-sm border border-gray-300 rounded-md mb-2 focus:ring-1 focus:ring-green-400 focus:border-green-400 focus:outline-none"
                        value={guideSearch || ''}
                        onChange={(e) => setGuideSearch(e.target.value)}
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {(getFilteredGuides() || [])
                          .filter(guide => {
                            const guideName = guide?.name?.toLowerCase() || '';
                            const searchTerm = (guideSearch || '').toLowerCase();
                            return guideName.includes(searchTerm);
                          })
                          .map(guide => (
                            <div 
                              key={guide.id} 
                              className={`flex items-center p-2 hover:bg-[#d1fae5] rounded-md cursor-pointer ${
                                (tempFilters.guide || []).includes(guide.id) ? 'bg-[#a7f3d0]' : ''
                              }`}
                              onClick={() => handleTempFilterChange('guide', guide.id)}
                            >
                              <div className="flex items-center">
                                {(tempFilters.guide || []).includes(guide.id) ? (
                                  <Check className="mr-2 text-green-600" size={16} />
                                ) : (
                                  <div className="w-4 h-4 mr-2 border border-gray-300 rounded-sm" />
                                )}
                                {guide?.name || 'Unknown Guide'}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 p-2 border-t border-gray-200">
                      <button 
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                        onClick={() => {
                          setOpenDropdown(null);
                          setGuideSearch('');
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md"
                        onClick={applyFilters}
                      >
                        Apply
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category Filter */}
            <div className={`mb-6 shadow-sm p-3 rounded-lg ${(filters.category || []).length > 0 ? 'bg-green-50' : ''}`}>
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDropdown('category')}
              >
                <h3 className="text-gray-700">Category</h3>
                <div className="flex items-center">
                  {(filters.category || []).length > 0 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAppliedFilter('category');
                        setCategorySearch('');
                      }}
                      className="text-xs text-red-500 mr-2 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                  {openDropdown === 'category' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
              
              <AnimatePresence>
                {openDropdown === 'category' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 bg-white overflow-hidden"
                  >
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        className="w-full p-2 text-sm border border-gray-300 rounded-md mb-2 focus:ring-1 focus:ring-green-400 focus:border-green-400 focus:outline-none"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {['Male Only', 'Female Only', 'General']
                          .filter(cat => 
                            cat.toLowerCase().includes((categorySearch || '').toLowerCase())
                          )
                          .map(category => (
                            <div 
                              key={category} 
                              className={`flex items-center p-2 hover:bg-[#d1fae5] rounded-md cursor-pointer ${(tempFilters.category || []).includes(category) ? 'bg-[#a7f3d0]' : ''}`}
                              onClick={() => {
                                setTempFilters(prev => {
                                  const currentCategories = prev.category || [];
                                  const newCategories = currentCategories.includes(category)
                                    ? currentCategories.filter(c => c !== category)
                                    : [...currentCategories, category];
                                  return {...prev, category: newCategories};
                                });
                              }}
                            >
                              <div className="flex items-center">
                                {(tempFilters.category || []).includes(category) ? (
                                  <Check className="mr-2 text-green-600" size={16} />
                                ) : (
                                  <div className="w-4 h-4 mr-2 border border-gray-300 rounded-sm" />
                                )}
                                {category}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 p-2 border-t border-gray-200">
                      <button 
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                        onClick={() => {
                          setOpenDropdown(null);
                          setCategorySearch('');
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md"
                        onClick={applyFilters}
                      >
                        Apply
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Date Filter */}
            <div className={`mb-6 shadow-sm p-3 rounded-lg ${filters.date || filters.dateRange.start || filters.dateRange.end ? 'bg-green-50' : ''}`}>
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDropdown('date')}
              >
                <h3 className="text-gray-700">Date</h3>
                <div className="flex items-center">
                  {(filters.date || filters.dateRange.start || filters.dateRange.end) && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAppliedFilter('date');
                        clearAppliedFilter('dateRange');
                      }}
                      className="text-xs text-red-500 mr-2 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                  {openDropdown === 'date' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
              
              <AnimatePresence>
                {openDropdown === 'date' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 bg-white overflow-hidden"
                  >
                    <div className="p-2">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {['Today', 'Tomorrow', 'This Week', 'This Month'].map(option => (
                          <button
                            key={option}
                            className={`p-2 rounded-md text-sm ${tempFilters.date === option ? 'bg-green-600 text-white' : 'bg-green-100 hover:bg-green-200'}`}
                            onClick={() => {
                              setTempFilters(prev => ({
                                ...prev,
                                date: option,
                                dateRange: { start: null, end: null }
                              }));
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="dateRange"
                          checked={tempFilters.dateRange.start !== null}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTempFilters(prev => ({
                                ...prev,
                                date: null,
                                dateRange: { start: new Date(), end: null }
                              }));
                              setActiveDateField('start');
                            } else {
                              setTempFilters(prev => ({
                                ...prev,
                                dateRange: { start: null, end: null }
                              }));
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor="dateRange">Date Range</label>
                      </div>
                      
                      {tempFilters.dateRange.start !== null && (
                        <div className="mb-4">
                          <div className="relative">
                            <div className="flex border border-gray-300 rounded-md mb-2 h-10">
                              <div 
                                className={`w-1/2 p-0.7 text-center cursor-pointer flex items-center justify-center ${activeDateField === 'start' ? 'bg-green-100' : ''}`}
                                onClick={() => setActiveDateField('start')}
                              >
                                {tempFilters.dateRange.start ? (
                                  <div className="flex items-center">
                                    <span className="text-sm">{formatDate(tempFilters.dateRange.start)}</span>
                                    <X 
                                      className="ml-2 text-black hover:text-red-600" 
                                      size={14}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTempFilters(prev => ({
                                          ...prev,
                                          dateRange: { ...prev.dateRange, start: null }
                                        }));
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-sm text-black">Start date</span>
                                )}
                              </div>
                              <div 
                                className={`w-1/2 p-0.7 text-center cursor-pointer flex items-center justify-center ${activeDateField === 'end' ? 'bg-green-100' : ''}`}
                                onClick={() => setActiveDateField('end')}
                              >
                                {tempFilters.dateRange.end ? (
                                  <div className="flex items-center">
                                    <span className="text-sm">{formatDate(tempFilters.dateRange.end)}</span>
                                    <X 
                                      className="ml-2 text-black hover:text-red-600" 
                                      size={14}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTempFilters(prev => ({
                                          ...prev,
                                          dateRange: { ...prev.dateRange, end: null }
                                        }));
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-sm text-black">End date</span>
                                )}
                              </div>
                            </div>
                            <div className="mt-2">
                              <DatePicker
                                selected={activeDateField === 'start' ? tempFilters.dateRange.start : tempFilters.dateRange.end}
                                onChange={(date) => handleDateRangeChange(date, activeDateField)}
                                selectsStart={activeDateField === 'start'}
                                selectsEnd={activeDateField === 'end'}
                                startDate={tempFilters.dateRange.start}
                                endDate={tempFilters.dateRange.end}
                                minDate={activeDateField === 'end' ? tempFilters.dateRange.start : new Date()}
                                inline
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 p-2 border-t border-gray-200">
                      <button 
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                        onClick={() => {
                          setOpenDropdown(null);
                          setTempFilters({ ...filters });
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md"
                        onClick={applyFilters}
                      >
                        Apply
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort Filter */}
            <div className={`mb-6 shadow-sm p-3 rounded-lg ${filters.sort ? 'bg-green-50' : ''}`}>
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDropdown('sort')}
              >
                <h3 className="text-gray-700">Sort</h3>
                <div className="flex items-center">
                  {filters.sort && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAppliedFilter('sort');
                      }}
                      className="text-xs text-red-500 mr-2 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                  {openDropdown === 'sort' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
              
              <AnimatePresence>
                {openDropdown === 'sort' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 bg-white overflow-hidden"
                  >
                    <div className="p-2">
                      <div className="max-h-48 overflow-y-auto">
                        {[
                          'Price: Low to High',
                          'Price: High to Low',
                          'Date: Nearest First',
                          'Date: Farthest First'
                        ].map(option => (
                          <div 
                            key={option} 
                            className={`flex items-center p-2 hover:bg-[#d1fae5] rounded-md cursor-pointer ${tempFilters.sort === option ? 'bg-[#a7f3d0]' : ''}`}
                            onClick={() => setTempFilters(prev => ({ ...prev, sort: option }))}
                          >
                            <div className="flex items-center">
                              {tempFilters.sort === option ? (
                                <Check className="mr-2 text-green-600" size={16} />
                              ) : (
                                <div className="w-4 h-4 mr-2 border border-gray-300 rounded-sm" />
                              )}
                              {option}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 p-2 border-t border-gray-200">
                      <button 
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                        onClick={() => setOpenDropdown(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md"
                        onClick={applyFilters}
                      >
                        Apply
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reset All Button */}
            <button
              className="w-full py-2 bg-green-100 hover:text-white text-gray-700 rounded-md shadow hover:bg-red-500 transition-colors flex items-center justify-center"
              onClick={resetAllFilters}
            >
              <RefreshCcw className="mr-2" size={16} />
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Right Content Section (75%) */}
        <div className="w-3/4 p-6 -mt-1.5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {activeSearch ? 'Search Results' : hasFilters ? 'Filtered Mergers' : 'Mergers for You'}
            </h2>
            
            {/* Search Bar */}
            <div className="relative w-1/2">
              <div className="relative flex">
                                <input
                  type="text"
                  placeholder="# Enter Merge ID (8 digits)"
                  className="w-full p-2 pl-4 pr-10 border border-gray-300 rounded-full focus:ring-1 focus:ring-green-400 focus:border-green-400 focus:outline-none"
                  value={searchQuery || ''}
                  onChange={(e) => {
                    // Only allow numbers and limit to 8 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                    setSearchQuery(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.length === 8) {
                      performSearch(searchQuery);
                    }
                  }}
                  maxLength={8}
                />
                {searchQuery && (
                  <X 
                    className="absolute right-8 top-2.5 text-gray-400 cursor-pointer hover:text-gray-600"
                    size={18}
                    onClick={resetSearch}
                  />
                )}
                <Search 
                  className="absolute right-3 top-2.5 text-gray-400 cursor-pointer hover:text-gray-600" 
                  size={18}
                  onClick={() => searchQuery.length === 8 && performSearch(searchQuery)}
                />
              </div>
              {searchQuery.length > 0 && searchQuery.length < 8 && (
                <p className="text-xs text-red-500 mt-1 ml-2">
                  Please enter exactly 8 digits
                </p>
              )}
            </div>
          </div>

          {/* Applied Filters Chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {/* Destination Filters */}
            {(filters.destination || []).map(destId => {
              const destination = data.destinations.find(d => d.value === destId);
              return (
                <div key={`dest-${destId}`} className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-sm">
                  {destination?.label || destId}
                  <X 
                    size={14} 
                    className="ml-1 cursor-pointer hover:text-red-500"
                    onClick={() => clearAppliedFilter('destination', destId)}
                  />
                </div>
              );
            })}

            {/* Guide Filters */}
            {(filters.guide || []).map(guideId => {
              const guide = data.guides.find(g => g.id === guideId);
              return (
                <div key={`guide-${guideId}`} className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-sm">
                  {guide?.name || guideId}
                  <X 
                    size={14} 
                    className="ml-1 cursor-pointer hover:text-red-500"
                    onClick={() => clearAppliedFilter('guide', guideId)}
                  />
                </div>
              );
            })}

            {/* Category Filters */}
            {(filters.category || []).map(category => (
              <div key={`category-${category}`} className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-sm">
                {category}
                <X 
                  size={14} 
                  className="ml-1 cursor-pointer hover:text-red-500"
                  onClick={() => clearAppliedFilter('category', category)}
                />
              </div>
            ))}

            {/* Date Filter */}
            {filters.date && (
              <div className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-sm">
                {filters.date}
                <X 
                  size={14} 
                  className="ml-1 cursor-pointer hover:text-red-500"
                  onClick={() => clearAppliedFilter('date')}
                />
              </div>
            )}

            {/* Date Range Filter */}
            {(filters.dateRange?.start || filters.dateRange?.end) && (
              <div className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-sm">
                {filters.dateRange.start ? formatDate(filters.dateRange.start) : 'Any'} - 
                {filters.dateRange.end ? formatDate(filters.dateRange.end) : 'Any'}
                <X 
                  size={14} 
                  className="ml-1 cursor-pointer hover:text-red-500"
                  onClick={() => clearAppliedFilter('dateRange')}
                />
              </div>
            )}

            {/* Sort Filter */}
            {filters.sort && (
              <div className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-sm">
                {filters.sort}
                <X 
                  size={14} 
                  className="ml-1 cursor-pointer hover:text-red-500"
                  onClick={() => clearAppliedFilter('sort')}
                />
              </div>
            )}
          </div>

          {/* Search Results Section */}
          {activeSearch ? (
            <div className="space-y-8">
              {/* Search Results */}
              {displayedMergers.length > 0 ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    {displayedMergers.length} results matching "{searchQuery}"
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {displayedMergers.map((merger) => (
                      <MergeCard key={merger.id} merger={merger} guides={data.guides} />
                    ))}
                  </div>
                </div>
              ) : (
                /* No Results Found */
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Try different search terms
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Original Mergers Display */
            displayedMergers.length > 0 ? (
              <div className="space-y-6">
                {displayedMergers.map((merger) => (
  <MergeCard key={merger.id} merger={merger} guides={data.guides} />
))}

                {!hasFilters && filteredMergers.length > displayCount && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={loadMoreMergers}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
                    >
                      Show More <ArrowDown className="ml-2" size={18} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No mergers found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters to see more results</p>
                <button 
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  onClick={resetAllFilters}
                >
                  Reset All Filters
                </button>
              </div>
            )
          )}
        </div>
      </div>
      {/* Floating Action Button */}
<motion.div
  whileHover="hover"
  initial="rest"
  animate="rest"
  className="fixed bottom-12 right-2 z-50 flex items-center gap-2 group"
>
  {/* Hover Label */}
  <motion.div
    variants={{
      rest: { opacity: 0, x: 10, pointerEvents: 'none' },
      hover: { opacity: 1, x: 0, pointerEvents: 'auto' }
    }}
    transition={{ duration: 0.2 }}
    className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm shadow-md hidden md:block"
  >
    Create Your Own Merger
  </motion.div>

  {/* FAB Button */}
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="bg-green-500 hover:bg-green-600 text-white rounded-full w-[60px] h-[60px] shadow-lg flex items-center justify-center"
    onClick={() => {
      console.log('FAB clicked');
    }}
  >
    <span className="text-3xl leading-none font-bold">+</span>
  </motion.button>
</motion.div>


    </div>
  );
};

export default MergerMainContent;