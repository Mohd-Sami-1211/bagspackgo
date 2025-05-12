'use client';
import { motion } from "framer-motion";

const AboutUs = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
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

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
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
    </div>
  );
};

export default AboutUs;