'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FaqAccordion({ faqs }) {
  const [expandedFaqs, setExpandedFaqs] = useState({});

  const toggleFaq = (index) => {
    setExpandedFaqs(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <HelpCircle size={20} className="text-amber-500" /> Frequently Asked Questions
      </h3>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleFaq(i)}
              className={`w-full text-left p-4 flex justify-between items-center gap-3 transition-colors ${expandedFaqs[i] ? 'bg-amber-50 border-b border-amber-100' : 'hover:bg-gray-50'}`}
            >
              <span className="font-semibold text-sm text-gray-800">{faq.question}</span>
              <motion.div animate={{ rotate: expandedFaqs[i] ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className={`w-5 h-5 flex-shrink-0 ${expandedFaqs[i] ? 'text-amber-600' : 'text-gray-400'}`} />
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {expandedFaqs[i] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="p-4 text-gray-600 text-sm leading-relaxed bg-amber-50/30">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}