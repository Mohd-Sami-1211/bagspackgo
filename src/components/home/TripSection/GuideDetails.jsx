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
  Crown,
  Bookmark,
  CheckCircle2,
  Minus,
  ExternalLink,
  AlertCircle,
  Navigation,
  Utensils,
  Car,
  ShieldCheck,
  Mountain
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
    let perPersonPrice = 0;
    let fallbackDays = numDays;

    if (selectedPackage) {
      fallbackDays = selectedPackage.days || numDays;
      const tiers = selectedPackage.pricingTiers || [];
      const matchedTier = tiers.find(t => numPeople >= t.minPeople && numPeople <= t.maxPeople) || tiers[0];
      
      if (matchedTier) {
        perPersonPrice = Number(matchedTier.price);
      } else {
        perPersonPrice = Number(
          selectedPackage.price?.[category] ||
          selectedPackage.price?.individual ||
          0
        );
      }
      
      return {
        basePrice: perPersonPrice * numPeople,
        perPersonPrice: perPersonPrice,
        days: fallbackDays,
        isPackage: true,
      };
    } else {
      // Fallback to daily rate calculation on guide
      const dailyRate = Number(
        guide.price?.[category] || guide.price?.individual || 0
      );
      perPersonPrice = dailyRate * fallbackDays;
      
      return {
        basePrice: perPersonPrice * numPeople,
        perPersonPrice: perPersonPrice,
        days: fallbackDays,
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
  const isLoggedIn = !authLoading && !!user;

  // Show auth modal after 4s if not logged in at all
  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      const t = setTimeout(() => {
        openAuthModal({ closable: false, tab: "user", hideTabs: true });
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [authLoading, isLoggedIn, openAuthModal]);

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
            config: {
              date: selectedStartDate || null,
              peopleCount: count,
              category: category,
              days: priceDetails.days,
              computedPrice: priceDetails.perPersonPrice
            }
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
  const tabsRef = useRef(null);
  const dayCardRefs = useRef([]);
  const dayCardsContainerRef = useRef(null);

  // Scroll to tabs section when viewing day details so user stays near the content
  useEffect(() => {
    if (viewingDay && tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
      if (!isLoggedIn) {
        openAuthModal({ closable: true, tab: "user" });
        return;
      }
      setActiveTab("arrivalDeparture");
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else if (activeTab === "arrivalDeparture" && arrDepCompleted) {
      if (!user || user.role !== "user") {
        openAuthModal({ closable: true, tab: "user" });
        return;
      }
      setActiveTab("personalDetails");
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
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
    if (!user || user.role !== "user") {
      openAuthModal({ closable: true, tab: "user" });
      return;
    }
    const newStartDate = new Date(data.startDate);
    setSelectedStartDate(newStartDate);
    setArrivalDepartureData(data);
    setArrDepCompleted(true);
    setActiveTab("personalDetails");
    setTimeout(() => {
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const formatTimeWithAMPM = (time) => {
    if (!time || !time.toString().trim()) return "Not specified";
    const t = time.toString().trim();
    if (t.includes("AM") || t.includes("PM")) return t;
    // Only convert if it's a valid HH:MM format
    const match = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return t; // Return as-is (could be alphabets or any format)
    const hourNum = parseInt(match[1], 10);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${match[2]} ${ampm}`;
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
      guide: {
        _id: guide._id || guide.id,
        name: guide.name,
        companyName: guide.companyName,
        location: guide.location,
        destination: guide.destination,
        providerId: guide.providerId,
        termsAndConditions: guide.termsAndConditions,
        rating: guide.rating,
        reviews: guide.reviews,
        price: guide.price
      },
      selectedPackage: selectedPackage ? {
        _id: selectedPackage._id || selectedPackage.id,
        label: selectedPackage.label,
        destination: selectedPackage.destination,
        price: selectedPackage.price,
        pricingTiers: selectedPackage.pricingTiers,
        days: selectedPackage.days,
        termsAndConditions: selectedPackage.termsAndConditions
      } : null,
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
    params.set("days", priceDetails.days);
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
    <>
      <div
        className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 -mt-16 sm:-mt-10 md:-mt-12 lg:-mt-14"
        ref={pageTopRef}
      >
      {/* Toast Notification - Shadcn Style */}
      {showSaveToast && (
        <div className="fixed bottom-4 sm:bottom-6 sm:right-6 z-[100] flex w-full max-w-[420px] flex-col p-4 sm:p-0">
          <div className="pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-slate-200 bg-white p-6 shadow-lg animate-in fade-in slide-in-from-bottom-5 font-sans">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-slate-950">Package Saved</p>
              <p className="text-sm text-slate-500">Added to your favorites.</p>
            </div>
            <a href="/user/saved" className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-transparent px-3 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:pointer-events-none disabled:opacity-50">
              View
            </a>
          </div>
        </div>
      )}

      {/* Auth Gate Overlay — replaced by global AuthModal */}
      {/* Guide Card - Made Responsive */}
      <div className="w-full bg-white pb-6 sm:pb-8 md:pb-10 font-sans border-b">
        <div className="max-w-7xl mx-auto relative flex flex-col items-center">

          <div
            className="relative rounded-xl px-4 sm:px-8 pt-10 pb-4 sm:pt-6 sm:pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full max-w-5xl mx-auto gap-3 sm:gap-8 lg:gap-6 bg-slate-50/50 border border-gray-200 shadow-sm"
          >
            {/* Mobile/Tablet Back Button - Inside Card */}
            <button 
              onClick={() => router.back()} 
              className="absolute top-4 left-4 flex lg:hidden items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all text-gray-700 border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            {/* Desktop Back Button - Only on lg+ where there's space outside the card */}
            <button
              onClick={() => router.back()}
              className="hidden lg:flex absolute lg:top-1/2 lg:-left-36 lg:-translate-y-1/2 group items-center justify-center gap-2 transition-all w-fit bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:text-emerald-700 z-[30] active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm ml-1.5">Back</span>
            </button>

            {/* Rating Badge */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center bg-gray-50 rounded-full px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200">
              <Star className={`w-3.5 h-3.5 mr-1 ${guide?.rating > 0 ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
              {guide?.rating > 0 ? (
                <>
                  {guide.rating}
                  <span className="ml-1 text-gray-500">({guide.reviews || 0})</span>
                </>
              ) : (
                <span className="text-gray-500 text-[10px] uppercase">No ratings</span>
              )}
            </div>

            {/* Main Info Cluster */}
            <div className="flex items-center w-full sm:flex-1 min-w-0 mt-1 sm:mt-0 justify-start gap-4 sm:gap-6">
              <a
                href={`/user/provider/${guide.providerId || guide._id || guide.id}`}
                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center bg-emerald-50 border border-emerald-100 flex-shrink-0 hover:border-emerald-200 transition-colors overflow-hidden"
              >
                {guide.logo ? (
                  <img
                    src={guide.logo}
                    alt={guide.companyName || guide.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className={`text-xl sm:text-2xl font-semibold text-emerald-700 ${guide.logo ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                  {guide.companyName ? guide.companyName.split(" ").map((n) => n[0]).join("") : guide.name.split(" ").map((n) => n[0]).join("")}
                </div>
              </a>

              <div className="min-w-0 pr-20 sm:pr-4 text-left flex-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <a href={`/user/provider/${guide.providerId || guide._id || guide.id}`} className="group/title block min-w-0">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 leading-tight truncate group-hover/title:text-emerald-700 transition-colors">
                      {selectedPackage ? selectedPackage.label : guide.name}
                    </h2>
                  </a>
                  {isPremiumPackage && (
                    <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                      <Crown className="w-3.5 h-3.5 mr-1" /> Premium
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2 items-start sm:items-start text-sm text-gray-600">
                  <div className="flex items-center font-medium">
                    <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                    {selectedPackage?.destination || guide.location}
                  </div>

                  <a href={`/user/provider/${guide.providerId || guide._id || guide.id}`} className="inline-flex items-center text-sm hover:text-emerald-700 transition-colors">
                    <span className="text-gray-500 mr-1.5">By</span>
                    <span className="font-medium text-gray-900 truncate">{guide.companyName || guide.name}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Trip Details & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center sm:justify-end mt-4 sm:mt-0">
              <div className="flex gap-3 justify-center w-full sm:w-auto">
                <div className="bg-gray-50 px-4 py-3 rounded-lg text-center border border-gray-200 min-w-[80px]">
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">Variant</p>
                  <p className="font-semibold text-gray-900 text-sm capitalize">{category}</p>
                </div>
                <div className="bg-gray-50 px-4 py-3 rounded-lg text-center border border-gray-200 min-w-[80px]">
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">Stay</p>
                  <p className="font-semibold text-gray-900 text-sm">{priceDetails.days}D / {priceDetails.days - 1}N</p>
                </div>
                <div className="bg-gray-50 px-4 py-3 rounded-lg text-center border border-gray-200 min-w-[80px]">
                  <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">Guests</p>
                  <p className="font-semibold text-gray-900 text-sm">{numPeople} Slot</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: selectedPackage ? selectedPackage.label : guide.name,
                          text: `Check out this amazing trip package on bagspackgo!`,
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
                  className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors text-gray-600 hover:text-gray-900 flex-shrink-0"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSavePackage}
                  className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors flex-shrink-0"
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'text-emerald-600 fill-emerald-600' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Full Screen Layout for Detail Panes */}
    <div className="w-full bg-slate-50 py-8 pb-12 overflow-hidden font-sans">
      {/* About Package Overview & Gallery - Full Width Section Above Layout */}
      {(selectedPackage?.aboutPackage?.trim() || selectedPackage?.packagePhotos?.length > 0) && (
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 mb-8 overflow-hidden">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 overflow-hidden">
            {selectedPackage?.aboutPackage?.trim() && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0" /> <span className="truncate">About This Trip</span>
                </h2>
                <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-100 overflow-hidden">
                  <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap break-words">{selectedPackage.aboutPackage}</p>
                </div>
              </div>
            )}
            
            {selectedPackage?.packagePhotos?.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  📸 Package Gallery
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedPackage.packagePhotos.map((photo, i) => (
                    <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-gray-100">
                      <img src={photo} alt={`Package view ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
        <div className="w-full lg:w-8/12 scroll-mt-24 sm:scroll-mt-32" ref={tabsRef}>
          <div className="flex bg-white rounded-t-xl shadow-sm overflow-hidden border border-gray-200 mb-1.5">
            {[
              { key: "dayByDay", label: "Day by Day" },
              { key: "arrivalDeparture", label: "Pickup/Drop Off" },
              { key: "personalDetails", label: "Personal Details" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  if (isTabDisabled(tab.key)) return;
                  if (tab.key === "arrivalDeparture" && !isLoggedIn) {
                    openAuthModal({ closable: true, tab: "user" });
                    return;
                  }
                  if (tab.key === "personalDetails" && (!user || user.role !== "user")) {
                    openAuthModal({ closable: true, tab: "user" });
                    return;
                  }
                  setActiveTab(tab.key);
                }}
                className={`flex-1 text-center text-xs sm:text-sm font-semibold py-3 border-b-2 transition-all ${activeTab === tab.key
                    ? "text-slate-900 border-slate-900 bg-white"
                    : isTabDisabled(tab.key)
                      ? "text-slate-400 bg-slate-50/50 cursor-not-allowed border-transparent"
                      : "text-slate-500 hover:text-slate-700 bg-slate-50/50 border-transparent hover:bg-slate-100/50"
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
                        <div className="absolute left-1/2 top-0 h-full w-0.5 bg-slate-200 -translate-x-1/2">
                          <div
                            className={`w-0.5 transition-all duration-500 bg-emerald-600`}
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
                                  className={`absolute left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${isCurrent
                                      ? "bg-emerald-600 text-white ring-2 ring-offset-2 ring-emerald-600 shadow-sm"
                                      : isActive
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                        : "bg-white text-slate-400 border border-gray-200"
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
                          className="flex items-center overflow-x-auto py-4 max-w-full"
                          ref={scrollContainerRef}
                          style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
                        >
                          <div className="relative flex items-center justify-center space-x-8 sm:space-x-12 mx-auto px-6 min-w-max">
                            {/* Connecting line - spans the full width of the scrollable content */}
                            <div className="absolute top-[22px] h-1 bg-gray-300 z-0" style={{ left: '2rem', right: '2rem' }}></div>

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
                                        flex-shrink-0 flex items-center justify-center rounded-full font-semibold text-sm
                                        transition-all duration-200 relative z-20 
                                        ${isCurrent ? "w-10 h-10 ring-2 ring-offset-2 shadow-sm" : "w-10 h-10 border"}
                                        ${!isActive ? "bg-gray-50 text-gray-400 border-gray-200" : ""}
                                        ${isCurrent ? "bg-emerald-600 text-white ring-emerald-600" : ""}
                                        ${!isCurrent && isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100" : ""}
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
                      className="w-full md:w-3/4 space-y-3 sm:space-y-4 day-cards-container pr-1 max-h-[700px] overflow-y-auto scroll-smooth"
                      ref={dayCardsContainerRef}
                      style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
                    >
                      {itenaries.map((day, index) => {
                        const dayNum = index + 1;
                        const isCurrentDay = dayNum === currentDay;

                        return (
                          <div
                            key={index}
                            ref={(el) => (dayCardRefs.current[index] = el)}
                            className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 group ${isCurrentDay
                                  ? "border-emerald-500 bg-emerald-50/30 shadow-sm ring-1 ring-emerald-500"
                                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                } cursor-pointer`}
                            onClick={() => {
                              handleDayNodeClick(dayNum);
                              handleViewDay(dayNum);
                            }}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-900 flex items-center">
                                  <span
                                    className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 text-xs font-bold shrink-0 ${isCurrentDay
                                        ? "bg-emerald-600 text-white"
                                        : "bg-emerald-50 text-emerald-700"
                                      }`}
                                  >
                                    {day.dayNumber}
                                  </span>
                                  <span
                                    className={`text-sm sm:text-base text-gray-900 truncate`}
                                  >
                                    {day.location}
                                  </span>
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-9 flex items-center">
                                  <Calendar className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
                                  <span className="font-medium truncate">
                                    {day.date}
                                  </span>
                                </p>
                              </div>
                              {day.destinationPhotos?.[0] && (
                                <div className="shrink-0 ml-3">
                                  <img 
                                    src={day.destinationPhotos[0]} 
                                    alt={day.location}
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border border-slate-200"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="mt-3.5 ml-10 flex flex-col gap-3">
                              {/* Badges */}
                              <div className="flex flex-wrap gap-2">
                                {day.agenda && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-100`}>
                                    {AGENDA_LABELS[day.agenda?.toLowerCase()] || <span className="capitalize">{day.agenda?.replace(/-/g, ' ')}</span>}
                                  </span>
                                )}
                                {day.isDayTrip && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-100`}>
                                    <Car className="w-3 h-3 mr-1" /> Day Trip
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                                {/* Logistics & Time */}
                                <div className="flex items-start space-x-3">
                                  <div className={`p-2 rounded-xl flex-shrink-0 bg-gray-50`}>
                                    {day.agenda === 'travel-day' || day.isDayTrip ? (
                                      <Navigation className={`h-4 w-4 text-gray-500`} />
                                    ) : (
                                      <Clock className={`h-4 w-4 text-gray-500`} />
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
                                              <span className="text-[10px] text-[#D4AF37] flex items-center mt-0.5 font-bold tracking-tight uppercase">
                                                ⭐ {day.hotelStars} Star
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
                  <>
                    {/* Mobile-only: Show package details inline before Next button */}
                    <div className="lg:hidden mt-6 space-y-6">
                      {/* What's Included */}
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                          <h2 className="text-slate-900 font-semibold text-base">What's Included</h2>
                        </div>
                        <div className="p-4">
                          <div className="space-y-4">
                            {packageInclusions.map((item, index) => (
                              <div key={index} className="flex items-start">
                                <div className="flex-shrink-0 p-1.5 rounded-lg mr-3 bg-green-50">{item.icon}</div>
                                <div className="min-w-0">
                                  <h4 className="font-medium text-gray-800 text-sm">{item.title}</h4>
                                  {item.description && <p className="text-xs text-gray-600 mt-1">{item.description}</p>}
                                  {item.items?.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                      {item.items.map((detail, i) => (
                                        <li key={i} className="flex items-start text-xs text-gray-500">
                                          <svg className="h-3 w-3 text-green-500 mr-1.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                          {detail}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {selectedPackage?.exclusivesList && selectedPackage.exclusivesList.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="font-medium text-gray-800 mb-3 text-sm">What's NOT Included</h4>
                              <ul className="space-y-2">
                                {selectedPackage.exclusivesList.map((item, index) => (
                                  <li key={item.id || index} className="flex items-start text-xs text-gray-600">
                                    <Minus className="h-3 w-3 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{item.text || item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {selectedPackage?.additionalPoints && selectedPackage.additionalPoints.length > 0 && selectedPackage.additionalPoints.some(p => (p?.text || p)?.trim()) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="font-medium text-gray-800 mb-3 text-sm">Important Notes</h4>
                              <ul className="space-y-2.5">
                                {selectedPackage.additionalPoints.filter(item => (item?.text || item)?.trim()).map((item, index) => (
                                  <li key={item.id || index} className="flex items-start text-xs text-gray-600 bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="leading-relaxed font-medium">{item.text || item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Available Pickups */}
                      {selectedPackage?.pickupDropCities?.length > 0 && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                            <h2 className="text-slate-900 font-semibold text-base flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-500" /> Available Pickups
                            </h2>
                          </div>
                          <div className="p-4">
                            <div className="space-y-6">
                              {selectedPackage.pickupDropCities.map((city, idx) => (
                                <div key={idx} className="flex flex-col gap-3">
                                  <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600"><Navigation className="w-3.5 h-3.5" /></div>
                                    <span className="font-bold text-gray-900 text-xs tracking-tight uppercase">{city.cityName}</span>
                                  </div>
                                  <div className="grid grid-cols-1 gap-2.5">
                                    {city.locations.map((loc, lIdx) => (
                                      <div key={lIdx} className="flex items-center justify-between group bg-gray-50/70 hover:bg-gray-100/80 p-2.5 rounded-xl border border-gray-100/50 hover:border-gray-200 transition-all">
                                        <div className="flex items-center text-xs text-gray-600 min-w-0 pr-2">
                                          <div className="w-1.5 h-1.5 rounded-full mr-2.5 shrink-0 bg-emerald-400/80" />
                                          <span className="truncate font-medium">{loc.name}</span>
                                        </div>
                                        {loc.mapLink ? (
                                          <a href={loc.mapLink} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg transition-all flex-shrink-0 bg-white shadow-sm border border-gray-100 text-emerald-500 hover:bg-emerald-500 hover:text-white" title="Expand Map">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        ) : (
                                          <button onClick={() => alert("Coordinate details for this location were not provided.")} className="p-1.5 rounded-lg text-gray-300 bg-white/50 border border-gray-50 flex-shrink-0 cursor-help">
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

                    <div className="flex justify-end mt-4 sm:mt-6">
                      <button
                        onClick={handleNextTab}
                        className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-md transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                      >
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </>
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
                  packageId={packageId}
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
                  packageId={packageId}
                />
              </div>
            )}
          </div>
        </div>

        <div className={`w-full lg:w-4/12 mt-6 lg:mt-0 ${activeTab !== 'dayByDay' ? 'hidden lg:block' : 'hidden lg:block'}`}>


          <div
            className={`rounded-xl overflow-hidden border mb-6 sm:mb-12 shadow-sm ${isPremiumPackage
                ? "border-amber-200 bg-amber-50/10"
                : "border-slate-200 bg-white"
              }`}
          >
            <div
              className={`px-4 sm:px-5 py-3 border-b ${isPremiumPackage
                  ? "bg-amber-50 border-amber-100"
                  : "bg-slate-50 border-slate-100"
                }`}
            >
              <h2 className="text-slate-900 font-semibold text-base">
                What's Included
              </h2>
            </div>

            <div className="p-4 sm:p-5">
              <div className="space-y-4 sm:space-y-5">
                {packageInclusions.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div
                      className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg mr-3 sm:mr-4 bg-green-50"
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

              {selectedPackage?.additionalPoints && selectedPackage.additionalPoints.length > 0 && selectedPackage.additionalPoints.some(p => (p?.text || p)?.trim()) && (
                <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">
                    Important Notes
                  </h4>
                  <ul className="space-y-2.5">
                    {selectedPackage.additionalPoints.filter(item => (item?.text || item)?.trim()).map((item, index) => (
                      <li key={item.id || index} className="flex items-start text-xs text-gray-600 bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle h-3.5 w-3.5 text-amber-500 mr-2 mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                        <span className="leading-relaxed font-medium">{item.text || item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

          {selectedPackage?.pickupDropCities?.length > 0 && (
            <div
              className="rounded-xl shadow-sm overflow-hidden border mb-6 sm:mb-12 border-slate-200 bg-white"
            >
              <div
                className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-100"
              >
                <h2 className="text-slate-900 font-semibold text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 ml-0 text-slate-500" /> Available Pickups
                </h2>
              </div>

              <div className="p-4 sm:p-5">
                <div className="space-y-6">
                  {selectedPackage.pickupDropCities.map((city, idx) => (
                    <div key={idx} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
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
                              <div className="w-1.5 h-1.5 rounded-full mr-2.5 shrink-0 bg-emerald-400/80" />
                              <span className="truncate font-medium">{loc.name}</span>
                            </div>
                            {loc.mapLink ? (
                              <a
                                href={loc.mapLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg transition-all flex-shrink-0 bg-white shadow-sm border border-gray-100 text-emerald-500 hover:bg-emerald-500 hover:text-white"
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
    </>
  );
};

export default GuideDetails;
