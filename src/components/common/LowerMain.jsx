import React, { useState } from "react";
import { motion } from "framer-motion";

const LowerMain = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* About Us Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
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
          About Us
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

      {/* About Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <div className="bg-gradient-to-r from-[#bdf8e293] to-[#adf0d793] rounded-2xl p-4 h-[500px] w-full flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 md:p-10 w-[calc(100%-32px)] h-[calc(100%-32px)] min-h-[400px] flex flex-col justify-center">
            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                At BagspackGo, we believe that travel should be personal, flexible, and filled with meaningful connections. That's why we've created a platform that does more than just list destinations—it opens up a world of possibilities by directly linking curious travelers with local tour guides and small travel firms that bring every journey to life.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Approach</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">
                        Verified local guides for authentic experiences
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">
                        Direct connection with no middlemen
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">
                        Full itinerary control and customization
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Unique Features</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">
                        Merger feature for group travel
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">
                        Expert-guided trekking adventures
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mt-1 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">
                        Tailored experiences for every traveler
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <p className="text-lg text-gray-700">
                Whether you're planning a peaceful trip, a challenging trek through the Himalayas, or a culturally immersive exploration, BagspackGo gives you the tools to shape your own experience. Browse our wide range of verified tour guides, compare offerings, and choose what fits your style.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
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
          Frequently Asked Questions
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
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-9xl mx-auto bg-[#bdf8e293] rounded-2xl p-8 mb-16"
      >
        <div className="grid md:grid-cols-2 gap-8">
          {/* First Column */}
          <div className="space-y-4">
            {faqs.slice(0, 6).map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-lg p-4 shadow-sm"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left focus:outline-none"
                >
                  <motion.div
                    className="flex justify-between items-center"
                    whileHover={{ color: "#10B981" }}
                  >
                    <h3 className="text-lg font-medium text-gray-800">{faq.question}</h3>
                    <motion.span
                      animate={{ rotate: activeIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-500"
                    >
                      ▼
                    </motion.span>
                  </motion.div>
                </button>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: activeIndex === index ? 1 : 0,
                    height: activeIndex === index ? "auto" : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2 text-gray-600 pl-2">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Second Column */}
          <div className="space-y-4">
            {faqs.slice(6, 12).map((faq, index) => (
              <motion.div 
                key={index + 6}
                className="bg-white rounded-lg p-4 shadow-sm"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <button
                  onClick={() => toggleFAQ(index + 6)}
                  className="w-full text-left focus:outline-none"
                >
                  <motion.div
                    className="flex justify-between items-center"
                    whileHover={{ color: "#10B981" }}
                  >
                    <h3 className="text-lg font-medium text-gray-800">{faq.question}</h3>
                    <motion.span
                      animate={{ rotate: activeIndex === index + 6 ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-500"
                    >
                      ▼
                    </motion.span>
                  </motion.div>
                </button>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: activeIndex === index + 6 ? 1 : 0,
                    height: activeIndex === index + 6 ? "auto" : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2 text-gray-600 pl-2">{faq.answer}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LowerMain;