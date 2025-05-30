'use client';
import { useState, forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarCheck, Search, RefreshCcw } from 'lucide-react';
import data from '@/data/data.json';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const TrekSearchInput = forwardRef((props, ref) => {
  const [count, setCount] = useState(1);
  const router = useRouter();
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedTrek, setSelectedTrek] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [dateInput, setDateInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trekOptions, setTrekOptions] = useState([]);
  const [errors, setErrors] = useState({
    destination: '',
    trek: '',
    date: ''
  });

  useImperativeHandle(ref, () => ({
    reset: handleReset,
    getSearchParams: () => ({
      destination: selectedDestination,
      trek: selectedTrek,
      date: startDate,
      count,
    }),
  }));

  const handleReset = () => {
    setIsSearching(true);
    setTimeout(() => {
      setCount(1);
      setStartDate(null);
      setDateInput('');
      setSelectedDestination(null);
      setSelectedTrek(null);
      setTrekOptions([]);
      setErrors({
        destination: '',
        trek: '',
        date: ''
      });
      setIsSearching(false);
    }, 300);
  };

  const validateFields = () => {
    const newErrors = {
      destination: '',
      trek: '',
      date: ''
    };
    
    let isValid = true;
    
    if (!selectedDestination) {
      newErrors.destination = 'Please select a destination';
      isValid = false;
    }
    
    if (!selectedTrek) {
      newErrors.trek = 'Please select a trek';
      isValid = false;
    }
    
    if (!startDate) {
      newErrors.date = 'Please select a date';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleDestinationChange = (destination) => {
    setSelectedDestination(destination);
    setSelectedTrek(null);
    setErrors(prev => ({ ...prev, destination: '', trek: '' }));
    
    if (destination) {
      if (data?.treks && Array.isArray(data.treks)) {
        const filteredTreks = data.treks.filter(trek => 
          trek.destinationId && trek.destinationId.toString() === destination.value.toString()
        );
        setTrekOptions(
          filteredTreks.map(trek => ({
            value: trek.id,
            label: trek.name,
            ...trek
          }))
        );
      }
    } else {
      setTrekOptions([]);
    }
  };

  const handleTrekChange = (trek) => {
    if (!selectedDestination) {
      setErrors(prev => ({ ...prev, trek: 'Please select a destination first' }));
      return;
    }
    setSelectedTrek(trek);
    setErrors(prev => ({ ...prev, trek: '' }));
  };

  const handleInputChange = (e) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '').slice(0, 8);
    let formatted = '';

    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }

    setDateInput(formatted);

    if (formatted.length === 10) {
      const [day, month, year] = formatted.split('/').map(Number);
      const parsedDate = new Date(year, month - 1, day);
      if (!isNaN(parsedDate.getTime())) {
        setStartDate(parsedDate);
        setErrors(prev => ({ ...prev, date: '' }));
      } else {
        setStartDate(null);
      }
    } else {
      setStartDate(null);
    }
  };

  const handleDateChange = (date) => {
    setStartDate(date);
    setDateInput(date ? date.toLocaleDateString('en-GB').split('/').map(v => v.padStart(2, '0')).join('/') : '');
    setErrors(prev => ({ ...prev, date: '' }));
  };

  const handleSearch = () => {
    if (!validateFields()) {
      return;
    }

    setIsSearching(true);
    
    const queryParams = new URLSearchParams({
      destination: selectedDestination.value,
      trek: selectedTrek.value,
      date: startDate.toISOString(),
      count: count.toString()
    }).toString();

    router.push(`/trek/guidelist?${queryParams}`);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const scrollVariants = {
    offscreen: {
      y: 50,
      opacity: 0
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.2 }}
      variants={scrollVariants}
      className="bg-white/90 rounded-2xl shadow-lg p-2 w-full max-w-5xl min-h-[180px] hover:shadow-xl transition-shadow duration-300"
    >
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex flex-col md:flex-row gap-3 mt-0.5"
      >
        {/* Left Section */}
        <motion.div 
          variants={itemVariants}
          className="flex-[1.2] bg-[#C3EFE6] rounded-xl p-3 space-y-3"
        >
          <div className="relative z-[1000]">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Select Destination*</label>
            <Select
              options={data.destinations.map(dest => ({
                value: dest.value,
                label: dest.label
              }))}
              value={selectedDestination}
              onChange={handleDestinationChange}
              placeholder="Choose a destination"
              classNamePrefix="react-select"
              isClearable
              styles={{
                ...selectStyles,
                control: (provided, state) => ({
                  ...selectStyles.control(provided, state),
                  borderColor: errors.destination ? '#ef4444' : state.isFocused ? '#10b981' : '#d1d5db',
                  boxShadow: errors.destination ? '0 0 0 1px #ef4444' : state.isFocused ? '0 0 0 1px #10b981' : null,
                })
              }}
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              menuPosition="fixed"
            />
            {errors.destination && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs mt-1"
              >
                {errors.destination}
              </motion.p>
            )}
          </div>

          <div className="relative z-[999]">
            <label className="block text-sm font-semibold text-gray-800 mb-1">Choose Trek*</label>
            <Select
              options={trekOptions}
              value={selectedTrek}
              onChange={handleTrekChange}
              placeholder={selectedDestination ? "Select a trek" : "Select destination first"}
              classNamePrefix="react-select"
              isClearable
              styles={{
                ...selectStyles,
                control: (provided, state) => ({
                  ...selectStyles.control(provided, state),
                  borderColor: errors.trek ? '#ef4444' : state.isFocused ? '#10b981' : '#d1d5db',
                  boxShadow: errors.trek ? '0 0 0 1px #ef4444' : state.isFocused ? '0 0 0 1px #10b981' : null,
                })
              }}
              menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
              menuPosition="fixed"
              isDisabled={!selectedDestination}
            />
            {errors.trek && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs mt-1"
              >
                {errors.trek}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Right Section */}
        <motion.div 
          variants={itemVariants}
          className="flex-[2] bg-[#C3EFE6] rounded-xl p-3 flex flex-col justify-between"
        >
          <div className="flex gap-4">
            {/* Date Picker */}
            <motion.div 
              variants={itemVariants}
              className="flex-1 relative z-[60]"
            >
              <label className="block text-sm font-semibold text-gray-800 mb-1">Enter Date</label>
              <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                customInput={
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
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
              {errors.date && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs mt-1"
                >
                  {errors.date}
                </motion.p>
              )}
            </motion.div>

            {/* Counter */}
            <div className="flex-1">
              <Counter 
                label="No. of Individuals"
                value={count}
                onIncrement={() => setCount(prev => prev + 1)}
                onDecrement={() => setCount(prev => Math.max(1, prev - 1))}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setCount(1);
                  } else {
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                      setCount(Math.max(1, numValue));
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 items-center mt-3">
            <AnimatePresence mode="wait">
              {isSearching ? (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-32 flex justify-center"
                >
                  <motion.div
                    className="h-9 w-9 rounded-full border-2 border-green-500 border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              ) : (
                <motion.button
                  key="search"
                  variants={buttonVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2 px-6 py-1.5 bg-[#28A745] hover:bg-green-600 text-white text-base rounded-md transition w-32"
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
              className="flex items-center justify-center gap-1 px-4 py-1.5 bg-[#A6D8BA] hover:bg-red-500 hover:text-white text-sm rounded-md transition w-24"
            >
              <RefreshCcw size={14} />
              Reset
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

const Counter = ({ label, value, onIncrement, onDecrement, onChange }) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue === "") {
      onChange({ target: { value: "" } });
    } else if (/^\d*$/.test(newValue)) {
      onChange(e);
    }
  };

  const handleBlur = () => {
    if (inputValue === "") {
      setInputValue("1");
      onChange({ target: { value: "1" } });
    }
  };

  const handleFocus = (e) => {
    e.target.select();
  };

  return (
    <motion.div 
      className="w-full"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.3 }}
    >
      <label className="block text-sm font-semibold text-gray-800 mb-1">{label}</label>
      <div className="flex items-center bg-white rounded-lg border border-gray-300 h-9">
        <motion.button 
          className="px-2 text-gray-600 hover:bg-green-100 focus:outline-none focus:ring-1 focus:ring-green-400 rounded-l-md text-sm"
          onClick={onDecrement}
          whileTap={{ scale: 0.9 }}
        >
          -
        </motion.button>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="flex-1 text-center border-x border-gray-300 text-sm focus:outline-none "
        />
        <motion.button 
          className="px-2 text-gray-600 hover:bg-green-100 focus:outline-none focus:ring-1 focus:ring-green-400 rounded-r-md text-sm"
          onClick={onIncrement}
          whileTap={{ scale: 0.9 }}
        >
          +
        </motion.button>
      </div>
    </motion.div>
  );
};

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '32px',
    fontSize: '0.85rem',
    borderColor: state.isFocused ? '#10b981' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #10b981' : null,
    '&:hover': { borderColor: '#10b981' },
    borderRadius: '8px',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    marginTop: '4px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: '4px',
    fontSize: '0.85rem',
  }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '6px',
    backgroundColor: state.isSelected 
      ? '#a7f3d0'
      : state.isFocused 
        ? '#d1fae5'
        : 'white',
    color: state.isSelected 
      ? '#065f46'
      : '#1e293b',
    margin: '4px 0',
    padding: '8px 12px',
    transition: 'all 0.15s ease-out',
    '&:active': {
      backgroundColor: '#6ee7b7',
      color: '#064e3b'
    },
    '&:hover:not(:active)': {
      backgroundColor: '#d1fae5',
      boxShadow: 'inset 0 0 0 1px #a7f3d0'
    }
  }),
};

TrekSearchInput.displayName = 'TrekSearchInput';
export default TrekSearchInput;