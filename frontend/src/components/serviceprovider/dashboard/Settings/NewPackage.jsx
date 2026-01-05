'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Hotel,
  Utensils,
  Car,
  Users,
  Navigation,
  Check,
  Edit2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

// Mock destinations - in real app, this would come from data.json
const destinations = [
  { id: 1, name: 'Goa', country: 'India' },
  { id: 2, name: 'Manali', country: 'India' },
  { id: 3, name: 'Kerala', country: 'India' },
  { id: 4, name: 'Rajasthan', country: 'India' },
  { id: 5, name: 'Ladakh', country: 'India' },
  { id: 6, name: 'Sikkim', country: 'India' },
  { id: 7, name: 'Andaman', country: 'India' },
  { id: 8, name: 'Mumbai', country: 'India' },
  { id: 9, name: 'Delhi', country: 'India' },
  { id: 10, name: 'Chennai', country: 'India' },
];

const NewPackage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('package-info');
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [currentDayEditing, setCurrentDayEditing] = useState(null);
  const [daysCount, setDaysCount] = useState(3);
  
  // Package Info State
  const [packageInfo, setPackageInfo] = useState({
    name: '',
    type: 'budget',
    pricePerPerson: '',
    discountEnabled: false,
    discountPercentage: '',
    discountMinPeople: '',
    destination: '',
    days: 3,
  });

  // Inclusives State
  const [inclusives, setInclusives] = useState({
    food: { included: false, title: '', details: ['', '', ''] },
    transport: { included: false, title: '', details: ['', '', ''] },
    accommodation: { included: false, title: '', details: ['', '', ''] },
    guidance: { included: false, title: '', details: ['', '', ''] },
    pickupDropoff: { included: false, title: '', details: ['', '', ''] },
  });

  // Activities State
  const [activities, setActivities] = useState([
    { id: 1, name: 'Mountain Trekking', details: 'Guided trek through scenic mountain trails' },
    { id: 2, name: 'Local Culture Experience', details: 'Visit to traditional villages and cultural sites' },
    { id: 3, name: 'Adventure Sports', details: 'Optional adventure activities available' },
  ]);

  // Itinerary State
  const [itinerary, setItinerary] = useState(
    Array.from({ length: 3 }, (_, i) => ({
      day: i + 1,
      location: '',
      agenda: '',
      pickupTime: '',
      hotelName: '',
      activities: [],
      highlights: ['', '', ''],
      isCompleted: false,
    }))
  );

  // Tab configurations
  const tabs = [
    { id: 'package-info', name: 'Package Info', icon: <Calendar size={18} /> },
    { id: 'inclusives', name: 'Inclusives', icon: <Check size={18} /> },
    { id: 'activities', name: 'Activities', icon: <Navigation size={18} /> },
    { id: 'itinerary', name: 'Itinerary', icon: <MapPin size={18} /> },
  ];

  // Handle back navigation with unsaved changes warning
  const handleBack = () => {
    router.back();
  };

  // Update itinerary when days count changes
  useEffect(() => {
    if (daysCount !== itinerary.length) {
      if (daysCount > itinerary.length) {
        // Add more days
        const newDays = Array.from({ length: daysCount - itinerary.length }, (_, i) => ({
          day: itinerary.length + i + 1,
          location: '',
          agenda: '',
          pickupTime: '',
          hotelName: '',
          activities: [],
          highlights: ['', '', ''],
          isCompleted: false,
        }));
        setItinerary([...itinerary, ...newDays]);
      } else {
        // Remove extra days (keeping only first n days)
        setItinerary(itinerary.slice(0, daysCount));
      }
    }
  }, [daysCount, itinerary.length]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = {
        packageInfo,
        inclusives,
        activities,
        itinerary,
      };
      
      console.log('Form data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      router.push('/serviceprovider/dashboard/settings/packages');
    } catch (error) {
      console.error('Error creating package:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Package Info Handlers
  const handlePackageInfoChange = (field, value) => {
    setPackageInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'days') {
      setDaysCount(parseInt(value) || 1);
    }
  };

  // Inclusives Handlers
  const handleInclusiveToggle = (service) => {
    setInclusives(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        included: !prev[service].included
      }
    }));
  };

  const handleInclusiveDetailChange = (service, index, value) => {
    const newDetails = [...inclusives[service].details];
    newDetails[index] = value.slice(0, 100); // Word limit
    
    setInclusives(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        details: newDetails
      }
    }));
  };

  const handleInclusiveTitleChange = (service, value) => {
    setInclusives(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        title: value
      }
    }));
  };

  // Activities Handlers
  const handleAddActivity = () => {
    const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
    setActivities([...activities, { id: newId, name: '', details: '' }]);
  };

  const handleRemoveActivity = (id) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const handleActivityChange = (id, field, value) => {
    setActivities(activities.map(activity => 
      activity.id === id 
        ? { ...activity, [field]: field === 'details' ? value.slice(0, 150) : value }
        : activity
    ));
  };

  // Itinerary Handlers
  const handleDayEdit = (dayIndex) => {
    setCurrentDayEditing(dayIndex);
  };

  const handleDaySave = (dayIndex, data) => {
    const updatedItinerary = [...itinerary];
    updatedItinerary[dayIndex] = {
      ...data,
      isCompleted: true,
    };
    setItinerary(updatedItinerary);
    setCurrentDayEditing(null);
  };

  const handleDayChange = (dayIndex, field, value) => {
    if (currentDayEditing === dayIndex) {
      const updatedItinerary = [...itinerary];
      updatedItinerary[dayIndex] = {
        ...updatedItinerary[dayIndex],
        [field]: value
      };
      setItinerary(updatedItinerary);
    }
  };

  const handleHighlightChange = (dayIndex, highlightIndex, value) => {
    if (currentDayEditing === dayIndex) {
      const updatedItinerary = [...itinerary];
      const newHighlights = [...updatedItinerary[dayIndex].highlights];
      newHighlights[highlightIndex] = value.slice(0, 100); // Word limit
      updatedItinerary[dayIndex].highlights = newHighlights;
      setItinerary(updatedItinerary);
    }
  };

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    if (!packageInfo.discountEnabled || !packageInfo.pricePerPerson || !packageInfo.discountPercentage) {
      return packageInfo.pricePerPerson;
    }
    const price = parseFloat(packageInfo.pricePerPerson);
    const discount = parseFloat(packageInfo.discountPercentage);
    return (price - (price * discount / 100)).toFixed(2);
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'package-info':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Package Name *
              </label>
              <input
                type="text"
                value={packageInfo.name}
                onChange={(e) => handlePackageInfoChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Eg: Premium Himalayan Trek Adventure"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Package Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handlePackageInfoChange('type', 'budget')}
                  className={`p-4 rounded-xl border-2 transition-all ${packageInfo.type === 'budget' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${packageInfo.type === 'budget' ? 'text-emerald-700' : 'text-gray-700'}`}>
                      Budget
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Affordable packages</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handlePackageInfoChange('type', 'premium')}
                  className={`p-4 rounded-xl border-2 transition-all ${packageInfo.type === 'premium' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${packageInfo.type === 'premium' ? 'text-emerald-700' : 'text-gray-700'}`}>
                      Premium
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Luxury experiences</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Price per Person (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={packageInfo.pricePerPerson}
                    onChange={(e) => handlePackageInfoChange('pricePerPerson', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Number of Days *
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handlePackageInfoChange('days', Math.max(1, packageInfo.days - 1))}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <span className="text-xl">−</span>
                  </button>
                  <input
                    type="number"
                    value={packageInfo.days}
                    onChange={(e) => handlePackageInfoChange('days', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={() => handlePackageInfoChange('days', packageInfo.days + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <span className="text-xl">+</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={packageInfo.discountEnabled}
                  onChange={(e) => handlePackageInfoChange('discountEnabled', e.target.checked)}
                  className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 rounded"
                />
                <span className="text-sm font-semibold text-gray-800">Apply Group Discount</span>
              </label>
              
              {packageInfo.discountEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Percentage (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={packageInfo.discountPercentage}
                          onChange={(e) => handlePackageInfoChange('discountPercentage', e.target.value)}
                          className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          placeholder="10"
                          min="0"
                          max="100"
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum People Required
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handlePackageInfoChange('discountMinPeople', Math.max(1, parseInt(packageInfo.discountMinPeople || 2) - 1))}
                          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          <span className="text-xl">−</span>
                        </button>
                        <input
                          type="number"
                          value={packageInfo.discountMinPeople}
                          onChange={(e) => handlePackageInfoChange('discountMinPeople', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                          min="1"
                          placeholder="2"
                        />
                        <button
                          type="button"
                          onClick={() => handlePackageInfoChange('discountMinPeople', parseInt(packageInfo.discountMinPeople || 1) + 1)}
                          className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          <span className="text-xl">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {packageInfo.pricePerPerson && packageInfo.discountPercentage && (
                    <div className="bg-white p-4 rounded-lg border border-emerald-100">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Original Price:</span>
                        <span className="text-lg font-semibold">₹{packageInfo.pricePerPerson}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-600">Discounted Price:</span>
                        <span className="text-xl font-bold text-emerald-600">₹{calculateDiscountedPrice()}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        Applied when {packageInfo.discountMinPeople || 2} or more people book together
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Destination *
              </label>
              <select
                value={packageInfo.destination}
                onChange={(e) => handlePackageInfoChange('destination', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              >
                <option value="">Select a destination</option>
                {destinations.map((dest) => (
                  <option key={dest.id} value={dest.name}>
                    {dest.name}, {dest.country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'inclusives':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-800">Tick the services to be included</h3>
              <p className="text-gray-600 mt-1">Select and customize what's included in your package</p>
            </div>

            {Object.entries(inclusives).map(([service, data], index) => {
              const icons = {
                food: <Utensils size={20} />,
                transport: <Car size={20} />,
                accommodation: <Hotel size={20} />,
                guidance: <Users size={20} />,
                pickupDropoff: <Navigation size={20} />,
              };
              
              const labels = {
                food: 'Food & Dining',
                transport: 'Transport',
                accommodation: 'Accommodation',
                guidance: 'Guidance',
                pickupDropoff: 'Pickup & Drop Off',
              };

              return (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border rounded-xl overflow-hidden"
                >
                  <div className={`p-4 flex items-center justify-between ${data.included ? 'bg-emerald-50 border-emerald-200' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${data.included ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        {icons[service]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={data.included}
                              onChange={() => handleInclusiveToggle(service)}
                              className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 rounded"
                            />
                            <span className="font-semibold text-gray-800">{labels[service]}</span>
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {data.included ? 'Included in package' : 'Not included'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${data.included ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  </div>

                  {data.included && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-6 border-t border-gray-100"
                    >
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={data.title}
                          onChange={(e) => handleInclusiveTitleChange(service, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                          placeholder={`Eg: Luxury ${labels[service]}`}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Details (max 100 characters each)
                        </label>
                        {data.details.map((detail, idx) => (
                          <div key={idx} className="relative">
                            <textarea
                              value={detail}
                              onChange={(e) => handleInclusiveDetailChange(service, idx, e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-16 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                              rows="2"
                              placeholder={`Detail ${idx + 1}`}
                              maxLength={100}
                            />
                            <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                              {detail.length}/100
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        );

      case 'activities':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-800">Package Activities</h3>
              <p className="text-gray-600 mt-1">Define the activities included in your package</p>
            </div>

            <div className="space-y-4">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white border border-gray-200 rounded-xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Activity Name
                        </label>
                        <input
                          type="text"
                          value={activity.name}
                          onChange={(e) => handleActivityChange(activity.id, 'name', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                          placeholder="Enter activity name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Activity Details (max 150 characters)
                        </label>
                        <div className="relative">
                          <textarea
                            value={activity.details}
                            onChange={(e) => handleActivityChange(activity.id, 'details', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-16 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                            rows="3"
                            placeholder="Describe the activity in detail"
                            maxLength={150}
                          />
                          <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                            {activity.details.length}/150
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveActivity(activity.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddActivity}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} className="text-emerald-600" />
              <span className="font-medium text-emerald-600">Add New Activity</span>
            </button>
          </div>
        );

      case 'itinerary':
        if (currentDayEditing !== null) {
          const dayData = itinerary[currentDayEditing];
          
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => setShowUnsavedAlert(true)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Days</span>
                </button>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">Day {dayData.day} Details</h3>
                  <p className="text-gray-600">Plan for Day {dayData.day}</p>
                </div>
                <div className="w-20"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={dayData.location}
                    onChange={(e) => handleDayChange(currentDayEditing, 'location', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="City, Region"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Agenda Type *
                  </label>
                  <select
                    value={dayData.agenda}
                    onChange={(e) => handleDayChange(currentDayEditing, 'agenda', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="">Select Agenda</option>
                    <option value="arrival">Arrival & Check-in</option>
                    <option value="city-tour">City Tour</option>
                    <option value="travel-day">Travel Day</option>
                    <option value="adventure">Adventure Activities</option>
                    <option value="cultural">Cultural Experience</option>
                    <option value="leisure">Leisure Day</option>
                    <option value="departure">Departure</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Pick-up Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={dayData.pickupTime}
                      onChange={(e) => handleDayChange(currentDayEditing, 'pickupTime', e.target.value)}
                      className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder="Eg: 9:00 AM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Hotel Name
                  </label>
                  <div className="relative">
                    <Hotel className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={dayData.hotelName}
                      onChange={(e) => handleDayChange(currentDayEditing, 'hotelName', e.target.value)}
                      className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder="Hotel accommodation for the day"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Day Highlights (max 100 characters each)
                </label>
                <div className="space-y-3">
                  {dayData.highlights.map((highlight, index) => (
                    <div key={index} className="relative">
                      <textarea
                        value={highlight}
                        onChange={(e) => handleHighlightChange(currentDayEditing, index, e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-16 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                        rows="2"
                        placeholder={`Highlight ${index + 1}`}
                        maxLength={100}
                      />
                      <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                        {highlight.length}/100
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => handleDaySave(currentDayEditing, dayData)}
                  className="w-full bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition font-semibold"
                >
                  Save Day {dayData.day} Details
                </button>
              </div>
            </motion.div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-800">{packageInfo.days}-Day Itinerary</h3>
              <p className="text-gray-600 mt-1">Plan each day of the package itinerary</p>
            </div>

            <div className="space-y-4">
              {itinerary.map((day, index) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-emerald-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${day.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        <span className="font-bold text-lg">Day {day.day}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {day.agenda ? day.agenda.charAt(0).toUpperCase() + day.agenda.slice(1) : 'Unplanned Day'}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {day.location || 'Location not set'} • {day.hotelName || 'Accommodation not set'}
                        </p>
                        {day.highlights.some(h => h) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {day.highlights.filter(h => h).map((highlight, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {highlight.substring(0, 20)}...
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleDayEdit(index)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${day.isCompleted ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {day.isCompleted ? (
                        <span className="flex items-center gap-2">
                          <Edit2 size={16} />
                          Edit
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Plus size={16} />
                          Create
                        </span>
                      )}
                    </button>
                  </div>
                  
                  {index === 0 && !day.isCompleted && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Day 1 should include arrival details and initial activities.
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-600 text-center">
                Click "Create" to plan each day's itinerary. Day 1 should focus on arrival and orientation.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Package</h1>
                <p className="text-gray-600 mt-1">Design your perfect travel package</p>
              </div>
            </div>
            <button
              type="submit"
              form="packageForm"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating Package...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save & Publish Package
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form id="packageForm" onSubmit={handleSubmit} className="max-w-5xl mx-auto">
          {/* Tabs Navigation */}
          <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 flex items-center justify-center gap-3 font-medium transition-all ${activeTab === tab.id ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  {tab.icon}
                  {tab.name}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {renderTabContent()}
            </div>
          </div>

          {/* Progress and Action Buttons */}
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Step {tabs.findIndex(tab => tab.id === activeTab) + 1} of {tabs.length}
              </div>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${((tabs.findIndex(tab => tab.id === activeTab) + 1) / tabs.length) * 100}%` 
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              {tabs.findIndex(tab => tab.id === activeTab) > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    setActiveTab(tabs[currentIndex - 1].id);
                  }}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Previous
                </button>
              )}
              
              {tabs.findIndex(tab => tab.id === activeTab) < tabs.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    setActiveTab(tabs[currentIndex + 1].id);
                  }}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              )}
              
              {activeTab === 'itinerary' && currentDayEditing === null && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-emerald-500/20"
                >
                  <Save size={20} />
                  Save Package
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Unsaved Changes Alert */}
      <AnimatePresence>
        {showUnsavedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUnsavedAlert(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Unsaved Changes</h3>
                  <p className="text-gray-600">You have unsaved changes for this day.</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                If you go back without saving, all details entered for Day {currentDayEditing + 1} will be lost.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUnsavedAlert(false);
                    setCurrentDayEditing(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition"
                >
                  Discard Changes
                </button>
                <button
                  onClick={() => setShowUnsavedAlert(false)}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition"
                >
                  Continue Editing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewPackage;