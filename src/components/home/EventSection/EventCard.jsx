'use client';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Star, Ticket, Clock, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getEventSlotsLabel, isEventSoldOut } from '@/lib/eventSlots';
import EventPosterImage from './EventPosterImage';

const MotionLink = motion.create(Link);

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
  const isPast = event.isPast || false;
  const isSoldOut = !isPast && isEventSoldOut(event);
  const slotsLabel = isPast ? 'Ended' : getEventSlotsLabel(event);

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

  const publishedAgo = formatTimeAgo(event.createdAt);

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <MotionLink
      variants={cardVariants}
      href={`/user/events/eventdetails/${event.id}`}
      className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-neutral-100 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 relative"
    >
      <div className="h-56 w-full shrink-0 border-b border-neutral-100 bg-[#eef3ef] p-2 sm:h-60">
        <EventPosterImage event={event} />
      </div>

      <div className="flex flex-grow flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {isPast ? (
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-neutral-700">
              Completed
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-800">
              {event.type || 'Event'}
            </span>
          )}
          {event.rating > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {event.rating.toFixed(1)}
            </span>
          )}
          <span suppressHydrationWarning className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-medium text-neutral-600">
            <Clock className="h-3 w-3" />
            {publishedAgo}
          </span>
        </div>

        {/* Organizer Row with Logo */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center overflow-hidden border border-emerald-100 flex-shrink-0">
            {(event.guideLogo || event.logo || event.companyLogo) ? (
              <img 
                src={event.guideLogo || event.logo || event.companyLogo} 
                alt={event.guideName || 'Organizer'} 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
              />
            ) : null}
            <Users className="w-3.5 h-3.5 text-emerald-600" style={{ display: (event.guideLogo || event.logo || event.companyLogo) ? 'none' : 'block' }} />
          </div>
          <span className="text-xs font-semibold text-neutral-600 truncate">
            {event.guideName || 'Local Organizer'}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-4 line-clamp-2 font-serif text-2xl font-normal leading-[1.08] tracking-[-0.025em] text-[#17372f] transition-colors group-hover:text-[#1d6b55]">
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
          {slotsLabel && (
            <div className="flex items-center gap-1.5">
              <Ticket className="w-4 h-4 text-amber-500" />
              <span className={isSoldOut ? 'text-red-500 font-bold' : undefined}>{slotsLabel}</span>
            </div>
          )}
        </div>

        {/* Footer: Price + Button */}
        <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-0.5">Starting from</span>
            <span className="font-serif text-2xl text-[#17372f]">
              ₹{event.price?.toLocaleString('en-IN') || '0'}
            </span>
          </div>
          
          <span
            className="flex items-center gap-1.5 rounded-xl bg-[#1d6b55] px-4 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-[#155240] group-hover:shadow-md"
            aria-label={`View details for ${event.name}`}
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </MotionLink>
  );
};

export default EventCard;
