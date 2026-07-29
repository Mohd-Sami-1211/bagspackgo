'use client';
import React, { useState, useCallback, useMemo, useRef, memo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Calendar, MapPin, Clock, Users, Image as ImageIcon, Tag, Globe,
  Plus, Trash2, Upload, Star, CheckCircle, Route, Check, PlayCircle,
  XCircle, Sparkles, Camera, X
} from 'lucide-react';
import { compressImage, fetchWithRetry } from '@/lib/imageCompression';

const eventTypes = [
  'Adventure Tour', 'Cultural Experience', 'Food & Dining', 'Wellness Retreat',
  'Photography Workshop', 'Music Festival', 'Art Exhibition', 'Sports Event',
  'Educational Workshop', 'Networking Event', 'Others',
];

const destinations = [
  'Kashmir', 'Bhaderwah', 'Warwan and Marwah Valley', 'Uttarakhand',
  'Himachal Pradesh', 'Ladakh', 'Sikkim', 'Arunachal Pradesh', 'Meghalaya',
  'Assam', 'Goa', 'Rajasthan', 'Kerala', 'Andaman & Nicobar',
  'Madhya Pradesh', 'Tamil Nadu', 'Maharashtra', 'Others',
];

const sectionTitles = [
  'Basic Information', 'Event Details', 'Highlights & Inclusions', 'FAQs',
  'Requirements', 'Itinerary', 'Photographs', 'Application Form',
  'Terms & Conditions', 'Poster & Finalize',
];

const stepValidationFields = [
  ['title', 'visibility', 'eventType', 'customEventType', 'location', 'customDestination', 'date', 'duration', 'totalSlots', 'pricePerSlot', 'destination', 'destinationLink'],
  ['about'],
  ['highlights', 'whatsIncluded', 'whatsExcluded'],
  ['faqs'],
  ['whatToBring', 'restrictions'],
  ['includePickup', 'pickupPoints', 'itinerary'],
  ['photographs'],
  ['applicationFormType', 'customFormFields'],
  ['termsAndConditions'],
  ['poster', 'acceptedTerms'],
];

const uploadToCloudinary = async (fileData) => {
  if (typeof fileData === 'string' && fileData.startsWith('http')) return fileData;
  const formData = new FormData();
  formData.append('file', fileData);
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudName   = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', cloudName);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Image upload failed');
  }
  const data = await response.json();
  return data.secure_url;
};

const SectionHeader = memo(function SectionHeader({ title, description, icon: Icon, number }) {
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
});

const InputField = memo(React.forwardRef(function InputField(
  { label, error, required = false, type = 'text', ...props }, ref
) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-neutral-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        ref={ref}
        type={type}
        className={`w-full px-4 py-3 rounded-xl border ${error ? 'border-red-500 focus:ring-red-200' : 'border-neutral-200 focus:ring-emerald-500'} focus:ring-2 focus:border-transparent transition-all duration-200 bg-white shadow-sm text-sm`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
    </div>
  );
}));
InputField.displayName = 'InputField';

const SelectField = memo(function SelectField({ label, value, onChange, options, required = false, error }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2 relative" onBlur={(e) => {
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
                  onMouseDown={() => { onChange(option); setIsOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${value === option ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-neutral-600 hover:bg-neutral-50'}`}
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
});

const CounterInput = memo(function CounterInput({ label, value, onChange, min = 1, max = 100 }) {
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === '') { onChange(min); return; }
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) onChange(Math.max(min, Math.min(max, numValue)));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-neutral-700">{label}</label>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className={`w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center transition-colors ${value <= min ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'hover:bg-neutral-50'}`}>
          <span className="text-lg font-semibold">-</span>
        </button>
        <input type="number" value={value.toString()} onChange={handleInputChange} min={min} max={max}
          className="w-20 px-3 py-2 text-center rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          className={`w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center transition-colors ${value >= max ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' : 'hover:bg-neutral-50'}`}>
          <span className="text-lg font-semibold">+</span>
        </button>
        <span className="text-sm text-neutral-500 ml-2">days</span>
      </div>
    </div>
  );
});

