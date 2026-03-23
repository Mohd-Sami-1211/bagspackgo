'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Clock, Award, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TrekGuideCard = ({ pkg, peopleRange, date }) => {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  // If the component receives a `pkg` instead of a guide
  if (!pkg) return null;

  const priceObj = pkg.pricingTiers && pkg.pricingTiers.length > 0
    ? [...pkg.pricingTiers].sort((a, b) => a.minPeople - b.minPeople)[0]
    : { price: 0 };

  const pricePerPerson = priceObj.price ?? 0;
  const duration = pkg.days ? `${pkg.days} Days` : 'N/A';

  const handleViewDetails = () => {
    if (navigating) return;
    setNavigating(true);
    const params = new URLSearchParams();
    if (peopleRange) params.set('peopleRange', peopleRange);
    if (date) params.set('date', date.toISOString());

    // assuming guide/provider info is populated in pkg.provider
    router.push(`/user/trek/guidelist/trekdetails/${pkg.provider?._id || pkg.provider}?trekId=${pkg._id}&${params.toString()}`);
  };

  const providerName = pkg.provider?.companyname || pkg.provider?.username || 'Expert Guide';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        ease: [0.25, 0.8, 0.25, 1]
      }}
      whileHover={{
        scale: 1.02,
        transition: {
          type: 'spring',
          stiffness: 250,
          damping: 18
        }
      }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all relative"
    >
      <AnimatePresence>
        {navigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
          >
            <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
            <p className="mt-4 text-[13px] font-medium text-emerald-700">Loading package details...</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col md:flex-row">
        {/* Left Side */}
        <div className="w-full md:w-4/5 p-6">
          <div className="flex items-start gap-5">
            {/* Package/Guide Image */}
            <div className="flex-shrink-0">
              <div className="bg-gray-200 rounded-lg w-16 h-16 flex items-center justify-center overflow-hidden">
                {pkg.photos && pkg.photos.length > 0 ? (
                  <img src={pkg.photos[0]} alt={pkg.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-xs text-center border p-2">Trek<br />Image</span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-gray-800">{pkg.name}</h3>
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {pkg.rating || 4.5} ({pkg.totalRatings || 10} reviews)
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mt-1 text-sm">Organized by {providerName} • Level: <span className="capitalize">{pkg.trekLevel || 'Moderate'}</span></p>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-700 capitalize">{pkg.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-gray-700">Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">
                    {peopleRange ? `${peopleRange} people` : 'Range TBD'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-start">
                <div></div>
                <div className="text-right">
                  <div className="inline-flex flex-col items-end bg-green-50 px-3 py-2 rounded-lg">
                    <p className="text-sm text-gray-600 mb-0.5">Starting from</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-green-600">
                        ₹{pricePerPerson.toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm font-semibold text-green-800">/person</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Button */}
        <div className="w-full md:w-1/5 bg-green-300 flex items-center justify-center p-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleViewDetails}
            disabled={navigating}
            className="w-full py-3 bg-white hover:bg-[#d4f7d4] text-green-600 hover:text-green-800 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {navigating ? <><Loader2 className="w-5 h-5 animate-spin" /> Loading</> : 'View Details'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TrekGuideCard;