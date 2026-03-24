"use client";
import {
  Star,
  Edit,
  MapPin,
  Users,
  Calendar,
  Share2,
  Heart,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Hotel,
  Clock,
  Map,
  Utensils,
  Car,
  ShieldCheck,
  Mountain,
  Minus,
  Navigation,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Itenary from "src/components/home/TripSection/Itenary";
import ArrDep from "src/components/home/TripSection/Arr-Dep";
import PersonalDetails from "src/components/home/TripSection/PersonalDetails";
import { useAuth } from "@/context/AuthContext";

const AGENDA_LABELS = {
  'arrival': 'Arrival & Check-in',
  'exploration': 'Exploration',
  'travel-day': 'Travel Day',
  'checkout': 'Exploration & Checkout'
};

const GuideDetails = ({ guide }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get parameters from URL with validation
  const category = ["individual", "couple", "group"].includes(
    searchParams.get("category"),
  )
    ? searchParams.get("category")
    : "individual";
  const daysRange = searchParams.get("daysRange") || "";
  const count = Math.max(1, parseInt(searchParams.get("count")) || 1);
  const dateParam = searchParams.get("date");
  const date =
    dateParam && !isNaN(new Date(dateParam).getTime())
      ? new Date(dateParam)
      : new Date();
  const packageId = searchParams.get("packageId");

  // Calculate derived values
  const numPeople = Math.max(1, Number(count) || 1);
  const peopleText = category === "couple" ? "couple" : "person";

  // Find the selected package
  const findSelectedPackage = () => {
    if (packageId) {
      return guide.packages?.find((pkg) => pkg.id === packageId);
    }

    if (daysRange) {
      const [minDays, maxDays] = daysRange.split("-").map(Number);
      const packagesInRange = guide.packages?.filter(
        (pkg) => pkg.days >= minDays && pkg.days <= maxDays,
      );
      return packagesInRange?.[0]; // Return first package in range
    }

    return null;
  };

  const selectedPackage = findSelectedPackage();
  const isPremiumPackage = selectedPackage?.type === "premium";

  // Use actual package days if available, otherwise use days from range
  const getTripDuration = () => {
    if (selectedPackage) {
      return selectedPackage.days; // Use actual package days
    }

    if (daysRange) {
      const [minDays, maxDays] = daysRange.split("-").map(Number);
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
      const packagePrice = Number(
        selectedPackage.price[category] ||
        selectedPackage.price.individual ||
        0,
      );
      return {
        basePrice: packagePrice * numPeople,
        perPersonPrice: packagePrice,
        days: selectedPackage.days,
        isPackage: true,
      };
    } else {
      // Fallback to daily rate calculation
      const dailyRate = Number(
        guide.price[category] || guide.price.individual || 0,
      );
      return {
        basePrice: dailyRate * numPeople * numDays,
        perPersonPrice: dailyRate * numDays,
        days: numDays,
        isPackage: false,
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

  const { user, loading: authLoading, openAuthModal } = useAuth();
  const isUserAuthenticated = !authLoading && user?.role === "user";

  // Show auth modal after 4s if not logged in as user
  useEffect(() => {
    if (authLoading) return;
    if (!isUserAuthenticated) {
      const t = setTimeout(() => {
        openAuthModal({ closable: false, tab: "user", hideTabs: true });
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [authLoading, isUserAuthenticated, openAuthModal]);

  const [activeTab, setActiveTab] = useState("dayByDay");
  const [currentDay, setCurrentDay] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [viewingDay, setViewingDay] = useState(null);
  const [itenaries, setItenaries] = useState([]);
  const [errors, setErrors] = useState({});
  const [arrDepCompleted, setArrDepCompleted] = useState(false);
  const [personalDetailsCompleted, setPersonalDetailsCompleted] =
    useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(date);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const handleSavePackage = async () => {
    if (!isUserAuthenticated) {
      openAuthModal({ closable: true, tab: "user" });
      return;
    }

    const pkgId = packageId || selectedPackage?._id || selectedPackage?.id || guide._id;

    try {
      if (isSaved) {
        // Remove from saved
        const res = await fetch(`/api/user/saved?itemId=${pkgId}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setIsSaved(false);
        }
      } else {
        // Add to saved
        const res = await fetch('/api/user/saved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId: pkgId,
            itemType: guide.category || 'trip',
          }),
        });

        if (res.ok) {
          setIsSaved(true);
          setShowSaveToast(true);
          setTimeout(() => setShowSaveToast(false), 5000);
        }
      }
    } catch (error) {
      console.error('Failed to update saved status', error);
    }
  };

  // Initial check for saved status
  useEffect(() => {
    const checkSaved = async () => {
      if (!isUserAuthenticated) return;
      try {
        const pkgId = packageId || selectedPackage?._id || selectedPackage?.id || guide._id;
        const res = await fetch('/api/user/saved');
        const data = await res.json();
        if (data.success && data.saved) {
          const isItemSaved = data.saved.some(item =>
            item.itemId === pkgId
          );
          setIsSaved(isItemSaved);
        }
      } catch (err) {
        console.error("Error checking saved status", err);
      }
    };
    checkSaved();
  }, [isUserAuthenticated, packageId, selectedPackage, guide._id]);

  const defaultPackage = {
    name: selectedPackage?.label || "Basic Package",
    destination: guide.location,
    locations: ["Pahalgam", "Gulmarg", "Sonmarg"],
    departureTime: "09:00",
    departureAddress: "Central Meeting Point",
    hotel: {
      name: "Standard Hotel",
      location: "Pahalgam",
      price: "$100/night",
    },
    activities: [
      { id: 1, name: "City Tour", duration: "2 hours", location: "Pahalgam" },
      {
        id: 2,
        name: "Local Cuisine Tasting",
        duration: "1.5 hours",
        location: "Pahalgam",
      },
    ],
  };

  const [arrivalDepartureData, setArrivalDepartureData] = useState({
    arrival: {
      city: "",
      pickupAddress: "",
      date: "",
      time: "",
    },
    departure: {
      city: "",
      dropoffAddress: "",
      date: "",
      time: "",
    },
  });

  const [personalDetailsData, setPersonalDetailsData] = useState({
    contactDetails: {},
    personalDetails: [],
    children: [],
  });

  const scrollContainerRef = useRef(null);
  const nodeRefs = useRef([]);
  const pageTopRef = useRef(null);
  const dayCardRefs = useRef([]);
  const dayCardsContainerRef = useRef(null);

  // Scroll to top when viewing day details
  useEffect(() => {
    if (viewingDay && pageTopRef.current) {
      pageTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [viewingDay]);

  // Auto-scroll to selected day card
  useEffect(() => {
    if (!viewingDay && currentDay && dayCardRefs.current[currentDay - 1]) {
      const dayCard = dayCardRefs.current[currentDay - 1];
      const container = dayCardsContainerRef.current;

      if (dayCard && container) {
        const cardTop = dayCard.offsetTop;
        const containerTop = container.offsetTop;
        const scrollPosition = cardTop - containerTop - 20; // 20px offset

        container.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
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
    const startDate =
      selectedStartDate && !isNaN(selectedStartDate.getTime())
        ? new Date(selectedStartDate)
        : new Date();

    const pkgItinerary = selectedPackage?.itinerary || [];
    const pkgActivities = selectedPackage?.activities || [];

    const initialItenaries = Array.from({ length: numDays }, (_, i) => {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);

      // Use real itinerary if available for this day
      const realDay =
        pkgItinerary.find((d) => d.day === i + 1) || pkgItinerary[i] || {};

      return {
        dayNumber: i + 1,
        date: dayDate.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        rawDate: dayDate,
        destination: selectedPackage?.destination || guide.location,
        location: realDay?.location || `Day ${i + 1}`,
        agenda: realDay?.agenda || "",
        travelFrom: realDay?.travelFrom || "",
        travelTo: realDay?.travelTo || "",
        pickupTime: realDay?.pickupTime || "",
        checkinTime: realDay?.checkinTime || "",
        isDayTrip: realDay?.isDayTrip || false,
        hotelStars: realDay?.hotelStars || "3",
        hotel: {
          name: realDay?.hotelName || "",
          location: realDay?.location || "",
          price: "",
        },
        hotelPhotos: realDay?.hotelPhotos || [],
        destinationPhotos: realDay?.destinationPhotos || [],
        highlights: realDay?.highlights || [],
        activities: [],
      };
    });
    setItenaries(initialItenaries);
  }, [numDays, selectedStartDate, selectedPackage]);

  const [bookingData, setBookingData] = useState({
    category: "individual",
    count: 1,
    personalDetails: null,
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

  const packageInclusions =
    selectedPackage?.inclusivesList && selectedPackage.inclusivesList.length > 0
      ? selectedPackage.inclusivesList.map((item) => ({
        icon: <ShieldCheck className="h-5 w-5 text-green-600" />,
        title: item.text || item,
        description: "",
        items: [],
      }))
      : selectedPackage?.inclusives
        ? Object.entries(selectedPackage.inclusives)
          .filter(([, val]) => val?.included)
          .map(([key, val]) => ({
            icon: inclusiveIconMap[key] || (
              <ShieldCheck className="h-5 w-5 text-green-600" />
            ),
            title: val.title || key.charAt(0).toUpperCase() + key.slice(1),
            description: val.title || "",
            items: (val.details || []).filter((d) => d && d.trim()),
          }))
        : [
          // Fallback if no real data
          {
            icon: <Utensils className="h-5 w-5 text-green-600" />,
            title: "Food",
            description: "Meals included",
            items: [],
          },
          {
            icon: <Car className="h-5 w-5 text-green-600" />,
            title: "Transport",
            description: "Transport included",
            items: [],
          },
        ];

  const handleViewDay = (dayNumber) => {
    setViewingDay(dayNumber);
    setCurrentDay(dayNumber);
  };

  const handleBackToList = () => {
    setViewingDay(null);
  };

  const handleNextTab = () => {
    if (activeTab === "dayByDay" && !viewingDay) {
      setActiveTab("arrivalDeparture");
    } else if (activeTab === "arrivalDeparture" && arrDepCompleted) {
      setActiveTab("personalDetails");
    }
  };

  const handleBack = () => {
    if (activeTab === "arrivalDeparture") {
      setActiveTab("dayByDay");
    } else if (activeTab === "personalDetails") {
      setActiveTab("arrivalDeparture");
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
    setActiveTab("personalDetails");
  };

  const formatTimeWithAMPM = (time) => {
    if (!time) return "";
    if (time.includes("AM") || time.includes("PM")) return time;

    const [hours, minutes] = time.split(":");
    const hourNum = parseInt(hours, 10);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isTabDisabled = (tabKey) => {
    switch (tabKey) {
      case "arrivalDeparture":
        return false;
      case "personalDetails":
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
  const handleReviewJourney = (formData) => {
    // Prepare all trip data with proper structure
    const tripData = {
      itenaries: itenaries,
      arrivalDeparture: arrivalDepartureData,
      personalDetails: {
        contactDetails: formData.contactDetails || {},
        personalDetails: formData.personalDetails || [],
        children: formData.children || [],
      },
      guide: guide,
      selectedPackage: selectedPackage,
      tripConfig: {
        category,
        days: priceDetails.days,
        daysRange,
        count: numPeople,
        date: dateParam,
        packageId,
      },
    };

    // Store in localStorage
    localStorage.setItem("tripData", JSON.stringify(tripData));

    // Create query params
    const params = new URLSearchParams();
    params.set("category", category);
    params.set("daysRange", daysRange || "");
    params.set("count", numPeople);
    if (dateParam) params.set("date", dateParam);
    if (packageId) params.set("packageId", packageId);

    // Debug logging
    console.log("Navigating to review page with guide ID:", guide.id);
    console.log("Guide object:", guide);
    console.log(
      "Path being used:",
      `/user/trip/guidelist/tripdetails/${guide.id}/reviewjourney`,
    );
    console.log(
      "Full URL:",
      `/user/trip/guidelist/tripdetails/${guide.id}/reviewjourney?${params.toString()}`,
    );

    // Try different route options:

    // Option 1: Original path
    // router.push(`/user/trip/guidelist/tripdetails/${guide.id}/reviewjourney?${params.toString()}`);

    // Option 2: Simpler path (common pattern)
    // router.push(`/trip/review/${guide.id}?${params.toString()}`);

    // Option 3: Check if guide.id exists and use a fallback
    const guideId = guide?.id || guide?._id || "unknown";
    router.push(
      `/user/trip/guidelist/tripdetails/${guideId}/reviewjourney?${params.toString()}`,
    );

    // Option 4: If you have a separate review page route
    // router.push(`/review-journey?guideId=${guideId}&${params.toString()}`);
  };

  return (
    <div
      className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 -mt-16 sm:-mt-10 md:-mt-12 lg:-mt-14 mb-10"
      ref={pageTopRef}
    >
      {/* Toast Notification - Centered Fix */}
      {showSaveToast && (
        <div className="fixed bottom-10 inset-x-0 flex justify-center z-[100] px-4">
          <div className="bg-gray-950 border border-white/20 text-white px-6 py-4 rounded-3xl flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 ring-1 ring-white/10">
            <div className="bg-emerald-500 p-1.5 rounded-full mr-3 shadow-lg shadow-emerald-500/20">
              <Bookmark className="h-4 w-4 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight uppercase">Package Saved!</span>
              <p className="text-[10px] text-gray-400 font-bold tracking-wide">Added to your global favorites</p>
            </div>
            <a href="/user/saved" className="ml-6 text-xs font-black text-emerald-400 hover:text-emerald-300 transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl whitespace-nowrap border border-white/5 uppercase tracking-widest">Explore</a>
          </div>
        </div>
      )}

      {/* Auth Gate Overlay — replaced by global AuthModal */}
      {/* Guide Card - Made Responsive */}
      <div className="w-full bg-white pb-6 sm:pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto relative flex flex-col items-center">

          <div
            className={`relative shadow-2xl rounded-2xl sm:rounded-3xl lg:rounded-full px-4 sm:px-8 pt-10 pb-4 sm:pt-6 sm:pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full max-w-5xl mx-auto gap-3 sm:gap-8 lg:gap-2 transition-all hover:shadow-emerald-500/10 ${isPremiumPackage
                ? "bg-gradient-to-r from-amber-400/90 via-yellow-400 to-amber-300"
                : "bg-gradient-to-r from-emerald-400 to-green-300"
              }`}
          >
            {/* Mobile Back Button - Inside Card */}
            <button 
              onClick={() => router.back()} 
              className="absolute top-4 left-4 flex sm:hidden items-center justify-center p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all text-white backdrop-blur-md border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {/* Desktop Back Button */}
            <button
              onClick={() => router.back()}
              className="hidden md:flex absolute md:top-1/2 md:-left-28 lg:-left-36 md:-translate-y-1/2 group items-center justify-center gap-2 transition-all w-fit bg-white/90 hover:bg-white text-gray-700 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-100 shadow-md hover:shadow-lg hover:text-emerald-700 hover:border-emerald-200 z-[30] active:scale-95 backdrop-blur-sm"
            >
              <div className="bg-gray-50 group-hover:bg-emerald-100 text-gray-600 group-hover:text-emerald-700 p-1 rounded-full transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-sm sm:text-base pr-1">Back</span>
            </button>

            {/* Premium Badge */}
            {isPremiumPackage && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center">
                <div className="flex items-center bg-gray-900 text-amber-400 rounded-full px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] border border-amber-400/30 shadow-2xl ring-2 ring-white/10">
                  <Crown className="w-3.5 h-3.5 mr-2 animate-pulse" />
                  Premium Luxury
                </div>
              </div>
            )}

            {/* Rating Badge */}
            <div className={`absolute top-2 right-2 sm:top-2 sm:right-6 lg:right-10 flex items-center bg-white/95 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-black text-gray-950 shadow-xl ring-1 ring-gray-200 ${!selectedPackage?.rating && "opacity-90"}`}>
              <Star className={`w-4 h-4 mr-2 ${selectedPackage?.rating > 0 ? 'text-amber-500 fill-amber-500' : 'text-gray-300 fill-gray-300'}`} />
              {selectedPackage?.rating > 0 ? (
                <>
                  {selectedPackage.rating}
                  <span className="ml-1.5 text-gray-400 text-[10px] font-bold">({selectedPackage.reviews || 0})</span>
                </>
              ) : (
                <span className="text-gray-500 text-[10px] uppercase tracking-wider">No ratings yet</span>
              )}
            </div>

            {/* Main Info Cluster */}
            <div className="flex items-center w-full sm:w-auto mt-1 sm:mt-0 justify-start sm:justify-start gap-3 sm:gap-6">
              <a
                href={`/user/provider/${guide.providerId || guide._id || guide.id}`}
                className={`w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center shadow-2xl border-4 flex-shrink-0 relative overflow-hidden group/avatar cursor-pointer hover:scale-105 transition-all duration-300 ${isPremiumPackage ? "bg-white border-amber-200/50 hover:border-amber-400" : "bg-white border-emerald-100 hover:border-emerald-300"
                  }`}
              >
                <div className={`text-xl sm:text-2xl lg:text-3xl font-black italic tracking-tighter transition-transform group-hover/avatar:scale-110 ${isPremiumPackage ? "text-amber-600" : "text-emerald-600"
                  }`}>
                  {guide.companyName ? guide.companyName.split(" ").map((n) => n[0]).join("") : guide.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 pointer-events-none" />
              </a>

              <div className="min-w-0 pr-2 sm:pr-4 drop-shadow-md text-left flex-1">
                <a href={`/user/provider/${guide.providerId || guide._id || guide.id}`} className="group/title block">
                  <h2 className="text-base sm:text-xl lg:text-2xl font-black text-white leading-tight mb-1 sm:mb-2 tracking-tight uppercase group-hover/title:text-emerald-50 transition-colors">
                    {selectedPackage ? selectedPackage.label : guide.name}
                  </h2>
                </a>

                <div className="flex flex-col gap-1.5 sm:gap-2.5 items-start sm:items-start">
                  <div className="flex items-center text-[10px] sm:text-[11px] text-white/90 font-black tracking-widest uppercase">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-white/80" />
                    {selectedPackage?.destination || guide.location}
                  </div>

                  <a href={`/user/provider/${guide.providerId || guide._id || guide.id}`} className="group/provider inline-flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-white/10 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all border border-white/10 shadow-sm w-fit">
                    <span className="text-[9px] sm:text-[11px] text-white/70 uppercase tracking-widest font-extrabold ml-1">By</span>
                    <span className="text-xs sm:text-base font-black text-white ml-0.5 mr-1 sm:mr-2 truncate max-w-[120px] sm:max-w-none">{guide.companyName || guide.name}</span>
                  </a>
                </div>

                {isPremiumPackage && (
                  <div className="flex items-center mt-3 justify-center sm:justify-start flex-wrap gap-2">
                    <span className="flex items-center text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-xl bg-amber-400/90 text-gray-950 shadow-[0_10px_20px_rgba(251,191,36,0.3)] tracking-tighter uppercase italic">
                      VVIP Access Granted
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Trip Details & Actions - Refined Alignment */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center sm:justify-end mt-4 sm:mt-0">
              <div className="flex gap-2.5 justify-center w-full sm:w-auto">
                <div className="bg-white/10 backdrop-blur-3xl px-4 sm:px-6 py-2.5 rounded-[22px] text-center shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] border border-white/20 min-w-[75px] sm:min-w-[100px] hover:bg-white/20 transition-all group/badge">
                  <p className="text-white/70 text-[8px] font-black uppercase tracking-[0.1em] mb-0.5 group-hover/badge:text-white">Variant</p>
                  <p className="font-black capitalize text-white text-xs sm:text-base leading-none tracking-tight">
                    {category}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-3xl px-4 sm:px-6 py-2.5 rounded-[22px] text-center shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] border border-white/20 min-w-[75px] sm:min-w-[100px] hover:bg-white/20 transition-all group/badge">
                  <p className="text-white/70 text-[8px] font-black uppercase tracking-[0.1em] mb-0.5 group-hover/badge:text-white">Stay</p>
                  <p className="font-black text-white text-xs sm:text-base leading-none tracking-tight">
                    {priceDetails.days}D / {priceDetails.days - 1}N
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-3xl px-4 sm:px-6 py-2.5 rounded-[22px] text-center shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] border border-white/20 min-w-[75px] sm:min-w-[100px] hover:bg-white/20 transition-all group/badge">
                  <p className="text-white/70 text-[8px] font-black uppercase tracking-[0.1em] mb-0.5 group-hover/badge:text-white">Guests</p>
                  <p className="font-black text-white text-xs sm:text-base leading-none tracking-tight">
                    {numPeople} Slot
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: selectedPackage ? selectedPackage.label : guide.name,
                          text: `Check out this amazing trip package on Bagspackgo!`,
                          url: window.location.href,
                        });
                      } else {
                        await navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      }
                    } catch (err) {
                      console.error('Error sharing', err);
                    }
                  }}
                  className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors backdrop-blur-sm flex-shrink-0"
                >
                  <Share2 className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={handleSavePackage}
                  className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors backdrop-blur-sm flex-shrink-0"
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'text-emerald-500 fill-emerald-500' : 'text-gray-600'}`} />
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
              { key: "dayByDay", label: "Day by Day" },
              { key: "arrivalDeparture", label: "Pickup/Drop Off" },
              { key: "personalDetails", label: "Personal Details" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => !isTabDisabled(tab.key) && setActiveTab(tab.key)}
                className={`flex-1 text-center text-xs sm:text-sm font-medium py-3 transition-all ${activeTab === tab.key
                    ? "text-green-600 border-b-2 border-green-600 bg-white"
                    : isTabDisabled(tab.key)
                      ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                      : "text-gray-500 hover:text-gray-700 bg-gray-50"
                  }`}
                disabled={isTabDisabled(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-b-xl shadow-sm px-4 sm:px-6 py-4 sm:py-5">
            {activeTab === "dayByDay" && (
              <>
                <div className="flex justify-between items-center mb-4 sm:mb-5">
                  <h3 className="text-base sm:text-lg font-semibold text-green-500 ml-0 sm:ml-5">
                    {viewingDay ? `Day ${viewingDay}` : "Your Itinerary"}
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
                          location:
                            defaultPackage.locations[
                            viewingDay % defaultPackage.locations.length
                            ],
                          price: "$100-$200/night",
                        })) || []
                      }
                      activities={
                        guide.activitiesAvailable?.map((name, i) => ({
                          id: i + 1,
                          name,
                          location:
                            defaultPackage.locations[
                            viewingDay % defaultPackage.locations.length
                            ],
                          duration: i % 2 === 0 ? "2 hours" : "1 hour",
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
                            className={`w-1.5 rounded-full transition-all duration-500 ${isPremiumPackage
                                ? "bg-gradient-to-b from-amber-400 to-yellow-400"
                                : "bg-green-400"
                              }`}
                            style={{
                              height: `${(currentDay / numDays) * 100}%`,
                            }}
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
                                style={{ height: "104px" }}
                                onClick={() => handleDayNodeClick(dayNum)}
                              >
                                <div
                                  className={`absolute left-1/2 transform -translate-x-1/2 w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${isCurrent
                                      ? isPremiumPackage
                                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white ring-4 ring-amber-200 scale-110 shadow-lg"
                                        : "bg-green-500 text-white ring-4 ring-green-200 scale-110 shadow-lg"
                                      : isActive
                                        ? isPremiumPackage
                                          ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-white shadow-md"
                                          : "bg-green-400 text-white shadow-md"
                                        : "bg-gray-200 text-gray-600"
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
                                        ${isCurrent ? "w-12 h-12 scale-110 ring-4 shadow-lg" : ""}
                                        ${!isCurrent && isActive ? "w-10 h-10 shadow-md" : ""}
                                        ${!isActive ? "w-10 h-10 bg-gray-200 text-gray-600" : ""}
                                        ${isCurrent && isPremiumPackage ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white ring-amber-300" : ""}
                                        ${isCurrent && !isPremiumPackage ? "bg-green-500 text-white ring-green-300" : ""}
                                        ${!isCurrent && isActive && isPremiumPackage ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-white" : ""}
                                        ${!isCurrent && isActive && !isPremiumPackage ? "bg-green-400 text-white" : ""}
                                      `}
                                      ref={(el) =>
                                        (nodeRefs.current[index] = el)
                                      }
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
                    <div
                      className="w-full md:w-3/4 space-y-3 sm:space-y-4 day-cards-container pr-1 max-h-[700px] overflow-y-auto scrollbar-hide scroll-smooth"
                      ref={dayCardsContainerRef}
                    >
                      {itenaries.map((day, index) => {
                        const dayNum = index + 1;
                        const isCurrentDay = dayNum === currentDay;

                        return (
                          <div
                            key={index}
                            ref={(el) => (dayCardRefs.current[index] = el)}
                            className={`p-4 sm:p-5 rounded-lg border transition-all group ${isCurrentDay
                                ? isPremiumPackage
                                  ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white ring-1 ring-amber-100 shadow-lg"
                                  : "border-green-300 bg-green-50 ring-1 ring-green-100 shadow-lg"
                                : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                              } cursor-pointer`}
                            onClick={() => handleDayNodeClick(dayNum)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="w-full">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                  <span
                                    className={`w-7 h-7 flex items-center justify-center rounded-full mr-3 text-sm font-semibold ${isCurrentDay
                                        ? isPremiumPackage
                                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
                                          : "bg-green-500 text-white"
                                        : isPremiumPackage
                                          ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-600"
                                          : "bg-green-100 text-green-600"
                                      }`}
                                  >
                                    {day.dayNumber}
                                  </span>
                                  <span
                                    className={`font-semibold text-sm sm:text-base ${isPremiumPackage
                                        ? "text-amber-600"
                                        : "text-green-600"
                                      }`}
                                  >
                                    {day.location}
                                  </span>
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1.5 ml-10 flex items-center">
                                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-400" />
                                  <span className="font-medium text-gray-600">
                                    {day.date}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="mt-3.5 ml-10 flex flex-col gap-3">
                              {/* Badges */}
                              <div className="flex flex-wrap gap-2">
                                {day.agenda && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isPremiumPackage ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200'
                                    }`}>
                                    {AGENDA_LABELS[day.agenda] || day.agenda}
                                  </span>
                                )}
                                {day.isDayTrip && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${isPremiumPackage ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                                    }`}>
                                    <Car className="w-3 h-3 mr-1" /> Day Trip
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                                {/* Logistics & Time */}
                                <div className="flex items-start space-x-3">
                                  <div className={`p-2 rounded-xl flex-shrink-0 ${isPremiumPackage ? 'bg-amber-50' : 'bg-blue-50'}`}>
                                    {day.agenda === 'travel-day' || day.isDayTrip ? (
                                      <Navigation className={`h-4 w-4 ${isPremiumPackage ? 'text-amber-500' : 'text-blue-500'}`} />
                                    ) : (
                                      <Clock className={`h-4 w-4 ${isPremiumPackage ? 'text-amber-500' : 'text-blue-500'}`} />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                      {day.agenda === 'arrival' ? 'Check-in Time' :
                                        day.agenda === 'travel-day' ? 'Travel Route & Time' : 'Pick-up Time'}
                                    </p>
                                    <div className="text-xs sm:text-sm text-gray-800 mt-1">
                                      {day.agenda === 'travel-day' ? (
                                        <>
                                          {day.travelFrom && day.travelTo ? (
                                            <span className="font-semibold block truncate text-ellipsis overflow-hidden">
                                              {day.travelFrom} → {day.travelTo}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400 block truncate">Route not specified</span>
                                          )}
                                          {day.pickupTime && (
                                            <span className="text-xs text-gray-500 flex items-center mt-0.5">
                                              <Clock className="w-3 h-3 mr-1" /> {formatTimeWithAMPM(day.pickupTime)}
                                            </span>
                                          )}
                                        </>
                                      ) : (
                                        <span className="font-medium">
                                          {day.agenda === 'arrival' && day.checkinTime
                                            ? formatTimeWithAMPM(day.checkinTime)
                                            : day.pickupTime
                                              ? formatTimeWithAMPM(day.pickupTime) : <span className="text-gray-400">Time not specified</span>}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Hotel Stay (if not checkout) */}
                                {day.agenda !== 'checkout' && (
                                  <div className="flex items-start space-x-3">
                                    <div className={`p-2 rounded-xl flex-shrink-0 ${isPremiumPackage ? 'bg-amber-50' : 'bg-purple-50'}`}>
                                      <Hotel className={`h-4 w-4 ${isPremiumPackage ? 'text-amber-500' : 'text-purple-500'}`} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        Accommodation
                                      </p>
                                      <p className="text-xs sm:text-sm text-gray-800 mt-1">
                                        {day.hotel?.name ? (
                                          <>
                                            <span className="font-semibold block truncate">
                                              {day.hotel.name}
                                            </span>
                                            {day.hotelStars && (
                                              <span className="text-[10px] text-amber-500 flex items-center mt-0.5 font-bold tracking-tight">
                                                <Star className="w-3 h-3 fill-amber-500 mr-0.5" /> {day.hotelStars} Star
                                              </span>
                                            )}
                                          </>
                                        ) : (
                                          <span className="text-gray-400">Not selected</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-3 sm:mt-5 ml-10">
                              <button
                                className={`flex items-center text-xs sm:text-sm group ${isCurrentDay
                                    ? isPremiumPackage
                                      ? "text-amber-700"
                                      : "text-green-700"
                                    : isPremiumPackage
                                      ? "text-amber-600"
                                      : "text-green-600"
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
                          ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                          : "bg-gradient-to-br from-green-400 to-green-600"
                        }`}
                    >
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === "arrivalDeparture" && (
              <div>
                <ArrDep
                  defaultLocation={selectedPackage?.destination || guide.location}
                  onNext={handleArrDepSubmit}
                  onBack={handleBack}
                  startDate={selectedStartDate}
                  duration={tripDuration}
                  pickupDropCities={selectedPackage?.pickupDropCities || []}
                />
              </div>
            )}

            {activeTab === "personalDetails" && (
              <div>
                <PersonalDetails
                  category={category}
                  count={count}
                  onSave={handleSavePersonalDetails}
                  onNext={handleNextTab}
                  onSubmit={handleReviewJourney}
                  onBack={handleBack}
                />
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-4/12 mt-6 lg:mt-0">
          <div
            className={`rounded-xl shadow-md overflow-hidden border mb-6 sm:mb-12 ${isPremiumPackage
                ? "border-amber-200 bg-gradient-to-b from-white to-amber-50"
                : "border-gray-100 bg-white"
              }`}
          >
            <div
              className={`px-4 sm:px-5 py-3 ${isPremiumPackage
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                  : "bg-green-500"
                }`}
            >
              <h2 className="text-white font-semibold text-base">
                What's Included
              </h2>
            </div>

            <div className="p-4 sm:p-5">
              <div className="space-y-4 sm:space-y-5">
                {packageInclusions.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div
                      className={`flex-shrink-0 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 ${isPremiumPackage
                          ? "bg-gradient-to-br from-amber-100 to-yellow-100"
                          : "bg-green-50"
                        }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm sm:text-base">
                        {item.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {item.items.map((detail, i) => (
                          <li
                            key={i}
                            className="flex items-start text-xs text-gray-500"
                          >
                            <svg
                              className="h-3 w-3 text-green-500 mr-1.5 mt-0.5 flex-shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPackage?.exclusivesList &&
                selectedPackage.exclusivesList.length > 0 && (
                  <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">
                      What's NOT Included
                    </h4>
                    <ul className="space-y-2">
                      {selectedPackage.exclusivesList.map((item, index) => (
                        <li
                          key={item.id || index}
                          className="flex items-start text-xs text-gray-600"
                        >
                          <Minus className="h-3 w-3 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item.text || item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">
                  Activities Included
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {selectedPackage?.activities?.length > 0 ? (
                    selectedPackage.activities.slice(0, 6).map((activity, i) => (
                      <span
                        key={i}
                        className={`px-2 sm:px-2.5 py-1 text-xs rounded-full ${isPremiumPackage
                            ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700"
                            : "bg-green-50 text-green-700"
                          }`}
                      >
                        {activity.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500 italic">No specific activities</span>
                  )}
                  {selectedPackage?.activities?.length > 6 && (
                    <span className="px-2 sm:px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{selectedPackage.activities.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pickup and Dropoff Section - Restored as Separate Card */}
          {selectedPackage?.pickupDropCities?.length > 0 && (
            <div
              className={`rounded-xl shadow-md overflow-hidden border mb-6 sm:mb-12 ${isPremiumPackage
                  ? "border-amber-200 bg-gradient-to-b from-white to-amber-50"
                  : "border-gray-100 bg-white"
                }`}
            >
              <div
                className={`px-4 sm:px-5 py-3 ${isPremiumPackage
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                    : "bg-green-500"
                  }`}
              >
                <h2 className="text-white font-semibold text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 ml-0" /> Available Pickups
                </h2>
              </div>

              <div className="p-4 sm:p-5">
                <div className="space-y-6">
                  {selectedPackage.pickupDropCities.map((city, idx) => (
                    <div key={idx} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                        <div className={`p-1.5 rounded-lg ${isPremiumPackage ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          <Navigation className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-gray-900 text-xs tracking-tight uppercase">
                          {city.cityName}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {city.locations.map((loc, lIdx) => (
                          <div key={lIdx} className="flex items-center justify-between group bg-gray-50/70 hover:bg-gray-100/80 p-2.5 rounded-xl border border-gray-100/50 hover:border-gray-200 transition-all">
                            <div className="flex items-center text-xs text-gray-600 min-w-0 pr-2">
                              <div className={`w-1.5 h-1.5 rounded-full mr-2.5 shrink-0 ${isPremiumPackage ? 'bg-amber-400/80' : 'bg-emerald-400/80'}`} />
                              <span className="truncate font-medium">{loc.name}</span>
                            </div>
                            {loc.mapLink ? (
                              <a
                                href={loc.mapLink}
                                target="_blank"
                                rel="noreferrer"
                                className={`p-1.5 rounded-lg transition-all flex-shrink-0 bg-white shadow-sm border border-gray-100 ${isPremiumPackage ? 'text-amber-500 hover:bg-amber-500 hover:text-white' : 'text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                title="Expand Map"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <button
                                onClick={() => alert("Coordinate details for this location were not provided.")}
                                className="p-1.5 rounded-lg text-gray-300 bg-white/50 border border-gray-50 flex-shrink-0 cursor-help"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuideDetails;
