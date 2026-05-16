'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Calendar, Star, User, Ticket, ChevronRight, Info,
  AlertCircle, Map, CheckCircle, CreditCard, ShieldCheck, ArrowLeft,
  Mail, Phone, Upload, XCircle, ChevronDown, ExternalLink, HelpCircle,
  Minus, Plus, Navigation, Users, Sparkles, Bookmark, Share2, FileText
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Custom Dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2.5 border rounded-lg text-left flex items-center justify-between transition-all bg-white text-sm outline-none ${isOpen ? 'border-[#10b981] ring-1 ring-[#10b981] shadow-[0_0_0_1px_#10b981]' : 'border-[#d1d5db] hover:border-[#10b981]'} ${value ? 'text-gray-900' : 'text-gray-400'}`}
      >
        <span className="truncate">{value ? options.find(o => o.value === value)?.label : placeholder}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-gray-100 p-1 max-h-48 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full px-3 py-2 text-left text-sm transition-all flex items-center justify-between rounded-md my-0.5 ${value === opt.value ? 'bg-[#a7f3d0] text-[#065f46] font-medium' : 'hover:bg-[#d1fae5] hover:shadow-[inset_0_0_0_1px_#a7f3d0] text-[#1e293b]'}`}
              >
                {opt.label}
                {value === opt.value && <CheckCircle size={14} className="text-[#065f46]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ——————————— Custom Form Card ——————————— */
const CustomFormCard = ({ event, formData, formErrors, handleCustomFormChange, slotIndex }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {event.customFormFields.map((field, fIdx) => {
        if (field.dependsOn) {
          const depResp = formData.customFormResponses?.find(r => r.fieldId === field.dependsOn && r.slotIndex === slotIndex);
          if (!depResp) return null;
          const showVals = Array.isArray(field.showIfValue) ? field.showIfValue : [field.showIfValue];
          const userVals = Array.isArray(depResp.value) ? depResp.value : [depResp.value];
          const hasMatch = showVals.some(v => userVals.includes(v));
          if (!hasMatch) return null;
        }
        const response = formData.customFormResponses?.find(r => r.fieldId === field.id && r.slotIndex === slotIndex);
        const currentValue = response?.value || '';
        const hasError = formErrors[`cf.${slotIndex}.${field.id}`];

        return (
          <div key={field.id} className="relative space-y-2" style={{ zIndex: event.customFormFields.length - fIdx }}>
            <label className="block text-sm font-bold text-gray-800">
              {field.title} {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === 'text' && (
              <Input type="text" placeholder={field.placeholder || `Your answer`} value={currentValue}
                onChange={e => handleCustomFormChange(slotIndex, field, e.target.value)}
                className={`w-full h-11 bg-gray-50 focus-visible:bg-white transition-all ${hasError ? 'border-red-500 ring-red-500 bg-red-50/30' : 'border-gray-200'}`} />
            )}

            {field.type === 'number' && (
              <Input type="number" placeholder={field.placeholder || `Your answer`} value={currentValue}
                onChange={e => handleCustomFormChange(slotIndex, field, e.target.value)}
                className={`w-full h-11 bg-gray-50 focus-visible:bg-white transition-all ${hasError ? 'border-red-500 ring-red-500 bg-red-50/30' : 'border-gray-200'}`} />
            )}

            {field.type === 'dropdown' && (
              <div className="relative">
                <CustomSelect value={currentValue}
                  onChange={(val) => {
                    const opt = field.options?.find(o => o.value === val);
                    handleCustomFormChange(slotIndex, field, val, opt?.extraCharge || 0);
                  }}
                  options={(field.options || []).map(o => ({
                    value: o.value,
                    label: o.extraCharge > 0 ? `${o.value} (+₹${o.extraCharge})` : o.value
                  }))}
                  placeholder={field.placeholder || `Select ${field.title.toLowerCase()}`} />
              </div>
            )}

            {field.type === 'multiple_choice' && (
              <div className="space-y-2.5 mt-2">
                {(field.options || []).map((opt, oIdx) => (
                  <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${currentValue === opt.value ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name={`cf-${slotIndex}-${field.id}`} checked={currentValue === opt.value}
                      onChange={() => handleCustomFormChange(slotIndex, field, opt.value, opt.extraCharge || 0)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500" />
                    <span className="text-sm font-medium text-gray-700 flex-1">{opt.value}</span>
                    {opt.extraCharge > 0 && <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">+₹{opt.extraCharge}</span>}
                  </label>
                ))}
              </div>
            )}

            {field.type === 'checkbox' && (
              <div className="space-y-2.5 mt-2">
                {(field.options || []).map((opt, oIdx) => {
                  const checkedValues = Array.isArray(currentValue) ? currentValue : [];
                  const isChecked = checkedValues.includes(opt.value);
                  return (
                    <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input type="checkbox" checked={isChecked}
                        onChange={() => {
                          const newVals = isChecked ? checkedValues.filter(v => v !== opt.value) : [...checkedValues, opt.value];
                          const totalExtra = newVals.reduce((sum, v) => { const o = field.options.find(x => x.value === v); return sum + (o?.extraCharge || 0); }, 0);
                          handleCustomFormChange(slotIndex, field, newVals, totalExtra);
                        }}
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                      <span className="text-sm font-medium text-gray-700 flex-1">{opt.value}</span>
                      {opt.extraCharge > 0 && <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">+₹{opt.extraCharge}</span>}
                    </label>
                  );
                })}
              </div>
            )}

            {field.type === 'photo_upload' && (
              <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${currentValue ? 'border-gray-200 bg-gray-50/30' : hasError ? 'border-red-300 bg-red-50/30' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}>
                {currentValue ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                        <img src={currentValue} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-bold text-gray-900">Photo Uploaded</p>
                    </div>
                    <button type="button" onClick={() => handleCustomFormChange(slotIndex, field, '', 0)} className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                      <Upload size={14} className="rotate-180" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-2">
                    <Upload size={18} className="text-gray-400 mb-2" />
                    <p className="text-xs font-bold text-gray-600">Click to upload</p>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const img = new Image();
                        const objectUrl = URL.createObjectURL(file);
                        img.onload = () => {
                          const MAX = 800; let w = img.width, h = img.height;
                          if (w > MAX || h > MAX) { if (w > h) { h = Math.round(h * MAX / w); w = MAX; } else { w = Math.round(w * MAX / h); h = MAX; } }
                          const c = document.createElement('canvas'); c.width = w; c.height = h;
                          c.getContext('2d').drawImage(img, 0, 0, w, h);
                          handleCustomFormChange(slotIndex, field, c.toDataURL('image/jpeg', 0.6));
                          URL.revokeObjectURL(objectUrl);
                        };
                        img.src = objectUrl;
                      }} />
                  </label>
                )}
              </div>
            )}

            {hasError && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{"\u26A0"} {formErrors[`cf.${slotIndex}.${field.id}`]}</p>}
          </div>
        );
      })}
    </div>
  );
};

const EventDetails = ({ event }) => {
  const router = useRouter();
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const isUserAuthenticated = !authLoading && user?.role === "user";
  const [isInitialized, setIsInitialized] = useState(false);

  // â”€â”€ View state: 'details' or 'booking' â”€â”€
  const [currentView, setCurrentView] = useState('details');

  // â”€â”€ Tabs for the details view â”€â”€
  const [activeTab, setActiveTab] = useState('eventDetails');
  const tabsRef = useRef(null);
  const tabs = [
    { key: 'eventDetails', label: 'Event Details' },
    { key: 'itinerary', label: 'Itinerary' },
    { key: 'info', label: 'Important Info' },
  ];
  const currentTabIndex = tabs.findIndex(t => t.key === activeTab);

  const goToNextTab = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1].key);
      // Scroll to the tabs header, not the top of the page
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  // â”€â”€ Photo lightbox â”€â”€
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  // â”€â”€ Booking state â”€â”€
  const [bookingSlots, setBookingSlots] = useState(1);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedPickup, setSelectedPickup] = useState('');
  const [pickupDropdownOpen, setPickupDropdownOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ 0: true });
  const [expandedFaqs, setExpandedFaqs] = useState({});
  const toggleSection = (index) => setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  const toggleFaq = (index) => setExpandedFaqs(prev => ({ ...prev, [index]: !prev[index] }));

  const [formErrors, setFormErrors] = useState({});
  const [slotError, setSlotError] = useState('');

  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // â”€â”€ Save & Share state â”€â”€
  const [isSaved, setIsSaved] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const [formData, setFormData] = useState({
    contactDetails: { email: user?.email || '', phone: user?.phone || '' },
    participants: [createEmptyParticipant()],
    customFormResponses: []
  });
  const [extraChargesTotal, setExtraChargesTotal] = useState(0);

  useEffect(() => {
    if (user && (!formData.contactDetails.email || !formData.contactDetails.phone)) {
        setFormData(prev => ({
            ...prev,
            contactDetails: {
                email: prev.contactDetails.email || user.email || '',
                phone: prev.contactDetails.phone || user.phone || ''
            }
        }));
    }
  }, [user]);

  useEffect(() => {
    if (!isInitialized) {
       try {
         const saved = localStorage.getItem("temp_event_booking");
         if (saved) {
             const parsed = JSON.parse(saved);
             if (parsed && typeof parsed === 'object') {
                if (parsed.formData) {
                  setFormData(prev => ({ ...prev, ...parsed.formData, customFormResponses: parsed.formData.customFormResponses || [] }));
                }
                if (parsed.bookingSlots) setBookingSlots(parsed.bookingSlots);
                if (parsed.selectedPickup) setSelectedPickup(parsed.selectedPickup);
             }
         }
       } catch (e) {}
       setIsInitialized(true);
    }

    // Load Razorpay script (avoid duplicates)
    let script;
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
    return () => {
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isInitialized]);


  useEffect(() => {
    if (!isInitialized) return;
    const saveObj = {
        formData,
        bookingSlots,
        selectedPickup
    };
    localStorage.setItem('temp_event_booking', JSON.stringify(saveObj));
    
    // Resume unfinished booking logic
    const hasData = formData.contactDetails.email || formData.contactDetails.phone || formData.participants[0]?.name;
    if (hasData && currentView === 'booking') {
      const pendingData = localStorage.getItem('pending_booking');
      let parsedPending = pendingData ? JSON.parse(pendingData) : { ignored: false };
      
      if (!parsedPending.ignored) {
         parsedPending = {
            ...parsedPending,
            ignored: false,
            url: window.location.pathname + window.location.search,
            timestamp: Date.now()
         };
         localStorage.setItem('pending_booking', JSON.stringify(parsedPending));
      }
    }
  }, [formData, bookingSlots, selectedPickup, isInitialized, currentView]);

  // Auto-prompt login after 13s on details view (gentle, closable)
  const loginPromptFiredRef = useRef(false);
  useEffect(() => {
    if (currentView === 'details' && !authLoading && !user && !loginPromptFiredRef.current) {
      const timer = setTimeout(() => {
        loginPromptFiredRef.current = true;
        openAuthModal({ closable: true, stayOnPage: true });
      }, 13000);
      return () => clearTimeout(timer);
    }
  }, [currentView, authLoading, user, openAuthModal]);

  // Force login when entering booking section (mandatory, non-closable)
  useEffect(() => {
    if (currentView === 'booking') {
      if (authLoading) return;
      if (!isUserAuthenticated) {
        const timer = setTimeout(() => {
          openAuthModal({ closable: false, hideTabs: true, tab: 'user' });
        }, 3500); // 3.5 seconds delay
        return () => clearTimeout(timer);
      }
    }
  }, [currentView, authLoading, isUserAuthenticated, openAuthModal]);

  // â”€â”€ Check if event is saved â”€â”€
  useEffect(() => {
    if (!isUserAuthenticated) return;
    (async () => {
      try {
        const res = await fetch('/api/user/saved');
        const data = await res.json();
        if (data.success && data.saved) {
          const eventId = event._id || event.id;
          setIsSaved(data.saved.some(item => item.itemId === eventId));
        }
      } catch {}

      try {
        const eventId = event._id || event.id;
        const res = await fetch(`/api/user/events/${eventId}/wish/status`);
        if (res.ok) {
            const data = await res.json();
            setIsWished(data.isWished);
        }
      } catch {}
    })();
  }, [isUserAuthenticated, event._id, event.id]);

  const handleSaveEvent = async () => {
    if (!isUserAuthenticated) {
      openAuthModal({ closable: true, tab: 'user' });
      return;
    }
    const eventId = event._id || event.id;
    try {
      if (isSaved) {
        const res = await fetch(`/api/user/saved?itemId=${eventId}`, { method: 'DELETE' });
        if (res.ok) setIsSaved(false);
      } else {
        const res = await fetch('/api/user/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: eventId, itemType: 'event' }),
        });
        if (res.ok) {
          setIsSaved(true);
          setShowSaveToast(true);
          setTimeout(() => setShowSaveToast(false), 5000);
        }
      }
    } catch (err) {
      console.error('Failed to update saved status', err);
    }
  };

  const handleWish = async () => {
    if (!isUserAuthenticated) {
      openAuthModal({ closable: true, tab: 'user' });
      return;
    }
    try {
      const eventId = event._id || event.id;
      const res = await fetch(`/api/user/events/${eventId}/wish`, {
          method: 'POST'
      });
      if (res.ok) {
          setIsWished(true);
      }
    } catch (err) {
      console.error('Failed to wish for event', err);
    }
  };

  const handleShareEvent = async () => {
    const shareData = {
      title: event.name || event.title || 'Check out this event!',
      text: `Check out this amazing event on bagspackgo!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing', err);
    }
  };

  function createEmptyParticipant() {
    return { name: '', age: '', gender: '', phone: '', nationality: '', idType: '', idNumber: '', idProofImage: '' };
  }

  const handleContactChange = (field, value) => {
    setFormData(prev => ({ ...prev, contactDetails: { ...prev.contactDetails, [field]: value } }));
  };

  const handleParticipantChange = (index, field, value) => {
    setFormData(prev => {
      const newP = [...prev.participants];
      newP[index] = { ...newP[index], [field]: value };
      return { ...prev, participants: newP };
    });
  };

  const handleCustomFormChange = (slotIndex, field, value, extraCharge = 0) => {
    setFormData(prev => {
      const existing = Array.isArray(prev.customFormResponses) ? [...prev.customFormResponses] : [];
      const index = existing.findIndex(r => r.fieldId === field.id && r.slotIndex === slotIndex);
      
      if (index >= 0) {
        existing[index] = { ...existing[index], value, extraCharge };
      } else {
        existing.push({
          slotIndex,
          fieldId: field.id,
          fieldTitle: field.title,
          value,
          extraCharge
        });
      }
      
      return { ...prev, customFormResponses: existing };
    });
  };

  useEffect(() => {
    // Only count responses that belong to a valid slotIndex (in case slots were reduced)
    const validResponses = Array.isArray(formData.customFormResponses) 
        ? formData.customFormResponses.filter(r => r.slotIndex < bookingSlots) 
        : [];
    const newTotalExtra = validResponses.reduce((sum, res) => sum + (res.extraCharge || 0), 0);
    setExtraChargesTotal(newTotalExtra);
  }, [formData.customFormResponses, bookingSlots]);

  useEffect(() => {
    setFormData(prev => {
      const cur = prev.participants.length;
      if (bookingSlots > cur) {
        const added = Array.from({ length: bookingSlots - cur }, () => createEmptyParticipant());
        return { ...prev, participants: [...prev.participants, ...added] };
      }
      if (bookingSlots < cur) {
        return { ...prev, participants: prev.participants.slice(0, bookingSlots) };
      }
      return prev;
    });
    // No need to setExtraChargesTotal here as the new useEffect handles it
  }, [bookingSlots]);

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const selectedPickupObj = event.pickupPoints?.find(p => p.location === selectedPickup);

  const handleBookNowClick = () => {
    setCurrentView('booking');
    setBookingStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReviewJourney = () => {
    const errors = {};

    const max = event.slotsLeft !== undefined ? event.slotsLeft : 50;
    if (bookingSlots > max) {
        setSlotError(`Only ${max} slots available`);
        return window.scrollTo({ top: 100, behavior: 'smooth' });
    }

    if (!formData.contactDetails.email) errors['contact.email'] = 'Email is required';
    if (!formData.contactDetails.phone) errors['contact.phone'] = 'Phone is required';

    if (!selectedPickup && event.pickupPoints?.length > 0) {
      errors['pickup'] = 'Please select a pickup point';
    }

    for (let i = 0; i < bookingSlots; i++) {
      const p = formData.participants[i];
      if (!p.name) errors[`p.${i}.name`] = 'Full name is required';
      if (!p.age) errors[`p.${i}.age`] = 'Age is required';
      if (!p.phone) errors[`p.${i}.phone`] = 'Mobile number is required';
      if (!p.gender) errors[`p.${i}.gender`] = 'Gender is required';
      if (!p.nationality) errors[`p.${i}.nationality`] = 'Nationality is required';
      if (!p.idType) errors[`p.${i}.idType`] = 'ID proof type is required';
      if (!p.idNumber) errors[`p.${i}.idNumber`] = 'ID number is required';
      if (!p.idProofImage) errors[`p.${i}.idProofImage`] = 'ID proof document is required';
    }

    if (event.applicationFormType === 'customized') {
      // Validate Custom Form Fields for each slot
      for (let i = 0; i < bookingSlots; i++) {
        event.customFormFields?.forEach((field) => {
          // Check if field depends on another field and if the condition is met
          if (field.dependsOn) {
             const dependentResponse = formData.customFormResponses.find(r => r.fieldId === field.dependsOn && r.slotIndex === i);
             if (!dependentResponse) return;
             const showVals = Array.isArray(field.showIfValue) ? field.showIfValue : [field.showIfValue];
             const userVals = Array.isArray(dependentResponse.value) ? dependentResponse.value : [dependentResponse.value];
             const hasMatch = showVals.some(v => userVals.includes(v));
             if (!hasMatch) {
                return; // Skip validation if condition not met
             }
          }
          
          if (field.required) {
            const response = formData.customFormResponses.find(r => r.fieldId === field.id && r.slotIndex === i);
            if (!response || !response.value || (Array.isArray(response.value) && response.value.length === 0)) {
              errors[`cf.${i}.${field.id}`] = `${field.title} is required`;
            }
          }
        });
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Auto-expand first section with error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey.startsWith('p.')) {
        const index = parseInt(firstErrorKey.split('.')[1]);
        setExpandedSections(prev => ({ ...prev, [index]: true }));
      }
      return window.scrollTo({ top: 150, behavior: 'smooth' });
    }

    setFormErrors({});
    setBookingStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Payment Calculations
  const subtotal = (event.price || 0) * bookingSlots;
  const baseForFees = subtotal + extraChargesTotal;
  const platformFee = Math.round(baseForFees * 0.03);
  const gatewayFee = Math.round(baseForFees * 0.02);
  const gstOnGateway = Math.round(gatewayFee * 0.18);
  const totalFees = platformFee + gatewayFee + gstOnGateway;
  const totalPayable = baseForFees + totalFees;

  const handleBooking = async (e) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setFormErrors({});

    if (!agreedToTerms) {
      setFormErrors({ terms: 'Please agree to the Terms & Conditions to proceed.' });
      setIsProcessingPayment(false);
      return;
    }

    try {
      // Find the selected pickup point object
      const pickupObj = event.pickupPoints?.find(p => p.location === selectedPickup) || null;

      const bookRes = await fetch('/api/user/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: event._id || event.id,
          slots: bookingSlots,
          amountPaid: totalPayable,
          contactDetails: formData.contactDetails,
          participants: formData.participants.slice(0, bookingSlots),
          selectedPickup: pickupObj ? { location: pickupObj.location, link: pickupObj.link || '', time: pickupObj.time || '' } : null,
          customFormResponses: event.applicationFormType === 'customized' 
              ? formData.customFormResponses.filter(r => r.slotIndex < bookingSlots) 
              : [],
          extraChargesTotal: event.applicationFormType === 'customized' ? extraChargesTotal : 0
        })
      });
      const bookData = await bookRes.json();
      if (!bookData.success) {
        if (bookData.message?.toLowerCase().includes('sold out') || bookData.message?.toLowerCase().includes('slot')) {
          router.push(`/user/event/booking-failed?soldOut=true&return=/user/events`);
          return;
        }
        throw new Error(bookData.message || 'Booking failed');
      }
      const bookingId = bookData.bookingId;

      // ── Free Event: skip payment gateway entirely ──
      if (totalPayable === 0) {
        const verifyRes = await fetch('/api/payments/event-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: `mock_order_free_${Date.now()}`,
            razorpay_payment_id: `free_pay_${Date.now()}`,
            bookingId
          })
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          if (verifyData.soldOut) {
            router.push(`/user/event/booking-failed?soldOut=true&return=/user/events`);
          } else {
            throw new Error(verifyData.message || 'Booking confirmation failed');
          }
          return;
        }
        localStorage.removeItem('pending_booking');
        localStorage.removeItem('temp_event_booking');
        router.push(`/user/event/booking-success?bookingId=${bookingId}`);
        return;
      }

      const orderRes = await fetch('/api/payments/event-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPayable, bookingId })
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        if (orderData.soldOut) {
          router.push(`/user/event/booking-failed?soldOut=true&return=/user/events`);
          return;
        }
        throw new Error(orderData.message || 'Order creation failed');
      }

      const { orderId, key } = orderData;

      if (typeof window.Razorpay !== "function") {
        throw new Error("Payment gateway is still loading. Please wait a moment and try again.");
      }

      const rzp = new window.Razorpay({
        key,
        amount: totalPayable * 100,
        currency: 'INR',
        order_id: orderId,
        name: 'bagspackgo',
        description: `Booking: ${event.title || event.name || 'Event'}`,
        prefill: {
          email: formData.contactDetails?.email || "",
          contact: formData.contactDetails?.phone || "",
          name: formData.participants?.[0]?.name || "",
        },
        theme: { color: "#059669" },
        handler: async (response) => {
          const verifyRes = await fetch('/api/payments/event-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            localStorage.removeItem('pending_booking');
            localStorage.removeItem('temp_event_booking');
            router.push(`/user/event/booking-success?bookingId=${bookingId}`);
          } else if (verifyData.soldOut) {
            localStorage.removeItem('pending_booking');
            localStorage.removeItem('temp_event_booking');
            router.push(`/user/event/booking-failed?soldOut=true&return=/user/events`);
          } else {
            router.push(`/user/event/booking-failed?return=/user/events/eventdetails/${event._id || event.id}`);
          }
        },
        modal: { ondismiss: () => setIsProcessingPayment(false) }
      });

      rzp.on('payment.failed', function (response) {
         router.push(`/user/event/booking-failed?return=/user/events/eventdetails/${event._id || event.id}`);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      router.push(`/user/event/booking-failed?return=/user/events/eventdetails/${event._id || event.id}`);
    }
  };

  // â”€â”€ Custom select style override for emerald theme â”€â”€
  const selectClassName = "w-full p-2.5 border rounded-lg outline-none text-sm border-gray-300 bg-white appearance-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600";

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• RENDER â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

  // â”€â”€ Save Toast â”€â”€
  const saveToast = showSaveToast && (
    <div className="fixed bottom-4 sm:bottom-6 sm:right-6 z-[100] flex w-full max-w-[420px] flex-col p-4 sm:p-0">
      <div className="pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-slate-200 bg-white p-6 shadow-lg animate-in fade-in slide-in-from-bottom-5 font-sans">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-slate-950">Event Saved</p>
          <p className="text-sm text-slate-500">Added to your favorites.</p>
        </div>
        <a href="/user/saved" className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-transparent px-3 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:pointer-events-none disabled:opacity-50">
          View
        </a>
      </div>
    </div>
  );

  // â”€â”€ BOOKING VIEW â”€â”€
  if (currentView === 'booking') {
    return (
      <div className="w-full bg-gray-50 min-h-screen pb-24 relative z-[60] pt-6 sm:pt-8 -mt-20 border-t border-gray-200">
        {saveToast}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          {bookingStep === 1 ? (
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* â”€â”€ Form Details (Left) â”€â”€ */}
              <div className="w-full lg:w-[65%] space-y-6">

                {/* Card: Number of Participants */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => { setCurrentView('details'); setBookingStep(1); }}
                        className="mt-1 w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-200 hover:bg-gray-50 transition-all flex-shrink-0 shadow-sm group"
                      >
                        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                      </button>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Number of Participants</h2>
                        <p className="text-gray-500 text-sm font-medium">{event.price ? <>{"\u20B9"}{event.price.toLocaleString()} per person</> : 'Free per person'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100 w-full sm:w-48 shadow-inner">
                            <button
                                onClick={() => {
                                    setBookingSlots(s => Math.max(1, s - 1));
                                    setSlotError('');
                                }}
                                className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 active:scale-90"
                            >
                                <Minus size={18} />
                            </button>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-black text-gray-900 leading-none">{bookingSlots}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Slots</span>
                            </div>
                            <button
                                onClick={() => {
                                    const max = event.slotsLeft !== undefined ? event.slotsLeft : 50;
                                    if (bookingSlots >= max) {
                                      setSlotError(`Only ${max} slots available`);
                                      return;
                                    }
                                    setBookingSlots(s => s + 1);
                                    setSlotError('');
                                }}
                                className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-600 active:scale-90"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                        {slotError && (
                            <motion.p 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[10px] font-bold text-red-500 uppercase tracking-wider"
                            >
                                {"\u26A0"} {slotError}
                            </motion.p>
                        )}
                    </div>
                  </div>
                </div>

                {/* Card: Pickup Point */}
                {event.includePickup !== false && event.pickupPoints?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Select Pickup Point</h2>
                    <div className="relative z-50">
                      <button
                        type="button"
                        onClick={() => setPickupDropdownOpen(!pickupDropdownOpen)}
                        className={`w-full px-4 py-3 rounded-lg border flex items-center justify-between transition-all bg-white shadow-sm outline-none ${formErrors['pickup'] ? 'border-red-500 ring-1 ring-red-500' : selectedPickup ? 'border-[#10b981] shadow-[0_0_0_1px_#10b981]' : 'border-[#d1d5db] hover:border-[#10b981]'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <MapPin size={18} className={selectedPickup ? 'text-gray-900' : 'text-gray-400'} />
                          {selectedPickup ? (
                            <div className="min-w-0 text-left">
                              <p className="font-semibold text-gray-900 text-sm truncate">{selectedPickup}</p>
                              {selectedPickupObj?.time && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                                  <Clock size={12} /> {selectedPickupObj.time}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Choose a pickup location...</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {selectedPickupObj?.link && (
                            <a
                              href={selectedPickupObj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-gray-900 hover:text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-semibold transition-all focus:outline-none"
                            >
                              <Navigation size={12} /> <span className="hidden sm:inline">Map</span>
                            </a>
                          )}
                          <ChevronDown size={18} className={`text-gray-400 transition-transform ${pickupDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {pickupDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-gray-100 p-1 max-h-60 overflow-y-auto"
                          >
                            {event.pickupPoints.map((point, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => { setSelectedPickup(point.location); setPickupDropdownOpen(false); }}
                                className={`w-full px-3 py-2 text-left transition-all flex items-center justify-between gap-3 rounded-md my-0.5 ${selectedPickup === point.location ? 'bg-[#a7f3d0] text-[#065f46] font-medium' : 'hover:bg-[#d1fae5] hover:shadow-[inset_0_0_0_1px_#a7f3d0] text-[#1e293b]'}`}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <MapPin size={16} className={selectedPickup === point.location ? 'text-gray-900' : 'text-gray-400'} />
                                  <div className="min-w-0">
                                    <p className="font-semibold text-sm truncate">{point.location}</p>
                                    {point.time && (
                                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                        <Clock size={11} /> {point.time}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {selectedPickup === point.location && <CheckCircle size={18} className="text-[#065f46] flex-shrink-0" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Card: Primary Contact */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Contact Information</h2>
                  <p className="text-gray-500 text-sm mb-6 font-medium">Booking confirmation & tickets will be sent here.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                        <Input type="email" placeholder="your@email.com" value={formData.contactDetails.email} onChange={e => handleContactChange('email', e.target.value)}
                          className={`w-full pl-10 h-12 bg-gray-50 focus:bg-white transition-all ${formErrors['contact.email'] ? 'border-red-500 ring-red-500' : 'border-gray-200'}`} />
                      </div>
                      {formErrors['contact.email'] && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase letter-spacing-wide">{"\u26A0"} {formErrors['contact.email']}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                        <Input type="tel" placeholder="9876543210" value={formData.contactDetails.phone} onChange={e => handleContactChange('phone', e.target.value)}
                          className={`w-full pl-10 h-12 bg-gray-50 focus:bg-white transition-all ${formErrors['contact.phone'] ? 'border-red-500 ring-red-500' : 'border-gray-200'}`} maxLength="10" />
                      </div>
                      {formErrors['contact.phone'] && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 uppercase letter-spacing-wide">{"\u26A0"} {formErrors['contact.phone']}</p>}
                    </div>
                  </div>
                </div>


                
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Traveller Details</h2>
                  <p className="text-gray-500 text-sm mb-6 font-medium">Required by the organizer for verification & permits.</p>
                  <div className="space-y-4">
                    {Array.from({ length: bookingSlots }).map((_, i) => {
                      const p = formData.participants[i] || {};
                      const isExpanded = expandedSections[i] || (bookingSlots === 1);
                      const isFilled = p.name && p.age && p.gender;

                      return (
                        <div key={i} className={`border border-gray-200 rounded-xl bg-white shadow-sm transition-all group ${isExpanded ? 'z-40 relative' : 'z-10 relative'}`} style={{ overflow: isExpanded ? 'visible' : 'hidden' }}>
                          <button
                            onClick={() => toggleSection(i)}
                            className={`w-full flex justify-between items-center p-4 sm:p-5 transition-colors ${isExpanded ? 'bg-gray-50/40 border-b border-gray-200 cursor-default rounded-t-xl' : isFilled ? 'bg-gray-50 hover:bg-gray-100 rounded-xl' : 'bg-white hover:bg-gray-50 rounded-xl'}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors shadow-sm font-bold text-sm ${formErrors[`p.${i}.name`] || formErrors[`p.${i}.age`] || formErrors[`p.${i}.gender`] ? 'bg-red-50 text-red-500 border border-red-200' : isFilled ? 'bg-gray-100 text-gray-900 border border-gray-200' : 'bg-white border border-gray-300 text-gray-500 group-hover:border-gray-300 group-hover:text-gray-900'}`}>
                                {isFilled ? <CheckCircle className="w-4 h-4" /> : (i + 1)}
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-bold text-gray-900">Traveller {i + 1}</p>
                                {!isExpanded && isFilled && (
                                  <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
                                    {p.name} {"\u00B7"} Age {p.age} {"\u00B7"} {p.gender?.charAt(0).toUpperCase() + p.gender?.slice(1)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown className={`w-5 h-5 ${isExpanded ? 'text-gray-900' : 'text-gray-400'}`} />
                            </motion.div>
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="rounded-b-xl"
                              >
                                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white rounded-b-xl overflow-visible">
                                  <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name <span className="text-gray-900">*</span></label>
                                    <Input placeholder="As per official ID" value={p.name || ''} onChange={e => handleParticipantChange(i, 'name', e.target.value)}
                                      className={`h-11 ${formErrors[`p.${i}.name`] ? 'border-red-500 ring-red-500 bg-red-50/30' : 'border-gray-200'}`} />
                                    {formErrors[`p.${i}.name`] && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{"\u26A0"} {formErrors[`p.${i}.name`]}</p>}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Age <span className="text-gray-900">*</span></label>
                                    <Input placeholder="Enter age" type="number" min="1" max="100" value={p.age || ''} onChange={e => handleParticipantChange(i, 'age', e.target.value)}
                                      className={`h-11 ${formErrors[`p.${i}.age`] ? 'border-red-500 ring-red-500 bg-red-50/30' : 'border-gray-200'}`} />
                                    {formErrors[`p.${i}.age`] && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{"\u26A0"} {formErrors[`p.${i}.age`]}</p>}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Mobile Number <span className="text-gray-900">*</span></label>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                                      <Input placeholder="9876543210" type="tel" maxLength="10" value={p.phone || ''} onChange={e => handleParticipantChange(i, 'phone', e.target.value)}
                                        className={`h-11 pl-10 ${formErrors[`p.${i}.phone`] ? 'border-red-500 ring-red-500 bg-red-50/30' : 'border-gray-200'}`} />
                                    </div>
                                    {formErrors[`p.${i}.phone`] && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{"\u26A0"} {formErrors[`p.${i}.phone`]}</p>}
                                  </div>
                                  <div className="relative z-[60]">
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Gender <span className="text-gray-900">*</span></label>
                                    <CustomSelect
                                      value={p.gender || ''}
                                      onChange={(val) => handleParticipantChange(i, 'gender', val)}
                                      options={[
                                        { value: 'male', label: 'Male' },
                                        { value: 'female', label: 'Female' },
                                        { value: 'other', label: 'Other' }
                                      ]}
                                      placeholder="Select Gender"
                                    />
                                    {formErrors[`p.${i}.gender`] && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{"\u26A0"} {formErrors[`p.${i}.gender`]}</p>}
                                  </div>
                                  <div className="relative z-[50]">
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Nationality <span className="text-gray-900">*</span></label>
                                    <Input placeholder="E.g., Indian" value={p.nationality || ''} onChange={e => handleParticipantChange(i, 'nationality', e.target.value)}
                                      className={`h-11 ${formErrors[`p.${i}.nationality`] ? 'border-red-500 ring-red-500 bg-red-50/30' : 'border-gray-200'}`} />
                                    {formErrors[`p.${i}.nationality`] && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{"\u26A0"} {formErrors[`p.${i}.nationality`]}</p>}
                                  </div>
                                  <div className="relative z-[40]">
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">ID Type <span className="text-gray-900">*</span></label>
                                    <CustomSelect
                                      value={p.idType || ''}
                                      onChange={(val) => handleParticipantChange(i, 'idType', val)}
                                      options={[
                                        { value: 'aadhar', label: 'Aadhar Card' },
                                        { value: 'pan', label: 'PAN Card' },
                                        { value: 'voter', label: 'Voter ID' },
                                        { value: 'passport', label: 'Passport' },
                                        { value: 'dl', label: 'Driving License' }
                                      ]}
                                      placeholder="Select ID Proof"
                                    />
                                    {formErrors[`p.${i}.idType`] && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{"\u26A0"} {formErrors[`p.${i}.idType`]}</p>}
                                  </div>
                                  {p.idType && (
                                    <div>
                                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">ID Number <span className="text-gray-900">*</span></label>
                                      <Input placeholder="Enter ID number" value={p.idNumber || ''} onChange={e => handleParticipantChange(i, 'idNumber', e.target.value)}
                                        className={`h-11 ${formErrors[`p.${i}.idNumber`] ? 'border-red-500 ring-red-500 bg-red-50/30' : 'border-gray-200'}`} />
                                      {formErrors[`p.${i}.idNumber`] && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{"\u26A0"} {formErrors[`p.${i}.idNumber`]}</p>}
                                    </div>
                                  )}


                                  {/* ID Proof Upload Section */}
                                  <div className="md:col-span-2 pt-4 border-t border-gray-100 mt-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Upload ID Proof (Front Side) <span className="text-red-500">*</span></label>
                                    <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${p.idProofImage ? 'border-gray-200 bg-gray-50/30' : formErrors[`p.${i}.idProofImage`] ? 'border-red-300 bg-red-50/30 animate-pulse' : 'border-gray-200 hover:border-gray-200 bg-gray-50'}`}>
                                      {p.idProofImage ? (
                                        <div className="flex items-center justify-between gap-4">
                                          <div className="flex items-center gap-3">
                                            <div className="relative w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                                              <img src={p.idProofImage} alt="ID Preview" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                              <p className="text-xs font-bold text-gray-900">ID Proof Uploaded</p>
                                              <p className="text-[10px] text-gray-900 font-medium">Ready for verification</p>
                                            </div>
                                          </div>
                                          <button onClick={() => handleParticipantChange(i, 'idProofImage', '')} className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                                            <Upload size={14} className="rotate-180" />
                                          </button>
                                        </div>
                                      ) : (
                                        <label className="flex flex-col items-center justify-center cursor-pointer py-2">
                                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                                            <Upload size={18} className="text-gray-400" />
                                          </div>
                                          <p className="text-xs font-bold text-gray-600">Click to upload ID image</p>
                                          <p className="text-[10px] text-gray-400 mt-1">JPEG, PNG up to 5MB</p>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files[0];
                                              if (file) {
                                                // Compress image before converting to base64 to avoid huge payloads
                                                const img = new Image();
                                                const objectUrl = URL.createObjectURL(file);
                                                img.onload = () => {
                                                  const MAX_DIM = 800;
                                                  let w = img.width, h = img.height;
                                                  if (w > MAX_DIM || h > MAX_DIM) {
                                                    if (w > h) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM; }
                                                    else { w = Math.round(w * MAX_DIM / h); h = MAX_DIM; }
                                                  }
                                                  const canvas = document.createElement('canvas');
                                                  canvas.width = w;
                                                  canvas.height = h;
                                                  const ctx = canvas.getContext('2d');
                                                  ctx.drawImage(img, 0, 0, w, h);
                                                  const compressed = canvas.toDataURL('image/jpeg', 0.6);
                                                  handleParticipantChange(i, 'idProofImage', compressed);
                                                  URL.revokeObjectURL(objectUrl);
                                                };
                                                img.src = objectUrl;
                                              }
                                            }}
                                          />
                                        </label>
                                      )}
                                    </div>
                                    {formErrors[`p.${i}.idProofImage`] && <p className="text-[10px] text-red-500 font-bold mt-1.5 uppercase">{"\u26A0"} {formErrors[`p.${i}.idProofImage`]}</p>}
                                  </div>

                                  {/* Custom Form integration inside Traveller Details */}
                                  {event.applicationFormType === 'customized' && event.customFormFields?.length > 0 && (
                                    <div className="md:col-span-2 pt-6 border-t border-gray-100 mt-2">
                                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Other Information</h3>
                                        <CustomFormCard event={event} formData={formData} formErrors={formErrors} handleCustomFormChange={handleCustomFormChange} slotIndex={i} />
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* â”€â”€ Event Summary Sticky Block (Right) â”€â”€ */}
              <div className="w-full lg:w-[35%] lg:sticky lg:top-28">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/40 overflow-hidden">
                  <div className="hidden lg:block p-6 border-b border-gray-100 bg-white">
                    <h3 className="font-bold text-gray-900 text-lg mb-6">Event Summary</h3>
                    <div className="w-full h-44 rounded-xl overflow-hidden mb-5 border border-gray-100 shadow-sm relative">
                      <img src={event.image || '/images/EventCover.webp'} alt={event.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                        <p className="text-white font-bold text-lg leading-tight line-clamp-2">{event.name}</p>
                      </div>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-900"><Calendar size={16} /></div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Start Date</span>
                          {formattedDate}
                        </div>
                      </div>
                      {event.duration && (
                        <div className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-900"><Clock size={16} /></div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Duration</span>
                            {event.duration}
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-900"><MapPin size={16} /></div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Location</span>
                          {event.destinationId}
                        </div>
                      </div>
                    </div>

                    {event.highlights && event.highlights.length > 0 && (
                      <div className="pt-5 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Highlights</p>
                        <ul className="space-y-2.5">
                          {event.highlights.slice(0, 4).map((h, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 font-medium">
                              <CheckCircle size={15} className="text-gray-900 mt-0.5 flex-shrink-0" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="p-6 bg-[#FAFAFA]">
                    <Button onClick={handleReviewJourney} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 rounded-xl text-lg flex items-center justify-center gap-2">
                      Continue to Review <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* â”€â”€ Review Journey View â”€â”€ */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative">

                <div className="p-8 sm:p-12 relative z-10">
                  <div className="flex items-center gap-6 mb-10">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setBookingStep(1)}
                      className="w-12 h-12 rounded-2xl border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft size={24} />
                    </Button>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-gray-900 leading-none mb-1">{totalPayable === 0 ? 'Review & Confirm' : 'Review & Pay'}</h2>
                      <p className="text-gray-500 text-sm font-medium">{totalPayable === 0 ? 'Verify all details before confirming.' : 'Verify all details before payment.'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Left: Summary Grid */}
                    <div className="space-y-6">
                      <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200 space-y-5">
                        <div>
                          <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-3">Event Summary</p>
                          <div className="w-full max-h-80 rounded-xl overflow-hidden mb-4 border border-gray-200 shadow-sm bg-black flex items-center justify-center">
                            <img src={event.image || '/images/EventCover.webp'} alt={event.name} className="max-w-full max-h-80 w-auto h-auto object-contain" />
                          </div>
                          <p className="font-bold text-gray-900 text-xl leading-tight mb-2">{event.name}</p>
                          <p className="font-bold text-gray-500 text-sm flex items-center gap-2"><Calendar size={15} className="text-emerald-600" /> {formattedDate}</p>
                        </div>

                        {selectedPickup && (
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-2">Pickup Details</p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                              <MapPin size={16} className="text-emerald-600 flex-shrink-0" />
                              <span className="truncate">{selectedPickup}</span>
                            </div>
                            {selectedPickupObj?.time && <p className="text-gray-500 text-xs font-medium mt-1 ml-6">{selectedPickupObj.time}</p>}
                          </div>
                        )}

                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest mb-3">{`Travellers (${bookingSlots})`}</p>
                          <div className="space-y-2.5">
                            {Array.from({ length: bookingSlots }).map((_, i) => {
                              return (
                                <div key={i} className="flex justify-between items-center text-sm">
                                  <span className="font-bold text-gray-900">{formData.participants[i]?.name}</span>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-gray-500 font-medium capitalize">
                                      {formData.participants[i]?.gender?.charAt(0)} {"\u00B7"} {formData.participants[i]?.age}
                                    </span>
                                    {formData.participants[i]?.idProofImage && (
                                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 border border-emerald-200">
                                        <CheckCircle size={8} /> ID ATTACHED
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Payment Breakdown */}
                    <div>
                      <div className="border border-gray-200 bg-gray-50/50 rounded-2xl p-6 sm:p-8 h-full flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">{totalPayable === 0 ? 'Booking Summary' : 'Payment Breakdown'}</p>

                          {/* Calculation variables */}
                          {(() => {
                            return (
                              <div className="space-y-5">
                                <div className="flex justify-between items-start gap-4 text-gray-700 font-bold text-sm sm:text-base">
                                  <span className="flex-1">Booking Amount ({bookingSlots} {bookingSlots === 1 ? 'slot' : 'slots'})</span>
                                  <span className="text-gray-900 whitespace-nowrap">{"\u20B9"}{subtotal.toLocaleString()}</span>
                                </div>

                                {extraChargesTotal > 0 && (
                                  <div className="flex justify-between items-start gap-4 text-gray-700 font-bold text-sm sm:text-base">
                                    <span className="flex-1">Extra Charges (from selections)</span>
                                    <span className="text-emerald-700 whitespace-nowrap">+{"\u20B9"}{extraChargesTotal.toLocaleString()}</span>
                                  </div>
                                )}

                                {totalPayable > 0 && (
                                <div className="pt-2 border-t border-gray-200/50">
                                  <button
                                    onClick={() => setShowFeeDetails(!showFeeDetails)}
                                    className="flex items-center justify-between w-full text-gray-500 hover:text-gray-900 transition-colors group"
                                  >
                                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wide flex-1 min-w-0">
                                      <Info size={14} className="text-gray-900 flex-shrink-0" />
                                      <span className="truncate">Convenience Fees</span>
                                      <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-300 ${showFeeDetails ? 'rotate-180' : ''}`} />
                                    </div>
                                    <span className="font-bold whitespace-nowrap ml-2">{"\u20B9"}{totalFees.toLocaleString()}</span>
                                  </button>

                                  <AnimatePresence>
                                    {showFeeDetails && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="mt-3 space-y-2.5 pl-6 pr-2 py-3 bg-white/50 rounded-xl border border-gray-200/30">
                                          <div className="flex justify-between items-center gap-4 text-[11px] sm:text-xs font-medium text-gray-500">
                                            <span className="flex-1">Platform Charges (3%)</span>
                                            <span className="whitespace-nowrap">{"\u20B9"}{platformFee.toLocaleString()}</span>
                                          </div>
                                          <div className="flex justify-between items-center gap-4 text-[11px] sm:text-xs font-medium text-gray-500">
                                            <span className="flex-1">Gateway Charges (2%)</span>
                                            <span className="whitespace-nowrap">{"\u20B9"}{gatewayFee.toLocaleString()}</span>
                                          </div>
                                          <div className="flex justify-between items-center gap-4 text-[11px] sm:text-xs font-medium text-gray-500">
                                            <span className="flex-1">GST on Gateway (18%)</span>
                                            <span className="whitespace-nowrap">{"\u20B9"}{gstOnGateway.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-gray-200">
                                  <div className="flex justify-between items-baseline mb-6 gap-4">
                                    <span className="text-base sm:text-lg font-bold text-gray-900">{totalPayable === 0 ? 'Total' : 'Total Payable'}</span>
                                    <span className="text-3xl sm:text-4xl font-bold text-gray-900 leading-none whitespace-nowrap">{totalPayable === 0 ? 'Free' : <>{"\u20B9"}{totalPayable.toLocaleString()}</>}</span>
                                  </div>
                                  {/* T&C Consent for Events */}
                                  <label className={`flex items-start gap-3 mb-5 mt-5 p-4 rounded-xl border-2 cursor-pointer transition-all ${agreedToTerms ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300 bg-gray-50/30'}`}>
                                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => { 
                                      setAgreedToTerms(e.target.checked); 
                                      if (e.target.checked) setFormErrors(prev => { const n = {...prev}; delete n.terms; return n; }); 
                                    }}
                                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 flex-shrink-0" />
                                    <span className="text-xs text-gray-600 leading-relaxed">
                                      I agree to bagspackgo&apos;s{' '}
                                      <Link href="/terms" target="_blank" className="text-emerald-600 font-bold hover:underline">Terms & Conditions</Link>
                                      {' '}and{' '}
                                      <Link href="/privacy" target="_blank" className="text-emerald-600 font-bold hover:underline">Privacy Policy</Link>.
                                      I understand that cancellation and refunds are subject to the platform&apos;s refund policy.
                                    </span>
                                  </label>
                                  {formErrors.terms && <p className="text-[10px] text-red-500 font-bold mt-2 uppercase tracking-wide flex items-center gap-1"><AlertCircle size={10} /> {formErrors.terms}</p>}

                                  <button
                                    onClick={handleBooking}
                                    disabled={isProcessingPayment}
                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-base transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed group shadow-sm"
                                  >
                                    {isProcessingPayment ? (
                                      <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                      <>
                                        {totalPayable === 0 ? 'Confirm Booking' : 'Confirm & Pay Securely'}
                                        <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                                      </>
                                    )}
                                  </button>
                                  <Button variant="ghost" onClick={() => setBookingStep(1)} className="w-full mt-4 font-bold text-gray-500 hover:text-gray-800 transition-colors text-sm">
                                    Edit Booking Details
                                  </Button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DETAILS VIEW â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8 -mt-20 mb-16">
      {saveToast}

      {/* â”€â”€ Top Section: Poster (left) + Info (right) â”€â”€ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Left: Poster with Back Button */}
          <div className="w-full md:w-1/2 lg:w-2/3 flex flex-col gap-4">
            <div className="rounded-xl overflow-hidden shadow-lg relative bg-neutral-900 group">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/user/events')}
                className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 rounded-full font-semibold border border-white/20"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <img
                src={event.image || '/images/EventCover.webp'}
                alt={event.name}
                className="relative z-10 w-full h-64 md:h-96 object-cover md:object-contain"
              />
            </div>

            {/* Book Now Button */}
            {event.slotsLeft > 0 ? (
              <Button
                onClick={handleBookNowClick}
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-lg"
              >
                <Ticket className="w-5 h-5" />
                <span>Book Now {"\u00B7"} {event.price ? <>{"\u20B9"}{event.price.toLocaleString()}</> : 'Free'}</span>
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="w-full bg-neutral-100 text-neutral-500 shadow-sm py-4 rounded-xl font-bold flex items-center justify-center gap-3 text-lg border border-neutral-200">
                  <AlertCircle className="w-6 h-6" />
                  <span>Sold Out</span>
                </div>
                <Button 
                   onClick={handleWish}
                   disabled={isWished}
                   variant="outline"
                   className={`w-full h-14 rounded-xl font-bold flex items-center justify-center gap-2 text-lg border-emerald-600 text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-600 ${isWished ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                   {isWished ? 'Wished!' : 'Wish for more slots'}
                </Button>
              </div>
            )}
          </div>

          {/* Right: Company Name, Event Info, Map */}
          <div className="w-full md:w-1/2 lg:w-1/3 bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
            <div>
              {/* Save & Share buttons */}
              <div className="flex items-center justify-end gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={handleShareEvent}
                  className="flex items-center gap-2 rounded-xl text-gray-700 font-semibold shadow-sm"
                  title="Share Event"
                >
                  <Share2 size={16} className="text-gray-500" />
                  <span>Share</span>
                </Button>
                <Button
                  variant={isSaved ? "secondary" : "outline"}
                  onClick={handleSaveEvent}
                  className={`flex items-center gap-2 rounded-xl font-semibold shadow-sm ${isSaved ? 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-gray-200' : 'text-gray-700'}`}
                  title={isSaved ? 'Remove from Saved' : 'Save Event'}
                >
                  <Bookmark size={16} className={isSaved ? 'text-gray-900 fill-emerald-600' : 'text-gray-500'} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                  {event.guideLogo ? (
                    <img src={event.guideLogo} alt={event.guideName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-900 font-black text-sm">
                      {(event.guideName || 'G').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Organized by</p>
                  <p className="text-sm font-bold text-gray-800">
                    {(event.guide || event.guideId) ? (
                        <Link href={`/user/provider/${event.guide?._id || event.guideId || event.guide}`} className="hover:text-emerald-700 hover:underline">
                            {event.guideName || 'Local Organizer'}
                        </Link>
                    ) : (event.guideName || 'Local Organizer')}
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-100 mb-4" />

              <div className="flex justify-between items-start mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words pr-2">{event.name}</h1>
                <div className="flex items-center bg-yellow-100 text-yellow-700 text-sm font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-2 flex-shrink-0">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 mr-1" /> {event.rating || 'New'}
                </div>
              </div>

              <div className="space-y-3.5 mb-6">
                <div className="flex items-center">
                  <Calendar className="text-blue-500 mr-3 flex-shrink-0" size={20} />
                  <div><p className="text-xs text-gray-400 font-medium">Date</p><p className="font-semibold text-sm text-gray-800">{formattedDate}</p></div>
                </div>
                <div className="flex items-center">
                  <Clock className="text-green-500 mr-3 flex-shrink-0" size={20} />
                  <div><p className="text-xs text-gray-400 font-medium">Duration</p><p className="font-semibold text-sm text-gray-800">{event.duration}</p></div>
                </div>
                <div className="flex items-center">
                  <MapPin className="text-purple-500 mr-3 flex-shrink-0" size={20} />
                  <div><p className="text-xs text-gray-400 font-medium">Location</p><p className="font-semibold text-sm text-gray-800 capitalize">{event.destinationId}</p></div>
                </div>
                <div className="flex items-center">
                  <Ticket className="text-amber-500 mr-3 flex-shrink-0" size={20} />
                  <div><p className="text-xs text-gray-400 font-medium">Availability</p><p className="font-semibold text-sm text-gray-800">{event.slotsLeft} slots remaining</p></div>
                </div>
              </div>
            </div>

            {event.destinationLink && (
              <a
                href={event.destinationLink.startsWith('http') ? event.destinationLink : `https://${event.destinationLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 rounded-xl transition-all border border-blue-200 shadow-sm group"
              >
                <Map size={20} className="group-hover:scale-110 transition-transform" />
                View Location on Map
                <ExternalLink size={14} className="opacity-60" />
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* â”€â”€ Tabs Section â”€â”€ */}
      <div ref={tabsRef} className="bg-white/90 backdrop-blur-sm px-4 sm:px-6 py-4 shadow-lg rounded-2xl overflow-hidden scroll-mt-20">
        {/* Tab Headers */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex flex-nowrap sm:flex-wrap justify-start gap-2 sm:gap-0 sm:space-x-6 px-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap py-3.5 px-3 border-b-2 font-semibold text-sm sm:text-base capitalize transition-all flex-shrink-0 ${activeTab === tab.key
                  ? 'border-emerald-600 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* â•â•â• TAB 1: Event Details â•â•â• */}
          {activeTab === 'eventDetails' && (
            <div className="w-full min-w-0 overflow-hidden break-words space-y-8">
              {/* About */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-emerald-600 mb-3 border-b-2 border-gray-50 pb-2">About This Event</h2>
                <div className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">
                  {event.about || 'No description provided.'}
                </div>
              </div>

              {/* Photographs Gallery */}
              {event.photographs?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="text-gray-900" size={20} /> Gallery
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {event.photographs.map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxPhoto(photo)}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer"
                      >
                        <img src={photo} alt={`Event photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Highlights */}
              {event.highlights?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="text-amber-500" size={20} /> Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {event.highlights.map((h, i) => h && (
                      <div key={i} className="flex items-center gap-2.5 text-gray-700 bg-amber-50/60 p-3 rounded-lg border border-amber-100 max-w-full overflow-hidden">
                        <CheckCircle className="text-amber-500 flex-shrink-0" size={16} />
                        <span className="break-words w-full text-sm">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's Included */}
              {event.whatsIncluded?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="text-gray-900" size={20} /> What&apos;s Included
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {event.whatsIncluded.map((item, i) => item && (
                      <div key={i} className="flex items-center gap-2.5 text-gray-700 bg-gray-50/60 p-3 rounded-lg border border-gray-200 max-w-full overflow-hidden">
                        <CheckCircle className="text-gray-900 flex-shrink-0" size={16} />
                        <span className="break-words w-full text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's Excluded */}
              {event.whatsExcluded?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <XCircle className="text-red-500" size={20} /> What&apos;s Excluded
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {event.whatsExcluded.map((item, i) => item && (
                      <div key={i} className="flex items-center gap-2.5 text-gray-700 bg-red-50/60 p-3 rounded-lg border border-red-100 max-w-full overflow-hidden">
                        <XCircle className="text-red-400 flex-shrink-0" size={16} />
                        <span className="break-words w-full text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button onClick={goToNextTab}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-12 px-6">
                  Next: Itinerary
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* â•â•â• TAB 2: Itinerary â•â•â• */}
          {activeTab === 'itinerary' && (
            <div className="space-y-6">
              <h2 className="text-lg sm:text-xl font-bold text-emerald-600 mb-2 border-b-2 border-gray-50 pb-2">Event Itinerary</h2>

              {event.itinerary?.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-gray-200 space-y-6 py-4">
                  {event.itinerary.map((step, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm" />
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">Step {i + 1}</span>
                        </div>
                        <p className="text-gray-700 font-medium text-sm sm:text-base">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Info size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Itinerary details will be updated soon.</p>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button onClick={goToNextTab}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-12 px-6">
                  Next: Important Info
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* â•â•â• TAB 3: Important Info â•â•â• */}
          {activeTab === 'info' && (
            <div className="space-y-8">
              {/* What to Bring */}
              <div className="bg-blue-50 p-5 sm:p-6 rounded-2xl border border-blue-100 shadow-sm">
                <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2 text-base sm:text-lg">
                  <Info size={20} /> What to Bring
                </h3>
                {event.whatToBring?.length > 0 ? (
                  <ul className="space-y-2">
                    {event.whatToBring.map((item, i) => item && (
                      <li key={i} className="flex items-start gap-2.5 text-blue-700 text-sm leading-relaxed">
                        <CheckCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-blue-600 text-sm">Nothing specific mentioned.</p>
                )}
              </div>

              {/* Restrictions */}
              <div className="bg-rose-50 p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-sm">
                <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2 text-base sm:text-lg">
                  <AlertCircle size={20} /> Essential Restrictions
                </h3>
                {event.restrictions?.length > 0 ? (
                  <ul className="space-y-2">
                    {event.restrictions.map((item, i) => item && (
                      <li key={i} className="flex items-start gap-2.5 text-rose-700 text-sm leading-relaxed">
                        <AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" size={16} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-rose-600 text-sm">No specific restrictions mentioned.</p>
                )}
              </div>

              {/* Terms & Conditions */}
              {event.termsAndConditions?.length > 0 && (
                <div className="bg-amber-50 p-5 sm:p-6 rounded-2xl border border-amber-100 shadow-sm">
                  <h3 className="text-gray-900 font-bold mb-4 flex items-center gap-2 text-base sm:text-lg">
                    <FileText size={20} className="text-amber-600" /> Terms & Conditions
                  </h3>
                  <ol className="space-y-2.5">
                    {event.termsAndConditions.map((tc, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-amber-800 text-sm leading-relaxed">
                        <span className="w-5 h-5 bg-amber-200 text-amber-800 rounded-full text-[10px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{tc}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* FAQs */}
              {event.faqs?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <HelpCircle size={20} className="text-amber-500" /> Frequently Asked Questions
                  </h3>
                  <div className="space-y-3">
                    {event.faqs.map((faq, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() => toggleFaq(i)}
                          className={`w-full text-left p-4 flex justify-between items-center gap-3 transition-colors ${expandedFaqs[i] ? 'bg-amber-50 border-b border-amber-100' : 'hover:bg-gray-50'}`}
                        >
                          <span className="font-semibold text-sm text-gray-800">{faq.question}</span>
                          <motion.div animate={{ rotate: expandedFaqs[i] ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className={`w-5 h-5 flex-shrink-0 ${expandedFaqs[i] ? 'text-amber-600' : 'text-gray-400'}`} />
                          </motion.div>
                        </button>
                        <AnimatePresence initial={false}>
                          {expandedFaqs[i] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 text-gray-600 text-sm leading-relaxed bg-amber-50/30">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Continue to Booking Button */}
              <div className="flex flex-col items-center gap-4 py-6 border-t border-gray-100 mt-6">
                <p className="text-gray-500 text-center max-w-md text-sm">
                  {event.slotsLeft > 0 ? "Ready for the adventure? Click below to finalize your booking and secure your slots." : "Unfortunately, all slots for this event have been booked."}
                </p>
                {event.slotsLeft > 0 ? (
                  <Button onClick={handleBookNowClick}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-14 px-12 flex items-center justify-center gap-3">
                    <Ticket className="w-5 h-5" />
                    <span className="text-lg sm:text-xl">Continue to Booking</span>
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleWish}
                    disabled={isWished}
                    variant="outline"
                    className={`w-full sm:w-auto border-emerald-600 text-emerald-700 hover:bg-emerald-50 focus:ring-emerald-600 rounded-xl font-bold h-14 px-12 flex items-center justify-center gap-3 ${isWished ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-lg sm:text-xl">{isWished ? 'Wished!' : 'Wish for more slots'}</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* â”€â”€ Photo Lightbox â”€â”€ */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-4xl max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={lightboxPhoto} alt="Event" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
              <button
                onClick={() => setLightboxPhoto(null)}
                className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              >
                <XCircle size={24} className="text-gray-600" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetails;

