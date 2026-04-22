'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Edit, MapPin, Calendar, Clock, Star, 
  Check, X, FileText, Info, Camera, Tag,
  Navigation, Users, Tent, Sun, Award, Shield, Heart,
  Package as PackageIcon, CheckCircle, Zap, Navigation2
} from 'lucide-react';

const fmtAmt = (a) => `₹${Number(a || 0).toLocaleString('en-IN')}`;

export default function ViewPackage({ pkg }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview & Pricing', icon: <Info size={16} /> },
    { id: 'itinerary', name: 'Itinerary', icon: <MapPin size={16} /> },
    { id: 'inclusions', name: 'Inclusions & Exclusions', icon: <Shield size={16} /> },
    { id: 'terms', name: 'Terms & Conditions', icon: <FileText size={16} /> }
  ];

  if (pkg.category === 'trip' && pkg.activities?.length > 0) {
      tabs.splice(2, 0, { id: 'activities', name: 'Activities', icon: <Zap size={16} /> });
  }

  const getMinPrice = () => {
    if (!pkg.pricingTiers || pkg.pricingTiers.length === 0) return 0;
    const prices = pkg.pricingTiers.map(t => parseInt(t.price)).filter(val => !isNaN(val));
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  const isTrek = pkg.category === 'trek';
  const displayStatus = pkg.status === 'published' ? 'active' : (pkg.status || 'active');

  return (
    <div className="w-full space-y-6 pb-20">
      
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/serviceprovider/dashboard/settings/packages')}
            className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all active:scale-95 shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shrink-0">
              {isTrek ? <Tent size={20} className="text-white" /> : <PackageIcon size={20} className="text-white" />}
            </div>
            <div>
              <h1 className="text-[18px] font-black text-gray-900 tracking-tight leading-none mb-1">Package Details</h1>
              <p className="text-[12px] text-gray-400 font-medium">View and manage offering</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push(`/serviceprovider/dashboard/settings/packages/edit/${pkg._id}`)}
          className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-[13px] font-bold hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Edit size={16} />
          <span>Edit Package</span>
        </button>
      </div>

      {/* ── Banner & Title Card ───────────────────────────── */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden relative">
         <div className="h-40 sm:h-52 w-full bg-emerald-900 relative overflow-hidden flex items-center justify-center">
             {pkg.photos && pkg.photos.length > 0 ? (
                 <>
                    <img src={pkg.photos[0]} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-0" />
                 </>
             ) : (
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-teal-900" />
             )}
             <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-20 select-none">
                 <h1 className="text-white text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter uppercase whitespace-nowrap">bagspackgo</h1>
             </div>
         </div>

         <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 sm:-mt-12 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            displayStatus === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                            {displayStatus}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                            {isTrek ? <Tent size={10} /> : <PackageIcon size={10} />}
                            {pkg.category}
                        </span>
                         {pkg.packageType && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                pkg.packageType === 'couple' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                                {pkg.packageType === 'couple' ? <Heart size={10} /> : <Users size={10} />}
                                {pkg.packageType}
                            </span>
                        )}
                        {pkg.category === 'trip' && pkg.packageCategory && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                                pkg.packageCategory === 'premium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-gray-50 text-gray-700 border-gray-100'
                            }`}>
                                {pkg.packageCategory === 'premium' ? <Award size={10} /> : <Shield size={10} />}
                                {pkg.packageCategory}
                            </span>
                        )}
                    </div>
                    
                    <h2 className="text-[20px] sm:text-[24px] font-black text-gray-900 leading-tight mb-3">
                        {pkg.name}
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium text-gray-500">
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500" /> {pkg.destination}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-emerald-500" /> {pkg.days} Days / {pkg.days > 1 ? pkg.days - 1 : 1} Nights</span>
                        {isTrek && pkg.trekLevel && (
                            <span className="flex items-center gap-1.5 capitalize"><Award size={14} className="text-emerald-500" /> Level: {pkg.trekLevel}</span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Star size={14} className="text-amber-400 fill-amber-400" /> 
                            <span className="font-bold text-gray-700">{pkg.rating || 'New'}</span>
                        </span>
                    </div>
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 min-w-[200px] shrink-0">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Starting Price</p>
                    <div className="text-[28px] font-black text-gray-900 leading-none mb-1 text-emerald-600">{fmtAmt(getMinPrice())}</div>
                    <p className="text-[11px] text-gray-500 font-medium tracking-tight">Per person</p>
                </div>
            </div>
         </div>
      </div>

      {/* ── Navigation Tabs ───────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] py-4 px-4 flex items-center justify-center gap-2 text-[13px] font-bold transition-all border-b-2 ${
                activeTab === tab.id 
                ? 'text-emerald-700 border-emerald-600 bg-emerald-50/50' 
                : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
                <div className={activeTab === tab.id ? 'text-emerald-500' : 'text-gray-300'}>
                {tab.icon}
                </div>
                {tab.name}
            </button>
            ))}
        </div>

        {/* ── Tab Content Container ───────────────────────── */}
        <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* 1. OVERVIEW & PRICING */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            
                            {/* About Package Section */}
                            {pkg.aboutPackage && pkg.aboutPackage.trim() && (
                                <div>
                                    <h3 className="text-[15px] font-black text-gray-900 mb-3 flex items-center gap-2">
                                        <Info size={18} className="text-emerald-500" /> About This Package
                                    </h3>
                                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                                        <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">{pkg.aboutPackage}</p>
                                    </div>
                                </div>
                            )}

                            {/* Package Photos (for trips) */}
                            {pkg.packagePhotos?.length > 0 && (
                                <div>
                                    <h3 className="text-[15px] font-black text-gray-900 mb-3 flex items-center gap-2">
                                        <Camera size={18} className="text-emerald-500" /> Package Gallery
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {pkg.packagePhotos.map((src, i) => (
                                            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                                <img src={src} alt={`Package ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isTrek && (
                                <div>
                                    <h3 className="text-[15px] font-black text-gray-900 mb-3 flex items-center gap-2">
                                        <Info size={18} className="text-emerald-500" /> Trek Specifics
                                    </h3>
                                    <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-[11px] text-gray-500 font-medium">Trek Name</p>
                                            <p className="text-[13px] font-bold text-gray-900 mt-0.5">{pkg.trekName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] text-gray-500 font-medium">Level</p>
                                            <p className="text-[13px] font-bold text-gray-900 mt-0.5 capitalize">{pkg.trekLevel}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-[15px] font-black text-gray-900 mb-3 flex items-center gap-2">
                                    <Tag size={18} className="text-emerald-500" /> Pricing Tiers
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {pkg.pricingTiers?.map((tier, idx) => (
                                        <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 py-1 rounded-md text-[11px] font-bold">
                                                    <Users size={12} /> {tier.minPeople} - {tier.maxPeople} Pax
                                                </div>
                                                {tier.discount > 0 && (
                                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                                                        {tier.discount}% OFF
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[20px] font-black text-gray-900">{fmtAmt(tier.price)} <span className="text-[11px] font-medium text-gray-400">/ person</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {pkg.pickupDropCities?.length > 0 && (
                                <div>
                                    <h3 className="text-[15px] font-black text-gray-900 mb-3 flex items-center gap-2">
                                        <Navigation size={18} className="text-emerald-500" /> Pickup & Drop Points
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {pkg.pickupDropCities.map((city, idx) => (
                                            <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                                <p className="text-[13px] font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                                                    <MapPin size={14} className="text-gray-400" /> {city.cityName}
                                                </p>
                                                <ul className="space-y-1.5 pl-6 list-disc text-gray-400 marker:text-emerald-400">
                                                    {city.locations.map((loc, lIdx) => (
                                                        <li key={lIdx} className="text-[12px] text-gray-600 pl-1 group">
                                                            <div className="flex justify-between items-center w-full">
                                                                <span>{loc.name}</span>
                                                                {loc.mapLink && (
                                                                    <a href={loc.mapLink} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-700 font-medium text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all">Map →</a>
                                                                )}
                                                            </div>
                                                            {(loc.pickupTime || loc.dropoffTime) && (
                                                                <div className="flex flex-wrap gap-3 mt-1.5 text-[11px] text-gray-500 bg-white/50 inline-flex px-2 py-1 rounded-md border border-gray-100">
                                                                    {loc.pickupTime && <span className="flex items-center gap-1"><Clock size={10} className="text-emerald-500"/> Pickup: <span className="font-semibold text-gray-700">{loc.pickupTime}</span></span>}
                                                                    {loc.dropoffTime && <span className="flex items-center gap-1"><Clock size={10} className="text-rose-400"/> Drop-off: <span className="font-semibold text-gray-700">{loc.dropoffTime}</span></span>}
                                                                </div>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {pkg.additionalPoints?.length > 0 && (
                                <div>
                                    <h3 className="text-[15px] font-black text-gray-900 mb-3 flex items-center gap-2">
                                        <Info size={18} className="text-emerald-500" /> Additional Information
                                    </h3>
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm space-y-2">
                                        {pkg.additionalPoints.map((point, idx) => {
                                            const text = typeof point === 'string' ? point : point.text;
                                            if (!text?.trim()) return null;
                                            return (
                                                <div key={idx} className="flex gap-3 text-[13px] text-emerald-800 leading-relaxed">
                                                    <span className="font-bold shrink-0">•</span>
                                                    <span>{text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {pkg.photos?.length > 0 && (
                                <div>
                                    <h3 className="text-[15px] font-black text-gray-900 mb-3 flex items-center gap-2">
                                        <Camera size={18} className="text-emerald-500" /> Gallery
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {pkg.photos.map((src, i) => (
                                            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                                <img src={src} alt={`Gallery ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2. ITINERARY */}
                    {activeTab === 'itinerary' && (
                        <div className="space-y-6">
                            {pkg.itinerary?.length ? pkg.itinerary.map((day, idx) => (
                                <div key={idx} className="relative pl-8 sm:pl-12 pb-8 last:pb-0">
                                    <div className="absolute left-0 sm:left-2 top-0 bottom-0 w-0.5 bg-gray-100" />
                                    <div className="absolute left-[-11px] sm:left-[-1px] top-0 w-6 h-6 rounded-full bg-emerald-100 border-4 border-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    </div>

                                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 font-bold text-[13px] shadow-sm">
                                                Day {day.day}
                                            </div>
                                            {day.location && (
                                                <h4 className="text-[15px] font-black text-gray-900">{day.location}</h4>
                                            )}
                                        </div>
                                        
                                        {day.agenda && (
                                            <p className="text-[13px] text-gray-600 leading-relaxed mb-4 whitespace-pre-line">
                                                {!isTrek && ['arrival', 'exploration', 'travel-day', 'checkout'].includes(day.agenda) 
                                                    ? {
                                                        'arrival': 'Arrival & Check-in',
                                                        'exploration': 'Exploration',
                                                        'travel-day': 'Travel Day',
                                                        'checkout': 'Exploration & Checkout'
                                                      }[day.agenda] 
                                                    : day.agenda.replace(/ \| /g, '\n')}
                                            </p>
                                        )}

                                        <div className="flex flex-col gap-2">
                                            {day.travelFrom && day.travelTo && (
                                                <div className="flex items-center gap-2 text-[12px] text-gray-500 bg-gray-50 p-2.5 rounded-lg">
                                                    <Navigation2 size={14} className="text-gray-400" />
                                                    <span>Travel: <span className="font-semibold">{day.travelFrom}</span> to <span className="font-semibold">{day.travelTo}</span></span>
                                                </div>
                                            )}
                                            {day.hotelName && (
                                                <div className="flex items-center gap-2 text-[12px] text-gray-500 bg-gray-50 p-2.5 rounded-lg">
                                                    <Sun size={14} className="text-amber-500" />
                                                    <span>Stay: <span className="font-semibold">{day.hotelName}</span> ({day.hotelStars} Stars)</span>
                                                </div>
                                            )}
                                        </div>

                                        {day.highlights && day.highlights.length > 0 && day.highlights.some(h => h.trim()) && (
                                            <div className="mt-4 pt-4 border-t border-gray-50">
                                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Highlights</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {day.highlights.filter(h => h.trim()).map((highlight, hIdx) => (
                                                        <span key={hIdx} className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-medium border border-emerald-100">
                                                            {highlight}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-gray-400 text-sm">No itinerary provided.</div>
                            )}
                        </div>
                    )}

                    {/* 3. INCLUSIONS & EXCLUSIONS */}
                    {activeTab === 'inclusions' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-[15px] font-black text-gray-900 flex items-center gap-2">
                                    <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600"><Check size={16} /></div> 
                                    What's Included
                                </h3>
                                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
                                    {pkg.inclusivesList?.length ? pkg.inclusivesList.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 text-[13px] text-gray-600 leading-relaxed">
                                            <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </div>
                                    )) : <p className="text-gray-400 text-sm">No inclusions listed.</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[15px] font-black text-gray-900 flex items-center gap-2">
                                    <div className="bg-rose-100 p-1.5 rounded-lg text-rose-600"><X size={16} /></div> 
                                    What's Excluded
                                </h3>
                                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-3">
                                    {pkg.exclusivesList?.length ? pkg.exclusivesList.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 text-[13px] text-gray-600 leading-relaxed">
                                            <X size={16} className="text-rose-400 shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </div>
                                    )) : <p className="text-gray-400 text-sm">No exclusions listed.</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. ACTIVITIES (If any) */}
                    {activeTab === 'activities' && (
                        <div className="space-y-4">
                             {pkg.activities?.length ? pkg.activities.map((activity, idx) => (
                                 <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                     <h4 className="text-[15px] font-bold text-gray-900 mb-1">{activity.name}</h4>
                                     <p className="text-[13px] text-gray-500 leading-relaxed">{activity.details}</p>
                                 </div>
                             )) : (
                                 <div className="text-center py-10 text-gray-400 text-sm">No activities provided.</div>
                             )}
                        </div>
                    )}

                    {/* 5. TERMS & CONDITIONS */}
                    {activeTab === 'terms' && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                             <h3 className="text-[15px] font-black text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-emerald-500" /> Booking Policies
                             </h3>
                             <div className="space-y-3">
                                 {pkg.termsAndConditions?.length ? pkg.termsAndConditions.map((term, idx) => (
                                     <div key={idx} className="flex gap-3 text-[13px] text-gray-600 leading-relaxed">
                                         <span className="font-bold text-emerald-600 shrink-0 w-5 text-right">{idx + 1}.</span>
                                         <span>{term}</span>
                                     </div>
                                 )) : <p className="text-gray-400 text-sm">No terms and conditions provided.</p>}
                             </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
