'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronDown, ChevronUp, RefreshCcw, ArrowDown, SlidersHorizontal } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import EventCard from 'src/components/home/EventSection/EventCard';
import initialData from 'src/data/data.json';
import { Search, Calendar, Tag, MapPin } from 'lucide-react';

const EventMainContent = () => {
  // State for events and filters
  const [data, setData] = useState({ ...initialData, events: [] });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events');
        const json = await res.json();
          if (json.success) {
            setData(prev => ({ ...prev, events: json.events }));
          }
        } catch (err) {
          console.error('Failed to fetch events:', err);
        } finally {
          setLoading(false);
        }
      }
    fetchEvents();
  }, []);

  const [typeSearch, setTypeSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [organizerSearch, setOrganizerSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    destination: [],
    organizer: [],
    date: null,
    dateRange: { start: null, end: null },
    types: [],
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
  };

  // Reset search to original state
  const resetSearch = () => {
    setSearchQuery('');
    setActiveSearch(false);
    setShowSuggestions(false);
  };

  // Enhanced suggestions generator
  const getPrioritySuggestions = useMemo(() => {
    const generateSuggestions = (query) => {
      if (!query || !query.trim()) return [];

      const q = query.toLowerCase();
      const categories = [
        {
          name: 'Events',
          data: data.events || [],
          fields: [
            { name: 'name', weight: 3 },
            { name: 'title', weight: 2 },
            { name: 'type', weight: 1 }
          ],
          icon: <Calendar className="mr-2 text-green-500" size={16} />
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
          name: 'Event Types',
          data: Array.from(new Set((data.events || []).map(e => e.type))),
          fields: [
            { name: 'type', weight: 2 }
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

  // Filter events with enhanced priority
  const getFilteredEvents = useMemo(() => {
    const filterEvents = (query) => {
      if (!query || !query.trim()) return [];

      const q = query.toLowerCase();
      return (data.events || [])
        .map(event => {
          let priority = 0;

          // Direct matches
          priority += getPriorityScore(event?.name, q) * 3;
          priority += getPriorityScore(event?.title, q) * 3;
          priority += getPriorityScore(event?.type, q) * 2;

          // Destination matches
          if (event.destination) {
            const destination = (data.destinations || [])
              .find(d => d.value === event.destination);
            if (destination) {
              if (destination.label.toLowerCase() === q) {
                priority += 20;
              }
              else if (destination.label.toLowerCase().includes(q)) {
                priority += 10;
              }
              else if (destination.keywords?.some(kw => kw.toLowerCase().includes(q))) {
                priority += 8;
              }
            }
          }

          // Organizer matches
          if (event.guideName) {
            priority += getPriorityScore(event.guideName, q) * 2;
          }

          return { ...event, priority };
        })
        .filter(event => event.priority > 0)
        .sort((a, b) => b.priority - a.priority);
    };

    return filterEvents;
  }, [data]);

  // Derived filtered events
  const filteredEvents = useMemo(() => {
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
        filters.organizer.some(orgId => (event.eventId || '').startsWith(orgId))
      );
    }

    // Category filter
    if ((filters.type || []).length > 0) {
      results = results.filter(event =>
        (filters.type || []).includes(event.type)
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
      results.sort((a, b) => {
        if (a.slotsLeft !== b.slotsLeft) {
          return a.slotsLeft - b.slotsLeft;
        }
        return b.rating - a.rating;
      });
    }
    return results;
  }, [filters, data.events]);

  // Derived displayed events (handles search + combined results)
  const displayedEvents = useMemo(() => {
    if (activeSearch && searchQuery) {
      const foundEvents = getFilteredEvents(searchQuery);
      return foundEvents
        .map(event => ({ ...event, type: 'event' }))
        .sort((a, b) => b.priority - a.priority);
    }
    return filteredEvents;
  }, [activeSearch, searchQuery, filteredEvents, getFilteredEvents]);

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
    setMobileFiltersOpen(false);
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
    resetSearch();
  };

  const getFilteredOrganizers = () => {
    let eventsToConsider = data.events;
    if (filters.destination && filters.destination.length > 0) {
      eventsToConsider = eventsToConsider.filter(e => filters.destination.includes(e.destinationId));
    }
    const orgsMap = {};
    eventsToConsider.forEach(e => {
        if(e.guideName) { orgsMap[e.guideName] = { id: e.guideName, name: e.guideName }; }
    });
    return Object.values(orgsMap).sort((a, b) => a.name.localeCompare(b.name));
  };

  // Helper functions
  const getDestinationLabel = (id) => {
    const destination = data.destinations?.find(d => d.value === id);
    return destination ? destination.label : id;
  };

  const getOrganizerName = (id) => {
    return id;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

  const activeFilterCount = [
    ...(filters.destination || []),
    ...(filters.organizer || []),
    ...(filters.type || []),
    filters.date,
    filters.sort,
    (filters.dateRange?.start || filters.dateRange?.end) ? 'range' : null,
  ].filter(Boolean).length;

  // ── Shared filter panel content (used on both desktop sidebar and mobile drawer) ──
  const FilterPanel = () => (
    <div className="w-full bg-white/90 p-3 sm:p-4 mb-3 rounded-lg">
      {/* Destination Filter */}
      <div className={`mb-4 sm:mb-6 shadow-sm p-3 rounded-lg ${filters.destination.length > 0 ? 'bg-green-50' : ''}`}>
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleDropdown('destination')}
        >
          <h3 className="text-neutral-700 text-sm font-medium">Destination</h3>
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
                  className="w-full p-2 text-sm border border-neutral-300 rounded-md mb-2 focus:ring-1 focus:ring-green-400 focus:border-green-400 focus:outline-none"
                  value={destinationSearch}
                  onChange={(e) => setDestinationSearch(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto">
                  {(() => {
                    const availableValues = ['kashmir', 'ladakh', 'bhaderwah', 'kishtwar'];
                    const activeDestinations = filtered.filter(d => availableValues.includes(d.value));
                    const others = filtered.filter(d => !availableValues.includes(d.value));

                    return (
                      <>
                        {activeDestinations.map(dest => (
                          <div
                            key={dest.value}
                            className={`flex items-center p-2 rounded-md transition-colors text-sm hover:bg-[#d1fae5] cursor-pointer ${tempFilters.destination.includes(dest.value) ? 'bg-[#a7f3d0]' : ''}`}
                            onClick={() => handleTempFilterChange('destination', dest.value)}
                          >
                            <div className="flex items-center">
                              {tempFilters.destination.includes(dest.value) ? (
                                <Check className="mr-2 text-green-600" size={16} />
                              ) : (
                                <div className="w-4 h-4 mr-2 border border-neutral-300 rounded-sm" />
                              )}
                              <span className="text-neutral-700">{dest.label}</span>
                            </div>
                          </div>
                        ))}

                        {others.length > 0 && (
                          <div className="px-2 mt-3 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Available Soon
                          </div>
                        )}

                        {others.map(dest => (
                          <div
                            key={dest.value}
                            className={`flex items-center p-2 rounded-md transition-colors text-sm opacity-50 cursor-not-allowed`}
                          >
                            <div className="flex items-center">
                              <div className="w-4 h-4 mr-2 border border-neutral-200 rounded-sm" />
                              <span className="text-neutral-400">{dest.label}</span>
                            </div>
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="flex justify-end gap-2 p-2 border-t border-neutral-200">
                <button
                  className="px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md"
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

      {/* Organizer Filter */}
      <div className={`mb-4 sm:mb-6 shadow-sm p-3 rounded-lg ${(filters.organizer || []).length > 0 ? 'bg-green-50' : ''}`}>
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleDropdown('organizer')}
        >
          <h3 className="text-neutral-700 text-sm font-medium">Organizer</h3>
          <div className="flex items-center">
            {(filters.organizer || []).length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearAppliedFilter('organizer');
                  setOrganizerSearch('');
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
                  className="w-full p-2 text-sm border border-neutral-300 rounded-md mb-2 focus:ring-1 focus:ring-green-400 focus:border-green-400 focus:outline-none"
                  value={organizerSearch || ''}
                  onChange={(e) => setOrganizerSearch(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto">
                  {(getFilteredOrganizers() || [])
                    .filter(org => {
                      const orgName = org?.name?.toLowerCase() || '';
                      const searchTerm = (organizerSearch || '').toLowerCase();
                      return orgName.includes(searchTerm);
                    })
                    .map(org => (
                      <div
                        key={org.id}
                        className={`flex items-center p-2 hover:bg-[#d1fae5] rounded-md cursor-pointer text-sm ${(tempFilters.organizer || []).includes(org.id) ? 'bg-[#a7f3d0]' : ''
                          }`}
                        onClick={() => handleTempFilterChange('organizer', org.id)}
                      >
                        <div className="flex items-center">
                          {(tempFilters.organizer || []).includes(org.id) ? (
                            <Check className="mr-2 text-green-600" size={16} />
                          ) : (
                            <div className="w-4 h-4 mr-2 border border-neutral-300 rounded-sm" />
                          )}
                          {org?.name || 'Unknown Organizer'}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 p-2 border-t border-neutral-200">
                <button
                  className="px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md"
                  onClick={() => {
                    setOpenDropdown(null);
                    setOrganizerSearch('');
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

      {/* Event Type Filter */}
      <div className={`mb-4 sm:mb-6 shadow-sm p-3 rounded-lg ${(filters.type || []).length > 0 ? 'bg-green-50' : ''}`}>
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleDropdown('type')}
        >
          <h3 className="text-neutral-700 text-sm font-medium">Event Type</h3>
          <div className="flex items-center">
            {(filters.type || []).length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearAppliedFilter('type');
                  setTypeSearch('');
                }}
                className="text-xs text-red-500 mr-2 hover:underline"
              >
                Clear
              </button>
            )}
            {openDropdown === 'type' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        <AnimatePresence>
          {openDropdown === 'type' && (
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
                  placeholder="Search event types..."
                  className="w-full p-2 text-sm border border-neutral-300 rounded-md mb-2 focus:ring-1 focus:ring-green-400 focus:border-green-400 focus:outline-none"
                  value={typeSearch}
                  onChange={(e) => setTypeSearch(e.target.value)}
                />
                <div className="max-h-48 overflow-y-auto">
                  {Array.from(new Set([
                    'Adventure Tour',
                    'Cultural Experience',
                    'Food & Dining',
                    'Wellness Retreat',
                    'Photography Workshop',
                    'Music Festival',
                    'Art Exhibition',
                    'Sports Event',
                    'Educational Workshop',
                    'Networking Event',
                    ...(data.events?.map(event => event.type) || [])
                  ]))
                    .filter(type => type !== 'Others') // Hide 'Others' as it's just a provider form utility
                    .filter(type =>
                      type && typeof type === 'string' && type.toLowerCase().includes((typeSearch || '').toLowerCase())
                    )
                    .sort((a, b) => a.localeCompare(b))
                    .map(type => (
                      <div
                        key={type}
                        className={`flex items-center p-2 hover:bg-[#d1fae5] rounded-md cursor-pointer text-sm ${(tempFilters.type || []).includes(type) ? 'bg-[#a7f3d0]' : ''}`}
                        onClick={() => {
                          setTempFilters(prev => {
                            const currentTypes = prev.type || [];
                            const newTypes = currentTypes.includes(type)
                              ? currentTypes.filter(t => t !== type)
                              : [...currentTypes, type];
                            return { ...prev, type: newTypes };
                          });
                        }}
                      >
                        <div className="flex items-center">
                          {(tempFilters.type || []).includes(type) ? (
                            <Check className="mr-2 text-green-600" size={16} />
                          ) : (
                            <div className="w-4 h-4 mr-2 border border-neutral-300 rounded-sm" />
                          )}
                          {type}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 p-2 border-t border-neutral-200">
                <button
                  className="px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md"
                  onClick={() => {
                    setOpenDropdown(null);
                    setTypeSearch('');
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
      <div className={`mb-4 sm:mb-6 shadow-sm p-3 rounded-lg ${filters.date || filters.dateRange.start || filters.dateRange.end ? 'bg-green-50' : ''}`}>
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleDropdown('date')}
        >
          <h3 className="text-neutral-700 text-sm font-medium">Date</h3>
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
                  <label htmlFor="dateRange" className="text-sm">Date Range</label>
                </div>

                {tempFilters.dateRange.start !== null && (
                  <div className="mb-4">
                    <div className="relative">
                      <div className="flex border border-neutral-300 rounded-md mb-2 h-10">
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
              <div className="flex justify-end gap-2 p-2 border-t border-neutral-200">
                <button
                  className="px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md"
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
      <div className={`mb-4 sm:mb-6 shadow-sm p-3 rounded-lg ${filters.sort ? 'bg-green-50' : ''}`}>
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleDropdown('sort')}
        >
          <h3 className="text-neutral-700 text-sm font-medium">Sort</h3>
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
                      className={`flex items-center p-2 hover:bg-[#d1fae5] rounded-md cursor-pointer text-sm ${tempFilters.sort === option ? 'bg-[#a7f3d0]' : ''}`}
                      onClick={() => setTempFilters(prev => ({ ...prev, sort: option }))}
                    >
                      <div className="flex items-center">
                        {tempFilters.sort === option ? (
                          <Check className="mr-2 text-green-600" size={16} />
                        ) : (
                          <div className="w-4 h-4 mr-2 border border-neutral-300 rounded-sm" />
                        )}
                        {option}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 p-2 border-t border-neutral-200">
                <button
                  className="px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md"
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
        className="w-full py-2 bg-green-100 hover:text-white text-neutral-700 rounded-md shadow hover:bg-red-500 transition-colors flex items-center justify-center text-sm"
        onClick={resetAllFilters}
      >
        <RefreshCcw className="mr-2" size={16} />
        Reset All Filters
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full mt-1 sm:mt-5 py-8 px-4 bg-white/50 rounded-2xl shadow-sm min-h-[60vh]">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block lg:w-1/4 space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
          {/* Content Skeleton */}
          <div className="w-full lg:w-3/4 space-y-6">
            <div className="flex justify-between items-center mb-10">
              <div className="h-8 bg-gray-200 rounded-lg w-1/3 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded-full w-1/3 animate-pulse" />
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-50 rounded-2xl animate-pulse border border-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!loading && data.events.length === 0) {
    return (
      <div className="w-full mt-4 sm:mt-10 py-20 px-4 bg-white rounded-[2rem] shadow-xl border border-gray-100 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-100 rounded-full blur-3xl opacity-50 scale-150" />
          <div className="relative bg-green-50 p-8 rounded-full border border-green-100 shadow-inner">
            <Calendar size={64} className="text-green-500" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">No Upcoming Events</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg font-medium leading-relaxed">
          We&apos;re currently preparing new adventures and curated experiences. Please check back later or explore our trips and treks.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="/user/trip" className="px-8 py-3 bg-gray-950 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-black/20 hover:-translate-y-0.5">Explore Trips</a>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <RefreshCcw size={18} /> Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  py-2 px-3 sm:px-4 bg-gradient-to-br from-green-50 to-blue-50  shadow-lg overflow-hidden mb-0 pb-8">
      {/* ── Mobile: Search Bar + Filter Toggle ── */}
      <div className="lg:hidden px-2 pt-4 pb-2 space-y-3 -mt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-neutral-800 flex-1">
            {activeSearch ? 'Search Results' : hasFilters ? 'Your Events' : 'Top Events'}
          </h2>
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${mobileFiltersOpen ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <div className="relative flex">
            <input
              type="text"
              placeholder="Search events, guides, destinations..."
              className="w-full p-2.5 pl-4 pr-10 border border-neutral-300 rounded-full focus:ring-1 focus:ring-green-400 focus:border-green-400 focus:outline-none text-sm"
              value={searchQuery || ''}
              onChange={(e) => {
                const value = e.target.value || '';
                setSearchQuery(value);
                setActiveSearch(false);
                setShowSuggestions(value.length > 0);
              }}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <X
                className="absolute right-8 top-2.5 text-neutral-400 cursor-pointer hover:text-neutral-600"
                size={18}
                onClick={resetSearch}
              />
            )}
            <Search
              className="absolute right-3 top-2.5 text-neutral-400 cursor-pointer hover:text-neutral-600"
              size={18}
              onClick={handleSearchClick}
            />
          </div>

          {/* Mobile Suggestions Dropdown */}
          {showSuggestions && searchQuery && !activeSearch && (
            <div className="absolute z-30 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {getPrioritySuggestions(searchQuery).map((group, groupIndex) => (
                <div key={`group-${groupIndex}`} className="p-2 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                    {group.icon}
                    <span>{group.category}</span>
                  </div>
                  {group.items.map((item, itemIndex) => {
                    const keyParts = [group.category, item.id, item.type, item.label, item.name, item.title, itemIndex].filter(Boolean);
                    const uniqueKey = keyParts.join('-');
                    return (
                      <div
                        key={uniqueKey}
                        className="flex items-center p-2 hover:bg-green-50 rounded-md cursor-pointer text-sm"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setSearchQuery(item.name || item.title || item.label || item.type);
                          performSearch(item.name || item.title || item.label || item.type);
                        }}
                      >
                        <span className="truncate">{item.name || item.title || item.label || item.type}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="px-2 pb-4">
              <FilterPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Desktop Layout: Sidebar + Content ── */}
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left Filters Section — hidden on mobile */}
        <div className="hidden lg:block lg:w-1/4">
          <h2 className='text-2xl p-6 font-bold text-neutral-800'>Filters</h2>
          <FilterPanel />
        </div>

        {/* Right Content Section */}
        <div className="w-full lg:w-3/4 p-3 sm:p-6 -mt-1.5">
          {/* Desktop header + search (hidden on mobile) */}
          <div className="hidden lg:flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-neutral-800">
              {activeSearch ? 'Search Results' : hasFilters ? 'Your Events' : 'Top Events'}
            </h2>

            {/* Enhanced Search Bar */}
            <div className="relative w-1/2">
              <div className="relative flex">
                <input
                  type="text"
                  placeholder="Search events, guides, destinations, types..."
                  className="w-full p-2 pl-4 pr-10 border border-neutral-300 rounded-full focus:ring-1 focus:ring-green-400 focus:border-green-400 focus:outline-none text-sm"
                  value={searchQuery || ''}
                  onChange={(e) => {
                    const value = e.target.value || '';
                    setSearchQuery(value);
                    setActiveSearch(false);
                    setShowSuggestions(value.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onKeyDown={handleKeyDown}
                />
                {searchQuery && (
                  <X
                    className="absolute right-8 top-2.5 text-neutral-400 cursor-pointer hover:text-neutral-600"
                    size={18}
                    onClick={resetSearch}
                  />
                )}
                <Search
                  className="absolute right-3 top-2.5 text-neutral-400 cursor-pointer hover:text-neutral-600"
                  size={18}
                  onClick={handleSearchClick}
                />
              </div>

              {/* Desktop Suggestions Dropdown */}
              {showSuggestions && searchQuery && !activeSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  {getPrioritySuggestions(searchQuery).map((group, groupIndex) => (
                    <div key={`group-${groupIndex}`} className="p-2 border-b border-neutral-100 last:border-0">
                      <div className="flex items-center text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                        {group.icon}
                        <span>{group.category}</span>
                      </div>
                      {group.items.map((item, itemIndex) => {
                        const keyParts = [
                          group.category,
                          item.id,
                          item.type,
                          item.label,
                          item.name,
                          item.title,
                          itemIndex
                        ].filter(Boolean);

                        const uniqueKey = keyParts.join('-');

                        return (
                          <div
                            key={uniqueKey}
                            className="flex items-center p-2 hover:bg-green-50 rounded-md cursor-pointer text-sm"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setSearchQuery(item.name || item.title || item.label || item.type);
                              performSearch(item.name || item.title || item.label || item.type);
                            }}
                          >
                            <span className="truncate">{item.name || item.title || item.label || item.type}</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Tags */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            {/* Destination Filters */}
            {(filters.destination || []).map(destId => {
              const destination = data.destinations.find(d => d.value === destId);
              return (
                <div key={`dest-${destId}`} className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
                  {destination?.label || destId}
                  <X
                    size={14}
                    className="ml-1 cursor-pointer hover:text-red-500"
                    onClick={() => clearAppliedFilter('destination', destId)}
                  />
                </div>
              );
            })}

            {/* Organizer Filters */}
            {(filters.organizer || []).map(orgId => {
              return (
                <div key={`org-${orgId}`} className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
                  {orgId}
                  <X
                    size={14}
                    className="ml-1 cursor-pointer hover:text-red-500"
                    onClick={() => clearAppliedFilter('organizer', orgId)}
                  />
                </div>
              );
            })}

            {/* Type Filters */}
            {(filters.type || []).map(type => (
              <div key={`type-${type}`} className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
                {type}
                <X
                  size={14}
                  className="ml-1 cursor-pointer hover:text-red-500"
                  onClick={() => clearAppliedFilter('type', type)}
                />
              </div>
            ))}

            {/* Date Filter */}
            {filters.date && (
              <div className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
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
              <div className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
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
              <div className="flex items-center bg-green-400 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
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
            <div className="space-y-6 sm:space-y-8">
              {/* Combined Results */}
              {displayedEvents.length > 0 ? (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-4">
                    {displayedEvents.length} results matching &quot;{searchQuery}&quot;
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    {displayedEvents.map((item, index) => (
                      <EventCard key={`event-${item.id || item._id || index}`} event={item} />
                    ))}
                  </div>
                </div>
              ) : (
                /* No Results Found */
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-neutral-400 mb-4">
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
                  <h3 className="text-lg font-medium text-neutral-700 mb-2">
                    No results found
                  </h3>
                  <p className="text-neutral-500 text-sm mb-4">
                    Try different search terms
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Original Events Display */
            displayedEvents.length > 0 ? (
              <div className="space-y-4 sm:space-y-6">
                {displayedEvents.map((event, index) => (
                  <EventCard key={`event-${event.id || event._id || index}`} event={event} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-neutral-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-neutral-700 mb-2">No events found</h3>
                <p className="text-neutral-500 text-sm">Try adjusting your filters to see more results</p>
                <button
                  className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                  onClick={resetAllFilters}
                >
                  Reset All Filters
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default EventMainContent;