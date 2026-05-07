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
  ChevronDown,
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
  PartyPopper,
  Star,
  Award,
  Shield,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import dataJson from 'src/data/data.json';
import { compressImage, fetchWithRetry } from '@/lib/imageCompression';

// Use the same destination list used throughout the app
const destinations = [
  ...dataJson.destinations.filter(d => ['kashmir', 'ladakh', 'bhaderwah', 'warwan-marwah-valley'].includes(d.value)).map((d, i) => ({
    id: i + 1,
    label: d.label,
    value: d.value,
  })),
  { isGroupHeader: true, label: 'Available Soon', value: 'GROUP_HEADER' },
  ...dataJson.destinations.filter(d => !['kashmir', 'ladakh', 'bhaderwah', 'warwan-marwah-valley'].includes(d.value)).map((d, i) => ({
    id: i + 100,
    label: d.label,
    value: d.value,
    isDisabled: true
  }))
];

const agendaOptions = [
  { value: 'arrival', label: 'Arrival & Check-in' },
  { value: 'travel-day', label: 'Travel Day' },
  { value: 'exploration', label: 'Exploration' },
  { value: 'checkout', label: 'Exploration & Checkout' },
];

const CustomSelect = ({ value, onChange, options, placeholder, icon: Icon, iconClassName = 'text-gray-400', disabled = false, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl ${
          Icon ? 'pl-9 pr-4 py-2.5' : 'px-4 py-3'
        } bg-white focus:outline-none transition-all text-left text-sm border
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' : 'cursor-pointer hover:border-emerald-400'}
          ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200'}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${iconClassName}`} size={16} />}
          <span className={`truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-800 font-medium'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-[60] w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto no-scrollbar"
          >
            {options.map((option) => option.isGroupHeader ? (
              <div key={option.value} className="px-4 py-2 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                {option.label}
              </div>
            ) : (
              <button
                key={option.value}
                type="button"
                disabled={option.isDisabled}
                onClick={() => {
                  if (!option.isDisabled) {
                    onChange(option.value);
                    setIsOpen(false);
                  }
                }}
                className={`w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between text-sm
                  ${option.isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                  ${String(value) === String(option.value)
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="truncate pr-2">{option.label}</span>
                </div>
                {String(value) === String(option.value) && <Check size={14} className="text-emerald-600 shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NewPackage = ({ initialData = null, isEdit = false }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [currentDayEditing, setCurrentDayEditing] = useState(null);
  const [daysCount, setDaysCount] = useState(3);
  const [validationErrors, setValidationErrors] = useState({});

  // Package Info State
  const [packageInfo, setPackageInfo] = useState({
    name: '',
    packageType: 'individual', // 'individual' or 'couple'
    packageCategory: 'budget', // 'premium' or 'budget'
    destination: '',
    days: 3,
  });

  // Pricing Tiers State
  const [pricingTiers, setPricingTiers] = useState([
    { id: 1, minPeople: 1, maxPeople: 2, price: '', discount: '' }
  ]);

  const [pickupDropCities, setPickupDropCities] = useState([
    { id: 1, cityName: '', locations: [{ id: 1, name: '', mapLink: '' }] }
  ]);

  // Inclusives & Exclusives State
  const [inclusivesList, setInclusivesList] = useState([{ id: 1, text: '' }]);
  const [exclusivesList, setExclusivesList] = useState([{ id: 1, text: '' }]);
  const [additionalPoints, setAdditionalPoints] = useState([{ id: 1, text: '' }]);

  // Terms and Conditions State
  const [termsAndConditions, setTermsAndConditions] = useState([
    { id: 1, text: '' },
  ]);

  // About Package State
  const [aboutPackage, setAboutPackage] = useState('');
  const [packagePhotos, setPackagePhotos] = useState([]);
  const packagePhotoInputRef = useRef(null);

  // Itinerary State
  const [itinerary, setItinerary] = useState(
    Array.from({ length: 3 }, (_, i) => ({
      day: i + 1,
      location: '',
      agenda: '',
      travelFrom: '',
      travelTo: '',
      isDayTrip: false,
      pickupTime: '',
      checkinTime: '',
      hotelName: '',
      hotelStars: '3',
      hotelPhotos: [],
      destinationPhotos: [],
      activities: [],
      highlights: ['', '', ''],
      isCompleted: false,
    }))
  );

  // Load from local storage on mount
  useEffect(() => {
    if (isEdit && initialData) {
      setPackageInfo({
        name: initialData.name || '',
        packageType: initialData.packageType || 'individual',
        packageCategory: initialData.packageCategory || 'budget',
        destination: initialData.destination || '',
        days: initialData.days || 3,
      });
      if (initialData.pricingTiers?.length > 0) {
        setPricingTiers(initialData.pricingTiers.map((t, i) => ({ id: i + 1, ...t })));
      }
      if (initialData.pickupDropCities?.length > 0) {
        setPickupDropCities(initialData.pickupDropCities.map((c, i) => ({ 
          id: i + 1, 
          cityName: c.cityName,
          locations: (c.locations || []).map((l, j) => ({ id: parseInt(`${i}${j}${Date.now()}`), ...l }))
        })));
      }
      if (initialData.inclusivesList?.length > 0) {
        setInclusivesList(initialData.inclusivesList.map((text, i) => ({ id: i + 1, text })));
      }
      if (initialData.exclusivesList?.length > 0) {
        setExclusivesList(initialData.exclusivesList.map((text, i) => ({ id: i + 1, text })));
      }
      if (initialData.additionalPoints?.length > 0) {
        setAdditionalPoints(initialData.additionalPoints.map((text, i) => ({ id: i + 1, text: typeof text === 'string' ? text : text.text || '' })));
      }
      if (initialData.termsAndConditions?.length > 0) {
        setTermsAndConditions(initialData.termsAndConditions.map((text, i) => ({ id: i + 1, text })));
      }
      if (initialData.itinerary?.length > 0) {
        setItinerary(initialData.itinerary.map(day => ({ ...day, isCompleted: true })));
      }
      if (initialData.days) {
        setDaysCount(initialData.days);
      }
      if (initialData.aboutPackage) setAboutPackage(initialData.aboutPackage);
      if (initialData.packagePhotos?.length > 0) setPackagePhotos(initialData.packagePhotos);
    } else {
      const savedData = localStorage.getItem('newTripPackageDraft');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.packageInfo) setPackageInfo(parsed.packageInfo);
          if (parsed.pricingTiers) setPricingTiers(parsed.pricingTiers);
          if (parsed.pickupDropCities) setPickupDropCities(parsed.pickupDropCities);
          if (parsed.inclusivesList) setInclusivesList(parsed.inclusivesList);
          if (parsed.exclusivesList) setExclusivesList(parsed.exclusivesList);
          if (parsed.additionalPoints) setAdditionalPoints(parsed.additionalPoints);
          if (parsed.termsAndConditions) setTermsAndConditions(parsed.termsAndConditions);
          if (parsed.itinerary) setItinerary(parsed.itinerary);
          if (parsed.daysCount) setDaysCount(parsed.daysCount);
          if (parsed.aboutPackage) setAboutPackage(parsed.aboutPackage);
          if (parsed.packagePhotos) setPackagePhotos(parsed.packagePhotos);
        } catch (e) {
          console.error("Failed to parse saved package data", e);
        }
      }
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (!isEdit) {
      const dataToSave = {
        packageInfo,
        pricingTiers,
        pickupDropCities,
        inclusivesList,
        exclusivesList,
        additionalPoints,
        termsAndConditions,
        itinerary,
        daysCount,
        aboutPackage,
        packagePhotos
      };
      localStorage.setItem('newTripPackageDraft', JSON.stringify(dataToSave));
    }
  }, [packageInfo, pricingTiers, pickupDropCities, inclusivesList, exclusivesList, additionalPoints, termsAndConditions, itinerary, daysCount, aboutPackage, packagePhotos, isEdit]);

  // Tab configurations
  // Check if a section is complete for tab indicators
  const getSectionComplete = (tabId) => {
    switch (tabId) {
      case 'about':
        return !!(aboutPackage.trim());
      case 'package-info':
        return !!(packageInfo.name.trim() && packageInfo.destination &&
          pricingTiers.some(t => t.price && parseInt(t.price) > 0) &&
          pickupDropCities.some(c => c.cityName.trim() && c.locations?.some(l => l.name.trim())));
      case 'inclusives':
        return !!(inclusivesList.some(i => i.text.trim()) && exclusivesList.some(e => e.text.trim()));
      case 'itinerary':
        return itinerary.length > 0 && itinerary.every(day => day.isCompleted);
      case 'terms':
        return !!(termsAndConditions.some(t => t.text.trim()));
      default:
        return false;
    }
  };

  // Photo upload handler for package photos
  const handlePackagePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (packagePhotos.length + files.length > 10) { alert('Max 10 photos allowed.'); return; }
    if (files.some(f => f.size > 5 * 1024 * 1024)) { alert('Each file must be ≤ 5 MB.'); return; }
    Promise.all(files.map(f => compressImage(f, { maxWidth: 1200, quality: 0.75 })))
      .then(imgs => setPackagePhotos(prev => [...prev, ...imgs].slice(0, 10)))
      .catch(err => { console.error('Compression error:', err); alert('Error compressing images. Please try again.'); });
  };

  const tabs = [
    { id: 'about', name: 'About Package', icon: <Camera size={18} /> },
    { id: 'package-info', name: 'Package Info', icon: <Calendar size={18} /> },
    { id: 'inclusives', name: 'Inclusions & Exclusions', icon: <Check size={18} /> },
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

  // Validate form before submission - RETURNS errors object directly
  const validateForm = () => {
    const errors = {};

    // ── Package Info Validation ──
    if (!packageInfo.name.trim()) errors.packageName = 'Package name is required';
    if (!packageInfo.destination) errors.destination = 'Destination is required';

    // Pricing Validation
    const hasValidTier = pricingTiers.some(tier => tier.price && parseInt(tier.price) > 0);
    if (!hasValidTier) {
      errors.price = 'At least one pricing tier with a valid price is required';
    }

    // Pickup city validation
    const hasValidCity = pickupDropCities.some(c => c.cityName.trim() && c.locations?.some(l => l.name.trim()));
    if (!hasValidCity) {
      errors.pickupCity = 'At least one pickup/drop-off city with a specific location name is required';
    }

    // ── Inclusions & Exclusions Validation ──
    const hasValidInclusion = inclusivesList.some(i => i.text.trim());
    if (!hasValidInclusion) {
      errors.inclusive_required = 'At least one inclusion is required';
    }

    const hasValidExclusion = exclusivesList.some(e => e.text.trim());
    if (!hasValidExclusion) {
      errors.exclusive_required = 'At least one exclusion is required';
    }

    // ── Itinerary Validation — ALL days must be completed ──
    itinerary.forEach((day, index) => {
      if (!day.isCompleted) {
        errors[`day_${index}_incomplete`] = `Day ${day.day} itinerary must be completed`;
      } else {
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

    // ── Terms & Conditions Validation ──
    const hasValidTerm = termsAndConditions.some(t => t.text.trim());
    if (!hasValidTerm) {
      errors.terms_required = 'At least one term or condition is required';
    }

    setValidationErrors(errors);
    return errors; // Return errors directly, not relying on state
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0];
      // Auto-switch to the tab with the first error
      if (firstError.startsWith('packageName') || firstError.startsWith('price') || firstError.startsWith('destination') || firstError.startsWith('pickupCity')) {
        setActiveTab('package-info');
      } else if (firstError.startsWith('inclusive_') || firstError.startsWith('exclusive_')) {
        setActiveTab('inclusives');
      } else if (firstError.startsWith('day_')) {
        setActiveTab('itinerary');
      } else if (firstError.startsWith('terms_')) {
        setActiveTab('terms');
      }

      setTimeout(() => {
        const element = document.querySelector(`[data-error="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-red-500');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-red-500');
          }, 2000);
        }
      }, 300);

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
        pickupDropCities: pickupDropCities.filter(c => c.cityName.trim()).map(c => ({
          cityName: c.cityName,
          locations: c.locations.filter(l => l.name.trim()).map(l => ({ name: l.name, mapLink: l.mapLink }))
        })),
        inclusivesList: inclusivesList.filter(i => i.text.trim()),
        exclusivesList: exclusivesList.filter(e => e.text.trim()),
        additionalPoints: additionalPoints.filter(p => p.text.trim()),
        itinerary: itinerary.filter(day => day.location?.trim() || day.agenda?.trim()), // Only save filled-in days
        termsAndConditions: termsAndConditions.filter(t => t.text.trim()),
        aboutPackage: aboutPackage.trim(),
        packagePhotos,
      };

      console.log('Submitting package:', formData);

      const endpoint = isEdit ? `/api/provider/packages?id=${initialData._id}` : '/api/provider/packages';
      const res = await fetchWithRetry(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }, { timeoutMs: 60000, maxRetries: 2 });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to create package');
      }

      // Show success animation
      setShowSuccess(true);
      localStorage.removeItem('newTripPackageDraft');
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/serviceprovider/dashboard/settings/packages');
      }, 2500);
    } catch (error) {
      console.error('Error creating package:', error);
      if (error.name === 'AbortError') {
        alert('The request timed out. Please check your internet connection and try again.');
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pricing Tier Handlers
  const handleAddPricingTier = () => {
    const newId = pricingTiers.length > 0 ? Math.max(...pricingTiers.map(t => t.id)) + 1 : 1;
    let nextMin = 1;
    let nextMax = 3;
    if (pricingTiers.length > 0) {
      const lastTier = pricingTiers[pricingTiers.length - 1];
      nextMin = parseInt(lastTier.maxPeople) + 1 || 1;
      nextMax = nextMin + 2;
    }
    setPricingTiers([...pricingTiers, { id: newId, minPeople: nextMin, maxPeople: nextMax, price: '', discount: '' }]);
  };

  const handleRemovePricingTier = (id) => {
    // Prevent deleting the first tier
    if (pricingTiers.length <= 1) return;
    if (pricingTiers[0].id === id) return;
    
    const removedIndex = pricingTiers.findIndex(t => t.id === id);
    const newTiers = pricingTiers.filter(t => t.id !== id);
    
    // Recalculate min values for tiers after the removed one
    for (let i = removedIndex; i < newTiers.length; i++) {
      if (i === 0) {
        newTiers[i] = { ...newTiers[i], minPeople: 1 };
      } else {
        const prevMax = parseInt(newTiers[i - 1].maxPeople) || 0;
        newTiers[i] = { ...newTiers[i], minPeople: prevMax + 1 };
      }
    }
    
    setPricingTiers(newTiers);
  };

  const handlePricingTierChange = (id, field, value) => {
    let updatedTiers = pricingTiers.map(tier =>
      tier.id === id
        ? { ...tier, [field]: value }
        : tier
    );
    
    // If maxPeople changed, auto-update the next tier's minPeople
    if (field === 'maxPeople') {
      const changedIndex = updatedTiers.findIndex(t => t.id === id);
      if (changedIndex >= 0 && changedIndex < updatedTiers.length - 1) {
        const nextMin = parseInt(value) + 1 || 1;
        updatedTiers[changedIndex + 1] = { ...updatedTiers[changedIndex + 1], minPeople: nextMin };
      }
    }
    
    // Ensure first tier always starts at 1
    if (updatedTiers.length > 0 && updatedTiers[0].minPeople !== 1) {
      updatedTiers[0] = { ...updatedTiers[0], minPeople: 1 };
    }
    
    setPricingTiers(updatedTiers);
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
  const handleAddInclusive = () => {
    const newId = inclusivesList.length > 0 ? Math.max(...inclusivesList.map(i => i.id)) + 1 : 1;
    setInclusivesList([...inclusivesList, { id: newId, text: '' }]);
  };

  const handleRemoveInclusive = (id) => {
    if (inclusivesList.length > 1) {
      setInclusivesList(inclusivesList.filter(item => item.id !== id));
    }
  };

  const handleInclusiveChange = (id, value) => {
    setInclusivesList(inclusivesList.map(item =>
      item.id === id ? { ...item, text: value } : item
    ));
  };

  // Exclusives Handlers
  const handleAddExclusive = () => {
    const newId = exclusivesList.length > 0 ? Math.max(...exclusivesList.map(i => i.id)) + 1 : 1;
    setExclusivesList([...exclusivesList, { id: newId, text: '' }]);
  };

  const handleRemoveExclusive = (id) => {
    if (exclusivesList.length > 1) {
      setExclusivesList(exclusivesList.filter(item => item.id !== id));
    }
  };

  const handleExclusiveChange = (id, value) => {
    setExclusivesList(exclusivesList.map(item =>
      item.id === id ? { ...item, text: value } : item
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
      const updateField = (val) => {
        const updatedItinerary = [...itinerary];
        updatedItinerary[dayIndex] = {
          ...updatedItinerary[dayIndex],
          [field]: val
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
      };

      if (value instanceof File) {
        if (value.size > 5 * 1024 * 1024) {
          alert('File size exceeds 5MB limit.');
          return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const compressed = await compressImage(value, { maxWidth: 1200, quality: 0.75 });
            updateField(compressed);
          } catch (err) {
            console.error('Compression error:', err);
            updateField(e.target.result); // fallback to raw
          }
        };
        reader.readAsDataURL(value);
      } else {
        updateField(value);
      }
    }
  };

  const handleDayPhotoUpload = (dayIndex, field, files) => {
    if (currentDayEditing === dayIndex && files.length > 0) {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(f => f.size <= 5 * 1024 * 1024);
      if (validFiles.length < fileArray.length) {
        alert('Some files exceed the 5MB limit and were skipped.');
      }
      
      const promises = validFiles.map(file => compressImage(file, { maxWidth: 1200, quality: 0.75 }));

      Promise.all(promises).then(compressedImages => {
        const updatedItinerary = [...itinerary];
        const existingPhotos = updatedItinerary[dayIndex][field] || [];
        updatedItinerary[dayIndex] = {
          ...updatedItinerary[dayIndex],
          [field]: [...existingPhotos, ...compressedImages]
        };
        setItinerary(updatedItinerary);
      });
    }
  };

  const removeDayPhoto = (dayIndex, field, photoIndex) => {
    const updatedItinerary = [...itinerary];
    updatedItinerary[dayIndex] = {
      ...updatedItinerary[dayIndex],
      [field]: updatedItinerary[dayIndex][field].filter((_, i) => i !== photoIndex)
    };
    setItinerary(updatedItinerary);
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

  const handleAddHighlight = (dayIndex) => {
    if (currentDayEditing === dayIndex) {
      const updatedItinerary = [...itinerary];
      if (updatedItinerary[dayIndex].highlights.length < 5) { // Max 5 highlights
         updatedItinerary[dayIndex].highlights.push('');
         setItinerary(updatedItinerary);
      }
    }
  };

  const handleRemoveHighlight = (dayIndex, highlightIndex) => {
    if (currentDayEditing === dayIndex) {
       const updatedItinerary = [...itinerary];
       if (updatedItinerary[dayIndex].highlights.length > 1) { // Min 1 highlight
          updatedItinerary[dayIndex].highlights.splice(highlightIndex, 1);
          setItinerary(updatedItinerary);
       }
    }
  };

  // Get pricing label based on package type
  const getPricingUnitLabel = () => {
    return packageInfo.packageType === 'individual' ? 'People' : 'Couples';
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">About Package</h3>
              <p className="text-gray-600 mt-1">Provide an overview and photographs for your package</p>
            </div>

            {/* Overview / Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Package Overview</label>
              <textarea
                value={aboutPackage}
                onChange={(e) => setAboutPackage(e.target.value)}
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none text-sm"
                placeholder="Describe your package in detail — what makes it special, what travelers can expect, key highlights, and why they should book this experience..."
              />
              <p className="mt-1.5 text-[11px] text-gray-400 font-medium">{aboutPackage.length} characters</p>
            </div>

            {/* Package Photos */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Package Photographs</label>
              <p className="text-[12px] text-gray-400 mb-3">Upload up to 10 photos showcasing the experience · Max 5 MB each</p>
              <div
                onClick={() => packagePhotoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-gray-500 hover:bg-emerald-50/50 hover:border-emerald-400 transition-all cursor-pointer"
              >
                <ImageIcon size={44} className="text-gray-300 mb-3" />
                <p className="font-semibold text-gray-600 text-sm">Click to upload images</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG accepted</p>
                <input type="file" multiple accept="image/*" className="hidden" ref={packagePhotoInputRef} onChange={handlePackagePhotoUpload} />
              </div>
              {packagePhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                  {packagePhotos.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-gray-100">
                      <img src={src} alt={`Package photo ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setPackagePhotos(packagePhotos.filter((_, j) => j !== i)); }}
                          className="bg-white text-rose-500 p-2 rounded-full hover:scale-110 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Eg: Premium Himalayan Trek Adventure"
                required
              />
              {validationErrors.packageName && (
                <p className="mt-1.5 text-[12px] text-rose-600 flex items-center gap-1"><AlertCircle size={11} />{validationErrors.packageName}</p>
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
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield size={20} className={packageInfo.packageCategory === 'budget' ? 'text-emerald-600' : 'text-gray-500'} />
                    </div>
                    <div className={`text-lg font-semibold ${packageInfo.packageCategory === 'budget' ? 'text-emerald-700' : 'text-gray-700'}`}>
                      Standard / Budget
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handlePackageInfoChange('packageCategory', 'premium')}
                  className={`p-4 rounded-xl border-2 transition-all ${packageInfo.packageCategory === 'premium' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Award size={20} className={packageInfo.packageCategory === 'premium' ? 'text-amber-500' : 'text-gray-500'} />
                    </div>
                    <div className={`text-lg font-semibold ${packageInfo.packageCategory === 'premium' ? 'text-amber-600' : 'text-gray-700'}`}>
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
                    className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <span className="text-xl">−</span>
                  </button>
                  <input
                    type="number"
                    value={packageInfo.days}
                    onChange={(e) => handlePackageInfoChange('days', e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    min="1"
                  />
                  <button
                    type="button"
                    onClick={() => handlePackageInfoChange('days', packageInfo.days + 1)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <span className="text-xl">+</span>
                  </button>
                </div>
              </div>

              <div data-error="destination">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Destination *
                </label>
                  <CustomSelect
                    value={packageInfo.destination}
                    onChange={(val) => handlePackageInfoChange('destination', val)}
                    options={destinations}
                    placeholder="Select a destination"
                    error={validationErrors.destination}
                  />
                {validationErrors.destination && (
                  <p className="mt-1.5 text-[12px] text-rose-600 flex items-center gap-1"><AlertCircle size={11} />{validationErrors.destination}</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm" data-error="price">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Pricing Tiers *</h3>
                  <p className="text-sm text-gray-500">Set different prices based on the number of {getPricingUnitLabel()} <span className="text-emerald-600 font-medium">(Price should be per person)</span></p>
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
                <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-[12px] rounded-lg flex items-center gap-2">
                  <AlertCircle size={13} />
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
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
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
                          className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                          placeholder="Price"
                          min="0"
                        />
                      </div>

                      <div className="md:col-span-3 relative">
                        <input
                          type="number"
                          value={tier.discount}
                          onChange={(e) => handlePricingTierChange(tier.id, 'discount', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg pr-7 pl-3 py-1.5 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                          placeholder="Discount"
                          min="0"
                          max="100"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
                      </div>

                      <div className="md:col-span-1 flex justify-end absolute md:relative top-2 right-2 md:top-auto md:right-auto">
                        {pricingTiers.length > 1 && index > 0 && (
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

            {/* Pickup & Drop Off Locations */}
            <div className={`p-6 rounded-xl border mt-6 md:col-span-12 ${validationErrors.pickupCity ? 'bg-rose-50/50 border-rose-200' : 'bg-emerald-50/50 border-emerald-100'}`} data-error="pickupCity">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Pickup & Drop Off Locations *</h3>
                  <p className="text-sm text-gray-500">Add cities and specific locations for your customers</p>
                </div>
                <button type="button" onClick={() => {
                  const cityId = Date.now();
                  setPickupDropCities(prev => [...prev, { id: cityId, cityName: '', locations: [{ id: cityId + 1, name: '', mapLink: '' }] }]);
                }} className="text-sm bg-white text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-emerald-100">
                  <Plus size={16} /> Add City
                </button>
              </div>

              {validationErrors.pickupCity && (
                <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-[12px] rounded-lg flex items-center gap-2">
                  <AlertCircle size={13} />
                  {validationErrors.pickupCity}
                </div>
              )}

              <div className="space-y-4">
                {pickupDropCities.map((city, cIdx) => (
                  <div key={city.id} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-100">
                    <div className="flex justify-between items-center mb-4">
                      <input
                        type="text"
                        placeholder="City Name (e.g., Delhi, Srinagar)"
                        value={city.cityName}
                        onChange={e => {
                          const val = e.target.value;
                          setPickupDropCities(prev => prev.map((c, i) =>
                            i === cIdx ? { ...c, cityName: val } : c
                          ));
                          if (validationErrors.pickupCity) {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.pickupCity;
                              return newErrors;
                            });
                          }
                        }}
                        className="font-semibold text-gray-800 bg-transparent border-b border-gray-200 outline-none w-1/2 md:w-1/3 py-1 px-2 focus:border-emerald-500"
                      />
                      {pickupDropCities.length > 1 && (
                        <button type="button" onClick={() => setPickupDropCities(prev => prev.filter(c => c.id !== city.id))} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-emerald-50 sm:ml-2 mt-2">
                      {city.locations.map((loc, lIdx) => (
                        <div key={loc.id} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                          <input type="text" placeholder="Location Name (e.g., Airport, ISBT)" value={loc.name} onChange={e => {
                            const val = e.target.value;
                            setPickupDropCities(prev => prev.map((c, i) =>
                              i === cIdx ? { ...c, locations: c.locations.map((l, j) => j === lIdx ? { ...l, name: val } : l) } : c
                            ));
                            if (validationErrors.pickupCity) {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.pickupCity;
                                return newErrors;
                              });
                            }
                          }} className="w-full sm:flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                          <input type="text" placeholder="Google Maps Link (Optional)" value={loc.mapLink} onChange={e => {
                            const val = e.target.value;
                            setPickupDropCities(prev => prev.map((c, i) =>
                              i === cIdx ? { ...c, locations: c.locations.map((l, j) => j === lIdx ? { ...l, mapLink: val } : l) } : c
                            ));
                          }} className="w-full sm:flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />

                          {city.locations.length > 1 && (
                            <button type="button" onClick={() => {
                              setPickupDropCities(prev => prev.map((c, i) =>
                                i === cIdx ? { ...c, locations: c.locations.filter(l => l.id !== loc.id) } : c
                              ));
                            }} className="text-red-400 hover:text-red-600 shrink-0 p-2 w-full sm:w-auto flex justify-center hover:bg-red-50 rounded-lg">
                              <span className="sm:hidden text-sm mr-2">Remove</span><X size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => {
                        setPickupDropCities(prev => prev.map((c, i) =>
                          i === cIdx ? { ...c, locations: [...c.locations, { id: Date.now(), name: '', mapLink: '' }] } : c
                        ));
                      }} className="text-emerald-600 text-xs font-semibold flex items-center gap-1 mt-2 hover:bg-emerald-50 px-2 py-1.5 rounded-lg w-fit">
                        <Plus size={14} /> Add Location
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'inclusives':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-gray-800">Inclusions & Exclusions</h3>
              <p className="text-gray-600 mt-1">Specify what is included and not included in your package</p>
            </div>

            {/* Inclusives Section */}
            <div className={`bg-white p-6 rounded-xl border shadow-sm ${validationErrors.inclusive_required ? 'border-rose-200 ring-1 ring-rose-100' : 'border-emerald-100'}`} data-error="inclusive_required">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Check size={20} />
                  <h3 className="text-lg font-semibold">What's Included *</h3>
                </div>
              </div>
              {validationErrors.inclusive_required && (
                <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-[12px] rounded-lg flex items-center gap-2">
                  <AlertCircle size={13} />
                  {validationErrors.inclusive_required}
                </div>
              )}
              
              <div className="space-y-3">
                {inclusivesList.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleInclusiveChange(item.id, e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="e.g. 3 Nights accommodation in 4-star hotel"
                      />
                    </div>
                    {inclusivesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInclusive(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </motion.div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddInclusive}
                  className="flex items-center gap-2 text-sm text-emerald-600 font-medium hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg transition mt-2 w-fit"
                >
                  <Plus size={16} /> Add Inclusion
                </button>
              </div>
            </div>

            {/* Exclusives Section */}
            <div className={`bg-white p-6 rounded-xl border shadow-sm mt-6 ${validationErrors.exclusive_required ? 'border-rose-300 ring-1 ring-rose-100' : 'border-rose-100'}`} data-error="exclusive_required">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-rose-700">
                  <X size={20} />
                  <h3 className="text-lg font-semibold">What's Excluded *</h3>
                </div>
              </div>
              {validationErrors.exclusive_required && (
                <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-[12px] rounded-lg flex items-center gap-2">
                  <AlertCircle size={13} />
                  {validationErrors.exclusive_required}
                </div>
              )}
              
              <div className="space-y-3">
                {exclusivesList.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => handleExclusiveChange(item.id, e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none transition-all"
                        placeholder="e.g. Personal expenses, flights, etc."
                      />
                    </div>
                    {exclusivesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExclusive(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </motion.div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddExclusive}
                  className="flex items-center gap-2 text-sm text-rose-600 font-medium hover:text-rose-700 bg-rose-50 px-4 py-2 rounded-lg transition mt-2 w-fit"
                >
                  <Plus size={16} /> Add Exclusion
                </button>
              </div>
            </div>

            {/* Additional Points Section */}
            <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm mt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Navigation size={18} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Additional Points</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4 ml-10">Add any other important notes or tips for your travelers</p>
              
              <div className="space-y-3">
                {additionalPoints.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => setAdditionalPoints(additionalPoints.map(p => p.id === item.id ? { ...p, text: e.target.value } : p))}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
                        placeholder="e.g. Travelers must be physically fit for short walks..."
                      />
                    </div>
                    {additionalPoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setAdditionalPoints(additionalPoints.filter(p => p.id !== item.id))}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </motion.div>
                ))}
                
                <button
                  type="button"
                  onClick={() => setAdditionalPoints([...additionalPoints, { id: Date.now(), text: '' }])}
                  className="flex items-center gap-2 text-sm text-amber-600 font-medium hover:text-amber-700 bg-amber-50 px-4 py-2 rounded-lg transition mt-2 w-fit"
                >
                  <Plus size={16} /> Add Point
                </button>
              </div>
            </div>
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
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="City, Region"
                    required
                  />
                  {validationErrors[`day_${currentDayEditing}_location`] && (
                    <p className="mt-1.5 text-[12px] text-rose-600 flex items-center gap-1"><AlertCircle size={11} />{validationErrors[`day_${currentDayEditing}_location`]}</p>
                  )}
                </div>

                <div data-error={`day_${currentDayEditing}_agenda`}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Agenda Type *
                  </label>
                  <CustomSelect
                    value={dayData.agenda}
                    onChange={(val) => handleDayChange(currentDayEditing, 'agenda', val)}
                    options={agendaOptions}
                    placeholder="Select Agenda"
                    error={validationErrors[`day_${currentDayEditing}_agenda`]}
                  />
                  {validationErrors[`day_${currentDayEditing}_agenda`] && (
                    <p className="mt-1.5 text-[12px] text-rose-600 flex items-center gap-1"><AlertCircle size={11} />{validationErrors[`day_${currentDayEditing}_agenda`]}</p>
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
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Navigation size={20} className="text-emerald-600" />
                      <h4 className="font-semibold text-emerald-800">Travel Details</h4>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                      <input
                        type="checkbox"
                        checked={dayData.isDayTrip}
                        onChange={(e) => handleDayChange(currentDayEditing, 'isDayTrip', e.target.checked)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded border-emerald-300"
                      />
                      <span className="text-sm font-bold text-emerald-800">Day Trip</span>
                    </label>
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
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
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
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Destination"
                        required
                      />
                    </div>
                  </div>
                  {validationErrors[`day_${currentDayEditing}_travel`] && (
                    <p className="mt-2 text-[12px] text-rose-600 flex items-center gap-1"><AlertCircle size={11} />{validationErrors[`day_${currentDayEditing}_travel`]}</p>
                  )}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    {dayData.agenda === 'arrival' ? 'Check-in Time' : 'Pick-up Time'}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={dayData.agenda === 'arrival' ? dayData.checkinTime : dayData.pickupTime}
                      onChange={(e) => handleDayChange(currentDayEditing, dayData.agenda === 'arrival' ? 'checkinTime' : 'pickupTime', e.target.value)}
                      className="w-full border border-gray-300 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      placeholder={dayData.agenda === 'arrival' ? 'Eg: 12:00 PM' : 'Eg: 9:00 AM'}
                    />
                  </div>
                </div>

                <div className="space-y-4">
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
                  {dayData.hotelName && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Star Rating
                        </label>
                        <div className="relative">
                          <CustomSelect
                            value={dayData.hotelStars}
                            onChange={(val) => handleDayChange(currentDayEditing, 'hotelStars', val)}
                            options={[
                              { value: '2', label: '2 Stars' },
                              { value: '3', label: '3 Stars' },
                              { value: '4', label: '4 Stars' },
                              { value: '5', label: '5 Stars' }
                            ]}
                            placeholder="Select Stars"
                            icon={Star}
                            iconClassName="text-amber-500"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="block text-sm font-semibold text-gray-800 truncate">
                          Hotel Photos (Optional)
                        </label>
                        <div className="flex flex-col gap-3">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleDayPhotoUpload(currentDayEditing, 'hotelPhotos', e.target.files)}
                            className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                          />
                          {dayData.hotelPhotos && dayData.hotelPhotos.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {dayData.hotelPhotos.map((photo, i) => (
                                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-emerald-200 group">
                                  <img src={photo} className="w-full h-full object-cover" alt="Hotel upload" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                    <button
                                      type="button"
                                      onClick={() => removeDayPhoto(currentDayEditing, 'hotelPhotos', i)}
                                      className="text-white hover:text-red-400 p-1"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Destination Photographs (Optional)
                </label>
                <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-sm text-gray-500">Upload multiple photos displaying the destination for this day</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleDayPhotoUpload(currentDayEditing, 'destinationPhotos', e.target.files)}
                      className="w-full sm:w-auto text-sm file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                  
                  {dayData.destinationPhotos && dayData.destinationPhotos.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {dayData.destinationPhotos.map((photo, i) => (
                        <div key={i} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-emerald-200 group shadow-sm">
                          <img src={photo} className="w-full h-full object-cover" alt="Destination upload" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeDayPhoto(currentDayEditing, 'destinationPhotos', i)}
                              className="text-white hover:text-red-400 p-1 bg-black/50 rounded-md"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
                  <span>Day Highlights <span className="text-gray-400 font-normal ml-1">(max 5 points, 100 chars each)</span></span>
                  {dayData.highlights.length < 5 && (
                    <button
                       type="button"
                       onClick={() => handleAddHighlight(currentDayEditing)}
                       className="text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center"
                    >
                       <Plus size={14} className="mr-1" /> Add Highlight
                    </button>
                  )}
                </label>
                <div className="space-y-3">
                  {dayData.highlights.map((highlight, index) => (
                    <div key={index} className="relative group flex items-start gap-2">
                      <div className="relative flex-grow">
                        <textarea
                          value={highlight}
                          onChange={(e) => handleHighlightChange(currentDayEditing, index, e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-16 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
                          rows="2"
                          placeholder={`Highlight ${index + 1}`}
                          maxLength={100}
                        />
                        <div className="absolute right-3 bottom-3 text-xs text-gray-500 bg-white/80 px-1 rounded">
                          {highlight.length}/100
                        </div>
                      </div>
                      {dayData.highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(currentDayEditing, index)}
                          className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 mt-1 opacity-100 sm:opacity-0 group-hover:opacity-100"
                          title="Remove highlight"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
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
                  className={`bg-white border rounded-xl p-6 transition-all ${validationErrors[`day_${index}_incomplete`] ? 'border-rose-300 ring-1 ring-rose-100' : 'border-gray-200 hover:border-emerald-300'}`}
                  data-error={`day_${index}_incomplete`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`min-w-[64px] h-12 px-3 rounded-xl flex items-center justify-center text-center ${day.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                        <span className="font-bold text-[14px] leading-none">Day {day.day}</span>
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

                  {validationErrors[`day_${index}_incomplete`] && (
                    <div className="mt-4 p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-[12px] text-rose-600 font-medium">
                      <AlertCircle size={14} />Day {day.day} details are empty! Click "Create" to fill in the itinerary.
                    </div>
                  )}

                  {validationErrors[`day_${index}_location`] && (
                    <div className="mt-3 p-2.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-[12px] text-rose-600">
                      <AlertCircle size={13} />Location is required for Day {day.day}
                    </div>
                  )}

                  {validationErrors[`day_${index}_agenda`] && (
                    <div className="mt-3 p-2.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-[12px] text-rose-600">
                      <AlertCircle size={13} />Agenda is required for Day {day.day}
                    </div>
                  )}

                  {validationErrors[`day_${index}_travel`] && (
                    <div className="mt-3 p-2.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-[12px] text-rose-600">
                      <AlertCircle size={13} />Travel details are required for Day {day.day}
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
            <div className="text-center mb-8" data-error="terms_required">
              <h3 className="text-lg font-semibold text-gray-800">Terms & Conditions *</h3>
              <p className="text-gray-600 mt-1">Define the terms and conditions for your package (max 200 characters each)</p>
            </div>

            {validationErrors.terms_required && (
              <div className="mb-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-[12px] rounded-lg flex items-center gap-2">
                <AlertCircle size={13} />
                {validationErrors.terms_required}
              </div>
            )}

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
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-16 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
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
    <div className="w-full space-y-6 pb-20">
      
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-black text-gray-900 tracking-tight leading-none mb-1">{isEdit && initialData?.status !== 'inactive' ? 'Edit Trip Package' : 'Create Trip Package'}</h1>
              <p className="text-[12px] text-gray-400 font-medium">Design your perfect travel experience</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          form="packageForm"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] font-bold hover:bg-emerald-700 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>{isEdit && initialData?.status !== 'inactive' ? 'Update Package' : 'Publish Package'}</span>
        </button>
      </div>

      <div className="w-full">
        <form id="packageForm" onSubmit={handleSubmit} className="space-y-6">
          {/* Tabs Navigation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const isComplete = getSectionComplete(tab.id);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[120px] py-4 flex items-center justify-center gap-2 text-[13px] font-bold transition-all ${
                      activeTab === tab.id 
                      ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className={activeTab === tab.id ? 'text-emerald-500' : 'text-gray-300'}>
                      {tab.icon}
                    </div>
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden text-[11px]">{tab.name.split(' ')[0]}</span>
                    {isComplete ? (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Section complete" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" title="Section incomplete" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-5 sm:p-8">
              {renderTabContent()}
            </div>
          </div>

          {/* Progress and Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="text-[12px] font-bold text-gray-400 whitespace-nowrap">
                Step {tabs.findIndex(tab => tab.id === activeTab) + 1} of {tabs.length}
              </div>
              <div className="flex-1 sm:w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
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

            <div className="flex gap-3 w-full sm:w-auto">
              {tabs.findIndex(tab => tab.id === activeTab) > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    setActiveTab(tabs[currentIndex - 1].id);
                  }}
                  className="flex-1 sm:flex-none border border-gray-200 text-gray-500 px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>
              )}

              {tabs.findIndex(tab => tab.id === activeTab) < tabs.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                    setActiveTab(tabs[currentIndex + 1].id);
                  }}
                  className="flex-1 sm:flex-none bg-white border border-emerald-100 text-emerald-600 px-6 py-2.5 rounded-xl text-[13px] font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                >
                  Next Step
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none bg-emerald-600 text-white px-8 py-2.5 rounded-xl text-[13px] font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save size={16} />
                  {isSubmitting ? (isEdit ? 'Updating...' : 'Publishing...') : (isEdit ? 'Save Changes' : 'Save & Publish')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Unsaved Changes Alert */}
      <AnimatePresence>
        {showUnsavedAlert && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
              onClick={() => setShowUnsavedAlert(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-[17px] font-black text-gray-900">Unsaved Changes</h3>
                  <p className="text-[12px] text-gray-400 font-medium">Progress will be lost</p>
                </div>
              </div>

              <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
                If you go back without saving, all details entered for Day {currentDayEditing + 1} will be lost.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUnsavedAlert(false);
                    setCurrentDayEditing(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-500 text-[13px] font-bold rounded-xl hover:bg-gray-100 transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={() => setShowUnsavedAlert(false)}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-[13px] font-bold rounded-xl hover:bg-emerald-700 shadow-sm transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
              <motion.div
                initial={{ scale: 0.5, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className="relative bg-white rounded-[32px] sm:rounded-[40px] shadow-lg p-6 sm:p-10 flex flex-col items-center text-center max-w-[calc(100%-2rem)] sm:max-w-sm w-full overflow-hidden border border-gray-100"
              >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-20 h-20 bg-emerald-50 rounded-[24px] flex items-center justify-center mb-6"
              >
                <Check size={40} className="text-emerald-600" strokeWidth={3} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-[22px] font-black text-gray-900 mb-2">Success! 🎉</h2>
                <p className="text-[13px] text-gray-400 font-medium leading-relaxed">Your package is now live and visible to users on the platform.</p>
                <div className="mt-6 flex gap-1.5 justify-center">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                      animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ delay: 0.6 + i * 0.15, repeat: Infinity, duration: 0.6 }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewPackage;