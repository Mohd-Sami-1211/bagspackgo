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
  AlertCircle,
  FileText,
  Heart,
  User,
  PartyPopper
} from 'lucide-react';
import dataJson from 'src/data/data.json';

// Use the same destination list used throughout the app
const destinations = dataJson.destinations.map((d, i) => ({
  id: i + 1,
  name: d.label,
  value: d.value
}));

// Agenda options
const agendaOptions = [
  { value: 'arrival', label: 'Arrival & Check-in' },
  { value: 'city-tour', label: 'City Tour' },
  { value: 'travel-day', label: 'Travel Day' },
  { value: 'adventure', label: 'Adventure Activities' },
  { value: 'cultural', label: 'Cultural Experience' },
  { value: 'leisure', label: 'Leisure Day' },
  { value: 'departure', label: 'Departure' },
];

const NewPackage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('package-info');
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [currentDayEditing, setCurrentDayEditing] = useState(null);
  const [daysCount, setDaysCount] = useState(3);
  const [validationErrors, setValidationErrors] = useState({});

  // Package Info State
  const [packageInfo, setPackageInfo] = useState({
    name: '',
    packageType: 'individual', // 'individual' or 'couple'
    packageCategory: 'budget', // 'budget' or 'premium'
    destination: '',
    days: 3,
  });

  // Pricing Tiers State
  const [pricingTiers, setPricingTiers] = useState([
    { id: 1, minPeople: 1, maxPeople: 2, price: '', discount: '' }
  ]);

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
    { id: 1, name: '', details: '' },
  ]);

  // Terms and Conditions State
  const [termsAndConditions, setTermsAndConditions] = useState([
    { id: 1, text: '' },
  ]);

  // Itinerary State
  const [itinerary, setItinerary] = useState(
    Array.from({ length: 3 }, (_, i) => ({
      day: i + 1,
      location: '',
      agenda: '',
      travelFrom: '',
      travelTo: '',
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
    { id: 'terms', name: 'Terms & Conditions', icon: <FileText size={18} /> },
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
          travelFrom: '',
          travelTo: '',
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

  // Auto-switch to tab with validation errors
  useEffect(() => {
    // When validation errors change and we're not on the correct tab,
    // automatically switch to the tab with the first error
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.keys(validationErrors)[0];
      let targetTab = activeTab;

      if (firstError.startsWith('packageName') || firstError.startsWith('price') || firstError.startsWith('destination')) {
        targetTab = 'package-info';
      } else if (firstError.startsWith('inclusive_')) {
        targetTab = 'inclusives';
      } else if (firstError.startsWith('day_')) {
        targetTab = 'itinerary';
      }

      if (targetTab !== activeTab) {
        setActiveTab(targetTab);

        // Scroll to error after tab switch
        setTimeout(() => {
          const element = document.querySelector(`[data-error="${firstError}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add highlight effect to the error field
            element.classList.add('ring-2', 'ring-red-500');
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-red-500');
            }, 2000);
          }
        }, 300);
      }
    }
  }, [validationErrors, activeTab]);

  // Validate form before submission - RETURNS errors object directly
  const validateForm = () => {
    const errors = {};

    // Package Info Validation
    if (!packageInfo.name.trim()) errors.packageName = 'Package name is required';
    if (!packageInfo.destination) errors.destination = 'Destination is required';

    // Pricing Validation
    const hasValidTier = pricingTiers.some(tier => tier.price && parseInt(tier.price) > 0);
    if (!hasValidTier) {
      errors.price = 'At least one pricing tier with a valid price is required';
    }

    // Validate inclusive titles if included
    Object.entries(inclusives).forEach(([key, value]) => {
      if (value.included && !value.title.trim()) {
        errors[`inclusive_${key}`] = `Title is required for ${key}`;
      }
    });

    // NOTE: Itinerary validation is optional — providers can fill it partially
    // Only validate day items that are marked as completed
    itinerary.forEach((day, index) => {
      if (day.isCompleted) {
        if (!day.location.trim()) {
          errors[`day_${index}_location`] = `Day ${index + 1} location is required`;
        }
        if (!day.agenda.trim()) {
          errors[`day_${index}_agenda`] = `Day ${index + 1} agenda is required`;
        }
        if (day.agenda === 'travel-day' && (!day.travelFrom.trim() || !day.travelTo.trim())) {
          errors[`day_${index}_travel`] = `Travel from and to locations are required for travel day`;
        }
      }
    });

    setValidationErrors(errors);
    return errors; // Return errors directly, not relying on state
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      const errorCount = Object.keys(errors).length;
      alert(`Please fill in all required fields. There are ${errorCount} error(s) to fix.`);

      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[data-error="${firstError}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-red-500');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-red-500');
        }, 2000);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        packageInfo: {
          ...packageInfo,
          days: parseInt(packageInfo.days) || 1, // Ensure days is a Number
        },
        pricingTiers: pricingTiers
          .filter(t => t.price && parseInt(t.price) > 0)
          .map(t => ({
            minPeople: parseInt(t.minPeople) || 1,
            maxPeople: parseInt(t.maxPeople) || 2,
            price: parseFloat(t.price),
            discount: parseFloat(t.discount) || 0,
          })),
        inclusives,
        activities: activities.filter(a => a.name.trim() && a.details.trim()),
        itinerary: itinerary.filter(day => day.location?.trim() || day.agenda?.trim()), // Only save filled-in days
        termsAndConditions: termsAndConditions.filter(t => t.text.trim()),
      };

      console.log('Submitting package:', formData);

      const res = await fetch('/api/provider/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to create package');
      }

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/serviceprovider/dashboard/settings/packages');
      }, 2500);
    } catch (error) {
      console.error('Error creating package:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pricing Tier Handlers
  const handleAddPricingTier = () => {
    const newId = pricingTiers.length > 0 ? Math.max(...pricingTiers.map(t => t.id)) + 1 : 1;
    let nextMin = 1;
    let nextMax = 2;
    if (pricingTiers.length > 0) {
      const lastTier = pricingTiers[pricingTiers.length - 1];
      nextMin = parseInt(lastTier.maxPeople) + 1 || 1;
      nextMax = nextMin + 2;
    }
    setPricingTiers([...pricingTiers, { id: newId, minPeople: nextMin, maxPeople: nextMax, price: '', discount: '' }]);
  };

  const handleRemovePricingTier = (id) => {
    if (pricingTiers.length > 1) {
      setPricingTiers(pricingTiers.filter(term => term.id !== id));
    }
  };

  const handlePricingTierChange = (id, field, value) => {
    setPricingTiers(pricingTiers.map(tier =>
      tier.id === id
        ? { ...tier, [field]: value }
        : tier
    ));
    if (field === 'price' && validationErrors.price) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.price;
        return newErrors;
      });
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

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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

    // Clear validation error for this service
    if (validationErrors[`inclusive_${service}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`inclusive_${service}`];
        return newErrors;
      });
    }
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

    // Clear validation error for this service
    if (validationErrors[`inclusive_${service}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`inclusive_${service}`];
        return newErrors;
      });
    }
  };

  // Activities Handlers
  const handleAddActivity = () => {
    const newId = activities.length > 0 ? Math.max(...activities.map(a => a.id)) + 1 : 1;
    setActivities([...activities, { id: newId, name: '', details: '' }]);
  };

  const handleRemoveActivity = (id) => {
    if (activities.length > 1) {
      setActivities(activities.filter(activity => activity.id !== id));
    }
  };

  const handleActivityChange = (id, field, value) => {
    setActivities(activities.map(activity =>
      activity.id === id
        ? { ...activity, [field]: field === 'details' ? value.slice(0, 150) : value }
        : activity
    ));
  };

  // Terms and Conditions Handlers
  const handleAddTerm = () => {
    const newId = termsAndConditions.length > 0 ? Math.max(...termsAndConditions.map(t => t.id)) + 1 : 1;
    setTermsAndConditions([...termsAndConditions, { id: newId, text: '' }]);
  };

  const handleRemoveTerm = (id) => {
    if (termsAndConditions.length > 1) {
      setTermsAndConditions(termsAndConditions.filter(term => term.id !== id));
    }
  };

  const handleTermChange = (id, value) => {
    setTermsAndConditions(termsAndConditions.map(term =>
      term.id === id
        ? { ...term, text: value.slice(0, 200) }
        : term
    ));
  };

  // Itinerary Handlers
  const handleDayEdit = (dayIndex) => {
    setCurrentDayEditing(dayIndex);
  };

  const handleDaySave = (dayIndex, data) => {
    // Validate day data
    if (!data.location.trim() || !data.agenda.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        [`day_${dayIndex}_location`]: !data.location.trim() ? 'Location is required' : undefined,
        [`day_${dayIndex}_agenda`]: !data.agenda.trim() ? 'Agenda is required' : undefined,
        [`day_${dayIndex}_travel`]: data.agenda === 'travel-day' && (!data.travelFrom.trim() || !data.travelTo.trim())
          ? 'Travel from and to locations are required'
          : undefined,
      }));
      return;
    }

    if (data.agenda === 'travel-day' && (!data.travelFrom.trim() || !data.travelTo.trim())) {
      setValidationErrors(prev => ({
        ...prev,
        [`day_${dayIndex}_travel`]: 'Travel from and to locations are required for travel day',
      }));
      return;
    }

    const updatedItinerary = [...itinerary];
    updatedItinerary[dayIndex] = {
      ...data,
      isCompleted: true,
    };
    setItinerary(updatedItinerary);

    // Clear validation errors for this day
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`day_${dayIndex}_location`];
      delete newErrors[`day_${dayIndex}_agenda`];
      delete newErrors[`day_${dayIndex}_travel`];
      return newErrors;
    });

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

      // Clear validation error for this field
      if (validationErrors[`day_${dayIndex}_${field}`] || validationErrors[`day_${dayIndex}_travel`]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[`day_${dayIndex}_${field}`];
          delete newErrors[`day_${dayIndex}_travel`];
          return newErrors;
        });
      }
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

  // Get pricing label based on package type
  const getPricingUnitLabel = () => {
    return packageInfo.packageType === 'individual' ? 'People' : 'Couples';
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'package-info':
        return (
          <div className="space-y-6">
            <div data-error="packageName">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Package Name *
              </label>
              <input
                type="text"
                value={packageInfo.name}
                onChange={(e) => handlePackageInfoChange('name', e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${validationErrors.packageName ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                placeholder="Eg: Premium Himalayan Trek Adventure"
                required
              />
              {validationErrors.packageName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.packageName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Package Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handlePackageInfoChange('packageType', 'individual')}
                  className={`p-4 rounded-xl border-2 transition-all ${packageInfo.packageType === 'individual' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <User size={20} className={packageInfo.packageType === 'individual' ? 'text-emerald-600' : 'text-gray-500'} />
                    </div>
                    <div className={`text-lg font-semibold ${packageInfo.packageType === 'individual' ? 'text-emerald-700' : 'text-gray-700'}`}>
                      Individual
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handlePackageInfoChange('packageType', 'couple')}
                  className={`p-4 rounded-xl border-2 transition-all ${packageInfo.packageType === 'couple' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Heart size={20} className={packageInfo.packageType === 'couple' ? 'text-emerald-600' : 'text-gray-500'} />
                    </div>
                    <div className={`text-lg font-semibold ${packageInfo.packageType === 'couple' ? 'text-emerald-700' : 'text-gray-700'}`}>
                      Couple
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Package Category *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handlePackageInfoChange('packageCategory', 'budget')}
                  className={`p-4 rounded-xl border-2 transition-all ${packageInfo.packageCategory === 'budget' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${packageInfo.packageCategory === 'budget' ? 'text-emerald-700' : 'text-gray-700'}`}>
                      Budget
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handlePackageInfoChange('packageCategory', 'premium')}
                  className={`p-4 rounded-xl border-2 transition-all ${packageInfo.packageCategory === 'premium' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${packageInfo.packageCategory === 'premium' ? 'text-emerald-700' : 'text-gray-700'}`}>
                      Premium
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div data-error="destination">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Destination *
                </label>
                <select
                  value={packageInfo.destination}
                  onChange={(e) => handlePackageInfoChange('destination', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${validationErrors.destination ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                  required
                >
                  <option value="">Select a destination</option>
                  {destinations.map((dest) => (
                    <option key={dest.id} value={dest.name}>
                      {dest.name}
                    </option>
                  ))}
                </select>
                {validationErrors.destination && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.destination}</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm" data-error="price">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Pricing Tiers *</h3>
                  <p className="text-sm text-gray-500">Set different prices based on the number of {getPricingUnitLabel()}</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPricingTier}
                  className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={16} /> Add Range
                </button>
              </div>

              {validationErrors.price && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  {validationErrors.price}
                </div>
              )}

              <div className="space-y-3">
                {/* Header built with grid to align with table rows */}
                <div className="grid grid-cols-12 gap-4 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hidden md:grid">
                  <div className="col-span-4">Number of {getPricingUnitLabel()}</div>
                  <div className="col-span-4">Price per Range (₹)</div>
                  <div className="col-span-3">Discount (%) (Optional)</div>
                  <div className="col-span-1 border-gray-100 text-right"></div>
                </div>

                <AnimatePresence>
                  {pricingTiers.map((tier, index) => (
                    <motion.div
                      key={tier.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50 p-3 md:p-2 rounded-xl border border-gray-200 relative"
                    >
                      <div className="md:col-span-4 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 min-w-8 text-center bg-white border border-gray-200 px-2 py-1 rounded">
                          {tier.minPeople}
                        </span>
                        <span className="text-gray-400">to</span>
                        <input
                          type="number"
                          value={tier.maxPeople}
                          onChange={(e) => handlePricingTierChange(tier.id, 'maxPeople', e.target.value)}
                          className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-center focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                          min={tier.minPeople}
                          placeholder="Max"
                        />
                        <span className="text-sm text-gray-500 hidden md:inline">{getPricingUnitLabel().toLowerCase()}</span>
                      </div>

                      <div className="md:col-span-4 relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => handlePricingTierChange(tier.id, 'price', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                          placeholder="Price"
                          min="0"
                        />
                      </div>

                      <div className="md:col-span-3 relative">
                        <input
                          type="number"
                          value={tier.discount}
                          onChange={(e) => handlePricingTierChange(tier.id, 'discount', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg pr-7 pl-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                          placeholder="Discount"
                          min="0"
                          max="100"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                      </div>

                      <div className="md:col-span-1 flex justify-end absolute md:relative top-2 right-2 md:top-auto md:right-auto">
                        {pricingTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePricingTier(tier.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
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
                  data-error={`inclusive_${service}`}
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
                              className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 rounded checked:bg-emerald-600 checked:border-emerald-600"
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
                          Section Title *
                        </label>
                        <input
                          type="text"
                          value={data.title}
                          onChange={(e) => handleInclusiveTitleChange(service, e.target.value)}
                          className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${validationErrors[`inclusive_${service}`] ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                          placeholder={`Eg: Luxury ${labels[service]}`}
                          required
                        />
                        {validationErrors[`inclusive_${service}`] && (
                          <p className="mt-1 text-sm text-red-600">{validationErrors[`inclusive_${service}`]}</p>
                        )}
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
              <h3 className="text-lg font-semibold text-gray-800">Package Activities (Optional)</h3>
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
                    {activities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(activity.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
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
                <div data-error={`day_${currentDayEditing}_location`}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={dayData.location}
                    onChange={(e) => handleDayChange(currentDayEditing, 'location', e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${validationErrors[`day_${currentDayEditing}_location`] ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                    placeholder="City, Region"
                    required
                  />
                  {validationErrors[`day_${currentDayEditing}_location`] && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors[`day_${currentDayEditing}_location`]}</p>
                  )}
                </div>

                <div data-error={`day_${currentDayEditing}_agenda`}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Agenda Type *
                  </label>
                  <select
                    value={dayData.agenda}
                    onChange={(e) => handleDayChange(currentDayEditing, 'agenda', e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${validationErrors[`day_${currentDayEditing}_agenda`] ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                    required
                  >
                    <option value="">Select Agenda</option>
                    {agendaOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {validationErrors[`day_${currentDayEditing}_agenda`] && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors[`day_${currentDayEditing}_agenda`]}</p>
                  )}
                </div>
              </div>

              {dayData.agenda === 'travel-day' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-emerald-50 border border-emerald-200 rounded-xl p-6"
                  data-error={`day_${currentDayEditing}_travel`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Navigation size={20} className="text-emerald-600" />
                    <h4 className="font-semibold text-emerald-800">Travel Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From *
                      </label>
                      <input
                        type="text"
                        value={dayData.travelFrom}
                        onChange={(e) => handleDayChange(currentDayEditing, 'travelFrom', e.target.value)}
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${validationErrors[`day_${currentDayEditing}_travel`] ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                        placeholder="Starting location"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To *
                      </label>
                      <input
                        type="text"
                        value={dayData.travelTo}
                        onChange={(e) => handleDayChange(currentDayEditing, 'travelTo', e.target.value)}
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${validationErrors[`day_${currentDayEditing}_travel`] ? 'border-red-500 ring-2 ring-red-500' : 'border-gray-300'}`}
                        placeholder="Destination"
                        required
                      />
                    </div>
                  </div>
                  {validationErrors[`day_${currentDayEditing}_travel`] && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors[`day_${currentDayEditing}_travel`]}</p>
                  )}
                </motion.div>
              )}

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
                          {day.agenda ? agendaOptions.find(a => a.value === day.agenda)?.label || day.agenda : 'Unplanned Day'}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {day.location || 'Location not set'} • {day.hotelName || 'Accommodation not set'}
                        </p>
                        {day.agenda === 'travel-day' && day.travelFrom && day.travelTo && (
                          <p className="text-sm text-emerald-600 mt-1">
                            Travel: {day.travelFrom} → {day.travelTo}
                          </p>
                        )}
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
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <p className="text-sm text-emerald-700">
                        <strong>Note:</strong> Day 1 should include arrival details and initial activities.
                      </p>
                    </div>
                  )}

                  {validationErrors[`day_${index}_location`] && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-sm text-red-600">Location is required for Day {day.day}</p>
                    </div>
                  )}

                  {validationErrors[`day_${index}_agenda`] && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-sm text-red-600">Agenda is required for Day {day.day}</p>
                    </div>
                  )}

                  {validationErrors[`day_${index}_travel`] && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-sm text-red-600">Travel details are required for Day {day.day}</p>
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

      case 'terms':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-800">Terms & Conditions (Optional)</h3>
              <p className="text-gray-600 mt-1">Define the terms and conditions for your package (max 200 characters each)</p>
            </div>

            <div className="space-y-4">
              {termsAndConditions.map((term, index) => (
                <motion.div
                  key={term.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 rounded-xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <textarea
                          value={term.text}
                          onChange={(e) => handleTermChange(term.id, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-16 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                          rows="3"
                          placeholder={`Term ${index + 1} (e.g., Cancellation policy, Refund terms, etc.)`}
                          maxLength={200}
                        />
                        <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                          {term.text.length}/200
                        </div>
                      </div>
                    </div>
                    {termsAndConditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTerm(term.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddTerm}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} className="text-emerald-600" />
              <span className="font-medium text-emerald-600">Add New Term</span>
            </button>

            <div className="bg-gray-50 p-4 rounded-xl mt-6">
              <h4 className="font-semibold text-gray-800 mb-2">Important Guidelines:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Clearly state cancellation and refund policies</li>
                <li>• Mention any age restrictions or requirements</li>
                <li>• Specify what's not included in the package</li>
                <li>• Include health and safety guidelines</li>
                <li>• Mention force majeure conditions</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Fixed Header */}
      <div className="bg-white border-b top-0 z-50 shadow-sm">
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

      <div className="p-6 pt-8">
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

              {activeTab === 'terms' && (
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

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center max-w-sm w-full mx-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5"
              >
                <Check size={40} className="text-emerald-600" strokeWidth={3} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Package Published! 🎉</h2>
                <p className="text-gray-500 text-sm">Your package is now live and visible to users on the platform.</p>
                <div className="mt-4 flex gap-1 justify-center">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ delay: 0.6 + i * 0.15, repeat: Infinity, duration: 0.6 }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewPackage;