'use client';
import { MapPin, Calendar, Clock, Car, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const PickupDropoff = ({ defaultLocation, onNext, onBack, startDate, duration }) => {
  const [pickupData, setPickupData] = useState({
    location: defaultLocation || '',
    address: '',
    time: '08:00'
  });

  const [dropoffData, setDropoffData] = useState({
    location: defaultLocation || '',
    address: '',
    time: '16:00'
  });

  const [errors, setErrors] = useState({
    pickup: {},
    dropoff: {}
  });

  const [activeSection, setActiveSection] = useState('pickup');

  // Calculate dropoff date based on startDate and duration
  const dropoffDate = startDate ? new Date(new Date(startDate).setDate(startDate.getDate() + duration)) : new Date();

  useEffect(() => {
    // Reset form when startDate changes
    setPickupData(prev => ({
      ...prev,
      location: defaultLocation || '',
      address: ''
    }));
    setDropoffData(prev => ({
      ...prev,
      location: defaultLocation || '',
      address: ''
    }));
  }, [defaultLocation, startDate]);

  const handleInputChange = (section, field, value) => {
    if (section === 'pickup') {
      setPickupData(prev => ({ ...prev, [field]: value }));
      // Clear error when user types
      if (errors.pickup[field]) {
        setErrors(prev => ({
          ...prev,
          pickup: {
            ...prev.pickup,
            [field]: ''
          }
        }));
      }
    } else {
      setDropoffData(prev => ({ ...prev, [field]: value }));
      // Clear error when user types
      if (errors.dropoff[field]) {
        setErrors(prev => ({
          ...prev,
          dropoff: {
            ...prev.dropoff,
            [field]: ''
          }
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {
      pickup: {},
      dropoff: {}
    };

    let isValid = true;

    // Validate pickup details
    if (!pickupData.location.trim()) {
      newErrors.pickup.location = 'Pickup location is required';
      isValid = false;
    }
    if (!pickupData.address.trim()) {
      newErrors.pickup.address = 'Pickup address is required';
      isValid = false;
    }
    if (!pickupData.time.trim()) {
      newErrors.pickup.time = 'Pickup time is required';
      isValid = false;
    }

    // Validate dropoff details
    if (!dropoffData.location.trim()) {
      newErrors.dropoff.location = 'Dropoff location is required';
      isValid = false;
    }
    if (!dropoffData.address.trim()) {
      newErrors.dropoff.address = 'Dropoff address is required';
      isValid = false;
    }
    if (!dropoffData.time.trim()) {
      newErrors.dropoff.time = 'Dropoff time is required';
      isValid = false;
    }

    setErrors(newErrors);
    
    // If pickup is complete but dropoff has errors, switch to dropoff section
    if (isValid === false && 
        !newErrors.pickup.location && 
        !newErrors.pickup.address && 
        !newErrors.pickup.time &&
        (newErrors.dropoff.location || newErrors.dropoff.address || newErrors.dropoff.time)) {
      setActiveSection('dropoff');
    }
    
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext({
        pickup: {
          ...pickupData,
          date: startDate
        },
        dropoff: {
          ...dropoffData,
          date: dropoffDate
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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pickup & Drop-off Details</h2>
        <p className="text-gray-600 mb-8">Provide your transportation details for the trek</p>

        {/* Navigation Tabs */}
        <div className="flex mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveSection('pickup')}
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeSection === 'pickup' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Car className="h-4 w-4 mr-2" />
            Pickup Details
          </button>
          <button
            onClick={() => setActiveSection('dropoff')}
            className={`px-4 py-2 font-medium text-sm flex items-center ${activeSection === 'dropoff' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Car className="h-4 w-4 mr-2" />
            Drop-off Details
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeSection === 'pickup' ? (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  Pickup Location*
                </label>
                <input
                  type="text"
                  value={pickupData.location}
                  onChange={(e) => handleInputChange('pickup', 'location', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.pickup.location ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="City or town name"
                />
                {errors.pickup.location && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.pickup.location}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  Pickup Address*
                </label>
                <input
                  type="text"
                  value={pickupData.address}
                  onChange={(e) => handleInputChange('pickup', 'address', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.pickup.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Hotel, landmark, or exact address"
                />
                {errors.pickup.address && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.pickup.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-green-600" />
                    Pickup Date
                  </label>
                  <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-800">{formatDate(startDate)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-green-600" />
                    Pickup Time*
                  </label>
                  <input
                    type="time"
                    value={pickupData.time}
                    onChange={(e) => handleInputChange('pickup', 'time', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.pickup.time ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.pickup.time && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.pickup.time}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  Drop-off Location*
                </label>
                <input
                  type="text"
                  value={dropoffData.location}
                  onChange={(e) => handleInputChange('dropoff', 'location', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.dropoff.location ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="City or town name"
                />
                {errors.dropoff.location && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.dropoff.location}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-600" />
                  Drop-off Address*
                </label>
                <input
                  type="text"
                  value={dropoffData.address}
                  onChange={(e) => handleInputChange('dropoff', 'address', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.dropoff.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Hotel, landmark, or exact address"
                />
                {errors.dropoff.address && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠</span> {errors.dropoff.address}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-1 items-center">
                    <Calendar className="h-4 w-4 mr-2 text-green-600" />
                    Drop-off Date
                  </label>
                  <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-800">{formatDate(dropoffDate)}</p>
                  </div>
                </div>

                <div>
                  <label className="flex text-sm font-medium text-gray-700 mb-1 items-center">
                    <Clock className="h-4 w-4 mr-2 text-green-600" />
                    Drop-off Time*
                  </label>
                  <input
                    type="time"
                    value={dropoffData.time}
                    onChange={(e) => handleInputChange('dropoff', 'time', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.dropoff.time ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.dropoff.time && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span> {errors.dropoff.time}
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

export default PickupDropoff;