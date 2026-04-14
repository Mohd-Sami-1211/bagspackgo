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
    backgroundColor: state.isSelected ? '#f1f5f9' : state.isFocused ? '#f8fafc' : 'white',
    color: state.isSelected ? '#0f172a' : '#475569',
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

const PickupDropoff = ({ defaultLocation, onNext, onBack, startDate, duration, pickupDropCities }) => {
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
    if (!isInitialized) {
       let loadedFromSession = false;
       try {
         const saved = localStorage.getItem("temp_trek_pick_drop");
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
      localStorage.setItem("temp_trek_pick_drop", JSON.stringify(formData));
    }
  }, [formData, isInitialized]);

  const handleChange = (section, field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [section]: { ...prev[section], [field]: value } };
      
      // Auto-set time when a location with guide-set timing is selected
      if (field === 'pickupAddress' && value) {
        const guidePickupTime = getGuideTime(prev.arrival.city?.value, value?.value, 'pickup');
        if (guidePickupTime) {
          updated[section].guideTime = guidePickupTime;
          updated[section].time = { value: 'guide', label: guidePickupTime };
        } else {
          updated[section].guideTime = null;
        }
      }
      if (field === 'dropoffAddress' && value) {
        const guideDropoffTime = getGuideTime(prev.departure.city?.value, value?.value, 'dropoff');
        if (guideDropoffTime) {
          updated[section].guideTime = guideDropoffTime;
          updated[section].time = { value: 'guide', label: guideDropoffTime };
        } else {
          updated[section].guideTime = null;
        }
      }
      // Reset location-related time when city changes
      if (field === 'city') {
        updated[section].guideTime = null;
      }
      
      return updated;
    });
    if (errors[`${section}_${field}`]) {
      setErrors(prev => ({ ...prev, [`${section}_${field}`]: '' }));
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.arrival.city) errs.arrival_city = 'City is required';
    if (!formData.arrival.pickupAddress) errs.arrival_pickupAddress = 'Address is required';
    // Only require manual time if guide hasn't set one
    if (!formData.arrival.guideTime && !formData.arrival.time) errs.arrival_time = 'Time is required';
    if (!formData.departure.city) errs.departure_city = 'City is required';
    if (!formData.departure.dropoffAddress) errs.departure_dropoffAddress = 'Address is required';
    if (!formData.departure.guideTime && !formData.departure.time) errs.departure_time = 'Time is required';
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
      const pickupTime = formData.arrival.guideTime
        ? formData.arrival.guideTime
        : `${formData.arrival.time?.value}:${formData.arrival.min?.value || '00'} ${formData.arrival.ampm?.value}`;
      const dropoffTime = formData.departure.guideTime
        ? formData.departure.guideTime
        : `${formData.departure.time?.value}:${formData.departure.min?.value || '00'} ${formData.departure.ampm?.value}`;
      onNext({
        pickup: {
          location: formData.arrival.city?.value,
          address: formData.arrival.pickupAddress?.value,
          date: startDate,
          time: pickupTime,
        },
        dropoff: {
          location: formData.departure.city?.value,
          address: formData.departure.dropoffAddress?.value,
          date: dropoffDate,
          time: dropoffTime,
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
        { cityName: defaultLocation || 'Base Camp', locations: [{ name: 'Main Bus Stand' }, { name: 'Railway Station' }] },
      ];

  const cityOptions = availableCities.map(c => ({ value: c.cityName, label: c.cityName }));

  const getLocationOptions = (cityValue) => {
    const city = availableCities.find(c => c.cityName === cityValue);
    return city ? city.locations.map(l => ({ value: l.name, label: l.name, pickupTime: l.pickupTime || '', dropoffTime: l.dropoffTime || '' })) : [];
  };

  // Helper to get guide-set time for a specific location
  const formatTimeDisplay = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m || '00'} ${ampm}`;
  };

  const getGuideTime = (cityValue, locationName, type) => {
    const city = availableCities.find(c => c.cityName === cityValue);
    if (!city) return null;
    const loc = city.locations.find(l => l.name === locationName);
    if (!loc) return null;
    const rawTime = type === 'pickup' ? loc.pickupTime : loc.dropoffTime;
    return rawTime ? formatTimeDisplay(rawTime) : null;
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
        <div className="bg-slate-50/80 border border-gray-100 p-6 rounded-xl mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Pickup & Drop Off Details</h2>
          <p className="text-gray-500 text-sm font-medium">Provide your pickup and drop off information for a smooth journey</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap mb-6 sm:mb-8 border-b border-gray-200">
          {[
            { key: 'arrival', label: 'Pickup Details' },
            { key: 'departure', label: 'Drop Off Details' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`px-4 py-2.5 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${
                activeSection === tab.key
                  ? 'text-emerald-700 border-emerald-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <Car className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* ── Destination Banner ── */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Your Destination</p>
              <p className="text-base font-medium text-gray-900 mt-0.5">{defaultLocation}</p>
            </div>
          </div>

          {activeSection === 'arrival' ? (
            <div className="space-y-5">
              {/* Pickup City */}
              <div>
                <label className={labelClass}><MapPin className="h-3.5 w-3.5 text-gray-400" /> Pickup City*</label>
                <Select
                  instanceId="trek-pickup-city"
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
                <label className={labelClass}><MapPin className="h-3.5 w-3.5 text-gray-400" /> Pickup Address*</label>
                <Select
                  instanceId="trek-pickup-address"
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
                  <label className={labelClass}><Calendar className="h-3.5 w-3.5 text-gray-400" /> Pickup Date</label>
                  <div className="px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-gray-800">
                    {formatDate(startDate)}
                  </div>
                </div>
                <div>
                  <label className={labelClass}><Clock className="h-3.5 w-3.5 text-gray-400" /> Pickup Time{!formData.arrival.guideTime && '*'}</label>
                  {formData.arrival.guideTime ? (
                    <div className="px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formData.arrival.guideTime}
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded ml-auto uppercase tracking-wider">Fixed by Guide</span>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 items-center">
                      <div className="flex-1">
                        <Select instanceId="trek-arr-hour" options={hourOptions} value={formData.arrival.time}
                          onChange={val => handleChange('arrival', 'time', val)} placeholder="HH"
                          styles={selectStyles}
                          menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                      </div>
                      <span className="text-gray-500 font-bold text-lg">:</span>
                      <div className="flex-1">
                        <Select instanceId="trek-arr-min" options={minOptions} value={formData.arrival.min || { value: '00', label: '00' }}
                          onChange={val => handleChange('arrival', 'min', val)} placeholder="MM"
                          styles={selectStyles}
                          menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                      </div>
                      <div className="w-[80px]">
                        <Select instanceId="trek-arr-ampm" options={ampmOptions} value={formData.arrival.ampm}
                          onChange={val => handleChange('arrival', 'ampm', val)}
                          styles={selectStyles} isSearchable={false}
                          menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                      </div>
                    </div>
                  )}
                  {errorEl('arrival_time')}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Drop Off City */}
              <div>
                <label className={labelClass}><MapPin className="h-3.5 w-3.5 text-gray-400" /> Drop Off City*</label>
                <Select
                  instanceId="trek-dropoff-city"
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
                <label className={labelClass}><MapPin className="h-3.5 w-3.5 text-gray-400" /> Drop Off Address*</label>
                <Select
                  instanceId="trek-dropoff-address"
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
                  <label className={labelClass}><Calendar className="h-3.5 w-3.5 text-gray-400" /> Drop Off Date</label>
                  <div className="px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm font-medium text-gray-800">
                    {formatDate(dropoffDate)}
                  </div>
                </div>
                <div>
                  <label className={labelClass}><Clock className="h-3.5 w-3.5 text-gray-400" /> Drop Off Time{!formData.departure.guideTime && '*'}</label>
                  {formData.departure.guideTime ? (
                    <div className="px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formData.departure.guideTime}
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded ml-auto uppercase tracking-wider">Fixed by Guide</span>
                    </div>
                  ) : (
                    <div className="flex gap-1.5 items-center">
                      <div className="flex-1">
                        <Select instanceId="trek-dep-hour" options={hourOptions} value={formData.departure.time}
                          onChange={val => handleChange('departure', 'time', val)} placeholder="HH"
                          styles={selectStyles}
                          menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                      </div>
                      <span className="text-gray-500 font-bold text-lg">:</span>
                      <div className="flex-1">
                        <Select instanceId="trek-dep-min" options={minOptions} value={formData.departure.min || { value: '00', label: '00' }}
                          onChange={val => handleChange('departure', 'min', val)} placeholder="MM"
                          styles={selectStyles}
                          menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                      </div>
                      <div className="w-[80px]">
                        <Select instanceId="trek-dep-ampm" options={ampmOptions} value={formData.departure.ampm}
                          onChange={val => handleChange('departure', 'ampm', val)}
                          styles={selectStyles} isSearchable={false}
                          menuPortalTarget={typeof document !== 'undefined' ? document.body : null} menuPosition="fixed" />
                      </div>
                    </div>
                  )}
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
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-sm"
            >
              Save & Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-gray-500" />
            Transportation Tips
          </h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" /><span>Be at your pickup point at least 10 minutes before the scheduled time</span></li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" /><span>Our driver will contact you 30 minutes before reaching your location</span></li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" /><span>Keep your booking confirmation ready for verification at pickup</span></li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" /><span>Ensure your luggage is within the permitted size and weight limits</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PickupDropoff;