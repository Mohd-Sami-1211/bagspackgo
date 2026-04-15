'use client';
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const FAQ = ({ faqs, activeIndex, toggleFAQ }) => {
  return ( <div className="px-4 sm:px-6 md:px-8 w-full mx-auto">
<div
  className="text-center mb-10"
>
  <h2
    className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 transition-transform duration-500 hover:scale-105"
  >
    Frequently Asked <span className="text-green-600">Questions</span>
  </h2>
  <div
    className="h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto w-24 rounded-full mb-8"
  />
</div>

    <div
      className="w-full mx-auto max-w-7xl"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex-col justify-center transition-colors hover:border-slate-300 ${index >= 4 ? 'hidden md:flex' : 'flex'}`}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full text-left focus:outline-none flex justify-between items-center gap-4"
            >
              <h3 className="text-sm font-bold text-slate-800 leading-snug">{faq.question}</h3>
              <motion.span
                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-slate-400 shrink-0 text-xs"
              >
                ▼
              </motion.span>
            </button>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: activeIndex === index ? 1 : 0,
                height: activeIndex === index ? "auto" : 0
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className="text-slate-500 text-sm mt-3 leading-relaxed">{faq.answer}</p>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
};

export default FAQ;
