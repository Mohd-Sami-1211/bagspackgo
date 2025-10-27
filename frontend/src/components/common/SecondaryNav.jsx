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
    <div className="relative bg-white/50 shadow-sm">
      {/* Desktop / Tablet */}
      <div className="hidden md:flex justify-center px-12 text-gray-700 font-medium text-lg relative">
        <div className="flex space-x-16 relative">
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
                  className="flex items-center gap-2"
                >
                  {tab.icon}
                  {tab.label}
                </motion.span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile: responsive version without horizontal scroll */}
      <div className="md:hidden flex justify-around text-gray-700 font-medium text-base relative">
        {tabs.map((tab, idx) => {
          const isActive = pathname?.startsWith(tab.path);
          return (
            <Link
              key={tab.label}
              href={tab.path}
              ref={el => tabRefs.current[idx] = el}
              className={`flex flex-col items-center py-2 ${
                isActive ? 'text-green-600 font-semibold' : 'hover:text-green-500'
              }`}
            >
              <motion.span
                animate={{
                  scale: isActive ? 1.05 : 1,
                  color: isActive ? '#16a34a' : '#374151'
                }}
                transition={{ type: 'spring', stiffness: 500 }}
                className="flex flex-col items-center gap-1 text-sm"
              >
                {tab.icon}
                {tab.label}
              </motion.span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
