'use client';
import { motion } from 'framer-motion';
import { Star, MapPin, Users, Calendar, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const GuideCard = ({ guide, category, daysRange, peopleRange, date, selectedPackage }) => {
  // If a specific package is provided, use it. Otherwise, find one based on daysRange
  const matchedPackage = selectedPackage || (() => {
    if (!daysRange) return null;

    const [minDays, maxDays] = daysRange.split('-').map(Number);
    const matchingPackages = guide.packages?.filter(pkg =>
      pkg.days >= minDays && pkg.days <= maxDays
    );

    // Return the first matching package (or you could implement logic to choose the "best" one)
    return matchingPackages?.length > 0 ? matchingPackages[0] : null;
  })();

  // Check if it's a premium package
  const isPremiumPackage = matchedPackage?.type === 'premium';

  // Calculate price based on matched package or fallback to daily rate
  let pricePerPerson;
  let totalPrice;
  let numDays;
  let daysLabel;

  if (matchedPackage) {
    // Use package price
    pricePerPerson = Number(matchedPackage.price[category] || matchedPackage.price.individual || 0);
    numDays = matchedPackage.days; // Use actual days from package
    const baseCount = peopleRange ? parseInt(peopleRange.split('-')[0]) || 1 : 1;
    totalPrice = pricePerPerson * Math.max(1, baseCount);
    daysLabel = `${numDays} day${numDays > 1 ? 's' : ''}`; // e.g., "3 days"
  } else {
    // Fallback to daily rate calculation
    pricePerPerson = Number(guide.price[category] || guide.price.individual || 0);
    // If daysRange is like "3-5", use the max days for calculation
    if (daysRange && daysRange.includes('-')) {
      numDays = parseInt(daysRange.split('-')[1]) || 1;
    } else {
      numDays = 1; // Default
    }
    const baseCount = peopleRange ? parseInt(peopleRange.split('-')[0]) || 1 : 1;
    const numPeople = Math.max(1, baseCount);
    totalPrice = pricePerPerson * numPeople * numDays;
    daysLabel = daysRange ? `${daysRange} days` : 'Custom days';
  }

  const baseCount = peopleRange ? parseInt(peopleRange.split('-')[0]) || 1 : 1;
  const numPeople = Math.max(1, baseCount);
  const peopleText = category === 'couple' ? 'couple' : 'person';
  const router = useRouter();

  // Function to get package type label
  const getCategoryLabel = () => {
    switch (category) {
      case 'individual': return 'Individual';
      case 'couple': return 'Couple';
      case 'group': return 'Group';
      default: return 'Individual';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        ease: [0.25, 0.8, 0.25, 1],
      }}
      whileHover={{
        scale: 1.02,
        transition: { type: 'spring', stiffness: 250, damping: 18 },
      }}
      className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${isPremiumPackage ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white' : 'border-gray-200 md:border-transparent'} hover:shadow-lg transition-all`}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Side (80%) */}
        <div className="w-full md:w-4/5 p-4 sm:p-6">
          {/* Premium Package Badge */}
          {isPremiumPackage && (
            <div className="flex items-center gap-1.5 mb-3 inline-flex bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-3 py-1 rounded-full">
              <Crown className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Premium Package</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
            {/* Logo */}
            <div className="flex-shrink-0 self-center sm:self-start">
              <div className={`rounded-lg w-16 h-16 flex items-center justify-center ${isPremiumPackage ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border border-amber-200' : 'bg-gray-200'}`}>
                {isPremiumPackage ? (
                  <Crown className="h-6 w-6 text-amber-500" />
                ) : (
                  <span className="text-gray-500 text-xs text-center">Logo</span>
                )}
              </div>
            </div>

            {/* Guide Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className={`text-lg sm:text-xl font-bold ${isPremiumPackage ? 'text-gray-900' : 'text-gray-800'}`}>
                  {guide.name}
                  {isPremiumPackage && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Premium</span>}
                </h3>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full self-start sm:self-auto ${isPremiumPackage ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200' : 'bg-green-50'}`}>
                  <Star className={`h-4 w-4 ${isPremiumPackage ? 'text-amber-500 fill-amber-500' : 'text-green-600 fill-green-600'}`} />
                  <span className={`text-sm font-medium ${isPremiumPackage ? 'text-amber-800' : 'text-green-800'}`}>
                    {guide.rating} ({guide.reviews} reviews)
                  </span>
                </div>
              </div>

              <p className={`mt-1 text-sm sm:text-base ${isPremiumPackage ? 'text-gray-700' : 'text-gray-600'}`}>{guide.bio}</p>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className={`h-4 w-4 ${isPremiumPackage ? 'text-blue-600' : 'text-blue-500'}`} />
                  <span className={`text-xs sm:text-sm ${isPremiumPackage ? 'text-gray-800 font-medium' : 'text-gray-700'} capitalize`}>
                    {guide.location}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className={`h-4 w-4 ${isPremiumPackage ? 'text-purple-600' : 'text-purple-500'}`} />
                  <span className={`text-xs sm:text-sm ${isPremiumPackage ? 'text-gray-800 font-medium' : 'text-gray-700'}`}>
                    {guide.touristsHandled}+ trips
                  </span>
                </div>
                <div className={`flex items-center gap-1.5 ${isPremiumPackage ? 'bg-gradient-to-r from-amber-50 to-yellow-50 px-2 py-1 rounded-lg border border-amber-100' : ''}`}>
                  <Calendar className={`h-4 w-4 ${isPremiumPackage ? 'text-amber-600' : 'text-amber-500'}`} />
                  <span className={`text-xs sm:text-sm ${isPremiumPackage ? 'text-amber-800 font-semibold' : 'text-gray-700'}`}>
                    {daysLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className={`h-4 w-4 ${isPremiumPackage ? 'text-green-600' : 'text-green-500'}`} />
                  <span className={`text-xs sm:text-sm ${isPremiumPackage ? 'text-gray-800 font-medium' : 'text-gray-700'}`}>
                    {numPeople} {peopleText}{numPeople > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-3 sm:items-start">
                <div>
                  <p className={`text-sm ${isPremiumPackage ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>
                    <span className="font-semibold">Package:</span>{' '}
                    {getCategoryLabel()}
                  </p>
                  {matchedPackage && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100">
                        {matchedPackage.label}
                      </span>
                      {matchedPackage.type && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-100">
                          {matchedPackage.type.charAt(0).toUpperCase() + matchedPackage.type.slice(1)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <div className={`inline-flex flex-col items-start sm:items-end px-3 py-2 rounded-lg w-full sm:w-auto ${isPremiumPackage ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200' : 'bg-green-50'}`}>
                    {matchedPackage ? (
                      <>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <span className={`text-sm font-semibold ${isPremiumPackage ? 'text-amber-800' : 'text-green-800'}`}>
                            Package Price:
                          </span>
                          <span className={`text-base sm:text-lg font-bold ${isPremiumPackage ? 'text-amber-700' : 'text-green-600'}`}>
                            ₹{pricePerPerson.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className={`text-xs ${isPremiumPackage ? 'text-amber-700' : 'text-gray-600'} mt-1`}>
                          For {numPeople} {peopleText}{numPeople > 1 ? 's' : ''} • {daysLabel}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <span className={`text-sm font-semibold ${isPremiumPackage ? 'text-amber-800' : 'text-green-800'}`}>
                            Price (per day):
                          </span>
                          <span className={`text-base sm:text-lg font-bold ${isPremiumPackage ? 'text-amber-700' : 'text-green-600'}`}>
                            ₹{pricePerPerson.toLocaleString('en-IN')}/{peopleText}
                          </span>
                        </div>
                        <p className={`text-sm ${isPremiumPackage ? 'text-amber-700' : 'text-gray-600'} mt-1`}>
                          <span className="font-semibold">Total:</span> ₹{totalPrice.toLocaleString('en-IN')}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (View Button) */}
        <div className={`w-full md:w-1/5 flex items-center justify-center p-3 sm:p-4 ${isPremiumPackage ? 'bg-gradient-to-b from-amber-400 to-yellow-400' : 'bg-green-300'}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const params = new URLSearchParams();
              params.set('category', category);
              params.set('daysRange', daysRange || '');

              const baseCount = peopleRange ? parseInt(peopleRange.split('-')[0]) || 1 : 1;
              params.set('count', baseCount);
              if (matchedPackage) {
                params.set('packageId', matchedPackage.id);
              }
              if (date) params.set('date', date.toISOString());
              router.push(`/user/trip/guidelist/tripdetails/${guide.id}?${params.toString()}`);
            }}
            className={`w-full py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${isPremiumPackage
                ? 'bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 text-amber-900 hover:text-amber-950 border border-amber-300'
                : 'bg-white hover:bg-[#d4f7d4] text-gray-600 hover:text-gray-900'
              }`}
          >
            {isPremiumPackage ? 'View Premium' : 'View Details'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GuideCard;