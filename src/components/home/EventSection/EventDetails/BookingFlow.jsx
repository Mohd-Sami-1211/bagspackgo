'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { ArrowLeft, ChevronDown, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import CustomFormInput from '@/components/ui/custom-form-fields/CustomFormInput';
import CustomFormSelect from '@/components/ui/custom-form-fields/CustomFormSelect';
import ImageUploader from '@/components/ui/ImageUploader';
import Accordion from '@/components/ui/Accordian';
import { formatDate } from '@/lib/utils';

export default function BookingFlow({ event, user, router, onBackToDetails }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [expandedSections, setExpandedSections] = useState({ 0: true });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState('');

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      bookingSlots: 1,
      selectedPickup: '',
      contactDetails: {
        email: user?.email || '',
        phone: user?.phone || ''
      },
      participants: [{ name: '', age: '', gender: '', phone: '', nationality: '', idType: '', idNumber: '', idProofUrl: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "participants"
  });

  const allValues = watch();
  const bookingSlots = watch('bookingSlots');
  const selectedPickup = watch('selectedPickup');
  const contactDetails = watch('contactDetails');
  const participants = watch('participants');

  useEffect(() => {
    const saved = localStorage.getItem("temp_event_booking");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        reset(parsed);
      } catch (e) {
        console.error("Failed to restore form state", e);
      }
    }
    setIsInitialized(true);
  }, [reset]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('temp_event_booking', JSON.stringify(allValues));
    }
  }, [allValues, isInitialized]);

  // Load Razorpay script
  useEffect(() => {
    if (!document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    const currentCount = fields.length;
    if (bookingSlots > currentCount) {
      for (let i = currentCount; i < bookingSlots; i++) {
        append({ name: '', age: '', gender: '', phone: '', nationality: '', idType: '', idNumber: '', idProofUrl: '' });
      }
    } else if (bookingSlots < currentCount) {
      for (let i = currentCount - 1; i >= bookingSlots; i--) {
        remove(i);
      }
    }
  }, [bookingSlots, fields.length, append, remove, isInitialized]);

  const onReviewJourney = (data) => {
    if (event.slotsLeft !== undefined && data.bookingSlots > event.slotsLeft) {
      toast.error(`Only ${event.slotsLeft} slots available`);
      return;
    }
    setBookingStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const subtotal = (event.price || 0) * bookingSlots;
  const platformFee = Math.round(subtotal * 0.03);
  const gatewayFee = Math.round(subtotal * 0.02);
  const gstOnGateway = Math.round(gatewayFee * 0.18);
  const totalFees = platformFee + gatewayFee + gstOnGateway;
  const totalPayable = subtotal + totalFees;

  const clearBookingDraft = () => localStorage.removeItem('temp_event_booking');

  const handlePayment = async () => {
    if (!agreedToTerms) {
      setTermsError('Please agree to the Terms & Conditions to proceed.');
      return;
    }

    setIsProcessingPayment(true);
    setTermsError('');

    try {
      const bookRes = await fetch('/api/user/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: event.id,
          slots: bookingSlots,
          amountPaid: totalPayable,
          contactDetails,
          participants: participants.slice(0, bookingSlots).map(({ idProofUrl, ...rest }) => rest),
          selectedPickup: selectedPickup ? { location: selectedPickup } : null,
          customFormResponses: [],
          extraChargesTotal: 0
        })
      });

      const bookData = await bookRes.json();
      if (!bookData.success) throw new Error(bookData.message || 'Booking creation failed');

      const { bookingId } = bookData;

      if (totalPayable <= 0) {
        const verifyRes = await fetch('/api/payments/event-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, status: 'free' })
        });
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          clearBookingDraft();
          router.push(`/user/event/booking-success?bookingId=${bookingId}`);
          return;
        }
        throw new Error('Free booking verification failed');
      }

      const orderRes = await fetch('/api/payments/event-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPayable, bookingId })
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error('Order creation failed');

      const rzp = new window.Razorpay({
        key: orderData.key,
        amount: totalPayable * 100,
        currency: 'INR',
        order_id: orderData.orderId,
        name: 'bagspackgo',
        prefill: {
          email: contactDetails.email,
          contact: contactDetails.phone,
        },
        theme: { color: "#059669" },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toast.error('Payment cancelled');
          }
        },
        handler: async (response) => {
          try {
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
              clearBookingDraft();
              router.push(`/user/event/booking-success?bookingId=${bookingId}`);
            } else {
              toast.error('Payment verification failed.');
              router.push(`/user/event/booking-failed?return=/user/events/eventdetails/${event.id}`);
            }
          } catch {
            toast.error('An error occurred during payment verification.');
            router.push(`/user/event/booking-failed?return=/user/events/eventdetails/${event.id}`);
          }
        }
      });

      rzp.open();

    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred during booking.');
      setIsProcessingPayment(false);
    }
  };

  const travellerItems = fields.map((item, i) => ({
    title: `Traveller ${i + 1}${watch(`participants.${i}.name`) ? ` - ${watch(`participants.${i}.name`)}` : ''}`,
    content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomFormInput
            label="Name"
            required
            registration={register(`participants.${i}.name`, { required: 'Name is required' })}
            error={errors.participants?.[i]?.name}
        />
        <CustomFormInput
            label="Age"
            type="number"
            required
            registration={register(`participants.${i}.age`, { required: 'Age is required' })}
            error={errors.participants?.[i]?.age}
        />
    
        <div className="relative z-[60]">
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            Gender <span className="text-red-500">*</span>
            </label>
            <CustomFormSelect
            control={control}
            name={`participants.${i}.gender`}
            rules={{ required: 'Gender is required' }}
            options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' }
            ]}
            placeholder="Select"
            />
        </div>
    
        <CustomFormInput
            label="Phone"
            required
            registration={register(`participants.${i}.phone`, { required: 'Phone is required' })}
            error={errors.participants?.[i]?.phone}
        />
        <CustomFormInput
            label="Nationality"
            required
            registration={register(`participants.${i}.nationality`, { required: 'Nationality required' })}
            error={errors.participants?.[i]?.nationality}
        />
    
        <div className="relative z-[50]">
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
            ID Type <span className="text-red-500">*</span>
            </label>
            <CustomFormSelect
            control={control}
            name={`participants.${i}.idType`}
            rules={{ required: 'ID Type is required' }}
            options={[
                { value: 'aadhar', label: 'Aadhaar' },
                { value: 'passport', label: 'Passport' }
            ]}
            placeholder="Select"
            />
        </div>
    
        {watch(`participants.${i}.idType`) && (
            <CustomFormInput
            label="ID Number"
            required
            registration={register(`participants.${i}.idNumber`, { required: 'ID Number is required' })}
            error={errors.participants?.[i]?.idNumber}
            />
        )}
    
        <div className="md:col-span-2 pt-4">
            <ImageUploader
            control={control}
            name={`participants.${i}.idProofUrl`}
            label="Upload ID Proof (Front Side)"
            rules={{ required: 'ID document is required' }}
            />
        </div>
        </div>
    ),
  }));

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-24 relative z-[60] pt-6 sm:pt-8 -mt-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">

        {/* PARTICIPANT DETAILS */}
        {bookingStep === 1 && (
          <form onSubmit={handleSubmit(onReviewJourney)} className="flex flex-col lg:flex-row gap-8 items-start">

            <div className="w-full lg:w-[65%] space-y-6">
              {/* Number of Participants */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={onBackToDetails}
                      className="mt-1 w-8 h-8 rounded-full border flex items-center justify-center text-gray-400 hover:text-gray-900"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Number of Participants</h2>
                      <p className="text-gray-500 text-sm font-medium">
                        {event.price
                          ? <>{"\u20B9"}{event.price.toLocaleString()} per person</>
                          : 'Free per person'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100 w-full sm:w-48">
                    <button
                      type="button"
                      onClick={() => setValue('bookingSlots', Math.max(1, bookingSlots - 1))}
                      className="w-10 h-10 rounded-lg bg-white border shadow-sm"
                    >
                      <Minus size={18} className="mx-auto" />
                    </button>
                    <span className="text-2xl font-black text-gray-900">{bookingSlots}</span>
                    <button
                      type="button"
                      onClick={() => setValue('bookingSlots', event.slotsLeft !== undefined
                        ? Math.min(event.slotsLeft, bookingSlots + 1)
                        : bookingSlots + 1
                      )}
                      className="w-10 h-10 rounded-lg bg-white border shadow-sm"
                    >
                      <Plus size={18} className="mx-auto" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pickup Point Selection */}
              {event.includePickup !== false && event.pickupPoints?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm relative z-[70]">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Select Pickup Point</h2>
                  <CustomFormSelect
                    control={control}
                    name="selectedPickup"
                    label="Select Pickup Point"
                    rules={{ required: 'Please select a pickup point' }}
                    options={event.pickupPoints.map(p => ({
                      value: p.location,
                      label: `${p.location}${p.time ? ` (${p.time})` : ''}`
                    }))}
                    placeholder="Choose location..."
                  />
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                  <CustomFormInput
                    label="Email"
                    id="contactEmail"
                    type="email"
                    required
                    registration={register('contactDetails.email', { required: 'Email is required' })}
                    error={errors.contactDetails?.email}
                  />
                  <CustomFormInput
                    label="Phone"
                    id="contactPhone"
                    type="tel"
                    required
                    registration={register('contactDetails.phone', { required: 'Phone is required' })}
                    error={errors.contactDetails?.phone}
                  />
                </div>
              </div>

              {/* Traveller Details */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Traveller Details</h2>
                <Accordion
                    items={travellerItems}
                    defaultOpen={[0]}
                    activeClassName="bg-gray-50 border-b border-gray-200"
                    contentClassName="bg-white"
                    chevronActiveClassName="text-emerald-600"
                />
              </div>
            </div>

            {/* Sidebar Summary */}
            <div className="w-full lg:w-[35%] lg:sticky lg:top-28">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-6">Event Summary</h3>
                <img src={event.image} alt="Event" className="w-full h-44 object-cover rounded-xl mb-4" />
                <p className="font-bold text-lg mb-4">{event.name}</p>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium">{event.location || event.destinationId}</span>
                  </div>
                  {event.slotsLeft !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Slots Left</span>
                      <span className={`font-medium ${event.slotsLeft <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {event.slotsLeft}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-xl text-lg font-bold"
                >
                  Continue to Review
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: REVIEW & PAY */}
        {bookingStep === 2 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12">
            <div className="flex items-center gap-6 mb-10">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setBookingStep(1)}
                className="w-12 h-12 rounded-2xl border-gray-200"
              >
                <ArrowLeft size={24} />
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">Review & Pay</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <p className="font-bold text-xl mb-4">{event.name}</p>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-bold">Travellers:</span> {bookingSlots}</p>
                  <p className="text-sm"><span className="font-bold">Pickup:</span> {selectedPickup || 'None'}</p>
                  <p className="text-sm"><span className="font-bold">Contact:</span> {contactDetails.email}</p>
                </div>
              </div>

              <div className="border border-gray-200 bg-gray-50 rounded-2xl p-6 sm:p-8">
                <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest mb-6">Payment Breakdown</h3>
                <div className="space-y-4 text-sm font-bold text-gray-700">
                  <div className="flex justify-between">
                    <span>Booking Amount</span>
                    <span>{"\u20B9"}{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Taxes & Fees</span>
                    <span>{"\u20B9"}{totalFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl text-gray-900 pt-4 border-t mt-4">
                    <span>Total Payable</span>
                    <span>{"\u20B9"}{totalPayable.toLocaleString()}</span>
                  </div>
                </div>

                <label className="flex items-start gap-3 mt-8 p-4 rounded-xl border border-gray-200 bg-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => { setAgreedToTerms(e.target.checked); setTermsError(''); }}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I agree to the Terms & Conditions and Privacy Policy.
                  </span>
                </label>
                {termsError && (
                  <p className="text-[10px] text-red-500 font-bold mt-2">{"\u26A0"} {termsError}</p>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-xl font-bold"
                >
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