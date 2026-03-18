'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, X, Plus, Trash2, Calendar, MapPin, Check,
  FileText, Tent, Camera, Image as ImageIcon, ChevronDown,
  AlertCircle, Navigation,
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

/* ─── Custom Select Component ────────────────────────────── */
const CustomSelect = ({ value, onChange, options, placeholder, disabled = false, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-white text-left transition-all text-sm
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200' : 'cursor-pointer hover:border-emerald-400'}
          ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200'}`}
      >
        <span className={selected ? 'text-gray-800 font-medium' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1.5 bg-white border border-gray-100 rounded-xl shadow-xl max-h-56 overflow-y-auto"
          >
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors
                  ${value === opt.value
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check size={14} className="text-emerald-600 shrink-0" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────── */
export default function NewTrekPackage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('package-info');
  const [validationErrors, setValidationErrors] = useState({});

  /* ── State ──────────────────────────────── */
  const [packageInfo, setPackageInfo] = useState({
    name: '',
    category: 'trek',
    packageType: 'individual',
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

  // Free-form inclusives & exclusives
  const [inclusivesList, setInclusivesList] = useState([{ id: 1, text: '' }]);
  const [exclusivesList, setExclusivesList] = useState([{ id: 1, text: '' }]);

  // Additional points
  const [additionalPoints, setAdditionalPoints] = useState([{ id: 1, text: '' }]);

  const [itinerary, setItinerary] = useState(
    Array.from({ length: 3 }, (_, i) => ({ day: i + 1, sections: [''] }))
  );

  const [photos, setPhotos] = useState([]);
  const fileInputRef = useRef(null);

  const [termsAndConditions, setTermsAndConditions] = useState([{ id: 1, text: '' }]);

  /* ── Tabs ───────────────────────────────── */
  const tabs = [
    { id: 'package-info', name: 'Trek Info', icon: <MapPin size={16} /> },
    { id: 'inclusives', name: 'Inclusions & Exclusions', icon: <Check size={16} /> },
    { id: 'itinerary', name: 'Itinerary', icon: <Calendar size={16} /> },
    { id: 'photographs', name: 'Photographs', icon: <Camera size={16} /> },
    { id: 'terms', name: 'Terms & Conditions', icon: <FileText size={16} /> },
  ];

  /* ── Itinerary day sync ─────────────────── */
  useEffect(() => {
    const n = parseInt(packageInfo.days) || 1;
    if (n === itinerary.length) return;
    if (n > itinerary.length) {
      const extra = Array.from({ length: n - itinerary.length }, (_, i) => ({
        day: itinerary.length + i + 1, sections: ['']
      }));
      setItinerary(prev => [...prev, ...extra]);
    } else {
      setItinerary(prev => prev.slice(0, n));
    }
  }, [packageInfo.days]);

  /* ── Photo upload ───────────────────────── */
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (photos.length + files.length > 5) { alert('Max 5 photos allowed.'); return; }
    if (files.some(f => f.size > 5 * 1024 * 1024)) { alert('Each file must be ≤ 5 MB.'); return; }
    Promise.all(files.map(f => new Promise(res => {
      const r = new FileReader(); r.onload = e => res(e.target.result); r.readAsDataURL(f);
    }))).then(imgs => setPhotos(prev => [...prev, ...imgs].slice(0, 5)));
  };

  /* ── Validation ─────────────────────────── */
  const validateForm = () => {
    const errors = {};
    if (!packageInfo.name.trim()) errors.packageName = 'Package name is required';
    if (!packageInfo.destination) errors.destination = 'Destination is required';
    if (!packageInfo.trekName) errors.trekName = 'Trek selection is required';
    if (packageInfo.trekName === 'Other' && !packageInfo.customTrekName.trim())
      errors.customTrekName = 'Please specify the trek name';
    if (!packageInfo.trekLevel) errors.trekLevel = 'Trek difficulty level is required';
    const hasValidPrice = pricingTiers.some(t => t.price && parseFloat(t.price) > 0);
    if (!hasValidPrice) errors.price = 'At least one pricing tier with a valid price is required';
    itinerary.forEach((day, i) => {
      if (!day.sections.some(s => s.trim())) errors[`itinerary_day_${i}`] = `Day ${day.day} needs at least one section`;
    });
    const validTerms = termsAndConditions.filter(t => t.text.trim());
    if (!validTerms.length) errors.terms = 'At least one term or condition is required';
    setValidationErrors(errors);
    return errors;
  };

  /* ── Submit ─────────────────────────────── */
  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      if (['packageName', 'destination', 'trekName', 'customTrekName', 'trekLevel', 'price'].includes(firstKey)) setActiveTab('package-info');
      else if (firstKey.startsWith('itinerary')) setActiveTab('itinerary');
      else if (firstKey === 'terms') setActiveTab('terms');
      return;
    }
    setIsSubmitting(true);
    try {
      const finalTrekName = packageInfo.trekName === 'Other' ? packageInfo.customTrekName : packageInfo.trekName;
      const formattedItinerary = itinerary.map(day => ({
        day: day.day,
        agenda: day.sections.filter(s => s.trim()).join(' | '),
        location: '', travelFrom: '', travelTo: '', pickupTime: '', hotelName: '',
        activities: [],
        highlights: day.sections.filter(s => s.trim()),
        isCompleted: true
      }));
      const formData = {
        packageInfo: {
          name: packageInfo.name,
          category: 'trek',
          packageType: packageInfo.packageType,
          destination: packageInfo.destination,
          days: parseInt(packageInfo.days) || 1,
          trekName: finalTrekName,
          trekLevel: packageInfo.trekLevel
        },
        pricingTiers: pricingTiers
          .filter(t => t.price && parseFloat(t.price) > 0)
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
        exclusivesList: exclusivesList.filter(i => i.text.trim()),
        additionalPoints: additionalPoints.filter(i => i.text.trim()),
        activities: [],
        itinerary: formattedItinerary,
        termsAndConditions: termsAndConditions.filter(t => t.text.trim()),
        photos
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
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Tab has errors? ────────────────────── */
  const tabHasError = (tabId) => {
    const keys = Object.keys(validationErrors);
    if (tabId === 'package-info') return keys.some(k => ['packageName','destination','trekName','customTrekName','trekLevel','price'].includes(k));
    if (tabId === 'itinerary') return keys.some(k => k.startsWith('itinerary'));
    if (tabId === 'terms') return keys.includes('terms');
    return false;
  };

  /* ── Inline error message ───────────────── */
  const ErrorMsg = ({ field }) => validationErrors[field]
    ? <p className="mt-1.5 text-[12px] text-rose-600 flex items-center gap-1"><AlertCircle size={11} />{validationErrors[field]}</p>
    : null;

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className="w-full space-y-6 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/serviceprovider/dashboard/settings/packages')}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Tent size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-[18px] font-black text-gray-900 tracking-tight leading-none mb-1">Create Trek Package</h1>
              <p className="text-[12px] text-gray-400 font-medium">Design your trekking adventure package</p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
          <span>Publish Trek</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* Sidebar Tabs */}
        <div className="w-full lg:w-60 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 lg:sticky lg:top-5">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 no-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-[12px] font-bold rounded-xl whitespace-nowrap transition-all flex-shrink-0
                    ${activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600 border border-transparent'}`}
                >
                  <span className={activeTab === tab.id ? 'text-emerald-500' : 'text-gray-300'}>{tab.icon}</span>
                  <span className="truncate">{tab.name}</span>
                  {tabHasError(tab.id) && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7">

            {/* ── 1. Trek Info ───────────────────────────────── */}
            {activeTab === 'package-info' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[16px] font-black text-gray-900 mb-0.5">Trek Information</h2>
                  <p className="text-[12px] text-gray-400">Fill in the core details of your trek</p>
                </div>

                {/* Package Name */}
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Package Name *</label>
                  <input
                    type="text"
                    value={packageInfo.name}
                    onChange={e => setPackageInfo({ ...packageInfo, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    placeholder="E.g., Hampta Pass Epic Journey"
                  />
                  <ErrorMsg field="packageName" />
                </div>

                {/* Destination + Trek Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Destination *</label>
                    <CustomSelect
                      value={packageInfo.destination}
                      onChange={val => setPackageInfo({ ...packageInfo, destination: val, trekName: '', customTrekName: '' })}
                      options={destinations.map(d => ({ value: d.name, label: d.name }))}
                      placeholder="Select destination"
                      error={!!validationErrors.destination}
                    />
                    <ErrorMsg field="destination" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Trek Name *</label>
                    <CustomSelect
                      value={packageInfo.trekName}
                      onChange={val => setPackageInfo({ ...packageInfo, trekName: val })}
                      options={(trekOptionsMap[packageInfo.destination] || trekOptionsMap['default']).map(t => ({ value: t, label: t }))}
                      placeholder={packageInfo.destination ? 'Select trek' : 'Select destination first'}
                      disabled={!packageInfo.destination}
                      error={!!validationErrors.trekName}
                    />
                    <ErrorMsg field="trekName" />
                  </div>
                </div>

                {/* Custom Trek Name */}
                {packageInfo.trekName === 'Other' && (
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Custom Trek Name *</label>
                    <input
                      type="text"
                      value={packageInfo.customTrekName}
                      onChange={e => setPackageInfo({ ...packageInfo, customTrekName: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="Enter the trek name"
                    />
                    <ErrorMsg field="customTrekName" />
                  </div>
                )}

                {/* Days + Trek Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Number of Days *</label>
                    <input
                      type="number"
                      value={packageInfo.days}
                      onChange={e => {
                        const v = e.target.value;
                        if (v === '') { setPackageInfo({ ...packageInfo, days: '' }); return; }
                        const n = parseInt(v);
                        if (!isNaN(n)) setPackageInfo({ ...packageInfo, days: Math.max(1, n) });
                      }}
                      onBlur={() => { if (!packageInfo.days) setPackageInfo({ ...packageInfo, days: 1 }); }}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Trek Difficulty Level *</label>
                    <CustomSelect
                      value={packageInfo.trekLevel}
                      onChange={val => setPackageInfo({ ...packageInfo, trekLevel: val })}
                      options={[
                        { value: 'easy', label: 'Easy' },
                        { value: 'moderate', label: 'Moderate' },
                        { value: 'difficult', label: 'Difficult' }
                      ]}
                      placeholder="Select level"
                      error={!!validationErrors.trekLevel}
                    />
                    <ErrorMsg field="trekLevel" />
                  </div>
                </div>

                {/* Pickup & Drop */}
                <div className="bg-emerald-50/40 p-5 rounded-xl border border-emerald-100">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-[13px] font-bold text-gray-800">Pickup & Drop Off Locations</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">Add cities and pickup points for your trekkers</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPickupDropCities([...pickupDropCities, { id: Date.now(), cityName: '', locations: [{ id: Date.now(), name: '', mapLink: '' }] }])}
                      className="text-[12px] bg-white text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-emerald-50 transition-all"
                    >
                      <Plus size={14} /> Add City
                    </button>
                  </div>
                  <div className="space-y-3">
                    {pickupDropCities.map((city, cIdx) => (
                      <div key={city.id} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3 gap-3">
                          <input
                            type="text"
                            placeholder="City Name (e.g., Delhi)"
                            value={city.cityName}
                            onChange={e => {
                              const c = [...pickupDropCities]; c[cIdx].cityName = e.target.value; setPickupDropCities(c);
                            }}
                            className="flex-1 font-semibold text-sm text-gray-800 bg-transparent border-b border-gray-200 outline-none py-1 px-1 focus:border-emerald-500 transition-all"
                          />
                          {pickupDropCities.length > 1 && (
                            <button type="button" onClick={() => setPickupDropCities(pickupDropCities.filter(c => c.id !== city.id))} className="text-gray-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                        <div className="space-y-2.5 pl-3 border-l-2 border-emerald-50 ml-1">
                          {city.locations.map((loc, lIdx) => (
                            <div key={loc.id} className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                              <input type="text" placeholder="Location Name (e.g., Airport)" value={loc.name}
                                onChange={e => { const c = [...pickupDropCities]; c[cIdx].locations[lIdx].name = e.target.value; setPickupDropCities(c); }}
                                className="w-full sm:flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-all" />
                              <input type="text" placeholder="Maps Link (Optional)" value={loc.mapLink}
                                onChange={e => { const c = [...pickupDropCities]; c[cIdx].locations[lIdx].mapLink = e.target.value; setPickupDropCities(c); }}
                                className="w-full sm:flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500 transition-all" />
                              {city.locations.length > 1 && (
                                <button type="button" onClick={() => {
                                  const c = [...pickupDropCities]; c[cIdx].locations = c[cIdx].locations.filter(l => l.id !== loc.id); setPickupDropCities(c);
                                }} className="text-rose-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg shrink-0">
                                  <X size={15} />
                                </button>
                              )}
                            </div>
                          ))}
                          <button type="button" onClick={() => {
                            const c = [...pickupDropCities]; c[cIdx].locations.push({ id: Date.now(), name: '', mapLink: '' }); setPickupDropCities(c);
                          }} className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1 mt-1 hover:bg-emerald-50 px-2 py-1 rounded-lg">
                            <Plus size={12} /> Add Location
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-emerald-50/40 p-5 rounded-xl border border-emerald-100">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-[13px] font-bold text-gray-800">Pricing Ranges *</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">Set prices per person based on group size</p>
                    </div>
                    <button type="button"
                      onClick={() => {
                        const last = pricingTiers[pricingTiers.length - 1];
                        const nextMin = last ? parseInt(last.maxPeople) + 1 : 1;
                        setPricingTiers([...pricingTiers, { id: Date.now(), minPeople: nextMin, maxPeople: nextMin + 2, price: '', discount: '' }]);
                      }}
                      className="text-[12px] bg-white text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-emerald-50 transition-all"
                    >
                      <Plus size={14} /> Add Range
                    </button>
                  </div>
                  {validationErrors.price && (
                    <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-[12px] text-rose-600">
                      <AlertCircle size={13} /> {validationErrors.price}
                    </div>
                  )}
                  <div className="space-y-2.5">
                    {pricingTiers.map((tier, idx) => (
                      <div key={tier.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                        <div className="flex items-center gap-2 shrink-0">
                          <input type="number" value={tier.minPeople} onChange={e => { const t = [...pricingTiers]; t[idx].minPeople = e.target.value; setPricingTiers(t); }}
                            className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:border-emerald-500" />
                          <span className="text-gray-400 text-sm">–</span>
                          <input type="number" value={tier.maxPeople} onChange={e => { const t = [...pricingTiers]; t[idx].maxPeople = e.target.value; setPricingTiers(t); }}
                            className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:border-emerald-500" />
                          <span className="text-[11px] text-gray-500">pax</span>
                        </div>
                        <div className="relative flex-1 min-w-[120px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                          <input type="number" placeholder="Price" value={tier.price}
                            onChange={e => { const t = [...pricingTiers]; t[idx].price = e.target.value; setPricingTiers(t); }}
                            className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500" />
                        </div>
                        <div className="relative w-24 shrink-0">
                          <input type="number" placeholder="Disc%" value={tier.discount}
                            onChange={e => { const t = [...pricingTiers]; t[idx].discount = e.target.value; setPricingTiers(t); }}
                            className="w-full border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 text-sm focus:outline-none focus:border-emerald-500" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                        </div>
                        {pricingTiers.length > 1 && (
                          <button type="button" onClick={() => setPricingTiers(pricingTiers.filter(t => t.id !== tier.id))}
                            className="text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition-all shrink-0">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. Inclusions & Exclusions ─────────────────── */}
            {activeTab === 'inclusives' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-[16px] font-black text-gray-900 mb-0.5">Inclusions & Exclusions</h2>
                  <p className="text-[12px] text-gray-400">Specify what's included and what is not in your trek package</p>
                </div>

                {/* What's Included */}
                <div className="bg-white rounded-xl border border-emerald-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Check size={14} className="text-emerald-600" />
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-800">What's Included</h3>
                  </div>
                  <div className="space-y-2.5">
                    {inclusivesList.map((item, idx) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <input
                          type="text"
                          value={item.text}
                          onChange={e => setInclusivesList(inclusivesList.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                          placeholder="e.g. Tent and sleeping bag, meals during trek, experienced guide..."
                        />
                        {inclusivesList.length > 1 && (
                          <button type="button" onClick={() => setInclusivesList(inclusivesList.filter(i => i.id !== item.id))}
                            className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <button type="button"
                    onClick={() => setInclusivesList([...inclusivesList, { id: Date.now(), text: '' }])}
                    className="mt-3 flex items-center gap-1.5 text-[12px] text-emerald-600 font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all">
                    <Plus size={14} /> Add Inclusion
                  </button>
                </div>

                {/* What's Excluded */}
                <div className="bg-white rounded-xl border border-rose-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
                      <X size={14} className="text-rose-600" />
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-800">What's Excluded</h3>
                  </div>
                  <div className="space-y-2.5">
                    {exclusivesList.map((item, idx) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                        <input
                          type="text"
                          value={item.text}
                          onChange={e => setExclusivesList(exclusivesList.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
                          placeholder="e.g. Personal insurance, travel to base camp, medical expenses..."
                        />
                        {exclusivesList.length > 1 && (
                          <button type="button" onClick={() => setExclusivesList(exclusivesList.filter(i => i.id !== item.id))}
                            className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <button type="button"
                    onClick={() => setExclusivesList([...exclusivesList, { id: Date.now(), text: '' }])}
                    className="mt-3 flex items-center gap-1.5 text-[12px] text-rose-600 font-semibold bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all">
                    <Plus size={14} /> Add Exclusion
                  </button>
                </div>

                {/* Additional Points */}
                <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Navigation size={14} className="text-amber-600" />
                    </div>
                    <h3 className="text-[14px] font-bold text-gray-800">Additional Points</h3>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-4 ml-9">Add any other important notes, tips, or conditions for trekkers</p>
                  <div className="space-y-2.5">
                    {additionalPoints.map((item) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <input
                          type="text"
                          value={item.text}
                          onChange={e => setAdditionalPoints(additionalPoints.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))}
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
                          placeholder="e.g. Trekkers must be physically fit, minimum age 16 years..."
                        />
                        {additionalPoints.length > 1 && (
                          <button type="button" onClick={() => setAdditionalPoints(additionalPoints.filter(i => i.id !== item.id))}
                            className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <button type="button"
                    onClick={() => setAdditionalPoints([...additionalPoints, { id: Date.now(), text: '' }])}
                    className="mt-3 flex items-center gap-1.5 text-[12px] text-amber-600 font-semibold bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-all">
                    <Plus size={14} /> Add Point
                  </button>
                </div>
              </div>
            )}

            {/* ── 3. Itinerary ───────────────────────────────── */}
            {activeTab === 'itinerary' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-[16px] font-black text-gray-900 mb-0.5">Trek Itinerary</h2>
                  <p className="text-[12px] text-gray-400">Describe the schedule for each day of the {packageInfo.days || 1}-day trek</p>
                </div>
                {itinerary.map((day, dIdx) => (
                  <div key={day.day} className="border border-gray-100 bg-white shadow-sm rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold w-9 h-9 rounded-xl flex items-center justify-center text-[13px] shrink-0">
                        D{day.day}
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-gray-800">Day {day.day}</h4>
                        <p className="text-[11px] text-gray-400">Add sections describing this day's plan</p>
                      </div>
                    </div>
                    {validationErrors[`itinerary_day_${dIdx}`] && (
                      <div className="mb-3 p-2.5 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-[12px] text-rose-600">
                        <AlertCircle size={13} /> {validationErrors[`itinerary_day_${dIdx}`]}
                      </div>
                    )}
                    <div className="space-y-2.5 pl-12">
                      {day.sections.map((section, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold mt-2.5 text-[12px] shrink-0">{sIdx + 1}.</span>
                          <textarea
                            rows={2}
                            value={section}
                            placeholder="Describe this section of the day..."
                            onChange={e => {
                              const it = [...itinerary]; it[dIdx].sections[sIdx] = e.target.value; setItinerary(it);
                            }}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                          />
                          {day.sections.length > 1 && (
                            <button type="button" onClick={() => {
                              const it = [...itinerary]; it[dIdx].sections = it[dIdx].sections.filter((_, i) => i !== sIdx); setItinerary(it);
                            }} className="mt-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => {
                        const it = [...itinerary]; it[dIdx].sections.push(''); setItinerary(it);
                      }} className="text-emerald-600 text-[12px] font-semibold flex items-center gap-1 mt-1 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all">
                        <Plus size={13} /> Add section
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── 4. Photographs ─────────────────────────────── */}
            {activeTab === 'photographs' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[16px] font-black text-gray-900 mb-0.5">Trek Photographs</h2>
                  <p className="text-[12px] text-gray-400">Upload up to 5 scenic pictures · Max 5 MB each</p>
                </div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center text-gray-500 hover:bg-emerald-50/50 hover:border-emerald-400 transition-all cursor-pointer"
                >
                  <ImageIcon size={44} className="text-gray-300 mb-3" />
                  <p className="font-semibold text-gray-600 text-sm">Click to upload images</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG accepted</p>
                  <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
                </div>
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {photos.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-gray-100">
                        <img src={src} alt="Upload" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <button type="button" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                            className="bg-white text-rose-500 p-2 rounded-full hover:scale-110 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 5. Terms & Conditions ──────────────────────── */}
            {activeTab === 'terms' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-[16px] font-black text-gray-900 mb-0.5">Terms & Conditions *</h2>
                  <p className="text-[12px] text-gray-400">Include cancellation policy, health requirements, etc.</p>
                </div>
                {validationErrors.terms && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-[12px] text-rose-600">
                    <AlertCircle size={13} /> {validationErrors.terms}
                  </div>
                )}
                <div className="space-y-2.5">
                  {termsAndConditions.map((term, idx) => (
                    <div key={term.id} className="flex gap-2.5 items-center">
                      <span className="text-[12px] font-bold text-gray-400 shrink-0 w-5 text-right">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder={`Rule or Policy ${idx + 1}`}
                        value={term.text}
                        onChange={e => {
                          const t = [...termsAndConditions]; t[idx].text = e.target.value; setTermsAndConditions(t);
                        }}
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                      />
                      {termsAndConditions.length > 1 && (
                        <button type="button" onClick={() => setTermsAndConditions(termsAndConditions.filter(t => t.id !== term.id))}
                          className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all shrink-0">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button"
                    onClick={() => setTermsAndConditions([...termsAndConditions, { id: Date.now(), text: '' }])}
                    className="mt-2 flex items-center gap-1.5 text-[12px] text-emerald-600 font-semibold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all">
                    <Plus size={14} /> Add term
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── Success Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative bg-white rounded-[24px] sm:rounded-[32px] shadow-2xl p-6 sm:p-10 flex flex-col items-center text-center max-w-[calc(100%-2rem)] sm:max-w-sm w-full mx-4 border border-gray-100"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 rounded-t-[32px]" />
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.2, duration: 0.5 }}
                className="w-20 h-20 bg-emerald-50 rounded-[24px] flex items-center justify-center mb-6"
              >
                <Check size={40} className="text-emerald-600" strokeWidth={3} />
              </motion.div>
              <h2 className="text-[22px] font-black text-gray-900 mb-2">Trek Published! 🎉</h2>
              <p className="text-[13px] text-gray-400 font-medium leading-relaxed">Your trekking adventure is now live and ready for bookings.</p>
              <div className="mt-6 flex gap-1.5 justify-center">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                    animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ delay: 0.6 + i * 0.15, repeat: Infinity, duration: 0.6 }} />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}