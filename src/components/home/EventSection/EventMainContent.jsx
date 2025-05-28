'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronDown, ChevronUp, RefreshCcw, ArrowDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import EventCard from '@/components/home/EventSection/EventCard';
import data from '@/data/data.json';

const EventMainContent = () => {
  // State for events and filters
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [displayCount, setDisplayCount] = useState(6);

  // Filter states
  const [filters, setFilters] = useState({
    destination: [],
    organizer: [],
    date: null,
    dateRange: { start: null, end: null },
    category: [],
    sort: null
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeDateField, setActiveDateField] = useState('start');

  // Apply filters when component mounts or filters change
  useEffect(() => {
    let results = [...data.events];

    // Destination filter
    if (filters.destination.length > 0) {
      results = results.filter(event => 
        filters.destination.includes(event.destinationId)
      );
    }

    // Organizer filter
    if (filters.organizer.length > 0) {
      results = results.filter(event => 
        filters.organizer.some(orgId => event.eventId.startsWith(orgId))
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      results = results.filter(event => 
        filters.category.includes(event.type)
      );
    }

    // Date filter
    if (filters.date) {
      const today = new Date();
      switch (filters.date) {
        case 'Today':
          results = results.filter(event => 
            new Date(event.date).toDateString() === today.toDateString()
          );
          break;
        case 'Tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          results = results.filter(event => 
            new Date(event.date).toDateString() === tomorrow.toDateString()
          );
          break;
        case 'This Week':
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          results = results.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= nextWeek;
          });
          break;
        case 'This Month':
          const nextMonth = new Date(today);
          nextMonth.setMonth(today.getMonth() + 1);
          results = results.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= nextMonth;
          });
          break;
      }
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      results = results.filter(event => {
        const eventDate = new Date(event.date);
        if (filters.dateRange.start && filters.dateRange.end) {
          return eventDate >= new Date(filters.dateRange.start) && 
                 eventDate <= new Date(filters.dateRange.end);
        } else if (filters.dateRange.start) {
          return eventDate >= new Date(filters.dateRange.start);
        } else if (filters.dateRange.end) {
          return eventDate <= new Date(filters.dateRange.end);
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
        case 'Most Bookings':
          results.sort((a, b) => b.bookings - a.bookings);
          break;
        case 'Highest Rated':
          results.sort((a, b) => b.rating - a.rating);
          break;
        case 'Date: Nearest First':
          results.sort((a, b) => new Date(a.date) - new Date(b.date));
          break;
        case 'Date: Farthest First':
          results.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
      }
    } else {
      // Default sort when no filters are applied
      results.sort((a, b) => {
        if (a.slotsLeft !== b.slotsLeft) {
          return a.slotsLeft - b.slotsLeft;
        }
        return b.rating - a.rating;
      });
    }

    setFilteredEvents(results);
  }, [filters]);

  // Update displayed events
  useEffect(() => {
    const hasFilters = Object.values(filters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : filter !== null && 
      !(typeof filter === 'object' && filter.start === null && filter.end === null)
    );

    if (hasFilters) {
      setDisplayedEvents(filteredEvents);
    } else {
      setDisplayedEvents(filteredEvents.slice(0, displayCount));
    }
  }, [filteredEvents, filters, displayCount]);

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
      organizer: [],
      date: null,
      dateRange: { start: null, end: null },
      category: [],
      sort: null
    });
    setTempFilters({
      destination: [],
      organizer: [],
      date: null,
      dateRange: { start: null, end: null },
      category: [],
      sort: null
    });
    setDisplayCount(6);
  };

  // Get filtered organizers based on selected destinations
  const getFilteredOrganizers = () => {
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

  const getOrganizerName = (id) => {
    const organizer = data.guides.find(g => g.id === id);
    return organizer ? organizer.name : id;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const loadMoreEvents = () => {
    setDisplayCount(prev => prev + 6);
  };

  const hasFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter !== null && 
    !(typeof filter === 'object' && filter.start === null && filter.end === null)
  );

  if (data.events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto mt-8 py-2 px-4 bg-[#e9ffeeee] rounded-xl shadow-lg overflow-hidden mb-40">
        <div className="flex justify-center items-center h-64">
          <p>No events available</p>
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
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {data.destinations.map(dest => (
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

            {/* Organizer Filter */}
            <div className={`mb-6 shadow-sm p-3 rounded-lg ${filters.organizer.length > 0 ? 'bg-green-300' : ''}`}>
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDropdown('organizer')}
              >
                <h3 className="text-gray-700">Organizer</h3>
                <div className="flex items-center">
                  {filters.organizer.length > 0 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAppliedFilter('organizer');
                      }}
                      className="text-xs text-red-500 mr-2 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                  {openDropdown === 'organizer' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
              
              <AnimatePresence>
                {openDropdown === 'organizer' && (
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
                        placeholder="Search organizers..."
                        className="w-full p-2 text-sm border border-gray-300 rounded-md mb-2 focus:ring-1 focus:ring-green-400 focus:border-green-400 focus:outline-none"
                      />
                      <div className="max-h-48 overflow-y-auto">
                        {getFilteredOrganizers().map(org => (
                          <div 
                            key={org.id} 
                            className={`flex items-center p-2 hover:bg-[#d1fae5] rounded-md cursor-pointer ${tempFilters.organizer.includes(org.id) ? 'bg-[#a7f3d0]' : ''}`}
                            onClick={() => handleTempFilterChange('organizer', org.id)}
                          >
                            <div className="flex items-center">
                              {tempFilters.organizer.includes(org.id) ? (
                                <Check className="mr-2 text-green-600" size={16} />
                              ) : (
                                <div className="w-4 h-4 mr-2 border border-gray-300 rounded-sm" />
                              )}
                              {org.name}
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

            {/* Date Filter */}
            <div className={`mb-6 shadow-sm p-3 rounded-lg ${filters.date || filters.dateRange.start || filters.dateRange.end ? 'bg-green-300' : ''}`}>
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
                            className={`p-2 rounded-md text-sm ${tempFilters.date === option ? 'bg-green-600 text-white' : 'bg-green-200 hover:bg-green-400'}`}
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
                                className={`w-1/2 p-0.7 text-center cursor-pointer flex items-center justify-center ${activeDateField === 'start' ? 'bg-green-400' : ''}`}
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
                                className={`w-1/2 p-0.7 text-center cursor-pointer flex items-center justify-center ${activeDateField === 'end' ? 'bg-green-400' : ''}`}
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

            {/* Category Filter */}
            <div className={`mb-6 shadow-sm p-3 rounded-lg ${filters.category.length > 0 ? 'bg-green-300' : ''}`}>
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleDropdown('category')}
              >
                <h3 className="text-gray-700">Category</h3>
                <div className="flex items-center">
                  {filters.category.length > 0 && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAppliedFilter('category');
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
                      <div className="max-h-48 overflow-y-auto">
                        {data.categories.map(cat => (
                          <div 
                            key={cat.value} 
                            className={`flex items-center p-2 hover:bg-[#d1fae5] rounded-md cursor-pointer ${tempFilters.category.includes(cat.value) ? 'bg-[#a7f3d0]' : ''}`}
                            onClick={() => handleTempFilterChange('category', cat.value)}
                          >
                            <div className="flex items-center">
                              {tempFilters.category.includes(cat.value) ? (
                                <Check className="mr-2 text-green-600" size={16} />
                              ) : (
                                <div className="w-4 h-4 mr-2 border border-gray-300 rounded-sm" />
                              )}
                              {cat.label}
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

            {/* Sort Filter */}
            <div className={`mb-6 shadow-sm p-3 rounded-lg ${filters.sort ? 'bg-green-300' : ''}`}>
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
                          'Most Bookings',
                          'Highest Rated',
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
              className="w-full py-2 bg-green-200 hover:text-white text-gray-700 rounded-md shadow hover:bg-red-500 transition-colors flex items-center justify-center"
              onClick={resetAllFilters}
            >
              <RefreshCcw className="mr-2" size={16} />
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Right Content Section (75%) */}
        <div className="w-3/4 p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {hasFilters ? 'Your Events' : 'Top Events'}
          </h2>
          
          {/* Applied Filters section */}
          {hasFilters && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {filters.destination.map(dest => (
                  <div 
                    key={`dest-${dest}`}
                    className="flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {getDestinationLabel(dest)}
                    <X 
                      className="ml-2 cursor-pointer hover:text-red-300" 
                      size={14}
                      onClick={() => clearAppliedFilter('destination', dest)}
                    />
                  </div>
                ))}
                
                {filters.organizer.map(org => (
                  <div 
                    key={`org-${org}`}
                    className="flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {getOrganizerName(org)}
                    <X 
                      className="ml-2 cursor-pointer hover:text-red-300" 
                      size={14}
                      onClick={() => clearAppliedFilter('organizer', org)}
                    />
                  </div>
                ))}
                
                {filters.date && (
                  <div className="flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    {filters.date}
                    <X 
                      className="ml-2 cursor-pointer hover:text-red-300" 
                      size={14}
                      onClick={() => clearAppliedFilter('date')}
                    />
                  </div>
                )}
                
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <div className="flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    {filters.dateRange.start ? formatDate(filters.dateRange.start) : '...'}
                    {' → '}
                    {filters.dateRange.end ? formatDate(filters.dateRange.end) : '...'}
                    <X 
                      className="ml-2 cursor-pointer hover:text-red-300" 
                      size={14}
                      onClick={() => clearAppliedFilter('dateRange')}
                    />
                  </div>
                )}
                
                {filters.category.map(cat => (
                  <div 
                    key={`cat-${cat}`}
                    className="flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                  >
                    {data.categories.find(c => c.value === cat)?.label || cat}
                    <X 
                      className="ml-2 cursor-pointer hover:text-red-300" 
                      size={14}
                      onClick={() => clearAppliedFilter('category', cat)}
                    />
                  </div>
                ))}
                
                {filters.sort && (
                  <div className="flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    {filters.sort}
                    <X 
                      className="ml-2 cursor-pointer hover:text-red-300" 
                      size={14}
                      onClick={() => clearAppliedFilter('sort')}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event cards section */}
            {displayedEvents.length > 0 ? (
    <div className="space-y-6"> {/* Changed from grid to space-y for single column */}
      {displayedEvents.map((event) => (
        <EventCard key={event.eventId} event={event} />
      ))}
      
      {/* Show More button */}
      {!hasFilters && filteredEvents.length > displayCount && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMoreEvents}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
          >
            Show More <ArrowDown className="ml-2" size={18} />
          </button>
        </div>
      )}
    </div>
  )  : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No events found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters to see more results</p>
              <button 
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                onClick={resetAllFilters}
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