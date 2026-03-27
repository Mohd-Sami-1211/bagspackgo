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
      { name: 'Betaab Valley Walk',      images: ['/images/Betaab1.jpeg', '/images/Betaab2.jpeg', '/images/Betaab3.jpeg', '/images/Betaab4.jpeg'],     description: "Lush green meadows with crystal-clear streams — a short, scenic walk perfect for families and beginners." },
      { name: 'Doodhpathri Meadows',     images: ['/images/Doodhpathri1.jpeg', '/images/Doodhpathri2.jpeg', '/images/Doodhpathri3.jpeg', '/images/Doodhpathri4.jpeg'], description: "The Valley of Milk, famous for its frothy white streams and carpets of wildflowers in summer." },
      { name: 'Pahalgam Riverside',      images: ['/images/Pahalgam1.jpeg', '/images/Pahalgam2.jpeg', '/images/Pahalgam3.jpeg', '/images/Pahalgam4.jpg'], description: "A gentle walk along the Lidder River through pine forests and shepherd meadows in the Valley of Shepherds." },
    ],
  },
];

const adventures = [
  { id: 1, name: 'Alpine Trekking',  media: { src: '/images/trekking.mp4',    poster: '/images/GL1.jpeg',      alt: 'Alpine trekking Kashmir Great Lakes' }, description: 'Multi-day high-altitude treks through alpine meadows, glaciers, and pristine mountain lakes.', locations: ['Great Lakes', 'Tarsar Marsar', 'Kolahoi Glacier'] },
  { id: 2, name: 'Glacier Crossing', media: { src: '/images/paragliding.mp4', poster: '/images/KG1.jpeg',      alt: 'Kolahoi Glacier Kashmir'             }, description: 'Cross living glaciers and snowfields under expert guide supervision — an experience for the bold.', locations: ['Kolahoi Glacier', 'Nichnai Pass', 'Gadsar Pass'] },
  { id: 3, name: 'River Camping',    media: { src: '/images/shikara.mp4',     poster: '/images/Aru1.jpeg',     alt: 'Riverside camping Kashmir'           }, description: 'Spend nights beside gushing mountain rivers with campfire, starlit skies, and fresh mountain air.', locations: ['Aru Valley', 'Lidderwat', 'Betaab Valley'] },
  { id: 4, name: 'Snow Trekking',    media: { src: '/images/skiing.mp4',      poster: '/images/Sonmarg1.jpeg', alt: 'Snow trekking in Kashmir'            }, description: 'Trek through snow-blanketed passes and frozen lakes on our early-season and late-season expeditions.', locations: ['Sonamarg', 'Thajiwas Glacier', 'Zero Point'] },
];

const faqs = [
  { question: 'What is the best time for trekking in Kashmir?',      answer: 'Most treks operate June–September when trails are open and weather is pleasant. Early-season (May–June) and late-season (October) options are available on select listings.' },
  { question: 'Do I need prior trekking experience?',                answer: 'It depends on the difficulty level. Each trek listing specifies the experience required. Beginner-friendly routes are clearly tagged on the platform.' },
  { question: 'What gear should I carry?',                           answer: 'Each guide provides a specific gear checklist. Essentials include trekking shoes, layered clothing, rain gear, a headlamp, and personal medications.' },
  { question: 'Are guides and porters included?',                    answer: 'Yes. Every trek is led by verified local guides. Porter and cook availability is listed on each package.' },
  { question: 'How is altitude sickness managed?',                   answer: 'Guides plan proper acclimatization days into the itinerary. First-aid trained staff accompany all high-altitude treks.' },
  { question: 'Are meals and accommodation provided?',               answer: "Most packages include all meals and camping accommodation. Specific inclusions are listed on each guide's page." },
  { question: 'Is travel insurance required?',                       answer: 'Not mandatory, but strongly recommended for high-altitude treks. Consult your guide for specific advice before departure.' },
  { question: 'Can I join as a solo traveler?',                      answer: 'Absolutely — solo travelers can join group departures. Use our Merger feature to connect with others on the same route.' },
  { question: 'How do permits and local regulations work?',          answer: 'Local guides handle all permits and fees. These costs are typically included in the trek package price.' },
  { question: 'What if I need to cancel or reschedule?',             answer: 'Cancellation and rescheduling policies are set by individual guides. Review the terms on each listing or contact the guide directly.' },
];

/* ─── SectionHeading (identical to TripMainContent) ────────── */
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

/* ── DESTINATIONS (tabbed – one category at a time) ── identical structure to TripMainContent */
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
    <section className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
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
                      bgColor="from-green-500 to-green-700"
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
                    bgColor="from-green-500 to-green-700"
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

/* ── ADVENTURES (video slider — single video at a time) — identical structure */
const AdventureSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction,    setDirection]    = useState(1);
  const [isFlipped,    setIsFlipped]    = useState(false);
  const intervalRef = useRef(null);
  const sectionRef  = useRef(null);
  const isVisible   = useInView(sectionRef, { once: false, margin: '-80px' });

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

  const go = (delta) => {
    if (isFlipped) return;
    setIsFlipped(false);
    setDirection(delta);
    setCurrentIndex(prev => (prev + delta + adventures.length) % adventures.length);
    clearInterval(intervalRef.current);
    if (isVisible) startAutoSlide();
  };

  return (
    <section ref={sectionRef} className="py-6 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      <div>
        <SectionHeading pre="Trekker's" accent="Paradise" />

        <div className="relative">
          <div className="relative h-[240px] sm:h-[380px] md:h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="absolute inset-0"
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
            <>
              <button onClick={() => go(-1)} aria-label="Prev" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/85 backdrop-blur p-2 rounded-full z-20 shadow-lg hover:bg-white transition-all active:scale-95"><ChevronLeft size={20} /></button>
              <button onClick={() => go(1)}  aria-label="Next" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/85 backdrop-blur p-2 rounded-full z-20 shadow-lg hover:bg-white transition-all active:scale-95"><ChevronRight size={20} /></button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {adventures.map((_, i) => (
                  <button key={i} onClick={() => { setCurrentIndex(i); clearInterval(intervalRef.current); if (isVisible) startAutoSlide(); }} className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-green-500 w-6' : 'bg-white/70 w-2'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

/* ── TESTIMONIALS (horizontal scroll on mobile) — identical structure */
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
    <div className="w-full flex flex-col items-center overflow-x-hidden">
      {/* ── Hero + Search Section ────────────────────────────── */}
      <section className="relative w-full">
        <div
          className="w-full h-[260px] sm:h-[320px] md:h-[380px] lg:h-[400px] bg-center bg-cover bg-no-repeat relative overflow-hidden flex items-center justify-center text-center px-4"
          style={{ backgroundImage: "url('/images/hero.svg')", backgroundPosition: 'center top' }}
        >
          {/* Main Hero Content - Explicitly Centered */}
          <div className="z-20 w-full flex justify-center mt-[-60px] sm:mt-[-60px] md:mt-[-88px] lg:mt-[-120px] pointer-events-none px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center w-full"
            >
              <h1 className="text-[2.5rem] sm:text-[3.5rem] md:text-[4rem] lg:text-[4.5rem] xl:text-[5rem] leading-[1.15] font-extrabold text-white tracking-tight uppercase drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] filter md:whitespace-nowrap">
                Conquer <span className="text-emerald-400 drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)]">Every</span> Summit
              </h1>
            </motion.div>
          </div>

          {/* Unified Shading Layer (to match Trip section organic feel) */}
          <div className="absolute inset-0 bg-black/20 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10" />
        </div>

        {/* Search Input Container - Precisely positioned and Centered */}
        <div className="w-full px-4 -mt-24 sm:-mt-32 md:-mt-44 lg:-mt-40 relative z-30 pb-4 flex justify-center">
          <div className="w-full max-w-5xl">
            <motion.div 
              initial={{ opacity: 0, y: 25 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.45 }}
            >
              <TrekSearchInput />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Sections (Even spacing) ────────────────────────── */}
      <div className="flex flex-col gap-10 sm:gap-16 md:gap-24 mt-8 md:mt-12 pb-8 md:pb-16">
        <div><AdContent /></div>
        <div><PopularDestinations /></div>
        <div><AdventureSlider /></div>
        <div><Testimonials /></div>
        <div id="about" className="scroll-mt-24"><AboutUs /></div>
        <div id="faq" className="scroll-mt-24">
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