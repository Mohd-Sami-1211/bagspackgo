'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AdContent from '../../common/AdContent';
import PhotoCard from '../../common/PhotoCard';
import VideoCard from '../../common/VideoCard';
import AboutUs from '../../common/AboutUs';
import FAQ from '../../common/FAQ';

// Destinations data with category colors
const destinations = [
  {
    category: "Mountain Valleys",

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
      poster: "/images/skiing-poster.jpg",
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

  },
  {
    id: 2,
    name: "Shikara Ride",
    media: {
      type: "video",
      src: "/images/shikara.mp4",
      poster: "/images/shikara-poster.jpg",
      alt: "Shikara ride on Dal Lake",
      attributes: {
        loop: true,
        muted: true,
        autoplay: true,
        playsinline: true
      }
    },
    description: "Glide through the tranquil waters of Dal Lake in traditional Kashmiri houseboats and shikaras. Visit floating markets, Mughal gardens, and witness the sunset over the Himalayas. Don't miss the early morning lotus blooms in Nigeen Lake.",
    locations: ["Dal Lake", "Nigeen Lake", "Jhelum River"],

  },
  {
    id: 3,
    name: "Trekking",
    media: {
      type: "video",
      src: "/images/trekking.mp4",
      poster: "/images/trekking-poster.jpg",
      alt: "Trekking in Kashmir",
      attributes: {
        loop: true,
        muted: true,
        autoplay: true,
        playsinline: true
      }
    },
    description: "Explore the Great Lakes Trek, a 7-day journey through alpine meadows, high-altitude lakes, and snow-capped peaks. Other popular trails include the Tarsar Marsar trek and the Kolahoi Glacier trek. Best season: June to September.",
    locations: ["Great Lakes Trek", "Tarsar Marsar", "Kolahoi Glacier"],

  },
  {
    id: 4,
    name: "Paragliding",
    media: {
      type: "video",
      src: "/images/paragliding.mp4",
      poster: "/images/paragliding-poster.jpg",
      alt: "Paragliding in Kashmir",
      attributes: {
        loop: true,
        muted: true,
        autoplay: true,
        playsinline: true
      }
    },
    description: "Soar above the Kashmir Valley with breathtaking views of snow-capped mountains and lush green meadows. The best spots are in Sonmarg and Pahalgam, with tandem flights available for beginners.",
    locations: ["Sonmarg", "Pahalgam", "Betaab Valley"],

  }
];

// FAQ data
const faqs = [
  {
    question: "What is BagspackGo?",
    answer: "BagspackGo is a travel platform that connects tourists directly with local tour guides and small travel firms. It allows travelers to plan personalized trips, manage itineraries, and even join or create group trips with other like-minded travelers."
  },
  {
    question: "How BagspackGo differs from traditional travel agencies?",
    answer: "Unlike traditional agencies, BagspackGo gives travelers direct access to verified local guides, full itinerary customization, transparent pricing, and a unique group travel feature called 'Merger' for solo or social adventurers."
  },
  {
    question: "What is the Merger feature?",
    answer: "Merger allows solo travelers or small groups to create or join a travel room. You can select a guide, propose a travel plan, and let others join the journey—making group travel easier, safer, and more social."
  },
  {
    question: "Can I travel solo or do I have to join a group using Merger?",
    answer: "You can travel solo if you prefer. Merger is an optional feature designed for those looking to connect and travel with others who have similar plans."
  },
  {
    question: "How do I book a tour on BagspackGo?",
    answer: "Simply search by destination, travel dates, and number of travelers. Browse available guides, view their services and ratings, and once you find the right one, you can connect and book directly through the platform."
  },
  {
    question: "Can I customize my itinerary after booking a guide?",
    answer: "Yes! BagspackGo lets you collaborate with your chosen guide to add or remove services, activities, and local experiences based on your preferences."
  },
  {
    question: "Are the guides on BagspackGo verified?",
    answer: "Yes, all guides go through a verification process that includes identity checks, service quality screening, and community reviews from previous travelers."
  },
  {
    question: "What if I have an issue with my guide or trip?",
    answer: "We're here to help. You can contact our support team directly through the platform. We offer dispute resolution and mediation to ensure you have a safe and enjoyable experience."
  },
  {
    question: "Is there a way to communicate with other travelers?",
    answer: "Yes! BagspackGo includes a community chat where travelers can share tips, ask questions, and connect before, during, and after their trips."
  },
  {
    question: "What languages are supported on the platform?",
    answer: "Currently, the platform supports multiple Indian languages and English, with more language options coming soon to make travel planning easier for everyone."
  },
  {
    question: "How is pricing determined?",
    answer: "Each guide sets their own prices based on the services they offer. You'll see clear pricing upfront, and you can add extras if you want to customize your package."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept major credit/debit cards, UPI, net banking, and digital wallets. Secure transactions are handled through our trusted payment gateway partners."
  }
];


