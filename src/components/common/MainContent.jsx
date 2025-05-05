'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
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

// Destinations data with category colors
const destinations = [
  {
    category: "Mountain Valleys",
    color: "from-blue-600 to-blue-800",
    textColor: "text-blue-50",
    places: [
      {
        name: "Gulmarg",
        images: [
          "/images/Gulmarg1.jpeg",
          "/images/Gulmarg2.jpeg",
          "/images/Gulmarg3.jpeg",
          "/images/Gulmarg4.jpeg"
        ],
        description: "Known as the 'Meadow of Flowers', Gulmarg is a premier ski destination with the world's highest gondola ride. In summer, the valley transforms into a colorful carpet of wildflowers against the backdrop of snow-capped peaks. The Gulmarg Golf Course is one of the highest green golf courses in the world. Don't miss the stunning views from Kongdoori Mountain and the serene Alpather Lake."
      },
      {
        name: "Sonmarg",
        images: [
          "/images/Sonmarg1.jpeg",
          "/images/Sonmarg2.jpeg",
          "/images/Sonmarg3.jpeg",
          "/images/Sonmarg4.jpeg"
        ],
        description: "The 'Meadow of Gold' is the gateway to the Himalayan high-altitude lakes like Vishansar and Krishansar. Sonmarg serves as the base camp for the challenging Amarnath Yatra pilgrimage. The Sindh River meanders through lush green meadows surrounded by glaciers. Thajiwas Glacier, accessible by pony ride, offers breathtaking views and is perfect for snow activities in summer."
      }
    ]
  },
  {
    category: "Natural Wonders",
    color: "from-emerald-600 to-emerald-800",
    textColor: "text-emerald-50",
    places: [
      {
        name: "Doodhpathri",
        images: [
          "/images/Doodhpathri1.jpeg",
          "/images/Doodhpathri2.jpeg",
          "/images/Doodhpathri3.jpeg",
          "/images/Doodhpathri4.jpeg"
        ],
        description: "This 'Valley of Milk' gets its name from the frothy white appearance of its gushing streams. Doodhpathri's rolling green meadows dotted with wildflowers resemble a fairy tale landscape. The untouched beauty and fewer crowds make it ideal for peaceful picnics and nature walks. Local shepherds bring their flocks here during summer, adding to the pastoral charm of this hidden gem."
      },
      {
        name: "Pahalgam",
        images: [
          "/images/Pahalgam1.jpeg",
          "/images/Pahalgam2.jpeg",
          "/images/Pahalgam3.jpeg",
          "/images/Pahalgam4.jpg"
        ],
        description: "The 'Valley of Shepherds' is where the Lidder River flows through pine forests and alpine meadows. Pahalgam is the starting point for the annual Amarnath Yatra pilgrimage. Betaab Valley and Aru Valley offer spectacular hiking trails. Enjoy trout fishing, pony rides to Baisaran meadows, or simply relax by the gushing river amidst Himalayan beauty."
      }
    ]
  },
  {
    category: "Cultural Gems",
    color: "from-purple-600 to-purple-800",
    textColor: "text-purple-50",
    places: [
      {
        name: "Mughal Gardens",
        images: [
          "/images/MG-1.jpeg",
          "/images/MG-2.jpeg",
          "/images/MG-3.jpeg",
          "/images/MG-4.jpeg"
        ],
        description: "The trio of Nishat Bagh, Shalimar Bagh, and Chashme Shahi showcase Persian-style terraced gardens with cascading fountains and vibrant flowerbeds. Built in the 17th century, these gardens offer panoramic views of Dal Lake and the Zabarwan range. The symmetry, water channels, and carefully planned flora reflect Mughal horticultural excellence. The annual Tulip Festival in spring transforms these gardens into a riot of colors."
      },
      {
        name: "Dal Lake",
        images: [
          "/images/Dal1.jpeg",
          "/images/Dal2.jpeg",
          "/images/Dal3.jpeg",
          "/images/Dal4.jpeg"
        ],
        description: "The 'Jewel in the Crown of Kashmir' is famous for its colorful shikaras and floating houseboats. Morning markets on vendor boats sell everything from flowers to handicrafts. Visit the floating gardens where vegetables grow on reed mats, and don't miss sunset views of the Hazratbal Mosque from the lake. The Mughal-era Char Chinar island with its four chinar trees is a highlight of any shikara ride."
      }
    ]
  }
];

