'use client';
import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Check, X, Calendar, Camera, Info, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import OffbeatBookingForm from '@/components/user/offbeats/OffbeatBookingForm';

const OffbeatDetailsSkeleton = () => (
    <div className="min-h-screen bg-slate-50 animate-pulse pb-20">
        <div className="h-[60vh] min-h-[400px] w-full bg-slate-200" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                        <div className="h-10 bg-slate-200 rounded-lg w-3/4 mb-4" />
                        <div className="h-6 bg-slate-200 rounded-md w-1/3 mb-8" />
                        <div className="space-y-3">
                            <div className="h-4 bg-slate-200 rounded-md w-full" />
                            <div className="h-4 bg-slate-200 rounded-md w-full" />
                            <div className="h-4 bg-slate-200 rounded-md w-5/6" />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 h-96" />
                </div>
            </div>
            
            <div className="flex flex-col items-center justify-center mt-16 mb-8 gap-3">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                <p className="text-emerald-600 text-sm font-medium">Loading...</p>
            </div>
        </div>
    </div>
);

const ImageWithLoader = ({ src, alt, className }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <>
            {!loaded && (
                <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center z-0">
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
            )}
            <img 
                src={src} 
                alt={alt} 
                onLoad={() => setLoaded(true)} 
                className={`${className} transition-opacity duration-500 relative z-10 ${loaded ? '' : 'opacity-0'}`} 
            />
        </>
    );
};

export default function OffBeatDetailsPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, isAuthenticated, openAuthModal, authLoading } = useAuth();
    
    const [offbeat, setOffbeat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    // Fetch Details
    useEffect(() => {
        const cacheKey = `offbeat_data_${id}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            setOffbeat(JSON.parse(cachedData));
            setLoading(false);
            return;
        }

        fetch(`/api/public/offbeats/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setOffbeat(data.data);
                    sessionStorage.setItem(cacheKey, JSON.stringify(data.data));
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [id]);

    // Force Login after 6-8s if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated && offbeat) {
            const timer = setTimeout(() => {
                if (openAuthModal) {
                    openAuthModal({ closable: false, hideTabs: true, tab: 'user' });
                }
            }, 7000); // 7 seconds
            return () => clearTimeout(timer);
        }
    }, [authLoading, isAuthenticated, offbeat, openAuthModal]);

    // Track Activity heartbeat
    useEffect(() => {
        if (isAuthenticated && offbeat) {
            const trackVisit = (heartbeat = false) => {
                fetch('/api/activity/track-offbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ offbeatId: offbeat._id, heartbeat })
                }).catch(() => {});
            };

            trackVisit(false);
            const interval = setInterval(() => trackVisit(true), 15000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, offbeat]);

    if (loading) return <OffbeatDetailsSkeleton />;

    if (error || !offbeat) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-slate-50 text-center px-4">
                <h1 className="text-3xl font-bold text-slate-800 mb-4">Destination Not Found</h1>
                <p className="text-slate-500 mb-8">This offbeat destination might have been removed or is currently unavailable.</p>
                <Link href="/user/offbeats">
                    <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition">
                        Back to OffBeats
                    </button>
                </Link>
            </div>
        );
    }

    const mainImage = offbeat.photographs?.[0] || 'https://images.unsplash.com/photo-1621245799986-e3d1c9ccfc65?auto=format&fit=crop&q=80';

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Image Section */}
            <div className="relative h-[60vh] min-h-[400px] max-h-[600px] w-full">
                <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                    <ImageWithLoader src={mainImage} alt={offbeat.title} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-20 pointer-events-none" />
                </div>
                
                {/* Top Nav Overlay */}
                <div className="absolute top-24 left-4 sm:left-8 z-30">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/40 text-white hover:bg-slate-800/60 transition border border-white/20"
                    >
                        <ArrowLeft size={20} />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full px-4 sm:px-8 pb-12 z-30">
                    <div className="max-w-6xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4 text-sm sm:text-base">
                                <MapPin size={18} /> {offbeat.destination}
                            </div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                                {offbeat.title}
                            </h1>
                            <div className="flex flex-wrap gap-4 items-center">
                                <button 
                                    onClick={() => {
                                        if (!isAuthenticated && openAuthModal) {
                                            openAuthModal({ closable: true, hideTabs: false, tab: 'user' });
                                        } else {
                                            setIsBookingOpen(true);
                                        }
                                    }}
                                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg transition shadow-lg shadow-emerald-600/30"
                                >
                                    Book This Experience
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-16">
                    
                    {/* About */}
                    <section>
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Info className="text-emerald-600" /> About the Experience
                        </h2>
                        <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {offbeat.description}
                        </div>
                    </section>

                    {/* Highlights */}
                    {offbeat.highlights?.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">Experience Highlights</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {offbeat.highlights.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        <span className="text-slate-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Itinerary */}
                    {offbeat.itinerary?.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Calendar className="text-emerald-600" /> Itinerary
                            </h2>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {offbeat.itinerary.map((day, idx) => (
                                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-emerald-50 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-bold">
                                            {idx + 1}
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                            <h3 className="font-bold text-slate-800 text-lg mb-2">Day {idx + 1}</h3>
                                            <p className="text-slate-600">{day}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Gallery */}
                    {offbeat.photographs?.length > 1 && (
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Camera className="text-emerald-600" /> Gallery
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {offbeat.photographs.slice(1).map((photo, idx) => (
                                    <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-sm relative bg-slate-100">
                                        <ImageWithLoader src={photo} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500 cursor-pointer" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>

                {/* Sticky Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 space-y-8">
                        {/* Inclusions & Exclusions */}
                        {(offbeat.whatsIncluded?.length > 0 || offbeat.whatsExcluded?.length > 0) && (
                            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                                {offbeat.whatsIncluded?.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Check size={16} /></span>
                                            What's Included
                                        </h3>
                                        <ul className="space-y-3">
                                            {offbeat.whatsIncluded.map((item, idx) => (
                                                <li key={idx} className="text-slate-600 flex items-start gap-2 text-sm">
                                                    <span className="text-emerald-500 mt-1">•</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {offbeat.whatsExcluded?.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center"><X size={16} /></span>
                                            Not Included
                                        </h3>
                                        <ul className="space-y-3">
                                            {offbeat.whatsExcluded.map((item, idx) => (
                                                <li key={idx} className="text-slate-600 flex items-start gap-2 text-sm">
                                                    <span className="text-red-400 mt-1">•</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Booking CTA */}
                        <div className="bg-emerald-600 p-8 rounded-3xl shadow-xl shadow-emerald-600/20 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Ready for an Adventure?</h3>
                            <p className="text-emerald-100 text-sm mb-6 relative z-10">Submit an inquiry and our experts will craft the perfect plan.</p>
                            <button 
                                onClick={() => {
                                    if (!isAuthenticated && openAuthModal) {
                                        openAuthModal({ closable: true, hideTabs: false, tab: 'user' });
                                    } else {
                                        setIsBookingOpen(true);
                                    }
                                }}
                                className="w-full py-4 bg-white text-emerald-700 hover:bg-slate-50 rounded-xl font-bold transition shadow-md relative z-10"
                            >
                                Send Inquiry
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <OffbeatBookingForm 
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                offbeatId={offbeat._id}
                offbeatTitle={offbeat.title}
                user={user}
            />
        </div>
    );
}
