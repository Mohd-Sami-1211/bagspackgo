'use client';
import Select from 'react-select';
import { MapPin, Calendar, Clock, Car, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

// ── Shared react-select styles matching the site theme ──────
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '38px',
    fontSize: '0.875rem',
    fontWeight: 500,
    borderColor: state.isFocused ? '#10b981' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 1px #10b981' : null,
    '&:hover': { borderColor: state.isFocused ? '#10b981' : '#e5e7eb' },
    borderRadius: '8px',
    backgroundColor: '#F9FAFB',
    cursor: 'pointer',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    marginTop: '4px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 4px 10px -3px rgba(0,0,0,0.07)',
    border: '1px solid #f0fdf4',
    overflow: 'hidden',
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menuList: (provided) => ({ ...provided, padding: '4px', fontSize: '0.875rem' }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '8px',
    backgroundColor: state.isSelected ? '#d1fae5' : state.isFocused ? '#f0fdf4' : 'white',
    color: state.isSelected ? '#065f46' : '#1e293b',
    fontWeight: state.isSelected ? 600 : 400,
    margin: '2px 0',
    padding: '8px 12px',
    cursor: 'pointer',
    transition: 'all 0.15s ease-out',
    '&:active': { backgroundColor: '#a7f3d0', color: '#064e3b' },
  }),
  singleValue: (provided) => ({ ...provided, color: '#1e293b', fontWeight: 500 }),
  placeholder: (provided) => ({ ...provided, color: '#9ca3af', fontSize: '0.875rem' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: state.isFocused ? '#10b981' : '#9ca3af',
    '&:hover': { color: '#10b981' },
    padding: '0 8px',
  }),
};

