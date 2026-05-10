'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Star, MapPin, Award, CheckCircle, Navigation, ArrowLeft, Calendar, Users, Clock, ChevronRight, Ticket, Share2 } from 'lucide-react';

const ProviderProfileContent = ({ providerId }) => {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmit, setRatingSubmit] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  
  // Package configuration modal state
  const [activePackageId, setActivePackageId] = useState(null);
  const [pkgConfig, setPkgConfig] = useState({ category: 'individual', count: 1, daysRange: '', date: null });

  // View all toggles
  const [showAllTrips, setShowAllTrips] = useState(false);
  const [showAllTreks, setShowAllTreks] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data?.provider?.name || 'Provider'} on bagspackgo`,
          url: url
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Profile link copied to clipboard!");
    }
  };

  useEffect(() => {
    async function fetchProvider() {
      try {
        const res = await fetch(`/api/user/provider/${providerId}`);
        const json = await res.json();
        if (json.success) {
          setData(json);
          if (json.feedbacks && json.feedbacks.length > 0) {
             setFeedbacks(json.feedbacks);
          }
        }
      } catch (err) {
        console.error("Provider fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProvider();
  }, [providerId]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!ratingSubmit || !feedbackText.trim()) return;
    
    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/user/provider/${providerId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: ratingSubmit, comment: feedbackText })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks([data.review, ...feedbacks]);
        setRatingSubmit(0);
        setFeedbackText('');
        alert("Thank you for your feedback!");
      } else {
        alert(data.message || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
       <div className="flex flex-col justify-center items-center h-[70vh] gap-3">
         <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
         <p className="text-sm text-slate-400 font-medium">Loading profile…</p>
       </div>
    );
  }

  if (!data || !data.provider) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Provider not found</h2>
        <p className="text-slate-500 text-sm">The service provider you are looking for does not exist or has been removed.</p>
        <a href="/" className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-sm font-medium">Go back home</a>
      </div>
    );
  }

  const { provider, packages } = data;

  // Split packages into trips and treks
  const tripPackages = packages?.filter(p => p.category === 'trip') || [];
  const trekPackages = packages?.filter(p => p.category === 'trek') || [];

  const handleConfigurePkg = (pkgId) => {
      setPkgConfig({ category: 'individual', count: 1, daysRange: '', date: null });
      setActivePackageId(pkgId === activePackageId ? null : pkgId);
  };
  
  const handleProceedBooking = (pkg) => {
      const isTrek = pkg.category === 'trek';
      
      const params = new URLSearchParams();
      if (!isTrek) params.set('category', pkg.packageType || 'individual');
      if (pkgConfig.date) params.set('date', pkgConfig.date.toISOString());
      
      if (isTrek) {
         params.set('peopleCount', pkgConfig.count.toString());
         params.set('trekId', pkg._id);
         router.push(`/user/trek/guidelist/trekdetails/${providerId}?${params.toString()}`);
      } else {
         params.set('count', pkgConfig.count.toString());
         params.set('packageId', pkg._id);
         router.push(`/user/trip/guidelist/tripdetails/${providerId}?${params.toString()}`);
      }
  };

  const formatDate = (d) => {
    if (!d) return 'TBD';
    return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // ── Package Card ──
  const PackageCard = ({ pkg }) => {
    const isTrek = pkg.category === 'trek';
    const isPrm = pkg.packageCategory === 'premium' || pkg.type === 'premium';
    let lowestPrice = 0;
    let lowestOriginalPrice = 0;
    let hasDiscount = false;
    let minPeopleRequired = null;

    if (activePackageId === pkg._id) {
        // Dynamic pricing based on selected count
        if (pkg.pricingTiers && pkg.pricingTiers.length > 0) {
            let matchedTier = pkg.pricingTiers.find(t => pkgConfig.count >= t.minPeople && pkgConfig.count <= t.maxPeople);
            if (!matchedTier) {
                const sortedTiers = [...pkg.pricingTiers].sort((a, b) => a.maxPeople - b.maxPeople);
                matchedTier = pkgConfig.count > sortedTiers[sortedTiers.length - 1].maxPeople 
                  ? sortedTiers[sortedTiers.length - 1] 
                  : sortedTiers[0];
            }
            const disc = Number(matchedTier.discount || 0);
            lowestOriginalPrice = Number(matchedTier.price);
            lowestPrice = disc > 0 ? lowestOriginalPrice * (1 - disc / 100) : lowestOriginalPrice;
            hasDiscount = disc > 0;
        } else {
            lowestPrice = pkg.price?.individual || pkg.price?.starting || pkg.price || 0;
            lowestOriginalPrice = lowestPrice;
        }
    } else {
        // Static "Starting from" pricing for the card view
        if (pkg.pricingTiers && pkg.pricingTiers.length > 0) {
            const sortedTiers = [...pkg.pricingTiers].sort((a, b) => {
              const aDisc = Number(a.discount || 0);
              const bDisc = Number(b.discount || 0);
              const aEffective = aDisc > 0 ? a.price * (1 - aDisc / 100) : a.price;
              const bEffective = bDisc > 0 ? b.price * (1 - bDisc / 100) : b.price;
              return aEffective - bEffective;
            });
            const cheapestTier = sortedTiers[0];
            const disc = Number(cheapestTier.discount || 0);
            lowestOriginalPrice = Number(cheapestTier.price);
            lowestPrice = disc > 0 ? lowestOriginalPrice * (1 - disc / 100) : lowestOriginalPrice;
            hasDiscount = disc > 0;
            minPeopleRequired = cheapestTier.minPeople;
        } else {
            lowestPrice = pkg.price?.individual || pkg.price?.starting || pkg.price || 0;
            lowestOriginalPrice = lowestPrice;
        }
    }
    const numDays = pkg.days || 1;

    if (activePackageId === pkg._id) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible flex flex-col">
          <div className="p-5 flex flex-col min-h-[280px]">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <button onClick={() => setActivePackageId(null)} className="text-slate-500 hover:text-slate-900 transition flex items-center text-sm font-medium">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </button>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider max-w-[140px] truncate">
                {pkg.name}
              </span>
            </div>
            <div className="space-y-4 flex-grow">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  {pkg.packageType === 'couple' && !isTrek ? 'No. of Couples' : 'No. of People'}
                </label>
                <div className="flex items-center bg-white border border-slate-200 rounded-lg h-[40px] hover:border-slate-300 transition-colors">
                  <button
                    type="button"
                    onClick={() => setPkgConfig({...pkgConfig, count: Math.max(1, pkgConfig.count - 1)})}
                    disabled={pkgConfig.count <= 1}
                    className="flex items-center justify-center w-10 h-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-l-lg transition-colors disabled:opacity-30"
                  >
                    <span className="text-lg font-bold">−</span>
                  </button>
                  <div className="flex-1 text-center text-sm font-bold text-slate-800 select-none tabular-nums">
                    {pkgConfig.count}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPkgConfig({...pkgConfig, count: Math.min(50, pkgConfig.count + 1)})}
                    className="flex items-center justify-center w-10 h-full text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-r-lg transition-colors"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Per {pkg.packageType === 'couple' && !isTrek ? 'Couple' : 'Person'}</span>
                 {hasDiscount ? (
                   <div className="flex items-center gap-2">
                     <span className="text-xs text-slate-400 line-through">₹{Math.round(lowestOriginalPrice).toLocaleString('en-IN')}</span>
                     <span className="font-bold text-lg text-slate-900">₹{Math.round(lowestPrice).toLocaleString('en-IN')}</span>
                   </div>
                 ) : (
                   <span className="font-bold text-lg text-slate-900">₹{lowestPrice.toLocaleString('en-IN')}</span>
                 )}
              </div>
              
              <div className="relative" style={{zIndex: 100}}>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Expected Travel Date</label>
                <DatePicker
                  selected={pkgConfig.date}
                  onChange={(date) => setPkgConfig({...pkgConfig, date})}
                  placeholderText="DD/MM/YYYY"
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date()}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="scroll"
                  scrollableYearDropdown
                  yearDropdownItemNumber={5}
                  popperClassName="!z-[9999]"
                  popperPlacement="bottom-start"
                  portalId="datepicker-portal"
                  calendarClassName="border-slate-200 rounded-lg shadow-xl bg-white"
                  wrapperClassName="w-full"
                  className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 hover:border-slate-300 transition-colors"
                />
              </div>
            </div>
            <button 
              onClick={() => handleProceedBooking(pkg)}
              className="w-full mt-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              Proceed to Booking →
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col ${isPrm ? 'border-amber-200' : 'border-slate-200'}`}>
        {/* Category header bar */}
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center gap-2">
          {!isTrek && (
            isPrm ? (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase tracking-wide">
                Premium
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wide">
                Budget
              </span>
            )
          )}
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">
            {numDays} Day{numDays > 1 ? 's' : ''}
          </span>
          {!isTrek && pkg.packageType && (
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wide">
              {pkg.packageType}
            </span>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-3">
            <h3 className="font-bold text-slate-900 line-clamp-2 text-base mb-2">{pkg.name || pkg.label}</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {pkg.destination}
          </p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Starting From</p>
                {minPeopleRequired && (
                   <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium tracking-wide">
                     Min. {minPeopleRequired} {pkg.packageType === 'couple' && !isTrek ? 'couple' : 'pax'}
                   </span>
                )}
              </div>
              {hasDiscount ? (
                <div className="flex items-end gap-1.5">
                  <span className="font-bold text-lg text-slate-900 leading-none">₹{Math.round(lowestPrice).toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-400 line-through mb-[2px]">₹{Math.round(lowestOriginalPrice).toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-500 mb-[2px]">/ {pkg.packageType === 'couple' && !isTrek ? 'couple' : 'person'}</span>
                </div>
              ) : (
                <div className="flex items-end gap-1.5">
                  <span className="font-bold text-lg text-slate-900 leading-none">₹{lowestPrice.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-500 mb-[2px]">/ {pkg.packageType === 'couple' && !isTrek ? 'couple' : 'person'}</span>
                </div>
              )}
            </div>
            <button onClick={() => handleConfigurePkg(pkg._id)} className="text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors">
              Select
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Event Card (rich details) ──
  const EventCard = ({ event }) => {
    const slotsLeft = (event.totalSlots || 0) - (event.bookedSlots || 0);
    const eventDate = event.date ? new Date(event.date) : null;
    const isPast = eventDate && eventDate < new Date();

    return (
      <div 
        onClick={() => router.push(`/user/events/eventdetails/${event._id}`)} 
        className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col h-full"
      >
        {/* Image */}
        <div className="h-44 w-full relative">
          <img 
            src={event.poster || event.photographs?.[0] || 'https://via.placeholder.com/400x300?text=Event'} 
            className="w-full h-full object-cover" 
            alt={event.title} 
          />
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wide">
            {event.eventType}
          </span>
          {isPast && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wide">
              Past
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-slate-900 line-clamp-1 text-base mb-1">{event.title}</h3>
          
          <div className="space-y-1.5 mb-3">
            <p className="text-xs text-slate-500 flex items-center">
              <MapPin className="w-3 h-3 mr-1.5 text-slate-400 flex-shrink-0" /> {event.location}
            </p>
            {eventDate && (
              <p className="text-xs text-slate-500 flex items-center">
                <Calendar className="w-3 h-3 mr-1.5 text-slate-400 flex-shrink-0" /> {formatDate(event.date)}
              </p>
            )}
            {event.duration && (
              <p className="text-xs text-slate-500 flex items-center">
                <Clock className="w-3 h-3 mr-1.5 text-slate-400 flex-shrink-0" /> {event.duration} day{event.duration > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Slots info */}
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, ((event.bookedSlots || 0) / (event.totalSlots || 1)) * 100)}%` }}
                />
              </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-500">{slotsLeft > 0 ? `${slotsLeft} left` : 'Full'}</span>
          </div>

          {/* Price + CTA */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Per Person</p>
              <span className="font-bold text-lg text-slate-900">₹{(event.pricePerSlot || 0).toLocaleString('en-IN')}</span>
            </div>
            <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Ticket className="w-3 h-3" /> Book Now
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ── Package Section (Trip or Trek) ──
  const PackageSection = ({ title, icon, packages: pkgs, showAll, setShowAll }) => {
    if (!pkgs || pkgs.length === 0) return null;
    const displayPkgs = showAll ? pkgs : pkgs.slice(0, 3);

    return (
      <div className="mt-10">
        <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
          {icon}
          {title}
          <span className="text-sm font-normal text-slate-400 ml-1">({pkgs.length})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayPkgs.map((pkg, idx) => (
            <PackageCard key={pkg._id || idx} pkg={pkg} />
          ))}
        </div>
        {pkgs.length > 3 && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="mt-4 w-full py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
          >
            {showAll ? 'Show less' : `View all ${pkgs.length} packages`}
            <ChevronRight className={`w-4 h-4 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 relative">
      <button 
         onClick={() => router.back()}
         className="absolute top-4 left-2 sm:top-6 sm:left-6 z-50 bg-white border border-slate-200 p-1.5 sm:p-2 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700 transition"
      >
         <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5" />
      </button>
      
      {/* Cover Banner */}
      <div className="w-full h-48 md:h-64 relative flex items-center justify-center overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600">
         {/* Pattern overlay */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat mix-blend-overlay"></div>
         {/* Background Typography */}
         <h1 className="text-white text-5xl md:text-8xl font-black opacity-20 select-none tracking-tighter lowercase italic z-0 transform -skew-x-12 absolute -mt-24">
            bagspackgo
         </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
         {/* Profile Card */}
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
            
            {/* Logo/Avatar */}
            <div className="flex-shrink-0 w-28 h-28 md:w-32 md:h-32 bg-white rounded-full p-1.5 shadow-sm -mt-16 md:mt-0 border border-slate-200 flex items-center justify-center overflow-hidden">
               {provider.logo ? (
                  <img src={provider.logo} alt={provider.name} className="w-full h-full object-cover rounded-full" />
               ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center text-3xl font-bold bg-slate-100 text-slate-600">
                     {provider.name?.charAt(0) || 'P'}
                  </div>
               )}
            </div>

            {/* Provider Info */}
            <div className="flex-grow text-center md:text-left pt-2 md:pt-0">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                 <div className="flex flex-col md:flex-row md:items-center gap-2">
                   <h1 className="text-2xl font-bold text-slate-900">{provider.name}</h1>
                   {provider.isVerified && (
                     <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-0.5 rounded w-fit mx-auto md:mx-0">
                        <CheckCircle className="w-3 h-3 mr-1" /> Verified
                     </span>
                   )}
                   {provider.speciality && (
                     <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded w-fit mx-auto md:mx-0">
                        {provider.speciality}
                     </span>
                   )}
                 </div>
                 
                 <button 
                   onClick={handleShare}
                   className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm mx-auto md:mx-0"
                 >
                   <Share2 className="w-4 h-4" />
                   Share Profile
                 </button>
               </div>
               
               <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-1.5 mb-3 text-sm">
                 <MapPin className="w-3.5 h-3.5 text-slate-400" /> {provider.location || 'India'}
               </p>
               
               <p className="text-slate-500 text-sm max-w-2xl leading-relaxed mb-5">
                 {provider.bio || `Welcome to ${provider.name}! We're dedicated to bringing you the best and most unforgettable travel packages.`}
               </p>

               {/* Stats */}
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 border-t border-slate-100 pt-5">
                  <div className="text-center md:text-left">
                     <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Rating</p>
                     <p className="text-lg font-bold text-slate-900 flex items-center justify-center md:justify-start">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400 mr-1" /> 
                        {provider.rating ? provider.rating.toFixed(1) : 'New'}
                     </p>
                  </div>
                  <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                  <div className="text-center md:text-left">
                     <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Reviews</p>
                     <p className="text-lg font-bold text-slate-900">{feedbacks.length}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                  <div className="text-center md:text-left">
                     <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Trip Packages</p>
                     <p className="text-lg font-bold text-slate-900">{tripPackages.length}</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                  <div className="text-center md:text-left">
                     <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Trek Packages</p>
                     <p className="text-lg font-bold text-slate-900">{trekPackages.length}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* ── Trip Packages ── */}
         <PackageSection 
           title="Trip Packages" 
           icon={<Navigation className="w-4 h-4 text-green-600" />}
           packages={tripPackages}
           showAll={showAllTrips}
           setShowAll={setShowAllTrips}
         />

         {/* ── Trek Packages ── */}
         <PackageSection 
           title="Trek Packages" 
           icon={<Navigation className="w-4 h-4 text-blue-600" />}
           packages={trekPackages}
           showAll={showAllTreks}
           setShowAll={setShowAllTreks}
         />

         {/* ── No packages fallback ── */}
         {tripPackages.length === 0 && trekPackages.length === 0 && (
           <div className="mt-10 bg-white rounded-xl p-10 text-center border border-slate-200">
              <p className="text-slate-500 text-sm">This provider hasn't published any packages yet.</p>
           </div>
         )}

         {/* ── Events Section ── */}
         {data.events && data.events.length > 0 && (
           <div className="mt-12">
             <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
               <Ticket className="w-4 h-4 text-indigo-600" />
               Hosted Events
               <span className="text-sm font-normal text-slate-400 ml-1">({data.events.length})</span>
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {(showAllEvents ? data.events : data.events.slice(0, 3)).map((event, idx) => (
                   <EventCard key={event._id || idx} event={event} />
               ))}
             </div>
             {data.events.length > 3 && (
               <button 
                 onClick={() => setShowAllEvents(!showAllEvents)}
                 className="mt-4 w-full py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors flex items-center justify-center gap-1"
               >
                 {showAllEvents ? 'Show less' : `View all ${data.events.length} events`}
                 <ChevronRight className={`w-4 h-4 transition-transform ${showAllEvents ? 'rotate-90' : ''}`} />
               </button>
             )}
           </div>
         )}

         {/* ── Reviews & Feedback Section ── */}
         <div className="mt-12 bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Ratings & Reviews
              <span className="text-sm font-normal text-slate-400 ml-1">({feedbacks.length})</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
               
               {/* Left: Feedback List */}
               <div className="lg:col-span-3 order-2 lg:order-1 space-y-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">What travelers are saying</p>
                  {feedbacks.length > 0 ? (
                    feedbacks.map((fb) => (
                      <div key={fb.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                         <div className="flex items-center justify-between mb-1.5">
                            <h4 className="font-semibold text-slate-800 text-sm">{fb.user}</h4>
                            <span className="text-[11px] text-slate-400 font-medium">{fb.date}</span>
                         </div>
                         <div className="flex items-center mb-2">
                            {[1,2,3,4,5].map(s => (
                               <Star key={s} className={`w-3 h-3 ${s <= fb.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                            ))}
                         </div>
                         <p className="text-sm text-slate-600 leading-relaxed">"{fb.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No reviews yet. Be the first to share your experience!</p>
                  )}
               </div>

               {/* Right: Leave a rating */}
               <div className="lg:col-span-2 order-1 lg:order-2">
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                     <h4 className="font-semibold text-slate-900 mb-1 text-sm">Rate {provider.name}</h4>
                     <p className="text-xs text-slate-500 mb-4">Your feedback helps others make better choices.</p>
                     
                     <form onSubmit={handleSubmitFeedback}>
                        <div className="flex items-center gap-1.5 mb-4">
                          {[1,2,3,4,5].map(star => (
                             <button
                               type="button"
                               key={star}
                               className="focus:outline-none transition-transform hover:scale-110"
                               onMouseEnter={() => setRatingHover(star)}
                               onMouseLeave={() => setRatingHover(0)}
                               onClick={() => setRatingSubmit(star)}
                             >
                                <Star className={`w-6 h-6 ${star <= (ratingHover || ratingSubmit) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                             </button>
                          ))}
                        </div>
                        
                        <div className="mb-3">
                           <textarea 
                             className="w-full text-sm placeholder-slate-400 rounded-lg border border-slate-200 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 p-3 min-h-[90px] resize-none transition-colors"
                             placeholder="Tell others about your experience..."
                             value={feedbackText}
                             onChange={(e) => setFeedbackText(e.target.value)}
                           ></textarea>
                        </div>
                        
                        <button 
                           type="submit" 
                           disabled={!ratingSubmit || !feedbackText.trim() || submittingFeedback}
                           className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center"
                        >
                           {submittingFeedback ? (
                               <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                           ) : (
                               "Submit Review"
                           )}
                        </button>
                     </form>
                  </div>
               </div>
            </div>
         </div>
         
      </div>
    </div>
  );
};

export default ProviderProfileContent;
