'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Compass, MapPin, ArrowRight, Loader2, Search } from 'lucide-react';
import Select from 'react-select';

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '48px',
    fontSize: '0.95rem',
    borderColor: state.isFocused ? '#10b981' : 'rgba(226, 232, 240, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    boxShadow: state.isFocused ? '0 0 0 1px #10b981' : null,
    '&:hover': { borderColor: state.isFocused ? '#10b981' : '#d1d5db', backgroundColor: '#fff' },
    borderRadius: '1rem',
    cursor: 'pointer'
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 8px',
    '@media (max-width: 640px)': {
      padding: '0',
      justifyContent: 'center'
    }
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    marginTop: '4px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    minWidth: '200px',
    left: 'auto',
    right: 0
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menuList: (provided) => ({ ...provided, padding: '4px', fontSize: '0.95rem' }),
  option: (provided, state) => ({
    ...provided,
    borderRadius: '0.5rem',
    backgroundColor: state.isSelected ? '#a7f3d0' : state.isFocused ? '#d1fae5' : 'white',
    color: state.isSelected ? '#065f46' : '#1e293b',
    margin: '2px 0',
    padding: '10px 12px',
    transition: 'all 0.15s ease-out',
    '&:active': { backgroundColor: '#6ee7b7', color: '#064e3b' },
    '&:hover:not(:active)': { backgroundColor: '#d1fae5', boxShadow: 'inset 0 0 0 1px #a7f3d0' },
  }),
};

const regionOptions = [
    { value: 'All', label: 'All Locations' },
    { value: 'Kashmir', label: 'Kashmir' },
    { value: 'Jammu', label: 'Jammu' },
    { value: 'Chenab Valley', label: 'Chenab Valley' }
];

const OffbeatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/80 rounded-[2rem] border border-white shadow-sm flex flex-col h-[460px] animate-pulse overflow-hidden">
                <div className="h-64 bg-slate-200 shrink-0" />
                <div className="p-6 flex flex-col flex-grow">
                    <div className="h-4 bg-slate-200 rounded-md w-1/3 mb-4" />
                    <div className="h-7 bg-slate-200 rounded-md w-3/4 mb-4" />
                    <div className="space-y-2 mb-6 flex-grow">
                        <div className="h-4 bg-slate-200 rounded-md w-full" />
                        <div className="h-4 bg-slate-200 rounded-md w-5/6" />
                    </div>
                    <div className="mt-auto h-12 bg-slate-200 rounded-2xl w-full" />
                </div>
            </div>
        ))}
    </div>
);

export default function OffBeatsListingPage() {
    const [offbeats, setOffbeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const [activeRegion, setActiveRegion] = useState(regionOptions[0]);

    useEffect(() => {
        const cachedData = sessionStorage.getItem('offbeats_data');
        if (cachedData) {
            setOffbeats(JSON.parse(cachedData));
            setLoading(false);
            return;
        }

        fetch('/api/public/offbeats')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOffbeats(data.data);
                    sessionStorage.setItem('offbeats_data', JSON.stringify(data.data));
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const suggestions = offbeats.reduce((acc, ob) => {
        if (!searchTerm.trim()) return acc;
        if (ob.title.toLowerCase().includes(searchTerm.toLowerCase()) && !acc.includes(ob.title)) acc.push(ob.title);
        if (ob.destination.toLowerCase().includes(searchTerm.toLowerCase()) && !acc.includes(ob.destination)) acc.push(ob.destination);
        return acc;
    }, []).slice(0, 5);

    const filteredOffbeats = offbeats.filter(ob => {
        const matchesSearch = ob.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              ob.destination.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = activeRegion.value === 'All' || ob.region === activeRegion.value;
        return matchesSearch && matchesRegion;
    });

    return (
        <div className="w-full min-h-screen bg-slate-50 relative">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-slate-50 to-slate-50"></div>
            
            {/* Header Section */}
            <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 py-4 px-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-all">
                <div className="max-w-7xl mx-auto">
                    {/* Search & Filters */}
                    <div className="flex flex-row items-center gap-2 sm:gap-4 w-full">
                        <div className="relative flex-1" ref={searchRef}>
                            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                            <input 
                                type="text"
                                placeholder="Search destinations..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-2xl border border-slate-200/60 bg-white/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition shadow-sm text-slate-700 text-sm sm:text-base font-medium placeholder:text-slate-400"
                            />
                            
                            {/* Suggestions Dropdown */}
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-[1050]"
                                    >
                                        {suggestions.map((suggestion, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => {
                                                    setSearchTerm(suggestion);
                                                    setShowSuggestions(false);
                                                }}
                                                className="px-4 py-3 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 cursor-pointer text-sm sm:text-base transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0"
                                            >
                                                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                <span className="truncate">{suggestion}</span>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="w-[48px] sm:flex-[4] sm:max-w-[250px] shrink-0 relative z-[1000]">
                            <Select 
                                instanceId="region-filter-select"
                                options={regionOptions}
                                value={activeRegion}
                                onChange={setActiveRegion}
                                isSearchable={false}
                                classNamePrefix="react-select"
                                styles={selectStyles}
                                menuPosition="absolute"
                                components={{
                                    IndicatorSeparator: () => null,
                                    DropdownIndicator: () => (
                                        <div className="hidden sm:flex items-center pr-2 text-slate-400">
                                            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </div>
                                    )
                                }}
                                formatOptionLabel={({ label }, { context }) => (
                                    context === 'value' ? (
                                        <div className="flex items-center justify-center w-full">
                                            <MapPin className="w-[18px] h-[18px] sm:hidden text-slate-600" strokeWidth={2.5} />
                                            <span className="hidden sm:inline truncate">{label}</span>
                                        </div>
                                    ) : (
                                        <span>{label}</span>
                                    )
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Listing Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <OffbeatsSkeleton />
                ) : filteredOffbeats.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm"
                    >
                        <Compass className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-slate-700">More destinations coming soon!</h3>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">We are working to bring more destinations for this location.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {filteredOffbeats.map((offbeat, index) => (
                                <motion.div
                                    key={offbeat._id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-500 border border-slate-100 flex flex-col h-full relative"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img 
                                            src={offbeat.photographs?.[0] || 'https://images.unsplash.com/photo-1621245799986-e3d1c9ccfc65?auto=format&fit=crop&q=80'} 
                                            alt={offbeat.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4 bg-white px-4 py-1.5 rounded-full text-xs font-black tracking-wide text-emerald-700 shadow-[0_4px_12px_rgba(0,0,0,0.1)] z-10 border border-white/50">
                                            {offbeat.region || 'Unknown Region'}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow relative">
                                        <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-3">
                                            <MapPin className="w-4 h-4" />
                                            {offbeat.destination}
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors">
                                            {offbeat.title}
                                        </h3>
                                        <p className="text-slate-600 line-clamp-3 mb-6 flex-grow">
                                            {offbeat.shortDescription}
                                        </p>
                                        <Link href={`/user/offbeats/${offbeat._id}`} className="mt-auto block">
                                            <button className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-[0_8px_20px_-8px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_25px_-8px_rgba(16,185,129,0.6)] opacity-95 hover:opacity-100">
                                                View Details
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                            </button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
