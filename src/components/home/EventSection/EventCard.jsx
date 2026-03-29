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
import { useRouter } from 'next/navigation';


const EventCard = ({ event, guides }) => {
  const router = useRouter();
  const handleViewDetails = () => {
    router.push(`/user/events/eventdetails/${event.id}`);
  };
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

  const matchedGuide = guides?.find(g => g.id === event.eventId);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      className="flex flex-col sm:flex-row w-full sm:h-72 bg-white rounded-xl shadow-md overflow-hidden border border-neutral-100"
    >
      {/* Left Side (100% mobile, 75% desktop) */}
      <div className="w-full sm:w-3/4 flex flex-col">
        {/* Top - Image */}
        <div className="relative h-44 sm:h-[60%] w-full">
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

        {/* Bottom - Info */}
        <div className="flex-1 w-full flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-neutral-700">
          {/* Left - Event and Guide Info */}
          <div className="flex flex-col justify-between px-4 py-3 sm:py-1 sm:h-full">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-1">{event.name}</h2>
              <p className="text-neutral-600 flex items-center gap-1">
                <User size={14} className="text-blue-500" />
                <span className="text-sm">{matchedGuide?.name || "Local Guide"}</span>
              </p>
            </div>

            {/* Price */}
            <div className="inline-flex items-center bg-green-50 px-3 py-1.5 rounded-lg w-fit mt-2 sm:mt-0 sm:mx-1">
              <p className="text-xs text-neutral-500 mr-2 whitespace-nowrap">Starting from :</p>
              <p className="text-lg sm:text-xl font-bold text-green-600 whitespace-nowrap">
                ₹{event.price.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Right - Event Details Grid */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 sm:gap-x-12 px-4 pb-3 sm:py-3 sm:px-2 sm:h-full sm:content-center">
            {/* Date */}
            <div className="flex items-start gap-2">
              <Calendar className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="text-xs text-neutral-500">Date</p>
                <p className="text-sm font-medium">{formattedDate}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin className="text-purple-500 mt-0.5 flex-shrink-0" size={16} />
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">Location</p>
                <p className="text-sm font-medium capitalize truncate">{event.destinationId}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-2">
              <Clock className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="text-xs text-neutral-500">Duration</p>
                <p className="text-sm font-medium">{event.duration}</p>
              </div>
            </div>

            {/* Bookings */}
            <div className="flex items-start gap-2">
              <Ticket className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="text-xs text-neutral-500">Bookings</p>
                <p className="text-sm font-medium">
                  {event.bookings} / {event.bookings + event.slotsLeft}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side (full width button on mobile, 25% on desktop) */}
      <div className="w-full sm:w-1/4 bg-green-300 flex items-center justify-center p-3 sm:p-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleViewDetails}
          className="w-full py-2.5 sm:py-3 bg-white hover:bg-[#d4f7d4] text-neutral-700 hover:text-black font-semibold rounded-lg transition-colors text-sm"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EventCard;
