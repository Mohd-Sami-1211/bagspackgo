'use client';
import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarCheck, Search, RefreshCcw } from 'lucide-react';
import data from 'src/data/data.json';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const TripSearchInput = forwardRef(({ compactMode = false, onSearch }, ref) => {
  const router = useRouter();
  const [daysRange, setDaysRange] = useState(null);
  const [peopleRange, setPeopleRange] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('individual');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [dateInput, setDateInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  useImperativeHandle(ref, () => ({
    reset: handleReset,
    getSearchParams: () => ({
      destination: selectedDestination?.value || '',
      category: selectedCategory,
      date: startDate?.toISOString() || '',
      daysRange: daysRange?.value || '',
      peopleRange: peopleRange?.value || '',
    }),
  }));

  const handleReset = () => {
    setIsSearching(true);
    setError(null);
    setTimeout(() => {
      setDaysRange(null);
      setPeopleRange(null);
      setStartDate(null);
      setDateInput('');
      setSelectedCategory('individual');
      setSelectedDestination(null);
      setIsSearching(false);
    }, 300);
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (digits.length <= 2) formatted = digits;
    else if (digits.length <= 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    else formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;

    setDateInput(formatted);

    if (formatted.length === 10) {
      const [day, month, year] = formatted.split('/').map(Number);
      const parsedDate = new Date(year, month - 1, day);
      if (!isNaN(parsedDate.getTime())) setStartDate(parsedDate);
      else setStartDate(null);
    } else setStartDate(null);
  };

  const handleDateChange = (date) => {
    setStartDate(date);
    setDateInput(
      date
        ? date.toLocaleDateString('en-GB').split('/').map(v => v.padStart(2, '0')).join('/')
        : ''
    );
  };

  const handleSearch = () => {
    if (!selectedDestination) {
      setError('Please select a destination');
      return;
    }

    setError(null);
    setIsSearching(true);

    const params = {
      destination: selectedDestination?.value || '',
      category: selectedCategory,
      date: startDate?.toISOString() || '',
      daysRange: daysRange?.value || '',
      peopleRange: peopleRange?.value || '',
    };

    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '')
    );

    const queryString = new URLSearchParams(filteredParams).toString();

    setTimeout(() => {
      router.push(`/user/trip/guidelist?${queryString}`);
    }, 500);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut', when: 'beforeChildren', staggerChildren: 0.1 },
    },
  };

  const scrollVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.4, duration: 0.8 } },
  };

  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
  const buttonVariants = { rest: { scale: 1 }, hover: { scale: 1.02 }, tap: { scale: 0.98 } };

  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.2 }}
      variants={scrollVariants}
      className={`bg-white/90 rounded-2xl shadow-lg p-2 w-full max-w-full ${compactMode ? 'md:max-w-4xl' : 'md:max-w-5xl min-h-[180px]'
        } hover:shadow-xl transition-shadow duration-300`}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col md:flex-row gap-3"
      >
        <motion.div variants={itemVariants} className="flex-[1.2] bg-[#C3EFE6] rounded-xl p-3 space-y-3 w-full md:w-auto">
          <DestinationSelect
            selectedDestination={selectedDestination}
            setSelectedDestination={setSelectedDestination}
            error={error}
            setError={setError}
          />
          <CategorySelect selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
        </motion.div>

        <motion.div variants={itemVariants} className="flex-[2] bg-[#C3EFE6] rounded-xl p-3 flex flex-col justify-between w-full md:w-auto">
          <CountersSection daysRange={daysRange} setDaysRange={setDaysRange} peopleRange={peopleRange} setPeopleRange={setPeopleRange} selectedCategory={selectedCategory} />

          <div className="flex flex-col sm:flex-row gap-3 sm:items-end mt-3">
            <motion.div variants={itemVariants} className="flex-1 relative z-[60] w-full">
              <label className="block text-sm font-semibold text-gray-800 mb-1">Enter Date</label>
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                customInput={
                  <motion.div className="relative w-full" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <CalendarCheck className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={dateInput}
                      onChange={handleInputChange}
                      placeholder="DD/MM/YYYY"
                      className="bg-white border border-gray-300 text-gray-800 text-sm rounded-md focus:ring-green-500 focus:border-green-500 block w-full pl-9 pr-2 py-1.5 transition-all"
                    />
                  </motion.div>
                }
                dateFormat="dd/MM/yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                placeholderText="DD/MM/YYYY"
                popperClassName="z-[1000]"
                popperPlacement="bottom-start"
                calendarClassName="border-green-200 rounded-md shadow-xl bg-white"
                wrapperClassName="w-full"
              />
            </motion.div>

            <div className="flex gap-3 flex-wrap sm:flex-nowrap justify-end w-full sm:w-auto">
              <AnimatePresence mode="wait">
                {isSearching ? (
                  <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-32 flex justify-center">
                    <motion.div className="h-9 w-9 rounded-full border-2 border-green-500 border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                  </motion.div>
                ) : (
                  <motion.button
                    key="search"
                    variants={buttonVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={handleSearch}
                    className="flex items-center justify-center gap-2 px-6 py-1.5 bg-[#28A745] hover:bg-green-600 text-white text-base rounded-md transition w-full sm:w-32"
                  >
                    <Search size={16} />
                    Search
                  </motion.button>
                )}
              </AnimatePresence>

              <motion.button
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={handleReset}
                className="flex items-center justify-center gap-1 px-4 py-1.5 bg-[#A6D8BA] hover:bg-red-500 hover:text-white text-sm rounded-md transition w-full sm:w-24"
              >
                <RefreshCcw size={14} />
                Reset
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

// ------------------- Destination Select -------------------
const DestinationSelect = ({ selectedDestination, setSelectedDestination, error, setError }) => (
  <motion.div
    className="relative z-[1000] w-full"
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.3, delay: 0.2 }}
  >
    <label className="block text-sm font-semibold text-gray-800 mb-1">Select Destination</label>
    <Select
      options={data.destinations}
      value={selectedDestination}
      onChange={(value) => {
        setSelectedDestination(value);
        if (value) setError(null);
      }}
      placeholder="Enter Place to Search"
      classNamePrefix="react-select"
      isClearable
      styles={{
        ...selectStyles,
        control: (provided, state) => ({
          ...selectStyles.control(provided, state),
          borderColor: error ? '#ef4444' : state.isFocused ? '#10b981' : '#d1d5db',
          boxShadow: error ? '0 0 0 1px #ef4444' : state.isFocused ? '0 0 0 1px #10b981' : null,
        }),
      }}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </motion.div>
);

