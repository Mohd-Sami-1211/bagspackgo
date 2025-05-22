'use client';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, Award, User } from 'lucide-react';

const TrekGuideCard = ({ guide, trekId, individuals = 1 }) => {
  const trekPackage = Array.isArray(guide.trekPackages)
    ? guide.trekPackages.find(pkg => pkg?.trekId?.toString() === trekId?.toString())
    : null;

  const pricePerPerson = trekPackage?.price ?? 0;
  const duration = trekPackage?.duration ?? 'N/A';
  const totalPrice = pricePerPerson * individuals;

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
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
    >
      <div className="flex flex-col md:flex-row">
        {/* Left Side */}
        <div className="w-full md:w-4/5 p-6">
          <div className="flex items-start gap-5">
            {/* Guide Image */}
            <div className="flex-shrink-0">
              <div className="bg-gray-200 rounded-lg w-16 h-16 flex items-center justify-center overflow-hidden">
                {guide.image ? (
                  <img src={guide.image} alt={guide.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-xs text-center">Image</span>
                )}
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

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-700 capitalize">{guide.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-700">{duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-gray-700">{guide.touristsHandled || 0}+ treks</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">
                    {individuals} {individuals > 1 ? 'people' : 'person'}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-start">
                <div></div>
                <div className="text-right">
                  <div className="inline-flex flex-col items-end bg-green-50 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-green-800">Price/person:</span>
                      <span className="text-lg font-bold text-green-600">
                        ₹{pricePerPerson.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Total:</span>{' '}
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Button */}
        <div className="w-full md:w-1/5 bg-green-500 flex items-center justify-center p-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-white hover:bg-[#d4f7d4] text-green-600 hover:text-green-800 font-medium rounded-lg transition-colors"
          >
            View Details
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default TrekGuideCard;
