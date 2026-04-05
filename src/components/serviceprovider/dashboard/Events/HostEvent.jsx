'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Image,
  Tag,
  Globe,
  Plus,
  Trash2,
  Upload,
  Star,
  CheckCircle,
  Map,
  Route,
  DollarSign,
  Check,
  PlayCircle,
  XCircle,
  Sparkles,
  Camera
} from 'lucide-react';

// ── Sub-components defined at module level to prevent re-creation on every render ──

function SectionHeader({ title, description, icon: Icon, number }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg flex-shrink-0">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs sm:text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
            Step {number + 1}
          </span>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900">{title}</h2>
        </div>
        <p className="text-neutral-500 mt-1 text-sm">{description}</p>
      </div>
    </div>
  );
}

function InputField({ label, name, type = 'text', value, onChange, required = false, error, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500 focus:ring-red-200' : 'border-neutral-200 focus:ring-emerald-500'} focus:ring-2 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-sm`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required = false, error }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2 relative" onBlur={(e) => {
      // Small timeout to allow CLICK on option to register before closing
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setTimeout(() => setIsOpen(false), 200);
      }
    }}>
      <label className="block text-sm font-semibold text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500 focus:ring-red-200' : 'border-neutral-200 focus:ring-emerald-500'} focus:ring-2 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-sm text-left flex items-center justify-between`}
        >
          <span className={value ? 'text-neutral-900' : 'text-neutral-400'}>
            {value || `Select ${label}`}
          </span>
          <PlayCircle className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-[60] w-full mt-2 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 max-h-48 sm:max-h-60 overflow-y-auto"
            >
              {options.map(option => (
                <button
                  key={option}
                  type="button"
                  onMouseDown={() => {
                    // onMouseDown fires before onBlur
                    onChange({ target: { name, value: option } });
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${value === option
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                >
                  {option}
                  {value === option && <Check className="w-4 h-4" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
    </div>
  );
}

function CounterInput({ label, value, onChange, min = 1, max = 100 }) {
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(min);
      return;
    }
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) {
      onChange(Math.max(min, Math.min(max, numValue)));
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-neutral-700">{label}</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={`w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center transition-colors ${value <= min
            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            : 'hover:bg-neutral-50'
            }`}
        >
          <span className="text-lg font-semibold">-</span>
        </button>
        <input
          type="number"
          value={value.toString()}
          onChange={handleInputChange}
          min={min}
          max={max}
          className="w-20 px-3 py-2 text-center rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={`w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center transition-colors ${value >= max
            ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            : 'hover:bg-neutral-50'
            }`}
        >
          <span className="text-lg font-semibold">+</span>
        </button>
        <span className="text-sm text-neutral-500 ml-2">days</span>
      </div>
    </div>
  );
}

function NumberInput({ label, name, value, onChange, min = 1, max = 1000, required = false }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-sm"
      />
    </div>
  );
}

function SlotInput({ label, slots, onAdd, onRemove, onChange, placeholder, required = false, icon: Icon }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-neutral-700 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add More</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
      <div className="space-y-3">
        {slots.map((slot, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3">
            <input
              type="text"
              value={slot}
              onChange={(e) => onChange(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
              required={required && index === 0}
            />
            {slots.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-2.5 sm:p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NumberedSlotInput({ label, slots, onAdd, onRemove, onChange, placeholder, required = false }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-neutral-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add More</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
      <div className="space-y-3">
        {slots.map((slot, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3">
            <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full text-xs flex items-center justify-center font-semibold flex-shrink-0">
              {index + 1}
            </span>
            <input
              type="text"
              value={slot}
              onChange={(e) => onChange(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
              required={required}
            />
            {slots.length > 3 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-2.5 sm:p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ──

export default function HostEventPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [stepErrors, setStepErrors] = useState({});
  const [publishMode, setPublishMode] = useState('publish');
  const [formData, setFormData] = useState({
    title: '',
    eventType: '',
    customEventType: '',
    location: '',
    date: '',
    duration: 1,
    totalSlots: 20,
    pricePerSlot: '',
    destination: '',
    destinationLink: '',
    about: '',
    highlights: [''],
    whatsIncluded: [''],
    whatsExcluded: [''],
    faqs: [
      { question: '', answer: '' },
      { question: '', answer: '' },
      { question: '', answer: '' }
    ],
    whatToBring: [''],
    restrictions: [''],
    pickupPoints: [{ location: '', link: '', time: '' }],
    itinerary: ['', '', ''],
    photographs: [],
    poster: null
  });

  const eventTypes = [
    'Adventure Tour',
    'Cultural Experience',
    'Food & Dining',
    'Wellness Retreat',
    'Photography Workshop',
    'Music Festival',
    'Art Exhibition',
    'Sports Event',
    'Educational Workshop',
    'Networking Event',
    'Others'
  ];

  const destinations = [
    'Kashmir',
    'Uttarakhand',
    'Himachal Pradesh',
    'Ladakh',
    'Sikkim',
    'Arunachal Pradesh',
    'Meghalaya',
    'Assam',
    'Goa',
    'Rajasthan',
    'Kerala',
    'Andaman & Nicobar',
    'Madhya Pradesh',
    'Tamil Nadu',
    'Maharashtra'
  ];

  const sectionTitles = [
    'Basic Information',
    'Event Details',
    'Highlights & Inclusions',
    'FAQs',
    'Requirements',
    'Itinerary',
    'Photographs',
    'Poster & Finalize'
  ];

  // ── Per-step validation ──
  const validateStep = (step) => {
    const errors = {};
    if (step === 0) {
      if (!formData.title.trim()) errors.title = 'Event title is required';
      if (!formData.eventType) errors.eventType = 'Select an event type';
      if (formData.eventType === 'Others' && !formData.customEventType.trim()) {
        errors.customEventType = 'Please name your event type';
      }
      if (!formData.location) errors.location = 'Select a destination';
      if (!formData.date) errors.date = 'Pick a date';
      if (!formData.pricePerSlot && formData.pricePerSlot !== 0) errors.pricePerSlot = 'Enter a price';
      if (!formData.destination.trim()) errors.destination = 'Enter a location';
    }
    if (step === 1) {
      if (!formData.about.trim()) errors.about = 'Event description is required';
    }
    if (step === 2) {
      const validHighlights = formData.highlights.filter(h => h.trim());
      if (validHighlights.length === 0) errors.highlights = 'At least one highlight is required';
      const validInclusions = formData.whatsIncluded.filter(w => w.trim());
      if (validInclusions.length === 0) errors.whatsIncluded = 'At least one inclusion is required';
    }
    if (step === 3) {
      const validFaqs = formData.faqs.filter(f => f.question.trim() && f.answer.trim());
      if (validFaqs.length === 0) errors.faqs = 'At least one complete FAQ is required';
    }
    if (step === 4) {
      const validWtb = formData.whatToBring.filter(w => w.trim());
      if (validWtb.length === 0) errors.whatToBring = 'At least one item to bring is required';
    }
    if (step === 5) {
      const validPickup = formData.pickupPoints.filter(p => p.location.trim() && p.time.trim());
      if (validPickup.length === 0) errors.pickupPoints = 'At least one pickup point is required';
      const validItinerary = formData.itinerary.filter(s => s.trim());
      if (validItinerary.length === 0) errors.itinerary = 'At least one itinerary step is required';
    }
    // Step 6 (Photographs) — optional, no validation
    if (step === 7) {
      if (!acceptedTerms) errors.terms = 'You must accept the terms';
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'poster') {
      setFormData(prev => ({ ...prev, poster: files[0] }));
    } else if (name === 'totalSlots' || name === 'pricePerSlot') {
      const numValue = value === '' ? '' : parseInt(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? '' : numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear errors for this field
    if (stepErrors[name]) {
      setStepErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleArrayField = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
    if (stepErrors[field]) {
      setStepErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFAQChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => i === index ? { ...faq, [field]: value } : faq)
    }));
    if (stepErrors.faqs) {
      setStepErrors(prev => { const n = { ...prev }; delete n.faqs; return n; });
    }
  };

  const addFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const handlePickupPointChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      pickupPoints: prev.pickupPoints.map((point, i) =>
        i === index ? { ...point, [field]: value } : point
      )
    }));
    if (stepErrors.pickupPoints) {
      setStepErrors(prev => { const n = { ...prev }; delete n.pickupPoints; return n; });
    }
  };

  const addPickupPoint = () => {
    setFormData(prev => ({
      ...prev,
      pickupPoints: [...prev.pickupPoints, { location: '', link: '', time: '' }]
    }));
  };

  const removePickupPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      pickupPoints: prev.pickupPoints.filter((_, i) => i !== index)
    }));
  };

  const nextSection = () => {
    if (validateStep(activeSection)) {
      setActiveSection(prev => Math.min(prev + 1, sectionTitles.length - 1));
    }
  };

  const prevSection = () => {
    setStepErrors({});
    setActiveSection(prev => Math.max(prev - 1, 0));
  };

  const handlePhotographUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.photographs.length + files.length > 10) {
      alert('You can upload a maximum of 10 photographs.');
      return;
    }
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max 5MB per image.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photographs: [...prev.photographs, reader.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhotograph = (index) => {
    setFormData(prev => ({ ...prev, photographs: prev.photographs.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(7)) return;
    setSubmitting(true);
    setApiError('');

    try {
      // Convert poster to base64 if it exists
      let posterData = '';
      if (formData.poster && formData.poster instanceof File) {
        posterData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(formData.poster);
        });
      }

      const res = await fetch('/api/provider/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          eventType: formData.eventType === 'Others' ? formData.customEventType : formData.eventType,
          location: formData.location,
          date: formData.date,
          duration: formData.duration,
          totalSlots: formData.totalSlots,
          pricePerSlot: formData.pricePerSlot,
          destination: formData.destination,
          destinationLink: formData.destinationLink,
          about: formData.about,
          status: publishMode === 'draft' ? 'draft' : 'published',
          highlights: formData.highlights.filter(h => h.trim()),
          whatsIncluded: formData.whatsIncluded.filter(w => w.trim()),
          whatsExcluded: formData.whatsExcluded.filter(w => w.trim()),
          faqs: formData.faqs.filter(f => f.question.trim() && f.answer.trim()),
          whatToBring: formData.whatToBring.filter(w => w.trim()),
          restrictions: formData.restrictions.filter(r => r.trim()),
          pickupPoints: formData.pickupPoints.filter(p => p.location.trim()),
          itinerary: formData.itinerary.filter(s => s.trim()),
          photographs: formData.photographs,
          poster: posterData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsPublished(true);
      } else {
        setApiError(data.message || 'Failed to publish event. Please try again.');
      }
    } catch (err) {
      console.error('Publish error:', err);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isPublished) {
    const isDraft = publishMode === 'draft';
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-emerald-50/30 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 sm:p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDraft ? 'bg-blue-100' : 'bg-emerald-100'}`}
            >
              <Check className={`w-10 h-10 ${isDraft ? 'text-blue-600' : 'text-emerald-600'}`} />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4"
            >
              {isDraft ? 'Event Saved Successfully!' : 'Event Published Successfully!'}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-neutral-600 mb-4 text-base sm:text-lg"
            >
              {isDraft
                ? `Your event "${formData.title}" has been saved as a draft.`
                : `Your event "${formData.title}" is now live and visible to guests.`
              }
            </motion.p>

            {isDraft && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium mb-8 border border-blue-200"
              >
                <Clock className="w-4 h-4" />
                You can find this event under <span className="font-bold">Upcoming Events</span> in your dashboard
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-6"
            >
              <button
                onClick={() => router.push('/serviceprovider/dashboard/events')}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isDraft ? 'View in Upcoming Events' : 'Manage Events'}
              </button>
              <button
                onClick={() => {
                  setIsPublished(false);
                  setPublishMode('publish');
                  setFormData({
                    title: '', eventType: '', location: '', date: '', duration: 1,
                    totalSlots: 20, pricePerSlot: '', destination: '', destinationLink: '',
                    about: '', highlights: [''], whatsIncluded: [''], whatsExcluded: [''],
                    faqs: [{ question: '', answer: '' }, { question: '', answer: '' }, { question: '', answer: '' }],
                    whatToBring: [''], restrictions: [''],
                    pickupPoints: [{ location: '', link: '', time: '' }],
                    itinerary: ['', '', ''], photographs: [], poster: null
                  });
                  setActiveSection(0);
                  setAcceptedTerms(false);
                }}
                className="px-8 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all duration-200"
              >
                Create Another Event
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-emerald-50/30 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 -mt-6 sm:-mt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <button
            onClick={() => router.back()}
            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-neutral-200 hover:bg-white hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 truncate">
                Host New Event
              </h1>
            </div>
            <p className="text-neutral-500 mt-1 text-sm sm:text-base">Create an unforgettable experience for your guests</p>
          </div>
        </motion.div>

        {/* Progress Bar - Visible on all screens */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 sm:mb-12"
        >
          {/* Desktop Progress Steps */}
          <div className="hidden lg:flex items-center justify-between mb-4">
            {sectionTitles.map((title, index) => (
              <button
                key={index}
                onClick={() => setActiveSection(index)}
                className={`flex flex-col items-center flex-1 ${index < sectionTitles.length - 1 ? 'mr-4' : ''}`}
              >
                <div className={`w-3 h-3 rounded-full mb-2 transition-all duration-300 ${index <= activeSection
                  ? 'bg-emerald-500 scale-125'
                  : 'bg-neutral-300'
                  }`} />
                <span className={`text-xs font-medium transition-colors ${index <= activeSection ? 'text-emerald-600' : 'text-neutral-400'
                  }`}>
                  {title}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile Progress Info */}
          <div className="lg:hidden flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-emerald-600">
              Step {activeSection + 1} of {sectionTitles.length}
            </span>
            <span className="text-sm text-neutral-500">
              {sectionTitles[activeSection]}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
              initial={{ width: '0%' }}
              animate={{ width: `${((activeSection + 1) / sectionTitles.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Navigation Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sticky top-8">
              <h3 className="font-semibold text-neutral-900 mb-4 text-sm">Event Creation</h3>
              <nav className="space-y-1.5">
                {sectionTitles.map((title, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSection(index)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${index === activeSection
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${index === activeSection ? 'bg-emerald-500' : index < activeSection ? 'bg-emerald-300' : 'bg-neutral-300'
                        }`} />
                      <span className="text-sm font-medium">{title}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-neutral-200"
            >
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 lg:p-8">
                {/* Section 1: Basic Information */}
                {activeSection === 0 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader
                      title="Basic Information"
                      description="Tell us about your event"
                      icon={Tag}
                      number={0}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <InputField
                        label="Event Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        error={stepErrors.title}
                        placeholder="e.g., Himalayan Trekking Adventure"
                      />

                      <SelectField
                        label="Event Type"
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleChange}
                        options={eventTypes}
                        required
                        error={stepErrors.eventType}
                      />

                      {formData.eventType === 'Others' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="sm:col-span-2"
                        >
                          <InputField
                            label="Custom Event Type Name"
                            name="customEventType"
                            value={formData.customEventType}
                            onChange={handleChange}
                            required
                            error={stepErrors.customEventType}
                            placeholder="e.g., Spiritual Retreat"
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <SelectField
                        label="Destination"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        options={destinations}
                        required
                        error={stepErrors.location}
                      />

                      <InputField
                        label="Date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        error={stepErrors.date}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <CounterInput
                        label="Duration"
                        value={formData.duration}
                        onChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                      />

                      <div className="space-y-4 sm:space-y-6">
                        <NumberInput
                          label="Total Slots"
                          name="totalSlots"
                          value={formData.totalSlots}
                          onChange={handleChange}
                          min="1"
                          max="1000"
                          required
                        />
                        <InputField
                          label="Price Per Slot (₹)"
                          name="pricePerSlot"
                          type="number"
                          value={formData.pricePerSlot}
                          onChange={handleChange}
                          required
                          placeholder="Enter price per person"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <InputField
                        label="Location"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Tarsar Marsar Trek"
                      />
                      <InputField
                        label="Destination Link"
                        name="destinationLink"
                        value={formData.destinationLink}
                        onChange={handleChange}
                        required
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                  </div>
                )}

                {/* Section 2: Event Details */}
                {activeSection === 1 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader
                      title="Event Details"
                      description="Describe your event to attract guests"
                      icon={Calendar}
                      number={1}
                    />

                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-neutral-700">
                        About the Event <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
                        placeholder="Describe your event in detail. What makes it special? What can guests expect?"
                      />
                    </div>
                  </div>
                )}

                {/* Section 3: Highlights, Inclusions & Exclusions */}
                {activeSection === 2 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader
                      title="Highlights & Inclusions"
                      description="What makes your event stand out and what's covered"
                      icon={Star}
                      number={2}
                    />

                    <SlotInput
                      label="Highlights"
                      icon={Sparkles}
                      slots={formData.highlights}
                      onAdd={() => addArrayField('highlights')}
                      onRemove={(index) => removeArrayField('highlights', index)}
                      onChange={(index, value) => handleArrayField('highlights', index, value)}
                      placeholder="Enter one highlight per line (e.g., Scenic mountain views)"
                      required
                    />

                    {/* Divider */}
                    <div className="border-t border-neutral-100" />

                    <SlotInput
                      label="What's Included"
                      icon={CheckCircle}
                      slots={formData.whatsIncluded}
                      onAdd={() => addArrayField('whatsIncluded')}
                      onRemove={(index) => removeArrayField('whatsIncluded', index)}
                      onChange={(index, value) => handleArrayField('whatsIncluded', index, value)}
                      placeholder="Enter one item per line (e.g., All meals included)"
                      required
                    />

                    {/* Divider */}
                    <div className="border-t border-neutral-100" />

                    <SlotInput
                      label="What's Excluded"
                      icon={XCircle}
                      slots={formData.whatsExcluded}
                      onAdd={() => addArrayField('whatsExcluded')}
                      onRemove={(index) => removeArrayField('whatsExcluded', index)}
                      onChange={(index, value) => handleArrayField('whatsExcluded', index, value)}
                      placeholder="Enter one item per line (e.g., Personal expenses, Travel insurance)"
                    />
                  </div>
                )}

                {/* Section 4: FAQs */}
                {activeSection === 3 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader
                      title="Frequently Asked Questions"
                      description="Help guests with common questions"
                      icon={CheckCircle}
                      number={3}
                    />

                    <div className="space-y-4 sm:space-y-6">
                      {formData.faqs.map((faq, index) => (
                        <div key={index} className="p-4 sm:p-6 border border-neutral-200 rounded-2xl bg-neutral-50/50">
                          <div className="grid grid-cols-1 gap-4">
                            <InputField
                              label={`Question ${index + 1}`}
                              value={faq.question}
                              onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                              required
                              placeholder="Enter a common question..."
                            />
                            <InputField
                              label="Answer"
                              value={faq.answer}
                              onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                              required
                              placeholder="Provide a clear answer..."
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addFAQ}
                        className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 flex items-center justify-center gap-3"
                      >
                        <Plus className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold text-sm">Add Another FAQ</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Section 5: Requirements */}
                {activeSection === 4 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader
                      title="Requirements & Restrictions"
                      description="What guests should know and bring"
                      icon={Users}
                      number={4}
                    />

                    <SlotInput
                      label="What to Bring"
                      slots={formData.whatToBring}
                      onAdd={() => addArrayField('whatToBring')}
                      onRemove={(index) => removeArrayField('whatToBring', index)}
                      onChange={(index, value) => handleArrayField('whatToBring', index, value)}
                      placeholder="Enter one item per line (e.g., Warm clothing)"
                      required
                    />

                    <div className="border-t border-neutral-100" />

                    <SlotInput
                      label="Restrictions (if any)"
                      slots={formData.restrictions}
                      onAdd={() => addArrayField('restrictions')}
                      onRemove={(index) => removeArrayField('restrictions', index)}
                      onChange={(index, value) => handleArrayField('restrictions', index, value)}
                      placeholder="Enter one restriction per line (e.g., Not suitable for children under 12)"
                    />
                  </div>
                )}

                {/* Section 6: Itinerary */}
                {activeSection === 5 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader
                      title="Event Itinerary"
                      description="Plan the event schedule step by step"
                      icon={Route}
                      number={5}
                    />

                    <div className="space-y-6">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-semibold text-neutral-900 text-sm">Pickup & Drop-off Points</h4>
                        <button
                          type="button"
                          onClick={addPickupPoint}
                          className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add Point
                        </button>
                      </div>

                      {formData.pickupPoints.map((point, index) => (
                        <div key={index} className="p-4 sm:p-6 border border-neutral-200 rounded-2xl bg-neutral-50/50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <InputField
                              label="Location"
                              value={point.location}
                              onChange={(e) => handlePickupPointChange(index, 'location', e.target.value)}
                              placeholder="Pickup point address..."
                              required
                            />
                            <InputField
                              label="Map Link"
                              value={point.link}
                              onChange={(e) => handlePickupPointChange(index, 'link', e.target.value)}
                              placeholder="Google Maps link..."
                              required
                            />
                            <InputField
                              label="Pickup Time"
                              type="time"
                              value={point.time}
                              onChange={(e) => handlePickupPointChange(index, 'time', e.target.value)}
                              required
                            />
                          </div>
                          {formData.pickupPoints.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePickupPoint(index)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove Point
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <NumberedSlotInput
                      label="Event Itinerary (Step by Step)"
                      slots={formData.itinerary}
                      onAdd={() => addArrayField('itinerary')}
                      onRemove={(index) => removeArrayField('itinerary', index)}
                      onChange={(index, value) => handleArrayField('itinerary', index, value)}
                      placeholder="Describe this step of the itinerary..."
                      required
                    />
                  </div>
                )}

                {/* Section 7: Photographs */}
                {activeSection === 6 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader
                      title="Photographs"
                      description="Upload photos of the location or past experiences to attract guests"
                      icon={Camera}
                      number={6}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-neutral-700">
                          Location / Experience Photos <span className="text-neutral-400 font-normal">(Optional, max 10)</span>
                        </label>
                        <span className="text-xs text-neutral-500 font-medium">{formData.photographs.length}/10 uploaded</span>
                      </div>

                      {/* Upload Area */}
                      <div className={`border-2 border-dashed ${formData.photographs.length > 0 ? 'border-emerald-300' : 'border-neutral-300 hover:border-emerald-500'} rounded-2xl p-6 sm:p-8 text-center transition-all duration-200`}>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotographUpload}
                          className="hidden"
                          id="photographs-upload"
                          disabled={formData.photographs.length >= 10}
                        />
                        <label htmlFor="photographs-upload" className={`cursor-pointer ${formData.photographs.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
                          </div>
                          <p className="text-neutral-600 mb-2 text-sm sm:text-base font-medium">
                            {formData.photographs.length >= 10 ? 'Maximum photos uploaded' : 'Click to upload location photos'}
                          </p>
                          <p className="text-xs sm:text-sm text-neutral-500">
                            JPG or PNG, max 5MB each. These will be displayed with your event description.
                          </p>
                        </label>
                      </div>

                      {/* Preview Grid */}
                      {formData.photographs.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                          {formData.photographs.map((photo, index) => (
                            <div key={index} className="relative group rounded-xl overflow-hidden border border-neutral-200 shadow-sm aspect-square">
                              <img
                                src={photo}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
                              <button
                                type="button"
                                onClick={() => removePhotograph(index)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section 8: Poster & Finalize */}
                {activeSection === 7 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader
                      title="Poster & Finalize"
                      description="Upload event poster and publish"
                      icon={Upload}
                      number={7}
                    />

                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-neutral-700">
                        Event Poster <span className="text-red-500">*</span>
                      </label>
                      <div className={`border-2 border-dashed ${formData.poster ? 'border-emerald-500 bg-emerald-50/20' : 'border-neutral-300 hover:border-emerald-500'} rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 relative`}>
                        <input
                          type="file"
                          name="poster"
                          onChange={handleChange}
                          accept="image/*"
                          className="hidden"
                          id="poster-upload"
                        />
                        
                        {formData.poster ? (
                          <div className="space-y-4 w-full">
                            <div className="relative inline-block w-full max-w-md mx-auto group">
                              <img 
                                src={URL.createObjectURL(formData.poster)} 
                                alt="Poster Preview" 
                                className="w-full max-h-[300px] object-contain rounded-xl shadow-lg border border-emerald-200 mx-auto"
                              />
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, poster: null }))}
                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                            <div className="flex flex-col items-center">
                              <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                {formData.poster.name}
                              </p>
                              <p className="text-xs text-neutral-500 mt-1">
                                {(formData.poster.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <label htmlFor="poster-upload" className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-bold cursor-pointer underline">
                                Change Image
                              </label>
                            </div>
                          </div>
                        ) : (
                          <label htmlFor="poster-upload" className="cursor-pointer">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
                              <Image className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
                            </div>
                            <p className="text-neutral-600 mb-2 text-sm sm:text-base font-medium">
                              Click to upload your event poster
                            </p>
                            <p className="text-xs sm:text-sm text-neutral-500">
                              Recommended: 1200x630px, JPG or PNG
                            </p>
                          </label>
                        )}
                      </div>
                      {stepErrors.terms && <p className="text-sm text-red-500 font-medium">{stepErrors.terms}</p>}

                    </div>

                    {/* Publish Mode Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-neutral-700">How would you like to proceed?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPublishMode('publish')}
                          className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 ${publishMode === 'publish'
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                            : 'border-neutral-200 hover:border-emerald-300 bg-white'
                            }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${publishMode === 'publish' ? 'border-emerald-500' : 'border-neutral-300'
                              }`}>
                              {publishMode === 'publish' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                            </div>
                            <PlayCircle className={`w-5 h-5 ${publishMode === 'publish' ? 'text-emerald-600' : 'text-neutral-400'}`} />
                            <span className={`font-semibold text-sm ${publishMode === 'publish' ? 'text-emerald-800' : 'text-neutral-700'}`}>Publish Now</span>
                          </div>
                          <p className="text-xs sm:text-sm text-neutral-500 ml-8">Your event will go live immediately and be visible to all users.</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPublishMode('draft')}
                          className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 ${publishMode === 'draft'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-neutral-200 hover:border-blue-300 bg-white'
                            }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${publishMode === 'draft' ? 'border-blue-500' : 'border-neutral-300'
                              }`}>
                              {publishMode === 'draft' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                            </div>
                            <Clock className={`w-5 h-5 ${publishMode === 'draft' ? 'text-blue-600' : 'text-neutral-400'}`} />
                            <span className={`font-semibold text-sm ${publishMode === 'draft' ? 'text-blue-800' : 'text-neutral-700'}`}>Save for Later</span>
                          </div>
                          <p className="text-xs sm:text-sm text-neutral-500 ml-8">Save as a draft. You can publish it later from Upcoming Events.</p>
                        </button>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                      <h4 className="font-semibold text-emerald-800 mb-2 text-sm">
                        {publishMode === 'draft' ? 'Save as Draft?' : 'Ready to Publish?'}
                      </h4>
                      <p className="text-emerald-700 text-sm mb-4">
                        {publishMode === 'draft'
                          ? 'Your event will be saved and you can publish it anytime from your Upcoming Events section.'
                          : 'Review all information before publishing. Once published, your event will be visible to guests.'}
                      </p>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500 mt-0.5"
                          required
                        />
                        <label htmlFor="terms" className="text-sm text-neutral-700">
                          I accept bagspackgo&apos;s{' '}
                          <Link href="/provider-terms" target="_blank" className="text-emerald-600 font-semibold hover:underline">Provider Terms & Conditions</Link>
                          {' '}and{' '}
                          <Link href="/provider-privacy" target="_blank" className="text-emerald-600 font-semibold hover:underline">Provider Privacy Policy</Link>{' '}
                          and confirm that all information provided is accurate. I understand the applicable commission structure and payment terms.
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Errors */}
                {Object.keys(stepErrors).length > 0 && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 font-semibold text-sm mb-2">Please fix the following:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {Object.values(stepErrors).map((err, i) => (
                        <li key={i} className="text-red-600 text-sm">{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* API Error */}
                {apiError && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 font-semibold text-sm">{apiError}</p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={prevSection}
                    disabled={activeSection === 0}
                    className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${activeSection === 0
                      ? 'text-neutral-400 cursor-not-allowed'
                      : 'text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
                      }`}
                  >
                    Previous
                  </button>

                  {activeSection < sectionTitles.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextSection}
                      className="px-5 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`px-5 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {publishMode === 'draft' ? 'Saving...' : 'Publishing...'}
                        </span>
                      ) : publishMode === 'draft' ? 'Save as Draft' : 'Publish Event'}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}