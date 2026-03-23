'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Award, Users, CheckCircle, Navigation, ArrowLeft, ArrowRight } from 'lucide-react';

const ProviderProfileContent = ({ providerId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmit, setRatingSubmit] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbacks, setFeedbacks] = useState([
    { id: 1, user: "Alex M.", rating: 5, comment: "Amazing experience! The guide was very knowledgeable and the itinerary was perfect.", date: "2023-11-15" },
    { id: 2, user: "Sarah J.", rating: 4, comment: "Great trip overall. Well organized and beautiful locations.", date: "2023-10-02" }
  ]);

  useEffect(() => {
    async function fetchProvider() {
      try {
        const res = await fetch(`/api/user/provider/${providerId}`);
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error("Provider fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProvider();
  }, [providerId]);

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!ratingSubmit || !feedbackText.trim()) return;
    
    setSubmittingFeedback(true);
    // Simulate API call
    setTimeout(() => {
       const newFb = { 
           id: Date.now(), 
           user: "You", 
           rating: ratingSubmit, 
           comment: feedbackText, 
           date: new Date().toISOString().split('T')[0] 
       };
       setFeedbacks([newFb, ...feedbacks]);
       setRatingSubmit(0);
       setFeedbackText('');
       setSubmittingFeedback(false);
       alert("Thank you for your feedback!");
    }, 800);
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

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Cover Banner */}
      <div className={`w-full h-48 md:h-64 relative ${isPremiumProvider ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`}>
         {/* Pattern overlay */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat mix-blend-overlay"></div>
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
                        {provider.rating || '4.8'}
                     </p>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                  <div className="text-center md:text-left">
                     <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Reviews</p>
                     <p className="text-xl font-bold text-gray-900 flex items-center justify-center md:justify-start">
                        {provider.reviews || '10+'}
                     </p>
                  </div>
                  <div className="w-px h-10 bg-gray-200 hidden sm:block"></div>
                  <div className="text-center md:text-left">
                     <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Packages</p>
                     <p className="text-xl font-bold text-gray-900 flex items-center justify-center md:justify-start">
                        {packages?.length || 0}
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
                 const isPrm = pkg.type === 'premium';
                 return (
                   <div key={idx} className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1 overflow-hidden border ${isPrm ? 'border-amber-200' : 'border-gray-100'}`}>
                      <div className="h-40 w-full relative">
                         <img 
                           src={pkg.coverImage || (pkg.images && pkg.images[0]) || 'https://via.placeholder.com/400x300?text=Trip+Image'} 
                           className="w-full h-full object-cover" 
                           alt="Package" 
                         />
                         {isPrm && (
                            <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-[10px] font-bold text-white px-2 py-1 rounded shadow-md uppercase tracking-wide">
                               Premium
                            </span>
                         )}
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="font-bold text-gray-800 line-clamp-1">{pkg.label || pkg.title}</h3>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 flex items-center">
                           <MapPin className="w-3.5 h-3.5 mr-1" /> {pkg.destination}
                        </p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                           <span className="font-bold text-lg text-emerald-600">₹{pkg.price?.individual || pkg.price?.starting || '0'}</span>
                           <a href={`/tripdetails?packageId=${pkg._id}`} className="text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded-full shadow-sm transition-colors">
                             View
                           </a>
                        </div>
                      </div>
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
