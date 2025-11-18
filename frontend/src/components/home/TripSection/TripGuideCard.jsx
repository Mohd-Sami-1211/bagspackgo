'use client';
import { motion } from 'framer-motion';
import { Star, MapPin, Users, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

const GuideCard = ({ guide, category, days, count = 1, date }) => {
  const pricePerPerson = Number(guide.price[category] || guide.price.individual || 0);
  const numDays = Math.max(1, Number(days) || 1);
  const numPeople = Math.max(1, Number(count) || 1);
  const totalPrice = pricePerPerson * numPeople * numDays;
  const peopleText = category === 'couple' ? 'couple' : 'person';
  const router = useRouter();

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
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 md:border-transparent hover:shadow-lg transition-all"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Side (80%) */}
        <div className="w-full md:w-4/5 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
            {/* Logo */}
            <div className="flex-shrink-0 self-center sm:self-start">
              <div className="bg-gray-200 rounded-lg w-16 h-16 flex items-center justify-center">
                <span className="text-gray-500 text-xs text-center">Logo</span>
              </div>
            </div>

            {/* Guide Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{guide.name}</h3>
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full self-start sm:self-auto">
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {guide.rating} ({guide.reviews} reviews)
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mt-1 text-sm sm:text-base">{guide.bio}</p>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-xs sm:text-sm text-gray-700 capitalize">{guide.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-xs sm:text-sm text-gray-700">
                    {guide.touristsHandled}+ trips
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <span className="text-xs sm:text-sm text-gray-700">
                    {numDays} day{numDays > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-xs sm:text-sm text-gray-700">{numPeople}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-3 sm:items-start">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Package:</span>{' '}
                    {category === 'couple' ? 'Couple' : 'Individual'}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-flex flex-col items-start sm:items-end bg-green-50 px-3 py-2 rounded-lg w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <span className="text-sm font-semibold text-green-800">Price (per day):</span>
                      <span className="text-base sm:text-lg font-bold text-green-600">
                        ₹{pricePerPerson.toLocaleString('en-IN')}/{peopleText}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Total:</span> ₹{totalPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (View Button) */}
        <div className="w-full md:w-1/5 bg-green-300 flex items-center justify-center p-3 sm:p-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const params = new URLSearchParams();
              params.set('category', category);
              params.set('days', days);
              params.set('count', count);
              if (date) params.set('date', date.toISOString());
              router.push(`/user/trip/guidelist/tripdetails/${guide.id}?${params.toString()}`);
            }}
            className="w-full py-2 sm:py-3 bg-white hover:bg-[#d4f7d4] text-gray-600 hover:text-gray-900 font-medium rounded-lg transition-colors text-sm sm:text-base"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GuideCard;