const SlotInput = memo(function SlotInput({ label, value = [''], onChange, placeholder, required = false, icon: Icon, error }) {
  const onAdd        = useCallback(() => onChange([...value, '']), [onChange, value]);
  const onRemove     = useCallback((index) => onChange(value.filter((_, i) => i !== index)), [onChange, value]);
  const onItemChange = useCallback((index, val) => {
    const newArr = [...value];
    newArr[index] = val;
    onChange(newArr);
  }, [onChange, value]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-neutral-700 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-emerald-600" />}
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button type="button" onClick={onAdd} className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add More</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
      <div className="space-y-3">
        {value.map((slot, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3">
            <input type="text" value={slot} onChange={(e) => onItemChange(index, e.target.value)} placeholder={placeholder}
              className={`flex-1 px-4 py-3 rounded-xl border ${error && index === 0 ? 'border-red-500 focus:ring-red-200' : 'border-neutral-200 focus:ring-emerald-500'} focus:ring-2 focus:border-transparent transition-all duration-200 text-sm`} />
            {value.length > 1 && (
              <button type="button" onClick={() => onRemove(index)} className="p-2.5 sm:p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
    </div>
  );
});

const NumberedSlotInput = memo(function NumberedSlotInput({ label, value = [''], onChange, placeholder, required = false, error }) {
  const onAdd        = useCallback(() => onChange([...value, '']), [onChange, value]);
  const onRemove     = useCallback((index) => onChange(value.filter((_, i) => i !== index)), [onChange, value]);
  const onItemChange = useCallback((index, val) => {
    const newArr = [...value];
    newArr[index] = val;
    onChange(newArr);
  }, [onChange, value]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-neutral-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button type="button" onClick={onAdd} className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add More</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
      <div className="space-y-3">
        {value.map((slot, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3">
            <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full text-xs flex items-center justify-center font-semibold flex-shrink-0">
              {index + 1}
            </span>
            <input type="text" value={slot} onChange={(e) => onItemChange(index, e.target.value)} placeholder={placeholder}
              className={`flex-1 px-4 py-3 rounded-xl border ${error && index === 0 ? 'border-red-500 focus:ring-red-200' : 'border-neutral-200 focus:ring-emerald-500'} focus:ring-2 focus:border-transparent transition-all duration-200 text-sm`} />
            {value.length > 3 && (
              <button type="button" onClick={() => onRemove(index)} className="p-2.5 sm:p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
    </div>
  );
});

//   Main Component

export default function HostEventPage({ isEdit = false, initialData = null, adminMode = false, providerId = null }) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(0);
  const [isPublished, setIsPublished]     = useState(false);
  const [apiError, setApiError]           = useState('');
  const [publishMode, setPublishMode]     = useState('publish');

  const isCustomEventType = useMemo(() =>
    initialData && !eventTypes.includes(initialData.eventType) && initialData.eventType,
  [initialData]);

  const isCustomDestination = useMemo(() =>
    initialData && !destinations.includes(initialData.location) && initialData.location,
  [initialData]);

  const mappedCustomFields = useMemo(() => {
    const fields = initialData?.customFormFields || [];
    if (fields.length > 0 && fields[0].fields) {
      return fields.flatMap(section => section.fields || []);
    }
    return fields;
  }, [initialData]);

  const { register, control, handleSubmit, trigger, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title:                initialData?.title || '',
      visibility:           initialData?.visibility || 'public',
      eventType:            isCustomEventType ? 'Others' : (initialData?.eventType || ''),
      customEventType:      isCustomEventType ? initialData.eventType : '',
      location:             isCustomDestination ? 'Others' : (initialData?.location || ''),
      customDestination:    isCustomDestination ? initialData.location : '',
      date:                 initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
      duration:             initialData?.duration || 1,
      totalSlots:           initialData?.totalSlots || 20,
      pricePerSlot:         initialData?.pricePerSlot || '',
      destination:          initialData?.destination || '',
      destinationLink:      initialData?.destinationLink || '',
      about:                initialData?.about || '',
      highlights:           initialData?.highlights?.length ? initialData.highlights : [''],
      whatsIncluded:        initialData?.whatsIncluded?.length ? initialData.whatsIncluded : [''],
      whatsExcluded:        initialData?.whatsExcluded?.length ? initialData.whatsExcluded : [''],
      faqs:                 initialData?.faqs?.length ? initialData.faqs : [{ question: '', answer: '' }, { question: '', answer: '' }, { question: '', answer: '' }],
      whatToBring:          initialData?.whatToBring?.length ? initialData.whatToBring : [''],
      restrictions:         initialData?.restrictions?.length ? initialData.restrictions : [''],
      includePickup:        initialData?.includePickup !== undefined ? initialData.includePickup : true,
      pickupPoints:         initialData?.pickupPoints?.length ? initialData.pickupPoints : [{ location: '', link: '', time: '' }],
      itinerary:            initialData?.itinerary?.length ? initialData.itinerary : ['', '', ''],
      photographs:          initialData?.photographs || [],
      applicationFormType:  initialData?.applicationFormType || 'default',
      customFormFields:     mappedCustomFields,
      termsAndConditions:   initialData?.termsAndConditions?.length ? initialData.termsAndConditions : [''],
      poster:               initialData?.poster || null,
      acceptedTerms:        false,
    },
  });

  const [
    watchEventType,
    watchLocation,
    watchIncludePickup,
    watchPhotographs,
    watchPoster,
    watchApplicationFormType,
  ] = watch(['eventType', 'location', 'includePickup', 'photographs', 'poster', 'applicationFormType']);

  const { fields: faqFields,    append: appendFaq,    remove: removeFaq    } = useFieldArray({ control, name: 'faqs' });
  const { fields: pickupFields, append: appendPickup, remove: removePickup } = useFieldArray({ control, name: 'pickupPoints' });

  const nextSection = useCallback(async () => {
    const isStepValid = await trigger(stepValidationFields[activeSection]);
    if (isStepValid) setActiveSection(prev => Math.min(prev + 1, sectionTitles.length - 1));
  }, [activeSection, trigger]);

  const prevSection = useCallback(() => {
    setActiveSection(prev => Math.max(prev - 1, 0));
  }, []);

  const handleNavClick = useCallback(async (index) => {
    if (index > activeSection) {
      const valid = await trigger(stepValidationFields[activeSection]);
      if (valid) setActiveSection(index);
    } else {
      setActiveSection(index);
    }
  }, [activeSection, trigger]);

  const handlePhotographUpload = useCallback(async (e) => {
    const files         = Array.from(e.target.files);
    const currentPhotos = watchPhotographs || [];
    if (currentPhotos.length + files.length > 10) {
      toast.error('You can upload a maximum of 10 photographs.');
      return;
    }
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB per image.`);
        return false;
      }
      return true;
    });
    try {
      const compressedImages = await Promise.all(validFiles.map(f => compressImage(f, { maxWidth: 1200, quality: 0.75 })));
      setValue('photographs', [...currentPhotos, ...compressedImages], { shouldValidate: true });
    } catch {
      toast.error('Error compressing images. Please try again.');
    }
  }, [watchPhotographs, setValue]);

  const onSubmit = useCallback(async (data) => {
    setApiError('');
    const loadingToastId = toast.loading(publishMode === 'draft' ? 'Saving draft...' : 'Publishing event...');
    try {
      toast.loading('Uploading media to cloud...', { id: loadingToastId });

      let finalPosterUrl = data.poster;
      if (data.poster && typeof data.poster !== 'string') {
        const compressedPoster = await compressImage(data.poster, { maxWidth: 1400, quality: 0.80 });
        finalPosterUrl = await uploadToCloudinary(compressedPoster);
      } else if (typeof data.poster === 'string' && data.poster.startsWith('data:image')) {
        finalPosterUrl = await uploadToCloudinary(data.poster);
      }

      const finalPhotographsUrls = await Promise.all(
        data.photographs.map(photo => uploadToCloudinary(photo))
      );

      toast.loading('Finalizing details...', { id: loadingToastId });

      const payload = JSON.stringify({
        title:              data.title,
        eventType:          data.eventType === 'Others' ? data.customEventType : data.eventType,
        location:           data.location  === 'Others' ? data.customDestination : data.location,
        date:               data.date,
        duration:           data.duration,
        totalSlots:         data.totalSlots,
        pricePerSlot:       data.pricePerSlot,
        destination:        data.destination,
        destinationLink:    data.destinationLink,
        about:              data.about,
        status:             publishMode === 'draft' ? 'draft' : 'published',
        highlights:         data.highlights.filter(h => h.trim()),
        whatsIncluded:      data.whatsIncluded.filter(w => w.trim()),
        whatsExcluded:      data.whatsExcluded.filter(w => w.trim()),
        faqs:               data.faqs.filter(f => f.question.trim() && f.answer.trim()),
        whatToBring:        data.whatToBring.filter(w => w.trim()),
        restrictions:       data.restrictions.filter(r => r.trim()),
        includePickup:      data.includePickup,
        pickupPoints:       data.includePickup ? data.pickupPoints.filter(p => p.location.trim()) : [],
        itinerary:          data.itinerary.filter(s => s.trim()),
        photographs:        finalPhotographsUrls,
        termsAndConditions: data.termsAndConditions.filter(t => t.trim()),
        poster:             finalPosterUrl,
        visibility:         data.visibility,
        applicationFormType: data.applicationFormType,
        customFormFields:   data.customFormFields,
      });

      const url = adminMode
        ? `/api/admin/events/${isEdit ? initialData.id || initialData._id : ''}?providerId=${providerId || ''}`
        : `/api/provider/events${isEdit ? `/${initialData.id || initialData._id}` : ''}`;

      const res = await fetchWithRetry(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      }, { timeoutMs: 90000, maxRetries: 2 });

      const resData = await res.json();
      if (resData.success) {
        setIsPublished(true);
        toast.success(isEdit ? 'Event updated successfully!' : 'Event published successfully!', { id: loadingToastId });
      } else {
        const errorMsg = resData.message || 'Failed to publish event. Please try again.';
        setApiError(errorMsg);
        toast.error(errorMsg, { id: loadingToastId });
      }
    } catch (err) {
      const msg = err.name === 'AbortError'
        ? 'The request timed out. Please check your internet connection.'
        : err.message || 'Network error. Please check your connection.';
      setApiError(msg);
      toast.error(msg, { id: loadingToastId });
    }
  }, [publishMode, isEdit, initialData, adminMode, providerId]);

  const posterPreviewUrl = useMemo(() => {
    if (!watchPoster) return null;
    if (typeof watchPoster === 'string') return watchPoster;
    const url = URL.createObjectURL(watchPoster);
    return url;
  }, [watchPoster]);

  const prevPosterRef = useRef(null);
  useMemo(() => {
    if (prevPosterRef.current && prevPosterRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(prevPosterRef.current);
    }
    prevPosterRef.current = posterPreviewUrl;
  }, [posterPreviewUrl]);

  if (isPublished) {
    const isDraft = publishMode === 'draft';
    return (
      <div className={`min-h-screen ${adminMode ? 'bg-transparent' : 'bg-gradient-to-br from-neutral-50 to-emerald-50/30'} py-6 sm:py-8`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 sm:p-12 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${isDraft ? 'bg-blue-100' : 'bg-emerald-100'}`}>
              <Check className={`w-10 h-10 ${isDraft ? 'text-blue-600' : 'text-emerald-600'}`} />
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
              {isDraft ? 'Event Saved Successfully!' : (isEdit ? 'Event Updated Successfully!' : 'Event Published Successfully!')}
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="text-neutral-600 mb-4 text-base sm:text-lg">
              {isDraft ? 'Your event has been saved as a draft.' : 'Your event is now live and visible to guests.'}
            </motion.p>
            {isDraft && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium mb-8 border border-blue-200">
                <Clock className="w-4 h-4" /> You can find this event under <span className="font-bold">Upcoming Events</span> in your dashboard
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <button onClick={() => router.back()} className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl">
                {isDraft ? 'View in Upcoming Events' : (isEdit ? 'Back to Events' : 'Manage Events')}
              </button>
              {!isEdit && (
                <button onClick={() => { setIsPublished(false); setPublishMode('publish'); reset(); setActiveSection(0); }}
                  className="px-8 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all duration-200">
                  Create Another Event
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${adminMode ? 'bg-transparent' : 'bg-gradient-to-br from-neutral-50 to-emerald-50/30'} py-6 sm:py-8`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 -mt-6 sm:-mt-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button onClick={() => router.back()} className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-neutral-200 hover:bg-white hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm flex-shrink-0">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 truncate">
                {isEdit ? 'Edit Event' : 'Host New Event'}
              </h1>
            </div>
            <p className="text-neutral-500 mt-1 text-sm sm:text-base">Create an unforgettable experience for your guests</p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 sm:mb-12">
          {/* OPT #9 — handleNavClick used instead of inline async per button */}
          <div className="hidden lg:flex items-center justify-between mb-4">
            {sectionTitles.map((title, index) => (
              <button key={index} onClick={() => handleNavClick(index)}
                className={`flex flex-col items-center flex-1 ${index < sectionTitles.length - 1 ? 'mr-4' : ''}`}>
                <div className={`w-3 h-3 rounded-full mb-2 transition-all duration-300 ${index <= activeSection ? 'bg-emerald-500 scale-125' : 'bg-neutral-300'}`} />
                <span className={`text-xs font-medium transition-colors ${index <= activeSection ? 'text-emerald-600' : 'text-neutral-400'}`}>{title}</span>
              </button>
            ))}
          </div>
          <div className="lg:hidden flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-emerald-600">Step {activeSection + 1} of {sectionTitles.length}</span>
            <span className="text-sm text-neutral-500">{sectionTitles[activeSection]}</span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
              initial={{ width: '0%' }}
              animate={{ width: `${((activeSection + 1) / sectionTitles.length) * 100}%` }}
              transition={{ duration: 0.5 }} />
          </div>
        </motion.div>

        {/* Main Form Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

          {/* Sidebar — OPT #9: handleNavClick replaces inline async per button */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-5 sticky top-8">
              <h3 className="font-semibold text-neutral-900 mb-4 text-sm">Event Creation</h3>
              <nav className="space-y-1.5">
                {sectionTitles.map((title, index) => (
                  <button key={index} type="button" onClick={() => handleNavClick(index)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${index === activeSection ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${index === activeSection ? 'bg-emerald-500' : index < activeSection ? 'bg-emerald-300' : 'bg-neutral-300'}`} />
                      <span className="text-sm font-medium">{title}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <motion.div key={activeSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-neutral-200">
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6 lg:p-8">

                {/* Section 0: Basic Info */}
                {activeSection === 0 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader title="Basic Information" description="Tell us about your event" icon={Tag} number={0} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <InputField label="Event Title" placeholder="e.g., Himalayan Trekking Adventure" error={errors.title?.message} required {...register('title', { required: 'Event title is required' })} />
                      <Controller name="visibility" control={control} rules={{ required: 'Select visibility' }} render={({ field }) => (
                        <SelectField label="Event Visibility" options={['public', 'private']} error={errors.visibility?.message} required {...field} />
                      )} />
                      <Controller name="eventType" control={control} rules={{ required: 'Select an event type' }} render={({ field }) => (
                        <SelectField label="Event Type" options={eventTypes} error={errors.eventType?.message} required {...field} />
                      )} />
                      {watchEventType === 'Others' && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="sm:col-span-2">
                          <InputField label="Custom Event Type Name" placeholder="e.g., Spiritual Retreat" error={errors.customEventType?.message} required {...register('customEventType', { required: 'Please name your event type' })} />
                        </motion.div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-4">
                        <Controller name="location" control={control} rules={{ required: 'Select a destination' }} render={({ field }) => (
                          <SelectField label="Destination State/Region" options={destinations} error={errors.location?.message} required {...field} />
                        )} />
                        {watchLocation === 'Others' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <InputField label="Custom Destination Name" placeholder="e.g., Gulmarg" error={errors.customDestination?.message} required {...register('customDestination', { required: 'Please enter a destination name' })} />
                          </motion.div>
                        )}
                      </div>
                      <InputField label="Date" type="date" error={errors.date?.message} required {...register('date', { required: 'Pick a date' })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <Controller name="duration" control={control} render={({ field }) => (
                        <CounterInput label="Duration" value={field.value} onChange={field.onChange} />
                      )} />
                      <div className="space-y-4 sm:space-y-6">
                        <InputField label="Total Slots" type="number" min="1" error={errors.totalSlots?.message} required {...register('totalSlots', { required: 'Required', valueAsNumber: true, min: 1 })} />
                        <InputField label="Price Per Slot (₹)" type="number" placeholder="Enter price per person" error={errors.pricePerSlot?.message} required {...register('pricePerSlot', { required: 'Enter a price', valueAsNumber: true })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <InputField label="Exact Location" placeholder="e.g., Tarsar Marsar Trek Base Camp" error={errors.destination?.message} required {...register('destination', { required: 'Enter a location' })} />
                      <InputField label="Map/Destination Link" placeholder="https://maps.google.com/..." error={errors.destinationLink?.message} required {...register('destinationLink', { required: 'Link is required' })} />
                    </div>
                  </div>
                )}

                {/* Section 1: Event Details */}
                {activeSection === 1 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader title="Event Details" description="Describe your event to attract guests" icon={Calendar} number={1} />
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-neutral-700">
                        About the Event <span className="text-red-500">*</span>
                      </label>
                      <textarea rows={6}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.about ? 'border-red-500 focus:ring-red-200' : 'border-neutral-200 focus:ring-emerald-500'} focus:ring-2 focus:border-transparent transition-all duration-200 resize-none text-sm`}
                        placeholder="Describe your event in detail..."
                        {...register('about', { required: 'Event description is required' })} />
                      {errors.about && <p className="text-xs text-red-500 font-medium ml-1">{errors.about.message}</p>}
                    </div>
                  </div>
                )}

                {/* Section 2: Highlights */}
                {activeSection === 2 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader title="Highlights & Inclusions" description="What makes your event stand out and what's covered" icon={Star} number={2} />
                    <Controller name="highlights" control={control} rules={{ validate: v => v.filter(i => i.trim()).length > 0 || 'At least one highlight is required' }} render={({ field, fieldState }) => (
                      <SlotInput label="Highlights" icon={Sparkles} value={field.value} onChange={field.onChange} error={fieldState.error?.message} placeholder="e.g., Scenic mountain views" required />
                    )} />
                    <div className="border-t border-neutral-100" />
                    <Controller name="whatsIncluded" control={control} rules={{ validate: v => v.filter(i => i.trim()).length > 0 || 'At least one inclusion is required' }} render={({ field, fieldState }) => (
                      <SlotInput label="What's Included" icon={CheckCircle} value={field.value} onChange={field.onChange} error={fieldState.error?.message} placeholder="e.g., All meals included" required />
                    )} />
                    <div className="border-t border-neutral-100" />
                    <Controller name="whatsExcluded" control={control} render={({ field }) => (
                      <SlotInput label="What's Excluded" icon={XCircle} value={field.value} onChange={field.onChange} placeholder="e.g., Personal expenses" />
                    )} />
                  </div>
                )}

                {/* Section 3: FAQs */}
                {activeSection === 3 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader title="Frequently Asked Questions" description="Help guests with common questions" icon={CheckCircle} number={3} />
                    <div className="space-y-4 sm:space-y-6">
                      {faqFields.map((field, index) => (
                        <div key={field.id} className="p-4 sm:p-6 border border-neutral-200 rounded-2xl bg-neutral-50/50">
                          <div className="grid grid-cols-1 gap-4">
                            <InputField label={`Question ${index + 1}`} placeholder="Enter a common question..." error={errors?.faqs?.[index]?.question?.message} required {...register(`faqs.${index}.question`, { required: 'Question is required' })} />
                            <InputField label="Answer" placeholder="Provide a clear answer..." error={errors?.faqs?.[index]?.answer?.message} required {...register(`faqs.${index}.answer`, { required: 'Answer is required' })} />
                          </div>
                          {faqFields.length > 1 && (
                            <button type="button" onClick={() => removeFaq(index)} className="mt-4 flex items-center gap-2 text-sm text-red-500 font-semibold hover:text-red-700">
                              <Trash2 className="w-4 h-4" /> Remove FAQ
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => appendFaq({ question: '', answer: '' })} className="w-full py-4 border-2 border-dashed border-neutral-300 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-3">
                        <Plus className="w-5 h-5 text-emerald-600" /><span className="text-emerald-600 font-semibold text-sm">Add Another FAQ</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Section 4: Requirements */}
                {activeSection === 4 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader title="Requirements & Restrictions" description="What guests should know and bring" icon={Users} number={4} />
                    <Controller name="whatToBring" control={control} rules={{ validate: v => v.filter(i => i.trim()).length > 0 || 'At least one item is required' }} render={({ field, fieldState }) => (
                      <SlotInput label="What to Bring" value={field.value} onChange={field.onChange} error={fieldState.error?.message} placeholder="e.g., Warm clothing" required />
                    )} />
                    <div className="border-t border-neutral-100" />
                    <Controller name="restrictions" control={control} render={({ field }) => (
                      <SlotInput label="Restrictions (if any)" value={field.value} onChange={field.onChange} placeholder="e.g., Not suitable for children under 12" />
                    )} />
                  </div>
                )}

                {/* Section 5: Itinerary */}
                {activeSection === 5 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader title="Event Itinerary" description="Plan the event schedule step by step" icon={Route} number={5} />
                    <div className="space-y-6">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-neutral-900 text-sm">Include Pickup & Drop-off Points</h4>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" {...register('includePickup')} />
                            <div className="w-9 h-5 bg-neutral-200 rounded-full peer peer-checked:bg-emerald-600 peer-focus:ring-2 peer-focus:ring-emerald-300 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                          </label>
                        </div>
                        {watchIncludePickup && (
                          <button type="button" onClick={() => appendPickup({ location: '', link: '', time: '' })} className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors text-sm">
                            <Plus className="w-4 h-4" /> Add Point
                          </button>
                        )}
                      </div>
                      {watchIncludePickup && pickupFields.map((point, index) => (
                        <div key={point.id} className="p-4 sm:p-6 border border-neutral-200 rounded-2xl bg-neutral-50/50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <InputField label="Location" placeholder="Pickup point address..." error={errors?.pickupPoints?.[index]?.location?.message} required {...register(`pickupPoints.${index}.location`, { required: 'Location is required if pickup is included' })} />
                            <InputField label="Map Link" placeholder="Google Maps link..." {...register(`pickupPoints.${index}.link`)} />
                            <InputField label="Pickup Time" type="time" required {...register(`pickupPoints.${index}.time`, { required: 'Time is required' })} />
                          </div>
                          {pickupFields.length > 1 && (
                            <button type="button" onClick={() => removePickup(index)} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2">
                              <Trash2 className="w-4 h-4" /> Remove Point
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Controller name="itinerary" control={control} rules={{ validate: v => v.filter(i => i.trim()).length > 0 || 'At least one itinerary step is required' }} render={({ field, fieldState }) => (
                      <NumberedSlotInput label="Event Itinerary (Step by Step)" value={field.value} onChange={field.onChange} error={fieldState.error?.message} placeholder="Describe this step of the itinerary..." required />
                    )} />
                  </div>
                )}

                {/* Section 6: Photographs */}
                {activeSection === 6 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader title="Photographs" description="Upload photos of the location or past experiences to attract guests" icon={Camera} number={6} />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-neutral-700">
                          Location / Experience Photos <span className="text-neutral-400 font-normal">(Optional, max 10)</span>
                        </label>
                        <span className="text-xs text-neutral-500 font-medium">{(watchPhotographs || []).length}/10 uploaded</span>
                      </div>
                      <div className={`border-2 border-dashed ${(watchPhotographs || []).length > 0 ? 'border-emerald-300' : 'border-neutral-300 hover:border-emerald-500'} rounded-2xl p-6 sm:p-8 text-center transition-all duration-200`}>
                        <input type="file" accept="image/*" multiple onChange={handlePhotographUpload} className="hidden" id="photographs-upload" disabled={(watchPhotographs || []).length >= 10} />
                        <label htmlFor="photographs-upload" className={`cursor-pointer ${(watchPhotographs || []).length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
                            <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
                          </div>
                          <p className="text-neutral-600 mb-2 text-sm sm:text-base font-medium">
                            {(watchPhotographs || []).length >= 10 ? 'Maximum photos uploaded' : 'Click to upload location photos'}
                          </p>
                          <p className="text-xs sm:text-sm text-neutral-500">JPG or PNG, max 5MB each.</p>
                        </label>
                      </div>
                      {(watchPhotographs || []).length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                          {watchPhotographs.map((photo, index) => (
                            <div key={index} className="relative group rounded-xl overflow-hidden border border-neutral-200 shadow-sm aspect-square">
                              <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
                              <button type="button" onClick={() => setValue('photographs', watchPhotographs.filter((_, i) => i !== index), { shouldValidate: true })}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section 7: Application Form */}
                {activeSection === 7 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader title="Application Form" description="Customize what information guests need to provide when booking" icon={Users} number={7} />
                    <div className="space-y-4 relative z-50">
                      <Controller name="applicationFormType" control={control} rules={{ required: true }} render={({ field }) => (
                        <SelectField label="Application Form Type" options={['default', 'customized']} required {...field} />
                      )} />
                      <div className="p-4 sm:p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-emerald-800">Mandatory Fields (Always Collected)</p>
                            <p className="text-xs text-emerald-600 mt-0.5">The following fields are <strong>always required</strong>:</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {['Name', 'Age', 'Gender', 'Mobile', 'Nationality', 'ID Type', 'ID Number', 'ID Proof Upload'].map(f => (
                                <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                                  <CheckCircle className="w-2.5 h-2.5" /> {f}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {watchApplicationFormType === 'default' && (
                        <div className="p-4 sm:p-5 bg-neutral-50 border border-neutral-200 rounded-2xl">
                          <p className="text-xs text-neutral-600 font-medium">With the <strong>default</strong> form, only the mandatory identity fields above will be collected.</p>
                        </div>
                      )}

                      {watchApplicationFormType === 'customized' && (
                        <Controller name="customFormFields" control={control}
                          rules={{ validate: v => v.length > 0 || 'Please add at least one form field' }}
                          render={({ field: { value: customFields, onChange }, fieldState }) => (
                            <div className="space-y-6 mt-4">
                              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl">
                                <p className="text-xs text-blue-700 font-medium"><strong>Custom Form Builder</strong> — Add <strong>extra</strong> fields beyond the mandatory identity fields.</p>
                              </div>
                              {fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
                              <div className="space-y-4">
                                {customFields.map((field, fIndex) => {
                                  const allPriorFields = customFields.slice(0, fIndex);
                                  return (
                                    <div key={field.id || fIndex} className="relative py-5 border-b border-neutral-200 group last:border-b-0" style={{ zIndex: customFields.length - fIndex }}>
                                      <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-bold text-neutral-800 text-sm">Field {fIndex + 1}</h4>
                                        <button type="button" onClick={() => { const s = [...customFields]; s.splice(fIndex, 1); onChange(s); }} className="text-neutral-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg">
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
                                        {/* OPT #11 — immutable update: spread the object before mutating */}
                                        <InputField label="Field Title" value={field.title || ''} onChange={(e) => { const s = [...customFields]; s[fIndex] = { ...s[fIndex], title: e.target.value }; onChange(s); }} placeholder="e.g., Blood Group" required />
                                        <InputField label="Placeholder (Optional)" value={field.placeholder || ''} onChange={(e) => { const s = [...customFields]; s[fIndex] = { ...s[fIndex], placeholder: e.target.value }; onChange(s); }} placeholder="e.g., Enter your blood group" />
                                        <div className="relative z-50">
                                          <SelectField label="Input Type" value={field.type || 'text'} onChange={(val) => {
                                            const s = [...customFields];
                                            s[fIndex] = { ...s[fIndex], type: val, options: ['dropdown', 'multiple_choice', 'checkbox'].includes(val) && (!s[fIndex].options || s[fIndex].options.length === 0) ? [{ value: '', extraCharge: 0 }] : s[fIndex].options };
                                            onChange(s);
                                          }} options={['text', 'number', 'dropdown', 'multiple_choice', 'checkbox', 'photo_upload']} required />
                                        </div>
                                      </div>

                                      {['dropdown', 'multiple_choice', 'checkbox'].includes(field.type) && (
                                        <div className="space-y-3 mb-5 mt-4">
                                          <label className="block text-sm font-semibold text-neutral-700">Options</label>
                                          {(field.options || []).map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2 sm:gap-3">
                                              <input type="text" value={opt.value || ''} onChange={(e) => { const s = [...customFields]; s[fIndex] = { ...s[fIndex], options: s[fIndex].options.map((o, i) => i === oIdx ? { ...o, value: e.target.value } : o) }; onChange(s); }}
                                                placeholder="Option text" className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:ring-1 focus:ring-emerald-500 outline-none" required />
                                              <div className="relative flex-shrink-0">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">₹</span>
                                                <input type="number" value={opt.extraCharge || 0} onChange={(e) => { const s = [...customFields]; s[fIndex] = { ...s[fIndex], options: s[fIndex].options.map((o, i) => i === oIdx ? { ...o, extraCharge: parseInt(e.target.value) || 0 } : o) }; onChange(s); }}
                                                  placeholder="0" className="w-24 sm:w-28 pl-6 pr-2 py-2 rounded-xl border border-neutral-200 text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
                                              </div>
                                              {field.options.length > 1 && (
                                                <button type="button" onClick={() => { const s = [...customFields]; s[fIndex] = { ...s[fIndex], options: s[fIndex].options.filter((_, i) => i !== oIdx) }; onChange(s); }} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                                  <X className="w-4 h-4" />
                                                </button>
                                              )}
                                            </div>
                                          ))}
                                          <button type="button" onClick={() => { const s = [...customFields]; s[fIndex] = { ...s[fIndex], options: [...s[fIndex].options, { value: '', extraCharge: 0 }] }; onChange(s); }}
                                            className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold flex items-center gap-1.5 mt-2">
                                            <Plus className="w-4 h-4" /> Add Option
                                          </button>
                                        </div>
                                      )}

                                      {(() => {
                                        const depFields = allPriorFields.filter(f => ['dropdown', 'multiple_choice'].includes(f.type));
                                        const depField  = depFields.find(f => f.id === field.dependsOn);
                                        return depFields.length > 0 && (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5 pt-5 border-t border-neutral-100 relative z-40">
                                            <SelectField label="Depends On (Optional)" value={depField?.title || 'None'} onChange={(val) => {
                                              const dep = depFields.find(f => f.title === val);
                                              const s   = [...customFields];
                                              s[fIndex] = { ...s[fIndex], dependsOn: dep ? dep.id : null, showIfValue: dep ? s[fIndex].showIfValue : [] };
                                              onChange(s);
                                            }} options={['None', ...depFields.map(f => f.title)]} />
                                            {depField && (
                                              <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-neutral-700">Show if value is</label>
                                                <div className="flex flex-col gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200 max-h-32 overflow-y-auto">
                                                  {depField.options.map((opt, oIdx) => {
                                                    if (!opt.value) return null;
                                                    const currentVals = Array.isArray(field.showIfValue) ? field.showIfValue : (field.showIfValue ? [field.showIfValue] : []);
                                                    const isChecked   = currentVals.includes(opt.value);
                                                    return (
                                                      <label key={oIdx} className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" checked={isChecked} onChange={(e) => {
                                                          let arr  = [...currentVals];
                                                          if (e.target.checked) arr.push(opt.value); else arr = arr.filter(v => v !== opt.value);
                                                          const s  = [...customFields];
                                                          s[fIndex] = { ...s[fIndex], showIfValue: arr };
                                                          onChange(s);
                                                        }} className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500" />
                                                        <span className="text-sm text-neutral-700">{opt.value}</span>
                                                      </label>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}

                                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                                        <label htmlFor={`req-${fIndex}`} className="text-sm font-semibold text-neutral-700 cursor-pointer">Required</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                          <input type="checkbox" id={`req-${fIndex}`} className="sr-only peer" checked={!!field.required} onChange={(e) => {
                                            const s   = [...customFields];
                                            s[fIndex] = { ...s[fIndex], required: e.target.checked };
                                            onChange(s);
                                          }} />
                                          <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </label>
                                      </div>
                                    </div>
                                  );
                                })}
                                <button type="button" onClick={() => {
                                  const s = [...customFields];
                                  s.push({ id: Math.random().toString(36).substr(2, 9), title: '', placeholder: '', type: 'text', options: [{ value: '', extraCharge: 0 }], required: false, dependsOn: null, showIfValue: null });
                                  onChange(s);
                                }} className="w-full py-4 border-2 border-dashed border-emerald-300 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-3">
                                  <Plus className="w-5 h-5 text-emerald-600" /><span className="text-emerald-600 font-semibold text-sm">Add New Field</span>
                                </button>
                              </div>
                            </div>
                          )} />
                      )}
                    </div>
                  </div>
                )}

                {/* Section 8: Terms & Conditions */}
                {activeSection === 8 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader title="Terms & Conditions" description="Add your event-specific terms and conditions that attendees must accept" icon={Tag} number={8} />
                    <Controller name="termsAndConditions" control={control} rules={{ validate: v => v.filter(i => i.trim()).length > 0 || 'At least one term is required' }} render={({ field, fieldState }) => (
                      <NumberedSlotInput label="Event Terms & Conditions" value={field.value} onChange={field.onChange} error={fieldState.error?.message} placeholder="e.g., Cancellation is allowed up to 48 hours before..." required />
                    )} />
                  </div>
                )}

                {/* Section 9: Poster & Finalize */}
                {activeSection === 9 && (
                  <div className="space-y-6 sm:space-y-8">
                    <SectionHeader title="Poster & Finalize" description="Upload event poster and publish" icon={Upload} number={9} />
                    <div className="space-y-4">
                      <label className="block text-sm font-semibold text-neutral-700">Event Poster <span className="text-red-500">*</span></label>
                      {/* OPT #10 — posterPreviewUrl from useMemo, not URL.createObjectURL() in JSX */}
                      <div className={`border-2 border-dashed ${watchPoster ? 'border-emerald-500 bg-emerald-50/20' : 'border-neutral-300 hover:border-emerald-500'} rounded-2xl p-6 sm:p-8 text-center transition-all duration-200 relative`}>
                        <input type="file" accept="image/*" className="hidden" id="poster-upload" onChange={(e) => { if (e.target.files[0]) setValue('poster', e.target.files[0], { shouldValidate: true }); }} />
                        {watchPoster ? (
                          <div className="space-y-4 w-full">
                            <div className="relative inline-block w-full max-w-md mx-auto group">
                              <img src={posterPreviewUrl} alt="Poster Preview" className="w-full max-h-[300px] object-contain rounded-xl shadow-lg border border-emerald-200 mx-auto" />
                              <button type="button" onClick={() => setValue('poster', null, { shouldValidate: true })} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors">
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                            <label htmlFor="poster-upload" className="mt-4 text-emerald-600 hover:text-emerald-700 text-sm font-bold cursor-pointer underline inline-block">Change Image</label>
                          </div>
                        ) : (
                          <label htmlFor="poster-upload" className="cursor-pointer block">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 flex items-center justify-center">
                              <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
                            </div>
                            <p className="text-neutral-600 mb-2 text-sm sm:text-base font-medium">Click to upload your event poster</p>
                            <p className="text-xs sm:text-sm text-neutral-500">Recommended: 1200x630px, JPG or PNG</p>
                          </label>
                        )}
                        <input type="hidden" {...register('poster', { required: 'Event poster is required' })} />
                      </div>
                      {errors.poster && <p className="text-sm text-red-500 font-medium">{errors.poster.message}</p>}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-neutral-700">How would you like to proceed?</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button type="button" onClick={() => setPublishMode('publish')} className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 ${publishMode === 'publish' ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200' : 'border-neutral-200 hover:border-emerald-300 bg-white'}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${publishMode === 'publish' ? 'border-emerald-500' : 'border-neutral-300'}`}>
                              {publishMode === 'publish' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                            </div>
                            <PlayCircle className={`w-5 h-5 ${publishMode === 'publish' ? 'text-emerald-600' : 'text-neutral-400'}`} />
                            <span className={`font-semibold text-sm ${publishMode === 'publish' ? 'text-emerald-800' : 'text-neutral-700'}`}>Publish Now</span>
                          </div>
                          <p className="text-xs sm:text-sm text-neutral-500 ml-8">Your event will go live immediately and be visible to all users.</p>
                        </button>
                        <button type="button" onClick={() => setPublishMode('draft')} className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 ${publishMode === 'draft' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-neutral-200 hover:border-blue-300 bg-white'}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${publishMode === 'draft' ? 'border-blue-500' : 'border-neutral-300'}`}>
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
                      <h4 className="font-semibold text-emerald-800 mb-2 text-sm">{publishMode === 'draft' ? 'Save as Draft?' : 'Ready to Publish?'}</h4>
                      <p className="text-emerald-700 text-sm mb-4">
                        {publishMode === 'draft' ? 'Your event will be saved and you can publish it anytime from your Upcoming Events section.' : 'Review all information before publishing. Once published, your event will be visible to guests.'}
                      </p>
                      <div className="flex items-start gap-3">
                        <input type="checkbox" id="terms" {...register('acceptedTerms', { required: 'You must accept the terms' })} className="w-4 h-4 text-emerald-600 border-neutral-300 rounded focus:ring-emerald-500 mt-0.5" />
                        <label htmlFor="terms" className="text-sm text-neutral-700">
                          I accept bagspackgo's <Link href="/provider-terms" target="_blank" className="text-emerald-600 font-semibold hover:underline">Provider Terms & Conditions</Link> and <Link href="/provider-privacy" target="_blank" className="text-emerald-600 font-semibold hover:underline">Provider Privacy Policy</Link> and confirm that all information provided is accurate.
                        </label>
                      </div>
                      {errors.acceptedTerms && <p className="text-sm text-red-500 font-medium mt-2">{errors.acceptedTerms.message}</p>}
                    </div>
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
                  <button type="button" onClick={prevSection} disabled={activeSection === 0}
                    className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${activeSection === 0 ? 'text-neutral-400 cursor-not-allowed' : 'text-neutral-700 hover:bg-neutral-50 border border-neutral-200'}`}>
                    Previous
                  </button>
                  {activeSection < sectionTitles.length - 1 ? (
                    <button type="button" onClick={nextSection} className="px-5 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm">
                      Continue
                    </button>
                  ) : (
                    <button type="submit" disabled={isSubmitting}
                      className={`px-5 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 text-sm ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      {isSubmitting ? (
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