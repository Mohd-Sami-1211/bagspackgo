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
  Calendar,
  MapPin,
  Check,
  FileText,
  Heart,
  User,
  PartyPopper,
  Tent,
  Utensils,
  Car,
  Users,
  Navigation,
  AlertCircle,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import dataJson from 'src/data/data.json';

const destinations = dataJson.destinations.map((d, i) => ({
  id: i + 1,
  name: d.label,
  value: d.value
}));

const trekOptionsMap = {
  'Kashmir': ['Kashmir Great Lakes', 'Tarsar Marsar', 'Kolhoi Glacier', 'Other'],
  'Uttarakhand': ['Valley of Flowers', 'Kedarkantha', 'Roopkund', 'Other'],
  'Himachal Pradesh': ['Hampta Pass', 'Bhrigu Lake', 'Pin Parvati Pass', 'Other'],
  'default': ['Other']
};

export default function NewTrekPackage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('package-info');
  const [validationErrors, setValidationErrors] = useState({});

  // 1. Package Info State
  const [packageInfo, setPackageInfo] = useState({
    name: '',
    category: 'trek',
    packageType: 'individual',
    packageCategory: 'budget',
    destination: '',
    days: 3,
    trekName: '',
    customTrekName: '',
    trekLevel: ''
  });

  const [pricingTiers, setPricingTiers] = useState([
    { id: 1, minPeople: 1, maxPeople: 2, price: '', discount: '' }
  ]);

  const [pickupDropCities, setPickupDropCities] = useState([
    { id: 1, cityName: '', locations: [{ id: 1, name: '', mapLink: '' }] }
  ]);


  // 2. Inclusives State
  const [inclusives, setInclusives] = useState({
    food: { included: false, title: '', details: ['', '', ''] },
    transport: { included: false, title: '', details: ['', '', ''] },
    camping: { included: false, title: '', details: ['', '', ''] },
    guidance: { included: false, title: '', details: ['', '', ''] },
    pickupDropoff: { included: false, title: '', details: ['', '', ''] },
  });

  // 3. Itinerary State - simple empty preset sections per day
  const [itinerary, setItinerary] = useState(
    Array.from({ length: 3 }, (_, i) => ({
      day: i + 1,
      sections: ['']
    }))
  );

  // 4. Photographs State
  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  // 5. Terms & Conditions State
  const [termsAndConditions, setTermsAndConditions] = useState([{ id: 1, text: '' }]);

  // Tab configurations
  const tabs = [
    { id: 'package-info', name: 'Trek Info', icon: <MapPin size={18} /> },
    { id: 'inclusives', name: 'Inclusives', icon: <Check size={18} /> },
    { id: 'itinerary', name: 'Itinerary', icon: <Calendar size={18} /> },
    { id: 'photographs', name: 'Photographs', icon: <Camera size={18} /> },
    { id: 'terms', name: 'Terms & Conditions', icon: <FileText size={18} /> },
  ];

  // Adjust itinerary length if days change
  useEffect(() => {
    const daysCount = packageInfo.days || 1;
    if (daysCount !== itinerary.length) {
      if (daysCount > itinerary.length) {
        const newDays = Array.from({ length: daysCount - itinerary.length }, (_, i) => ({
          day: itinerary.length + i + 1,
          sections: ['']
        }));
        setItinerary([...itinerary, ...newDays]);
      } else {
        setItinerary(itinerary.slice(0, daysCount));
      }
    }
  }, [packageInfo.days, itinerary]);

  // Handle Photo Upload Limits and Size
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (photos.length + files.length > 5) {
      alert("You can only upload a maximum of 5 photographs.");
      return;
    }

    const invalidFiles = files.filter(f => f.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      alert("Some files exceed the 5MB size limit.");
      return;
    }

    const newPhotosPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPhotosPromises).then(base64Images => {
      setPhotos([...photos, ...base64Images].slice(0, 5));
    });
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Validation
  const validateForm = () => {
    const errors = {};

    if (!packageInfo.name.trim()) errors.packageName = 'Package name is required';
    if (!packageInfo.destination) errors.destination = 'Destination is required';
    if (!packageInfo.trekName) errors.trekName = 'Trek selection is required';
    if (packageInfo.trekName === 'Other' && !packageInfo.customTrekName.trim()) {
      errors.customTrekName = 'Please specify the trek name';
    }
    if (!packageInfo.trekLevel) errors.trekLevel = 'Trek difficulty level is required';

    const hasValidTier = pricingTiers.some(tier => tier.price && parseInt(tier.price) > 0);
    if (!hasValidTier) errors.price = 'At least one pricing tier with a valid price is required';

    Object.entries(inclusives).forEach(([key, value]) => {
      if (value.included && !value.title.trim()) {
        errors[`inclusive_${key}`] = `Title is required for ${key}`;
      }
    });

    itinerary.forEach((day, index) => {
      const validSections = day.sections.filter(s => s.trim().length > 0);
      if (validSections.length === 0) {
        errors[`itinerary_day_${index}`] = `At least one itinerary section is required for Day ${day.day}`;
      }
    });

    const validTerms = termsAndConditions.filter(t => t.text.trim());
    if (validTerms.length === 0) {
      errors.terms = 'At least one term of service is required';
    }

    setValidationErrors(errors);
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      alert(`Please fill in all compulsory fields. Missed field: ${errors[firstErrorKey]}`);

      // Auto tab jump based on error
      if (firstErrorKey.startsWith('package') || firstErrorKey.startsWith('destination') || firstErrorKey.startsWith('price') || firstErrorKey.includes('trek')) {
        setActiveTab('package-info');
      } else if (firstErrorKey.startsWith('inclusive')) {
        setActiveTab('inclusives');
      } else if (firstErrorKey.startsWith('itinerary')) {
        setActiveTab('itinerary');
      } else if (firstErrorKey === 'terms') {
        setActiveTab('terms');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const isOther = packageInfo.trekName === 'Other';
      const finalTrekName = isOther ? packageInfo.customTrekName : packageInfo.trekName;

      // Transform itinerary for backend model
      const formattedItinerary = itinerary.map(day => ({
        day: day.day,
        agenda: day.sections.filter(s => s.trim()).join(' | '),
        location: '',
        travelFrom: '',
        travelTo: '',
        pickupTime: '',
        hotelName: '',
        activities: [],
        highlights: day.sections.filter(s => s.trim()),
        isCompleted: true
      }));

      const formData = {
        packageInfo: {
          name: packageInfo.name,
          category: 'trek',
          packageType: packageInfo.packageType,
          packageCategory: packageInfo.packageCategory,
          destination: packageInfo.destination,
          days: parseInt(packageInfo.days) || 1,
          trekName: finalTrekName,
          trekLevel: packageInfo.trekLevel
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
        inclusives,
        activities: [],
        itinerary: formattedItinerary,
        termsAndConditions: termsAndConditions.filter(t => t.text.trim()),
        photos: photos
      };

      const res = await fetch('/api/provider/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to create package');

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/serviceprovider/dashboard/settings/packages');
      }, 2500);
    } catch (error) {
      console.error('Error creating trek:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI Renderers
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Create Trek Package</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Fill in the details to publish your new trek.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span className="hidden sm:inline">Publish Package</span>
              <span className="sm:hidden">Publish</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 sticky top-28">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <div className={`${activeTab === tab.id ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {tab.icon}
                  </div>
                  {tab.name}
                  {validationErrors && Object.keys(validationErrors).some(err =>
                    (tab.id === 'package-info' && ['packageName', 'destination', 'price', 'trekName', 'customTrekName', 'trekLevel'].includes(err)) ||
                    (tab.id === 'inclusives' && err.startsWith('inclusive')) ||
                    (tab.id === 'itinerary' && err.startsWith('itinerary')) ||
                    (tab.id === 'terms' && err === 'terms')
                  ) && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-red-500"></div>
                    )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">

            {/* 1. Package Info Tab */}
            {activeTab === 'package-info' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Package Name *</label>
                  <input
                    type="text"
                    value={packageInfo.name}
                    onChange={(e) => setPackageInfo({ ...packageInfo, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="E.g., Hampta Pass Epic Journey"
                  />
                  {validationErrors.packageName && <p className="text-sm text-red-500 mt-1">{validationErrors.packageName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Destination *</label>
                    <select
                      value={packageInfo.destination}
                      onChange={(e) => {
                        setPackageInfo({ ...packageInfo, destination: e.target.value, trekName: '', customTrekName: '' });
                      }}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">Select Destination</option>
                      {destinations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                    {validationErrors.destination && <p className="text-sm text-red-500 mt-1">{validationErrors.destination}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Trek Name *</label>
                    <select
                      value={packageInfo.trekName}
                      disabled={!packageInfo.destination}
                      onChange={(e) => setPackageInfo({ ...packageInfo, trekName: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">Select Trek</option>
                      {(trekOptionsMap[packageInfo.destination] || trekOptionsMap['default']).map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {validationErrors.trekName && <p className="text-sm text-red-500 mt-1">{validationErrors.trekName}</p>}
                  </div>
                </div>

                {packageInfo.trekName === 'Other' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Custom Trek Name *</label>
                    <input
                      type="text"
                      value={packageInfo.customTrekName}
                      onChange={(e) => setPackageInfo({ ...packageInfo, customTrekName: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Enter the name of the trek"
                    />
                    {validationErrors.customTrekName && <p className="text-sm text-red-500 mt-1">{validationErrors.customTrekName}</p>}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Number of Days *</label>
                    <input
                      value={packageInfo.days}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setPackageInfo({ ...packageInfo, days: '' });
                        } else {
                          const parsed = parseInt(val);
                          if (!isNaN(parsed)) {
                            setPackageInfo({ ...packageInfo, days: Math.max(1, parsed) });
                          }
                        }
                      }}
                      onBlur={() => {
                        if (packageInfo.days === '') {
                          setPackageInfo({ ...packageInfo, days: 1 });
                        }
                      }}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Trek Difficulty Level *</label>
                    <select
                      value={packageInfo.trekLevel}
                      onChange={(e) => setPackageInfo({ ...packageInfo, trekLevel: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="">Select Level</option>
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="difficult">Difficult</option>
                    </select>
                    {validationErrors.trekLevel && <p className="text-sm text-red-500 mt-1">{validationErrors.trekLevel}</p>}
                  </div>
                </div>

                {/* Pickup & Drop Off Locations */}
                <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Pickup & Drop Off Locations</h3>
                    <button type="button" onClick={() => {
                      setPickupDropCities([...pickupDropCities, { id: Date.now(), cityName: '', locations: [{ id: Date.now(), name: '', mapLink: '' }] }]);
                    }} className="text-sm bg-white text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-emerald-100">
                      <Plus size={16} /> Add City
                    </button>
                  </div>

                  <div className="space-y-4">
                    {pickupDropCities.map((city, cIdx) => (
                      <div key={city.id} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm transition-all focus-within:ring-2 focus-within:ring-emerald-100">
                        <div className="flex justify-between items-center mb-4">
                          <input
                            type="text"
                            placeholder="City Name (e.g., Delhi, Srinagar)"
                            value={city.cityName}
                            onChange={e => {
                              const newCities = [...pickupDropCities];
                              newCities[cIdx].cityName = e.target.value;
                              setPickupDropCities(newCities);
                            }}
                            className="font-semibold text-gray-800 bg-transparent border-b border-gray-200 outline-none w-1/2 md:w-1/3 py-1 px-2 focus:border-emerald-500"
                          />
                          {pickupDropCities.length > 1 && (
                            <button type="button" onClick={() => setPickupDropCities(pickupDropCities.filter(c => c.id !== city.id))} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>

                        <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-emerald-50 sm:ml-2 mt-2">
                          {city.locations.map((loc, lIdx) => (
                            <div key={loc.id} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                              <input type="text" placeholder="Location Name (e.g., Airport, ISBT)" value={loc.name} onChange={e => {
                                const newCities = [...pickupDropCities];
                                newCities[cIdx].locations[lIdx].name = e.target.value;
                                setPickupDropCities(newCities);
                              }} className="w-full sm:flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                              <input type="text" placeholder="Google Maps Link (Optional)" value={loc.mapLink} onChange={e => {
                                const newCities = [...pickupDropCities];
                                newCities[cIdx].locations[lIdx].mapLink = e.target.value;
                                setPickupDropCities(newCities);
                              }} className="w-full sm:flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500" />

                              {city.locations.length > 1 && (
                                <button type="button" onClick={() => {
                                  const newCities = [...pickupDropCities];
                                  newCities[cIdx].locations = newCities[cIdx].locations.filter(l => l.id !== loc.id);
                                  setPickupDropCities(newCities);
                                }} className="text-red-400 hover:text-red-600 shrink-0 p-2 w-full sm:w-auto flex justify-center hover:bg-red-50 rounded-lg">
                                  <span className="sm:hidden text-sm mr-2">Remove</span><X size={18} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button type="button" onClick={() => {
                            const newCities = [...pickupDropCities];
                            newCities[cIdx].locations.push({ id: Date.now(), name: '', mapLink: '' });
                            setPickupDropCities(newCities);
                          }} className="text-emerald-600 text-xs font-semibold flex items-center gap-1 mt-2 hover:bg-emerald-50 px-2 py-1.5 rounded-lg w-fit">
                            <Plus size={14} /> Add Location
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PRICING */}
                <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Pricing Ranges *</h3>
                    <button type="button" onClick={() => {
                      const nextMin = pricingTiers.length > 0 ? parseInt(pricingTiers[pricingTiers.length - 1].maxPeople) + 1 : 1;
                      setPricingTiers([...pricingTiers, { id: Date.now(), minPeople: nextMin, maxPeople: nextMin + 2, price: '', discount: '' }]);
                    }} className="text-sm bg-white text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-emerald-100">
                      <Plus size={16} /> Add Range
                    </button>
                  </div>
                  {validationErrors.price && <p className="text-sm text-red-500 mb-3">{validationErrors.price}</p>}
                  <div className="space-y-3">
                    {pricingTiers.map((tier, idx) => (
                      <div key={tier.id} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                        <input type="number" placeholder="Min" value={tier.minPeople} onChange={e => {
                          const newTiers = [...pricingTiers];
                          newTiers[idx].minPeople = e.target.value;
                          setPricingTiers(newTiers);
                        }} className="w-16 border rounded-lg px-2 py-1 text-center" />
                        <span className="text-gray-400">to</span>
                        <input type="number" placeholder="Max" value={tier.maxPeople} onChange={e => {
                          const newTiers = [...pricingTiers];
                          newTiers[idx].maxPeople = e.target.value;
                          setPricingTiers(newTiers);
                        }} className="w-16 border rounded-lg px-2 py-1 text-center" />
                        <span className="text-sm text-gray-500 mr-2">Pax</span>

                        <div className="relative flex-1 min-w-[120px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <input type="number" placeholder="Price" value={tier.price} onChange={e => {
                            const newTiers = [...pricingTiers];
                            newTiers[idx].price = e.target.value;
                            setPricingTiers(newTiers);
                          }} className="w-full border rounded-lg pl-8 pr-3 py-2 outline-none focus:border-emerald-500" />
                        </div>
                        {pricingTiers.length > 1 && (
                          <button type="button" onClick={() => setPricingTiers(pricingTiers.filter(t => t.id !== tier.id))} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Inclusives Tab */}
            {activeTab === 'inclusives' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Facilitations included in the Trek</h3>
                {Object.entries(inclusives).map(([key, data]) => {
                  const icons = { food: <Utensils />, transport: <Car />, camping: <Tent />, guidance: <Users />, pickupDropoff: <Navigation /> };
                  const titles = { food: 'Food & Dining', transport: 'Transport', camping: 'Camping & Facilitations', guidance: 'Guidance', pickupDropoff: 'Pickup & Drop Off' };
                  return (
                    <div key={key} className={`border rounded-xl p-5 transition ${data.included ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-4">
                        <button type="button" onClick={() => setInclusives({ ...inclusives, [key]: { ...data, included: !data.included } })}
                          className={`w-6 h-6 rounded flex items-center justify-center ${data.included ? 'bg-emerald-500' : 'bg-gray-200 hover:bg-gray-300'}`}>
                          {data.included && <Check size={14} className="text-white" />}
                        </button>
                        <div className={`p-2 rounded-lg ${data.included ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                          {icons[key]}
                        </div>
                        <span className={`font-semibold ${data.included ? 'text-gray-900' : 'text-gray-500'}`}>{titles[key]}</span>
                      </div>

                      {data.included && (
                        <div className="mt-4 ml-10 space-y-4">
                          <div>
                            <input type="text" placeholder="General Title (e.g., Camping tents and sleeping bags)" value={data.title}
                              onChange={(e) => setInclusives({ ...inclusives, [key]: { ...data, title: e.target.value } })}
                              className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-500" />
                            {validationErrors[`inclusive_${key}`] && <p className="text-red-500 text-xs mt-1">{validationErrors[`inclusive_${key}`]}</p>}
                          </div>
                          <div className="space-y-2">
                            {data.details.map((detail, idx) => (
                              <input key={idx} type="text" placeholder={`Highlight ${idx + 1} (Optional)`} value={detail}
                                onChange={(e) => {
                                  const newDetails = [...data.details];
                                  newDetails[idx] = e.target.value;
                                  setInclusives({ ...inclusives, [key]: { ...data, details: newDetails } });
                                }}
                                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-sm outline-none focus:border-emerald-300 focus:bg-white" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* 3. Itinerary Tab */}
            {activeTab === 'itinerary' && (
              <div className="space-y-6">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Trek Itinerary</h3>
                    <p className="text-sm text-gray-500">Provide sequential events for each day of the {packageInfo.days || 1}-day trek.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {itinerary.map((day, dIdx) => (
                    <div key={day.day} className="border border-emerald-100 bg-white shadow-sm rounded-xl p-5 overflow-hidden">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-600 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center">
                          D{day.day}
                        </div>
                        <h4 className="font-semibold text-gray-800 text-lg">Itinerary Sections</h4>
                      </div>

                      {validationErrors[`itinerary_day_${dIdx}`] && <p className="text-red-500 text-sm mb-3">{validationErrors[`itinerary_day_${dIdx}`]}</p>}

                      <div className="space-y-3 pl-12">
                        {day.sections.map((section, sIdx) => (
                          <div key={sIdx} className="flex items-start gap-2">
                            <span className="text-emerald-500 font-bold mt-2 text-sm">{sIdx + 1}.</span>
                            <textarea
                              rows={2}
                              value={section}
                              placeholder="Describe this section of the day..."
                              onChange={(e) => {
                                const newItin = [...itinerary];
                                newItin[dIdx].sections[sIdx] = e.target.value;
                                setItinerary(newItin);
                              }}
                              className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                            />
                            <button type="button" onClick={() => {
                              const newItin = [...itinerary];
                              newItin[dIdx].sections = newItin[dIdx].sections.filter((_, i) => i !== sIdx);
                              setItinerary(newItin);
                            }} className="mt-2 text-red-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg">
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                          const newItin = [...itinerary];
                          newItin[dIdx].sections.push('');
                          setItinerary(newItin);
                        }} className="text-emerald-600 text-sm font-semibold flex items-center gap-1 mt-2 hover:bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                          <Plus size={14} /> Add another section
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Photographs Tab */}
            {activeTab === 'photographs' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Trek Photographs</h3>
                  <p className="text-sm text-gray-500">Upload up to 5 scenic pictures. Limit 5MB per image.</p>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-gray-500 hover:bg-emerald-50 hover:border-emerald-500 transition cursor-pointer"
                >
                  <ImageIcon size={48} className="text-gray-400 mb-4" />
                  <p className="font-semibold text-gray-700">Click entirely to upload images</p>
                  <p className="text-xs mt-1">Accepts PNG, JPG, JPEG</p>
                  <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                    {photos.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-gray-200">
                        <img src={src} alt="Upload" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <button type="button" onClick={() => removePhoto(i)} className="bg-white text-red-600 p-2 rounded-full hover:scale-110 transition">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Terms Tab */}
            {activeTab === 'terms' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Terms & Conditions *</h3>
                  <p className="text-sm text-gray-500">Include your cancellation policy, health requirements, etc.</p>
                </div>
                {validationErrors.terms && <p className="text-red-500 text-sm">{validationErrors.terms}</p>}

                <div className="space-y-3">
                  {termsAndConditions.map((term, idx) => (
                    <div key={term.id} className="flex gap-2">
                      <input type="text" placeholder={`Rule or Policy ${idx + 1}`} value={term.text}
                        onChange={(e) => {
                          const newTerms = [...termsAndConditions];
                          newTerms[idx].text = e.target.value;
                          setTermsAndConditions(newTerms);
                        }}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                      />
                      {termsAndConditions.length > 1 && (
                        <button type="button" onClick={() => setTermsAndConditions(termsAndConditions.filter(t => t.id !== term.id))} className="px-4 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setTermsAndConditions([...termsAndConditions, { id: Date.now(), text: '' }])} className="text-emerald-600 text-sm font-semibold flex items-center gap-1 hover:bg-emerald-50 px-3 py-1.5 rounded-lg w-fit mt-2">
                    <Plus size={16} /> Add another term
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 flex flex-col items-center justify-center z-50 text-center min-w-[300px]">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4"><PartyPopper size={32} /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Trek Published!</h3>
            <p className="text-gray-500">Redirecting to packages...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}