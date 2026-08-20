// components/common/SecondaryNav.jsx
'use client';
import { Plane, CalendarDays, Compass, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const tabs = [
  { label: 'Trip', icon: <Plane size={18} />, path: '/user/trip' },
  { label: 'OffBeats', icon: <Compass size={18} />, path: '/user/offbeats' },
  { label: 'Events', icon: <CalendarDays size={18} />, path: '/user/events' },
  { label: 'Companion', icon: <UserCheck size={18} />, path: '/user/companion' },
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
    <div className="relative bg-white border-b border-slate-200 w-full overflow-hidden shadow-sm">
      {/* Desktop / Tablet - Improved centering */}
      <div className="hidden md:flex justify-center w-full text-gray-700 font-medium text-lg relative px-4">
        <div className="flex justify-center md:gap-16 lg:gap-32 w-full max-w-5xl">
          {/* Underline indicator */}
          <motion.div
            className="absolute bottom-0 h-0.5 bg-emerald-600 rounded-t-full"
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
                className={`relative py-4 flex items-center gap-2 text-sm transition-colors ${isActive ? 'text-emerald-700 font-semibold' : 'text-slate-600 hover:text-emerald-600 font-medium'}`}
              >
                <motion.span
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    color: isActive ? '#047857' : '#475569'
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
      <div className="md:hidden grid grid-cols-4 gap-0 w-full mb-2">
        {tabs.map((tab, idx) => {
          const isActive = pathname?.startsWith(tab.path);
          return (
            <Link
              key={tab.label}
              href={tab.path}
              ref={el => tabRefs.current[idx] = el}
              className={`
                flex flex-col items-center justify-center py-3 transition-colors
                ${isActive ? 'text-emerald-700 font-semibold bg-emerald-50/50' : 'text-slate-600 hover:text-emerald-600 font-medium'}
              `}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.05 : 1,
                  color: isActive ? '#047857' : '#475569'
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