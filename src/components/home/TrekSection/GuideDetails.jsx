'use client';
import {
  Star, MapPin, Users, Clock, Calendar, Share2, ArrowRight, ArrowLeft,
  Mountain, Compass, Flag, Backpack, Tent, Sun, ShieldCheck, Bookmark,
  CheckCircle2, AlertCircle, Navigation, Crown, Camera, Minus, ExternalLink
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import TrekItenary from 'src/components/home/TrekSection/Itenary';
import PickupDropoff from 'src/components/home/TrekSection/Pick-Drop';
import PersonalDetails from 'src/components/home/TrekSection/PersonalDetails';
import { useAuth } from '@/context/AuthContext';

/* ── helpers ───────────────────────────────────────── */
const DIFF_CFG = {
  easy: { cls: 'bg-green-100 text-green-700', label: 'Easy' },
  moderate: { cls: 'bg-amber-100 text-amber-700', label: 'Moderate' },
  hard: { cls: 'bg-orange-100 text-orange-700', label: 'Hard' },
  extreme: { cls: 'bg-red-100 text-red-700', label: 'Extreme' },
};

function DiffBadge({ level }) {
  const cfg = DIFF_CFG[level?.toLowerCase()] || DIFF_CFG.moderate;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.cls}`}>
      <Flag className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

/* ── main component ─────────────────────────────────── */
const TrekGuideDetails = ({ guide }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const isUserAuthenticated = !authLoading && user?.role === 'user';

  /* URL params */
  const peopleCountParam = searchParams.get('peopleCount') || searchParams.get('peopleRange') || '';
  const dateParam = searchParams.get('date');

  // Now uses exact count from the counter instead of a range
  const peopleCount = Math.max(1, parseInt(peopleCountParam) || 1);
  const initialMinPeople = peopleCount;
  const initialMaxPeople = peopleCount;

  const initialDate = dateParam && !isNaN(new Date(dateParam).getTime())
    ? new Date(dateParam) : new Date();

  /* state */
  const [activeTab, setActiveTab] = useState('itinerary');
  const [pickupDropoffCompleted, setPickupDropoffCompleted] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(initialDate);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [pickupDropoffData, setPickupDropoffData] = useState({
    pickup: { location: '', address: '', city: '', date: '', time: '' },
    dropoff: { location: '', address: '', city: '', date: '', time: '' },
  });
  const [currentDay, setCurrentDay] = useState(1);
  const [viewingDay, setViewingDay] = useState(null);

  const scrollContainerRef = useRef(null);
  const nodeRefs = useRef([]);
  const tabsRef = useRef(null);
  const dayCardRefs = useRef([]);
  const dayCardsContainerRef = useRef(null);

  const handleDayNodeClick = (dayNum) => {
    setCurrentDay(dayNum);
  };

  const handleBackToList = () => {
    setViewingDay(null);
  };

  useEffect(() => {
    if (!viewingDay && currentDay && dayCardRefs.current[currentDay - 1]) {
      const dayCard = dayCardRefs.current[currentDay - 1];
      const container = dayCardsContainerRef.current;
      if (dayCard && container) {
        const scrollPosition = dayCard.offsetTop - container.offsetTop - 20;
        container.scrollTo({ top: scrollPosition, behavior: "smooth" });
      }
    }
  }, [currentDay, viewingDay]);

  useEffect(() => {
    const activeNode = nodeRefs.current[currentDay - 1];
    const container = scrollContainerRef.current;
    if (activeNode && container) {
      const scrollPos = (activeNode.offsetLeft + activeNode.offsetWidth / 2) - (container.offsetWidth / 2);
      container.scrollTo({ left: scrollPos, behavior: "smooth" });
    }
  }, [currentDay]);

  /* Auth gate after 4 s */
  useEffect(() => {
    if (authLoading) return;
    if (!isUserAuthenticated) {
      const t = setTimeout(() => openAuthModal({ closable: false, tab: 'user', hideTabs: true }), 4000);
      return () => clearTimeout(t);
    }
  }, [authLoading, isUserAuthenticated, openAuthModal]);

  /* Saved status */
  useEffect(() => {
    if (!isUserAuthenticated) return;
    (async () => {
      try {
        const res = await fetch('/api/user/saved');
        const data = await res.json();
        if (data.success && data.saved) {
          setIsSaved(data.saved.some(item => item.itemId === guide?._id));
        }
      } catch { }
    })();
  }, [isUserAuthenticated, guide?._id]);

  const handleSavePackage = async () => {
    if (!isUserAuthenticated) { openAuthModal({ closable: true, tab: 'user' }); return; }
    try {
      if (isSaved) {
        const res = await fetch(`/api/user/saved?itemId=${guide._id}`, { method: 'DELETE' });
        if (res.ok) setIsSaved(false);
      } else {
        const res = await fetch('/api/user/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: guide._id,
            itemType: 'trek',
            config: {
              date: selectedStartDate || null,
              peopleCount: peopleCount,
              days: duration,
              computedPrice: pricePerPerson
            }
          }),
        });
        if (res.ok) { setIsSaved(true); setShowSaveToast(true); setTimeout(() => setShowSaveToast(false), 5000); }
      }
    } catch { }
  };

  /* Package data */
  const trekPackage = guide;
  const isPremiumPackage = false; // logic removed
  const priceObj = trekPackage?.pricingTiers?.length > 0
    ? [...trekPackage.pricingTiers].sort((a, b) => a.minPeople - b.minPeople)[0]
    : { price: 0 };
  const pkgMinPeople = trekPackage?.pricingTiers?.length > 0 ? Math.min(...trekPackage.pricingTiers.map(t => t.minPeople)) : 1;
  const pkgMaxPeople = trekPackage?.pricingTiers?.length > 0 ? Math.max(...trekPackage.pricingTiers.map(t => t.maxPeople)) : 10;
  const pricePerPerson = priceObj.price ?? 0;
  const duration = trekPackage?.days ?? 1;

  /* Itinerary points — flat bullet list from itinerary array */
  const rawItinerary = Array.isArray(trekPackage?.itinerary) ? trekPackage.itinerary : [];
  // Each item can be { agenda, description, highlights } OR just a string
  const itineraryPoints = rawItinerary.length > 0
    ? rawItinerary.flatMap(item => {
      if (typeof item === 'string') return [item];
      const points = [];
      if (item.agenda) points.push(item.agenda);
      if (item.description) points.push(item.description);
      if (Array.isArray(item.highlights)) points.push(...item.highlights);
      return points.length > 0 ? points : [`Day activity`];
    })
    : ['Trek through scenic mountain trails', 'Reach base camp', 'Summit attempt', 'Descent and return'];

  /* Inclusions */
  const inclusiveIconMap = {
    food: <Sun className="h-5 w-5 text-emerald-600" />,
    transport: <Navigation className="h-5 w-5 text-emerald-600" />,
    accommodation: <Tent className="h-5 w-5 text-emerald-600" />,
    guidance: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
    equipment: <Backpack className="h-5 w-5 text-emerald-600" />,
    permits: <Flag className="h-5 w-5 text-emerald-600" />,
  };

  const packageInclusions =
    trekPackage?.inclusivesList?.length > 0
      ? trekPackage.inclusivesList.map(item => ({
        icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
        title: item.text || item,
        items: [],
      }))
      : trekPackage?.inclusives
        ? Object.entries(trekPackage.inclusives)
          .filter(([, v]) => v?.included)
          .map(([key, v]) => ({
            icon: inclusiveIconMap[key] || <ShieldCheck className="h-5 w-5 text-emerald-600" />,
            title: v.title || key.charAt(0).toUpperCase() + key.slice(1),
            items: (v.details || []).filter(d => d?.trim()),
          }))
        : [
          { icon: <Backpack className="h-5 w-5 text-emerald-600" />, title: 'Equipment', items: ['Tents', 'Sleeping bags', 'Trekking poles'] },
          { icon: <Tent className="h-5 w-5 text-emerald-600" />, title: 'Accommodation', items: ['Quality tents', 'Sleeping mats'] },
          { icon: <Sun className="h-5 w-5 text-emerald-600" />, title: 'Meals', items: ['3 meals/day', 'Energy snacks'] },
          { icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />, title: 'Guide', items: ['Certified guides', 'First-aid trained'] },
          { icon: <Flag className="h-5 w-5 text-emerald-600" />, title: 'Permits', items: ['Forest permits', 'Entry fees'] },
        ];

  /* Itenary array mapped from duration */
  const itenaries = Array.from({ length: duration }, (_, i) => {
    const dayDate = new Date(selectedStartDate);
    dayDate.setDate(dayDate.getDate() + i);
    const realDay = (Array.isArray(trekPackage?.itinerary) && trekPackage.itinerary[i]) || {};

    return {
      dayNumber: i + 1,
      day: i + 1,
      date: dayDate.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" }),
      title: realDay.title || `Day ${i + 1} Trek`,
      description: typeof realDay === 'string' ? null : (realDay.description || ""),
      highlights: realDay.highlights || (typeof realDay === 'string' ? [realDay] : []),
      altitude: realDay.altitude || trekPackage?.altitude || 'Standard',
      duration: realDay.duration || '5-6 hours',
      accommodation: realDay.accommodation || 'Campsite',
      meals: realDay.meals || ['Breakfast', 'Lunch', 'Dinner'],
      location: realDay.location || realDay.title || (typeof realDay === 'string' ? "Trail" : `Camp ${i + 1}`)
    };
  });

  /* Tab helpers */
  const isTabDisabled = key => key === 'personalDetails' ? !pickupDropoffCompleted : false;

  const handleNextTab = () => {
    if (activeTab === 'itinerary') {
       setActiveTab('pickupDropoff');
       setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
    else if (activeTab === 'pickupDropoff' && pickupDropoffCompleted) {
       setActiveTab('personalDetails');
       setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  };

  const handleBack = () => {
    if (activeTab === 'pickupDropoff') setActiveTab('itinerary');
    if (activeTab === 'personalDetails') setActiveTab('pickupDropoff');
  };

  const handlePickupDropoffSubmit = data => {
    setSelectedStartDate(new Date(data.startDate));
    setPickupDropoffData(data);
    setPickupDropoffCompleted(true);
    setActiveTab('personalDetails');
    setTimeout(() => tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const handleSavePersonalDetails = data => {
    const trekData = {
      itenaries: itineraryPoints,
      pickupDropoff: pickupDropoffData,
      personalDetails: {
        contactDetails: data.contactDetails || {},
        personalDetails: data.personalDetails || [],
        emergencyContacts: data.emergencyContacts || [],
      },
      guide: {
        _id: guide._id,
        name: guide.name,
        destination: guide.destination,
        location: guide.location,
        price: guide.price,
        pricingTiers: guide.pricingTiers,
        provider: guide.provider ? {
          _id: guide.provider._id || guide.provider,
          companyname: guide.provider.companyname || guide.provider.companyName || guide.provider.username,
          rating: guide.provider.rating,
          reviews: guide.provider.reviews
        } : null,
      },
      trekConfig: {
        trekId: trekPackage._id,
        peopleCount,
        date: selectedStartDate.toISOString(),
        days: duration,
      },
      trekDetails: {
        name: trekPackage?.name || 'Trek',
        difficulty: trekPackage?.trekLevel || 'Moderate',
        altitude: trekPackage?.altitude || '',
        baseCamp: trekPackage?.destination || '',
        itinerary: itineraryPoints,
      },
    };
    localStorage.setItem('trekData', JSON.stringify(trekData));
    const actualCount = data.personalDetails?.length || peopleCount;
    router.push(
      `/user/trek/guidelist/trekdetails/${guide.provider?._id || guide.provider}/reviewjourney` +
      `?trekId=${trekPackage._id}&peopleCount=${peopleCount}&count=${actualCount}&date=${selectedStartDate.toISOString()}`
    );
  };

  const trekName = trekPackage?.name || 'Standard Trek';
  const destination = trekPackage?.destination || 'Base Camp';
  const difficulty = trekPackage?.trekLevel || 'moderate';
  const companyName = guide?.provider?.companyname || guide?.provider?.companyName || guide?.provider?.username || 'Expert Guide';
  const providerId = guide?.provider?._id || guide?.provider || guide?._id;
  const initials = companyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4 sm:pt-6 -mt-12">

        {/* ── Toast ── */}
        {showSaveToast && (
          <div className="fixed bottom-4 sm:bottom-6 sm:right-6 z-[100] flex w-full max-w-[420px] flex-col p-4 sm:p-0">
            <div className="pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-slate-200 bg-white p-6 shadow-lg animate-in fade-in slide-in-from-bottom-5 font-sans">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-slate-950">Trek Saved</p>
                <p className="text-sm text-slate-500">Added to your favorites.</p>
              </div>
              <a href="/user/saved" className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-transparent px-3 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:pointer-events-none disabled:opacity-50">
                View
              </a>
            </div>
          </div>
        )}

        {/* ── Hero Card ── */}
        <div className="w-full pb-6 sm:pb-8 md:pb-10">
          <div className="max-w-7xl mx-auto relative flex flex-col items-center">
            <div
              className="relative rounded-xl px-4 sm:px-8 pt-10 pb-4 sm:pt-6 sm:pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full max-w-5xl mx-auto gap-3 sm:gap-8 lg:gap-6 bg-slate-50/50 border border-gray-200 shadow-sm"
            >
              {/* Mobile Back Button - Inside Card */}
              <button 
                onClick={() => router.back()} 
                className="absolute top-4 left-4 flex sm:hidden items-center justify-center p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all text-gray-700 border border-gray-200"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              {/* Desktop Back Button */}
              <button
                onClick={() => router.back()}
                className="hidden md:flex absolute md:top-1/2 md:-left-28 lg:-left-36 md:-translate-y-1/2 group items-center justify-center gap-2 transition-all w-fit bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:text-emerald-700 z-[30] active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm ml-1.5">Back</span>
              </button>

              {/* Rating Badge */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center bg-gray-50 rounded-full px-3 py-1 text-xs font-medium text-gray-700 border border-gray-200">
                <Star className={`w-3.5 h-3.5 mr-1 ${trekPackage?.provider?.rating > 0 ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
                {trekPackage?.provider?.rating > 0 ? (
                  <>
                    {trekPackage.provider.rating}
                    <span className="ml-1 text-gray-500">({trekPackage.provider.reviews || trekPackage.provider.totalRatings || 0})</span>
                  </>
                ) : (
                  <span className="text-gray-500 text-[10px] uppercase">No ratings</span>
                )}
              </div>

              {/* Main Info Cluster */}
              <div className="flex items-center w-full sm:flex-1 min-w-0 mt-1 sm:mt-0 justify-start gap-4 sm:gap-6">
                <a
                  href={`/user/provider/${providerId}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center bg-emerald-50 border border-emerald-100 flex-shrink-0 hover:border-emerald-200 transition-colors"
                >
                  <div className="text-xl sm:text-2xl font-semibold text-emerald-700">
                    {initials}
                  </div>
                </a>

                <div className="min-w-0 pr-20 sm:pr-4 text-left flex-1">
                  <a href={`/user/provider/${providerId}`} className="group/title block">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 leading-tight mb-2 truncate group-hover/title:text-emerald-700 transition-colors">
                      {trekName}
                    </h2>
                  </a>

                  <div className="flex flex-col gap-2 items-start sm:items-start text-sm text-gray-600">
                    <div className="flex items-center font-medium">
                      <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                      {destination}
                    </div>

                    <a href={`/user/provider/${providerId}`} className="inline-flex items-center text-sm hover:text-emerald-700 transition-colors">
                      <span className="text-gray-500 mr-1.5">By</span>
                      <span className="font-medium text-gray-900 truncate">{companyName}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Trip Details & Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center sm:justify-end mt-4 sm:mt-0">
                <div className="flex gap-3 justify-center w-full sm:w-auto">
                  <div className="bg-gray-50 px-4 py-3 rounded-lg text-center border border-gray-200 min-w-[80px]">
                    <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">Difficulty</p>
                    <p className="font-semibold text-gray-900 text-sm capitalize">{difficulty}</p>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-lg text-center border border-gray-200 min-w-[80px]">
                    <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">Duration</p>
                    <p className="font-semibold text-gray-900 text-sm">{duration} Days</p>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-lg text-center border border-gray-200 min-w-[80px]">
                    <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-1">Trekkers</p>
                    <p className="font-semibold text-gray-900 text-sm">{peopleCount} Slot</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        if (navigator.share) {
                          await navigator.share({
                            title: trekName,
                            text: `Check out this amazing trek on bagspackgo!`,
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
      </div>{/* Close the constrained max-w-7xl wrapper */}

      {/* ── Full Width Detail Panes ── */}
      <div className="w-full bg-slate-50 py-8 pb-12 overflow-hidden shadow-inner">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">

          {/* ── Left: Tabs ── */}
          <div className="w-full lg:w-8/12" ref={tabsRef}>
            {/* Tab bar */}
            <div className="flex bg-white rounded-t-xl shadow-sm overflow-hidden border border-gray-200 mb-1.5">
              {[
                { key: 'itinerary', label: 'Itinerary' },
                { key: 'pickupDropoff', label: 'Pickup / Drop-off' },
                { key: 'personalDetails', label: 'Personal Details' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => !isTabDisabled(tab.key) && setActiveTab(tab.key)}
                  className={`flex-1 text-center text-xs sm:text-sm font-medium py-3 transition-all border-b-2 ${activeTab === tab.key
                    ? 'text-emerald-700 border-emerald-600 bg-white'
                    : isTabDisabled(tab.key)
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed border-transparent'
                      : 'text-gray-500 hover:text-gray-700 bg-gray-50 border-transparent'
                    }`}
                  disabled={isTabDisabled(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-b-xl shadow-sm px-4 sm:px-6 py-4 sm:py-5">

              {/* ── ITINERARY ── */}
              {activeTab === 'itinerary' && (
                <>
                  <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gray-100 rounded-xl">
                        <Compass className="h-5 w-5 text-gray-700" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800">Trek Itinerary</h3>
                    </div>
                    <DiffBadge level={difficulty} />
                  </div>

                  {/* Trek highlight chips */}
                  {trekPackage?.altitude && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-700 text-xs font-bold rounded-full">
                        <Mountain className="w-3.5 h-3.5" /> Max Altitude: {trekPackage.altitude}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-700 text-xs font-bold rounded-full">
                        <Calendar className="w-3.5 h-3.5" /> {duration} Days
                      </span>
                      {peopleCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-700 text-xs font-bold rounded-full">
                          <Users className="w-3.5 h-3.5" /> {peopleCount} Trekkers
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Photos Gallery */}
                    {Array.isArray(trekPackage?.photos) && trekPackage.photos.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Camera className="w-4 h-4" /> Trek Gallery
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {trekPackage.photos.map((photo, i) => (
                            <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-emerald-100">
                              <img src={photo.url || photo} alt={`Trek view ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All days stacked beautifully */}
                    <div className="space-y-6">
                      {itenaries.map(day => (
                        <TrekItenary key={day.dayNumber} day={day} difficulty={difficulty} maxAltitude={trekPackage?.altitude} />
                      ))}
                    </div>

                    {/* Mobile-only: Show package details inline before Next button */}
                    <div className="lg:hidden mt-6 space-y-6">
                      {/* What's Included */}
                      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                          <h2 className="text-gray-900 font-bold text-base flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-gray-500" /> What's Included
                          </h2>
                        </div>
                        <div className="p-4">
                          <div className="space-y-4">
                            {packageInclusions.map((item, i) => (
                              <div key={i} className="flex items-start">
                                <div className="flex-shrink-0 p-2 rounded-lg mr-4 bg-gray-50 border border-gray-100">{item.icon}</div>
                                <div className="min-w-0">
                                  <h4 className="font-medium text-gray-800 text-sm">{item.title}</h4>
                                  {item.items?.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                      {item.items.map((d, j) => (
                                        <li key={j} className="flex items-start text-xs text-gray-500">
                                          <svg className="h-3 w-3 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                          {d}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {trekPackage?.exclusivesList && trekPackage.exclusivesList.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="font-medium text-gray-800 mb-3 text-sm">What's NOT Included</h4>
                              <ul className="space-y-2">
                                {trekPackage.exclusivesList.map((item, index) => (
                                  <li key={item.id || index} className="flex items-start text-xs text-gray-600">
                                    <Minus className="h-3 w-3 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{item.text || item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {trekPackage?.additionalPoints && trekPackage.additionalPoints.length > 0 && trekPackage.additionalPoints.some(p => p.text?.trim()) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="font-medium text-gray-800 mb-3 text-sm">Important Notes</h4>
                              <ul className="space-y-2.5">
                                {trekPackage.additionalPoints.filter(item => item.text?.trim()).map((item, index) => (
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
                      {trekPackage?.pickupDropCities?.length > 0 && (
                        <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                          <div className="px-4 py-3 bg-emerald-600">
                            <h2 className="text-white font-semibold text-base flex items-center gap-2">
                              <MapPin className="w-4 h-4" /> Available Pickups
                            </h2>
                          </div>
                          <div className="p-4">
                            <div className="space-y-6">
                              {trekPackage.pickupDropCities.map((city, idx) => (
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

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={handleNextTab}
                        className="px-6 py-2.5 text-white rounded-lg flex items-center text-sm font-semibold shadow-sm transition-all bg-emerald-600 hover:bg-emerald-700 active:scale-95"
                      >
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── PICKUP / DROPOFF ── */}
              {activeTab === 'pickupDropoff' && (
                <PickupDropoff
                  defaultLocation={destination}
                  pickupDropCities={trekPackage?.pickupDropCities || []}
                  onNext={handlePickupDropoffSubmit}
                  onBack={handleBack}
                  startDate={selectedStartDate}
                  duration={duration}
                  packageId={trekPackage?._id}
                />
              )}

              {/* ── PERSONAL DETAILS ── */}
              {activeTab === 'personalDetails' && (
                <PersonalDetails
                  minPeople={pkgMinPeople}
                  maxPeople={pkgMaxPeople}
                  onSave={handleSavePersonalDetails}
                  onNext={handleNextTab}
                  onBack={handleBack}
                  isTrek={true}
                  packageId={trekPackage?._id}
                />
              )}
            </div>
          </div>

          {/* ── Right: Sidebar (desktop only) ── */}
          <div className="w-full lg:w-4/12 space-y-4 hidden lg:block">


            {/* Inclusions */}
            <div className="rounded-xl shadow-sm overflow-hidden border mb-6 border-gray-200 bg-white">
              <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                <h2 className="text-gray-900 font-bold text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-gray-500" /> What's Included
                </h2>
              </div>
              <div className="p-4 sm:p-5">
                <div className="space-y-4 sm:space-y-5">
                  {packageInclusions.map((item, i) => (
                    <div key={i} className="flex items-start">
                      <div className="flex-shrink-0 p-2 rounded-lg mr-4 bg-gray-50 border border-gray-100">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm sm:text-base">{item.title}</h4>
                        {item.items?.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {item.items.map((d, j) => (
                              <li key={j} className="flex items-start text-xs text-gray-500">
                                <svg className="h-3 w-3 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {d}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {trekPackage?.exclusivesList && trekPackage.exclusivesList.length > 0 && (
                  <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">
                      What's NOT Included
                    </h4>
                    <ul className="space-y-2">
                      {trekPackage.exclusivesList.map((item, index) => (
                        <li key={item.id || index} className="flex items-start text-xs text-gray-600">
                          <Minus className="h-3 w-3 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item.text || item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {trekPackage?.additionalPoints && trekPackage.additionalPoints.length > 0 && trekPackage.additionalPoints.some(p => p.text?.trim()) && (
                  <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">
                      Important Notes
                    </h4>
                    <ul className="space-y-2.5">
                      {trekPackage.additionalPoints.filter(item => item.text?.trim()).map((item, index) => (
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

            {/* Quick stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Trek Stats</h4>
              <div className="space-y-3">
                {[
                  { icon: Clock, label: 'Duration', value: `${duration} Days` },
                  { icon: Mountain, label: 'Difficulty', value: difficulty },
                  { icon: Users, label: 'Group Size', value: `${peopleCount} people` },
                  ...(trekPackage?.altitude ? [{ icon: Flag, label: 'Max Altitude', value: trekPackage.altitude }] : []),
                ].map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500">{label}</span>
                    </div>
                    <span className="text-xs font-black text-gray-800 capitalize">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pickup and Dropoff Section */}
            {trekPackage?.pickupDropCities?.length > 0 && (
              <div className="rounded-xl shadow-md overflow-hidden border mb-6 sm:mb-8 border-gray-100 bg-white">
                <div className="px-4 sm:px-5 py-3 bg-emerald-600">
                  <h2 className="text-white font-semibold text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 ml-0" /> Available Pickups
                  </h2>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="space-y-6">
                    {trekPackage.pickupDropCities.map((city, idx) => (
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

export default TrekGuideDetails;
