// components/common/SecondaryNav.jsx
'use client';
import { Mountain, Users, Plane, Globe2, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const tabs = [
  { label: 'Trip', icon: <Plane size={18} />, path: '/trip' },
  { label: 'Trek', icon: <Mountain size={18} />, path: '/trek' },
  { label: 'Merger', icon: <Users size={18} />, path: '/merger' },
  { label: 'Events', icon: <CalendarDays size={18} />, path: '/events' },
  { label: 'Community', icon: <Globe2 size={18} />, path: '/community' },
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
      <div className="relative flex justify-center px-12 text-gray-700 font-medium text-lg">
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
    stiffness: 150,  // Reduced from 300 (softer spring)
    damping: 20,    // Reduced from 25 (less resistance)
    mass: 1,        // Increased from default (more weight = slower movement)
    restDelta: 0.001 // Finer stopping point
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
    </div>
  );
}