// ------------------- Category Select -------------------
const CategorySelect = ({ selectedCategory, setSelectedCategory }) => (
  <motion.div
    className="relative z-[1000] w-full"
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.3, delay: 0.3 }}
  >
    <label className="block text-sm font-semibold text-gray-800 mb-1">Choose Category</label>
    <Select
      options={data.categories}
      value={data.categories.find((cat) => cat.value === selectedCategory)}
      onChange={(option) => setSelectedCategory(option.value)}
      placeholder="Select Type"
      classNamePrefix="react-select"
      isClearable={false}
      styles={selectStyles}
    />
  </motion.div>
);

// ------------------- Counters Section -------------------
const CountersSection = ({ daysRange, setDaysRange, peopleRange, setPeopleRange, selectedCategory }) => {
  const daysOptions = [
    { value: '0-3', label: '0-3 days' },
    { value: '3-5', label: '3-5 days' },
    { value: '5-7', label: '5-7 days' },
    { value: '7-9', label: '7-9 days' },
    { value: 'other', label: 'Others' }
  ];

  const peopleOptions = [
    { value: '1-2', label: selectedCategory === 'couple' ? '1-2 Couples' : '1-2 People' },
    { value: '3-5', label: selectedCategory === 'couple' ? '3-5 Couples' : '3-5 People' },
    { value: '6-9', label: selectedCategory === 'couple' ? '6-9 Couples' : '6-9 People' },
    { value: '10-15', label: selectedCategory === 'couple' ? '10-15 Couples' : '10-15 People' },
    { value: '15+', label: selectedCategory === 'couple' ? '15+ Couples' : '15+ People' }
  ];

  return (
    <motion.div className="flex gap-4 flex-wrap sm:flex-nowrap w-full" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-50px' }}>
      {/* Days Range Select Dropdown */}
      <motion.div
        className="flex-1 w-full sm:w-auto"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.3 }}
      >
        <label className="block text-sm font-semibold text-gray-800 mb-1">No. of Days</label>
        <Select
          options={daysOptions}
          value={daysRange}
          onChange={setDaysRange}
          placeholder="Select Days Range"
          classNamePrefix="react-select"
          isClearable
          styles={{
            ...selectStyles,
            control: (provided, state) => ({
              ...selectStyles.control(provided, state),
              minHeight: '36px', // Match height
            }),
          }}
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          menuPosition="fixed"
        />
      </motion.div>

      {/* People Range Select Dropdown */}
      <motion.div
        className="flex-1 w-full sm:w-auto"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          {selectedCategory === 'couple' ? 'No. of Couples' : 'No. of People'}
        </label>
        <Select
          options={peopleOptions}
          value={peopleRange}
          onChange={setPeopleRange}
          placeholder="Select Range"
          classNamePrefix="react-select"
          isClearable
          styles={{
            ...selectStyles,
            control: (provided, state) => ({
              ...selectStyles.control(provided, state),
              minHeight: '36px', // Match height
            }),
          }}
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          menuPosition="fixed"
        />
      </motion.div>
    </motion.div>
  );
};



// ------------------- Select Styles -------------------
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '36px', // Slightly increased to match counter height
    fontSize: '0.85rem',
    borderColor: state.isFocused ? '#10b981' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #10b981' : null,
    '&:hover': { borderColor: state.isFocused ? '#10b981' : '#d1d5db' },
    borderRadius: '8px',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    marginTop: '4px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
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

TripSearchInput.displayName = 'SearchInput';
export default TripSearchInput;