'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const PhotoCard = ({ 
  images, 
  name, 
  description, 
  bgColor="bg-slate-900", 
  textColor="text-white",
  autoSlide = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  
  const nextSlide = useCallback((e) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback((e) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const toggleFlip = () => {
    // Only flip if the user did NOT just swipe
    if (!isSwiping.current) {
      setIsFlipped(!isFlipped);
    }
    isSwiping.current = false;
  };

  // Touch swipe handlers — only capture horizontal swipes, allow vertical scrolling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    const diffX = Math.abs(touchStartX.current - touchEndX.current);
    const diffY = Math.abs(touchStartY.current - e.touches[0].clientY);
    // If horizontal movement is dominant, it's a swipe — prevent page scroll
    if (diffX > diffY && diffX > 10) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (isFlipped) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50 && isSwiping.current) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  useEffect(() => {
    if (!autoSlide || isFlipped) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoSlide, isFlipped, images.length]);

  return (
    <div
      className="relative h-full w-full cursor-pointer touch-pan-y"
      onClick={toggleFlip}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {!isFlipped ? (
        <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg border border-gray-100 bg-gray-50">
          {/* Static Overlays - Now outside AnimatePresence so they don't slide */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 pointer-events-none" />
          
          <div className="absolute bottom-4 left-4 z-20 pr-16 bg-gradient-to-t from-black/20 to-transparent p-1 rounded-lg">
            <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-md">{name}</h3>
          </div>
          
          <div className="absolute bottom-3 right-3 z-20 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 text-white text-[10px] font-medium sm:hidden">
            tap
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={images[currentIndex]}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                loading="lazy"
                quality={75}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons - Also outside AnimatePresence */}
          <button
            onClick={(e) => prevSlide(e)}
            className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full z-30 opacity-0 hover:bg-black/50 transition-all pointer-events-auto"
            style={{ opacity: 1 }}
          >
            <ChevronLeft className="text-white" size={20} />
          </button>
          
          <button
            onClick={(e) => nextSlide(e)}
            className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full z-30 opacity-0 hover:bg-black/50 transition-all pointer-events-auto"
            style={{ opacity: 1 }}
          >
            <ChevronRight className="text-white" size={20} />
          </button>
          
          <div className="hidden md:flex absolute bottom-2 left-1/2 transform -translate-x-1/2 space-x-2 z-30">
            {images.map((_, imgIndex) => (
              <div
                key={imgIndex}
                className={`w-2 h-2 rounded-full transition-all ${currentIndex === imgIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 ${bgColor.includes('bg-') ? bgColor : `bg-gradient-to-br ${bgColor}`} ${textColor} p-6 rounded-xl shadow-lg border border-slate-700 overflow-y-auto`}
          >
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">{name}</h3>
            <p className="leading-relaxed">{description}</p>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default PhotoCard;