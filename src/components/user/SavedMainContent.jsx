'use client';
import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, MapPin, Calendar, Clock, Crown, Trash2, ArrowRight } from 'lucide-react';

const SavedMainContent = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    async function fetchSaved() {
      try {
        const res = await fetch('/api/user/saved');
        const data = await res.json();
        if (data.success && data.saved) {
          setSavedItems(data.saved);
        }
      } catch (err) {
        console.error('Failed to fetch saved items:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, []);

  const handleUnsave = async (itemId) => {
    // Optimistic UI update
    setSavedItems((prev) => prev.filter((s) => s.itemId !== itemId));
    try {
      await fetch(`/api/user/saved?itemId=${itemId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to unsave item:', err);
    }
  };

  const filteredItems = useMemo(() => {
    return savedItems.filter((i) => {
      if (categoryFilter === 'all') return true;
      return i.itemType === categoryFilter;
    });
  }, [savedItems, categoryFilter]);

  if (loading) {
     return (
       <div className="flex justify-center items-center h-64">
         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
       </div>
     );
  }

  return (
    <div className="mx-auto max-w-7xl pt-4 sm:pt-6 pb-16 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-2">Saved Items</h1>
          <p className="text-gray-500">Your curated collection of trips, treks, and events.</p>
        </div>
        
        {/* Category Filters */}
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-100 p-1">
          {['all', 'trip', 'trek', 'event'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                categoryFilter === cat
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat === 'all' ? 'All Items' : `${cat}s`}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.length > 0 ? (
             filteredItems.map((record) => {
                const pkg = record.item;
                const isPremium = pkg.type === 'premium';
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.8, 0.25, 1] }}
                    key={record._id}
                    className={`group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border ${
                       isPremium ? 'border-amber-400/30' : 'border-gray-100 hover:border-emerald-100'
                    }`}
                  >
                    {/* Top Accent Bar */}
                    <div className={`h-1 w-full ${isPremium ? 'bg-gradient-to-r from-amber-400 to-yellow-400' : 'bg-gradient-to-r from-emerald-400 to-teal-400'}`} />

                    <div className="p-5 flex flex-col flex-grow relative">
                      {/* Unsave Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleUnsave(record.itemId);
                        }}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all z-10 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-start gap-4 mb-4">
                        {/* Dynamic Avatar / Icon */}
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                           isPremium ? 'bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-300' : 'bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-400'
                        }`}>
                           {pkg.coverImage || (pkg.images && pkg.images[0]) ? (
                             <img src={pkg.coverImage || pkg.images[0]} className="w-full h-full object-cover rounded-xl" alt="" />
                           ) : (
                             <span className="text-white font-black text-xl tracking-wider">
                               {(pkg.label || pkg.title || pkg.name || 'B')[0].toUpperCase()}
                             </span>
                           )}
                        </div>
                        
                        <div className="flex-1 min-w-0 pr-8">
                           <div className="flex gap-1.5 mb-1.5">
                             <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border ${
                                record.itemType === 'trip' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                record.itemType === 'trek' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                'bg-violet-50 text-violet-600 border-violet-100'
                             }`}>
                               {record.itemType}
                             </span>
                             {isPremium && (
                               <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md border bg-amber-50 text-amber-600 border-amber-100 flex items-center">
                                 <Crown className="w-2.5 h-2.5 mr-1" /> Premium
                               </span>
                             )}
                           </div>
                           <h3 className={`font-extrabold text-base leading-tight truncate ${isPremium ? 'text-amber-700' : 'text-emerald-700 group-hover:text-emerald-600'}`}>
                             {pkg.label || pkg.title || pkg.name || 'Untitled Package'}
                           </h3>
                        </div>
                      </div>
                      
                      {/* Secondary Info */}
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-blue-500 shrink-0" />
                          <span className="truncate">{pkg.destination || pkg.location || 'Location varies'}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5 mr-1.5 text-emerald-500 shrink-0" />
                          <span>{pkg.days ? `${pkg.days} Days / ${pkg.nights || pkg.days - 1} Nights` : 'Duration varies'}</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-8 pt-4 border-t border-gray-50 flex items-end justify-between">
                        <div>
                           <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black mb-0.5">Starting from</p>
                           <p className="flex items-baseline gap-1">
                             <span className={`text-xl font-black ${isPremium ? 'text-amber-600' : 'text-gray-900'}`}>
                               ₹{Number(pkg.price?.individual || pkg.price?.starting || pkg.price || 0).toLocaleString('en-IN')}
                             </span>
                             <span className="text-[10px] text-gray-400 font-bold uppercase">/person</span>
                           </p>
                        </div>
                        <a 
                          href={record.itemType === 'trek' 
                            ? `/user/trek/guidelist/trekdetails/${pkg.providerId || pkg.provider || pkg._id}?trekId=${record.itemId}` 
                            : `/user/trip/guidelist/tripdetails/${pkg.providerId || pkg.provider || pkg._id}?packageId=${record.itemId}`} 
                          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-sm group-hover:shadow-md ${
                            isPremium 
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-500 hover:text-white' 
                              : 'bg-gray-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-gray-100 hover:border-emerald-500'
                          }`}
                        >
                           <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                );
             })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-gray-200"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                 <Bookmark className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No saved items yet</h3>
              <p className="text-gray-500 max-w-sm mb-6">Discover amazing trips and add them to your collection by clicking the save icon.</p>
              <a href="/" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                Explore Packages
              </a>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default SavedMainContent;
