'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import {
  ChevronLeft, ChevronRight, Star, ArrowRight,
  Mountain, Waves, Landmark
} from 'lucide-react';
import AdContent from '../../common/AdContent';
import PhotoCard from '../../common/PhotoCard';
import VideoCard from '../../common/VideoCard';
import AboutUs from '../../common/AboutUs';
import FAQ from '../../common/FAQ';
import TripSearchInput from './TripSearchInput';

const dummyTestimonials = [
  { name: 'Priya Sharma', location: 'Delhi', rating: 5, text: 'Our houseboat stay on Dal Lake was straight out of a dream. Absolutely magical honeymoon!', image: 'https://images.unsplash.com/photo-1494790108755-2616b612b402?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
  { name: 'Rajesh Kumar', location: 'Mumbai', rating: 5, text: 'Best family vacation ever! The skiing instructor in Gulmarg was so patient with the kids.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
  { name: 'Sarah Johnson', location: 'USA', rating: 5, text: 'As a solo traveler I felt completely safe. The Tarsar Marsar trek was the highlight of my year!', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
  { name: 'Amit Patel', location: 'Bangalore', rating: 5, text: 'Our guide knew every hidden photo spot. The sunrise at Doodhpathri was worth waking up at 4 AM!', image: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
];

// ── Static data ────────────────────────────────────────────
const destCategories = [
  {
    id: 'mountains',
    label: 'Mountain Valleys',
    icon: Mountain,
    places: [
      { name: 'Gulmarg', images: ['/images/Gulmarg1.jpeg', '/images/Gulmarg2.jpeg', '/images/Gulmarg3.jpeg', '/images/Gulmarg4.jpeg'], description: "Known as the 'Meadow of Flowers', Gulmarg is a premier ski destination with the world's highest gondola ride." },
      { name: 'Sonmarg', images: ['/images/Sonmarg1.jpeg', '/images/Sonmarg2.jpeg', '/images/Sonmarg3.jpeg', '/images/Sonmarg4.jpeg'], description: "The 'Meadow of Gold' is the gateway to Himalayan high-altitude lakes like Vishansar and Krishansar." },
      { name: 'Pahalgam', images: ['/images/Pahalgam1.jpeg', '/images/Pahalgam2.jpeg', '/images/Pahalgam3.jpeg', '/images/Pahalgam4.jpg'], description: "The 'Valley of Shepherds' — where the Lidder River flows through pine forests and alpine meadows." },
    ]
  },
  {
    id: 'nature',
    label: 'Natural Wonders',
    icon: Waves,
    places: [
      { name: 'Doodhpathri', images: ['/images/Doodhpathri1.jpeg', '/images/Doodhpathri2.jpeg', '/images/Doodhpathri3.jpeg', '/images/Doodhpathri4.jpeg'], description: "This 'Valley of Milk' gets its name from the frothy white appearance of its gushing streams." },
      { name: 'Betaab Valley', images: ['/images/Pahalgam1.jpeg', '/images/Pahalgam2.jpeg', '/images/Pahalgam3.jpeg', '/images/Pahalgam4.jpg'], description: "Named after the Bollywood movie 'Betaab', known for lush meadows and crystal-clear streams." },
      { name: 'Aru Valley', images: ['/images/Sonmarg1.jpeg', '/images/Sonmarg2.jpeg', '/images/Sonmarg3.jpeg', '/images/Sonmarg4.jpeg'], description: "A picturesque valley and the starting point for the famous Kolahoi Glacier trek." },
    ]
  },
  {
    id: 'culture',
    label: 'Cultural Gems',
    icon: Landmark,
    places: [
      { name: 'Mughal Gardens', images: ['/images/MG-1.jpeg', '/images/MG-2.jpeg', '/images/MG-3.jpeg', '/images/MG-4.jpeg'], description: "Nishat Bagh, Shalimar Bagh, and Chashme Shahi — Persian-style terraced gardens with cascading fountains." },
      { name: 'Dal Lake', images: ['/images/Dal1.jpeg', '/images/Dal2.jpeg', '/images/Dal3.jpeg', '/images/Dal4.jpeg'], description: "The 'Jewel of Kashmir' — famous for colourful shikaras, floating houseboats, and morning markets." },
      { name: 'Shankaracharya Temple', images: ['/images/Dal1.jpeg', '/images/Dal2.jpeg', '/images/Dal3.jpeg', '/images/Dal4.jpeg'], description: "An ancient Shiva temple on a hilltop offering panoramic views of Srinagar and Dal Lake." },
    ]
  },
];

const adventures = [
  { id: 1, name: 'Skiing', media: { src: '/images/skiing.mp4', poster: '/images/Gulmarg1.jpeg', alt: 'Skiing in Gulmarg' }, description: 'World-class skiing on the powdery slopes of Gulmarg, home to one of the highest ski resorts globally.', locations: ['Gulmarg', 'Apharwat Peak', 'Kongdoori'] },
  { id: 2, name: 'Shikara Ride', media: { src: '/images/shikara.mp4', poster: '/images/Dal1.jpeg', alt: 'Shikara on Dal Lake' }, description: 'Glide through Dal Lake in traditional Kashmiri shikaras. Visit floating markets and watch the Himalayan sunset.', locations: ['Dal Lake', 'Nigeen Lake', 'Jhelum River'] },
  { id: 3, name: 'Trekking', media: { src: '/images/trekking.mp4', poster: '/images/Pahalgam1.jpeg', alt: 'Trekking in Kashmir' }, description: 'The Great Lakes Trek — 7 days through alpine meadows, high-altitude lakes, and snow-capped peaks.', locations: ['Great Lakes Trek', 'Tarsar Marsar', 'Kolahoi Glacier'] },
  { id: 4, name: 'Paragliding', media: { src: '/images/paragliding.mp4', poster: '/images/Sonmarg1.jpeg', alt: 'Paragliding in Kashmir' }, description: 'Soar above the Kashmir Valley with breathtaking mountain views. Tandem flights available for beginners.', locations: ['Sonmarg', 'Pahalgam', 'Betaab Valley'] },
];

const faqs = [
  { question: 'What is bagspackgo?', answer: 'A direct travel platform for Kashmir and Ladakh. We connect you straight to verified local guides, without middlemen or hidden fees.' },
  { question: 'How does it work?', answer: 'Browse fixed packages for Trips, Treks, or Events. As our itineraries are expertly pre-planned, they cannot be customized. Book instantly and receive your E-Ticket.' },
  { question: 'Are the local guides verified?', answer: 'Yes. We thoroughly verify every local guide for safety, expertise, and professionalism before they can list their packages.' },
  { question: 'How can I book a package?', answer: 'Select a package, choose your dates and group size, and pay securely online. You will immediately receive a Booking Pass with your guide\'s contact info.' },
  { question: 'What are Events?', answer: 'Events are thrilling, date-specific adventures hosted by local experts. Discover and book these action-packed, adrenaline-fueled group experiences directly in our Events section.' },
  { question: 'Is it trustworthy to buy a package from bagspackgo?', answer: 'Completely. Your payment is processed through a secure gateway, and your booking connects directly to a verified local guide. We ensure absolute transparency.' },
];


const SectionHeading = ({ pre, accent }) => (
  <div
    className="text-center mb-10"
  >
    <h2
      className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 transition-transform duration-500 hover:scale-105"
    >
      {pre} <span className="text-green-600">{accent}</span>
    </h2>
    <div
      className="h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto w-24 rounded-full mb-8"
    />
  </div>
);

// ── DESTINATIONS  (tabbed – one category at a time) ─────────
const PopularDestinations = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dir, setDir] = useState(1);
  const [slideIdx, setSlideIdx] = useState(0);

  const cat = destCategories[activeTab];
  const places = cat.places;

  const switchTab = (i) => {
    setDir(i > activeTab ? 1 : -1);
    setActiveTab(i);
    setSlideIdx(0);
  };

  const goSlide = (delta) => {
    setDir(delta);
    setSlideIdx(prev => (prev + delta + places.length) % places.length);
  };

  return (
    <section className="px-4 sm:px-6 md:px-8 py-6 w-full mx-auto">
      <SectionHeading pre="Kashmir Crown" accent="Jewels" />

      {/* Category tabs */}
      <div className="flex gap-2 justify-center flex-wrap mb-5">
        {destCategories.map((c, i) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => switchTab(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all border ${i === activeTab
                  ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'
                }`}
            >
              <Icon size={13} /> {c.label}
            </button>
          );
        })}
      </div>

      {/* Slide area — 1 card visible on mobile, 3 on md+ */}
      <div className="relative">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={activeTab}
            custom={dir}
            initial={{ opacity: 0, x: dir > 0 ? 40 : -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir > 0 ? -40 : 40 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mobile: one card at a time carousel */}
            <div className="md:hidden relative">
              <div className="relative h-60 rounded-2xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slideIdx}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0"
                  >
                    <PhotoCard
                      images={places[slideIdx].images}
                      name={places[slideIdx].name}
                      description={places[slideIdx].description}
                      bgColor="bg-slate-900"
                      textColor="text-white"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              {/* Mobile nav */}
              <button onClick={() => goSlide(-1)} className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow z-10"><ChevronLeft size={18} /></button>
              <button onClick={() => goSlide(1)} className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow z-10"><ChevronRight size={18} /></button>
              {/* Dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {places.map((_, i) => (
                  <button key={i} onClick={() => setSlideIdx(i)} className={`h-2 rounded-full transition-all ${i === slideIdx ? 'bg-green-500 w-5' : 'bg-gray-300 w-2'}`} />
                ))}
              </div>
            </div>

            {/* Desktop: all 3 cards side by side */}
            <div className="hidden md:grid grid-cols-3 gap-4">
              {places.map((place) => (
                <div key={place.name} className="relative h-56 rounded-xl overflow-hidden">
                  <PhotoCard
                    images={place.images}
                    name={place.name}
                    description={place.description}
                    bgColor="bg-slate-900"
                    textColor="text-white"
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

// ── ADVENTURES (video slider — single video at a time) ─────
const AdventureSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isFlipped, setIsFlipped] = useState(false);
  const intervalRef = useRef(null);
  const sectionRef = useRef(null);
  const isVisible = useInView(sectionRef, { once: false, margin: '-80px' });

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const isHorizontalSwipe = useRef(false);

  const startAutoSlide = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => (prev + 1) % adventures.length);
    }, 5000);
  }, []);

  useEffect(() => {
    if (isVisible && !isFlipped) startAutoSlide();
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [isVisible, isFlipped, startAutoSlide]);

  const go = useCallback((delta) => {
    if (isFlipped) return;
    setIsFlipped(false);
    setDirection(delta);
    setCurrentIndex(prev => (prev + delta + adventures.length) % adventures.length);
    clearInterval(intervalRef.current);
    if (isVisible) startAutoSlide();
  }, [adventures.length, isFlipped, isVisible, startAutoSlide]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = false;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
    const diffX = Math.abs(touchStartX.current - touchEndX.current);
    const diffY = Math.abs(touchStartY.current - e.touches[0].clientY);
    if (diffX > diffY && diffX > 15) {
      isHorizontalSwipe.current = true;
    }
  };
  const handleTouchEnd = () => {
    if (isFlipped || !isHorizontalSwipe.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) go(1);
      else go(-1);
    }
  };

  return (
    <section ref={sectionRef} className="py-6 px-4 sm:px-6 md:px-8 w-full mx-auto overflow-hidden">
      <div>
        <SectionHeading pre="Thrill Seeker's" accent="Paradise" />

        <div className="relative">
          <div 
            className="relative h-[240px] sm:h-[380px] md:h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="absolute inset-0 group"
              >
                <VideoCard
                  media={adventures[currentIndex].media}
                  name={adventures[currentIndex].name}
                  description={adventures[currentIndex].description}
                  locations={adventures[currentIndex].locations}
                  isFlipped={isFlipped}
                  onClick={() => setIsFlipped(f => !f)}
                  isVisible={isVisible}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {!isFlipped && (
            <div className="flex justify-center gap-2 mt-4 sm:mt-6">
              {adventures.map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => { setCurrentIndex(i); clearInterval(intervalRef.current); if (isVisible) startAutoSlide(); }} 
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-green-500 w-6 sm:w-8' : 'bg-gray-300 w-1.5 sm:w-2'}`} 
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
          {!isFlipped && (
            <>
              <button onClick={() => go(-1)} aria-label="Prev" className="absolute left-2 top-[calc(50%-20px)] -translate-y-1/2 bg-white/85 backdrop-blur p-2 rounded-full z-20 shadow-lg hover:bg-white transition-all active:scale-95"><ChevronLeft size={20} /></button>
              <button onClick={() => go(1)} aria-label="Next" className="absolute right-2 top-[calc(50%-20px)] -translate-y-1/2 bg-white/85 backdrop-blur p-2 rounded-full z-20 shadow-lg hover:bg-white transition-all active:scale-95"><ChevronRight size={20} /></button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

// ── TESTIMONIALS (horizontal scroll on mobile) ─────────────
const Testimonials = () => {
  const [idx, setIdx] = useState(0);
  const [data, setData] = useState(dummyTestimonials);

  useEffect(() => {
    // API intentionally disabled to prevent 404
  }, []);

  return (
    <section className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
      <SectionHeading pre="Travel" accent="Stories" />
      {/* Mobile: single card with prev/next; md+: 2-col grid */}
      <div className="md:hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow-md p-5 border border-gray-100"
          >
            <TestimonialCard t={data[idx]} />
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-between items-center mt-3">
          <button onClick={() => setIdx(i => (i - 1 + data.length) % data.length)} className="bg-gray-100 hover:bg-green-50 p-2 rounded-full"><ChevronLeft size={16} /></button>
          <div className="flex gap-1.5">
            {data.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? 'bg-green-500 w-5' : 'bg-gray-300 w-1.5'}`} />)}
          </div>
          <button onClick={() => setIdx(i => (i + 1) % data.length)} className="bg-gray-100 hover:bg-green-50 p-2 rounded-full"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Desktop 2×2 grid */}
      <div className="hidden md:grid grid-cols-2 gap-5">
        {data.slice(0, 4).map((t, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
            <TestimonialCard t={t} />
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <a className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md cursor-pointer">
          View All Stories <ArrowRight size={14} />
        </a>
      </div>
    </section>
  );
};

const TestimonialCard = ({ t }) => (
  <>
    <div className="flex items-center gap-3 mb-3">
      <img src={t.image} alt={t.name} loading="lazy" width={44} height={44} className="w-11 h-11 rounded-full object-cover shrink-0" />
      <div className="min-w-0">
        <p className="font-bold text-sm leading-tight">{t.name}</p>
        <p className="text-gray-400 text-xs">{t.location}</p>
      </div>
      <div className="ml-auto flex shrink-0">
        {[...Array(5)].map((_, j) => <Star key={j} className={`w-3.5 h-3.5 ${j < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}
      </div>
    </div>
    <p className="text-gray-600 text-sm italic leading-relaxed">"{t.text}"</p>
  </>
);

// ── Main export ────────────────────────────────────────────
export default function TripMainContent() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="w-full h-full flex flex-col items-center overflow-x-hidden font-sans">
      {/* ── Hero + Search ───────────────────────────────── */}
      <div className="relative w-full">
        <div
          className="w-full h-[300px] sm:h-[400px] bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center text-center px-4"
        >
          {/* Subtle hero background image */}
          <div 
            className="absolute inset-0 opacity-40 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero.svg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50 z-0" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative z-20 w-full max-w-4xl -mt-10"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-4">
              Your <span className="text-emerald-400">Next</span> Adventure
            </h1>
            
          </motion.div>
        </div>

        <div className="w-full px-4 -mt-24 sm:-mt-32 md:-mt-44 lg:-mt-40 relative z-20 pb-4 flex justify-center">
          <div className="w-full max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.45 }}>
              <TripSearchInput />
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Sections (Even spacing) ────────────────────────── */}
      <div className="flex flex-col gap-10 sm:gap-16 md:gap-24 mt-8 md:mt-12 pb-8 md:pb-16">
        <div><AdContent /></div>
        <div className="w-full">
          <PopularDestinations />
        </div>
        <div className="w-full">
          <AdventureSlider />
        </div>
        {/* <div><Testimonials /></div> */}
        <div id="about" className="scroll-mt-24 w-full">
          <AboutUs />
        </div>
        <div id="faq" className="scroll-mt-24 w-full">
          <FAQ
            faqs={faqs}
            activeIndex={activeIndex}
            toggleFAQ={(i) => setActiveIndex(activeIndex === i ? null : i)}
          />
        </div>
      </div>
    </div>
  );
}