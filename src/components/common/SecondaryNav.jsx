'use client';
import { useState, useRef, useEffect } from 'react';
import { Mountain, Globe, Hotel, Plane, Globe2 } from 'lucide-react';

const tabs = [
  { label: 'Trip', icon: <Globe size={18} /> },
  { label: 'Trek', icon: <Mountain size={18} /> },
  { label: 'Hotels', icon: <Hotel size={18} /> },
  { label: 'Flights', icon: <Plane size={18} /> },
  { label: 'Merger', icon: <Globe2 size={18} /> },
];

export default function SecondaryNav() {
  const [active, setActive] = useState('Trip');
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = useRef([]);

  useEffect(() => {
    const currentIndex = tabs.findIndex((tab) => tab.label === active);
    const currentRef = tabRefs.current[currentIndex];
    if (currentRef) {
      setUnderlineStyle({
        width: currentRef.offsetWidth,
        left: currentRef.offsetLeft
      });
    }
  }, [active]);

  return (
    <div className="relative bg-white/50 shadow-sm">
      <div className="relative flex justify-center space-x-16 px-12 text-gray-700 font-medium text-lg">
        <span
          className="absolute bottom-0 h-1 bg-green-500 transition-all duration-300"
          style={underlineStyle}
        />
        
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            ref={(el) => (tabRefs.current[idx] = el)}
            onClick={() => setActive(tab.label)}
            className="relative py-4 flex items-center gap-2 hover:text-green-600 transition-colors"
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}