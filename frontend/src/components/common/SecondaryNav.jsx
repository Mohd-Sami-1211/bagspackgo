// components/common/SecondaryNav.jsx
'use client';
import { Mountain, Users, Plane, Globe2, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const tabs = [
  { label: 'Trip', icon: <Plane size={18} />, path: '/user/trip' },
  { label: 'Trek', icon: <Mountain size={18} />, path: '/user/trek' },
  { label: 'Merger', icon: <Users size={18} />, path: '/user/merger' },
  { label: 'Events', icon: <CalendarDays size={18} />, path: '/user/events' },
  { label: 'Community', icon: <Globe2 size={18} />, path: '/user/community' },
];

export default function SecondaryNav() {
  const pathname = usePathname();
  const [underlineWidth, setUnderlineWidth] = useState(0);
  const [underlineLeft, setUnderlineLeft] = useState(0);
  const tabRefs = useRef([]);

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => pathname?.startsWith(tab.path));
    if (activeIndex >= 0 && tabRefs.current[activeIndex]) {
      const activeTab = tabRefs.current[activeIndex];
      setUnderlineWidth(activeTab.offsetWidth);
      setUnderlineLeft(activeTab.offsetLeft);
    }
  }, [pathname]);

  return (
    <div className="relative bg-white/50 shadow-sm w-full overflow-hidden">
      {/* Desktop / Tablet - Improved centering */}
      <div className="hidden md:flex justify-center w-full text-gray-700 font-medium text-lg relative">
        <div className="flex justify-between md:justify-center md:gap-8 lg:gap-16 w-full max-w-4xl mx-auto px-4 md:px-8">
          {/* Underline indicator */}
          <motion.div
            className="absolute bottom-0 h-1 bg-green-500 rounded-full"
            animate={{
              width: underlineWidth,
              left: underlineLeft,
            }}
            transition={{
              type: 'spring',
              stiffness: 150,
              damping: 20,
              mass: 1,
              restDelta: 0.001,
            }}
          />
          
          {tabs.map((tab, idx) => {
            const isActive = pathname?.startsWith(tab.path);
            return (
              <Link
                key={tab.label}
                href={tab.path}
                ref={el => tabRefs.current[idx] = el}
                className={`relative py-4 flex items-center gap-2 ${
                  isActive ? 'text-green-600 font-semibold' : 'hover:text-green-500'
                }`}
              >
                <motion.span
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    color: isActive ? '#16a34a' : '#374151'
                  }}
                  transition={{ type: 'spring', stiffness: 500 }}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  {tab.icon}
                  {tab.label}
                </motion.span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile: Perfectly evenly spaced grid without dividers */}
      <div className="md:hidden grid grid-cols-5 gap-0 w-full">
        {tabs.map((tab, idx) => {
          const isActive = pathname?.startsWith(tab.path);
          return (
            <Link
              key={tab.label}
              href={tab.path}
              ref={el => tabRefs.current[idx] = el}
              className={`
                flex flex-col items-center justify-center py-3 
                ${isActive ? 'text-green-600 font-semibold' : 'text-gray-700 hover:text-green-500'}
              `}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.05 : 1,
                  color: isActive ? '#16a34a' : '#374151'
                }}
                transition={{ type: 'spring', stiffness: 500 }}
                className="flex flex-col items-center justify-center gap-1"
              >
                {tab.icon}
                <span className="text-xs font-medium truncate w-full text-center px-1">
                  {tab.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}