const DestinationSlider = ({ places, categoryColor, textColor }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {places.map((place) => (
        <div key={place.name} className="relative h-64 rounded-xl overflow-hidden">
          <PhotoCard
            images={place.images}
            name={place.name}
            description={place.description}
            bgColor={categoryColor}
            textColor={textColor}
          />
        </div>
      ))}
    </div>
  );
};

const AdventureSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [flippedCards, setFlippedCards] = useState(adventures.map(() => false));
  const [autoSlide, setAutoSlide] = useState(true);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null); // Ref to store interval
  const isInView = useInView(sliderRef, { amount: 0.2 });

  // Clear interval helper
  const clearAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

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
    const newFlippedState = !flippedCards[index];
    setFlippedCards(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = newFlippedState;
      return newFlipped;
    });
    
    // Pause auto-slide when flipped, resume when unflipped
    setAutoSlide(!newFlippedState);
  };

  // Reset flip state and restart auto-slide when slide changes
  useEffect(() => {
    setFlippedCards(adventures.map(() => false));
    setAutoSlide(true);
  }, [currentIndex]);

  // Auto slide effect with exact 7 second interval
  useEffect(() => {
    clearAutoSlide(); // Clear any existing interval
    
    if (autoSlide) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 10000); // Exactly 10 seconds
    }

    return () => clearAutoSlide();
  }, [autoSlide, nextSlide]);

  const visibleAdventures = [
    adventures[currentIndex % adventures.length],
    adventures[(currentIndex + 1) % adventures.length]
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
        <motion.h2 
          className="text-4xl font-bold text-gray-800 mb-4"
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
          className="h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto w-24 rounded-full mb-12"
          initial={{ width: 0 }}
          whileInView={{ width: 96 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.3,
            type: "spring",
            stiffness: 50
          }}
        />
      </div>

            <div 
        className="w-screen -mx-4 bg-gradient-to-r from-[#bdf8e293] to-[#5df3bc93] py-8 h-[340px]"
        ref={sliderRef}
      >
        <div className="max-w-7xl mx-auto mr-[35px] h-full">
          <div className="relative h-full flex justify-center "> {/* Added flex justify-center */}
            <div className="w-full max-w-7xl px-4"> {/* New constrained width container */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full"
                >
                  {visibleAdventures.map((adventure, idx) => (
                    <motion.div
                      key={adventure.id}
                      className="relative h-full rounded-xl overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <VideoCard 
                        media={adventure.media}
                        name={adventure.name}
                        description={adventure.description}
                        locations={adventure.locations}
                        color={adventure.color}
                        textColor={adventure.textColor}
                        isFlipped={flippedCards[idx]}
                        onClick={() => toggleFlip(idx)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows - Adjusted positioning */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
              <motion.button
                onClick={prevSlide}
                className="absolute left-0 bg-black/30 p-3 rounded-full z-20 backdrop-blur-sm pointer-events-auto opacity-0 hover:opacity-100 transition-opacity duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="text-white" size={32} />
              </motion.button>
              <motion.button
                onClick={nextSlide}
                className="absolute right-0 bg-black/30 p-3 rounded-full z-20 backdrop-blur-sm pointer-events-auto opacity-0 hover:opacity-100 transition-opacity duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight className="text-white" size={32} />
              </motion.button>
            </div>

            {/* Navigation Dots */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center space-x-3 z-20">
              {adventures.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index % (adventures.length - 1));
                    setFlippedCards(adventures.map(() => false));
                    setAutoSlide(true);
                  }}
                  className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                    index === currentIndex || index === currentIndex + 1 ? 'bg-white scale-125' : 'bg-white/40'
                  }`}
                  whileHover={{ scale: 1.2 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const PopularDestinations = () => {
  return (
    <section className="px-4 py-16 max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <motion.h2 
          className="text-4xl font-bold text-gray-800 mb-4"
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
          className="h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto w-24 rounded-full mb-12"
          initial={{ width: 0 }}
          whileInView={{ width: 96 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.3,
            type: "spring",
            stiffness: 50
          }}
        />
      </div>
      
      <div className="bg-[#bdf8e293] rounded-3xl p-6 md:p-8 backdrop-blur-sm border border-green-100 shadow-sm">
        <div className="space-y-16">
          {destinations.map((category) => (
            <div key={category.category} className="space-y-6">
              <h3 className={`text-2xl font-semibold ${category.textColor} bg-gradient-to-r ${category.color} py-2 px-4 rounded-lg inline-block shadow-md`}>
                {category.category}
              </h3>
              <DestinationSlider 
                places={category.places} 
                categoryColor={category.color}
                textColor={category.textColor}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function TripMainContent() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full">
      <AdContent />
      <PopularDestinations />
      <AdventureSlider />
      <AboutUs />
      <FAQ faqs={faqs} activeIndex={activeIndex} toggleFAQ={toggleFAQ} />
    </div>
  );
}