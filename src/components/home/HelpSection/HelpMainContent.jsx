'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaHeadset, FaBookOpen, FaRocket, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function HelpMainContent() {
  const helpOptions = [
    { title: 'Getting Started', description: 'Learn the basics...', icon: <FaRocket className="text-white text-3xl" />, color: 'from-pink-500 to-red-400' },
    { title: 'FAQs', description: 'Find answers to common questions.', icon: <FaQuestionCircle className="text-white text-3xl" />, color: 'from-indigo-500 to-blue-400' },
    { title: 'Guides & Tutorials', description: 'Step-by-step guides.', icon: <FaBookOpen className="text-white text-3xl" />, color: 'from-green-500 to-teal-400' },
    { title: 'Contact Support', description: 'Reach out to our team.', icon: <FaHeadset className="text-white text-3xl" />, color: 'from-yellow-500 to-orange-400' },
  ];

  // State for FAQ accordion
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    {
      question: 'How do I reset my password?',
      answer: 'Go to your account settings, click "Change Password", and follow the instructions. You’ll receive a reset link via email.'
    },
    {
      question: 'Can I access content offline?',
      answer: 'Yes! Our mobile app lets you download select guides and FAQs for offline use under the "Downloads" tab.'
    },
    {
      question: 'How do I report a bug or provide feedback?',
      answer: 'Use the “Contact Support” card above or email us directly at support@example.com. We value your feedback!'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 -mt-20 space-y-16">

      {/* 1. Option Cards */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-600">How can we help you?</h1>
        <p className="text-gray-600 mt-3 text-lg">Find the answers, guides, and support you need.</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {helpOptions.map((option, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition-all duration-300"
          >
            <div className={`p-4 rounded-full bg-gradient-to-r ${option.color} shadow-md mb-4`}>
              {option.icon}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{option.title}</h2>
            <p className="text-gray-500 mt-2">{option.description}</p>
          </motion.div>
        ))}
      </div>

      {/* 2. Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search help articles, guides..."
            className="w-full py-3 pl-4 pr-12 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
          <FaQuestionCircle className="absolute right-4 top-3.5 text-gray-400" />
        </div>
      </motion.div>

      {/* 3. Quick Links */}
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Quick Links</h3>
        <div className="flex flex-wrap gap-3">
          {['Start a Project', 'Pricing Plans', 'API Docs', 'Community Forum'].map((link) => (
            <motion.a
              key={link}
              href="#"
              whileHover={{ scale: 1.05 }}
              className="text-sm bg-green-50 text-green-700 px-4 py-2 rounded-full hover:bg-green-100 transition"
            >
              {link}
            </motion.a>
          ))}
        </div>
      </div>

      {/* 4. FAQ Accordion */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <span className="font-medium text-gray-800">{faq.question}</span>
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4 text-gray-600"
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* 5. Video Walkthrough */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Watch: How to Get Started</h3>
        <div className="aspect-w-16 aspect-h-9 bg-black rounded-xl overflow-hidden shadow-lg">
          {/* Replace the src with your actual walkthrough video embed */}
          <iframe
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Walkthrough video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </motion.div>

      {/* 6. Additional Support CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-12"
      >
        <p className="text-gray-600 mb-4">Still need help?</p>
        <motion.a
          href="/contact"
          whileHover={{ scale: 1.05 }}
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-full font-semibold shadow-md hover:bg-green-700 transition"
        >
          Contact Support
        </motion.a>
      </motion.div>
    </div>
  );
}
