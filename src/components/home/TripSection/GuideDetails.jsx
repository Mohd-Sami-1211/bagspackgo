'use client';
import { Star, Edit, MapPin, Users, Calendar, Share2, Heart, ChevronRight, ArrowRight, ArrowLeft, Hotel, Clock, Map, Utensils, Car, ShieldCheck, Mountain, Crown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Itenary from 'src/components/home/TripSection/Itenary';
import ArrDep from 'src/components/home/TripSection/Arr-Dep';
import PersonalDetails from 'src/components/home/TripSection/PersonalDetails';

const GuideDetails = ({ guide }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get parameters from URL with validation
  const category = ['individual', 'couple', 'group'].includes(searchParams.get('category'))
    ? searchParams.get('category')
    : 'individual';
  const daysRange = searchParams.get('daysRange') || '';
  const count = Math.max(1, parseInt(searchParams.get('count')) || 1);
  const dateParam = searchParams.get('date');
  const date = dateParam && !isNaN(new Date(dateParam).getTime())
    ? new Date(dateParam)
    : new Date();
  const packageId = searchParams.get('packageId');

  // Calculate derived values
  const numPeople = Math.max(1, Number(count) || 1);
  const peopleText = category === 'couple' ? 'couple' : 'person';

  // Find the selected package
  const findSelectedPackage = () => {
    if (packageId) {
      return guide.packages?.find(pkg => pkg.id === packageId);
    }

    if (daysRange) {
      const [minDays, maxDays] = daysRange.split('-').map(Number);
      const packagesInRange = guide.packages?.filter(pkg =>
        pkg.days >= minDays && pkg.days <= maxDays
      );
      return packagesInRange?.[0]; // Return first package in range
    }

    return null;
  };

  const selectedPackage = findSelectedPackage();
  const isPremiumPackage = selectedPackage?.type === 'premium';

  // Use actual package days if available, otherwise use days from range
  const getTripDuration = () => {
    if (selectedPackage) {
      return selectedPackage.days; // Use actual package days
    }

    if (daysRange) {
      const [minDays, maxDays] = daysRange.split('-').map(Number);
      return Math.round((minDays + maxDays) / 2); // Average for non-package selection
    }

    return 3; // Default
  };

  const tripDuration = getTripDuration();
  const numDays = tripDuration;

  // Calculate price based on selected package or fallback to daily rate
  const calculatePrice = () => {
    if (selectedPackage) {
      // Use package price
      const packagePrice = Number(selectedPackage.price[category] || selectedPackage.price.individual || 0);
      return {
        basePrice: packagePrice * numPeople,
        perPersonPrice: packagePrice,
        days: selectedPackage.days,
        isPackage: true
      };
    } else {
      // Fallback to daily rate calculation
      const dailyRate = Number(guide.price[category] || guide.price.individual || 0);
      return {
        basePrice: dailyRate * numPeople * numDays,
        perPersonPrice: dailyRate * numDays,
        days: numDays,
        isPackage: false
      };
    }
  };

  const priceDetails = calculatePrice();
  const basePrice = priceDetails.basePrice;
  const discount = basePrice * 0.1;
  const platformFee = 50;
  const taxes = basePrice * 0.05;
  const total = basePrice - discount + platformFee + taxes;
  const nights = numDays + 1;

  const [activeTab, setActiveTab] = useState('dayByDay');
  const [currentDay, setCurrentDay] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [viewingDay, setViewingDay] = useState(null);
  const [itenaries, setItenaries] = useState([]);
  const [errors, setErrors] = useState({});
  const [arrDepCompleted, setArrDepCompleted] = useState(false);
  const [personalDetailsCompleted, setPersonalDetailsCompleted] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(date);

  const defaultPackage = {
    name: selectedPackage?.label || 'Basic Package',
    destination: guide.location,
    locations: ['Pahalgam', 'Gulmarg', 'Sonmarg'],
    departureTime: '09:00',
    departureAddress: 'Central Meeting Point',
    hotel: {
      name: 'Standard Hotel',
      location: 'Pahalgam',
      price: '$100/night'
    },
    activities: [
      { id: 1, name: 'City Tour', duration: '2 hours', location: 'Pahalgam' },
      { id: 2, name: 'Local Cuisine Tasting', duration: '1.5 hours', location: 'Pahalgam' }
    ]
  };

  const [arrivalDepartureData, setArrivalDepartureData] = useState({
    arrival: {
      city: '',
      pickupAddress: '',
      date: '',
      time: ''
    },
    departure: {
      city: '',
      dropoffAddress: '',
      date: '',
      time: ''
    }
  });

  const [personalDetailsData, setPersonalDetailsData] = useState({
    contactDetails: {},
    personalDetails: [],
    children: []
  });

  // Add the missing useRef declarations
  const scrollContainerRef = useRef(null);
  const nodeRefs = useRef([]);
  const pageTopRef = useRef(null);
  const dayCardRefs = useRef([]);

  // Scroll to top when viewing day details
  useEffect(() => {
    if (viewingDay && pageTopRef.current) {
      pageTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [viewingDay]);

  // Auto-scroll to selected day card
  useEffect(() => {
    if (!viewingDay && currentDay && dayCardRefs.current[currentDay - 1]) {
      const dayCard = dayCardRefs.current[currentDay - 1];
      const container = document.querySelector('.day-cards-container');

      if (dayCard && container) {
        const cardTop = dayCard.offsetTop;
        const containerTop = container.offsetTop;
        const scrollPosition = cardTop - containerTop - 20; // 20px offset

        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [currentDay, viewingDay]);

  useEffect(() => {
    const activeNode = nodeRefs.current[currentDay - 1];
    const container = scrollContainerRef.current;

    if (activeNode && container) {
      const nodeCenter = activeNode.offsetLeft + activeNode.offsetWidth / 2;
      const containerCenter = container.offsetWidth / 2;
      const scrollPos = nodeCenter - containerCenter;

      container.scrollTo({
        left: scrollPos,
        behavior: "smooth",
      });
    }
  }, [currentDay]);

  // Initialize itineraries using REAL package itinerary data if available
  useEffect(() => {
    const startDate = selectedStartDate && !isNaN(selectedStartDate.getTime())
      ? new Date(selectedStartDate)
      : new Date();

    const pkgItinerary = selectedPackage?.itinerary || [];
    const pkgActivities = selectedPackage?.activities || [];

    const initialItenaries = Array.from({ length: numDays }, (_, i) => {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);

      // Use real itinerary if available for this day
      const realDay = pkgItinerary.find(d => d.day === i + 1) || pkgItinerary[i];

      return {
        dayNumber: i + 1,
        date: dayDate.toLocaleDateString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        rawDate: dayDate,
        destination: selectedPackage?.destination || guide.location,
        location: realDay?.location || `Day ${i + 1}`,
        agenda: realDay?.agenda || '',
        travelFrom: realDay?.travelFrom || '',
        travelTo: realDay?.travelTo || '',
        pickupTime: realDay?.pickupTime || '',
        departure: {
          time: realDay?.pickupTime || '09:00',
          address: realDay?.travelFrom || 'Meeting Point'
        },
        hotel: {
          name: realDay?.hotelName || 'Hotel TBD',
          location: realDay?.location || '',
          price: ''
        },
        activities: pkgActivities.map((a, idx) => ({
          id: idx + 1,
          name: a.name,
          location: realDay?.location || '',
          duration: ''
        }))
      };
    });
    setItenaries(initialItenaries);
  }, [numDays, selectedStartDate, selectedPackage]);

  const [bookingData, setBookingData] = useState({
    category: 'individual',
    count: 1,
    personalDetails: null
  });

  const [step, setStep] = useState(1);

  const handleSavePersonalDetails = (data) => {
    setPersonalDetailsData(data);
    setPersonalDetailsCompleted(true);
  };

  // Build real package inclusions from the provider's package data
  const inclusiveIconMap = {
    food: <Utensils className="h-5 w-5 text-green-600" />,
    transport: <Car className="h-5 w-5 text-green-600" />,
    accommodation: <Hotel className="h-5 w-5 text-green-600" />,
    guidance: <ShieldCheck className="h-5 w-5 text-green-600" />,
    pickupDropoff: <Map className="h-5 w-5 text-green-600" />,
  };

  const packageInclusions = selectedPackage?.inclusives
    ? Object.entries(selectedPackage.inclusives)
      .filter(([, val]) => val?.included)
      .map(([key, val]) => ({
        icon: inclusiveIconMap[key] || <ShieldCheck className="h-5 w-5 text-green-600" />,
        title: val.title || key.charAt(0).toUpperCase() + key.slice(1),
        description: val.title || '',
        items: (val.details || []).filter(d => d && d.trim())
      }))
    : [
      // Fallback if no real data
      { icon: <Utensils className="h-5 w-5 text-green-600" />, title: "Food", description: "Meals included", items: [] },
      { icon: <Car className="h-5 w-5 text-green-600" />, title: "Transport", description: "Transport included", items: [] },
    ];

  const handleViewDay = (dayNumber) => {
    setViewingDay(dayNumber);
    setCurrentDay(dayNumber);
  };

  const handleBackToList = () => {
    setViewingDay(null);
  };

  const handleNextTab = () => {
    if (activeTab === 'dayByDay' && !viewingDay) {
      setActiveTab('arrivalDeparture');
    } else if (activeTab === 'arrivalDeparture' && arrDepCompleted) {
      setActiveTab('personalDetails');
    }
  };

  const handleBack = () => {
    if (activeTab === 'arrivalDeparture') {
      setActiveTab('dayByDay');
    } else if (activeTab === 'personalDetails') {
      setActiveTab('arrivalDeparture');
    } else {
      setErrors({});
      setViewingDay(null);
    }
  };

  const handleArrDepSubmit = (data) => {
    const newStartDate = new Date(data.startDate);
    setSelectedStartDate(newStartDate);
    setArrivalDepartureData(data);
    setArrDepCompleted(true);
    setActiveTab('personalDetails');
  };

  const formatTimeWithAMPM = (time) => {
    if (!time) return '';
    if (time.includes('AM') || time.includes('PM')) return time;

    const [hours, minutes] = time.split(':');
    const hourNum = parseInt(hours, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isTabDisabled = (tabKey) => {
    switch (tabKey) {
      case 'arrivalDeparture':
        return false;
      case 'personalDetails':
        return !arrDepCompleted;
      default:
        return false;
    }
  };

  // Handle day node click - set current day and scroll to that day card
  const handleDayNodeClick = (dayNumber) => {
    setCurrentDay(dayNumber);
    // Auto-scroll will be handled by the useEffect above
  };

  // Handle navigation to review page
  const handleReviewJourney = () => {
    // Prepare all trip data with proper structure
    const tripData = {
      itenaries: itenaries,
      arrivalDeparture: arrivalDepartureData,
      personalDetails: {
        contactDetails: personalDetailsData.contactDetails || {},
        personalDetails: personalDetailsData.personalDetails || [],
        children: personalDetailsData.children || []
      },
      guide: guide,
      selectedPackage: selectedPackage,
      tripConfig: {
        category,
        days: priceDetails.days,
        daysRange,
        count: numPeople,
        date: dateParam,
        packageId
      }
    };

    // Store in localStorage
    localStorage.setItem('tripData', JSON.stringify(tripData));

    // Create query params
    const params = new URLSearchParams();
    params.set('category', category);
    params.set('daysRange', daysRange || '');
    params.set('count', numPeople);
    if (dateParam) params.set('date', dateParam);
    if (packageId) params.set('packageId', packageId);

    // Debug logging
    console.log('Navigating to review page with guide ID:', guide.id);
    console.log('Guide object:', guide);
    console.log('Path being used:', `/user/trip/guidelist/tripdetails/${guide.id}/reviewjourney`);
    console.log('Full URL:', `/user/trip/guidelist/tripdetails/${guide.id}/reviewjourney?${params.toString()}`);

    // Try different route options:

    // Option 1: Original path
    // router.push(`/user/trip/guidelist/tripdetails/${guide.id}/reviewjourney?${params.toString()}`);

    // Option 2: Simpler path (common pattern)
    // router.push(`/trip/review/${guide.id}?${params.toString()}`);

    // Option 3: Check if guide.id exists and use a fallback
    const guideId = guide?.id || guide?._id || 'unknown';
    router.push(`/user/trip/guidelist/tripdetails/${guideId}/reviewjourney?${params.toString()}`);

    // Option 4: If you have a separate review page route
    // router.push(`/review-journey?guideId=${guideId}&${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 -mt-8 sm:-mt-10 md:-mt-12 lg:-mt-14" ref={pageTopRef}>
      {/* Guide Card - Made Responsive */}
      <div className="w-full bg-white pb-6 sm:pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto">
          <div className={`relative shadow-xl rounded-2xl sm:rounded-3xl lg:rounded-full px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl mx-auto gap-4 sm:gap-6 lg:gap-0 ${isPremiumPackage
            ? 'bg-gradient-to-r from-amber-400 to-yellow-400'
            : 'bg-green-300'
            }`}>
            {/* Premium Badge - Fixed positioning */}
            {isPremiumPackage && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                <div className="flex items-center bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full px-3 py-1 text-xs font-medium shadow-lg">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium Package
                </div>
              </div>
            )}

            {/* Rating Badge - Responsive */}
            <div className="absolute top-2 right-3 sm:right-7 flex items-center bg-white rounded-full px-2 sm:px-2 py-1 text-xs font-medium text-gray-800 shadow-md">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-400 mr-1" />
              {guide.rating}
              <span className="ml-1 text-gray-500 text-xs">({guide.reviews})</span>
            </div>

            {/* Guide Info - Responsive */}
            <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center shadow-md border-2 flex-shrink-0 ${isPremiumPackage
                ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
                : 'bg-white border-green-100'
                }`}>
                <div className={`text-sm sm:text-base lg:text-lg font-bold ${isPremiumPackage
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent'
                  }`}>
                  {guide.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1 sm:flex-none">
                <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">{guide.name}</h2>
                <div className="flex items-center text-xs sm:text-sm text-white mt-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 text-white flex-shrink-0" />
                  <span className="truncate">{guide.location}</span>
                </div>
                {selectedPackage && (
                  <div className="flex items-center mt-1 flex-wrap gap-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded text-white bg-white/20 backdrop-blur-sm">
                      {selectedPackage.label} ({selectedPackage.days} days)
                    </span>
                    {isPremiumPackage && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/30 backdrop-blur-sm text-white border border-white/50">
                        Premium
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Trip Details & Actions - Responsive */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
              <div className="flex gap-2 justify-center w-full sm:w-auto flex-wrap sm:flex-nowrap">
                <div className="bg-white/90 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs text-center shadow-md backdrop-blur-sm min-w-[60px] sm:min-w-[70px]">
                  <p className="text-gray-500 text-xs">Type:</p>
                  <p className="font-semibold capitalize text-gray-800 text-xs sm:text-sm truncate">{category}</p>
                </div>
                <div className="bg-white/90 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs text-center shadow-md backdrop-blur-sm min-w-[60px] sm:min-w-[70px]">
                  <p className="text-gray-500 text-xs">Days:</p>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm">{priceDetails.days}</p>
                </div>
                <div className="bg-white/90 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs text-center shadow-md backdrop-blur-sm min-w-[60px] sm:min-w-[70px]">
                  <p className="text-gray-500 text-xs">People:</p>
                  <p className="font-semibold text-gray-800 text-xs sm:text-sm">{numPeople}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors backdrop-blur-sm flex-shrink-0">
                  <Share2 className="h-4 w-4 text-gray-600" />
                </button>
                <button className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors backdrop-blur-sm flex-shrink-0">
                  <Heart className="h-4 w-4 text-rose-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 pt-4 sm:pt-6 pb-8 sm:pb-10 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-6">
        <div className="w-full lg:w-8/12">
          <div className="flex bg-white rounded-t-xl shadow-sm overflow-hidden border border-gray-200 mb-1.5">
            {[
              { key: 'dayByDay', label: 'Day by Day' },
              { key: 'arrivalDeparture', label: 'Arrival/Departure' },
              { key: 'personalDetails', label: 'Personal Details' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => !isTabDisabled(tab.key) && setActiveTab(tab.key)}
                className={`flex-1 text-center text-xs sm:text-sm font-medium py-3 transition-all ${activeTab === tab.key
                  ? 'text-green-600 border-b-2 border-green-600 bg-white'
                  : isTabDisabled(tab.key)
                    ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-700 bg-gray-50'
                  }`}
                disabled={isTabDisabled(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-b-xl shadow-sm px-4 sm:px-6 py-4 sm:py-5">
            {activeTab === 'dayByDay' && (
              <>
                <div className="flex justify-between items-center mb-4 sm:mb-5">
                  <h3 className="text-base sm:text-lg font-semibold text-green-500 ml-0 sm:ml-5">
                    {viewingDay ? `Day ${viewingDay}` : 'Your Itinerary'}
                  </h3>
                </div>

                {viewingDay ? (
                  <div>
                    <button
                      onClick={handleBackToList}
                      className="flex items-center text-green-600 mb-4 hover:text-green-700 transition-colors text-sm"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back to Overview
                    </button>

                    <Itenary
                      day={itenaries[viewingDay - 1]}
                      locations={defaultPackage.locations}
                      hotels={
                        guide.hotelsAvailable?.map((name, i) => ({
                          id: `hotel-${i + 1}`,
                          name,
                          location: defaultPackage.locations[viewingDay % defaultPackage.locations.length],
                          price: '$100-$200/night'
                        })) || []
                      }
                      activities={
                        guide.activitiesAvailable?.map((name, i) => ({
                          id: i + 1,
                          name,
                          location: defaultPackage.locations[viewingDay % defaultPackage.locations.length],
                          duration: i % 2 === 0 ? '2 hours' : '1 hour'
                        })) || []
                      }
                      guide={guide}
                      isEditing={false}
                      setIsEditing={() => { }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row">
                    {/* Timeline for medium screens and up */}
                    <div className="hidden md:block md:w-1/4 pr-5">
                      <div className="relative h-full">
                        <div className="absolute left-1/2 top-0 h-full w-1.5 bg-gray-100 rounded-full -translate-x-1/2">
                          <div
                            className={`w-1.5 rounded-full transition-all duration-500 ${isPremiumPackage ? 'bg-gradient-to-b from-amber-400 to-yellow-400' : 'bg-green-400'
                              }`}
                            style={{ height: `${(currentDay / numDays) * 100}%` }}
                          ></div>
                        </div>
                        <div className="h-full flex flex-col justify-between">
                          {itenaries.map((day, index) => {
                            const dayNum = index + 1;
                            const isActive = dayNum <= currentDay;
                            const isCurrent = dayNum === currentDay;
                            return (
                              <div
                                key={dayNum}
                                className="relative flex items-center justify-center cursor-pointer"
                                style={{ height: '104px' }}
                                onClick={() => handleDayNodeClick(dayNum)}
                              >
                                <div
                                  className={`absolute left-1/2 transform -translate-x-1/2 w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${isCurrent
                                    ? isPremiumPackage
                                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white ring-4 ring-amber-200 scale-110 shadow-lg'
                                      : 'bg-green-500 text-white ring-4 ring-green-200 scale-110 shadow-lg'
                                    : isActive
                                      ? isPremiumPackage
                                        ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow-md'
                                        : 'bg-green-400 text-white shadow-md'
                                      : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                  {dayNum}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Timeline - Centered with line through node centers */}
                    <div className="block md:hidden mb-4">
                      <div className="flex justify-center">
                        <div
                          className="relative flex items-center overflow-x-auto scrollbar-hide px-4 py-4 max-w-full"
                          ref={scrollContainerRef}
                        >
                          {/* Connecting line - positioned at exact center of nodes */}
                          <div className="absolute top-9 left-0 right-0 h-1 bg-gray-300 z-0"></div>

                          <div className="flex items-center justify-center space-x-8 sm:space-x-12 mx-auto px-4">
                            {itenaries.map((day, index) => {
                              const dayNum = index + 1;
                              const isActive = dayNum <= currentDay;
                              const isCurrent = dayNum === currentDay;

                              return (
                                <div
                                  key={dayNum}
                                  className="relative z-10 flex flex-col items-center flex-shrink-0"
                                >
                                  <div className="h-12 flex items-center justify-center">
                                    <button
                                      onClick={() => handleDayNodeClick(dayNum)}
                                      className={`
                                        flex-shrink-0 flex items-center justify-center rounded-full font-semibold 
                                        transition-all duration-300 relative z-20
                                        ${isCurrent ? 'w-12 h-12 scale-110 ring-4 shadow-lg' : ''}
                                        ${!isCurrent && isActive ? 'w-10 h-10 shadow-md' : ''}
                                        ${!isActive ? 'w-10 h-10 bg-gray-200 text-gray-600' : ''}
                                        ${isCurrent && isPremiumPackage ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white ring-amber-300' : ''}
                                        ${isCurrent && !isPremiumPackage ? 'bg-green-500 text-white ring-green-300' : ''}
                                        ${!isCurrent && isActive && isPremiumPackage ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-white' : ''}
                                        ${!isCurrent && isActive && !isPremiumPackage ? 'bg-green-400 text-white' : ''}
                                      `}
                                      ref={(el) => (nodeRefs.current[index] = el)}
                                    >
                                      {dayNum}
                                    </button>
                                  </div>
                                  <span className="text-xs text-gray-600 mt-2 font-medium whitespace-nowrap">
                                    Day {dayNum}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Day Cards Container with auto-scroll */}
                    <div className="w-full md:w-3/4 space-y-3 sm:space-y-4 day-cards-container max-h-[600px] overflow-y-auto">
                      {itenaries.map((day, index) => {
                        const dayNum = index + 1;
                        const isCurrentDay = dayNum === currentDay;

                        return (
                          <div
                            key={index}
                            ref={(el) => (dayCardRefs.current[index] = el)}
                            className={`p-4 sm:p-5 rounded-lg border transition-all group ${isCurrentDay
                              ? isPremiumPackage
                                ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white ring-1 ring-amber-100 shadow-lg'
                                : 'border-green-300 bg-green-50 ring-1 ring-green-100 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                              } cursor-pointer`}
                            onClick={() => handleDayNodeClick(dayNum)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="w-full">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                  <span className={`w-7 h-7 flex items-center justify-center rounded-full mr-3 text-sm font-semibold ${isCurrentDay
                                    ? isPremiumPackage
                                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                                      : 'bg-green-500 text-white'
                                    : isPremiumPackage
                                      ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-600'
                                      : 'bg-green-100 text-green-600'
                                    }`}>
                                    {day.dayNumber}
                                  </span>
                                  <span className={`font-semibold text-sm sm:text-base ${isPremiumPackage ? 'text-amber-600' : 'text-green-600'
                                    }`}>
                                    {day.location}
                                  </span>
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1.5 ml-10 flex items-center">
                                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-400" />
                                  <span className="font-medium text-gray-600">{day.date}</span>
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 sm:mt-4 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 ml-10">
                              <div className="flex items-start space-x-2 sm:space-x-3">
                                <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg flex-shrink-0">
                                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Departure</p>
                                  <p className="text-xs sm:text-sm text-gray-800 mt-1">
                                    {day.departure?.time && (
                                      <>
                                        <span className="font-medium">{formatTimeWithAMPM(day.departure.time)}</span>
                                        <span className="block text-gray-600 text-xs sm:text-sm mt-0.5 truncate">
                                          from {day.departure.address}
                                        </span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start space-x-2 sm:space-x-3">
                                <div className="p-1.5 sm:p-2 bg-amber-50 rounded-lg flex-shrink-0">
                                  <Hotel className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</p>
                                  <p className="text-xs sm:text-sm text-gray-800 mt-1">
                                    {day.hotel?.name ? (
                                      <span className="font-medium truncate">{day.hotel.name}</span>
                                    ) : (
                                      <span className="text-gray-400">Not selected</span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start space-x-2 sm:space-x-3">
                                <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg flex-shrink-0">
                                  <Map className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Activities</p>
                                  <p className="text-xs sm:text-sm text-gray-800 mt-1">
                                    {day.activities?.length > 0 ? (
                                      <span className="font-medium">{day.activities.length} selected</span>
                                    ) : (
                                      <span className="text-gray-400">No activities</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 sm:mt-5 ml-10">
                              <button
                                className={`flex items-center text-xs sm:text-sm group ${isCurrentDay
                                  ? isPremiumPackage ? 'text-amber-700' : 'text-green-700'
                                  : isPremiumPackage ? 'text-amber-600' : 'text-green-600'
                                  } font-medium`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDay(dayNum);
                                }}
                              >
                                <span>View details</span>
                                <ChevronRight className="ml-1.5 h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!viewingDay && (
                  <div className="flex justify-end mt-4 sm:mt-6">
                    <button
                      onClick={handleNextTab}
                      className={`px-4 py-2 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center text-sm shadow-sm transition-colors ${isPremiumPackage
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                        : 'bg-gradient-to-br from-green-400 to-green-600'
                        }`}
                    >
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'arrivalDeparture' && (
              <div>
                <ArrDep
                  defaultDestination={guide.location}
                  onNext={handleArrDepSubmit}
                  onBack={handleBack}
                  startDate={selectedStartDate}
                  duration={tripDuration}
                />
              </div>
            )}

            {activeTab === 'personalDetails' && (
              <div>
                <PersonalDetails
                  category={category}
                  count={count}
                  onSave={handleSavePersonalDetails}
                  onNext={handleNextTab}
                />
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 sm:px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center text-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleReviewJourney}
                    className={`px-4 sm:px-5 py-2.5 text-white rounded-lg transition-colors flex items-center text-sm shadow-sm hover:shadow-md ${isPremiumPackage
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'
                      : 'bg-green-600 hover:bg-green-700'
                      }`}
                  >
                    Review Journey
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-4/12 mt-6 lg:mt-0">
          <div className={`rounded-xl shadow-md overflow-hidden border mb-6 sm:mb-12 ${isPremiumPackage
            ? 'border-amber-200 bg-gradient-to-b from-white to-amber-50'
            : 'border-gray-100 bg-white'
            }`}>
            <div className={`px-4 sm:px-5 py-3 ${isPremiumPackage
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
              : 'bg-green-500'
              }`}>
              <h2 className="text-white font-semibold text-base">What's Included</h2>
            </div>

            <div className="p-4 sm:p-5">
              <div className="space-y-4 sm:space-y-5">
                {packageInclusions.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 ${isPremiumPackage ? 'bg-gradient-to-br from-amber-100 to-yellow-100' : 'bg-green-50'
                      }`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm sm:text-base">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{item.description}</p>
                      <ul className="mt-2 space-y-1">
                        {item.items.map((detail, i) => (
                          <li key={i} className="flex items-start text-xs text-gray-500">
                            <svg className="h-3 w-3 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">Activities Included</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {guide.activitiesAvailable?.slice(0, 6).map((activity, i) => (
                    <span key={i} className={`px-2 sm:px-2.5 py-1 text-xs rounded-full ${isPremiumPackage
                      ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700'
                      : 'bg-green-50 text-green-700'
                      }`}>
                      {activity}
                    </span>
                  ))}
                  {guide.activitiesAvailable?.length > 6 && (
                    <span className="px-2 sm:px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{guide.activitiesAvailable.length - 6} more
                    </span>
                  )}
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideDetails;