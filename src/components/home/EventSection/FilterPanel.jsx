'use client';

import { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronDown, ChevronUp, RefreshCcw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { destinations as STATIC_DESTINATIONS } from 'src/data/data.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useAsyncDropdown from 'src/components/hooks/useAsyncDropdown';

const AVAILABLE_DESTINATIONS = ['kashmir', 'ladakh', 'bhaderwah', 'warwan-marwah-valley'];

export const EVENT_TYPES = [
  'Adventure Tour', 'Cultural Experience', 'Food & Dining',
  'Wellness Retreat', 'Photography Workshop', 'Music Festival',
  'Art Exhibition', 'Sports Event', 'Educational Workshop', 'Networking Event',
];

export const SORT_OPTIONS = [
  { label: 'Price: Low to High',   value: 'price_asc'   },
  { label: 'Price: High to Low',   value: 'price_desc'  },
  { label: 'Most Bookings',        value: 'most_booked' },
  { label: 'Highest Rated',        value: 'rating'      },
  { label: 'Date: Nearest First',  value: 'date_asc'    },
  { label: 'Date: Farthest First', value: 'date_desc'   },
];

const DATE_PRESETS = ['Today', 'Tomorrow', 'This Week', 'This Month'];

export const EMPTY_FILTERS = {
  destination: [],
  organizer:   [],
  type:        [],
  date:        null,
  dateRange:   { start: null, end: null },
  sort:        null,
  _labels:     { destinations: {}, organizers: {} },
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const FilterItem = ({ id, label, checked, disabled = false, onClick }) => (
  <div
    onClick={() => !disabled && onClick(id)}
    className={`flex items-center p-2 rounded-md text-sm transition-colors
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#d1fae5]'}
      ${!disabled && checked ? 'bg-[#a7f3d0]' : ''}`}
  >
    {!disabled && checked
      ? <Check className="mr-2 text-green-600 shrink-0" size={16} />
      : <div className="w-4 h-4 mr-2 border border-neutral-300 rounded-sm shrink-0" />}
    <span className={disabled ? 'text-neutral-400' : 'text-neutral-700'}>{label}</span>
  </div>
);

const MiniSpinner = () => (
  <div className="flex justify-center py-3">
    <div className="w-4 h-4 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
  </div>
);

const SectionFooter = ({ onCancel, onApply }) => (
  <div className="flex justify-end gap-2 p-2 border-t border-neutral-200">
    <button
      className="px-3 py-1 text-sm bg-neutral-100 hover:bg-neutral-200 rounded-md"
      onClick={onCancel}
    >
      Cancel
    </button>
    <button
      className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md"
      onClick={onApply}
    >
      Apply
    </button>
  </div>
);

const FilterPanel = ({ appliedFilters, onApply, onReset }) => {
  const [openDropdown,    setOpenDropdown]    = useState(null);
  const [tempFilters,     setTempFilters]     = useState(() => ({ ...appliedFilters }));
  const [activeDateField, setActiveDateField] = useState('start');
  const [typeSearch,      setTypeSearch]      = useState('');

  const dest = useAsyncDropdown({
    fetchUrl:  '/api/events/filters?type=destination',
    searchUrl: '/api/events/filters?type=destination',
  });

  const org = useAsyncDropdown({
    fetchUrl:  '/api/events/filters?type=organizer',
    searchUrl: '/api/events/filters?type=organizer',
  });

  useEffect(() => {
    setTempFilters({ ...appliedFilters });
  }, [appliedFilters]);

  useEffect(() => {
    if (openDropdown === 'destination') dest.fetchPage(1);
    else dest.reset();
  }, [openDropdown]);

  useEffect(() => {
    if (openDropdown === 'organizer') org.fetchPage(1);
    else org.reset();
  }, [openDropdown]);

  const staticAvailable = useMemo(() =>
    STATIC_DESTINATIONS.filter(d =>
      AVAILABLE_DESTINATIONS.includes(d.value) &&
      (!dest.search || d.label.toLowerCase().includes(dest.search.toLowerCase()))
    ), [dest.search]);

  const staticSoon = useMemo(() =>
    STATIC_DESTINATIONS.filter(d =>
      !AVAILABLE_DESTINATIONS.includes(d.value) &&
      (!dest.search || d.label.toLowerCase().includes(dest.search.toLowerCase()))
    ), [dest.search]);

  const eventTypesForFilter = useMemo(() =>
    EVENT_TYPES
      .filter(t => t !== 'Others' && t.toLowerCase().includes((typeSearch || '').toLowerCase()))
      .sort((a, b) => a.localeCompare(b)),
  [typeSearch]);

  const toggleDropdown = useCallback((dropdown) => {
    setTempFilters({ ...appliedFilters });
    setOpenDropdown(prev => prev === dropdown ? null : dropdown);
  }, [appliedFilters]);

  const handleTempFilterChange = useCallback((filterType, value) => {
    setTempFilters(prev => {
      if (Array.isArray(prev[filterType])) {
        const current = [...prev[filterType]];
        const idx     = current.indexOf(value);
        idx > -1 ? current.splice(idx, 1) : current.push(value);
        return { ...prev, [filterType]: current };
      }
      return { ...prev, [filterType]: value };
    });
  }, []);

  const handleDateRangeChange = useCallback((date, type) => {
    setTempFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, [type]: date } }));
  }, []);

  const applyFilters = useCallback(() => {
    const destLabels = {};
    [...staticAvailable, ...dest.items].forEach(d => {
      destLabels[d.value ?? d.id] = d.label ?? d.name;
    });
    const orgLabels = {};
    org.items.forEach(o => { orgLabels[o.id] = o.name; });

    onApply({
      ...tempFilters,
      _labels: { destinations: destLabels, organizers: orgLabels },
    });
    setOpenDropdown(null);
  }, [tempFilters, onApply, staticAvailable, dest.items, org.items]);

  const clearAppliedSection = useCallback((patch) => {
    onApply({
      ...appliedFilters,
      ...patch,
      _labels: appliedFilters._labels,
    });
  }, [appliedFilters, onApply]);

  return (
    <div className="w-full bg-white/90 p-3 sm:p-4 mb-3 rounded-lg">

      {/* ── Destination ─────────────────────────────────────────────────── */}
      <div className={`mb-4 sm:mb-6 shadow-sm p-3 rounded-lg ${appliedFilters.destination.length > 0 ? 'bg-green-50' : ''}`}>
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleDropdown('destination')}>
          <h3 className="text-neutral-700 text-sm font-medium">Destination</h3>
          <div className="flex items-center">
            {appliedFilters.destination.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); clearAppliedSection({ destination: [] }); dest.reset(); }}
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
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
              className="mt-2 bg-white overflow-hidden"
            >
              <div className="p-2">
                <Input
                  type="text"
                  placeholder="Search destinations..."
                  className="mb-3"
                  value={dest.search}
                  onChange={(e) => dest.handleSearch(e.target.value)}
                />
                <div className="max-h-64 overflow-y-auto space-y-0.5">
                  {staticAvailable.map(d => (
                    <FilterItem key={d.value} id={d.value} label={d.label}
                      checked={tempFilters.destination.includes(d.value)}
                      onClick={(v) => handleTempFilterChange('destination', v)} />
                  ))}
                  {dest.items.map(d => (
                    <FilterItem key={d.id} id={d.id} label={d.name}
                      checked={tempFilters.destination.includes(d.id)}
                      onClick={(v) => handleTempFilterChange('destination', v)} />
                  ))}
                  {dest.loading && <MiniSpinner />}
                  {!dest.search && !dest.loading && (dest.hasMore || !dest.shown) && (
                    <button
                      className="w-full mt-1 py-1.5 text-xs text-green-600 hover:text-green-700 font-medium hover:bg-green-50 rounded-md transition-colors"
                      onClick={dest.loadMore}
                    >
                      Show More
                    </button>
                  )}
                  {staticSoon.length > 0 && (
                    <>
                      <div className="px-2 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Available Soon
                      </div>
                      {staticSoon.map(d => (
                        <FilterItem key={d.value} id={d.value} label={d.label} disabled checked={false} onClick={() => {}} />
                      ))}
                    </>
                  )}
                  {dest.search && !dest.loading && staticAvailable.length === 0 && dest.items.length === 0 && (
                    <p className="text-sm text-neutral-400 text-center py-3">No destinations found</p>
                  )}
                </div>
              </div>
              <SectionFooter
                onCancel={() => { setOpenDropdown(null); dest.reset(); }}
                onApply={applyFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Organizer ───────────────────────────────────────────────────── */}
      <div className={`mb-4 sm:mb-6 shadow-sm p-3 rounded-lg ${appliedFilters.organizer.length > 0 ? 'bg-green-50' : ''}`}>
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleDropdown('organizer')}>
          <h3 className="text-neutral-700 text-sm font-medium">Organizer</h3>
          <div className="flex items-center">
            {appliedFilters.organizer.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); clearAppliedSection({ organizer: [] }); org.reset(); }}
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
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
              className="mt-2 bg-white overflow-hidden"
            >
              <div className="p-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search organizers..."
                    className="w-full p-2 text-sm border border-neutral-300 rounded-md mb-2 focus:ring-1 focus:ring-green-400 focus:border-green-400 focus:outline-none pr-8"
                    value={org.search}
                    onChange={(e) => org.handleSearch(e.target.value)}
                  />
                  {org.loading && org.search && (
                    <div className="absolute right-2 top-2.5">
                      <div className="w-4 h-4 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {org.items.map(o => (
                    <FilterItem key={o.id} id={o.id} label={o.name}
                      checked={tempFilters.organizer.includes(o.id)}
                      onClick={(v) => handleTempFilterChange('organizer', v)} />
                  ))}
                  {org.loading && <MiniSpinner />}
                  {!org.loading && org.items.length === 0 && (
                    <p className="text-sm text-neutral-400 text-center py-4">No organizers found</p>
                  )}
                  {org.hasMore && !org.loading && !org.search && (
                    <button
                      className="w-full mt-1 py-1.5 text-xs text-green-600 hover:text-green-700 font-medium hover:bg-green-50 rounded-md transition-colors"
                      onClick={() => org.fetchPage(org.page + 1, true)}
                    >
                      Show More
                    </button>
                  )}
                </div>
              </div>
              <SectionFooter
                onCancel={() => { setOpenDropdown(null); org.reset(); }}
                onApply={applyFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Event Type ──────────────────────────────────────────────────── */}
      <div className={`mb-4 sm:mb-6 shadow-sm p-3 rounded-lg ${appliedFilters.type.length > 0 ? 'bg-green-50' : ''}`}>
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleDropdown('type')}>
          <h3 className="text-neutral-700 text-sm font-medium">Event Type</h3>
          <div className="flex items-center">
            {appliedFilters.type.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); clearAppliedSection({ type: [] }); setTypeSearch(''); }}
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
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
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
                  {eventTypesForFilter.map(type => (
                    <div
                      key={type}
                      className={`flex items-center p-2 hover:bg-[#d1fae5] rounded-md cursor-pointer text-sm ${tempFilters.type.includes(type) ? 'bg-[#a7f3d0]' : ''}`}
                      onClick={() => handleTempFilterChange('type', type)}
                    >
                      {tempFilters.type.includes(type)
                        ? <Check className="mr-2 text-green-600" size={16} />
                        : <div className="w-4 h-4 mr-2 border border-neutral-300 rounded-sm" />}
                      {type}
                    </div>
                  ))}
                </div>
              </div>
              <SectionFooter
                onCancel={() => { setOpenDropdown(null); setTypeSearch(''); }}
                onApply={applyFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Date ────────────────────────────────────────────────────────── */}
      <div className={`mb-4 sm:mb-6 shadow-sm p-3 rounded-lg ${appliedFilters.date || appliedFilters.dateRange.start || appliedFilters.dateRange.end ? 'bg-green-50' : ''}`}>
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleDropdown('date')}>
          <h3 className="text-neutral-700 text-sm font-medium">Date</h3>
          <div className="flex items-center">
            {(appliedFilters.date || appliedFilters.dateRange.start || appliedFilters.dateRange.end) && (
              <button
                onClick={(e) => { e.stopPropagation(); clearAppliedSection({ date: null, dateRange: { start: null, end: null } }); }}
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
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
              className="mt-2 bg-white overflow-hidden"
            >
              <div className="p-2">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {DATE_PRESETS.map(option => (
                    <button
                      key={option}
                      className={`p-2 rounded-md text-sm ${tempFilters.date === option ? 'bg-green-600 text-white' : 'bg-green-100 hover:bg-green-200'}`}
                      onClick={() => setTempFilters(prev => ({ ...prev, date: option, dateRange: { start: null, end: null } }))}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox" id="dateRange"
                    checked={tempFilters.dateRange.start !== null}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTempFilters(prev => ({ ...prev, date: null, dateRange: { start: new Date(), end: null } }));
                        setActiveDateField('start');
                      } else {
                        setTempFilters(prev => ({ ...prev, dateRange: { start: null, end: null } }));
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor="dateRange" className="text-sm">Date Range</label>
                </div>
                {tempFilters.dateRange.start !== null && (
                  <div className="mb-4">
                    <div className="flex border border-neutral-300 rounded-md mb-2 h-10">
                      <div
                        className={`w-1/2 text-center cursor-pointer flex items-center justify-center ${activeDateField === 'start' ? 'bg-green-100' : ''}`}
                        onClick={() => setActiveDateField('start')}
                      >
                        {tempFilters.dateRange.start ? (
                          <div className="flex items-center">
                            <span className="text-sm">{formatDate(tempFilters.dateRange.start)}</span>
                            <X className="ml-2 text-black hover:text-red-600" size={14}
                              onClick={(e) => { e.stopPropagation(); setTempFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: null } })); }} />
                          </div>
                        ) : <span className="text-sm text-black">Start date</span>}
                      </div>
                      <div
                        className={`w-1/2 text-center cursor-pointer flex items-center justify-center ${activeDateField === 'end' ? 'bg-green-100' : ''}`}
                        onClick={() => setActiveDateField('end')}
                      >
                        {tempFilters.dateRange.end ? (
                          <div className="flex items-center">
                            <span className="text-sm">{formatDate(tempFilters.dateRange.end)}</span>
                            <X className="ml-2 text-black hover:text-red-600" size={14}
                              onClick={(e) => { e.stopPropagation(); setTempFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: null } })); }} />
                          </div>
                        ) : <span className="text-sm text-black">End date</span>}
                      </div>
                    </div>
                    <DatePicker
                      selected={activeDateField === 'start' ? tempFilters.dateRange.start : tempFilters.dateRange.end}
                      onChange={(date) => handleDateRangeChange(date, activeDateField)}
                      selectsStart={activeDateField === 'start'} selectsEnd={activeDateField === 'end'}
                      startDate={tempFilters.dateRange.start} endDate={tempFilters.dateRange.end}
                      minDate={activeDateField === 'end' ? tempFilters.dateRange.start : new Date()}
                      inline
                    />
                  </div>
                )}
              </div>
              <SectionFooter
                onCancel={() => { setOpenDropdown(null); setTempFilters({ ...appliedFilters }); }}
                onApply={applyFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sort ────────────────────────────────────────────────────────── */}
      <div className={`mb-4 sm:mb-6 shadow-sm p-3 rounded-lg ${appliedFilters.sort ? 'bg-green-50' : ''}`}>
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleDropdown('sort')}>
          <h3 className="text-neutral-700 text-sm font-medium">Sort</h3>
          <div className="flex items-center">
            {appliedFilters.sort && (
              <button
                onClick={(e) => { e.stopPropagation(); clearAppliedSection({ sort: null }); }}
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
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
              className="mt-2 bg-white overflow-hidden"
            >
              <div className="p-2 max-h-48 overflow-y-auto">
                {SORT_OPTIONS.map(opt => (
                  <div
                    key={opt.value}
                    className={`flex items-center p-2 hover:bg-[#d1fae5] rounded-md cursor-pointer text-sm ${tempFilters.sort === opt.value ? 'bg-[#a7f3d0]' : ''}`}
                    onClick={() => setTempFilters(prev => ({ ...prev, sort: opt.value }))}
                  >
                    {tempFilters.sort === opt.value
                      ? <Check className="mr-2 text-green-600" size={16} />
                      : <div className="w-4 h-4 mr-2 border border-neutral-300 rounded-sm" />}
                    {opt.label}
                  </div>
                ))}
              </div>
              <SectionFooter
                onCancel={() => setOpenDropdown(null)}
                onApply={applyFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        variant="outline"
        className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors flex items-center justify-center text-sm gap-2 mt-4"
        onClick={onReset}
      >
        <RefreshCcw size={16} /> Reset All Filters
      </Button>
    </div>
  );
};

FilterPanel.displayName = 'FilterPanel';
export default memo(FilterPanel);