// Adventure activities data
const adventures = [
  {
    id: 1,
    name: "Skiing",
    media: {
        type: "video",
        src: "/images/skiing.mp4",
        poster: "/images/skiing-poster.jpg", // Fallback poster image
        alt: "Skiing in Gulmarg",
        attributes: {
            loop: true,
            muted: true,
            autoplay: true,
            playsinline: true
        }
    },
    description: "Experience world-class skiing in the powdery slopes of Gulmarg, home to one of the highest ski resorts in the world. The Apharwat Peak offers challenging runs for experts while the Kongdoori slopes are perfect for beginners. Best season: December to March.",
    locations: ["Gulmarg", "Apharwat Peak", "Kongdoori"],
    color: "from-blue-500 to-blue-700",
    textColor: "text-blue-50"
},
  {
    id: 2,
    name: "Shikara Ride",
    media: {
      type: "video",
      src: "/images/shikara.mp4",
      poster: "/images/shikara-poster.jpg", // Fallback poster image
      alt: "Skiing in Gulmarg",
      attributes: {
          loop: true,
          muted: true,
          autoplay: true,
          playsinline: true
      }
    },  
    description: "Glide through the tranquil waters of Dal Lake in traditional Kashmiri houseboats and shikaras. Visit floating markets, Mughal gardens, and witness the sunset over the Himalayas. Don't miss the early morning lotus blooms in Nigeen Lake.",
    locations: ["Dal Lake", "Nigeen Lake", "Jhelum River"],
    color: "from-emerald-500 to-emerald-700",
    textColor: "text-emerald-50"
  },
  {
    id: 3,
    name: "Trekking",
    media: {
      type: "video",
      src: "/images/trekking.mp4",
      poster: "/images/trekking-poster.jpg", // Fallback poster image
      alt: "Skiing in Gulmarg",
      attributes: {
          loop: true,
          muted: true,
          autoplay: true,
          playsinline: true
      }
    }, 
    description: "Explore the Great Lakes Trek, a 7-day journey through alpine meadows, high-altitude lakes, and snow-capped peaks. Other popular trails include the Tarsar Marsar trek and the Kolahoi Glacier trek. Best season: June to September.",
    locations: ["Great Lakes Trek", "Tarsar Marsar", "Kolahoi Glacier"],
    color: "from-amber-500 to-amber-700",
    textColor: "text-amber-50"
  },
  {
    id: 4,
    name: "Paragliding",
    media: {
      type: "video",
      src: "/images/paragliding.mp4",
      poster: "/images/paragliding-poster.jpg", // Fallback poster image
      alt: "Skiing in Gulmarg",
      attributes: {
          loop: true,
          muted: true,
          autoplay: true,
          playsinline: true
      }
    }, 
    description: "Soar above the Kashmir Valley with breathtaking views of snow-capped mountains and lush green meadows. The best spots are in Sonmarg and Pahalgam, with tandem flights available for beginners.",
    locations: ["Sonmarg", "Pahalgam", "Betaab Valley"],
    color: "from-purple-500 to-purple-700",
    textColor: "text-purple-50"
  }
];

const curvePath = "M0,0 C80,120 120,80 200,0 H0";

