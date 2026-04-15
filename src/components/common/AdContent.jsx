'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// Promotions data
const promotions = [
  {
    id: 1,
    sponsor: "Sponsored",
    title: "Fly Emirates",
    subtitle: "Business Class upgrades from $999",
    cta: "Book Flight",
    colors: {
      bg: "from-red-600 to-red-800",
      text: "text-white",
      button: "bg-white/20 hover:bg-white/30"
    },
    image: "/images/emirate.jpg"
  },
  {
    id: 2,
    sponsor: "Sponsored",
    title: "The Lalit Palace",
    subtitle: "15% off heritage suites this season",
    cta: "View Suites",
    colors: {
      bg: "from-amber-600 to-amber-800",
      text: "text-white",
      button: "bg-amber-500/20 hover:bg-amber-500/30"
    },
    image: "/images/lalit.jpg"
  },
  {
    id: 3,
    sponsor: "Sponsored",
    title: "Mountain Courses",
    subtitle: "Certified training with safety gear",
    cta: "Explore Courses",
    colors: {
      bg: "from-green-600 to-green-800",
      text: "text-white",
      button: "bg-green-500/20 hover:bg-green-500/30"
    },
    image: "/images/skiing.jpg"
  }
];

const curvePath = "M0,0 C80,120 120,80 200,0 H0";

export default function AdContent() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const isHorizontalSwipe = useRef(false);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide(prev => (prev === promotions.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide(prev => (prev === 0 ? promotions.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = false;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    const diffX = Math.abs(touchStartX.current - touchEndX.current);
    const diffY = Math.abs(touchStartY.current - e.touches[0].clientY);
    // Only consider it a swipe if horizontal movement dominates
    if (diffX > diffY && diffX > 15) {
      isHorizontalSwipe.current = true;
    }
  };
  const handleTouchEnd = () => {
    if (!isHorizontalSwipe.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <section className="relative -mt-4 mx-4">
      <div
        className="w-full md:w-[96%] mx-auto relative overflow-hidden rounded-2xl shadow-2xl touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >

        <AnimatePresence custom={direction} mode="wait">
          {promotions.map((promo, index) =>
            index === currentSlide && (
              <motion.div
                key={promo.id}
                initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                animate={{
                  x: 0,
                  opacity: 1,
                  transition: { type: "spring", damping: 30, stiffness: 200 }
                }}
                exit={{
                  x: direction > 0 ? -300 : 300,
                  opacity: 0,
                  transition: { duration: 0.3 }
                }}
                className={`relative flex flex-col md:flex-row-reverse w-full bg-gradient-to-r ${promo.colors.bg} ${promo.colors.text} pb-10 md:pb-0`}
              >
                {/* Sponsor Label */}
                <motion.span
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-3 right-3 md:top-4 md:right-4 bg-black/80 text-white text-[10px] md:text-xs px-2 py-1 rounded-full z-30"
                >
                  {promo.sponsor}
                </motion.span>

                {/* Curve - hidden on mobile */}
                <svg
                  className="hidden md:block absolute left-[35%] h-full w-[240px] lg:w-[280px]"
                  viewBox="0 0 200 100"
                  preserveAspectRatio="none"
                >
                  <path d={curvePath} fill="white" />
                </svg>

                {/* Image */}
                <div className="w-full h-40 sm:h-48 md:h-auto md:w-[70%] relative overflow-hidden mx-auto md:mx-0">
                  <Image
                    src={promo.image}
                    alt={promo.title}
                    fill
                    className="object-cover"
                    loading="lazy"
                    quality={75}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent z-10" />
                </div>

                {/* Content and Button */}
                <div className="w-full md:w-[30%] p-4 sm:p-6 flex flex-col justify-start md:justify-center items-center md:items-start text-center md:text-left z-20 mt-2 md:mt-0 flex-1">
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2">
                    {promo.title}
                  </h3>
                  <p className="text-xs sm:text-sm mb-3 sm:mb-4">{promo.subtitle}</p>

                  <button
                    className={`px-4 py-2 rounded-md font-medium backdrop-blur-sm transition-all ${promo.colors.button} border border-white/30 text-sm sm:text-base`}
                  >
                    {promo.cta}
                  </button>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {promotions.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-1 h-1 sm:w-2 sm:h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              initial={{ scale: 0.8 }}
              animate={{
                scale: index === currentSlide ? 1.2 : 1,
                transition: { type: "spring", stiffness: 500 }
              }}
              whileHover={{ scale: 1.2 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="group">
          <motion.button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/10 p-2 rounded-full z-20"
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="text-white w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/10 p-2 rounded-full z-20"
            initial={{ opacity: 0, x: 10 }}
            whileHover={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0.3)" }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="text-white w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
