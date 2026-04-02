'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  PlayCircle
} from 'lucide-react';

// ── Sub-components defined at module level to prevent re-creation on every render ──

function SectionHeader({ title, description, icon: Icon, number }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Step {number + 1}
          </span>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

function InputField({ label, name, type = 'text', value, onChange, required = false, ...props }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
        {...props}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, required = false }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm appearance-none"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
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
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={`w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center transition-colors ${value <= min
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'hover:bg-gray-50'
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
          className="w-20 px-3 py-2 text-center rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={`w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center transition-colors ${value >= max
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'hover:bg-gray-50'
            }`}
        >
          <span className="text-lg font-semibold">+</span>
        </button>
        <span className="text-sm text-gray-500 ml-2">days</span>
      </div>
    </div>
  );
}

function NumberInput({ label, name, value, onChange, min = 1, max = 1000, required = false }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
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
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
      />
    </div>
  );
}

function SlotInput({ label, slots, onAdd, onRemove, onChange, placeholder, required = false }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add More
        </button>
      </div>
      <div className="space-y-3">
        {slots.map((slot, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="text"
              value={slot}
              onChange={(e) => onChange(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              required={required && index === 0}
            />
            {slots.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
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
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add More
        </button>
      </div>
      <div className="space-y-3">
        {slots.map((slot, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full text-xs flex items-center justify-center font-semibold">
              {index + 1}
            </span>
            <input
              type="text"
              value={slot}
              onChange={(e) => onChange(index, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              required={required}
            />
            {slots.length > 3 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
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
    faqs: [
      { question: '', answer: '' },
      { question: '', answer: '' },
      { question: '', answer: '' }
    ],
    whatToBring: [''],
    restrictions: [''],
    pickupPoints: [{ location: '', link: '', time: '' }],
    itinerary: ['', '', ''],
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
    'Networking Event'
  ];

  const locations = [
    'Srinagar, Jammu & Kashmir',
    'Leh, Ladakh',
    'Manali, Himachal Pradesh',
    'Rishikesh, Uttarakhand',
    'Goa',
    'Kerala Backwaters',
    'Rajasthan Desert',
    'Mumbai, Maharashtra',
    'Delhi',
    'Bangalore, Karnataka'
  ];

  const sectionTitles = [
    'Basic Information',
    'Event Details',
    'Highlights & Inclusions',
    'FAQs',
    'Requirements',
    'Itinerary',
    'Poster & Finalize'
  ];

  // ── Per-step validation ──
  const validateStep = (step) => {
    const errors = {};
    if (step === 0) {
      if (!formData.title.trim()) errors.title = 'Event title is required';
      if (!formData.eventType) errors.eventType = 'Select an event type';
      if (!formData.location) errors.location = 'Select a location';
      if (!formData.date) errors.date = 'Pick a date';
      if (!formData.pricePerSlot && formData.pricePerSlot !== 0) errors.pricePerSlot = 'Enter a price';
      if (!formData.destination.trim()) errors.destination = 'Enter a destination';
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
    if (step === 6) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(6)) return;
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
          eventType: formData.eventType,
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
          faqs: formData.faqs.filter(f => f.question.trim() && f.answer.trim()),
          whatToBring: formData.whatToBring.filter(w => w.trim()),
          restrictions: formData.restrictions.filter(r => r.trim()),
          pickupPoints: formData.pickupPoints.filter(p => p.location.trim()),
          itinerary: formData.itinerary.filter(s => s.trim()),
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center"
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
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              {isDraft ? 'Event Saved Successfully!' : 'Event Published Successfully!'}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600 mb-4 text-lg"
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
                className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                    about: '', highlights: [''], whatsIncluded: [''],
                    faqs: [{ question: '', answer: '' }, { question: '', answer: '' }, { question: '', answer: '' }],
                    whatToBring: [''], restrictions: [''],
                    pickupPoints: [{ location: '', link: '', time: '' }],
                    itinerary: ['', '', ''], poster: null
                  });
                  setActiveSection(0);
                  setAcceptedTerms(false);
                }}
                className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-2 lg:px-2 -mt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => router.back()}
            className="p-3 rounded-2xl border border-gray-200 hover:bg-white hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent">
              Host New Event
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Create an unforgettable experience for your guests</p>
          </div>
        </motion.div>

        {/* Progress Bar - Visible on all screens */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
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
                  : 'bg-gray-300'
                  }`} />
                <span className={`text-xs font-medium transition-colors ${index <= activeSection ? 'text-emerald-600' : 'text-gray-400'
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
            <span className="text-sm text-gray-500">
              {sectionTitles[activeSection]}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
              initial={{ width: '0%' }}
              animate={{ width: `${((activeSection + 1) / sectionTitles.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Event Creation</h3>
              <nav className="space-y-2">
                {sectionTitles.map((title, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSection(index)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${index === activeSection
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${index === activeSection ? 'bg-emerald-500' : 'bg-gray-300'
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
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="p-8">
                {/* Section 1: Basic Information */}
                {activeSection === 0 && (
                  <div className="space-y-8">
                    <SectionHeader
                      title="Basic Information"
                      description="Tell us about your event"
                      icon={Tag}
                      number={0}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <InputField
                        label="Event Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Himalayan Trekking Adventure"
                      />

                      <SelectField
                        label="Event Type"
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleChange}
                        options={eventTypes}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <SelectField
                        label="Location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        options={locations}
                        required
                      />

                      <InputField
                        label="Date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <CounterInput
                        label="Duration"
                        value={formData.duration}
                        onChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                      />

                      <div className="space-y-6">
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <InputField
                        label="Destination"
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
                  <div className="space-y-8">
                    <SectionHeader
                      title="Event Details"
                      description="Describe your event to attract guests"
                      icon={Calendar}
                      number={1}
                    />

                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700">
                        About the Event <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="about"
                        value={formData.about}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Describe your event in detail. What makes it special? What can guests expect?"
                      />
                    </div>
                  </div>
                )}

                {/* Section 3: Highlights & Inclusions */}
                {activeSection === 2 && (
                  <div className="space-y-8">
                    <SectionHeader
                      title="Highlights & Inclusions"
                      description="What makes your event stand out"
                      icon={Star}
                      number={2}
                    />

                    <SlotInput
                      label="Highlights"
                      slots={formData.highlights}
                      onAdd={() => addArrayField('highlights')}
                      onRemove={(index) => removeArrayField('highlights', index)}
                      onChange={(index, value) => handleArrayField('highlights', index, value)}
                      placeholder="Enter one highlight per line (e.g., Scenic mountain views)"
                      required
                    />

                    <SlotInput
                      label="What's Included"
                      slots={formData.whatsIncluded}
                      onAdd={() => addArrayField('whatsIncluded')}
                      onRemove={(index) => removeArrayField('whatsIncluded', index)}
                      onChange={(index, value) => handleArrayField('whatsIncluded', index, value)}
                      placeholder="Enter one item per line (e.g., All meals included)"
                      required
                    />
                  </div>
                )}

                {/* Section 4: FAQs */}
                {activeSection === 3 && (
                  <div className="space-y-8">
                    <SectionHeader
                      title="Frequently Asked Questions"
                      description="Help guests with common questions"
                      icon={CheckCircle}
                      number={3}
                    />

                    <div className="space-y-6">
                      {formData.faqs.map((faq, index) => (
                        <div key={index} className="p-6 border border-gray-200 rounded-2xl bg-gray-50/50">
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
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 flex items-center justify-center gap-3"
                      >
                        <Plus className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Add Another FAQ</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Section 5: Requirements */}
                {activeSection === 4 && (
                  <div className="space-y-8">
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
                  <div className="space-y-8">
                    <SectionHeader
                      title="Event Itinerary"
                      description="Plan the event schedule step by step"
                      icon={Route}
                      number={5}
                    />

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">Pickup & Drop-off Points</h4>
                        <button
                          type="button"
                          onClick={addPickupPoint}
                          className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Point
                        </button>
                      </div>

                      {formData.pickupPoints.map((point, index) => (
                        <div key={index} className="p-6 border border-gray-200 rounded-2xl bg-gray-50/50">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
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

                {/* Section 7: Poster & Finalize */}
                {activeSection === 6 && (
                  <div className="space-y-8">
                    <SectionHeader
                      title="Poster & Finalize"
                      description="Upload event poster and publish"
                      icon={Upload}
                      number={6}
                    />

                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-700">
                        Event Poster <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-emerald-500 transition-all duration-200">
                        <input
                          type="file"
                          name="poster"
                          onChange={handleChange}
                          accept="image/*"
                          className="hidden"
                          id="poster-upload"
                          required
                        />
                        <label htmlFor="poster-upload" className="cursor-pointer">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <Image className="w-8 h-8 text-emerald-600" />
                          </div>
                          <p className="text-gray-600 mb-2">
                            Click to upload your event poster
                          </p>
                          <p className="text-sm text-gray-500">
                            Recommended: 1200x630px, JPG or PNG
                          </p>
                        </label>
                      </div>
                      {formData.poster && (
                        <p className="text-emerald-600 text-sm font-medium">
                          ✓ {formData.poster.name} selected
                        </p>
                      )}
                    </div>

                    {/* Publish Mode Selection */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">How would you like to proceed?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPublishMode('publish')}
                          className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 ${publishMode === 'publish'
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                            : 'border-gray-200 hover:border-emerald-300 bg-white'
                            }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${publishMode === 'publish' ? 'border-emerald-500' : 'border-gray-300'
                              }`}>
                              {publishMode === 'publish' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                            </div>
                            <PlayCircle className={`w-5 h-5 ${publishMode === 'publish' ? 'text-emerald-600' : 'text-gray-400'}`} />
                            <span className={`font-semibold ${publishMode === 'publish' ? 'text-emerald-800' : 'text-gray-700'}`}>Publish Now</span>
                          </div>
                          <p className="text-sm text-gray-500 ml-8">Your event will go live immediately and be visible to all users.</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPublishMode('draft')}
                          className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 ${publishMode === 'draft'
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-300 bg-white'
                            }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${publishMode === 'draft' ? 'border-blue-500' : 'border-gray-300'
                              }`}>
                              {publishMode === 'draft' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                            </div>
                            <Clock className={`w-5 h-5 ${publishMode === 'draft' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className={`font-semibold ${publishMode === 'draft' ? 'text-blue-800' : 'text-gray-700'}`}>Save for Later</span>
                          </div>
                          <p className="text-sm text-gray-500 ml-8">Save as a draft. You can publish it later from Upcoming Events.</p>
                        </button>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
                      <h4 className="font-semibold text-emerald-800 mb-2">
                        {publishMode === 'draft' ? 'Save as Draft?' : 'Ready to Publish?'}
                      </h4>
                      <p className="text-emerald-700 text-sm mb-4">
                        {publishMode === 'draft'
                          ? 'Your event will be saved and you can publish it anytime from your Upcoming Events section.'
                          : 'Review all information before publishing. Once published, your event will be visible to guests.'}
                      </p>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="terms"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          required
                        />
                        <label htmlFor="terms" className="text-sm text-gray-700">
                          I accept the terms and conditions and confirm that all information provided is accurate.
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
                <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={prevSection}
                    disabled={activeSection === 0}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${activeSection === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                  >
                    Previous
                  </button>

                  {activeSection < sectionTitles.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextSection}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
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