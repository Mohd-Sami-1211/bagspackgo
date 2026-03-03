'use client';
import { MapPin, Calendar, Clock, Car, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const ArrDep = ({ defaultLocation, onNext, onBack, startDate, duration, pickupDropCities }) => {
  const [formData, setFormData] = useState({
    arrival: {
      city: defaultLocation || '',
      pickupAddress: '',
      time: '08:00',
      ampm: 'AM'
    },
    departure: {
      city: defaultLocation || '',
      dropoffAddress: '',
      time: '16:00',
      ampm: 'PM'
    }
  });

  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('arrival');

  // Calculate dropoff date based on startDate and duration
  const dropoffDate = startDate ? new Date(new Date(startDate).setDate(startDate.getDate() + duration)) : new Date();

  useEffect(() => {
    // Reset form when defaultLocation changes
    setFormData(prev => ({
      arrival: {
        ...prev.arrival,
        city: defaultLocation || '',
        pickupAddress: ''
      },
      departure: {
        ...prev.departure,
        city: defaultLocation || '',
        dropoffAddress: ''
      }
    }));
  }, [defaultLocation]);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    if (errors[`${section}_${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}_${field}`]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.arrival.city.trim()) {
      newErrors.arrival_city = 'City is required';
      isValid = false;
    }
    if (!formData.arrival.pickupAddress.trim()) {
      newErrors.arrival_pickupAddress = 'Address is required';
      isValid = false;
    }
    if (!formData.arrival.time.trim()) {
      newErrors.arrival_time = 'Time is required';
      isValid = false;
    }

    if (!formData.departure.city.trim()) {
      newErrors.departure_city = 'City is required';
      isValid = false;
    }
    if (!formData.departure.dropoffAddress.trim()) {
      newErrors.departure_dropoffAddress = 'Address is required';
      isValid = false;
    }
    if (!formData.departure.time.trim()) {
      newErrors.departure_time = 'Time is required';
      isValid = false;
    }

    setErrors(newErrors);

    if (
      !isValid &&
      !newErrors.arrival_city &&
      !newErrors.arrival_pickupAddress &&
      !newErrors.arrival_time &&
      (newErrors.departure_city || newErrors.departure_dropoffAddress || newErrors.departure_time)
    ) {
      setActiveSection('departure');
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext({
        pickup: {
          location: formData.arrival.city,
          address: formData.arrival.pickupAddress,
          date: startDate,
          time: `${formData.arrival.time} ${formData.arrival.ampm}`
        },
        dropoff: {
          location: formData.departure.city,
          address: formData.departure.dropoffAddress,
          date: dropoffDate,
          time: `${formData.departure.time} ${formData.departure.ampm}`
        },
        startDate: startDate
      });
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formattedCities = {};
  if (pickupDropCities && pickupDropCities.length > 0) {
    pickupDropCities.forEach(cityObj => {
      formattedCities[cityObj.cityName] = cityObj.locations.map(l => l.name);
    });
  } else if (defaultLocation) {
    formattedCities[defaultLocation] = ['Default Station/Airport'];
  } else {
    // Fallback if no data is provided
    formattedCities['Select City'] = ['N/A'];
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center text-green-600 hover:text-green-700 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Transportation Details</h2>
        <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
          Provide your arrival and departure information
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap mb-6 sm:mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveSection('arrival')}
            className={`px-3 sm:px-4 py-2 font-medium text-sm flex items-center ${activeSection === 'arrival'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Car className="h-4 w-4 mr-2" />
            Arrival Details
          </button>
          <button
            onClick={() => setActiveSection('departure')}
            className={`px-3 sm:px-4 py-2 font-medium text-sm flex items-center ${activeSection === 'departure'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Car className="h-4 w-4 mr-2" />
            Departure Details
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {activeSection === 'arrival' ? (
            <div className="space-y-6">
              {/* Destination display */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 sm:p-5 border border-green-100">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Your Destination</span>
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-800 mt-1 ml-7">{defaultLocation}</p>
              </div>

              {/* Arrival City */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  Arrival City*
                </label>
                <div className="relative">
                  <select
                    value={formData.arrival.city}
                    onChange={(e) => handleInputChange('arrival', 'city', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none pr-10 text-sm sm:text-base ${errors.arrival_city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select arrival city</option>
                    {Object.keys(formattedCities).map(city => (
                      <option key={`arrival-${city}`} value={city}>{city}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {errors.arrival_city && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.arrival_city}
                  </p>
                )}
              </div>

              {/* Pickup Address */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  Pickup Address*
                </label>
                <div className="relative">
                  <select
                    value={formData.arrival.pickupAddress}
                    onChange={(e) => handleInputChange('arrival', 'pickupAddress', e.target.value)}
                    disabled={!formData.arrival.city}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none pr-10 text-sm sm:text-base ${errors.arrival_pickupAddress ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      } ${!formData.arrival.city ? 'bg-gray-50 text-gray-400' : ''}`}
                  >
                    <option value="">Select pickup address</option>
                    {formData.arrival.city && formattedCities[formData.arrival.city]?.map(address => (
                      <option key={`arrival-addr-${address}`} value={address}>{address}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {errors.arrival_pickupAddress && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.arrival_pickupAddress}
                  </p>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-green-600" />
                    Arrival Date
                  </label>
                  <div className="px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base">
                    <p className="text-gray-800">{formatDate(startDate)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-green-600" />
                    Arrival Time*
                  </label>
                  <input
                    type="time"
                    value={formData.arrival.time}
                    onChange={(e) => handleInputChange('arrival', 'time', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base ${errors.arrival_time ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                  />
                  {errors.arrival_time && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.arrival_time}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Departure Section */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 sm:p-5 border border-green-100">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-500">Your Destination</span>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-gray-800 mt-1 ml-7">{defaultLocation}</p>
                </div>

                {/* Departure City */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-green-600" />
                    Departure City*
                  </label>
                  <div className="relative">
                    <select
                      value={formData.departure.city}
                      onChange={(e) => handleInputChange('departure', 'city', e.target.value)}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none pr-10 text-sm sm:text-base ${errors.departure_city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Select departure city</option>
                      {Object.keys(formattedCities).map(city => (
                        <option key={`departure-${city}`} value={city}>{city}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.departure_city && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.departure_city}
                    </p>
                  )}
                </div>

                {/* Dropoff Address */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-green-600" />
                    Drop-off Address*
                  </label>
                  <div className="relative">
                    <select
                      value={formData.departure.dropoffAddress}
                      onChange={(e) => handleInputChange('departure', 'dropoffAddress', e.target.value)}
                      disabled={!formData.departure.city}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none pr-10 text-sm sm:text-base ${errors.departure_dropoffAddress ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        } ${!formData.departure.city ? 'bg-gray-50 text-gray-400' : ''}`}
                    >
                      <option value="">Select drop-off address</option>
                      {formData.departure.city && formattedCities[formData.departure.city]?.map(address => (
                        <option key={`departure-addr-${address}`} value={address}>{address}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.departure_dropoffAddress && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.departure_dropoffAddress}
                    </p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      Departure Date
                    </label>
                    <div className="px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base">
                      <p className="text-gray-800">{formatDate(dropoffDate)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-green-600" />
                      Departure Time*
                    </label>
                    <input
                      type="time"
                      value={formData.departure.time}
                      onChange={(e) => handleInputChange('departure', 'time', e.target.value)}
                      className={`w-full px-3 sm:px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base ${errors.departure_time ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                    {errors.departure_time && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <span className="mr-1">⚠</span> {errors.departure_time}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm sm:text-base"
            >
              Save & Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </form>

        {/* Tips section */}
        <div className="mt-8 p-4 sm:p-5 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center text-base sm:text-lg">
            <Car className="h-5 w-5 mr-2 text-blue-600" />
            Transportation Tips
          </h4>
          <ul className="text-sm sm:text-base text-blue-700 space-y-1.5">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Pickup time is when we'll arrive at your specified location</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Have your trekking gear ready when we arrive</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>We'll contact you the day before to confirm details</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ArrDep;
