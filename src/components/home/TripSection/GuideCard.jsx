'use client';
import { motion } from 'framer-motion';
import { Star, MapPin, Users, Calendar } from 'lucide-react';

const GuideCard = ({ guide, category, days, count = 1 }) => {
  // Get price based on package type with fallbacks
  const pricePerPerson = Number(guide.price[category] || guide.price.individual || 0);
  const numDays = Math.max(1, Number(days) || 1);
  const numPeople = Math.max(1, Number(count) || 1);
  
  // Calculate total price
  const totalPrice = pricePerPerson * numPeople * numDays;
  const peopleText = category === 'couple' ? 'couple' : 'person';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Side (80%) */}
        <div className="w-full md:w-4/5 p-6">
          <div className="flex items-start gap-5">
            {/* Logo Placeholder */}
            <div className="flex-shrink-0">
              <div className="bg-gray-200 rounded-lg w-16 h-16 flex items-center justify-center">
                <span className="text-gray-500 text-xs text-center">Logo</span>
              </div>
            </div>

            {/* Guide Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xl font-bold text-gray-800">{guide.name}</h3>
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {guide.rating} ({guide.reviews} reviews)
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mt-1 text-sm">{guide.bio}</p>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-700 capitalize">{guide.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{guide.touristsHandled}+ trips</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-gray-700">{numDays} day{numDays > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-start">
                {/* Left side - Package type */}
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Package:</span> {category === 'couple' ? 'Couple' : 'Individual'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">For:</span> {numPeople} {category === 'couple' ? 'couples' : 'people'}
                  </p>
                </div>
                
                {/* Right side - Pricing */}
                <div className="text-right">
                  <div className="inline-flex flex-col items-end bg-green-50 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-green-800">Price (per day):</span>
                      <span className="text-lg font-bold text-green-600">
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

        {/* Right Side (20%) - View Button */}
        <div className="w-full md:w-1/5 bg-green-300 flex items-center justify-center p-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-white hover:bg-[#d4f7d4] text-gray-600 hover:text-gray-900 font-medium rounded-lg transition-colors"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default GuideCard;