'use client';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Star, Users, Ticket, ArrowRight } from 'lucide-react';

const EventCard = ({ event }) => {
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 }
  };

  // Format date
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      className="flex flex-col md:flex-row h-auto md:h-72 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
    >
      {/* Left Section (Image + Details) */}
      <div className="w-full md:w-4/5 flex flex-col">
        {/* Event Image - Full width on top */}
        <div className="w-full h-40 md:h-48 bg-gray-200 overflow-hidden">
          <img 
            src={`/images/EventCover.webp`} 
            alt={event.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/images/events/default.jpg';
            }}
          />
        </div>
        
        {/* Event Details - Below image */}
        <div className="p-4 flex flex-col justify-between flex-grow">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{event.name}</h3>
                <div className="flex items-center mt-1">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {event.type}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center bg-green-50 px-2 py-1 rounded-md">
                <Star className="text-yellow-400 mr-1" size={14} fill="currentColor" />
                <span className="text-sm font-medium">{event.rating}</span>
              </div>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="mr-2 text-blue-500" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium">{formattedDate}</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="mr-2 text-purple-500" size={16} />
                <div>
                  <p className="text-sm font-medium capitalize">{event.destinationId}</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Users className="mr-2 text-green-500" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium">{event.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Ticket className="mr-2 text-amber-500" size={16} />
                <div>
                  <p className="text-xs text-gray-500">Bookings</p>
                  <p className="text-sm font-medium">{event.bookings}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Highlighted Price and Slots Section */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-green-50 p-2 rounded-lg">
                <div className="flex items-center">
                  <Users className="text-green-600 mr-2" size={16} />
                  <div>
                    <p className="text-xs text-gray-600">Slots left</p>
                    <p className="text-sm font-bold text-green-700">{event.slotsLeft}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">Starting from</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{event.price.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Section (25%) - View Details Button */}
     <div className="w-full md:w-1/4 bg-green-500 flex items-center justify-center p-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 bg-white hover:bg-[#d4f7d4] text-gray-600 hover:text-gray-900 font-medium rounded-lg transition-colors"
          >
            View Details
          </motion.button>
        </div>
    </motion.div>
  );
};

export default EventCard;