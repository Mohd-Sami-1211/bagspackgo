'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin, Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

const ArrDep = ({ 
  defaultDestination,
  onNext,
  onBack,
  startDate: initialStartDate,
  duration
}) => {
  const [formData, setFormData] = useState({
    arrival: {
      city: '',
      pickupAddress: '',
      date: '',
      time: '',
      ampm: 'AM'
    },
    departure: {
      city: '',
      dropoffAddress: '',
      date: '',
      time: '',
      ampm: 'PM'
    }
  });

  const [errors, setErrors] = useState({});

  // Sample data - replace with your actual data
  const cities = {
    'Paris': ['Charles de Gaulle Airport', 'Orly Airport', 'Paris City Center'],
    'Rome': ['Fiumicino Airport', 'Ciampino Airport', 'Rome Termini Station'],
    'Barcelona': ['El Prat Airport', 'Sants Station', 'City Center']
  };

  // Calculate dates based on startDate and duration
  useEffect(() => {
    if (initialStartDate) {
      const arrivalDate = new Date(initialStartDate);
      const departureDate = new Date(initialStartDate);
      departureDate.setDate(departureDate.getDate() + duration - 1);

      setFormData(prev => ({
        ...prev,
        arrival: {
          ...prev.arrival,
          date: arrivalDate.toISOString().split('T')[0]
        },
        departure: {
          ...prev.departure,
          date: departureDate.toISOString().split('T')[0]
        }
      }));
    }
  }, [initialStartDate, duration]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    // Clear error when field is filled
    if (errors[`${section}_${field}`]) {
      setErrors(prev => ({ ...prev, [`${section}_${field}`]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    ['arrival', 'departure'].forEach(section => {
      if (!formData[section].city) {
        newErrors[`${section}_city`] = 'Please select a city';
        isValid = false;
      }
      if (!formData[section][section === 'arrival' ? 'pickupAddress' : 'dropoffAddress']) {
        newErrors[`${section}_address`] = 'Please select an address';
        isValid = false;
      }
      if (!formData[section].time) {
        newErrors[`${section}_time`] = 'Please select a time';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext({
        ...formData,
        startDate: initialStartDate, // Using the initial start date (uneditable)
        arrival: {
          ...formData.arrival,
          time: `${formData.arrival.time} ${formData.arrival.ampm}`
        },
        departure: {
          ...formData.departure,
          time: `${formData.departure.time} ${formData.departure.ampm}`
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">Arrival & Departure Details</h3>
      
      {/* Destination Section (non-editable) */}
      <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm font-medium text-gray-500">Your Destination</span>
        </div>
        <p className="text-lg font-semibold text-gray-800 mt-1 ml-7">{defaultDestination}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Trip Start Date Section (non-editable) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
            <span className="w-7 h-7 flex items-center justify-center bg-green-100 text-green-800 rounded-full mr-3">
              1
            </span>
            Trip Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {initialStartDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Duration
              </label>
              <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {duration} day{duration > 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Arrival Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
            <span className="w-7 h-7 flex items-center justify-center bg-green-100 text-green-800 rounded-full mr-3">
              2
            </span>
            Arrival Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* City Selection */}
            <div>
              <label htmlFor="arrival-city" className="block text-sm font-medium text-gray-700 mb-1">
                Select City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="arrival-city"
                  value={formData.arrival.city}
                  onChange={(e) => handleChange('arrival', 'city', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                >
                  <option value="">Select arrival city</option>
                  {Object.keys(cities).map(city => (
                    <option key={`arrival-${city}`} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.arrival_city && <p className="text-red-500 text-sm mt-1">{errors.arrival_city}</p>}
            </div>

            {/* Pickup Address */}
            <div>
              <label htmlFor="arrival-address" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="arrival-address"
                  value={formData.arrival.pickupAddress}
                  onChange={(e) => handleChange('arrival', 'pickupAddress', e.target.value)}
                  disabled={!formData.arrival.city}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Select pickup address</option>
                  {formData.arrival.city && cities[formData.arrival.city]?.map(address => (
                    <option key={`arrival-addr-${address}`} value={address}>{address}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.arrival_address && <p className="text-red-500 text-sm mt-1">{errors.arrival_address}</p>}
            </div>

            {/* Date and Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arrival Date
              </label>
              <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {new Date(formData.arrival.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            <div>
              <label htmlFor="arrival-time" className="block text-sm font-medium text-gray-700 mb-1">
                Arrival Time <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="time"
                    id="arrival-time"
                    value={formData.arrival.time}
                    onChange={(e) => handleChange('arrival', 'time', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 pr-10"
                  />
                  
                </div>
                <select
                  value={formData.arrival.ampm}
                  onChange={(e) => handleChange('arrival', 'ampm', e.target.value)}
                  className="w-20 p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              {errors.arrival_time && <p className="text-red-500 text-sm mt-1">{errors.arrival_time}</p>}
            </div>
          </div>
        </div>

        {/* Departure Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
            <span className="w-7 h-7 flex items-center justify-center bg-green-100 text-green-800 rounded-full mr-3">
              3
            </span>
            Departure Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* City Selection */}
            <div>
              <label htmlFor="departure-city" className="block text-sm font-medium text-gray-700 mb-1">
                Select City <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="departure-city"
                  value={formData.departure.city}
                  onChange={(e) => handleChange('departure', 'city', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10"
                >
                  <option value="">Select departure city</option>
                  {Object.keys(cities).map(city => (
                    <option key={`departure-${city}`} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.departure_city && <p className="text-red-500 text-sm mt-1">{errors.departure_city}</p>}
            </div>

            {/* Dropoff Address */}
            <div>
              <label htmlFor="departure-address" className="block text-sm font-medium text-gray-700 mb-1">
                Drop-off Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="departure-address"
                  value={formData.departure.dropoffAddress}
                  onChange={(e) => handleChange('departure', 'dropoffAddress', e.target.value)}
                  disabled={!formData.departure.city}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 appearance-none pr-10 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">Select drop-off address</option>
                  {formData.departure.city && cities[formData.departure.city]?.map(address => (
                    <option key={`departure-addr-${address}`} value={address}>{address}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
              {errors.departure_address && <p className="text-red-500 text-sm mt-1">{errors.departure_address}</p>}
            </div>

            {/* Date and Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Departure Date
              </label>
              <div className="p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {new Date(formData.departure.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            <div>
              <label htmlFor="departure-time" className="block text-sm font-medium text-gray-700 mb-1">
                Departure Time <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="time"
                    id="departure-time"
                    value={formData.departure.time}
                    onChange={(e) => handleChange('departure', 'time', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700 pr-10"
                  />
                
                </div>
                <select
                  value={formData.departure.ampm}
                  onChange={(e) => handleChange('departure', 'ampm', e.target.value)}
                  className="w-20 p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-700"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              {errors.departure_time && <p className="text-red-500 text-sm mt-1">{errors.departure_time}</p>}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArrDep;