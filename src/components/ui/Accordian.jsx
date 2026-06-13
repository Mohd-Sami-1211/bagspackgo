'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';


export default function Accordion({
  items = [],
  icon,
  defaultOpen = [0],
  allowMultiple = true,
  activeClassName = 'bg-gray-50 border-b border-gray-100',
  contentClassName = 'bg-white',
  chevronActiveClassName = 'text-emerald-600',
}) {
  const [expanded, setExpanded] = useState(
    defaultOpen.reduce((acc, i) => ({ ...acc, [i]: true }), {})
  );

  const toggle = (index) => {
    if (!allowMultiple) {
      setExpanded(prev => ({ [index]: !prev[index] }));
    } else {
      setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggle(i)}
            className={`w-full text-left p-4 flex justify-between items-center gap-3 transition-colors
              ${expanded[i] ? activeClassName : 'hover:bg-gray-50'}`}
          >
            <span className={`font-semibold text-sm text-gray-800 flex items-center gap-2 ${item.titleClassName || ''}`}>
              {icon && <span className="flex-shrink-0">{icon}</span>}
              {item.title}
            </span>
            <motion.div animate={{ rotate: expanded[i] ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown
                className={`w-5 h-5 flex-shrink-0 transition-colors ${expanded[i] ? chevronActiveClassName : 'text-gray-400'}`}
              />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {expanded[i] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className={`p-4 text-gray-600 text-sm leading-relaxed ${contentClassName}`}>
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}