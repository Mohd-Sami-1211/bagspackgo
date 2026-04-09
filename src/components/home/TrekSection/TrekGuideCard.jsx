'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Users, Crown, ArrowRight, Loader2, Clock, Mountain } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Custom image loader/avatar for Provider
const ProviderAvatar = ({ provider, premium }) => {
  const [imgErr, setImgErr] = useState(false);

  const name = typeof provider === 'object' 
    ? (provider?.companyname || provider?.companyName || provider?.username || 'Expert Guide') 
    : 'Expert Guide';
  
  const logo = typeof provider === 'object' ? provider?.logo : null;

  if (logo && !imgErr) {
    return (
      <img
        src={logo}
        alt={name}
        onError={() => setImgErr(true)}
        className="w-full h-full object-cover rounded-full"
      />
    );
  }

  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'BP';
  const colors = [
    'from-emerald-500 to-teal-500',
    'from-green-500 to-emerald-600',
    'from-teal-500 to-cyan-600',
    'from-cyan-500 to-sky-600',
  ];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;

  return (
    <div className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-br ${colors[colorIdx]}`}>
      <span className="text-white font-bold text-xl tracking-wider">{initials}</span>
    </div>
  );
};

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <div className="flex flex-col items-start gap-0.5">
    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</span>
    <div className={`flex items-center gap-1 ${color}`}>
      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="text-xs font-semibold">{value}</span>
    </div>
  </div>
);

const TrekGuideCard = ({ pkg, peopleCount = 1, peopleRange, date }) => {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  if (!pkg) return null;

  // Support both new peopleCount and old peopleRange
  const numPeople = Math.max(1, peopleCount || (peopleRange ? parseInt(peopleRange.split('-')[0]) || 1 : 1));
  
  const tiers = pkg.pricingTiers || [];
  const matchedTier = tiers.find(t => numPeople >= t.minPeople && numPeople <= t.maxPeople) || (tiers.length > 0 ? [...tiers].sort((a,b)=>a.minPeople-b.minPeople)[0] : null);
  
  const originalPricePerPerson = matchedTier ? Number(matchedTier.price) : Number(pkg.price || 0);
  const discountPercent = matchedTier ? Number(matchedTier.discount || 0) : 0;
  const pricePerPerson = discountPercent > 0 ? originalPricePerPerson * (1 - (discountPercent / 100)) : originalPricePerPerson;
  const numDays = pkg.days || 1;
  const daysLabel = pkg.days ? `${pkg.days} Day${pkg.days > 1 ? 's' : ''}` : 'N/A';

  // Show people count
  const peopleLabel = `${numPeople} pax`;

  // Handle premium flag
  const isPremium = false; // Logic removed
  
  const handleViewDetails = () => {
    if (navigating) return;
    setNavigating(true);
    const params = new URLSearchParams();
    params.set('peopleCount', numPeople.toString());
    if (date) params.set('date', date.toISOString());

    router.push(`/user/trek/guidelist/trekdetails/${pkg.provider?._id || pkg.provider}?trekId=${pkg._id}&${params.toString()}`);
  };

  const companyName = pkg.provider?.companyname || pkg.provider?.companyName || pkg.provider?.username || 'Expert Guide';
  const guideName = pkg.provider?.username || pkg.provider?.name || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.8, 0.25, 1] }}
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border relative border-gray-100"
    >



      <div className="flex flex-col sm:flex-row">
        {/* ── Main Content ─────────────────────────────── */}
        <div className="flex-1 p-4 sm:p-5">

          {/* === TOP: Avatar + Package Name (big) + Company (small) === */}
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Avatar / Image */}
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-sm border border-gray-100">
              <ProviderAvatar provider={pkg.provider} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Package name — PRIMARY (big, bold, highlighted) */}
              <h3 className={`text-base sm:text-lg font-extrabold leading-tight tracking-tight ${
                isPremium ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {pkg.name}
                {isPremium && (
                  <span className="ml-2 align-middle text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-tighter">Premium</span>
                )}
              </h3>

              {/* Provider / company name — secondary */}
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-0.5 truncate">
                {companyName}
                {guideName && guideName !== companyName && (
                  <span className="text-gray-400 font-normal"> · by {guideName}</span>
                )}
              </p>

              {/* Star rating */}
              <div className="mt-1 flex items-center gap-1">
                {pkg.rating ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${
                        i < Math.round(pkg.rating)
                          ? isPremium ? 'fill-amber-400 text-amber-400' : 'fill-emerald-500 text-emerald-500'
                          : 'text-gray-200 fill-gray-200'
                      }`} />
                    ))}
                    <span className="text-xs font-bold text-gray-700 ml-0.5">{pkg.rating}</span>
                    <span className="text-xs text-gray-400">({pkg.totalRatings || 0} reviews)</span>
                  </>
                ) : (
                  <span className="text-[11px] font-semibold text-gray-400 italic">No ratings found</span>
                )}
              </div>
            </div>
          </div>

          {/* Bio / Description */}
          {pkg.description && (
             <p className="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed">{pkg.description}</p>
          )}

          {/* === STAT ROW: location, trips, duration, people === */}
          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <StatBadge icon={MapPin} label="Location" value={pkg.destination || '—'} color="text-blue-600" />
            <StatBadge icon={Mountain} label="Difficulty" value={pkg.trekLevel ? pkg.trekLevel.charAt(0).toUpperCase() + pkg.trekLevel.slice(1) : 'Moderate'} color="text-violet-600" />
            <StatBadge icon={Clock} label="Duration" value={daysLabel} color="text-amber-600" />
            <StatBadge icon={Users} label="People" value={peopleLabel} color="text-emerald-600" />
          </div>

          {/* === MOBILE: Price + CTA at bottom === */}
          <div className="mt-4 pt-3 border-t border-gray-100 sm:hidden flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                Starting From · Per Person
              </p>
              {discountPercent > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-2xl font-extrabold leading-none text-emerald-600">
                    ₹{Math.round(pricePerPerson).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs font-bold text-gray-400 line-through">
                    ₹{Math.round(originalPricePerPerson).toLocaleString('en-IN')}
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-extrabold leading-none text-emerald-600">
                  ₹{Math.round(pricePerPerson).toLocaleString('en-IN')}
                </p>
              )}
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleViewDetails}
              disabled={navigating}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <>View <ArrowRight className="h-3.5 w-3.5" /></>
            </motion.button>
          </div>
        </div>

        {/* ── Right Panel (desktop only) ────────────────── */}
        <div className="hidden sm:flex flex-col items-center justify-between gap-5 px-5 py-5 min-w-[180px] max-w-[200px] shadow-inner relative transition-all duration-500 overflow-hidden bg-gradient-to-b from-emerald-600 to-teal-500">


          {/* Price section */}
          <div className="text-center w-full relative z-10">

            <p className="text-[11px] uppercase tracking-widest font-black mb-1.5 text-emerald-100">
              Starting from
            </p>
            <div className="flex flex-col items-center justify-center">
              {discountPercent > 0 ? (
                <>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] font-bold text-white/50 line-through">₹{Math.round(originalPricePerPerson).toLocaleString('en-IN')}</span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded text-white uppercase tracking-wider bg-emerald-900/60 font-bold">-{discountPercent}%</span>
                  </div>
                  <p className="text-3xl font-black text-white drop-shadow-lg leading-tight">
                    ₹{Math.round(pricePerPerson).toLocaleString('en-IN')}
                  </p>
                </>
              ) : (
                <p className="text-3xl font-black text-white drop-shadow-lg leading-tight">
                  ₹{Math.round(pricePerPerson).toLocaleString('en-IN')}
                </p>
              )}
            </div>

            <p className="text-[10px] sm:text-xs mt-1.5 font-bold uppercase tracking-widest text-teal-100">
              Per Person
            </p>
          </div>

          {/* Category badge */}
          <div className={`w-full text-center py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
            isPremium ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'bg-white/20 text-white'
          }`}>
            Trek Package
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewDetails}
            disabled={navigating}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              isPremium
                ? 'bg-amber-500 border-amber-400 text-white hover:bg-amber-600 shadow-xl shadow-amber-900/40'
                : 'bg-white text-emerald-700 border-transparent hover:bg-emerald-50 shadow-md'
            }`}
          >
            <>{isPremium ? 'View Premium' : 'View Details'} <ArrowRight className="h-4 w-4" /></>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TrekGuideCard;