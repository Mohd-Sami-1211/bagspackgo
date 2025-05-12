'use client';
import { motion } from "framer-motion";

const FAQ = ({ faqs, activeIndex, toggleFAQ }) => {
  return (
    <div className="px-4 max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="text-center mb-28"
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

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
          className="max-w-7xl mx-auto bg-[#bdf8e293] rounded-2xl p-8 mb-16"
      >
        <div className="max-w-7xl mx-auto">
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
                        transition={{ duration: 0.5 }}
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
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-gray-600 text-left">{faq.answer}</p>
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
                        transition={{ duration: 0.5 }}
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
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-gray-600 text-left">{faq.answer}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
    </div>
  );
};

export default FAQ;