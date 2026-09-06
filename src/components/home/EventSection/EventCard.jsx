'use client';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Star, Ticket, Clock, Users, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Helper to calculate "time ago"
const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Recently';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  
  if (seconds < 60) return 'Just now';
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  return Math.floor(interval) + 'm ago';
};

const EventCard = ({ event }) => {
  const router = useRouter();
  const isPast = event.isPast || false;
  const isSoldOut = !isPast && (event.slotsLeft <= 0);

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const publishedAgo = formatTimeAgo(event.createdAt);

  const handleClick = (e) => {
    // Prevent routing if user clicked something else, though the whole card is a hit target
    router.push(`/user/events/eventdetails/${event.id}`);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      onClick={handleClick}
      className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-neutral-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative"
    >
      {/* Image Section */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-neutral-100">
        <img
          src={event.image || '/images/events/default.jpg'}
          alt={event.name}
          loading="lazy"
          draggable={false}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isPast ? 'grayscale-[40%]' : ''}`}
          onError={(e) => { e.target.src = '/images/events/default.jpg'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2 z-10">
          {isPast ? (
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-neutral-800/90 text-white rounded-full backdrop-blur-sm">
              Completed
            </span>
          ) : (
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/90 text-white rounded-full backdrop-blur-sm shadow-lg">
              {event.type || 'Event'}
            </span>
          )}
        </div>

        {/* Published Time (Top Right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-medium text-white/90 z-10">
          <Clock className="w-3 h-3" />
          {publishedAgo}
        </div>

        {/* Rating Badge (Bottom Right over image) */}
        {event.rating > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-amber-600 z-10 shadow-lg">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {event.rating?.toFixed(1)}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-5 flex-grow">
        
        {/* Organizer Row with Logo */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-200">
            {/* Fallback avatar icon, can be replaced with an actual <img> tag if event.guideLogo exists */}
            <Users className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide truncate">
            {event.guideName || 'Local Organizer'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-neutral-900 leading-snug line-clamp-2 mb-4 group-hover:text-emerald-700 transition-colors">
          {event.name}
        </h3>

        {/* Details Grid (3 columns: Location, Duration, Slots) */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-neutral-600 font-medium mb-5">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="truncate capitalize">{event.destination || event.destinationId}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-500" />
            <span>{event.duration || '1 day'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-amber-500" />
            {isPast ? (
              <span>Ended</span>
            ) : isSoldOut ? (
              <span className="text-red-500 font-bold">Sold out</span>
            ) : (
              <span>{event.slotsLeft} slots left</span>
            )}
          </div>
        </div>

        {/* Footer: Price + Button */}
        <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-0.5">Starting from</span>
            <span className="text-xl font-black text-neutral-900">
              ₹{event.price?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
          
          <button 
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white hover:bg-emerald-600 text-xs font-bold rounded-xl transition-all duration-300 group-hover:shadow-md"
            aria-label={`View details for ${event.name}`}
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