const ArrDep = ({ defaultLocation, onNext, onBack, startDate, duration, pickupDropCities }) => {
  const [formData, setFormData] = useState({
    arrival: { city: null, pickupAddress: null, time: null, ampm: { value: 'AM', label: 'AM' } },
    departure: { city: null, dropoffAddress: null, time: null, ampm: { value: 'PM', label: 'PM' } },
  });

  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('arrival');
  const [isInitialized, setIsInitialized] = useState(false);

  const dropoffDate = startDate
    ? new Date(new Date(startDate).setDate(startDate.getDate() + duration))
    : new Date();

  useEffect(() => {
    // Only reset if not already initialized or default location genuinely changes significantly 
    if (!isInitialized) {
       let loadedFromSession = false;
       try {
         const saved = localStorage.getItem("temp_arr_dep_details");
         if (saved) {
           const parsed = JSON.parse(saved);
           if (parsed) {
             setFormData(parsed);
             loadedFromSession = true;
           }
         }
       } catch(e) {}

       if (!loadedFromSession) {
         setFormData(prev => ({
           arrival: { ...prev.arrival, city: null, pickupAddress: null },
           departure: { ...prev.departure, city: null, dropoffAddress: null },
         }));
       }
       setIsInitialized(true);
    }
  }, [defaultLocation]);

  useEffect(() => {
    if (!isInitialized) return;
    
    const hasData = formData.arrival.city || formData.arrival.pickupAddress || formData.arrival.time ||
                    formData.departure.city || formData.departure.dropoffAddress || formData.departure.time;
    
    if (hasData) {
      localStorage.setItem("temp_arr_dep_details", JSON.stringify(formData));
      
      const pendingData = localStorage.getItem('pending_booking');
      let parsedPending = pendingData ? JSON.parse(pendingData) : { ignored: false };
      
      if (!parsedPending.ignored) {
         parsedPending = {
            ...parsedPending,
            ignored: false,
            url: window.location.pathname + window.location.search,
            timestamp: Date.now()
         };
         localStorage.setItem('pending_booking', JSON.stringify(parsedPending));
      }
    }
  }, [formData, isInitialized]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    if (errors[`${section}_${field}`]) {
      setErrors(prev => ({ ...prev, [`${section}_${field}`]: '' }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.arrival.city) errs.arrival_city = 'City is required';
    if (!formData.arrival.pickupAddress) errs.arrival_pickupAddress = 'Address is required';
    if (!formData.arrival.time) errs.arrival_time = 'Time is required';
    if (!formData.departure.city) errs.departure_city = 'City is required';
    if (!formData.departure.dropoffAddress) errs.departure_dropoffAddress = 'Address is required';
    if (!formData.departure.time) errs.departure_time = 'Time is required';
    setErrors(errs);

    // Auto-switch to the tab that has errors
    const hasArrivalErrors = errs.arrival_city || errs.arrival_pickupAddress || errs.arrival_time;
    const hasDepartureErrors = errs.departure_city || errs.departure_dropoffAddress || errs.departure_time;
    if (!hasArrivalErrors && hasDepartureErrors) {
      setActiveSection('departure');
    } else if (hasArrivalErrors) {
      setActiveSection('arrival');
    }

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext({
        pickup: {
          location: formData.arrival.city?.value,
          address: formData.arrival.pickupAddress?.value,
          date: startDate,
          time: `${formData.arrival.time?.value}:${formData.arrival.min?.value || '00'} ${formData.arrival.ampm?.value}`,
        },
        dropoff: {
          location: formData.departure.city?.value,
          address: formData.departure.dropoffAddress?.value,
          date: dropoffDate,
          time: `${formData.departure.time?.value}:${formData.departure.min?.value || '00'} ${formData.departure.ampm?.value}`,
        },
        startDate,
      });
    }
  };

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const availableCities = pickupDropCities?.length > 0
    ? pickupDropCities
    : [
        { cityName: 'New York', locations: [{ name: 'JFK Airport' }, { name: 'LaGuardia Airport' }, { name: 'Manhattan Downtown' }] },
        { cityName: 'Los Angeles', locations: [{ name: 'LAX Airport' }, { name: 'Downtown LA' }, { name: 'Santa Monica' }] },
        { cityName: 'Chicago', locations: [{ name: "O'Hare Airport" }, { name: 'Midway Airport' }, { name: 'Downtown Chicago' }] },
      ];

  const cityOptions = availableCities.map(c => ({ value: c.cityName, label: c.cityName }));

  const getLocationOptions = (cityValue) => {
    const city = availableCities.find(c => c.cityName === cityValue);
    return city ? city.locations.map(l => ({ value: l.name, label: l.name })) : [];
  };

  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const h = String(i + 1).padStart(2, '0');
    return { value: h, label: h };
  });

  const minOptions = ['00', '15', '30', '45'].map(m => ({ value: m, label: m }));
  const ampmOptions = [{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }];

  const labelClass = 'text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5';
  const errorEl = (key) => errors[key] && (
    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">⚠ {errors[key]}</p>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
      <button
        onClick={onBack}
        className="group flex items-center gap-2.5 mb-6 sm:mb-8 transition-all w-fit bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:text-emerald-700 hover:border-emerald-200"
      >
        <div className="bg-gray-100 group-hover:bg-emerald-100 text-gray-600 group-hover:text-emerald-700 p-1.5 rounded-full transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Back
      </button>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Pickup & Drop Off Details</h2>
        <p className="text-gray-500 mb-6 sm:mb-8 text-sm">Provide your pickup and drop off information</p>

        {/* Tabs */}
        <div className="flex flex-wrap mb-6 sm:mb-8 border-b border-gray-200">
          {[
            { key: 'arrival', label: 'Pickup Details' },
            { key: 'departure', label: 'Drop Off Details' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`px-4 py-2.5 font-semibold text-sm flex items-center gap-2 transition-colors ${
                activeSection === tab.key
                  ? 'text-emerald-600 border-b-2 border-emerald-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Car className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* ── Destination Banner ── */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Your Destination</p>
              <p className="text-base font-semibold text-gray-800 mt-0.5">{defaultLocation}</p>
            </div>
          </div>

          {activeSection === 'arrival' ? (
            <div className="space-y-5">
              {/* Pickup City */}
              <div>
                <label className={labelClass}><MapPin className="h-3.5 w-3.5 text-emerald-600" /> Pickup City*</label>
                <Select
                  instanceId="pickup-city"
                  options={cityOptions}
                  value={formData.arrival.city}
                  onChange={val => { handleChange('arrival', 'city', val); handleChange('arrival', 'pickupAddress', null); }}
                  placeholder="Select city..."
                  styles={selectStyles}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />
                {errorEl('arrival_city')}
              </div>

              {/* Pickup Address */}
              <div>
                <label className={labelClass}><MapPin className="h-3.5 w-3.5 text-emerald-600" /> Pickup Address*</label>
                <Select
                  instanceId="pickup-address"
                  options={getLocationOptions(formData.arrival.city?.value)}
                  value={formData.arrival.pickupAddress}
                  onChange={val => handleChange('arrival', 'pickupAddress', val)}
                  placeholder={formData.arrival.city ? 'Select pickup point...' : 'Select a city first'}
                  isDisabled={!formData.arrival.city}
                  styles={selectStyles}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />
                {errorEl('arrival_pickupAddress')}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className={labelClass}><Calendar className="h-3.5 w-3.5 text-emerald-600" /> Pickup Date</label>
                  <div className="px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-gray-800">
                    {formatDate(startDate)}
                  </div>
                </div>
                <div>
                  <label className={labelClass}><Clock className="h-3.5 w-3.5 text-emerald-600" /> Pickup Time*</label>
                  <div className="flex gap-1.5 items-center">
                    <div className="flex-1">
                      <Select instanceId="arr-hour" options={hourOptions} value={formData.arrival.time}
                        onChange={val => handleChange('arrival', 'time', val)} placeholder="HH"
                        styles={selectStyles}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                    </div>
                    <span className="text-gray-500 font-bold text-lg">:</span>
                    <div className="flex-1">
                      <Select instanceId="arr-min" options={minOptions} value={formData.arrival.min || { value: '00', label: '00' }}
                        onChange={val => handleChange('arrival', 'min', val)} placeholder="MM"
                        styles={selectStyles}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                    </div>
                    <div className="w-[80px]">
                      <Select instanceId="arr-ampm" options={ampmOptions} value={formData.arrival.ampm}
                        onChange={val => handleChange('arrival', 'ampm', val)}
                        styles={selectStyles} isSearchable={false}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                    </div>
                  </div>
                  {errorEl('arrival_time')}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Drop Off City */}
              <div>
                <label className={labelClass}><MapPin className="h-3.5 w-3.5 text-emerald-600" /> Drop Off City*</label>
                <Select
                  instanceId="dropoff-city"
                  options={cityOptions}
                  value={formData.departure.city}
                  onChange={val => { handleChange('departure', 'city', val); handleChange('departure', 'dropoffAddress', null); }}
                  placeholder="Select city..."
                  styles={selectStyles}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />
                {errorEl('departure_city')}
              </div>

              {/* Drop Off Address */}
              <div>
                <label className={labelClass}><MapPin className="h-3.5 w-3.5 text-emerald-600" /> Drop Off Address*</label>
                <Select
                  instanceId="dropoff-address"
                  options={getLocationOptions(formData.departure.city?.value)}
                  value={formData.departure.dropoffAddress}
                  onChange={val => handleChange('departure', 'dropoffAddress', val)}
                  placeholder={formData.departure.city ? 'Select drop off point...' : 'Select a city first'}
                  isDisabled={!formData.departure.city}
                  styles={selectStyles}
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />
                {errorEl('departure_dropoffAddress')}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className={labelClass}><Calendar className="h-3.5 w-3.5 text-emerald-600" /> Drop Off Date</label>
                  <div className="px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-gray-800">
                    {formatDate(dropoffDate)}
                  </div>
                </div>
                <div>
                  <label className={labelClass}><Clock className="h-3.5 w-3.5 text-emerald-600" /> Drop Off Time*</label>
                  <div className="flex gap-1.5 items-center">
                    <div className="flex-1">
                      <Select instanceId="dep-hour" options={hourOptions} value={formData.departure.time}
                        onChange={val => handleChange('departure', 'time', val)} placeholder="HH"
                        styles={selectStyles}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                    </div>
                    <span className="text-gray-500 font-bold text-lg">:</span>
                    <div className="flex-1">
                      <Select instanceId="dep-min" options={minOptions} value={formData.departure.min || { value: '00', label: '00' }}
                        onChange={val => handleChange('departure', 'min', val)} placeholder="MM"
                        styles={selectStyles}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                    </div>
                    <div className="w-[80px]">
                      <Select instanceId="dep-ampm" options={ampmOptions} value={formData.departure.ampm}
                        onChange={val => handleChange('departure', 'ampm', val)}
                        styles={selectStyles} isSearchable={false}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                    </div>
                  </div>
                  {errorEl('departure_time')}
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-green-200/60"
            >
              Save & Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 p-4 sm:p-5 bg-emerald-50 rounded-xl border border-emerald-100">
          <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Car className="h-4 w-4 text-emerald-600" />
            Transportation Tips
          </h4>
          <ul className="text-sm text-emerald-700 space-y-2">
            <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span><span>Be at your pickup point at least 10 minutes before the scheduled time</span></li>
            <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span><span>Our driver will contact you 30 minutes before reaching your location</span></li>
            <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span><span>Keep your booking confirmation ready for verification at pickup</span></li>
            <li className="flex items-start gap-2"><span className="mt-0.5 shrink-0">•</span><span>Ensure your luggage is within the permitted size and weight limits</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ArrDep;
