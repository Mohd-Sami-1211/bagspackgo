'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const PhotoCard = ({ 
  images, 
  name, 
  description, 
  bgColor="from-emerald-500 to-emerald-700", 
  textColor="text-emerald-50",
  autoSlide = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(1);
  
  const nextSlide = (e) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Auto slide effect
  useEffect(() => {
    if (!autoSlide || isFlipped) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Slowed down from 4000 to 5000

    return () => clearInterval(interval);
  }, [autoSlide, isFlipped, images.length]);

  return (
    <div className="relative h-full w-full cursor-pointer" onClick={toggleFlip}>
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
              duration: 0.8
            }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
              <div className="absolute bottom-4 left-4 z-20">
                <h3 className="text-2xl font-bold text-white">{name}</h3>
              </div>
              
              <Image
                src={images[currentIndex]}
                alt={name}
                fill
                className="object-cover"
                priority
              />

              <button
                onClick={(e) => prevSlide(e)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full z-30 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="text-white" size={20} />
              </button>
              <button
                onClick={(e) => nextSlide(e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full z-30 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="text-white" size={20} />
              </button>
              
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
                {images.map((_, imgIndex) => (
                  <div
                    key={imgIndex}
                    className={`w-2 h-2 rounded-full transition-all ${currentIndex === imgIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.8
            }}
            className={`absolute inset-0 bg-gradient-to-br ${bgColor} ${textColor} p-6 rounded-xl shadow-lg overflow-y-auto`}
          >
            <h3 className="text-2xl font-bold mb-4">{name}</h3>
            <p>{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoCard;