'use client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, MapPin, Calendar, Clock, Trash2, ArrowRight, ArrowLeft, User, Users, Compass, Mountain, Ticket } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const SavedMainContent = () => {
  const router = useRouter();
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleOpenConfig = (e, record) => {
    e.preventDefault();
    const pkg = record.item;
    
    const cat = record.config?.category || pkg.packageCategory || 'individual';
    const count = record.config?.peopleCount || 1;
    const dateQuery = record.config?.date ? `&date=${new Date(record.config.date).toISOString()}` : '';
    const days = record.config?.days || pkg.days || 1;

    let path = '';
    const actualProviderId = pkg.provider?._id || pkg.providerId || pkg.provider || pkg._id || record.providerId || '';
    
    if (record.itemType === 'event') {
      path = `/user/events/eventdetails/${record.itemId}`;
    } else if (record.itemType === 'trek') {
      path = `/user/trek/guidelist/trekdetails/${actualProviderId}?trekId=${pkg._id}${dateQuery}&count=${count}&category=${cat}&days=${days}`;
    } else {
      path = `/user/trip/guidelist/tripdetails/${actualProviderId}?packageId=${pkg._id}${dateQuery}&count=${count}&category=${cat}&days=${days}`;
    }
    router.push(path);
  };

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

  const TYPE_CONFIG = {
    trip: { label: 'Trip', icon: Compass, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    trek: { label: 'Trek', icon: Mountain, color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
    event: { label: 'Event', icon: Ticket, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 mb-16 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Saved Items</h1>
              <div className="p-1 px-2 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold flex items-center gap-1">
                <Bookmark className="w-3 h-3" />
                {savedItems.length} Saved
              </div>
            </div>
            <p className="text-sm text-gray-500">Your curated collection of trips, treks, and events.</p>
          </div>
        </div>
        
        {/* Category Filters */}
        <div className="flex bg-gray-50 border border-gray-200 p-1 rounded-lg self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
          {['all', 'trip', 'trek', 'event'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {cat === 'all' ? 'All Items' : `${cat}s`}
            </button>
          ))}
        </div>
      </div>

      <Separator className="mb-6" />

      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredItems.length > 0 ? (
             filteredItems.map((record) => {
                const pkg = record.item;
                const typeCfg = TYPE_CONFIG[record.itemType] || TYPE_CONFIG.trip;
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    key={record._id}
                  >
                    <Card
                      onClick={(e) => handleOpenConfig(e, record)}
                      className="group flex flex-col h-full bg-white overflow-hidden border-gray-200/80 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all duration-200 relative"
                    >
                      <div className="p-4 flex flex-col flex-grow">
                        {/* Unsave Button */}
                        <div className="absolute top-3 right-3 z-10 transition-opacity duration-200">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="w-7 h-7 bg-white/90 backdrop-blur border shadow-sm text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleUnsave(record.itemId);
                            }}
                            title="Remove from saved"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="flex items-start gap-4 mb-4">
                          {/* Image */}
                          <div className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 border bg-gray-50 overflow-hidden ${typeCfg.border}`}>
                             {pkg.coverImage || (pkg.images && pkg.images[0]) ? (
                               <img src={pkg.coverImage || pkg.images[0]} className="w-full h-full object-cover" alt="" />
                             ) : (
                               <span className="text-gray-400 font-bold text-xl uppercase">
                                 {(pkg.label || pkg.title || pkg.name || 'B')[0]}
                               </span>
                             )}
                          </div>
                          
                          <div className="flex-1 min-w-0 pr-6">
                             <div className="mb-1.5">
                               <Badge variant="outline" className={`text-[9px] uppercase tracking-wider font-bold rounded flex w-fit items-center gap-1 ${typeCfg.bg} ${typeCfg.color} ${typeCfg.border}`}>
                                 <typeCfg.icon className="w-2.5 h-2.5" />
                                 {typeCfg.label}
                               </Badge>
                             </div>
                             <h3 className="font-bold text-sm text-gray-900 leading-snug truncate group-hover:text-emerald-700 transition-colors">
                               {pkg.label || pkg.title || pkg.name || 'Untitled Package'}
                             </h3>
                          </div>
                        </div>
                        
                        <Separator className="mb-3 opacity-50" />
                        
                        {/* Details */}
                        <div className="flex flex-col gap-2">
                          {record.itemType === 'event' ? (
                            <>
                              <div className="flex items-center text-xs text-gray-500 font-medium">
                                <Calendar className="h-3.5 w-3.5 mr-2 text-gray-400 shrink-0" />
                                <span className="truncate">{pkg.date ? new Date(pkg.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible Date'}</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500 font-medium">
                                <User className="h-3.5 w-3.5 mr-2 text-gray-400 shrink-0" />
                                <span className="truncate">By {pkg.organizer || 'Host'}</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500 font-medium">
                                <Users className="h-3.5 w-3.5 mr-2 text-gray-400 shrink-0" />
                                <span>{pkg.slotsRemaining || 0} Slots Remaining</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center text-xs text-gray-500 font-medium">
                                <MapPin className="h-3.5 w-3.5 mr-2 text-gray-400 shrink-0" />
                                <span className="truncate">{pkg.destination || pkg.location || 'Location varies'}</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500 font-medium">
                                <Clock className="h-3.5 w-3.5 mr-2 text-gray-400 shrink-0" />
                                <span>{pkg.days ? `${pkg.days} Days` : 'Duration varies'}</span>
                              </div>
                              {record.config?.date && (
                                <div className="mt-1 flex items-center text-[11px] text-gray-500 font-semibold bg-gray-50 w-fit px-2 py-1 rounded inline-flex border border-gray-100">
                                  Planning for: {new Date(record.config.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <div>
                           <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Starting from</p>
                           {(() => {
                             const tiers = pkg.pricingTiers?.length > 0 ? [...pkg.pricingTiers].sort((a,b) => a.minPeople - b.minPeople) : [];
                             const baseTier = tiers[0];
                             const rawPrice = Number(
                               record.config?.computedPrice || 
                               (baseTier ? baseTier.price : 0) || 
                               pkg.price?.individual || 
                               pkg.price?.starting || 
                               pkg.pricePerSlot || 
                               pkg.price || 
                               0
                             );
                             const discount = baseTier ? Number(baseTier.discount || 0) : 0;
                             const effectivePrice = discount > 0 ? rawPrice * (1 - discount / 100) : rawPrice;
                             const hasDiscount = discount > 0 && !record.config?.computedPrice;

                             return (
                               <p className="flex items-baseline gap-1.5">
                                 <span className="text-base font-bold text-gray-900 tabular-nums">
                                   ₹{Math.round(effectivePrice).toLocaleString('en-IN')}
                                 </span>
                                 {hasDiscount && (
                                   <span className="text-xs text-gray-400 line-through tabular-nums">
                                     ₹{Math.round(rawPrice).toLocaleString('en-IN')}
                                   </span>
                                 )}
                               </p>
                             );
                           })()}
                        </div>
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700">
                           <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
             })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="col-span-full py-20 flex flex-col items-center justify-center text-center px-4"
            >
              <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mb-4">
                 <Bookmark className="h-7 w-7 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">No saved items yet</h3>
              <p className="text-sm text-gray-400 max-w-sm mb-6">Discover amazing trips and add them to your collection by clicking the save icon.</p>
              <Button onClick={() => router.push('/')}>
                 Explore Packages
              </Button>
            </motion.div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default SavedMainContent;
