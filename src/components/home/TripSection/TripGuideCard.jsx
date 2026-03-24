'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Users, Calendar, Crown, ArrowRight, Loader2, Briefcase, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ProviderAvatar = ({ guide, premium }) => {
  const [imgErr, setImgErr] = useState(false);

  if (guide.logo && !imgErr) {
    return (
      <img
        src={guide.logo}
        alt={guide.name}
        onError={() => setImgErr(true)}
        className="w-full h-full object-cover rounded-xl"
      />
    );
  }

  const initials = guide.name
    ? guide.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'BP';
  const colors = [
    'from-emerald-500 to-teal-500',
    'from-green-500 to-emerald-600',
    'from-teal-500 to-cyan-600',
    'from-cyan-500 to-sky-600',
  ];
  const colorIdx = guide.name ? guide.name.charCodeAt(0) % colors.length : 0;

  return (
    <div className={`w-full h-full flex items-center justify-center rounded-xl bg-gradient-to-br ${premium ? 'from-amber-400 to-yellow-500' : colors[colorIdx]}`}>
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

const GuideCard = ({ guide, category, daysRange, peopleRange, date, selectedPackage }) => {
  const [navigating, setNavigating] = useState(false);
  const router = useRouter();

  const matchedPackage = selectedPackage || (() => {
    if (!daysRange) return null;
    const [minDays, maxDays] = daysRange.split('-').map(Number);
    const mp = guide.packages?.filter(pkg => pkg.days >= minDays && pkg.days <= maxDays);
    return mp?.length > 0 ? mp[0] : null;
  })();

  const isPremium = matchedPackage?.type === 'premium';

  let pricePerPerson, totalPrice, numDays, daysLabel;
  if (matchedPackage) {
    pricePerPerson = Number(matchedPackage.price[category] || matchedPackage.price.individual || 0);
    numDays = matchedPackage.days;
    const bc = peopleRange ? parseInt(peopleRange.split('-')[0]) || 1 : 1;
    totalPrice = pricePerPerson * Math.max(1, bc);
    daysLabel = `${numDays} day${numDays > 1 ? 's' : ''}`;
  } else {
    pricePerPerson = Number(guide.price?.[category] || guide.price?.individual || 0);
    numDays = daysRange?.includes('-') ? parseInt(daysRange.split('-')[1]) || 1 : 1;
    const bc = peopleRange ? parseInt(peopleRange.split('-')[0]) || 1 : 1;
    totalPrice = pricePerPerson * Math.max(1, bc) * numDays;
    daysLabel = daysRange ? `${daysRange} days` : 'Custom';
  }

  const baseCount = peopleRange ? parseInt(peopleRange.split('-')[0]) || 1 : 1;
  const numPeople = Math.max(1, baseCount);
  const peopleText = category === 'couple' ? 'couple' : 'person';
  const getCatLabel = () => ({ individual: 'Individual', couple: 'Couple', group: 'Group' }[category] || 'Individual');

  const handleViewDetails = () => {
    if (navigating) return;
    setNavigating(true);
    const params = new URLSearchParams();
    params.set('category', category);
    params.set('daysRange', daysRange || '');
    params.set('count', baseCount);
    if (matchedPackage) params.set('packageId', matchedPackage.id);
    if (date) params.set('date', date.toISOString());
    router.push(`/user/trip/guidelist/tripdetails/${guide.id}?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.8, 0.25, 1] }}
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border relative ${
        isPremium ? 'border-amber-400/30' : 'border-gray-100'
      }`}
    >
      <AnimatePresence>
        {navigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F2FFFC]"
          >
            <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
            <p className="mt-4 text-[13px] font-medium text-emerald-700">Loading package details...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium ribbon (Mobile only) */}
      {isPremium && (
        <div className="flex sm:hidden items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400">
          <Crown className="h-3.5 w-3.5 text-white" />
          <span className="text-xs font-semibold text-white tracking-wide">Premium Package</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row">
        {/* ── Main Content ─────────────────────────────── */}
        <div className="flex-1 p-4 sm:p-5">

          {/* === TOP: Avatar + Package Name (big) + Company (small) === */}
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <ProviderAvatar guide={guide} premium={isPremium} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Package name — PRIMARY (big, bold, highlighted) */}
              <h3 className={`text-base sm:text-lg font-extrabold leading-tight tracking-tight ${
                isPremium ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {matchedPackage?.label || `${getCatLabel()} Package`}
                {isPremium && (
                  <span className="ml-2 align-middle text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-tighter">Premium</span>
                )}
              </h3>

              {/* Provider / company name — secondary */}
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mt-0.5 truncate">
                {guide.name}
                {guide.companyName && (
                  <span className="text-gray-400 font-normal"> · {guide.companyName}</span>
                )}
              </p>

              {/* Star rating */}
              <div className="mt-1 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${
                    i < Math.round(guide.rating)
                      ? isPremium ? 'fill-amber-400 text-amber-400' : 'fill-emerald-500 text-emerald-500'
                      : 'text-gray-200 fill-gray-200'
                  }`} />
                ))}
                <span className="text-xs font-bold text-gray-700 ml-0.5">{guide.rating}</span>
                <span className="text-xs text-gray-400">({guide.reviews})</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed">{guide.bio}</p>

          {/* === STAT ROW: location, trips, duration, people === */}
          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
            <StatBadge icon={MapPin} label="Location" value={guide.location || '—'} color="text-blue-600" />
            <StatBadge icon={Briefcase} label="Experience" value={`${guide.touristsHandled}+ trips`} color="text-violet-600" />
            <StatBadge icon={Clock} label="Duration" value={daysLabel} color="text-amber-600" />
            <StatBadge icon={Users} label={category === 'couple' ? 'Couples' : 'People'} value={`${numPeople} ${peopleText}${numPeople > 1 ? 's' : ''}`} color="text-emerald-600" />
          </div>

          {/* === MOBILE: Price + CTA at bottom === */}
          <div className="mt-4 pt-3 border-t border-gray-100 sm:hidden flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                {matchedPackage ? 'Package' : 'From'} · {category === 'couple' ? 'Per Couple' : 'Per Person'}
              </p>
              <p className={`text-2xl font-extrabold ${isPremium ? 'text-amber-600' : 'text-emerald-600'}`}>
                ₹{pricePerPerson.toLocaleString('en-IN')}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleViewDetails}
              disabled={navigating}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap ${
                isPremium
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {navigating ? <Loader2 className="h-4 w-4 animate-spin" /> : <>View <ArrowRight className="h-3.5 w-3.5" /></>}
            </motion.button>
          </div>
        </div>

        {/* ── Right Panel (desktop only) ────────────────── */}
        <div className={`hidden sm:flex flex-col items-center justify-between gap-5 px-5 py-5 min-w-[180px] max-w-[200px] shadow-inner relative transition-all duration-500 overflow-hidden ${
          isPremium
            ? 'bg-slate-900' // Solid midnight for contrast
            : 'bg-gradient-to-b from-emerald-600 to-teal-500'
        }`}>
          {isPremium && (
            <>
              {/* Background Crown Watermark */}
              <Crown className="absolute -right-6 -top-6 h-32 w-32 text-amber-500/10 rotate-12" />
              {/* Vertical Side Label */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
            </>
          )}

          {/* Price section */}
          <div className="text-center w-full relative z-10">
            {isPremium && (
               <div className="flex justify-center mb-3">
                 <div className="p-2 bg-amber-500/20 rounded-full border border-amber-500/30">
                   <Crown className="h-6 w-6 text-amber-500 fill-amber-500" />
                 </div>
               </div>
            )}
            <p className={`text-[11px] uppercase tracking-widest font-black mb-1 ${isPremium ? 'text-amber-500' : 'text-emerald-100'}`}>
              {matchedPackage ? (isPremium ? 'Premium Package' : 'Package Deal') : 'Starting from'}
            </p>
            <p className="text-3xl font-black text-white drop-shadow-lg">
              ₹{pricePerPerson.toLocaleString('en-IN')}
            </p>
            <p className={`text-[10px] sm:text-xs mt-1.5 font-bold uppercase tracking-widest ${isPremium ? 'text-amber-400' : 'text-teal-100'}`}>
              {category === 'couple' ? 'Per Couple' : 'Per Person'}
            </p>
          </div>

          {/* Category badge */}
          <div className={`w-full text-center py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
            isPremium ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'bg-white/20 text-white'
          }`}>
            {getCatLabel()} Package
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
            {navigating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Loading...</>
            ) : (
              <>{isPremium ? 'View Premium' : 'View Details'} <ArrowRight className="h-4 w-4" /></>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GuideCard;