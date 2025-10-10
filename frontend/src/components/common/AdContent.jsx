'use client';
import { useState, useCallback, useEffect } from 'react';
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

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide(prev => (prev === promotions.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide(prev => (prev === 0 ? promotions.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative -mt-20 mx-4 z-10">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-7xl mx-auto h-44">
        <AnimatePresence custom={direction} mode="wait">
          {promotions.map((promo, index) =>
            index === currentSlide && (
              <motion.div
                key={promo.id}
                initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                animate={{ 
                  x: 0, 
                  opacity: 1,
                  transition: {
                    type: "spring",
                    damping: 25,
                    stiffness: 120
                  }
                }}
                exit={{ 
                  x: direction > 0 ? -300 : 300, 
                  opacity: 0,
                  transition: {
                    duration: 0.4
                  }
                }}
                className={`absolute inset-0 flex bg-gradient-to-r ${promo.colors.bg} ${promo.colors.text}`}
              >
                <motion.span
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-4 right-4 bg-black/80 text-white text-xs px-2 py-1 rounded-full z-30"
                >
                  {promo.sponsor}
                </motion.span>

                <svg
                  className="absolute left-[30%] h-full z-10"
                  viewBox="0 0 200 100"
                  preserveAspectRatio="none"
                >
                  <path d={curvePath} fill="white" />
                </svg>

                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1,
                    transition: {
                      delay: 0.2,
                      type: "spring",
                      stiffness: 60
                    }
                  }}
                  className="w-[30%] p-6 flex flex-col justify-center z-20"
                >
                  <motion.h3
                    className="text-2xl font-bold mb-2"
                    initial={{ y: 20 }}
                    animate={{ 
                      y: 0,
                      transition: {
                        delay: 0.4,
                        type: "spring",
                        stiffness: 100
                      }
                    }}
                  >
                    {promo.title}
                  </motion.h3>
                  <motion.p
                    className="text-sm mb-4"
                    initial={{ y: 20 }}
                    animate={{ 
                      y: 0,
                      transition: {
                        delay: 0.5,
                        type: "spring",
                        stiffness: 100
                      }
                    }}
                  >
                    {promo.subtitle}
                  </motion.p>
                  <motion.button
                    className={`px-5 py-2 rounded-md font-medium backdrop-blur-sm transition-all ${promo.colors.button} border border-white/30`}
                    initial={{ scale: 0.7 }}
                    animate={{ 
                      scale: 1,
                      transition: {
                        delay: 0.6,
                        type: "spring",
                        stiffness: 200
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {promo.cta}
                  </motion.button>
                </motion.div>

                <motion.div
                  className="w-[70%] relative overflow-hidden"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: 1,
                    transition: {
                      delay: 0.3,
                      type: "spring",
                      stiffness: 60
                    }
                  }}
                >
                  <div className="absolute inset-0">
                    <Image
                      src={promo.image}
                      alt={promo.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent z-10" />
                </motion.div>
              </motion.div>
            )
          )}
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {promotions.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
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
            whileHover={{ 
              opacity: 1, 
              x: 0,
              backgroundColor: "rgba(0,0,0,0.3)"
            }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="text-white" size={24} />
          </motion.button>
          <motion.button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/10 p-2 rounded-full z-20"
            initial={{ opacity: 0, x: 10 }}
            whileHover={{ 
              opacity: 1, 
              x: 0,
              backgroundColor: "rgba(0,0,0,0.3)"
            }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="text-white" size={24} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}