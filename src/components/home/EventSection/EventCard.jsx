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
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const EventCard = ({ event }) => {
  const router = useRouter();

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

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

  const publishTime = getTimeAgo(event.createdAt);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      className="flex flex-col sm:flex-row w-full bg-white rounded-2xl shadow-sm hover:shadow-lg overflow-hidden border border-neutral-200 transition-all duration-300"
    >
      {/* Left Side (100% mobile, 75% desktop) */}
      <div className="w-full sm:w-3/4 flex flex-col">
        {/* Top - Image */}
        <div className="relative h-48 sm:h-56 w-full bg-neutral-900 flex-shrink-0 overflow-hidden">
          {/* Clean image background */}
          <div className="hidden sm:block absolute inset-0 bg-neutral-950 transition-all" />
          <img
            src={event.image || '/images/EventCover.webp'}
            alt={event.name}
            className="relative z-10 w-full h-full object-cover sm:object-contain"
            onError={(e) => {
              e.target.src = '/images/events/default.jpg';
            }}
          />
          <div className="absolute z-20 top-3 left-3 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm backdrop-blur-md bg-opacity-90">
            {event.type}
          </div>
          {event.rating && event.rating > 0 ? (
            <div className="absolute z-20 top-3 right-3 bg-yellow-100/90 backdrop-blur-md text-yellow-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              {event.rating}
            </div>
          ) : null}
          {publishTime && (
            <div className="absolute z-20 bottom-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-md backdrop-blur-sm">
              Published {publishTime}
            </div>
          )}
        </div>

        {/* Bottom - Info */}
        <div className="flex-1 w-full flex flex-col p-4 sm:p-5 text-sm text-neutral-700">
          {/* Top Info Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-1 leading-tight line-clamp-1">{event.name}</h2>
              <p className="text-neutral-500 flex items-center gap-1.5">
                <User size={14} className="text-gray-900" />
                <span className="text-sm font-medium">
                  {(event.guide || event.guideId) ? (
                      <Link target="_blank" href={`/user/provider/${event.guide?._id || event.guideId || event.guide}`} className="hover:text-emerald-700 hover:underline" onClick={(e) => e.stopPropagation()}>
                          {event.guideName || "Local Guide"}
                      </Link>
                  ) : (event.guideName || "Local Guide")}
                </span>
              </p>
            </div>
            {/* Price */}
            <div className="inline-flex items-center bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg flex-shrink-0">
              <span className="text-xs text-neutral-500 mr-1.5">Starting from:</span>
              <span className="text-lg font-bold text-gray-900">
                {"\u20B9"}{event.price?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-4 w-full mt-auto">
            {/* Date */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Calendar className="text-blue-500" size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-0.5">Date</p>
                <p className="text-sm font-bold text-neutral-800 truncate">{formattedDate}</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="text-purple-500" size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-0.5">Location</p>
                <p className="text-sm font-bold text-neutral-800 capitalize truncate">{event.destination || event.destinationId}</p>
              </div>
            </div>

            {/* Duration */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Clock className="text-gray-900" size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-0.5">Duration</p>
                <p className="text-sm font-bold text-neutral-800 truncate">{event.duration}</p>
              </div>
            </div>

            {/* Bookings */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Ticket className="text-amber-500" size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-0.5">Occupancy</p>
                <p className="text-sm font-bold text-neutral-800 truncate">
                  {event.bookings || 0} / {event.totalSlots || ((event.bookings || 0) + (event.slotsLeft || 0))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side CTA */}
      <div className="w-full sm:w-1/4 bg-gradient-to-br from-gray-50 to-gray-100/30 border-t sm:border-t-0 sm:border-l border-neutral-100 flex flex-col items-center justify-center p-5 sm:p-6 gap-3">
        {event.slotsLeft > 0 ? (
          <div className="hidden sm:flex flex-col items-center text-center mb-2">
            <span className="text-gray-900 font-bold mb-1">Available Now</span>
            <span className="text-xs text-neutral-500">Secure your spot today</span>
          </div>
        ) : (
          <div className="hidden sm:flex flex-col items-center text-center mb-2">
            <span className="inline-flex items-center gap-1.5 text-neutral-500 font-bold mb-1">
              Sold Out
            </span>
            <span className="text-xs text-neutral-400">No slots remaining</span>
          </div>
        )}
        <Button
          onClick={handleViewDetails}
          className="w-full h-11 text-[13px] rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          View Details
        </Button>
      </div>
    </motion.div>
  );
};

export default EventCard;

