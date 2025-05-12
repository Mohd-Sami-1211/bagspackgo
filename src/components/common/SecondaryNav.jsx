// components/common/SecondaryNav.jsx
'use client';
import { Mountain, Globe, Hotel, Plane, Globe2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const tabs = [
  { label: 'Trip', icon: <Globe size={18} />, path: '/trip' },
  { label: 'Trek', icon: <Mountain size={18} />, path: '/trek' },
  { label: 'Hotels', icon: <Hotel size={18} />, path: '/hotels' },
  { label: 'Flights', icon: <Plane size={18} />, path: '/flights' },
  { label: 'Merger', icon: <Globe2 size={18} />, path: '/merger' },
];

export default function SecondaryNav() {
  const pathname = usePathname();
  const activeIndex = tabs.findIndex(tab => pathname?.startsWith(tab.path));

  return (
    <div className="relative bg-white/50 shadow-sm">
      <div className="relative flex justify-center space-x-16 px-12 text-gray-700 font-medium text-lg">
        {tabs.map((tab, idx) => {
          const isActive = pathname?.startsWith(tab.path);
          return (
            <Link
              key={tab.label}
              href={tab.path}
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
              
              {isActive && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    mass: 0.5
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}