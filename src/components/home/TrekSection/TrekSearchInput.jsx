'use client';
import { useState, forwardRef, useImperativeHandle, useEffect, useRef, memo } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarCheck, Search, RefreshCcw, Plus, Minus } from 'lucide-react';
import data from 'src/data/data.json';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TrekSearchInput = memo(forwardRef((props, ref) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedTrek, setSelectedTrek] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [dateInput, setDateInput] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
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
      peopleCount: peopleCount.toString()
    }),
  }));

  const handleReset = () => {
    setIsSearching(true);
    setTimeout(() => {
      setPeopleCount(1);
      setStartDate(null);
      setDateInput('');
      setSelectedDestination(null);
      setSelectedTrek(null);
      setTrekOptions([]);
        setErrors({
          destination: '',
          trek: '',
          date: '',
          peopleCount: ''
        });
      setIsSearching(false);
    }, 300);
  };

  const validateFields = () => {
    const newErrors = {
      destination: '',
      trek: '',
      date: '',
      peopleCount: ''
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
      newErrors.date = 'Select date';
      isValid = false;
    }
    if (peopleCount < 1) {
      newErrors.peopleCount = 'At least 1 person required';
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
        setTrekOptions([
          { value: 'all_treks', label: 'All Treks' },
          ...filteredTreks.map(trek => ({
            value: trek.id,
            label: trek.name,
            ...trek
          }))
        ]);
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
      peopleCount: peopleCount.toString()
    }).toString();
    router.push(`/user/trek/guidelist?${queryParams}`);
  };

  const handleIncrement = () => {
    setPeopleCount(prev => Math.min(prev + 1, 50));
    setErrors(prev => ({ ...prev, peopleCount: '' }));
  };

  const handleDecrement = () => {
    setPeopleCount(prev => Math.max(prev - 1, 1));
  };

  const scrollVariants = {
    offscreen: { opacity: 0, y: 20 },
    onscreen: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.2 }}
      variants={scrollVariants}
      className={`bg-white border shadow-sm rounded-xl p-3 sm:p-5 w-full max-w-full md:max-w-5xl min-h-[160px] transition-all`}
    >
      {!isMounted ? (
        <div className="w-full h-[180px] bg-white/50 animate-pulse rounded-2xl" />
      ) : (
        <div
          className="flex flex-col md:flex-row gap-2 md:gap-3"
        >
          {/* Left Section - Destination and Trek */}
          <div
            className="flex-1 space-y-3 sm:space-y-4 w-full md:w-auto relative z-10"
          >
            <TrekDestinationSelect
              selectedDestination={selectedDestination}
              handleDestinationChange={handleDestinationChange}
              error={errors.destination}
            />
            <TrekNameSelect
              trekOptions={trekOptions}
              selectedTrek={selectedTrek}
              handleTrekChange={handleTrekChange}
              selectedDestination={selectedDestination}
              error={errors.trek}
            />
          </div>

          {/* Right Section - People, Date and Search */}
          <div
            className="flex-[2] space-y-3 sm:space-y-4 flex flex-col justify-between w-full md:w-auto relative z-20"
          >
            {/* People Counter */}
            <div
              className="flex gap-2 sm:gap-4 w-full"
            >
              <div
                className="flex-1 w-full relative"
              >
                <label className="block text-sm font-medium text-slate-700 mb-1.5">No. of People</label>
                <div className={`flex items-center bg-white border rounded-lg h-[36px] transition-all ${errors.peopleCount ? 'border-red-500 shadow-[0_0_0_1px_#ef4444]' : 'border-gray-300 hover:border-emerald-400'}`}>
                  <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={peopleCount <= 1}
                    className="flex items-center justify-center w-9 h-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-l-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                  >
                    <Minus size={14} />
                  </button>
                  <div className="flex-1 text-center text-sm font-bold text-gray-800 select-none tabular-nums">
                    {peopleCount}
                  </div>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="flex items-center justify-center w-9 h-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-r-lg transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <AnimatePresence>
                  {errors.peopleCount && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] sm:text-xs text-red-500 font-medium mt-1 ml-1"
                    >
                      {errors.peopleCount}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end mt-2 sm:mt-1">
              <div className="flex-1 relative z-[60] w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  customInput={
                    <div className="relative w-full">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <CalendarCheck className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="text"
                        value={dateInput}
                        onChange={handleInputChange}
                        placeholder="DD/MM/YYYY"
                        className={`w-full pl-9 ${errors.date ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                    </div>
                  }
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="scroll"
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  placeholderText="DD/MM/YYYY"
                  popperClassName="z-[1000]"
                  popperPlacement="bottom-start"
                  calendarClassName="border-green-200 rounded-md shadow-xl bg-white"
                  wrapperClassName="w-full"
                />
                <AnimatePresence>
                  {errors.date && (
                    <motion.p 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[11px] sm:text-xs text-red-500 font-medium mt-1 ml-1"
                    >
                      {errors.date}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex gap-2 sm:gap-3 flex-wrap sm:flex-nowrap justify-end w-full sm:w-auto mt-2">
                <AnimatePresence mode="wait">
                  {isSearching ? (
                    <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full sm:w-32 flex justify-center py-2">
                      <div className="h-5 w-5 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
                    </motion.div>
                  ) : (
                    <Button
                      key="search"
                      onClick={handleSearch}
                      className="w-full sm:w-[120px] bg-green-600 hover:bg-green-700"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </Button>
                  )}
                </AnimatePresence>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full sm:w-[100px]"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}));

// ------------------- Helper Components -------------------

const TrekDestinationSelect = ({ selectedDestination, handleDestinationChange, error }) => {
  const destinationOptions = [
    ...(data.destinations || []).filter(d => ['kashmir'].includes(d.value)),
    {
      label: 'Available Soon',
      options: (data.destinations || []).filter(d => !['kashmir'].includes(d.value)).map(dest => ({
        ...dest,
        isDisabled: true,
      }))
    }
  ];

  return (
    <div
      className="relative z-[1000] w-full"
    >
      <label className="block text-sm font-semibold text-gray-800 mb-1">Select Destination</label>
      <Select
        instanceId="trek-destination-select"
        options={destinationOptions}
        value={selectedDestination}
        onChange={handleDestinationChange}
        placeholder="Choose a destination"
        classNamePrefix="react-select"
        isClearable
        styles={{
          ...selectStyles,
          control: (provided, state) => ({
            ...selectStyles.control(provided, state),
            minHeight: '36px',
            borderColor: error ? '#ef4444' : state.isFocused ? '#10b981' : '#d1d5db',
            boxShadow: error ? '0 0 0 1px #ef4444' : state.isFocused ? '0 0 0 1px #10b981' : null,
          })
        }}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
      />
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="text-[11px] sm:text-xs text-red-500 font-medium mt-1 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

const TrekNameSelect = ({ trekOptions, selectedTrek, handleTrekChange, selectedDestination, error }) => (
  <div
    className="relative z-[1000] w-full"
  >
    <label className="block text-sm font-semibold text-gray-800 mb-1">Choose Trek</label>
    <Select
      instanceId="trek-select"
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
          minHeight: '36px',
          borderColor: error ? '#ef4444' : state.isFocused ? '#10b981' : '#d1d5db',
          boxShadow: error ? '0 0 0 1px #ef4444' : state.isFocused ? '0 0 0 1px #10b981' : null,
        })
      }}
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      isDisabled={!selectedDestination}
    />
    <AnimatePresence>
      {error && (
        <motion.p 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          exit={{ opacity: 0, height: 0 }}
          className="text-[11px] sm:text-xs text-red-500 font-medium mt-1 ml-1"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '36px',
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

TrekSearchInput.displayName = 'TrekSearchInput';
export default TrekSearchInput;