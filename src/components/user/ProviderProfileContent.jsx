'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Star, MapPin, Award, Users, CheckCircle, Navigation, ArrowLeft, Calendar, User, Search } from 'lucide-react';

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

  const [showAllEvents, setShowAllEvents] = useState(false);

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
       <div className="flex justify-center items-center h-[70vh]">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
       </div>
    );
  }

  if (!data || !data.provider) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Provider not found</h2>
        <p className="text-gray-500 text-sm">The service provider you are looking for does not exist or has been removed.</p>
        <a href="/" className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">Go back home</a>
      </div>
    );
  }

  const { provider, packages } = data;
  const isPremiumProvider = packages?.some(pkg => pkg.type === 'premium');

  const handleConfigurePkg = (pkgId) => {
      setPkgConfig({ category: 'individual', count: 1, daysRange: '', date: null });
      setActivePackageId(pkgId === activePackageId ? null : pkgId);
  };
  
  const handleProceedBooking = (pkg) => {
      const isTrek = pkg.category === 'trek';
      
      const params = new URLSearchParams();
      if (!isTrek) params.set('category', pkgConfig.category);
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

  return (
    <div className="bg-gray-50 min-h-screen pb-20 relative">
      <button 
         onClick={() => router.back()}
         className="absolute top-4 left-2 sm:top-6 sm:left-6 z-50 bg-white/80 backdrop-blur-md p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-emerald-50 text-emerald-700 transition"
      >
         <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      
      {/* Cover Banner */}
      <div className={`w-full h-48 md:h-64 relative flex items-center justify-center overflow-hidden ${isPremiumProvider ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}>
         {/* Pattern overlay */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat mix-blend-overlay"></div>
         {/* Background Typography */}
         <h1 className="text-white text-5xl md:text-8xl font-black opacity-20 select-none tracking-tighter lowercase italic z-0 transform -skew-x-12 absolute -mt-24">
            bagspackgo
         </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
         {/* Profile Card */}
         <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 relative">
            
            {/* Logo/Avatar */}
            <div className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-2 shadow-lg -mt-16 md:mt-0 border border-gray-100 flex items-center justify-center overflow-hidden">
               {provider.logo ? (
                  <img src={provider.logo} alt={provider.name} className="w-full h-full object-cover rounded-full" />
               ) : (
                  <div className={`w-full h-full rounded-full flex items-center justify-center text-4xl font-bold ${isPremiumProvider ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                     {provider.name?.charAt(0) || 'P'}
                  </div>
               )}
            </div>

            {/* Provider Info */}
            <div className="flex-grow text-center md:text-left pt-2 md:pt-0">
               <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                 <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{provider.name}</h1>
                 {provider.isVerified && (
                   <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded w-fit mx-auto md:mx-0">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified Agency
                   </span>
                 )}
                 {isPremiumProvider && (
                   <span className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded w-fit mx-auto md:mx-0 shadow-sm">
                      <Award className="w-3 h-3 mr-1" /> Premium Provider
                   </span>
                 )}
                  {provider.speciality && (
                    <span className="inline-flex items-center justify-center bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded w-fit mx-auto md:mx-0 shadow-sm mt-1">
                       Speciality: {provider.speciality}
                    </span>
                  )}
               </div>
               
               <p className="text-gray-600 font-medium flex items-center justify-center md:justify-start gap-1.5 mb-4 text-sm sm:text-base">
                 <MapPin className="w-4 h-4 text-emerald-500" /> {provider.location || provider.address?.city || 'India'}
               </p>
               
               <p className="text-gray-500 text-sm max-w-2xl leading-relaxed mb-6">
                 {provider.bio || `Welcome to ${provider.name}! We're dedicated to bringing you the best and most unforgettable travel packages. Scroll down to see our curated collection of adventures.`}
               </p>

               {/* Stats */}
               <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-8 border-t border-gray-100 pt-5">
                  <div className="text-center md:text-left">
                     <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Rating</p>
                     <p className="text-xl font-bold text-gray-900 flex items-center justify-center md:justify-start">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1.5" /> 
                        {provider.rating ? provider.rating.toFixed(1) : 'New'}
                     </p>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                  <div className="text-center md:text-left">
                     <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Reviews</p>
                     <p className="text-xl font-bold text-gray-900 flex items-center justify-center md:justify-start">
                        {provider.reviews || 0}
                     </p>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                  <div className="text-center md:text-left">
                     <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Trips</p>
                     <p className="text-xl font-bold text-gray-900 flex items-center justify-center md:justify-start">
                        {provider.totalTrips || 0}
                     </p>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                  <div className="text-center md:text-left">
                     <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Treks</p>
                     <p className="text-xl font-bold text-gray-900 flex items-center justify-center md:justify-start">
                        {provider.totalTreks || 0}
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Packages Section */}
         <div className="mt-12 sm:mt-16">
           <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
             <Navigation className="w-5 h-5 mr-2 text-emerald-500" /> Offered Packages
           </h2>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {packages?.length > 0 ? (
               packages.map((pkg, idx) => {
                 const isPrm = pkg.packageCategory === 'premium' || pkg.type === 'premium';
                 let lowestPrice = 0;
                 if (pkg.pricingTiers && pkg.pricingTiers.length > 0) {
                     lowestPrice = Math.min(...pkg.pricingTiers.map(t => t.price));
                 } else {
                     lowestPrice = pkg.price?.individual || pkg.price?.starting || pkg.price || 0;
                 }
                 const numDays = pkg.days || 1;
                 const isTrek = pkg.category === 'trek';

                 return (
                   <div key={idx} className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-visible border ${isPrm ? 'border-amber-200' : 'border-gray-100'} flex flex-col relative`}>
                      {/* Inline Configuration UI */}
                      {activePackageId === pkg._id ? (
                         <div className="p-5 flex flex-col bg-white rounded-xl relative min-h-[280px]">
                            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
                               <button onClick={() => setActivePackageId(null)} className="text-gray-500 hover:text-emerald-600 transition flex items-center text-sm font-semibold">
                                 <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                               </button>
                               <span className="text-xs font-bold text-gray-400 uppercase tracking-wider max-w-[140px] truncate">
                                  {pkg.name}
                               </span>
                            </div>
                            <div className="space-y-4 flex-grow">
                               {/* Category — only show for trips */}
                               {!isTrek && (
                                 <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                                    <div className="flex gap-2">
                                       {[{value: 'individual', label: 'Individual'}, {value: 'couple', label: 'Couple'}].map(opt => (
                                          <button
                                             key={opt.value}
                                             type="button"
                                             onClick={() => setPkgConfig({...pkgConfig, category: opt.value})}
                                             className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                                                pkgConfig.category === opt.value
                                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm'
                                                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                             }`}
                                          >
                                             {opt.label}
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                               )}
                               <div>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                     {pkgConfig.category === 'couple' && !isTrek ? 'No. of Couples' : 'No. of People'}
                                  </label>
                                  <div className="flex items-center bg-white border border-gray-200 rounded-lg h-[40px] hover:border-emerald-300 transition-colors">
                                     <button
                                        type="button"
                                        onClick={() => setPkgConfig({...pkgConfig, count: Math.max(1, pkgConfig.count - 1)})}
                                        disabled={pkgConfig.count <= 1}
                                        className="flex items-center justify-center w-10 h-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-l-lg transition-colors disabled:opacity-30"
                                     >
                                        <span className="text-lg font-bold">−</span>
                                     </button>
                                     <div className="flex-1 text-center text-sm font-bold text-gray-800 select-none tabular-nums">
                                        {pkgConfig.count}
                                     </div>
                                     <button
                                        type="button"
                                        onClick={() => setPkgConfig({...pkgConfig, count: Math.min(50, pkgConfig.count + 1)})}
                                        className="flex items-center justify-center w-10 h-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-r-lg transition-colors"
                                     >
                                        <span className="text-lg font-bold">+</span>
                                     </button>
                                  </div>
                               </div>
                               <div className="relative" style={{zIndex: 100}}>
                                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expected Travel Date</label>
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
                                     calendarClassName="border-emerald-200 rounded-lg shadow-xl bg-white"
                                     wrapperClassName="w-full"
                                     className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300 transition-colors"
                                  />
                               </div>
                            </div>
                            <button 
                               onClick={() => handleProceedBooking(pkg)}
                               className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-sm shadow-sm transition-colors"
                            >
                               Proceed to Booking →
                            </button>
                         </div>
                      ) : (
                         <>
                            <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex gap-2">
                               {isPrm ? (
                                  <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-[10px] font-bold text-white px-2 py-0.5 rounded shadow-sm uppercase tracking-wide">
                                     Premium
                                  </span>
                               ) : (
                                  <span className="bg-white text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-gray-200 uppercase tracking-wide">
                                     Budget
                                  </span>
                               )}
                               <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wide w-fit">
                                  {isTrek ? 'Trek' : 'Trip'}
                               </span>
                            </div>
                            
                            <div className="p-5 flex flex-col flex-grow">
                               <div className="mb-3">
                                  <h3 className="font-extrabold text-gray-800 line-clamp-2 text-lg mb-2">{pkg.name || pkg.label}</h3>
                                  <div className="flex flex-wrap gap-1.5">
                                     <span className="text-[10px] uppercase font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                        {numDays} Day{numDays > 1 ? 's' : ''}
                                     </span>
                                     <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                        {pkg.packageType || 'Individual/Couple'}
                                     </span>
                                  </div>
                               </div>
                               <p className="text-xs text-gray-500 mb-4 flex items-center">
                                  <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-500" /> {pkg.destination}
                               </p>
                               <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                  <div>
                                     <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Starting From</p>
                                     <span className="font-extrabold text-lg text-emerald-600">₹{lowestPrice.toLocaleString('en-IN')}</span>
                                  </div>
                                  <button onClick={() => handleConfigurePkg(pkg._id)} className="text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-xl shadow-sm transition-colors">
                                     Select
                                  </button>
                               </div>
                            </div>
                         </>
                      )}
                   </div>
                 );
               })
             ) : (
               <div className="col-span-full bg-white rounded-xl p-10 text-center border border-gray-100 shadow-sm">
                  <p className="text-gray-500">This provider hasn't published any packages yet.</p>
               </div>
             )}
           </div>
         </div>

         {/* Events Section */}
         {data.events && data.events.length > 0 && (
           <div className="mt-12 sm:mt-16">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-gray-900 flex items-center">
                 <Navigation className="w-5 h-5 mr-2 text-indigo-500" /> Hosted Events
               </h2>
               {data.events.length > 3 && (
                 <button onClick={() => setShowAllEvents(!showAllEvents)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
                   {showAllEvents ? 'Show Less' : 'See All Events'}
                 </button>
               )}
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {(showAllEvents ? data.events : data.events.slice(0, 3)).map((event, idx) => (
                   <div key={idx} onClick={() => router.push(`/user/event/eventdetails/${event._id}`)} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1 overflow-hidden border border-gray-100 cursor-pointer flex flex-col h-full">
                      <div className="h-44 w-full relative">
                         <img 
                           src={event.poster || event.images?.[0] || 'https://via.placeholder.com/400x300?text=Event'} 
                           className="w-full h-full object-cover" 
                           alt={event.title} 
                         />
                         <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-indigo-700 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                            {event.eventType}
                         </span>
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                         <div className="mb-2">
                             <h3 className="font-extrabold text-gray-800 line-clamp-1 text-lg mb-1">{event.title}</h3>
                             <p className="text-xs text-gray-500 flex items-center">
                                <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-400" /> {event.location}
                             </p>
                         </div>
                         <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                             <div className="flex flex-col">
                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Date</span>
                                 <span className="text-sm font-bold text-gray-700">
                                     {new Date(event.date).toLocaleDateString()}
                                 </span>
                             </div>
                             <div className="flex flex-col text-right">
                                 <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Price</span>
                                 <span className="text-lg font-extrabold text-indigo-600">₹{event.price?.toLocaleString('en-IN') || 0}</span>
                             </div>
                         </div>
                      </div>
                   </div>
               ))}
             </div>
           </div>
         )}

         {/* Reviews & Feedback Section */}
         <div className="mt-12 sm:mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" /> Ratings & Reviews
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
               
               {/* Left: Feedback List */}
               <div className="lg:col-span-3 order-2 lg:order-1 space-y-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">What travelers are saying</h3>
                  {feedbacks.length > 0 ? (
                    feedbacks.map((fb) => (
                      <div key={fb.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                         <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-800">{fb.user}</h4>
                            <span className="text-xs text-gray-400 font-medium">{fb.date}</span>
                         </div>
                         <div className="flex items-center mb-2.5">
                            {[1,2,3,4,5].map(s => (
                               <Star key={s} className={`w-3.5 h-3.5 ${s <= fb.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                            ))}
                         </div>
                         <p className="text-sm text-gray-600 italic">"{fb.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No reviews yet. Be the first to share your experience!</p>
                  )}
               </div>

               {/* Right: Leave a rating */}
               <div className="lg:col-span-2 order-1 lg:order-2">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                     <h3 className="font-bold text-gray-900 mb-2">Rate {provider.name}</h3>
                     <p className="text-xs text-gray-500 mb-5">Your feedback helps others make better choices.</p>
                     
                     <form onSubmit={handleSubmitFeedback}>
                        <div className="flex items-center gap-2 mb-5">
                          {[1,2,3,4,5].map(star => (
                             <button
                               type="button"
                               key={star}
                               className="focus:outline-none transition-transform hover:scale-110"
                               onMouseEnter={() => setRatingHover(star)}
                               onMouseLeave={() => setRatingHover(0)}
                               onClick={() => setRatingSubmit(star)}
                             >
                                <Star className={`w-7 h-7 ${star <= (ratingHover || ratingSubmit) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                             </button>
                          ))}
                        </div>
                        
                        <div className="mb-4">
                           <textarea 
                             className="w-full text-sm placeholder-gray-400 rounded-lg border-gray-200 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm min-h-[100px] resize-none"
                             placeholder="Tell others about your experience..."
                             value={feedbackText}
                             onChange={(e) => setFeedbackText(e.target.value)}
                           ></textarea>
                        </div>
                        
                        <button 
                           type="submit" 
                           disabled={!ratingSubmit || !feedbackText.trim() || submittingFeedback}
                           className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-medium py-2.5 rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center"
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