// Destination Card Component
const DestinationCard = ({ place, isFlipped, onClick, bgColor, textColor }) => {
  return (
    <div className="relative h-full w-full cursor-pointer" onClick={onClick}>
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
              <div className="absolute bottom-4 left-4 z-20">
                <h3 className="text-2xl font-bold text-white">{place.name}</h3>
              </div>
              <Image
                src={place.images[0]}
                alt={place.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 bg-gradient-to-br ${bgColor} ${textColor} p-6 rounded-xl shadow-lg overflow-y-auto`}
          >
            <motion.h3 
              className="text-2xl font-bold mb-4"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {place.name}
            </motion.h3>
            <motion.p 
              className=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {place.description}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Adventure Card Component
const AdventureCard = ({ adventure, isFlipped, onClick }) => {
  // Determine media type
  const isVideo = adventure.media?.type === 'video' || 
                 (adventure.image && adventure.image.match(/\.(mp4|webm|mov)$/i));

  return (
    <div className="relative h-full w-full cursor-pointer" onClick={onClick}>
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 0 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />
              <div className="absolute bottom-4 left-4 z-20">
                <h3 className="text-2xl font-bold text-white">{adventure.name}</h3>
              </div>
              
              {/* Media Renderer */}
              {isVideo ? (
                <video
                  src={adventure.media?.src || adventure.image}
                  poster={adventure.media?.poster}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={(e) => console.error("Video failed to load", e)}
                />
              ) : (
                <Image
                  src={adventure.image}
                  alt={adventure.name}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.error("Image failed to load", adventure.image);
                  }}
                />
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 bg-gradient-to-br ${adventure.color} ${adventure.textColor} p-6 rounded-xl shadow-lg overflow-y-auto`}
          >
            <motion.h3 
              className="text-2xl font-bold mb-4"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {adventure.name}
            </motion.h3>
            <motion.p 
              className="mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {adventure.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="font-semibold mb-2">Popular Locations:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {adventure.locations.map((location, index) => (
                  <li key={index}>{location}</li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
// Destination Slider Component
const DestinationSlider = ({ places, categoryColor, textColor }) => {
  const [currentIndices, setCurrentIndices] = useState(places.map(() => 0));
  const [flippedCards, setFlippedCards] = useState(places.map(() => false));
  const [autoSlide, setAutoSlide] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.2 });

  const nextSlide = (index, e) => {
    e?.stopPropagation();
    setCurrentIndices(prev => {
      const newIndices = [...prev];
      newIndices[index] = (prev[index] + 1) % places[index].images.length;
      return newIndices;
    });
  };

  const prevSlide = (index, e) => {
    e?.stopPropagation();
    setCurrentIndices(prev => {
      const newIndices = [...prev];
      newIndices[index] = (prev[index] - 1 + places[index].images.length) % places[index].images.length;
      return newIndices;
    });
  };

  const toggleFlip = (index) => {
    setFlippedCards(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
    setAutoSlide(!flippedCards[index]);
  };

  // Auto slide effect
  useEffect(() => {
    if (!autoSlide) return;

    const interval = setInterval(() => {
      setCurrentIndices(prev => 
        prev.map((current, idx) => 
          !flippedCards[idx] ? (current + 1) % places[idx].images.length : current
        )
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [autoSlide, flippedCards]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1]
        }
      } : { opacity: 0, y: 50 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {places.map((place, index) => (
        <motion.div
          key={place.name}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            type: "spring", 
            stiffness: 300,
            damping: 15
          }}
          className="relative h-64 rounded-xl overflow-hidden group"
        >
          <DestinationCard 
            place={{...place, currentImage: place.images[currentIndices[index]]}} 
            isFlipped={flippedCards[index]} 
            onClick={() => toggleFlip(index)}
            bgColor={categoryColor}
            textColor={textColor}
          />

          {!flippedCards[index] && (
            <>
              <motion.button
                onClick={(e) => prevSlide(index, e)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full z-30 opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="text-white" size={20} />
              </motion.button>
              <motion.button
                onClick={(e) => nextSlide(index, e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full z-30 opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="text-white" size={20} />
              </motion.button>
              
              <motion.div 
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {place.images.map((_, imgIndex) => (
                  <motion.div
                    key={imgIndex}
                    className={`w-2 h-2 rounded-full transition-all ${currentIndices[index] === imgIndex ? 'bg-white' : 'bg-white/50'}`}
                    whileHover={{ scale: 1.5 }}
                  />
                ))}
              </motion.div>

              <motion.div 
                className="absolute inset-0"
                key={currentIndices[index]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Image
                  src={place.images[currentIndices[index]]}
                  alt={place.name}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Updated Adventure Slider Component
const AdventureSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [flippedCards, setFlippedCards] = useState(adventures.map(() => false));
  const [autoSlide, setAutoSlide] = useState(true);
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const isInView = useInView(sliderRef, { amount: 0.2 });

  const nextSlide = useCallback(() => {
    if (!autoSlide) return;
    setDirection(1);
    setCurrentIndex(prev => (prev === adventures.length - 2 ? 0 : prev + 1));
  }, [autoSlide]);

  const prevSlide = () => {
    if (!autoSlide) return;
    setDirection(-1);
    setCurrentIndex(prev => (prev === 0 ? adventures.length - 2 : prev - 1));
  };

  const toggleFlip = (index) => {
    setFlippedCards(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
    
    // Check if any card is flipped
    const anyFlipped = flippedCards.some((flipped, i) => i !== index ? flipped : !flippedCards[index]);
    setAutoSlide(!anyFlipped);
  };

  // Handle scroll events to unflip cards
  useEffect(() => {
    const handleScroll = () => {
      // Unflip all cards when scrolling
      setFlippedCards(adventures.map(() => false));
      setAutoSlide(true);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto slide effect with increased interval (8 seconds)
  useEffect(() => {
    if (!autoSlide) return;
    const interval = setInterval(nextSlide, 8000);
    return () => clearInterval(interval);
  }, [nextSlide, autoSlide]);

  const visibleAdventures = [
    adventures[currentIndex % adventures.length],
    adventures[(currentIndex + 1) % adventures.length]
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 mb-6 text-center"
      >
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-2"
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.2,
            type: "spring",
            stiffness: 100
          }}
        >
          Thrill Seeker's Paradise
        </motion.h2>
        <motion.div 
          className="h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto w-20 rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: 80 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.3,
            type: "spring",
            stiffness: 50
          }}
        />
      </motion.div>

      {/* Full-width container with negative margins */}
      <section 
        ref={containerRef}
        className="w-screen bg-gradient-to-r from-[#bdf8e293] to-[#5df3bc93] py-6 relative left-1/2 right-1/2 -mx-[50vw]"
      >
        <motion.div
          ref={sliderRef}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { 
            opacity: 1, 
            y: 0,
            transition: { 
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1]
            }
          } : { opacity: 0, y: 50 }}
          className="max-w-7xl mx-auto px-4"
        >
          <div className="relative">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2"
              >
                {visibleAdventures.map((adventure, index) => (
                  <motion.div
                    key={adventure.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300,
                      damping: 15
                    }}
                    className="relative h-52 rounded-xl overflow-hidden group"
                  >
                    <AdventureCard 
                      adventure={adventure}
                      isFlipped={flippedCards[adventure.id - 1]} 
                      onClick={() => toggleFlip(adventure.id - 1)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <motion.button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/20 p-2 rounded-full z-20 hidden md:block"
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ 
                opacity: 1, 
                x: 0,
                backgroundColor: "rgba(0,0,0,0.4)"
              }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="text-white" size={32} />
            </motion.button>
            <motion.button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/20 p-2 rounded-full z-20 hidden md:block"
              initial={{ opacity: 0, x: 10 }}
              whileHover={{ 
                opacity: 1, 
                x: 0,
                backgroundColor: "rgba(0,0,0,0.4)"
              }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="text-white" size={32} />
            </motion.button>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-4 space-x-3">
              {adventures.map((_, index) => (
                <motion.div
                  key={index}
                  onClick={() => setCurrentIndex(index % (adventures.length - 1))}
                  className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                    index === currentIndex || index === currentIndex + 1 ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
};

// Popular Destinations Component
function PopularDestinations() {
  return (
    <section className="px-4 py-12 md:py-16 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: false }}
        className="mb-12 text-center"
      >
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-gray-800 mb-2"
          initial={{ scale: 0.9 }}
          whileInView={{ scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.2,
            type: "spring",
            stiffness: 100
          }}
        >
          Kashmir's Crown Jewels
        </motion.h2>
        <motion.div 
          className="h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto w-24 rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: 96 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.3,
            type: "spring",
            stiffness: 50
          }}
        />
      </motion.div>
      
      <motion.div 
        className="bg-[#bdf8e293] rounded-3xl p-6 md:p-8 backdrop-blur-sm border border-green-100 shadow-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: false }}
      >
        <div className="space-y-16">
          {destinations.map((category) => (
            <div key={category.category} className="space-y-6">
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: false }}
                className={`text-2xl font-semibold ${category.textColor} bg-gradient-to-r ${category.color} py-2 px-4 rounded-lg inline-block shadow-md`}
              >
                {category.category}
              </motion.h3>
              <DestinationSlider 
                places={category.places} 
                categoryColor={category.color}
                textColor={category.textColor}
              />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// Main Component
export default function MainContent() {
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
    <>
      <section className="relative -mt-20 mx-4 z-10">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-10xl mx-auto h-44">
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

      <PopularDestinations />
      <AdventureSlider />
    </>
  );
} //Now add fAQ's here and then About section