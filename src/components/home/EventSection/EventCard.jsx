'use client';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Calendar,
  Star,
  User,
  Ticket,
} from 'lucide-react';


const EventCard = ({ event,guides }) => {
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

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      className="flex w-full h-72 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
    >
      {/* Left Side (75%) */}
      <div className="w-3/4 flex flex-col">
        {/* Top 60% - Image */}
        <div className="relative h-[60%] w-full">
          <img
            src={event.image || '/images/EventCover.webp'}
            alt={event.name}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.src = '/images/events/default.jpg';
            }}
          />
          <div className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full shadow">
            {event.type}
          </div>
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded-full shadow flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            {event.rating}
          </div>
        </div>

        {/* Bottom 40% */}
        <div className="h-[40%] w-full flex justify-between items-center text-sm text-gray-700">
  {/* Left Section - Event and Guide Info */}
  <div className="flex flex-col justify-between h-full px-4 py-1">
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1 px-1 py-1">{event.name}</h2>
      <p className="text-gray-600 flex items-center gap-1 px-1 ">
        <User size={14} className="text-blue-500" />
        <span className="text-sm">Guided by {guides?.[0]?.name || "Local Guide"}</span>
      </p>
    </div>
    
    {/* Price moved to bottom left */}
<div className="inline-flex justify-center items-center bg-green-50 px-3 py-1.5 rounded-lg w-fit mx-1">
  <p className="text-xs text-gray-500 mr-2 whitespace-nowrap">Starting from :</p>
  <p className="text-xl font-bold text-green-600 whitespace-nowrap">
    ₹{event.price.toLocaleString('en-IN')}
  </p>
</div>
  </div>

  {/* Right Section - Event Details */}
  <div className="grid grid-cols-2 gap-y-4 gap-x-12 h-full py-3 px-2 ">
    {/* Date */}
    <div className="flex items-start gap-2">
      <Calendar className="text-blue-500 mt-0.5" size={16} />
      <div>
        <p className="text-xs text-gray-500">Date</p>
        <p className="text-sm font-medium">{formattedDate}</p>
      </div>
    </div>

    {/* Location */}
    <div className="flex items-start gap-2">
      <MapPin className="text-purple-500 mt-0.5" size={16} />
      <div>
        <p className="text-xs text-gray-500">Location</p>
        <p className="text-sm font-medium capitalize">{event.destinationId}</p>
      </div>
    </div>

    {/* Duration */}
    <div className="flex items-start gap-2">
      <Clock className="text-green-500 mt-0.5" size={16} />
      <div>
        <p className="text-xs text-gray-500">Duration</p>
        <p className="text-sm font-medium">{event.duration}</p>
      </div>
    </div>

    {/* Bookings */}
    <div className="flex items-start gap-2">
      <Ticket className="text-amber-500 mt-0.5" size={16} />
      <div>
        <p className="text-xs text-gray-500">Bookings</p>
        <p className="text-sm font-medium">
          {event.bookings} / {event.bookings + event.slotsLeft}
        </p>
      </div>
    </div>
  </div>
</div>
      </div>

      {/* Right Side (25%) */}
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

export default EventCard;
