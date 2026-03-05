'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit,
  MapPin,
  Calendar,
  Users,
  Clock,
  Mountain,
  Tent,
  Compass,
  Map,
  User,
  Mail,
  Phone,
  CreditCard,
  Star,
  Backpack,
  Thermometer,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Snowflake,
  HeartPulse,
  Flag,
  AlertTriangle
} from 'lucide-react';

const ReviewTrek = ({ guide, searchParams }) => {
  const [trekData, setTrekData] = useState(null);
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('itinerary');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('trekData');
    if (storedData) {
      setTrekData(JSON.parse(storedData));
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Safely extract URL parameters with defaults
  const difficulty = searchParams?.get('difficulty') || 'moderate';
  const days = parseInt(searchParams?.get('days')) || 3;
  const dateParam = searchParams?.get('date');
  const date = dateParam ? new Date(dateParam) : new Date();

  // Safely destructure trekData with fallbacks
  const trekDetails = trekData?.trekDetails || {};
  const itinerary = trekDetails.itinerary || [];
  const pickupDropoff = trekData?.pickupDropoff || null;
  const equipmentList = trekData?.equipmentList || []; // Optional fallback if present
  const medicalInfo = trekData?.personalDetails?.medicalInfo || {};
  const emergencyContacts = trekData?.personalDetails?.emergencyContacts || [];
  const personalDetails = trekData?.personalDetails || {
    contactDetails: {},
    personalDetails: [],
  };
  const peopleRangeParam = searchParams?.get('peopleRange') || '1-2';

  // Extract minimum people from range for calculations
  const minPeople = parseInt(peopleRangeParam.split('-')[0]) || parseInt(peopleRangeParam) || 1;
  const count = parseInt(searchParams?.get('count')) || minPeople;

  // Calculate payment details safely based on package pricingTiers
  const calculatePayment = () => {
    let pricePerPerson = guide?.price || 0;

    if (guide?.pricingTiers && guide.pricingTiers.length > 0) {
      const tier = guide.pricingTiers.find(t => {
        if (peopleRangeParam.includes('+')) {
          return t.maxPeople >= minPeople;
        } else {
          const [minP, maxP] = peopleRangeParam.split('-').map(Number);
          return t.minPeople <= minP && t.maxPeople >= maxP;
        }
      });
      if (tier && tier.price) {
        pricePerPerson = tier.price;
      } else {
        // Fallback to closest tier
        pricePerPerson = [...guide.pricingTiers].sort((a, b) => a.minPeople - b.minPeople)[0].price;
      }
    }

    const basePrice = pricePerPerson * count;
    const taxes = basePrice * 0.05;
    const total = basePrice + taxes;

    return {
      pricePerPerson,
      basePrice,
      taxes,
      total
    };
  };

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedData = localStorage.getItem('trekData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);

          // Ensure proper structure
          const formattedData = {
            ...parsedData,
            personalDetails: {
              contactDetails: parsedData.personalDetails?.contactDetails || {},
              personalDetails: parsedData.personalDetails?.personalDetails || [],
            }
          };

          setTrekData(formattedData);
        }
      } catch (error) {
        console.error("Error loading trek data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const paymentDetails = calculatePayment();

  const handleEditSection = (section) => {
    router.push(`/user/trek/guides/trekdetails/${guide?.id}?difficulty=${difficulty}&days=${days}&count=${count}&date=${date.toISOString()}#${section}`);
  };

  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const handleMakePayment = async () => {
    if (!trekData) return;
    setIsPaymentLoading(true);
    setPaymentError('');

    const guideData = trekData.guide;
    const config = trekData.trekConfig || {};
    const tripDetails = trekData.trekDetails || {}; // Assuming we stored package details here

    const packageId = config.trekId || tripDetails?.id || tripDetails?._id || guideData?.packageId;
    const guideId = guideData?.provider; // guide refers to package, its provider is guideData.provider

    if (!packageId || !guideId) {
      setPaymentError(`Missing required data. Please go back and try again.`);
      setIsPaymentLoading(false);
      return;
    }

    try {
      const { pricePerPerson, basePrice, taxes, total } = paymentDetails;
      const numPeople = count;

      // Create pending booking
      const bookingRes = await fetch('/api/user/trek-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId,
          guideId,
          startDate: config.date || new Date().toISOString(),
          numPeople,
          peopleRange: peopleRangeParam,
          baseAmount: basePrice,
          discount: 0,
          platformFee: 0, // Not explicitly charged here
          taxes,
          totalAmount: total,
          pickupDropoff: trekData.pickupDropoff || {},
          personalDetails: trekData.personalDetails || {},
          packageSnapshot: {
            name: guideData?.name || 'Trek Package',
            destination: guideData?.location || '',
            days: config.days || 1,
          },
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingData.success) {
        throw new Error(bookingData.message || 'Failed to create booking');
      }

      const { bookingId } = bookingData;

      // Create Razorpay order
      const orderRes = await fetch('/api/payments/trek-create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total || 1, bookingId }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Order creation failed');

      const { orderId, key } = orderData;
      const isMock = !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderId?.startsWith('mock_order_');

      if (isMock) {
        // Dev mode skip Razorpay UI
        const verifyRes = await fetch('/api/payments/trek-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderId,
            razorpay_payment_id: `mock_pay_${Date.now()}`,
            bookingId,
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) throw new Error(verifyData.message || 'Verification failed');
        router.push(`/user/trek/booking-success?bookingId=${bookingId}&ref=${verifyData.bookingRef}`);
        return;
      }

      // Open Razorpay modal
      const rzp = new window.Razorpay({
        key,
        amount: total * 100,
        currency: 'INR',
        order_id: orderId,
        name: 'BagsPackGo',
        description: `Trek: ${guideData?.name || 'Package'}`,
        handler: async (response) => {
          const verifyRes = await fetch('/api/payments/trek-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            router.push(`/user/trek/booking-success?bookingId=${bookingId}&ref=${verifyData.bookingRef}`);
          } else {
            setPaymentError(verifyData.message || 'Payment verification failed. Contact support.');
          }
        },
        modal: { ondismiss: () => setIsPaymentLoading(false) },
      });
      rzp.open();
    } catch (err) {
      console.error('[Payment] Error:', err);
      setPaymentError(err.message || 'Payment failed. Please try again.');
      setIsPaymentLoading(false);
    }
  };

  const changeSection = (newSection) => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveSection(newSection);
      setIsAnimating(false);
    }, 300);
  };

  const getDifficultyBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'easy':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Easy</span>;
      case 'moderate':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Moderate</span>;
      case 'difficult':
        return <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">Difficult</span>;
      case 'extreme':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Extreme</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">{level}</span>;
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'sunny': return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'rain': return <CloudRain className="h-5 w-5 text-blue-500" />;
      case 'wind': return <Wind className="h-5 w-5 text-gray-500" />;
      case 'snow': return <Snowflake className="h-5 w-5 text-blue-200" />;
      default: return <Sun className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'itinerary':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8 space-y-8 border border-gray-100"
          >
            {/* Itinerary section content */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mr-4">
                  <Compass className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Trek Itinerary</h3>
              </div>
              <button
                onClick={() => handleEditSection('itinerary')}
                className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-50 transition-all"
              >
                <Edit className="h-4 w-4 mr-2" /> Edit Plan
              </button>
            </div>

            {/* Guide and Trek Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="h-5 w-5 text-green-600 mr-2" />
                  Guide Details
                </h4>
                {guide ? (
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-green-600 font-bold text-xl">
                        {guide.name?.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-lg">{guide.name}</p>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Mountain className="h-4 w-4 mr-1 text-green-500" /> {guide.location}
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(guide.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm ml-1 text-gray-600">({guide.reviews} reviews)</span>
                      </div>
                      <div className="mt-3">
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {guide.specializations?.join(', ') || 'Mountain Guide'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No guide information available</p>
                )}
              </div>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Backpack className="h-5 w-5 text-green-600 mr-2" />
                  Trek Summary
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-semibold text-gray-800">
                        {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Participants</p>
                      <p className="font-semibold text-gray-800">
                        {count} person{count > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Flag className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Difficulty</p>
                      <p className="font-semibold text-gray-800">
                        {getDifficultyBadge(difficulty)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Thermometer className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Altitude</p>
                      <p className="font-semibold text-gray-800">
                        {guide?.maxAltitude || 'N/A'} meters
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Day-wise Plan */}
            <div className="space-y-6">
              <h4 className="text-xl font-semibold text-gray-800 flex items-center">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mr-4">
                  <Compass className="h-6 w-6 text-white" />
                </div>
                Day-wise Trek Plan
              </h4>
              {itinerary.length > 0 ? (
                <div className="space-y-6">
                  {itinerary.map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h5 className="font-bold text-gray-800 text-lg mb-1">
                            <span className="bg-gradient-to-r from-green-400 to-green-600 text-white px-3 py-1 rounded-full text-sm mr-3">
                              Day {day.day || index + 1}
                            </span>
                            {day.title || `Day ${day.day || index + 1}`}
                          </h5>
                          {day.date && (
                            <p className="text-sm text-gray-500 mt-2">
                              {day.date}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <div className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs flex items-center">
                            <Sun className="h-3 w-3 mr-1" />
                            <span>Day {index + 1}</span>
                          </div>
                          {day.weather && (
                            <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs flex items-center">
                              {getWeatherIcon(day.weather)}
                              <span className="ml-1 capitalize">{day.weather}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-amber-50 rounded-lg p-4">
                          <h6 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <Tent className="h-5 w-5 text-amber-500 mr-2" /> Accommodation
                          </h6>
                          <p className="text-sm text-gray-700">
                            {day.accommodation || 'Not specified'}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h6 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <Sun className="h-5 w-5 text-green-500 mr-2" /> Meals Included
                          </h6>
                          <p className="text-sm text-gray-700">
                            {day.meals?.join(', ') || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h6 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Compass className="h-5 w-5 text-green-500 mr-2" /> Daily Trek Details
                        </h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Duration</p>
                            <p className="font-semibold text-gray-800">
                              {day.duration || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h6 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Map className="h-5 w-5 text-green-500 mr-2" /> Route Description
                        </h6>
                        <p className="text-sm text-gray-700 bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg">
                          {day.description || 'No description provided for this day.'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 text-center">
                  <Mountain className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No itinerary information available</p>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'equipment':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8 space-y-8 border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mr-4">
                  <Backpack className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Equipment & Preparation</h3>
              </div>
              <button
                onClick={() => handleEditSection('equipment')}
                className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-50 transition-all"
              >
                <Edit className="h-4 w-4 mr-2" /> Edit Details
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="border border-green-100 rounded-xl p-6 bg-gradient-to-br from-green-50 to-blue-50"
              >
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">
                    1
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Required Equipment</h4>
                </div>

                <div className="space-y-4">
                  {equipmentList.length > 0 ? (
                    <ul className="space-y-3">
                      {equipmentList.map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-start bg-white p-3 rounded-lg shadow-sm"
                        >
                          <div className={`p-1 rounded-full mr-3 mt-1 ${item.essential ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
                            }`}>
                            {item.essential ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            )}
                          </div>
                          {item.provided && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                              Provided
                            </span>
                          )}
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <Backpack className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No equipment information available</p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border border-green-100 rounded-xl p-6 bg-gradient-to-br from-green-50 to-blue-50"
              >
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">
                    2
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Health & Fitness</h4>
                </div>

                <div className="space-y-5">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <HeartPulse className="h-5 w-5 text-red-500 mr-2" />
                      Medical Information
                    </h5>
                    {medicalInfo.conditions || medicalInfo.medications ? (
                      <div className="space-y-3">
                        {medicalInfo.conditions && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Medical Conditions</p>
                            <p className="text-sm text-gray-700">{medicalInfo.conditions}</p>
                          </div>
                        )}
                        {medicalInfo.medications && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Medications</p>
                            <p className="text-sm text-gray-700">{medicalInfo.medications}</p>
                          </div>
                        )}
                        {medicalInfo.allergies && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Allergies</p>
                            <p className="text-sm text-gray-700">{medicalInfo.allergies}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No medical information provided</p>
                    )}
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                      Emergency Contacts
                    </h5>
                    {emergencyContacts.length > 0 ? (
                      <div className="space-y-3">
                        {emergencyContacts.map((contact, index) => (
                          <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                            <p className="font-medium text-gray-800">{contact.name}</p>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div className="text-sm text-gray-600 flex items-center">
                                <Phone className="h-4 w-4 mr-1 text-gray-500" /> {contact.phone}
                              </div>
                              <div className="text-sm text-gray-600 flex items-center">
                                <Mail className="h-4 w-4 mr-1 text-gray-500" /> {contact.email || 'N/A'}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{contact.relationship}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No emergency contacts provided</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        );

      case 'personalDetails':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8 space-y-8 border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mr-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Participant Details</h3>
              </div>
              <button
                onClick={() => handleEditSection('personalDetails')}
                className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-50 transition-all"
              >
                <Edit className="h-4 w-4 mr-2" /> Edit Information
              </button>
            </div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="border border-green-100 rounded-xl p-6 bg-gradient-to-br from-green-50 to-blue-50"
              >
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">
                    1
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Contact Information</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                      <Mail className="h-4 w-4 text-green-500 mr-2" /> Email
                    </p>
                    <p className="font-semibold text-gray-800">
                      {personalDetails.contactDetails?.email || 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center">
                      <Phone className="h-4 w-4 text-green-500 mr-2" /> Mobile
                    </p>
                    <p className="font-semibold text-gray-800">
                      {personalDetails.contactDetails?.mobile || 'Not specified'}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border border-green-100 rounded-xl p-6 bg-gradient-to-br from-green-50 to-blue-50"
              >
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">
                    2
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">Participant Details</h4>
                </div>

                <div className="space-y-6">
                  {personalDetails.personalDetails?.length > 0 ? (
                    personalDetails.personalDetails.map((participant, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg p-5 shadow-sm border border-gray-100"
                      >
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-gray-800 text-lg mb-3">
                            Participant {index + 1}: {participant.name || 'Name not specified'}
                          </h5>
                          <div className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-xs">
                            {index === 0 ? 'Primary' : 'Additional'}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Gender</p>
                            <p className="font-semibold text-gray-800 capitalize">
                              {participant.gender || 'Not specified'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Age</p>
                            <p className="font-semibold text-gray-800">
                              {participant.age || 'Not specified'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nationality</p>
                            <p className="font-semibold text-gray-800">
                              {participant.nationality || 'Not specified'}
                            </p>
                          </div>
                          {participant.experience && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Trek Experience</p>
                              <p className="font-semibold text-gray-800 capitalize">
                                {participant.experience}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-8 text-center">
                      <User className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No participant information available</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        );

      case 'payment':
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8 space-y-8 border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mr-4">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Payment Details</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="border border-green-100 rounded-xl p-6 bg-gradient-to-br from-green-50 to-blue-50"
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-6">Price Summary</h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Base Price ({count} {count > 1 ? 'people' : 'person'})</span>
                    <span className="font-semibold">₹{paymentDetails.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Price per Person</span>
                    <span className="font-semibold text-sm">₹{paymentDetails.pricePerPerson.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Taxes (5%)</span>
                    <span className="font-semibold">₹{paymentDetails.taxes.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 mt-2">
                    <div className="flex justify-between items-center bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-lg">
                      <span className="font-bold text-lg text-gray-800">Total Amount</span>
                      <span className="font-bold text-lg text-green-700">₹{paymentDetails.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border border-blue-100 rounded-xl p-6 bg-gradient-to-br from-green-50 to-blue-50"
              >
                <h4 className="text-lg font-semibold text-gray-800 mb-6">Payment Method</h4>

                <div className="space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-4 p-4 border-2 border-green-300 bg-white rounded-xl shadow-sm cursor-pointer"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Pay with Visa, Mastercard, etc.</p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 bg-white rounded-xl shadow-sm cursor-pointer"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.042 3.042C6.86 5.988 9.295 5 12 5c3.86 0 7 3.141 7 7h2c0-4.962-4.037-9-9-9zm9.368 4.501l-3.042 3.042C17.14 5.988 14.705 5 12 5c-3.86 0-7 3.141-7 7H3c0-4.962 4.037-9 9-9 3.79 0 7.169 1.757 9.368 4.501zM12 8c-2.209 0-4 1.791-4 4s1.791 4 4 4 4-1.791 4-4-1.791-4-4-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">PayPal</p>
                      <p className="text-sm text-gray-500">Pay with your PayPal account</p>
                    </div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 bg-white rounded-xl shadow-sm cursor-pointer"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-17v8h7v-2h-5V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Google Pay</p>
                      <p className="text-sm text-gray-500">Fast checkout with Google Pay</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 mr-2" />
                Secure Payment Guarantee
              </h4>
              <p className="text-gray-600">
                Your payment information is processed securely. We do not store your credit card details.
                This site is protected by reCAPTCHA and the Google <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a> and <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> apply.
              </p>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-green-50 to-blue-50 -mt-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
          Review Your Trek
        </h1>
        <p className="text-gray-600 mt-3 text-lg">
          Please review all the details before making payment
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-12 relative">
        {/* Background line container - spans full width */}
        <div className="absolute top-7 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0">
          {/* Animated progress line with flowing effect */}
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: activeSection === 'itinerary' ? '25%' :
                activeSection === 'equipment' ? '50%' :
                  activeSection === 'personalDetails' ? '75%' : '100%'
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="h-full relative overflow-hidden"
          >
            {/* Flowing gradient effect */}
            <motion.div
              animate={{
                x: [0, 100, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/80 to-transparent"
            />
            {/* Solid base color */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600" />
          </motion.div>
        </div>

        {/* Steps container */}
        <div className="flex justify-between relative z-10">
          {['itinerary', 'equipment', 'personalDetails', 'payment'].map((step, index) => {
            const isActive = activeSection === step;
            const isCompleted = ['itinerary', 'equipment', 'personalDetails', 'payment'].indexOf(activeSection) > index;
            const stepNames = {
              itinerary: 'Itinerary',
              equipment: 'Equipment',
              personalDetails: 'Participants',
              payment: 'Payment'
            };

            const stepIcons = {
              itinerary: <Compass className="h-5 w-5" />,
              equipment: <Backpack className="h-5 w-5" />,
              personalDetails: <Users className="h-5 w-5" />,
              payment: <CreditCard className="h-5 w-5" />
            };

            return (
              <motion.div
                key={step}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                {/* Step circle with pulse effect when active */}
                <motion.button
                  initial={false}
                  animate={{
                    scale: isActive ? [1, 1.1, 1] : 1,
                    boxShadow: isActive ? "0 0 0 8px rgba(74, 222, 128, 0.2)" : "none"
                  }}
                  transition={{
                    scale: isActive ? { duration: 1, repeat: Infinity } : {},
                    boxShadow: { duration: 0.3 }
                  }}
                  onClick={() => !isAnimating && changeSection(step)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${isActive ? 'bg-gradient-to-br from-green-400 to-green-700 text-white' :
                    isCompleted ? 'bg-green-500 text-white' :
                      'bg-white text-gray-400 border-2 border-gray-300'
                    } transition-all duration-300 relative`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    stepIcons[step]
                  )}
                  {/* Glow effect for active step */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1.5 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-green-400/30 -z-10"
                    />
                  )}
                </motion.button>

                {/* Step label with subtle animation */}
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: isActive ? -2 : 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`mt-3 text-sm font-medium ${isActive ? 'text-green-600 font-bold' :
                    isCompleted ? 'text-green-600' :
                      'text-gray-500'
                    }`}
                >
                  {stepNames[step]}
                </motion.div>
                <div className={`text-xs mt-1 ${isActive ? 'text-green-500' : 'text-gray-400'
                  }`}>
                  Step {index + 1}/4
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Content Section */}
      <AnimatePresence mode="wait">
        {renderSectionContent()}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 flex justify-between"
      >
        {activeSection !== 'itinerary' ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const sections = ['itinerary', 'equipment', 'personalDetails', 'payment'];
              const currentIndex = sections.indexOf(activeSection);
              changeSection(sections[currentIndex - 1]);
            }}
            className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 flex items-center shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </motion.button>
        ) : (
          <div></div> // Empty div to maintain flex space-between
        )}

        {activeSection !== 'payment' ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const sections = ['itinerary', 'equipment', 'personalDetails', 'payment'];
              const currentIndex = sections.indexOf(activeSection);
              changeSection(sections[currentIndex + 1]);
            }}
            className="px-8 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 flex items-center shadow-lg hover:shadow-xl transition-all"
          >
            Continue
            <ArrowRight className="h-5 w-5 ml-2" />
          </motion.button>
        ) : (
          <div className="flex flex-col items-end">
            {paymentError && <p className="text-red-500 text-sm mb-2">{paymentError}</p>}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMakePayment}
              disabled={isPaymentLoading}
              className={`px-8 py-3 rounded-xl flex items-center shadow-lg hover:shadow-xl transition-all ${isPaymentLoading
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700'
                }`}
            >
              {isPaymentLoading ? 'Processing...' : 'Complete Payment'}
              <CreditCard className="h-5 w-5 ml-2" />
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReviewTrek;