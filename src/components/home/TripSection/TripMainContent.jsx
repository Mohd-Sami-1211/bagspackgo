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
  { name: 'Priya Sharma',  location: 'Delhi',     rating: 5, text: 'Our houseboat stay on Dal Lake was straight out of a dream. Absolutely magical honeymoon!',           image: 'https://images.unsplash.com/photo-1494790108755-2616b612b402?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
  { name: 'Rajesh Kumar',  location: 'Mumbai',    rating: 5, text: 'Best family vacation ever! The skiing instructor in Gulmarg was so patient with the kids.',           image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
  { name: 'Sarah Johnson', location: 'USA',        rating: 5, text: 'As a solo traveler I felt completely safe. The Tarsar Marsar trek was the highlight of my year!',    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
  { name: 'Amit Patel',    location: 'Bangalore', rating: 5, text: 'Our guide knew every hidden photo spot. The sunrise at Doodhpathri was worth waking up at 4 AM!',    image: 'https://images.unsplash.com/photo-1542103749-8ef59b94f47e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
];

// ── Static data ────────────────────────────────────────────
const destCategories = [
  {
    id: 'mountains',
    label: 'Mountain Valleys',
    icon: Mountain,
    places: [
      { name: 'Gulmarg',  images: ['/images/Gulmarg1.jpeg','/images/Gulmarg2.jpeg','/images/Gulmarg3.jpeg','/images/Gulmarg4.jpeg'],   description: "Known as the 'Meadow of Flowers', Gulmarg is a premier ski destination with the world's highest gondola ride." },
      { name: 'Sonmarg',  images: ['/images/Sonmarg1.jpeg','/images/Sonmarg2.jpeg','/images/Sonmarg3.jpeg','/images/Sonmarg4.jpeg'],   description: "The 'Meadow of Gold' is the gateway to Himalayan high-altitude lakes like Vishansar and Krishansar." },
      { name: 'Pahalgam', images: ['/images/Pahalgam1.jpeg','/images/Pahalgam2.jpeg','/images/Pahalgam3.jpeg','/images/Pahalgam4.jpg'], description: "The 'Valley of Shepherds' — where the Lidder River flows through pine forests and alpine meadows." },
    ]
  },
  {
    id: 'nature',
    label: 'Natural Wonders',
    icon: Waves,
    places: [
      { name: 'Doodhpathri', images: ['/images/Doodhpathri1.jpeg','/images/Doodhpathri2.jpeg','/images/Doodhpathri3.jpeg','/images/Doodhpathri4.jpeg'], description: "This 'Valley of Milk' gets its name from the frothy white appearance of its gushing streams." },
      { name: 'Betaab Valley', images: ['/images/Betaab1.jpeg','/images/Betaab2.jpeg','/images/Betaab3.jpeg','/images/Betaab4.jpeg'],  description: "Named after the Bollywood movie 'Betaab', known for lush meadows and crystal-clear streams." },
      { name: 'Aru Valley',    images: ['/images/Aru1.jpeg','/images/Aru2.jpeg','/images/Aru3.jpeg','/images/Aru4.jpeg'],              description: "A picturesque valley and the starting point for the famous Kolahoi Glacier trek." },
    ]
  },
  {
    id: 'culture',
    label: 'Cultural Gems',
    icon: Landmark,
    places: [
      { name: 'Mughal Gardens',        images: ['/images/MG-1.jpeg','/images/MG-2.jpeg','/images/MG-3.jpeg','/images/MG-4.jpeg'],                              description: "Nishat Bagh, Shalimar Bagh, and Chashme Shahi — Persian-style terraced gardens with cascading fountains." },
      { name: 'Dal Lake',              images: ['/images/Dal1.jpeg','/images/Dal2.jpeg','/images/Dal3.jpeg','/images/Dal4.jpeg'],                               description: "The 'Jewel of Kashmir' — famous for colourful shikaras, floating houseboats, and morning markets." },
      { name: 'Shankaracharya Temple', images: ['/images/Shankaracharya1.jpeg','/images/Shankaracharya2.jpeg','/images/Shankaracharya3.jpeg','/images/Shankaracharya4.jpeg'], description: "An ancient Shiva temple on a hilltop offering panoramic views of Srinagar and Dal Lake." },
    ]
  },
];

const adventures = [
  { id: 1, name: 'Skiing',       media: { src: '/images/skiing.mp4',      poster: '/images/Gulmarg1.jpeg',      alt: 'Skiing in Gulmarg'      }, description: 'World-class skiing on the powdery slopes of Gulmarg, home to one of the highest ski resorts globally.', locations: ['Gulmarg','Apharwat Peak','Kongdoori'] },
  { id: 2, name: 'Shikara Ride', media: { src: '/images/shikara.mp4',     poster: '/images/Dal1.jpeg',     alt: 'Shikara on Dal Lake'    }, description: 'Glide through Dal Lake in traditional Kashmiri shikaras. Visit floating markets and watch the Himalayan sunset.', locations: ['Dal Lake','Nigeen Lake','Jhelum River'] },
  { id: 3, name: 'Trekking',     media: { src: '/images/trekking.mp4',    poster: '/images/Pahalgam1.jpeg',    alt: 'Trekking in Kashmir'    }, description: 'The Great Lakes Trek — 7 days through alpine meadows, high-altitude lakes, and snow-capped peaks.', locations: ['Great Lakes Trek','Tarsar Marsar','Kolahoi Glacier'] },
  { id: 4, name: 'Paragliding',  media: { src: '/images/paragliding.mp4', poster: '/images/Sonmarg1.jpeg', alt: 'Paragliding in Kashmir' }, description: 'Soar above the Kashmir Valley with breathtaking mountain views. Tandem flights available for beginners.', locations: ['Sonmarg','Pahalgam','Betaab Valley'] },
];

const faqs = [
  { question: 'What is bagspackgo?',                              answer: 'A travel platform that connects tourists directly with verified local guides and small travel firms.' },
  { question: 'How is bagspackgo different?',                     answer: 'Direct access to local guides, full itinerary customization, and transparent pricing — no middlemen.' },
  { question: 'How do I book a tour?',                            answer: 'Search by destination, dates, and group size, then book a guide directly through the platform.' },
  { question: 'Can I customize my itinerary?',                    answer: 'Yes! Collaborate with your guide to add or remove services and activities any time.' },
  { question: 'Are guides verified?',                             answer: 'All guides undergo identity checks, quality screening, and have community reviews.' },
  { question: 'What payment methods are accepted?',               answer: 'Credit/debit cards, UPI, net banking, and digital wallets via our secure payment gateway.' },
];


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
      transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 100 }}
    >
      {pre} <span className="text-green-600">{accent}</span>
    </motion.h2>
    <motion.div
      className="h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto w-24 rounded-full mb-8"
      initial={{ width: 0 }}
      whileInView={{ width: 96 }}
      transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 50 }}
    />
  </motion.div>
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
    <section className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">
      <SectionHeading pre="Kashmir Crown" accent="Jewels" />

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

// ── ADVENTURES (video slider — single video at a time) ─────
const AdventureSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection]       = useState(1);
  const [isFlipped, setIsFlipped]       = useState(false);
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
        <SectionHeading pre="Thrill Seeker's" accent="Paradise" />

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

// ── TESTIMONIALS (horizontal scroll on mobile) ─────────────
const Testimonials = () => {
  const [idx, setIdx] = useState(0);
  const [data, setData] = useState(dummyTestimonials);

  useEffect(() => {
    fetch('/api/community')
      .then(res => res.json())
      .then(json => { if(json && json.length > 0) setData(json); })
      .catch(err => console.log('Using fallback community data'));
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

// ── Main export ────────────────────────────────────────────
export default function TripMainContent() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="w-full">
      {/* ── Hero + Search ───────────────────────────────── */}
      <div className="relative w-full">
        <div
          className="w-full h-[300px] sm:h-[380px] md:h-[440px] bg-center bg-cover bg-no-repeat relative overflow-hidden flex items-center justify-center text-center px-4"
          style={{ backgroundImage: "url('/images/hero.svg')", backgroundPosition: 'center top' }}
        >
          {/* Animated Hero Text - Creative, Clear, and Responsive */}
          <div className="z-10 w-full flex justify-center mt-[-40px] sm:mt-[-60px] md:mt-[-100px] lg:mt-[-120px] pointer-events-none px-4 sm:px-12 md:px-24 lg:px-32 xl:px-48">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center w-full"
            >
              <h1 className="text-[2.5rem] sm:text-[3.5rem] md:text-[4rem] lg:text-[4.5rem] xl:text-[5rem] leading-[1.15] font-extrabold text-white tracking-tight uppercase drop-shadow-[0_6px_6px_rgba(0,0,0,0.8)] filter md:whitespace-nowrap">
                Your <span className="text-emerald-400 drop-shadow-[0_2px_10px_rgba(16,185,129,0.5)]">Next</span> Adventure
              </h1>
            </motion.div>
          </div>
          
          {/* Overlay to ensure text pops up while keeping image bright */}
          <div className="absolute inset-0 bg-black/20 z-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-0" />
        </div>

        <div className="w-full px-3 sm:px-6 lg:px-8 -mt-20 sm:-mt-28 md:-mt-40 relative z-20 pb-4">
          <div className="max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut', delay: 0.45 }}>
              <TripSearchInput />
            </motion.div>
          </div>
        </div>
      </div>

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