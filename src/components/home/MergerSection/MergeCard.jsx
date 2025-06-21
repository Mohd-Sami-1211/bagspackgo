'use client';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, User, BadgeInfo } from 'lucide-react';

const MergeCard = ({ merger, guides }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2, ease: 'easeOut' },
    },
  };

  // Find guide by guideId
  const guide = Array.isArray(guides)
    ? guides.find(g => g.id === merger.guideId)
    : null;

  // Determine gradient for category
  const gradientBg =
    merger.category === 'Female Only'
      ? 'linear-gradient(to bottom, #ec4899, #f472b6)' // pink
      : merger.category === 'Male Only'
      ? 'linear-gradient(to bottom, #3b82f6, #60a5fa)' // blue
      : 'none';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      className="flex w-full h-44 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
    >
      {/* Left 75% with colored border via gradient */}
      <div
        className="w-3/4 p-[2px] rounded-l-xl bg-clip-padding bg-white"
        style={{ backgroundImage: gradientBg }}
      >
        <div className="h-full w-full bg-white rounded-l-xl flex flex-col justify-between">
          {/* Top Section */}
          <div className="h-[35%] bg-gray-50 px-5 py-3 flex items-center justify-between border-b border-gray-200 rounded-tl-xl">
            <div className="space-y-1">
              <p className="font-semibold text-gray-800">
                <span className="text-sm text-gray-600">Created by:</span> {merger.createdBy}
              </p>
              <p className="font-semibold text-sm text-gray-800">
                <span className="text-sm text-gray-600">Category:</span> {merger.category}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BadgeInfo className="text-blue-500" size={16} />
              <p className="text-xs font-medium text-gray-500">
                Merge ID: <span className="text-gray-800 font-bold">{merger.id}</span>
              </p>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="h-[65%] px-5 py-4 flex items-center justify-between">
            {/* Left - Grid */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="text-green-600" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Travel Date</p>
                  <p className="font-medium">{merger.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="text-blue-600" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Guide</p>
                  <p className="font-medium">{guide?.name || 'Guide Not Found'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="text-purple-600" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Members</p>
                  <p className="font-medium">{merger.members}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="text-red-500" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium capitalize">{merger.location}</p>
                </div>
              </div>
            </div>

            {/* Right - Price */}
            <div className="text-right">
              <p className="text-xs text-gray-500">Price / Person</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{merger.price.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right 25% */}
      <div className="w-1/4 bg-green-500 flex items-center justify-center p-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 bg-white hover:bg-[#d4f7d4] text-gray-700 hover:text-black font-semibold rounded-lg transition-colors"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MergeCard;
