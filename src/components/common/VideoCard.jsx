'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VideoCard = ({ 
  media,
  name,
  description,
  locations,
  color="from-emerald-500 to-emerald-700",
  textColor="text-emerald-50",
  autoSlide = true,
  isFlipped: controlledFlipped,
  onClick
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef(null);
  const isControlled = typeof controlledFlipped !== 'undefined';
  const isFlipped = isControlled ? controlledFlipped : internalFlipped;
  const isVideo = media?.type === 'video';

  const toggleFlip = () => {
    if (isControlled) {
      onClick?.();
    } else {
      setInternalFlipped(!isFlipped);
    }
  };

  const nextSlide = useCallback(() => {
    if (isFlipped) return;
    setDirection(1);
    setCurrentIndex(prev => (prev + 1) % (Array.isArray(media) ? media.length : 1));
  }, [isFlipped, media]);

  // Handle auto-slide with proper cleanup
  useEffect(() => {
    if (!autoSlide || isFlipped) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(nextSlide, 7000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoSlide, isFlipped, nextSlide]);

  // Reset slide when flipped state changes
  useEffect(() => {
    if (!isFlipped) {
      setCurrentIndex(0);
    }
  }, [isFlipped]);

  const currentMedia = Array.isArray(media) ? media[currentIndex] : media;

  return (
    <div 
      className="relative h-full w-full cursor-pointer"
      onClick={toggleFlip}
      aria-label={isFlipped ? 'Flip back to front' : 'Flip to see details'}
    >
      <AnimatePresence mode="popLayout" custom={direction}>
        {!isFlipped ? (
          <motion.div
            key={`front-${currentIndex}`}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.5
            }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
              <div className="absolute bottom-4 left-4 z-20">
                <h3 className="text-2xl font-bold text-white">{name}</h3>
                {Array.isArray(media) && (
                  <div className="flex space-x-2 mt-2">
                    {media.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`h-1 w-4 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              {isVideo ? (
                <video
                  src={currentMedia?.src}
                  poster={currentMedia?.poster}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={currentMedia?.src}
                  alt={name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
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
            <p className="mb-4 text-left">{description}</p>
            <h4 className="font-semibold mb-2 text-left">Popular Locations:</h4>
            <ul className="list-disc pl-5 space-y-1 text-left">
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