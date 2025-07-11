'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoCard = ({ 
  media,
  name,
  description,
  locations,
  color = "from-gray-900 to-gray-800",
  textColor = "text-white",
  isFlipped,
  onClick,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (!isFlipped) {
        videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isFlipped]);

  return (
    <div 
      className="relative h-full w-full cursor-pointer"
      onClick={onClick}
      aria-label={isFlipped ? 'Flip back to front' : 'Flip to see details'}
    >
      <AnimatePresence mode="popLayout">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: 0, opacity: 1 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5
            }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              <div className="absolute bottom-4 left-4 z-20">
                <h3 className="text-2xl font-bold text-white">{name}</h3>
                <p className="text-white/90 text-sm mt-1">Click to see details</p>
              </div>
              
              <video
                ref={videoRef}
                src={media.src}
                poster={media.poster}
                className="h-full w-full object-cover"
                loop
                muted
                playsInline
                autoPlay
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5
            }}
            className={`absolute inset-0 bg-gradient-to-br ${color} ${textColor} p-6 rounded-xl shadow-lg overflow-y-auto`}
          >
            <h3 className="text-2xl font-bold mb-4">{name}</h3>
            <p className="mb-4 leading-relaxed">{description}</p>
            <h4 className="font-semibold mb-2">Popular Locations:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {locations?.map((location, index) => (
                <li key={index}>{location}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoCard;