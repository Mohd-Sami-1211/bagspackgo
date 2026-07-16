'use client';
import { useState, use } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Check, X, Calendar, Camera, Info, Loader2, ArrowLeft, Bookmark, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import OffbeatBookingForm from '@/components/user/offbeats/OffbeatBookingForm';
import GroupTripBookingForm from '@/components/user/offbeats/GroupTripBookingForm';
import { useOffbeatDetail, useOffbeatPhotos } from '@/lib/useTripCache';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1621245799986-e3d1c9ccfc65?auto=format&fit=crop&q=80';

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

/**
 * Lazy-loading image with a blurred placeholder.
 * Uses loading="lazy" so the browser defers off-screen images.
 * Shows a spinner until the image fires its onLoad event.
 */
const ImageWithLoader = ({ src, alt, className, eager = false }) => {
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
                loading={eager ? 'eager' : 'lazy'}
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
    
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isGroupBookingOpen, setIsGroupBookingOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [activeItineraryDay, setActiveItineraryDay] = useState(0);

    // SWR-cached fetch for offbeat detail (2 min dedupe, stale-while-revalidate)
    const { data, isLoading, error } = useOffbeatDetail(id, {
        revalidateOnFocus: false,
        onSuccess: (data) => {
            // Check saved status once data is loaded and user is authenticated
            if (isAuthenticated && data?.data?._id) {
                fetch('/api/user/saved')
                    .then(res => res.json())
                    .then(d => {
                        if (d.success && d.saved) {
                            setIsSaved(d.saved.some(s => s.itemType === 'offbeat' && s.itemId === id));
                        }
                    })
                    .catch(() => {});
            }
            // Track activity visit
            if (isAuthenticated && data?.data?._id) {
                fetch('/api/activity/track-offbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ offbeatId: data.data._id, heartbeat: false })
                }).catch(() => {});
            }
            // Force login if not authenticated after 7s
            if (!authLoading && !isAuthenticated) {
                setTimeout(() => {
                    if (openAuthModal) {
                        openAuthModal({ closable: false, hideTabs: true, tab: 'user' });
                    }
                }, 7000);
            }
        }
    });

    // Background fetch for heavy base64 gallery photos
    const { data: photosData, isLoading: photosLoading } = useOffbeatPhotos(data?.success ? id : null, {
        revalidateOnFocus: false,
    });

    const offbeat = data?.data || null;

    const handleSaveToggle = async () => {
        if (!isAuthenticated && openAuthModal) {
            openAuthModal({ closable: true, hideTabs: false, tab: 'user' });
            return;
        }
        setSaving(true);
        try {
            if (isSaved) {
                await fetch(`/api/user/saved?itemId=${id}`, { method: 'DELETE' });
                setIsSaved(false);
            } else {
                await fetch('/api/user/saved', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemId: id, itemType: 'offbeat' })
                });
                setIsSaved(true);
            }
        } catch (e) {
            console.error('Failed to toggle save', e);
        } finally {
            setSaving(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: offbeat.title,
                    text: offbeat.shortDescription,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share canceled or failed', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    if (isLoading) return <OffbeatDetailsSkeleton />;

    if (error || !offbeat || !data?.success) {
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

    // Hero image: always use coverPhoto — this is the "face" of the destination
    const heroImage = offbeat.coverPhoto || FALLBACK_IMAGE;

    // Gallery photos: fetch asynchronously to prevent blocking the main page load
    const rawPhotos = photosData?.data?.photographs || offbeat.photographs || [];
    const galleryPhotos = rawPhotos.filter(
        (photo) => photo !== offbeat.coverPhoto
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Image Section */}
            <div className="relative h-[60vh] min-h-[400px] max-h-[600px] w-full">
                <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                    {/* Hero is eager-loaded — it's above the fold */}
                    <ImageWithLoader src={heroImage} alt={offbeat.title} className="w-full h-full object-cover opacity-80" eager />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-20 pointer-events-none" />
                </div>
                
                {/* Top Nav Overlay */}
                <div className="absolute top-6 left-4 sm:left-8 z-30 flex items-center justify-between w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] pointer-events-none">
                    <button 
                        onClick={() => router.back()}
                        className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/40 text-white hover:bg-slate-800/60 transition border border-white/20"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center gap-3 pointer-events-auto">
                        <button 
                            onClick={handleShare}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/40 text-white hover:bg-slate-800/60 transition border border-white/20"
                            title="Share Destination"
                        >
                            <Share2 size={18} />
                        </button>
                        <button 
                            onClick={handleSaveToggle}
                            disabled={saving}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/40 text-white hover:bg-slate-800/60 transition border border-white/20 disabled:opacity-50"
                            title={isSaved ? "Unsave Destination" : "Save Destination"}
                        >
                            <Bookmark size={18} className={isSaved ? "fill-white" : ""} />
                        </button>
                    </div>
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

                    {/* Gallery — shows additional photos and videos only (NOT the cover photo) */}
                    {(galleryPhotos.length > 0 || offbeat.videos?.length > 0) && (
                        <section>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Camera className="text-emerald-600" /> Gallery
                            </h2>
                            {photosLoading ? (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Loader2 className="w-5 h-5 animate-spin" /> Loading gallery photos...
                                </div>
                            ) : (
                            <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                                {galleryPhotos.map((photo, idx) => (
                                    <div 
                                        key={`photo-${idx}`} 
                                        className="break-inside-avoid rounded-xl overflow-hidden shadow-sm relative bg-slate-100 cursor-pointer group"
                                        onClick={() => setSelectedMedia({ type: 'image', url: photo })}
                                    >
                                        {/* Gallery images are lazy-loaded — they're below the fold */}
                                        <ImageWithLoader
                                            src={photo}
                                            alt={`Gallery photo ${idx + 1}`}
                                            className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                        />
                                    </div>
                                ))}
                                
                                {offbeat.videos?.map((video, idx) => (
                                    <div 
                                        key={`video-${idx}`} 
                                        className="break-inside-avoid rounded-xl overflow-hidden shadow-sm bg-slate-100 flex items-center justify-center cursor-pointer group"
                                        onClick={() => setSelectedMedia({ type: 'video', url: video })}
                                    >
                                        <video 
                                            src={video} 
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500" 
                                        />
                                    </div>
                                ))}
                            </div>
                            )}
                        </section>
                    )}

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
                            {/* Desktop: Split-Pane View / Mobile: Interactive Stack */}
                            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                {/* Left Side: Day Selector */}
                                <div className="w-full lg:w-1/3 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] pb-2 lg:pb-0 scrollbar-hide shrink-0 snap-x">
                                    {offbeat.itinerary.map((day, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveItineraryDay(idx)}
                                            className={`text-left px-5 py-4 rounded-2xl transition-all duration-300 flex items-center gap-4 shrink-0 snap-center min-w-[200px] lg:min-w-0 border ${
                                                activeItineraryDay === idx
                                                    ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                                                    : 'bg-slate-50 border-transparent hover:bg-slate-100'
                                            }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                                                activeItineraryDay === idx 
                                                    ? 'bg-emerald-600 text-white shadow-md' 
                                                    : 'bg-white text-slate-500 border border-slate-200'
                                            }`}>
                                                {idx + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className={`font-bold text-sm truncate ${activeItineraryDay === idx ? 'text-emerald-800' : 'text-slate-700'}`}>
                                                    Day {idx + 1}
                                                </h4>
                                                {typeof day === 'object' && day.title && (
                                                    <p className={`text-xs truncate mt-0.5 ${activeItineraryDay === idx ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                        {day.title}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Right Side: Day Details */}
                                <div className="w-full lg:w-2/3 bg-slate-50 rounded-2xl p-6 lg:p-8 border border-slate-100 min-h-[300px]">
                                    <motion.div
                                        key={activeItineraryDay}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
                                                {activeItineraryDay + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-800">
                                                    Day {activeItineraryDay + 1}
                                                </h3>
                                                {typeof offbeat.itinerary[activeItineraryDay] === 'object' && offbeat.itinerary[activeItineraryDay].title && (
                                                    <p className="text-emerald-600 font-medium text-sm mt-0.5">
                                                        {offbeat.itinerary[activeItineraryDay].title}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {typeof offbeat.itinerary[activeItineraryDay] === 'string' ? (
                                            <p className="text-slate-600 leading-relaxed text-lg">
                                                {offbeat.itinerary[activeItineraryDay]}
                                            </p>
                                        ) : (
                                            <ul className="space-y-4">
                                                {offbeat.itinerary[activeItineraryDay].points?.map((point, pIdx) => (
                                                    <li key={pIdx} className="text-slate-600 flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                                        <Check className="text-emerald-500 mt-1 shrink-0 w-5 h-5" />
                                                        <span className="leading-relaxed">{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </motion.div>
                                </div>
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

                        {/* What to Bring & Restrictions */}
                        {(offbeat.whatToBring?.length > 0 || offbeat.restrictions?.length > 0) && (
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                                {offbeat.whatToBring?.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Check size={16} /></span>
                                            What to Bring
                                        </h3>
                                        <ul className="space-y-2">
                                            {offbeat.whatToBring.map((item, idx) => (
                                                <li key={idx} className="text-slate-600 flex items-start gap-2 text-sm">
                                                    <span className="text-blue-400 mt-1">•</span> {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {offbeat.restrictions?.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"><Info size={16} /></span>
                                            Restrictions
                                        </h3>
                                        <ul className="space-y-2">
                                            {offbeat.restrictions.map((item, idx) => (
                                                <li key={idx} className="text-slate-600 flex items-start gap-2 text-sm">
                                                    <span className="text-orange-400 mt-1">•</span> {item}
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
                            <p className="text-emerald-100 text-sm mb-6 relative z-10">Book your spot and our experts will craft the perfect plan.</p>
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
                                Book Now
                            </button>
                        </div>

                        {/* Secondary Group Trip CTA */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Looking for a Group?</h3>
                            <p className="text-slate-500 text-xs mb-4">
                                We quite often host group trips to these destinations. Register your interest and we'll notify you when a group is forming!
                            </p>
                            <button 
                                onClick={() => {
                                    if (!isAuthenticated && openAuthModal) {
                                        openAuthModal({ closable: true, hideTabs: false, tab: 'user' });
                                    } else {
                                        setIsGroupBookingOpen(true);
                                    }
                                }}
                                className="w-full py-3 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 rounded-xl font-bold transition flex items-center justify-center gap-2"
                            >
                                <Calendar size={18} /> Register Group Interest
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

            <GroupTripBookingForm 
                isOpen={isGroupBookingOpen}
                onClose={() => setIsGroupBookingOpen(false)}
                offbeatId={offbeat._id}
                offbeatTitle={offbeat.title}
                user={user}
            />

            {/* Media Modal — full-screen overlay for viewing gallery items */}
            {selectedMedia && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedMedia(null)}>
                    <button 
                        className="absolute top-6 right-6 text-white hover:text-emerald-400 transition"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <X size={32} />
                    </button>
                    {selectedMedia.type === 'image' ? (
                        <img 
                            src={selectedMedia.url} 
                            alt="Gallery full view" 
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()} 
                        />
                    ) : (
                        <video 
                            src={selectedMedia.url} 
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()} 
                        />
                    )}
                </div>
            )}
        </div>
    );
}
