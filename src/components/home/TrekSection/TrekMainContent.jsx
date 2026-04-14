'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Star, ArrowRight,
  Mountain, Tent, Flag,
} from 'lucide-react';
import AdContent  from '../../common/AdContent';
import PhotoCard  from '../../common/PhotoCard';
import VideoCard  from '../../common/VideoCard';
import AboutUs    from '../../common/AboutUs';
import FAQ        from '../../common/FAQ';
import TrekSearchInput from './TrekSearchInput';

/* ─── Static data ───────────────────────────────────────────── */

const dummyTestimonials = [
  { name: 'Aisha Mir',       location: 'Delhi',     rating: 5, text: 'The Great Lakes Trek was life-changing. Seven days of pure wilderness — no words can describe the views!',           image: 'https://images.unsplash.com/photo-1494790108755-2616b612b402?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
  { name: 'Karan Mehta',     location: 'Pune',      rating: 5, text: 'Our guide knew every trail and kept us safe. The Tarsar Marsar trek was everything I had dreamed of and more.',      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
  { name: 'Emily Thornton',  location: 'UK',        rating: 5, text: 'As a solo trekker I felt incredibly supported. The Kolahoi Glacier camp under a sky full of stars was magical.',    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
  { name: 'Suresh Nair',     location: 'Bangalore', rating: 5, text: 'Well-organized, safe, and absolutely stunning. The Naranag Gangabal route is a must-do for every trekker.',         image: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
];

const destCategories = [
  {
    id: 'alpine',
    label: 'Alpine Lakes',
    icon: Mountain,
    places: [
      { name: 'Great Lakes Trek',        images: ['/images/GL1.jpeg', '/images/GL2.jpeg', '/images/GL3.jpeg', '/images/GL4.jpeg'],   description: "A 7-day odyssey past Vishansar, Krishansar, Gadsar, Satsar, and Gangabal lakes — the crown jewel of Kashmir trekking." },
      { name: 'Tarsar Marsar Trek',      images: ['/images/TM1.jpeg', '/images/TM2.jpeg', '/images/TM3.jpeg', '/images/TM4.jpeg'],   description: "Six days through meadows of wildflowers to the iconic heart-shaped Tarsar Lake and the ethereal Marsar Lake." },
      { name: 'Sonamarg–Vishansar Trek', images: ['/images/SV1.jpeg', '/images/SV2.jpeg', '/images/SV3.jpeg', '/images/SV4.jpeg'],   description: "Begin from the Meadow of Gold and cross the Nichnai Pass (4,100 m) to reach the turquoise waters of Vishansar." },
    ],
  },
  {
    id: 'glacier',
    label: 'Glacier Routes',
    icon: Tent,
    places: [
      { name: 'Kolahoi Glacier Trek',    images: ['/images/KG1.jpeg', '/images/KG2.jpeg', '/images/KG3.jpeg', '/images/KG4.jpeg'],   description: "A challenging 5-day route to the Goddess of Light — the largest glacier in Kashmir, standing at 4,700 m." },
      { name: 'Naranag Gangabal Trek',   images: ['/images/NG1.jpeg', '/images/NG2.jpeg', '/images/NG3.jpeg', '/images/NG4.jpeg'],   description: "Starting at ancient temple ruins, this 4-day trek leads to the sacred Gangabal Lake beneath Harmukh peak." },
      { name: 'Aru Valley Trek',         images: ['/images/AL1.jpeg', '/images/AL2.jpeg', '/images/AL3.jpeg', '/images/AL4.jpeg'],   description: "A beginner-friendly 3-day route following the Lidder River to the beautiful Lidderwat camping grounds." },
    ],
  },
  {
    id: 'meadow',
    label: 'Meadow Walks',
    icon: Flag,
    places: [
      { name: 'Betaab Valley Walk',      images: ['/images/Pahalgam1.jpeg', '/images/Pahalgam2.jpeg', '/images/Pahalgam3.jpeg', '/images/Pahalgam4.jpg'],     description: "Lush green meadows with crystal-clear streams — a short, scenic walk perfect for families and beginners." },
      { name: 'Doodhpathri Meadows',     images: ['/images/Doodhpathri1.jpeg', '/images/Doodhpathri2.jpeg', '/images/Doodhpathri3.jpeg', '/images/Doodhpathri4.jpeg'], description: "The Valley of Milk, famous for its frothy white streams and carpets of wildflowers in summer." },
      { name: 'Pahalgam Riverside',      images: ['/images/Pahalgam1.jpeg', '/images/Pahalgam2.jpeg', '/images/Pahalgam3.jpeg', '/images/Pahalgam4.jpg'], description: "A gentle walk along the Lidder River through pine forests and shepherd meadows in the Valley of Shepherds." },
    ],
  },
];

const adventures = [
  { id: 1, name: 'Alpine Trekking',  media: { src: '/images/trekking.mp4',    poster: '/images/GL1.jpeg',      alt: 'Alpine trekking Kashmir Great Lakes' }, description: 'Multi-day high-altitude treks through alpine meadows, glaciers, and pristine mountain lakes.', locations: ['Great Lakes', 'Tarsar Marsar', 'Kolahoi Glacier'] },
  { id: 2, name: 'Glacier Crossing', media: { src: '/images/paragliding.mp4', poster: '/images/KG1.jpeg',      alt: 'Kolahoi Glacier Kashmir'             }, description: 'Cross living glaciers and snowfields under expert guide supervision — an experience for the bold.', locations: ['Kolahoi Glacier', 'Nichnai Pass', 'Gadsar Pass'] },
  { id: 3, name: 'River Camping',    media: { src: '/images/shikara.mp4',     poster: '/images/AL1.jpeg',      alt: 'Riverside camping Kashmir'           }, description: 'Spend nights beside gushing mountain rivers with campfire, starlit skies, and fresh mountain air.', locations: ['Aru Valley', 'Lidderwat', 'Betaab Valley'] },
  { id: 4, name: 'Snow Trekking',    media: { src: '/images/skiing.mp4',      poster: '/images/Sonmarg1.jpeg', alt: 'Snow trekking in Kashmir'            }, description: 'Trek through snow-blanketed passes and frozen lakes on our early-season and late-season expeditions.', locations: ['Sonamarg', 'Thajiwas Glacier', 'Zero Point'] },
];

const faqs = [
  { question: 'What is bagspackgo?', answer: 'A direct travel platform for Kashmir and Ladakh. We connect you straight to verified local guides, without middlemen or hidden fees.' },
  { question: 'How does it work?', answer: 'Browse fixed packages for Trips, Treks, or Events. As our itineraries are expertly pre-planned, they cannot be customized. Book instantly and receive your E-Ticket.' },
  { question: 'Are the local guides verified?', answer: 'Yes. We thoroughly verify every local guide for safety, expertise, and professionalism before they can list their packages.' },
  { question: 'How can I book a package?', answer: 'Select a package, choose your dates and group size, and pay securely online. You will immediately receive a Booking Pass with your guide\'s contact info.' },
  { question: 'What are Events?', answer: 'Events are thrilling, date-specific adventures hosted by local experts. Discover and book these action-packed, adrenaline-fueled group experiences directly in our Events section.' },
  { question: 'Is it trustworthy to buy a package from bagspackgo?', answer: 'Completely. Your payment is processed through a secure gateway, and your booking connects directly to a verified local guide. We ensure absolute transparency.' },
];

/* ─── SectionHeading ────────── */
const SectionHeading = ({ pre, accent }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="text-center mb-10"
  >
    <motion.h2
      className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
      initial={{ scale: 0.9 }}
      whileInView={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 100 }}
    >
      {pre} <span className="text-green-600">{accent}</span>
    </motion.h2>
    <motion.div
      className="h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto w-24 rounded-full mb-8"
      initial={{ width: 0 }}
      whileInView={{ width: 96 }}
      transition={{ duration: 0.8, delay: 0.3, type: 'spring', stiffness: 50 }}
    />
  </motion.div>
);

/* ── DESTINATIONS (tabbed – one category at a time) ── */
const PopularDestinations = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dir,       setDir]       = useState(1);
  const [slideIdx,  setSlideIdx]  = useState(0);

  const cat    = destCategories[activeTab];
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
      <SectionHeading pre="Kashmir's" accent="Premier Treks" />

      {/* Category tabs */}
      <div className="flex gap-2 justify-center flex-wrap mb-5">
        {destCategories.map((c, i) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => switchTab(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
                i === activeTab
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
              <button onClick={() => goSlide(1)}  className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow z-10"><ChevronRight size={18} /></button>
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

/* ── ADVENTURES (video slider — single video at a time) ── */
const AdventureSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction,    setDirection]    = useState(1);
  const [isFlipped,    setIsFlipped]    = useState(false);
  const intervalRef = useRef(null);
  const sectionRef  = useRef(null);
  const isVisible   = useInView(sectionRef, { once: false, margin: '-80px' });

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (isFlipped) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) go(1);
      else go(-1);
    }
  };

  return (
    <section ref={sectionRef} className="py-6 px-4 sm:px-6 md:px-8 w-full mx-auto overflow-hidden">
      <div>
        <SectionHeading pre="Trekker's" accent="Paradise" />

        <div className="relative">
          <div 
            className="relative h-[240px] sm:h-[380px] md:h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl"
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

/* ── TESTIMONIALS (horizontal scroll on mobile) ── */
const Testimonials = () => {
  const [idx,  setIdx]  = useState(0);
  const [data, setData] = useState(dummyTestimonials);

  useEffect(() => {
    // API intentionally disabled to prevent 404
  }, []);

  return (
    <section className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
      <SectionHeading pre="Trekker" accent="Stories" />
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
          <motion.div key={i} className="bg-white rounded-2xl shadow-md p-5 border border-gray-100" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }} viewport={{ once: true }}>
            <TestimonialCard t={t} />
          </motion.div>
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

/* ── Main export ────────────────────────────────────────────── */
export default function TrekMainContent() {
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
              Conquer <span className="text-emerald-400">Every</span> Summit
            </h1>
            
          </motion.div>
        </div>

        <div className="w-full px-4 -mt-24 sm:-mt-32 md:-mt-44 lg:-mt-40 relative z-20 pb-4 flex justify-center">
          <div className="w-full max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.45 }}>
              <TrekSearchInput />
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