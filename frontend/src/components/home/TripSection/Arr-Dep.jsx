'use client';
import { MapPin, Calendar, Clock, Car, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const ArrDep = ({ defaultLocation, onNext, onBack, startDate, duration }) => {
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
    
    // Clear error when user types
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

    // Validate arrival details
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

    // Validate departure details
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
    
    // If arrival is complete but departure has errors, switch to departure section
    if (!isValid && 
        !newErrors.arrival_city && 
        !newErrors.arrival_pickupAddress && 
        !newErrors.arrival_time &&
        (newErrors.departure_city || newErrors.departure_dropoffAddress || newErrors.departure_time)) {
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

  // Sample cities and addresses data
  const cities = {
    'New York': ['JFK Airport', 'LaGuardia Airport', 'Manhattan Downtown'],
    'Los Angeles': ['LAX Airport', 'Downtown LA', 'Santa Monica'],
    'Chicago': ["O'Hare Airport", 'Midway Airport', 'Downtown Chicago']
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <button
        onClick={onBack}
        className="flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back
      </button>

      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Transportation Details</h2>
        <p className="text-gray-600 mb-8">Provide your arrival and departure information</p>

        {/* Navigation Tabs */}
        <div className="flex mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveSection('arrival')}
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeSection === 'arrival' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Car className="h-4 w-4 mr-2" />
            Arrival Details
          </button>
          <button
            onClick={() => setActiveSection('departure')}
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeSection === 'departure' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Car className="h-4 w-4 mr-2" />
            Departure Details
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeSection === 'arrival' ? (
            <div className="space-y-6">
              {/* Destination (read-only) */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Your Destination</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 mt-1 ml-7">{defaultLocation}</p>
              </div>

              {/* City Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  Arrival City*
                </label>
                <div className="relative">
                  <select
                    value={formData.arrival.city}
                    onChange={(e) => handleInputChange('arrival', 'city', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none pr-10 ${
                      errors.arrival_city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select arrival city</option>
                    {Object.keys(cities).map(city => (
                      <option key={`arrival-${city}`} value={city}>{city}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {errors.arrival_city && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.arrival_city}
                  </p>
                )}
              </div>

              {/* Address Selection */}
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none pr-10 ${
                      errors.arrival_pickupAddress ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${!formData.arrival.city ? 'bg-gray-50 text-gray-400' : ''}`}
                  >
                    <option value="">Select pickup address</option>
                    {formData.arrival.city && cities[formData.arrival.city]?.map(address => (
                      <option key={`arrival-addr-${address}`} value={address}>{address}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {errors.arrival_pickupAddress && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.arrival_pickupAddress}
                  </p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-green-600" />
                    Arrival Date
                  </label>
                  <div className="px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-800">{formatDate(startDate)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-green-600" />
                    Arrival Time*
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={formData.arrival.time}
                      onChange={(e) => handleInputChange('arrival', 'time', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.arrival_time ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />

                  </div>
                  {errors.arrival_time && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.arrival_time}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Destination (read-only) */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-500">Your Destination</span>
                </div>
                <p className="text-lg font-semibold text-gray-800 mt-1 ml-7">{defaultLocation}</p>
              </div>

              {/* City Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  Departure City*
                </label>
                <div className="relative">
                  <select
                    value={formData.departure.city}
                    onChange={(e) => handleInputChange('departure', 'city', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none pr-10 ${
                      errors.departure_city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select departure city</option>
                    {Object.keys(cities).map(city => (
                      <option key={`departure-${city}`} value={city}>{city}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {errors.departure_city && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.departure_city}
                  </p>
                )}
              </div>

              {/* Address Selection */}
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none pr-10 ${
                      errors.departure_dropoffAddress ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    } ${!formData.departure.city ? 'bg-gray-50 text-gray-400' : ''}`}
                  >
                    <option value="">Select drop-off address</option>
                    {formData.departure.city && cities[formData.departure.city]?.map(address => (
                      <option key={`departure-addr-${address}`} value={address}>{address}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                {errors.departure_dropoffAddress && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.departure_dropoffAddress}
                  </p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-green-600" />
                    Departure Date
                  </label>
                  <div className="px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-800">{formatDate(dropoffDate)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-green-600" />
                    Departure Time*
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={formData.departure.time}
                      onChange={(e) => handleInputChange('departure', 'time', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.departure_time ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />

                  </div>
                  {errors.departure_time && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.departure_time}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              Save & Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center">
            <Car className="h-5 w-5 mr-2 text-blue-600" />
            Transportation Tips
          </h4>
          <ul className="text-sm text-blue-700 space-y-1.5">
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