'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play, Star, Users, Calendar, Award, ArrowRight, Mountain, Camera, Heart } from 'lucide-react';
import AdContent from '../../common/AdContent';
import PhotoCard from '../../common/PhotoCard';
import VideoCard from '../../common/VideoCard';
import AboutUs from '../../common/AboutUs';
import FAQ from '../../common/FAQ';
import TripSearchInput from './TripSearchInput';

// Destinations data with category colors
const destinations = [
  {
    category: "Mountain Valleys",
    color: "from-green-500 to-green-700",
    textColor: "text-white",
    places: [
      {
        name: "Gulmarg",
        images: [
          "/images/Gulmarg1.jpeg",
          "/images/Gulmarg2.jpeg",
          "/images/Gulmarg3.jpeg",
          "/images/Gulmarg4.jpeg"
        ],
        description: "Known as the 'Meadow of Flowers', Gulmarg is a premier ski destination with the world's highest gondola ride. In summer, the valley transforms into a colorful carpet of wildflowers against the backdrop of snow-capped peaks."
      },
      {
        name: "Sonmarg",
        images: [
          "/images/Sonmarg1.jpeg",
          "/images/Sonmarg2.jpeg",
          "/images/Sonmarg3.jpeg",
          "/images/Sonmarg4.jpeg"
        ],
        description: "The 'Meadow of Gold' is the gateway to the Himalayan high-altitude lakes like Vishansar and Krishansar. Sonmarg serves as the base camp for the challenging Amarnath Yatra pilgrimage."
      },
      {
        name: "Pahalgam",
        images: [
          "/images/Pahalgam1.jpeg",
          "/images/Pahalgam2.jpeg",
          "/images/Pahalgam3.jpeg",
          "/images/Pahalgam4.jpg"
        ],
        description: "The 'Valley of Shepherds' is where the Lidder River flows through pine forests and alpine meadows. Pahalgam is the starting point for the annual Amarnath Yatra pilgrimage."
      }
    ]
  },
  {
    category: "Natural Wonders",
    color: "from-green-500 to-green-700",
    textColor: "text-white",
    places: [
      {
        name: "Doodhpathri",
        images: [
          "/images/Doodhpathri1.jpeg",
          "/images/Doodhpathri2.jpeg",
          "/images/Doodhpathri3.jpeg",
          "/images/Doodhpathri4.jpeg"
        ],
        description: "This 'Valley of Milk' gets its name from the frothy white appearance of its gushing streams. Doodhpathri's rolling green meadows dotted with wildflowers resemble a fairy tale landscape."
      },
      {
        name: "Betaab Valley",
        images: [
          "/images/Betaab1.jpeg",
          "/images/Betaab2.jpeg",
          "/images/Betaab3.jpeg",
          "/images/Betaab4.jpeg"
        ],
        description: "Named after the Bollywood movie 'Betaab', this valley is known for its lush green meadows, crystal clear streams, and breathtaking mountain views."
      },
      {
        name: "Aru Valley",
        images: [
          "/images/Aru1.jpeg",
          "/images/Aru2.jpeg",
          "/images/Aru3.jpeg",
          "/images/Aru4.jpeg"
        ],
        description: "A picturesque valley known for its scenic beauty, trekking routes, and as the starting point for the Kolahoi Glacier trek."
      }
    ]
  },
  {
    category: "Cultural Gems",
    color: "from-green-500 to-green-700",
    textColor: "text-white",
    places: [
      {
        name: "Mughal Gardens",
        images: [
          "/images/MG-1.jpeg",
          "/images/MG-2.jpeg",
          "/images/MG-3.jpeg",
          "/images/MG-4.jpeg"
        ],
        description: "The trio of Nishat Bagh, Shalimar Bagh, and Chashme Shahi showcase Persian-style terraced gardens with cascading fountains and vibrant flowerbeds."
      },
      {
        name: "Dal Lake",
        images: [
          "/images/Dal1.jpeg",
          "/images/Dal2.jpeg",
          "/images/Dal3.jpeg",
          "/images/Dal4.jpeg"
        ],
        description: "The 'Jewel in the Crown of Kashmir' is famous for its colorful shikaras and floating houseboats. Morning markets on vendor boats sell everything from flowers to handicrafts."
      },
      {
        name: "Shankaracharya Temple",
        images: [
          "/images/Shankaracharya1.jpeg",
          "/images/Shankaracharya2.jpeg",
          "/images/Shankaracharya3.jpeg",
          "/images/Shankaracharya4.jpeg"
        ],
        description: "An ancient temple dedicated to Lord Shiva, located on a hilltop offering panoramic views of Srinagar and the Dal Lake."
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
    description: "Experience world-class skiing in the powdery slopes of Gulmarg, home to one of the highest ski resorts in the world. The Apharwat Peak offers challenging runs for experts while the Kongdoori slopes are perfect for beginners.",
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
    description: "Glide through the tranquil waters of Dal Lake in traditional Kashmiri houseboats and shikaras. Visit floating markets, Mughal gardens, and witness the sunset over the Himalayas.",
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
    description: "Explore the Great Lakes Trek, a 7-day journey through alpine meadows, high-altitude lakes, and snow-capped peaks. Other popular trails include the Tarsar Marsar trek and the Kolahoi Glacier trek.",
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

const faqs = [
  {
    question: "What is bagspackgo?",
    answer: "bagspackgo is a travel platform that connects tourists directly with local tour guides and small travel firms. It allows travelers to plan personalized trips, manage itineraries, and even join or create group trips with other like-minded travelers."
  },
  {
    question: "How bagspackgo differs from traditional travel agencies?",
    answer: "Unlike traditional agencies, bagspackgo gives travelers direct access to verified local guides, full itinerary customization, and transparent pricing."
  },
  {
    question: "How do I book a tour on bagspackgo?",
    answer: "Simply search by destination, travel dates, and number of travelers. Browse available guides, view their services and ratings, and once you find the right one, you can connect and book directly through the platform."
  },
  {
    question: "Can I customize my itinerary after booking a guide?",
    answer: "Yes! bagspackgo lets you collaborate with your chosen guide to add or remove services, activities, and local experiences based on your preferences."
  },
  {
    question: "Are the guides on bagspackgo verified?",
    answer: "Yes, all guides go through a verification process that includes identity checks, service quality screening, and community reviews from previous travelers."
  },
  {
    question: "What if I have an issue with my guide or trip?",
    answer: "We're here to help. You can contact our support team directly through the platform. We offer dispute resolution and mediation to ensure you have a safe and enjoyable experience."
  },
  {
    question: "Is there a way to communicate with other travelers?",
    answer: "Yes! bagspackgo includes a community chat where travelers can share tips, ask questions, and connect before, during, and after their trips."
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

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Delhi",
    rating: 5,
    text: "Kashmir Tours made our honeymoon absolutely magical! The attention to detail and local insights were incredible. Our houseboat stay on Dal Lake was straight out of a dream.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b402?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Rajesh Kumar",
    location: "Mumbai",
    rating: 5,
    text: "Best family vacation ever! The kids loved every moment, and we felt completely safe throughout the journey. The skiing instructor in Gulmarg was exceptionally patient with our children.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Sarah Johnson",
    location: "USA",
    rating: 5,
    text: "As a solo traveler, I was nervous, but the team made me feel welcome and secure. Kashmir is truly paradise! The trek to Tarsar Marsar lakes was the highlight of my year.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Amit Patel",
    location: "Bangalore",
    rating: 5,
    text: "The photography tour exceeded all expectations. Our guide knew all the hidden spots for perfect shots. The sunrise at Doodhpathri was worth waking up at 4 AM!",
    image: "https://images.unsplash.com/photo-1542103749-8ef59b94f47e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
  }
];

const stats = [
  { number: "50,000+", label: "Happy Travelers" },
  { number: "15+", label: "Years Experience" },
  { number: "200+", label: "Tour Packages" },
  { number: "98%", label: "Satisfaction Rate" }
];

const features = [
  {
    icon: Mountain,
    title: "Expert Local Guides",
    description: "Our experienced guides know every hidden gem and secret path in Kashmir"
  },
  {
    icon: Camera,
    title: "Picture Perfect Moments",
    description: "Capture stunning memories with our photography-focused tour packages"
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join thousands of travelers who've discovered Kashmir's magic with us"
  },
  {
    icon: Award,
    title: "Award Winning Service",
    description: "Recognized for excellence in sustainable tourism and customer satisfaction"
  },
  {
    icon: Heart,
    title: "Passionate Team",
    description: "We're locals who love sharing the beauty and culture of our homeland"
  },
  {
    icon: Calendar,
    title: "Year-Round Adventures",
    description: "From summer treks to winter sports, we've got activities for every season"
  }
];

const DestinationSlider = ({ places, categoryColor, textColor }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
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
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  // Auto-slide function
  const startAutoSlide = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isFlipped) {
        setDirection(1);
        setCurrentIndex(prev => (prev === adventures.length - 1 ? 0 : prev + 1));
      }
    }, 5000); // Change slide every 5 seconds
  }, [isFlipped]);

  // Initialize auto-slide
  useEffect(() => {
    if (isAutoPlaying) {
      startAutoSlide();
    }
    return () => clearInterval(intervalRef.current);
  }, [isAutoPlaying, startAutoSlide]);

  const nextSlide = useCallback(() => {
    if (isFlipped) return;
    setDirection(1);
    setCurrentIndex(prev => (prev === adventures.length - 1 ? 0 : prev + 1));
    if (isAutoPlaying) {
      clearInterval(intervalRef.current);
      startAutoSlide();
    }
  }, [isFlipped, isAutoPlaying, startAutoSlide]);

  const prevSlide = () => {
    if (isFlipped) return;
    setDirection(-1);
    setCurrentIndex(prev => (prev === 0 ? adventures.length - 1 : prev - 1));
    if (isAutoPlaying) {
      clearInterval(intervalRef.current);
      startAutoSlide();
    }
  };

  const toggleFlip = () => {
    const newFlippedState = !isFlipped;
    setIsFlipped(newFlippedState);

    if (newFlippedState) {
      clearInterval(intervalRef.current);
    } else if (isAutoPlaying) {
      startAutoSlide();
    }
  };

  return (
    <>
      {/* Header outside the colored background */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 -mt-16">
        <div className="text-center pt-20">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              type: "spring",
              stiffness: 100
            }}
          >
            Thrill Seeker's <span className="text-green-600">Paradise</span>
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
      </div>

      {/* Content with colored background */}
      <section className="relative overflow-hidden py-16 bg-gradient-to-br from-green-50 to-blue-50">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/30 to-transparent -z-0" />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-amber-400/10 blur-3xl -z-0" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Main slider */}
          <div className="relative">
            {/* Card container */}
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-xl">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0"
                >
                  <VideoCard
                    media={adventures[currentIndex].media}
                    name={adventures[currentIndex].name}
                    description={adventures[currentIndex].description}
                    locations={adventures[currentIndex].locations}
                    isFlipped={isFlipped}
                    onClick={toggleFlip}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation arrows (hidden when flipped) */}
            {!isFlipped && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full z-20 shadow-lg hover:bg-white transition-all"
                  aria-label="Previous adventure"
                >
                  <ChevronLeft className="text-gray-800" size={28} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full z-20 shadow-lg hover:bg-white transition-all"
                  aria-label="Next adventure"
                >
                  <ChevronRight className="text-gray-800" size={28} />
                </button>
              </>
            )}

            {/* Pagination (hidden when flipped) */}
            {!isFlipped && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                {adventures.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      if (isAutoPlaying) {
                        clearInterval(intervalRef.current);
                        startAutoSlide();
                      }
                    }}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-green-500 w-6' : 'bg-gray-300'}`}
                    aria-label={`Go to adventure ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

const Testimonials = () => {
  const visibleTestimonials = testimonials.slice(0, 4);

  return (
    <section className="px-4 py-16 max-w-7xl mx-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 -mt-16">
        <div className="text-center pt-20">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              type: "spring",
              stiffness: 100
            }}
          >
            Travel <span className="text-green-600">Stories</span>
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
      </div>

      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-blue-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visibleTestimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.location}</p>
                </div>
                <div className="ml-auto flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium hover:from-green-600 hover:to-green-700 transition-all shadow-md">
            View All Stories
            <ArrowRight className="ml-2" size={18} />
          </a>
        </div>
      </div>
    </section>
  );
};

const PopularDestinations = () => {
  return (
    <section className="px-4 py-16 max-w-7xl mx-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 -mt-16">
        <div className="text-center pt-20">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-4"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              type: "spring",
              stiffness: 100
            }}
          >
            Kashmir Crown <span className="text-green-600">Jewels</span>
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
      </div>

      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-6 md:p-8 backdrop-blur-sm border border-blue-100 shadow-sm">
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
      {/* Wrapper div with responsive height and bottom padding */}
      <div className="relative h-[45vh] sm:h-[70vh] md:h-[60vh] pb-24 sm:pb-32 md:pb-0 ">

        {/* Hero Section */}
        <section
          id="trip-page"
          className="relative h-[25vh] sm:h-[64vh] md:h-[60vh] w-full overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero.svg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
        </section>

        {/* Search Input Container */}
        <div className="absolute top-[10vh] sm:top-[35vh] md:top-[40vh] w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 z-10">
          <div className="w-full max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full"
            >
              <TripSearchInput />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Rest of the sections */}
      <div className='mt-80 sm:mt-16 md:mt-24 '>
        <AdContent />
      </div>
      <PopularDestinations />
      <AdventureSlider />
      <Testimonials />
      <AboutUs />
      <FAQ faqs={faqs} activeIndex={activeIndex} toggleFAQ={toggleFAQ} />
    </div>



  );
}