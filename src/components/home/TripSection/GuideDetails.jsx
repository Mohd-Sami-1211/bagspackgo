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
  Mountain,
  Images,
  X,
  ChevronLeft,
  ZoomIn,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import PackageItinerary from "src/components/home/TripSection/PackageItinerary";
import ArrDep from "src/components/home/TripSection/Arr-Dep";
import PersonalDetails from "src/components/home/TripSection/PersonalDetails";
import { useAuth } from "@/context/AuthContext";
import { useSavedItemIds, useTripPhotos } from "@/lib/useTripCache";

const PACKAGE_HERO_IMAGES = [
  "/images/package-heroes/kashmir-dawn-lake.webp",
  "/images/package-heroes/kashmir-spring-valley.webp",
  "/images/package-heroes/kashmir-dal-dawn.webp",
  "/images/package-heroes/kashmir-winter-river.webp",
  "/images/package-heroes/kashmir-autumn-chinar.webp",
];

function packageHeroFor(packageKey) {
  const key = String(packageKey || "bagspackgo");
  const hash = [...key].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 0);
  return PACKAGE_HERO_IMAGES[hash % PACKAGE_HERO_IMAGES.length];
}

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

    return guide.packages?.[0] || null;
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
        const tierPrice = Number(matchedTier.price || 0);
        const tierDiscount = Math.min(100, Math.max(0, Number(matchedTier.discount || 0)));
        perPersonPrice = tierPrice * (1 - tierDiscount / 100);
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

  // Background fetch for Base64 photos
  const pkgId = packageId || selectedPackage?._id || selectedPackage?.id;
  const packageHeroImage = packageHeroFor(pkgId || guide.id || selectedPackage?.label);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPage, setGalleryPage] = useState(1);
  const [activeGalleryPhoto, setActiveGalleryPhoto] = useState(null);
  const [shouldLoadGallery, setShouldLoadGallery] = useState(false);
  const galleryLoadRef = useRef(null);
  const { data: photosData, isLoading: photosLoading } = useTripPhotos(shouldLoadGallery ? pkgId : null, { page: 1, limit: 5 });
  const { data: galleryData, isLoading: galleryLoading } = useTripPhotos(
    galleryOpen ? pkgId : null,
    { page: galleryPage, limit: 12 },
  );

  useEffect(() => {
    const target = galleryLoadRef.current;
    if (!target || shouldLoadGallery) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoadGallery(true);
      observer.disconnect();
    }, { rootMargin: "240px 0px" });

    observer.observe(target);
    return () => observer.disconnect();
  }, [shouldLoadGallery]);

  useEffect(() => {
    if (!galleryOpen && !activeGalleryPhoto) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [galleryOpen, activeGalleryPhoto]);

  useEffect(() => {
    if (!galleryOpen && !activeGalleryPhoto) return undefined;
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (activeGalleryPhoto) setActiveGalleryPhoto(null);
      else setGalleryOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryOpen, activeGalleryPhoto]);

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

  // Track package visit for admin retargeting activity (fire-and-forget)
  useEffect(() => {
    if (isUserAuthenticated && pkgId) {
      const trackVisit = (heartbeat = false) => {
        fetch('/api/activity/track-package', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: pkgId, heartbeat }),
        }).catch(() => {}); // Silently ignore errors
      };

      // Initial track
      trackVisit(false);

      // Heartbeat every 15 seconds keeps the visitor marked "live"
      const interval = setInterval(() => trackVisit(true), 15000);
      return () => clearInterval(interval);
    }
  }, [isUserAuthenticated, pkgId]);

  const [activeTab, setActiveTab] = useState("dayByDay");
  const [currentDay, setCurrentDay] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
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

  const handleSharePackage = async () => {
    const directPackageUrl = new URL(window.location.href);
    if (pkgId) {
      directPackageUrl.pathname = `/trip/${pkgId}`;
      directPackageUrl.search = "";
    }
    const shareData = {
      title: selectedPackage?.label || guide.name,
      text: `Explore ${selectedPackage?.label || guide.name} on bagspackgo.`,
      url: directPackageUrl.toString(),
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(directPackageUrl.toString());
      alert("Package link copied to clipboard.");
    } catch (error) {
      if (error?.name !== "AbortError") console.error("Unable to share package", error);
    }
  };

  // Initial check for saved status
  const pkgIdToCheck = packageId || selectedPackage?._id || selectedPackage?.id || guide._id;
  const { data: savedData } = useSavedItemIds();

  useEffect(() => {
    if (isUserAuthenticated && savedData?.success && savedData?.saved) {
      const isItemSaved = savedData.saved.some(item => item.itemId === pkgIdToCheck);
      setIsSaved(isItemSaved);
    }
  }, [isUserAuthenticated, savedData, pkgIdToCheck]);

  const defaultPackage = {
    name: selectedPackage?.label || "Basic Package",
    destination: guide.location,
    locations: ["Pahalgam", "Gulmarg", "Sonmarg"],
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
    pickup: {
      location: "",
      address: "",
      date: "",
      time: "",
    },
  });

  const [personalDetailsData, setPersonalDetailsData] = useState({
    contactDetails: {},
    personalDetails: [],
    children: [],
  });

  const pageTopRef = useRef(null);
  const tabsRef = useRef(null);

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
            title: key === "pickupDropoff" ? "Pickup" : val.title || key.charAt(0).toUpperCase() + key.slice(1),
            description: key === "pickupDropoff" ? "Pickup included" : val.title || "",
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

  const handleNextTab = () => {
    if (activeTab === "dayByDay") {
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

    const guideId = guide?.id || guide?._id || "unknown";
    router.push(
      `/user/trip/guidelist/tripdetails/${guideId}/reviewjourney?${params.toString()}`,
    );

  };

  return (
    <>
      <div
        className="relative w-full"
        ref={pageTopRef}
      >
      <section className="relative flex min-h-[620px] items-end overflow-hidden bg-[#102a24] pb-12 pt-44 text-white sm:min-h-[640px] sm:pb-16 sm:pt-44">
        <img
          src={packageHeroImage}
          alt="Kashmir mountain landscape"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,18,15,0.94)_0%,rgba(6,18,15,0.70)_42%,rgba(6,18,15,0.14)_76%,rgba(6,18,15,0.34)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#102a24] to-transparent" />

        <div className="absolute inset-x-0 top-20 z-10 sm:top-24">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleSharePackage} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white shadow-lg backdrop-blur-md transition hover:bg-white/15" aria-label="Share package"><Share2 className="h-4 w-4" /></button>
                <button type="button" onClick={handleSavePackage} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white shadow-lg backdrop-blur-md transition hover:bg-white/15" aria-label={isSaved ? "Remove saved package" : "Save package"}><Bookmark className={`h-4 w-4 ${isSaved ? "fill-white" : ""}`} /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end lg:px-8">
          <div className="max-w-3xl">
            {isPremiumPackage && <div className="mb-4"><span className="inline-flex items-center rounded-full bg-amber-300 px-3 py-1.5 text-xs font-bold text-[#2b2414]"><Crown className="mr-1.5 h-3.5 w-3.5" /> Premium</span></div>}
            <h1 className="max-w-3xl font-serif text-4xl leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              {selectedPackage?.label || guide.name}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-white/75 sm:text-base">
              <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-300" /> {selectedPackage?.destination || guide.location}</span>
              <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-emerald-300" /> {priceDetails.days} days · {Math.max(0, priceDetails.days - 1)} nights</span>
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-emerald-300" /> {numPeople} traveller{numPeople === 1 ? "" : "s"}</span>
            </div>
            <a href={`/user/provider/${guide.providerId || guide._id || guide.id}`} className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/20 py-2 pl-2 pr-4 text-sm backdrop-blur-md transition hover:bg-white/10">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white text-sm font-bold text-[#17372f]">
                {guide.logo ? <img src={guide.logo} alt="" className="h-full w-full object-cover" /> : (guide.companyName || guide.name)?.charAt(0)}
              </span>
              <span><span className="block text-[11px] uppercase tracking-wider text-white/50">Hosted by</span><span className="font-semibold">{guide.companyName || guide.name}</span></span>
              {guide?.rating > 0 && <span className="ml-2 inline-flex items-center gap-1 border-l border-white/15 pl-3 font-semibold"><Star className="h-4 w-4 fill-amber-300 text-amber-300" /> {guide.rating}</span>}
            </a>
          </div>

          <div className="rounded-[1.75rem] border border-white/15 bg-black/25 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Starting from</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">₹{Math.round(priceDetails.perPersonPrice).toLocaleString("en-IN")}</span>
              <span className="pb-1 text-sm text-white/60">/{peopleText}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/70">Book your package by paying only <span className="font-extrabold text-amber-300">30% now</span></p>
            <button
              onClick={() => tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-bold text-[#17372f] transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              View itinerary <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-white/55"><ShieldCheck className="h-4 w-4 text-emerald-300" /> Secure checkout · Local verified company</div>
          </div>
        </div>
      </section>

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
      <div className="hidden">
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
    <div className="w-full overflow-hidden bg-[#f4f3ee] py-8 pb-16 font-sans sm:py-12">
      <div ref={galleryLoadRef} className="h-px w-full" aria-hidden="true" />
      {/* About Package Overview & Gallery - Full Width Section Above Layout */}
      {(selectedPackage?.aboutPackage?.trim() || photosLoading || photosData?.data?.packagePhotos?.length > 0) && (
        <div className="mx-auto mb-10 w-full max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-[#17372f]/10 bg-white p-5 shadow-[0_24px_70px_-50px_rgba(23,55,47,0.65)] sm:p-8 lg:p-10">
            {selectedPackage?.aboutPackage?.trim() && (
              <div className="mb-8 sm:mb-10">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#9b7440]">Package overview</p>
                <h2 className="mb-4 flex items-center gap-3 font-serif text-3xl tracking-[-0.03em] text-[#17372f] sm:text-4xl">
                  <Mountain className="h-6 w-6 flex-shrink-0 text-[#1d6b55]" /> <span>About this trip</span>
                </h2>
                <p className="max-w-4xl whitespace-pre-wrap break-words text-base leading-8 text-[#586b65]">{selectedPackage.aboutPackage}</p>
              </div>
            )}
            
            {(photosLoading || photosData?.data?.packagePhotos?.length > 0) && (
              <div>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9b7440]">A glimpse of the journey</p>
                    <h3 className="flex items-center gap-3 font-serif text-3xl tracking-[-0.03em] text-[#17372f]"><Images className="h-6 w-6 text-[#1d6b55]" /> Package gallery</h3>
                  </div>
                  {!photosLoading && photosData?.pagination?.total > 0 && (
                    <button onClick={() => { setGalleryPage(1); setGalleryOpen(true); }} className="hidden shrink-0 rounded-full border border-[#17372f]/15 px-4 py-2 text-sm font-bold text-[#17372f] transition hover:bg-[#edf3ee] sm:inline-flex">View all {photosData.pagination.total}</button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-[1.5rem] sm:gap-3 lg:grid-cols-4 lg:grid-rows-2">
                  {photosLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className={`animate-pulse bg-slate-200 ${i === 0 ? "col-span-2 aspect-[16/10] lg:row-span-2 lg:aspect-auto" : "aspect-[4/3] lg:aspect-auto lg:min-h-40"}`} />
                    ))
                  ) : (
                    photosData.data.packagePhotos.map((photo, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const isLastPreview = i === photosData.data.packagePhotos.length - 1;
                          if (isLastPreview && photosData.pagination?.total > photosData.data.packagePhotos.length) {
                            setGalleryPage(1);
                            setGalleryOpen(true);
                          } else {
                            setActiveGalleryPhoto(photo);
                          }
                        }}
                        className={`group relative overflow-hidden bg-[#17372f] text-left ${i === 0 ? "col-span-2 aspect-[16/10] lg:row-span-2 lg:aspect-auto" : "aspect-[4/3] lg:aspect-auto lg:min-h-40"}`}
                      >
                        <img src={photo} alt={`Package view ${i + 1}`} loading={i > 1 ? "lazy" : "eager"} decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-90" />
                        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100"><ZoomIn className="h-4 w-4" /></span>
                        {i === photosData.data.packagePhotos.length - 1 && photosData.pagination?.total > photosData.data.packagePhotos.length && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-center text-base font-bold text-white backdrop-blur-[2px] sm:text-lg">+{photosData.pagination.total - photosData.data.packagePhotos.length} View more</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
                {!photosLoading && photosData?.pagination?.total > 0 && <button onClick={() => { setGalleryPage(1); setGalleryOpen(true); }} className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-[#17372f]/15 px-4 py-3 text-sm font-bold text-[#17372f] sm:hidden">View all {photosData.pagination.total} photos</button>}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">
        <div className="w-full lg:w-8/12 scroll-mt-24 sm:scroll-mt-32" ref={tabsRef}>
          <div className="flex gap-1 overflow-x-auto rounded-[1.4rem] border border-[#17372f]/10 bg-white p-1.5 shadow-[0_18px_55px_-42px_rgba(23,55,47,0.8)]">
            {[
              { key: "dayByDay", label: "Day by Day" },
              { key: "arrivalDeparture", label: "Pickup Details" },
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
                className={`min-w-[112px] flex-1 rounded-2xl px-2 py-3 text-center text-xs font-bold transition-all sm:text-sm ${activeTab === tab.key
                    ? "bg-[#17372f] text-white shadow-sm"
                    : isTabDisabled(tab.key)
                      ? "cursor-not-allowed text-slate-300"
                      : "text-[#61716c] hover:bg-[#edf3ee] hover:text-[#17372f]"
                  }`}
                disabled={isTabDisabled(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-[1.75rem] border border-[#17372f]/10 bg-white px-4 py-5 shadow-[0_22px_65px_-50px_rgba(23,55,47,0.75)] sm:px-6 sm:py-7">
            {activeTab === "dayByDay" && (
              <>
                <div className="flex justify-between items-center mb-4 sm:mb-5">
                  <h3 className="font-serif text-2xl tracking-[-0.02em] text-[#17372f] sm:ml-2 sm:text-3xl">
                    Your Itinerary
                  </h3>
                </div>



                <PackageItinerary
                  days={itenaries}
                  activeDay={currentDay}
                  onDayChange={setCurrentDay}
                  packageId={pkgId}
                />


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

        <div className={`w-full lg:w-4/12 mt-6 lg:sticky lg:top-24 lg:mt-0 lg:self-start ${activeTab !== 'dayByDay' ? 'hidden lg:block' : 'hidden lg:block'}`}>


          <div
            className={`mb-6 overflow-hidden rounded-[1.75rem] border shadow-[0_22px_65px_-50px_rgba(23,55,47,0.75)] ${isPremiumPackage
                ? "border-amber-200 bg-amber-50/20"
                : "border-[#17372f]/10 bg-white"
              }`}
          >
            <div
              className={`px-4 sm:px-5 py-3 border-b ${isPremiumPackage
                  ? "bg-amber-50 border-amber-100"
                  : "border-[#17372f]/10 bg-[#edf3ee]"
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
                className="mb-6 overflow-hidden rounded-[1.75rem] border border-[#17372f]/10 bg-white shadow-[0_22px_65px_-50px_rgba(23,55,47,0.75)]"
            >
              <div
                className="border-b border-[#17372f]/10 bg-[#edf3ee] px-4 py-3 sm:px-5"
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

    {galleryOpen && (
      <div className="fixed inset-0 z-[200] overflow-y-auto bg-[#07110e]/95 px-4 py-6 text-white backdrop-blur-xl sm:px-6 sm:py-8" role="dialog" aria-modal="true" aria-label="Package gallery">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Package gallery</p>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl">{selectedPackage?.label || guide.name}</h2>
            </div>
            <button type="button" onClick={() => setGalleryOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20" aria-label="Close gallery"><X className="h-5 w-5" /></button>
          </div>

          {galleryLoading && !galleryData ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, index) => <div key={index} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/10" />)}
            </div>
          ) : (
            <div className="relative">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {(galleryData?.data?.packagePhotos || []).map((photo, index) => (
                  <button key={`${galleryPage}-${index}`} type="button" onClick={() => setActiveGalleryPhoto(photo)} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <img src={photo} alt={`Gallery photo ${(galleryPage - 1) * 12 + index + 1}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-80" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20"><ZoomIn className="h-6 w-6 opacity-0 transition group-hover:opacity-100" /></span>
                  </button>
                ))}
              </div>
              {galleryLoading && <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#07110e]/55"><div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-emerald-300" /></div>}
            </div>
          )}

          {(galleryData?.pagination?.totalPages || 0) > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button type="button" onClick={() => setGalleryPage((page) => Math.max(1, page - 1))} disabled={galleryPage === 1} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft className="h-4 w-4" /> Previous</button>
              <span className="px-2 text-sm font-semibold text-white/60">{galleryPage} / {galleryData.pagination.totalPages}</span>
              <button type="button" onClick={() => setGalleryPage((page) => Math.min(galleryData.pagination.totalPages, page + 1))} disabled={!galleryData.pagination.hasMore} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35">Next <ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      </div>
    )}

    {activeGalleryPhoto && (
      <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/95 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Photo preview" onClick={() => setActiveGalleryPhoto(null)}>
        <button type="button" onClick={() => setActiveGalleryPhoto(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20" aria-label="Close photo"><X className="h-5 w-5" /></button>
        <img src={activeGalleryPhoto} alt="Expanded package view" className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" onClick={(event) => event.stopPropagation()} />
      </div>
    )}
    </>
  );
};

export default GuideDetails;
