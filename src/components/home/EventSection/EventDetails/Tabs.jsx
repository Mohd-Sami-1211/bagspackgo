'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Tabs({ tab1, tab2, tab3 }) {
  const [activeTab, setActiveTab] = useState('eventDetails');
  const tabsRef = useRef(null);

  const tabs = [
    { key: 'eventDetails', label: 'Event Details' },
    { key: 'itinerary', label: 'Itinerary' },
    { key: 'info', label: 'Important Info' },
  ];

  return (
    <div ref={tabsRef} className="bg-white/90 backdrop-blur-sm px-4 sm:px-6 py-4 shadow-lg rounded-2xl overflow-hidden scroll-mt-20">
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex flex-nowrap sm:flex-wrap justify-start gap-2 sm:gap-0 sm:space-x-6 px-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap py-3.5 px-3 border-b-2 font-semibold text-sm sm:text-base capitalize transition-all flex-shrink-0 ${
                activeTab === tab.key
                  ? 'border-emerald-600 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <motion.div 
        key={activeTab} 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'eventDetails' && tab1}
        {activeTab === 'itinerary' && tab2}
        {activeTab === 'info' && tab3}
      </motion.div>
    </div>
  );
}