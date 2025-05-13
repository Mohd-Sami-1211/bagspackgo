'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhotoCard from '../../common/PhotoCard';
import AboutUs from '../../common/AboutUs';
import FAQ from '../../common/FAQ';
import AdContent from '../../common/AdContent';

// Trek data
const treks = [
  {
    name: "Great Lakes Trek",
    images: [
      "/images/GL1.jpeg",
      "/images/GL2.jpeg",
      "/images/GL3.jpeg",
      "/images/GL4.jpeg"
    ],
    description: "This 7-day trek takes you through some of the most stunning alpine lakes in the Kashmir Himalayas. Traverse through meadows of wildflowers, cross high mountain passes, and camp beside crystal-clear lakes. The route includes Vishansar, Krishansar, Gadsar, Satsar, and Gangabal lakes, each more beautiful than the last. Best done between July and September."
  },
  {
    name: "Tarsar Marsar Trek",
    images: [
      "/images/TM1.jpeg",
      "/images/TM2.jpeg",
      "/images/TM3.jpeg",
      "/images/TM4.jpeg"
    ],
    description: "Discover the twin alpine lakes of Tarsar and Marsar on this moderate 6-day trek. The trail offers breathtaking views of snow-capped peaks, lush green valleys, and vibrant meadows. The highlight is the heart-shaped Tarsar Lake surrounded by towering mountains. This trek is especially beautiful in July and August when the meadows are carpeted with wildflowers."
  },
  {
    name: "Kolahoi Glacier Trek",
    images: [
      "/images/KG1.jpeg",
      "/images/KG2.jpeg",
      "/images/KG3.jpeg",
      "/images/KG4.jpeg"
    ],
    description: "A challenging trek to the 'Goddess of Light' - the Kolahoi Glacier, the largest glacier in Kashmir. This 5-day adventure takes you through dense pine forests, alpine meadows, and rugged mountain terrain. The glacier stands at an altitude of 4,700m and offers spectacular views of the surrounding peaks. Best attempted by experienced trekkers between June and September."
  },
  {
    name: "Naranag Gangabal Trek",
    images: [
      "/images/NG1.jpeg",
      "/images/NG2.jpeg",
      "/images/NG3.jpeg",
      "/images/NG4.jpeg"
    ],
    description: "This 4-day trek starts from the ancient Naranag temple ruins and takes you to the sacred Gangabal Lake. The trail passes through lush meadows, pine forests, and offers panoramic views of Harmukh peak. The lake is considered holy by Hindus and is the site of annual pilgrimages. Ideal for those looking for a shorter but rewarding trek experience."
  },
  {
    name: "Sonamarg-Vishansar Trek",
    images: [
      "/images/SV1.jpeg",
      "/images/SV2.jpeg",
      "/images/SV3.jpeg",
      "/images/SV4.jpeg"
    ],
    description: "Begin your journey from the 'Meadow of Gold' (Sonamarg) to the stunning Vishansar Lake on this 5-day trek. Cross the challenging Nichnai Pass (4,100m) and witness the breathtaking transition from lush green valleys to rugged mountain landscapes. The turquoise waters of Vishansar Lake reflecting the surrounding peaks create a picture-perfect setting."
  },
  {
    name: "Aru Valley to Lidderwat Trek",
    images: [
      "/images/AL1.jpeg",
      "/images/AL2.jpeg",
      "/images/AL3.jpeg",
      "/images/AL4.jpeg"
    ],
    description: "A relatively easy 3-day trek perfect for beginners, starting from the picturesque Aru Valley. Follow the Lidder River through pine forests and open meadows to reach Lidderwat, a beautiful camping site surrounded by mountains. This trek offers great views of the Kolahoi Peak and is ideal for families and first-time trekkers."
  }
];

// FAQ data
const faqs = [
  {
    question: "What is the best time for trekking in Kashmir?",
    answer: "Most local guides recommend trekking in Kashmir between June and September, when the weather is pleasant and trails are open. You can check season availability directly on each trek listing."
  },
  {
    question: "Do I need prior trekking experience?",
    answer: "It depends on the trek you choose. Each guide lists the difficulty level and experience required. You can filter treks based on your comfort level."
  },
  {
    question: "What gear should I carry?",
    answer: "Each guide provides a gear checklist specific to their trek. Basic items include trekking shoes, layered clothing, rain protection, and personal essentials."
  },
  {
    question: "Are guides and porters included?",
    answer: "Yes, each trek is organized by a local guide who may include porters, cooks, and support staff in their package. These details are mentioned in the trek description."
  },
  {
    question: "What about altitude sickness?",
    answer: "Guides are experienced in handling high-altitude situations and plan the trek to ensure proper acclimatization. You can also reach out to them for specific advice beforehand."
  },
  {
    question: "How difficult are the treks?",
    answer: "Treks are categorized from easy to challenging. You can view trek difficulty on each guide’s listing and filter results to match your fitness level."
  },
  {
    question: "Are meals and accommodation provided during the trek?",
    answer: "Yes, most guides offer complete packages including meals and accommodation (tents, homestays, or lodges). Specific inclusions are detailed in each trek listing."
  },
  {
    question: "Is travel insurance required?",
    answer: "While BagspackGo doesn't require insurance, some guides may recommend or require it for high-altitude treks. It's advisable to have insurance that covers trekking activities."
  },
  {
    question: "Can I join as a solo traveler?",
    answer: "Yes, solo travelers can join group treks listed by guides or use our 'Merger' feature to connect with others planning the same route."
  },
  {
    question: "Who handles permits and local regulations?",
    answer: "Local guides are responsible for obtaining necessary permits and handling local regulations. They usually include permit costs in their trek pricing."
  },
  {
    question: "How do I communicate with the guide before booking?",
    answer: "Each trek listing allows you to chat directly with the guide. You can clarify any doubts, ask for customizations, or understand the itinerary better."
  },
  {
    question: "What if the trek is canceled or I need to reschedule?",
    answer: "Cancellation and rescheduling policies are set by individual guides. Please review the terms on the listing page or contact the guide directly through the platform."
  }
];


const TrekSlider = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {treks.map((trek) => (
        <div key={trek.name} className="relative h-64 rounded-xl overflow-hidden">
          <PhotoCard
            images={trek.images}
            name={trek.name}
            description={trek.description}
            bgColor="from-emerald-500 to-teal-600"
            textColor="text-white"
          />
        </div>
      ))}
    </div>
  );
};

const PopularTreks = () => {
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
          Kashmir's Premier Treks
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
      
      {/* Reduced bottom padding from p-6 md:p-8 to p-6 md:px-8 md:pb-6 */}
      <div className="bg-[#bdf8e293] rounded-3xl p-6 md:px-8 md:pb-6 md:pt-8 backdrop-blur-sm border border-green-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {treks.map((trek) => (
            <motion.div
              key={trek.name}
              className="relative h-64 rounded-xl overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <PhotoCard
                images={trek.images}
                name={trek.name}
                description={trek.description}
                bgColor="from-emerald-500 to-teal-600"
                textColor="text-white"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function TrekMainContent() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

return (
    <div className="w-full">
      <AdContent />
      <PopularTreks />
      
      {/* Remove padding from AboutUs wrapper since it's already in the component */}
      <div className="mt-[-64px]">  {/* Negative margin to compensate for double padding */}
        <AboutUs />
      </div>
      
      <FAQ faqs={faqs} activeIndex={activeIndex} toggleFAQ={toggleFAQ} />
    </div>
  );
}