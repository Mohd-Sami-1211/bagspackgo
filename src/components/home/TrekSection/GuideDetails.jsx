'use client';
import {
  Star, MapPin, Users, Clock, Calendar, Share2, ArrowRight, ArrowLeft,
  Mountain, Compass, Flag, Backpack, Tent, Sun, ShieldCheck, Bookmark,
  CheckCircle2, AlertCircle, Navigation,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import PickupDropoff from 'src/components/home/TrekSection/Pick-Drop';
import PersonalDetails from 'src/components/home/TrekSection/PersonalDetails';
import { useAuth } from '@/context/AuthContext';

/* ── helpers ───────────────────────────────────────── */
const DIFF_CFG = {
  easy:     { cls: 'bg-green-100 text-green-700',  label: 'Easy'     },
  moderate: { cls: 'bg-amber-100 text-amber-700',  label: 'Moderate' },
  hard:     { cls: 'bg-orange-100 text-orange-700',label: 'Hard'     },
  extreme:  { cls: 'bg-red-100 text-red-700',      label: 'Extreme'  },
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
  const peopleRangeParam = searchParams.get('peopleRange') || '';
  const dateParam        = searchParams.get('date');

  let minPeople = 1, maxPeople = 1;
  if (peopleRangeParam) {
    if (peopleRangeParam.includes('+')) {
      minPeople = maxPeople = parseInt(peopleRangeParam);
    } else {
      const [a, b] = peopleRangeParam.split('-').map(Number);
      if (!isNaN(a) && !isNaN(b)) { minPeople = a; maxPeople = b; }
    }
  }

  const initialDate = dateParam && !isNaN(new Date(dateParam).getTime())
    ? new Date(dateParam) : new Date();

  /* state */
  const [activeTab,              setActiveTab]              = useState('itinerary');
  const [pickupDropoffCompleted, setPickupDropoffCompleted] = useState(false);
  const [selectedStartDate,      setSelectedStartDate]      = useState(initialDate);
  const [isSaved,                setIsSaved]                = useState(false);
  const [showSaveToast,          setShowSaveToast]          = useState(false);
  const [pickupDropoffData,      setPickupDropoffData]      = useState({
    pickup:  { location: '', address: '', city: '', date: '', time: '' },
    dropoff: { location: '', address: '', city: '', date: '', time: '' },
  });

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
        const res  = await fetch('/api/user/saved');
        const data = await res.json();
        if (data.success && data.saved) {
          setIsSaved(data.saved.some(item => item.itemId === guide?._id));
        }
      } catch {}
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
          body: JSON.stringify({ itemId: guide._id, itemType: 'trek' }),
        });
        if (res.ok) { setIsSaved(true); setShowSaveToast(true); setTimeout(() => setShowSaveToast(false), 5000); }
      }
    } catch {}
  };

  /* Package data */
  const trekPackage = guide;
  const priceObj = trekPackage?.pricingTiers?.length > 0
    ? [...trekPackage.pricingTiers].sort((a, b) => a.minPeople - b.minPeople)[0]
    : { price: 0 };
  const pricePerPerson = priceObj.price ?? 0;
  const duration       = trekPackage?.days ?? 1;

  /* Itinerary points — flat bullet list from itinerary array */
  const rawItinerary = Array.isArray(trekPackage?.itinerary) ? trekPackage.itinerary : [];
  // Each item can be { agenda, description, highlights } OR just a string
  const itineraryPoints = rawItinerary.length > 0
    ? rawItinerary.flatMap(item => {
        if (typeof item === 'string') return [item];
        const points = [];
        if (item.agenda)      points.push(item.agenda);
        if (item.description) points.push(item.description);
        if (Array.isArray(item.highlights)) points.push(...item.highlights);
        return points.length > 0 ? points : [`Day activity`];
      })
    : ['Trek through scenic mountain trails', 'Reach base camp', 'Summit attempt', 'Descent and return'];

  /* Inclusions */
  const inclusiveIconMap = {
    food:         <Sun       className="h-5 w-5 text-emerald-600" />,
    transport:    <Navigation className="h-5 w-5 text-emerald-600" />,
    accommodation:<Tent      className="h-5 w-5 text-emerald-600" />,
    guidance:     <ShieldCheck className="h-5 w-5 text-emerald-600" />,
    equipment:    <Backpack  className="h-5 w-5 text-emerald-600" />,
    permits:      <Flag      className="h-5 w-5 text-emerald-600" />,
  };

  const packageInclusions =
    trekPackage?.inclusivesList?.length > 0
      ? trekPackage.inclusivesList.map(item => ({
          icon:  <ShieldCheck className="h-5 w-5 text-emerald-600" />,
          title: item.text || item,
          items: [],
        }))
      : trekPackage?.inclusives
        ? Object.entries(trekPackage.inclusives)
            .filter(([, v]) => v?.included)
            .map(([key, v]) => ({
              icon:  inclusiveIconMap[key] || <ShieldCheck className="h-5 w-5 text-emerald-600" />,
              title: v.title || key.charAt(0).toUpperCase() + key.slice(1),
              items: (v.details || []).filter(d => d?.trim()),
            }))
        : [
            { icon: <Backpack    className="h-5 w-5 text-emerald-600" />, title: 'Equipment',     items: ['Tents', 'Sleeping bags', 'Trekking poles'] },
            { icon: <Tent        className="h-5 w-5 text-emerald-600" />, title: 'Accommodation', items: ['Quality tents', 'Sleeping mats'] },
            { icon: <Sun         className="h-5 w-5 text-emerald-600" />, title: 'Meals',         items: ['3 meals/day', 'Energy snacks'] },
            { icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />, title: 'Guide',         items: ['Certified guides', 'First-aid trained'] },
            { icon: <Flag        className="h-5 w-5 text-emerald-600" />, title: 'Permits',        items: ['Forest permits', 'Entry fees'] },
          ];

  /* Tab helpers */
  const isTabDisabled = key => key === 'personalDetails' ? !pickupDropoffCompleted : false;

  const handleNextTab = () => {
    if (activeTab === 'itinerary') setActiveTab('pickupDropoff');
    else if (activeTab === 'pickupDropoff' && pickupDropoffCompleted) setActiveTab('personalDetails');
  };

  const handleBack = () => {
    if (activeTab === 'pickupDropoff')   setActiveTab('itinerary');
    if (activeTab === 'personalDetails') setActiveTab('pickupDropoff');
  };

  const handlePickupDropoffSubmit = data => {
    setSelectedStartDate(new Date(data.startDate));
    setPickupDropoffData(data);
    setPickupDropoffCompleted(true);
    setActiveTab('personalDetails');
  };

  const handleSavePersonalDetails = data => {
    const trekData = {
      itenaries:      itineraryPoints,
      pickupDropoff:  pickupDropoffData,
      personalDetails: {
        contactDetails:  data.contactDetails  || {},
        personalDetails: data.personalDetails || [],
        emergencyContacts: data.emergencyContacts || [],
      },
      guide,
      trekConfig: {
        trekId:           trekPackage._id,
        peopleRangeParam,
        date:             selectedStartDate.toISOString(),
        days:             duration,
      },
      trekDetails: {
        name:       trekPackage?.name       || 'Trek',
        difficulty: trekPackage?.trekLevel  || 'Moderate',
        altitude:   trekPackage?.altitude   || '',
        baseCamp:   trekPackage?.destination || '',
        itinerary:  itineraryPoints,
      },
    };
    localStorage.setItem('trekData', JSON.stringify(trekData));
    const actualCount = data.personalDetails?.length || minPeople;
    router.push(
      `/user/trek/guidelist/trekdetails/${guide.provider?._id || guide.provider}/reviewjourney` +
      `?trekId=${trekPackage._id}&peopleRange=${peopleRangeParam}&count=${actualCount}&date=${selectedStartDate.toISOString()}`
    );
  };

  const trekName    = trekPackage?.name        || 'Standard Trek';
  const destination = trekPackage?.destination || 'Base Camp';
  const difficulty  = trekPackage?.trekLevel   || 'moderate';
  const companyName = guide?.companyName || guide?.name || 'Provider';
  const providerId  = guide?.provider?._id || guide?.provider || guide?._id;
  const initials    = companyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 -mt-16 sm:-mt-10 md:-mt-12 lg:-mt-14 mb-10">

      {/* ── Toast ── */}
      {showSaveToast && (
        <div className="fixed bottom-10 inset-x-0 flex justify-center z-[100] px-4">
          <div className="bg-gray-950 border border-white/20 text-white px-6 py-4 rounded-3xl flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-300 ring-1 ring-white/10">
            <div className="bg-emerald-500 p-1.5 rounded-full mr-3 shadow-lg shadow-emerald-500/20">
              <Bookmark className="h-4 w-4 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight uppercase">Trek Saved!</span>
              <p className="text-[10px] text-gray-400 font-bold tracking-wide">Added to your favorites</p>
            </div>
            <a href="/user/saved" className="ml-6 text-xs font-black text-emerald-400 hover:text-emerald-300 transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl whitespace-nowrap border border-white/5 uppercase tracking-widest">Explore</a>
          </div>
        </div>
      )}

      {/* ── Hero Card ── */}
      <div className="w-full bg-white pb-6 sm:pb-8 md:pb-10">
        <div className="max-w-7xl mx-auto relative flex flex-col items-center">
          <div className="relative shadow-2xl rounded-2xl sm:rounded-3xl lg:rounded-full px-4 sm:px-8 pt-10 pb-4 sm:pt-6 sm:pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full max-w-5xl mx-auto gap-3 sm:gap-8 lg:gap-2 transition-all hover:shadow-emerald-500/10 bg-gradient-to-r from-emerald-500 to-teal-400">

            {/* Mobile back */}
            <button onClick={() => router.back()} className="absolute top-4 left-4 flex sm:hidden items-center justify-center p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all text-white backdrop-blur-md border border-white/20">
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Desktop back */}
            <button onClick={() => router.back()} className="hidden md:flex absolute md:top-1/2 md:-left-28 lg:-left-36 md:-translate-y-1/2 group items-center justify-center gap-2 transition-all w-fit bg-white/90 hover:bg-white text-gray-700 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-100 shadow-md hover:shadow-lg hover:text-emerald-700 hover:border-emerald-200 z-[30] active:scale-95 backdrop-blur-sm">
              <div className="bg-gray-50 group-hover:bg-emerald-100 text-gray-600 group-hover:text-emerald-700 p-1 rounded-full transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <span className="text-sm sm:text-base pr-1">Back</span>
            </button>

            {/* Rating */}
            <div className="absolute top-2 right-2 sm:top-2 sm:right-6 lg:right-10 flex items-center bg-white/95 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-black text-gray-950 shadow-xl ring-1 ring-gray-200">
              <Star className={`w-4 h-4 mr-2 ${trekPackage?.rating > 0 ? 'text-amber-500 fill-amber-500' : 'text-gray-300 fill-gray-300'}`} />
              {trekPackage?.rating > 0 ? (
                <>{trekPackage.rating}<span className="ml-1.5 text-gray-400 text-[10px] font-bold">({trekPackage.reviews || 0})</span></>
              ) : (
                <span className="text-gray-500 text-[10px] uppercase tracking-wider">No ratings yet</span>
              )}
            </div>

            {/* Main info */}
            <div className="flex items-center w-full sm:w-auto mt-1 sm:mt-0 justify-start gap-3 sm:gap-6">
              <a href={`/user/provider/${providerId}`}
                className="w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center shadow-2xl border-4 flex-shrink-0 relative overflow-hidden group/avatar cursor-pointer hover:scale-105 transition-all duration-300 bg-white border-emerald-100 hover:border-emerald-300">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black italic tracking-tighter transition-transform group-hover/avatar:scale-110 text-emerald-600">
                  {initials}
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20 pointer-events-none" />
              </a>

              <div className="min-w-0 pr-2 sm:pr-4 drop-shadow-md text-left flex-1">
                <a href={`/user/provider/${providerId}`} className="group/title block">
                  <h2 className="text-base sm:text-xl lg:text-2xl font-black text-white leading-tight mb-1 sm:mb-2 tracking-tight uppercase group-hover/title:text-emerald-50 transition-colors">
                    {trekName}
                  </h2>
                </a>
                <div className="flex flex-col gap-1.5 sm:gap-2.5 items-start">
                  <div className="flex items-center text-[10px] sm:text-[11px] text-white/90 font-black tracking-widest uppercase">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-white/80" />
                    {destination}
                  </div>
                  <a href={`/user/provider/${providerId}`} className="group/provider inline-flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-white/10 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all border border-white/10 shadow-sm w-fit">
                    <span className="text-[9px] sm:text-[11px] text-white/70 uppercase tracking-widest font-extrabold ml-1">By</span>
                    <span className="text-xs sm:text-base font-black text-white ml-0.5 mr-1 sm:mr-2 truncate max-w-[120px] sm:max-w-none">{companyName}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Stats + Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center sm:justify-end mt-4 sm:mt-0">
              <div className="flex gap-2.5 justify-center w-full sm:w-auto">
                <div className="bg-white/10 backdrop-blur-3xl px-4 sm:px-6 py-2.5 rounded-[22px] text-center shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] border border-white/20 min-w-[75px] sm:min-w-[100px] hover:bg-white/20 transition-all group/badge">
                  <p className="text-white/70 text-[8px] font-black uppercase tracking-[0.1em] mb-0.5">Difficulty</p>
                  <p className="font-black capitalize text-white text-xs sm:text-base leading-none tracking-tight">{difficulty}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-3xl px-4 sm:px-6 py-2.5 rounded-[22px] text-center shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] border border-white/20 min-w-[75px] sm:min-w-[100px] hover:bg-white/20 transition-all group/badge">
                  <p className="text-white/70 text-[8px] font-black uppercase tracking-[0.1em] mb-0.5">Duration</p>
                  <p className="font-black text-white text-xs sm:text-base leading-none tracking-tight">{duration} Days</p>
                </div>
                <div className="bg-white/10 backdrop-blur-3xl px-4 sm:px-6 py-2.5 rounded-[22px] text-center shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)] border border-white/20 min-w-[75px] sm:min-w-[100px] hover:bg-white/20 transition-all group/badge">
                  <p className="text-white/70 text-[8px] font-black uppercase tracking-[0.1em] mb-0.5">Trekkers</p>
                  <p className="font-black text-white text-xs sm:text-base leading-none tracking-tight">{peopleRangeParam || minPeople}</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={async () => {
                    try {
                      if (navigator.share) { await navigator.share({ title: trekName, url: window.location.href }); }
                      else { await navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }
                    } catch {}
                  }}
                  className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors backdrop-blur-sm flex-shrink-0"
                >
                  <Share2 className="h-4 w-4 text-gray-600" />
                </button>
                <button onClick={handleSavePackage} className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors backdrop-blur-sm flex-shrink-0">
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'text-emerald-500 fill-emerald-500' : 'text-gray-600'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 pt-4 sm:pt-6 pb-8 sm:pb-10 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 sm:p-6">

        {/* ── Left: Tabs ── */}
        <div className="w-full lg:w-8/12">
          {/* Tab bar */}
          <div className="flex bg-white rounded-t-xl shadow-sm overflow-hidden border border-gray-200 mb-1.5">
            {[
              { key: 'itinerary',      label: 'Itinerary' },
              { key: 'pickupDropoff',  label: 'Pickup / Drop-off' },
              { key: 'personalDetails',label: 'Personal Details' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => !isTabDisabled(tab.key) && setActiveTab(tab.key)}
                className={`flex-1 text-center text-xs sm:text-sm font-medium py-3 transition-all ${
                  activeTab === tab.key
                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
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

          {/* Tab content */}
          <div className="bg-white rounded-b-xl shadow-sm px-4 sm:px-6 py-4 sm:py-5">

            {/* ── ITINERARY ── */}
            {activeTab === 'itinerary' && (
              <>
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 rounded-xl">
                      <Compass className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">Trek Itinerary</h3>
                  </div>
                  <DiffBadge level={difficulty} />
                </div>

                {/* Trek highlight chips */}
                {trekPackage?.altitude && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                      <Mountain className="w-3.5 h-3.5" /> Max Altitude: {trekPackage.altitude}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold rounded-full">
                      <Calendar className="w-3.5 h-3.5" /> {duration} Days
                    </span>
                    {peopleRangeParam && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold rounded-full">
                        <Users className="w-3.5 h-3.5" /> {peopleRangeParam} Trekkers
                      </span>
                    )}
                  </div>
                )}

                {/* Bullet-point itinerary */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-5 sm:p-6">
                  <h4 className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Flag className="w-4 h-4" /> What You'll Do
                  </h4>
                  <ul className="space-y-3">
                    {itineraryPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 group">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center mt-0.5 shadow-sm group-hover:scale-110 transition-transform">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Package highlights if available */}
                {Array.isArray(trekPackage?.highlights) && trekPackage.highlights.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Trek Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {trekPackage.highlights.map((h, i) => (
                        <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* What to bring tips */}
                <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800 mb-1">Important Notes</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      Please carry valid ID proof, warm clothing, and personal medications. All participants should be physically fit. The provider will brief you on safety protocols before departure.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleNextTab}
                    className="px-5 py-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 flex items-center gap-2 text-sm font-bold shadow-sm transition-all shadow-emerald-400/30 hover:shadow-emerald-400/50 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1"
                  >
                    Next <ArrowRight className="h-4 w-4" />
                  </button>
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
              />
            )}

            {/* ── PERSONAL DETAILS ── */}
            {activeTab === 'personalDetails' && (
              <PersonalDetails
                minPeople={minPeople}
                maxPeople={maxPeople}
                onSave={handleSavePersonalDetails}
                onNext={handleNextTab}
                onBack={handleBack}
                isTrek={true}
              />
            )}
          </div>
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="w-full lg:w-4/12 space-y-4">

          {/* Price card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4">
              <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest">Starting From</p>
              <p className="text-3xl font-black text-white mt-1">
                ₹{pricePerPerson.toLocaleString('en-IN')}
                <span className="text-sm font-semibold text-emerald-100 ml-1">/ person</span>
              </p>
              {peopleRangeParam && (
                <p className="text-emerald-100 text-xs mt-1 font-medium">For {peopleRangeParam} trekkers</p>
              )}
            </div>
            <div className="px-5 py-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Per person</span>
                <span className="font-bold text-gray-800">₹{pricePerPerson.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">GST (5%)</span>
                <span className="font-bold text-gray-800">₹{Math.round(pricePerPerson * 0.05).toLocaleString('en-IN')}</span>
              </div>
              <div className="h-px bg-gray-100 my-2" />
              <div className="flex justify-between">
                <span className="font-black text-gray-800 text-sm">Total / person</span>
                <span className="font-black text-emerald-600">₹{Math.round(pricePerPerson * 1.05).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Inclusions */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-emerald-600 font-black text-sm uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> What's Included
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {packageInclusions.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                    {item.items?.length > 0 && (
                      <ul className="mt-1.5 space-y-1">
                        {item.items.map((d, j) => (
                          <li key={j} className="flex items-start gap-1.5 text-xs text-gray-500">
                            <svg className="h-3 w-3 text-emerald-500 mr-0.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Trek Stats</h4>
            <div className="space-y-3">
              {[
                { icon: Clock,    label: 'Duration',   value: `${duration} Days` },
                { icon: Mountain, label: 'Difficulty', value: difficulty },
                { icon: Users,    label: 'Group Size', value: peopleRangeParam ? `${peopleRangeParam} people` : 'Flexible' },
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
        </div>
      </div>
    </div>
  );
};

export default TrekGuideDetails;
