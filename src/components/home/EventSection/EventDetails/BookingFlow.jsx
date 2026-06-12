// components/home/EventSection/BookingCheckoutFlow.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Clock, Navigation, ChevronDown, Mail, Phone, 
  CheckCircle, Plus, Minus, AlertCircle, Info, Upload 
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUploader from '@/components/ui/ImageUploader';
import toast from 'react-hot-toast';

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-2.5 border rounded-lg text-left flex items-center justify-between transition-all bg-white text-sm outline-none ${isOpen ? 'border-[#10b981] ring-1 ring-[#10b981]' : 'border-[#d1d5db] hover:border-[#10b981]'} ${value ? 'text-gray-900' : 'text-gray-400'}`}
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
            className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 p-1 max-h-48 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full px-3 py-2 text-left text-sm transition-all flex items-center justify-between rounded-md my-0.5 ${value === opt.value ? 'bg-[#a7f3d0] text-[#065f46] font-medium' : 'hover:bg-[#d1fae5] text-[#1e293b]'}`}
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

export default function BookingFlow({ event, user, openAuthModal, router, onBackToDetails }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingSlots, setBookingSlots] = useState(1);
  const [selectedPickup, setSelectedPickup] = useState('');
  const [pickupDropdownOpen, setPickupDropdownOpen] = useState(false);
  
  const [expandedSections, setExpandedSections] = useState({ 0: true });
  const [formErrors, setFormErrors] = useState({});
  const [slotError, setSlotError] = useState('');
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  function createEmptyParticipant() {
    return { name: '', age: '', gender: '', phone: '', nationality: '', idType: '', idNumber: '', idProofImage: '' };
  }

  const [formData, setFormData] = useState({
    contactDetails: { email: user?.email || '', phone: user?.phone || '' },
    participants: [createEmptyParticipant()],
    customFormResponses: []
  });

  const [extraChargesTotal, setExtraChargesTotal] = useState(0);

  // ── 1. LOCAL STORAGE SANITIZATION & LOADING ──
  useEffect(() => {
    if (!isInitialized) {
       try {
         const saved = localStorage.getItem("temp_event_booking");
         if (saved) {
             const parsed = JSON.parse(saved);
             if (parsed && typeof parsed === 'object') {
                // Sanitize Base64 strings to prevent localStorage limits from breaking the app
                const sanitizedParticipants = parsed.formData?.participants?.map(p => {
                   if (p.idProofImage && p.idProofImage.startsWith('data:image')) {
                       return { ...p, idProofImage: '' }; 
                   }
                   return p;
                });

                setFormData(prev => ({ 
                  ...prev, 
                  contactDetails: parsed.formData?.contactDetails || prev.contactDetails,
                  participants: sanitizedParticipants || prev.participants,
                  customFormResponses: parsed.formData?.customFormResponses || [] 
                }));
                if (parsed.bookingSlots) setBookingSlots(parsed.bookingSlots);
                if (parsed.selectedPickup) setSelectedPickup(parsed.selectedPickup);
             }
         }
       } catch (e) {
         console.error("Local storage parsing error", e);
       }
       setIsInitialized(true);
    }

    // Load Razorpay script
    let script;
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isInitialized]);

  // ── 2. SAVE TO LOCAL STORAGE ──
  useEffect(() => {
    if (!isInitialized) return;
    const saveObj = { formData, bookingSlots, selectedPickup };
    localStorage.setItem('temp_event_booking', JSON.stringify(saveObj));
  }, [formData, bookingSlots, selectedPickup, isInitialized]);

  // Sync Auth User Data
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

  // Handle participant slot changes
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
  }, [bookingSlots]);

  const toggleSection = (index) => setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  const handleContactChange = (field, value) => setFormData(prev => ({ ...prev, contactDetails: { ...prev.contactDetails, [field]: value } }));
  const handleParticipantChange = (index, field, value) => {
    setFormData(prev => {
      const newP = [...prev.participants];
      newP[index] = { ...newP[index], [field]: value };
      return { ...prev, participants: newP };
    });
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const selectedPickupObj = event.pickupPoints?.find(p => p.location === selectedPickup);

  // ── VALIDATION ──
  const handleReviewJourney = () => {
    const errors = {};
    const max = event.slotsLeft !== undefined ? event.slotsLeft : 50;
    
    if (bookingSlots > max) {
        setSlotError(`Only ${max} slots available`);
        return window.scrollTo({ top: 100, behavior: 'smooth' });
    }

    if (!formData.contactDetails.email) errors['contact.email'] = 'Email is required';
    if (!formData.contactDetails.phone) errors['contact.phone'] = 'Phone is required';
    if (!selectedPickup && event.pickupPoints?.length > 0) errors['pickup'] = 'Please select a pickup point';

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

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
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

  // ── PAYMENT CALCULATIONS ──
  const subtotal = (event.price || 0) * bookingSlots;
  const baseForFees = subtotal + extraChargesTotal;
  const platformFee = Math.round(baseForFees * 0.03);
  const gatewayFee = Math.round(baseForFees * 0.02);
  const gstOnGateway = Math.round(gatewayFee * 0.18);
  const totalFees = platformFee + gatewayFee + gstOnGateway;
  const totalPayable = baseForFees + totalFees;

  // ── BOOKING & RAZORPAY SUBMISSION ──
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
          customFormResponses: [], // Simplified for this example, add custom form handler if needed
          extraChargesTotal: 0
        })
      });
      const bookData = await bookRes.json();
      
      if (!bookData.success) {
        if (bookData.message?.toLowerCase().includes('sold out')) {
          router.push(`/user/event/booking-failed?soldOut=true&return=/user/events`);
          return;
        }
        throw new Error(bookData.message || 'Booking failed');
      }
      const bookingId = bookData.bookingId;

      // Free Event Logic
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
        if (verifyData.success) {
          localStorage.removeItem('temp_event_booking');
          router.push(`/user/event/booking-success?bookingId=${bookingId}`);
          return;
        }
      }

      // Paid Event Logic
      const orderRes = await fetch('/api/payments/event-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPayable, bookingId })
      });
      const orderData = await orderRes.json();
      
      if (!orderData.success) throw new Error(orderData.message || 'Order creation failed');

      const rzp = new window.Razorpay({
        key: orderData.key,
        amount: totalPayable * 100,
        currency: 'INR',
        order_id: orderData.orderId,
        name: 'bagspackgo',
        description: `Booking: ${event.title || event.name}`,
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
            localStorage.removeItem('temp_event_booking');
            router.push(`/user/event/booking-success?bookingId=${bookingId}`);
          } else {
            router.push(`/user/event/booking-failed?return=/user/events/eventdetails/${event.id}`);
          }
        },
        modal: { ondismiss: () => setIsProcessingPayment(false) }
      });

      rzp.on('payment.failed', function () {
         router.push(`/user/event/booking-failed?return=/user/events/eventdetails/${event.id}`);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred during booking. Please try again.');
      setIsProcessingPayment(false);
      router.push(`/user/event/booking-failed?return=/user/events/eventdetails/${event.id}`);
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-24 relative z-[60] pt-6 sm:pt-8 -mt-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        
        {/* ── STEP 1: PARTICIPANT DETAILS ── */}
        {bookingStep === 1 && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            <div className="w-full lg:w-[65%] space-y-6">
              {/* Number of Participants */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={onBackToDetails}
                      className="mt-1 w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-900 shadow-sm"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Number of Participants</h2>
                      <p className="text-gray-500 text-sm font-medium">{event.price ? <>{"\u20B9"}{event.price.toLocaleString()} per person</> : 'Free per person'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100 w-full sm:w-48">
                          <button onClick={() => setBookingSlots(s => Math.max(1, s - 1))} className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center shadow-sm hover:border-emerald-500 hover:text-emerald-600"><Minus size={18} /></button>
                          <span className="text-2xl font-black text-gray-900">{bookingSlots}</span>
                          <button onClick={() => setBookingSlots(s => s + 1)} className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center shadow-sm hover:border-emerald-500 hover:text-emerald-600"><Plus size={18} /></button>
                      </div>
                      {slotError && <p className="text-[10px] font-bold text-red-500 uppercase">{"\u26A0"} {slotError}</p>}
                  </div>
                </div>
              </div>

              {/* Pickup Point */}
              {event.includePickup !== false && event.pickupPoints?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Select Pickup Point</h2>
                  <div className="relative z-[70]">
                    <button
                      type="button"
                      onClick={() => setPickupDropdownOpen(!pickupDropdownOpen)}
                      className={`w-full px-4 py-3 rounded-lg border flex items-center justify-between bg-white shadow-sm outline-none ${formErrors['pickup'] ? 'border-red-500 ring-1 ring-red-500' : selectedPickup ? 'border-[#10b981] shadow-[0_0_0_1px_#10b981]' : 'border-[#d1d5db]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin size={18} className={selectedPickup ? 'text-gray-900' : 'text-gray-400'} />
                        <span className="font-semibold text-gray-900 text-sm truncate">{selectedPickup || 'Choose location...'}</span>
                      </div>
                      <ChevronDown size={18} className="text-gray-400" />
                    </button>
                    {pickupDropdownOpen && (
                      <div className="absolute z-[70] w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 p-1">
                        {event.pickupPoints.map((point, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => { setSelectedPickup(point.location); setPickupDropdownOpen(false); }}
                            className="w-full px-3 py-2 text-left hover:bg-emerald-50 rounded-md text-sm font-medium"
                          >
                            {point.location} {point.time && `(${point.time})`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                    <Input type="email" value={formData.contactDetails.email} onChange={e => handleContactChange('email', e.target.value)} className={formErrors['contact.email'] ? 'border-red-500' : ''} />
                    {formErrors['contact.email'] && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{"\u26A0"} {formErrors['contact.email']}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
                    <Input type="tel" value={formData.contactDetails.phone} onChange={e => handleContactChange('phone', e.target.value)} className={formErrors['contact.phone'] ? 'border-red-500' : ''} />
                    {formErrors['contact.phone'] && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{"\u26A0"} {formErrors['contact.phone']}</p>}
                  </div>
                </div>
              </div>

              {/* Traveller Details */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Traveller Details</h2>
                <div className="space-y-4">
                  {Array.from({ length: bookingSlots }).map((_, i) => {
                    const p = formData.participants[i] || {};
                    const isExpanded = expandedSections[i];
                    return (
                      <div key={i} className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-visible">
                        <button onClick={() => toggleSection(i)} className="w-full flex justify-between items-center p-4">
                          <span className="font-bold">Traveller {i + 1} {p.name && `- ${p.name}`}</span>
                          <ChevronDown className={isExpanded ? 'rotate-180' : ''} />
                        </button>
                        {isExpanded && (
                          <div className="p-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold uppercase text-gray-500">Name</label>
                              <Input value={p.name} onChange={e => handleParticipantChange(i, 'name', e.target.value)} className={formErrors[`p.${i}.name`] ? 'border-red-500' : ''}/>
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase text-gray-500">Age</label>
                              <Input type="number" value={p.age} onChange={e => handleParticipantChange(i, 'age', e.target.value)} className={formErrors[`p.${i}.age`] ? 'border-red-500' : ''}/>
                            </div>
                            <div className="relative z-[60]">
                              <label className="text-xs font-bold uppercase text-gray-500">Gender</label>
                              <CustomSelect value={p.gender} onChange={v => handleParticipantChange(i, 'gender', v)} options={[{value:'male', label:'Male'}, {value:'female', label:'Female'}]} placeholder="Select" />
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase text-gray-500">Phone</label>
                              <Input value={p.phone} onChange={e => handleParticipantChange(i, 'phone', e.target.value)} className={formErrors[`p.${i}.phone`] ? 'border-red-500' : ''}/>
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase text-gray-500">Nationality</label>
                              <Input value={p.nationality} onChange={e => handleParticipantChange(i, 'nationality', e.target.value)} className={formErrors[`p.${i}.nationality`] ? 'border-red-500' : ''}/>
                            </div>
                            <div className="relative z-[50]">
                              <label className="text-xs font-bold uppercase text-gray-500">ID Type</label>
                              <CustomSelect value={p.idType} onChange={v => handleParticipantChange(i, 'idType', v)} options={[{value:'aadhar', label:'Aadhar'}, {value:'passport', label:'Passport'}]} placeholder="Select" />
                            </div>
                            {p.idType && (
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">ID Number</label>
                                    <Input value={p.idNumber} onChange={e => handleParticipantChange(i, 'idNumber', e.target.value)} className={formErrors[`p.${i}.idNumber`] ? 'border-red-500' : ''}/>
                                </div>
                            )}
                            
                            {/* NEW CLOUDINARY IMAGE UPLOADER */}
                            <div className="md:col-span-2 pt-4">
                              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Upload ID Proof (Front Side) <span className="text-red-500">*</span></label>
                              <ImageUploader 
                                value={p.idProofImage || ''} 
                                onChange={(url) => handleParticipantChange(i, 'idProofImage', url)} 
                                hasError={!!formErrors[`p.${i}.idProofImage`]}
                                label="Click to upload ID Image"
                              />
                              {formErrors[`p.${i}.idProofImage`] && <p className="text-[10px] text-red-500 font-bold mt-1.5 uppercase">{"\u26A0"} {formErrors[`p.${i}.idProofImage`]}</p>}
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Event Summary Sidebar */}
            <div className="w-full lg:w-[35%] lg:sticky lg:top-28">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-6">Event Summary</h3>
                <img src={event.image} alt="Event" className="w-full h-44 object-cover rounded-xl mb-4" />
                <p className="font-bold text-lg mb-4">{event.name}</p>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{formattedDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium">{event.location || event.destinationId}</span></div>
                </div>
                <Button onClick={handleReviewJourney} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-xl text-lg font-bold">
                  Continue to Review
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: REVIEW & PAY ── */}
        {bookingStep === 2 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12">
            <div className="flex items-center gap-6 mb-10">
              <Button variant="outline" size="icon" onClick={() => setBookingStep(1)} className="w-12 h-12 rounded-2xl border-gray-200">
                <ArrowLeft size={24} />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Review & Pay</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <p className="font-bold text-xl mb-4">{event.name}</p>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-bold">Travellers:</span> {bookingSlots}</p>
                  <p className="text-sm"><span className="font-bold">Pickup:</span> {selectedPickup || 'None'}</p>
                  <p className="text-sm"><span className="font-bold">Contact:</span> {formData.contactDetails.email}</p>
                </div>
              </div>

              <div className="border border-gray-200 bg-gray-50 rounded-2xl p-6 sm:p-8">
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest mb-6">Payment Breakdown</h3>
                <div className="space-y-4 text-sm font-bold text-gray-700">
                  <div className="flex justify-between"><span>Booking Amount</span><span>{"\u20B9"}{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Taxes & Fees</span><span>{"\u20B9"}{totalFees.toLocaleString()}</span></div>
                  <div className="flex justify-between text-xl text-gray-900 pt-4 border-t mt-4"><span>Total Payable</span><span>{"\u20B9"}{totalPayable.toLocaleString()}</span></div>
                </div>

                <label className="flex items-start gap-3 mt-8 p-4 rounded-xl border border-gray-200 bg-white">
                  <input type="checkbox" checked={agreedToTerms} onChange={(e) => { setAgreedToTerms(e.target.checked); setFormErrors({}); }} className="mt-1 h-4 w-4" />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I agree to the Terms & Conditions and Privacy Policy.
                  </span>
                </label>
                {formErrors.terms && <p className="text-[10px] text-red-500 font-bold mt-2">{"\u26A0"} {formErrors.terms}</p>}

                <Button onClick={handleBooking} disabled={isProcessingPayment} className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-xl font-bold">
                  {isProcessingPayment ? 'Processing...' : 'Confirm & Pay Securely'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}