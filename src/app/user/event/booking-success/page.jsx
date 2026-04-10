'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Home, MapPin, Calendar, Users, CreditCard, ChevronRight, Hash, User, Clock, Navigation, Download, Eye, EyeOff, Ticket, ExternalLink, Sparkles, X, AlertTriangle, ShieldCheck, List as ListIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';

function BookingSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookingId = searchParams.get('bookingId');
    const bookingRef = bookingId?.slice(-8).toUpperCase() || 'Processing...';

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Font style
    const fontStyle = {};

    useEffect(() => {
        const fetchBookings = async () => {
            if (!bookingId) { setLoading(false); return; }
            try {
                const res = await fetch('/api/user/bookings');
                const data = await res.json();
                if (data.success) {
                    const found = data.data?.find(b => b.id === bookingId || b._id === bookingId);
                    setBooking(found || null);
                }
            } catch (e) {
                console.error('Fetch booking error:', e);
            } finally {
                setLoading(false);
                setTimeout(() => setShowContent(true), 150);
            }
        };
        fetchBookings();
    }, [bookingId]);

    const handleDownloadPDF = () => {
        if (!bookingId) return;
        window.open(`/user/event/pass/${bookingId}?print=true`, '_blank');
    };

    const formatDate = (d) => {
        if (!d) return 'TBD';
        const date = new Date(d);
        if (isNaN(date)) return d;
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4" style={fontStyle}>
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs">Retrieving Booking Details...</p>
            </div>
        );
    }

    // Extract all fields
    const eventName = booking?.name || '';
    const companyName = booking?.guideName || booking?.companyName || booking?.guide || 'Organizer';
    const destinationName = booking?.destination || booking?.location || '';
    const destinationLink = booking?.destinationLink || '';
    const eventType = booking?.category || '';
    const eventDate = booking?.date;
    const duration = booking?.duration || '';
    const travelers = booking?.participants || [];
    const selectedPickup = booking?.selectedPickup || null;
    const highlights = booking?.highlights || [];
    const whatsIncluded = booking?.whatsIncluded || [];
    const whatsExcluded = booking?.whatsExcluded || [];
    const whatToBring = booking?.whatToBring || [];
    const restrictions = booking?.restrictions || [];
    const itinerary = booking?.itinerary || [];
    const poster = booking?.poster || booking?.image || '';
    const pickupPoints = booking?.pickupPoints || [];

    const passUrl = typeof window !== 'undefined' ? `${window.location.origin}/user/event/pass/${bookingId}` : `https://bagspackgo.com/user/event/pass/${bookingId}`;

    const SectionTitle = ({ icon: Icon, title, iconColor = 'text-emerald-600' }) => (
        <h4 className="font-semibold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2" style={fontStyle}>
            <Icon className={`w-3.5 h-3.5 ${iconColor}`} /> {title}
        </h4>
    );

    const BulletList = ({ items, emptyText = 'Not specified.' }) => (
        items.length > 0 ? (
            <ul className="list-disc pl-4 space-y-1.5 text-sm text-gray-600" style={fontStyle}>
                {items.map((item, i) => (
                    <li key={i} className="leading-relaxed">{typeof item === 'object' ? (item.text || item.label || '') : item}</li>
                ))}
            </ul>
        ) : (
            <p className="italic font-medium text-gray-400 text-sm" style={fontStyle}>{emptyText}</p>
        )
    );

    return (
        <div className="min-h-screen bg-[#F0FDF4]/30 flex flex-col items-center" style={fontStyle}>
            <style dangerouslySetInnerHTML={{ __html: `
                footer, .secondary-nav-wrapper { display: none !important; }
                body { background-color: #F0FDF4; }
            `}} />
            
            <AnimatePresence>
                {showContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="w-full max-w-3xl mx-auto py-10 px-4 sm:px-6 relative"
                    >
                        {/* ═══════ SUCCESS HEADER ═══════ */}
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="w-16 h-16 bg-emerald-100/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200 shadow-sm"
                            >
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </motion.div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2" style={fontStyle}>Booking Confirmed</h1>
                            <p className="text-emerald-700 font-semibold px-4 py-1 bg-emerald-100 inline-block rounded-full text-xs" style={fontStyle}>
                                Payment successful & Event Booked
                            </p>
                        </div>

                        {/* ═══════ REF + QR + ACTIONS ═══════ */}
                        <div className="bg-white rounded-3xl shadow-[0_15px_40px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden mb-6 flex flex-col sm:flex-row items-stretch">
                            <div className="flex-1 p-6 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-gray-100 bg-gray-50/30">
                                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-1 flex items-center gap-1" style={fontStyle}><Hash className="w-3 h-3"/> Booking Ref</p>
                                <p className="font-mono font-extrabold text-gray-900 text-xl tracking-wider mb-4">{bookingRef}</p>
                                
                                <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-1 flex items-center gap-1" style={fontStyle}><CreditCard className="w-3 h-3"/> Payment ID</p>
                                <p className="font-mono font-semibold text-gray-900 text-xs mb-4 truncate max-w-xs">{booking?.paymentId || 'VERIFIED'}</p>
                                
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button 
                                        onClick={() => handleDownloadPDF()}
                                        disabled={downloading}
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
                                        style={fontStyle}
                                    >
                                        {downloading ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        PDF Booking Pass
                                    </button>
                                    <button 
                                         onClick={() => { if (bookingId) window.open(`/user/event/pass/${bookingId}`, '_blank'); }}
                                         className="flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm hover:bg-emerald-50 active:scale-95"
                                         style={fontStyle}
                                     >
                                         <Eye className="w-4 h-4" /> View Pass
                                     </button>
                                </div>
                            </div>
                            
                            <div className="p-6 relative flex flex-col items-center justify-center min-w-[200px] bg-gradient-to-br from-emerald-50 to-white">
                                <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest mb-4" style={fontStyle}>Official E-Ticket</h3>
                                
                                <div className="relative group cursor-pointer" onClick={() => {
                                    if (!showQR) setShowQR(true);
                                    else window.open(passUrl, '_blank');
                                }}>
                                    <div className={`transition-all duration-500 ${showQR ? 'filter-none blur-0' : 'blur-[6px] opacity-40'}`}>
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-emerald-100 hover:border-emerald-300 transition-colors" title="Click to view PDF">
                                            <QRCodeSVG value={passUrl} size={110} level="H" includeMargin={false} />
                                        </div>
                                    </div>
                                    
                                    {!showQR && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="bg-emerald-600 text-white p-3 rounded-full mb-2 shadow-lg hover:scale-105 transition-transform">
                                                <Eye className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-widest bg-white/90 px-2 py-0.5 rounded shadow-sm" style={fontStyle}>Reveal QR</span>
                                        </div>
                                    )}
                                    {showQR && (
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span 
                                                className="text-[10px] font-semibold text-gray-500 hover:text-gray-800 uppercase tracking-widest flex items-center gap-1 z-10"
                                                onClick={(e) => { e.stopPropagation(); setShowQR(false); }}
                                                style={fontStyle}
                                            >
                                                <EyeOff className="w-3 h-3" /> Hide QR
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ═══════ EVENT SUMMARY CARD ═══════ */}
                        <div className="bg-white rounded-3xl shadow-[0_15px_40px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden mb-6">
                            <div className="p-6 sm:p-8 border-b border-gray-100 relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] -z-0"></div>
                                
                                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-6 relative z-10" style={fontStyle}>Event Summary</h3>
                                
                                {/* Name + Provider */}
                                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5" style={fontStyle}>
                                            <Navigation className="w-3 h-3"/> Event Name
                                        </p>
                                        <p className="font-extrabold text-gray-900 text-lg leading-tight" style={fontStyle}>{eventName}</p>
                                        <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-1" style={fontStyle}>
                                            <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {destinationName}
                                            {destinationLink && (
                                                <a href={destinationLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline ml-1 flex items-center gap-0.5 text-xs">
                                                    <ExternalLink className="w-3 h-3" /> Map
                                                </a>
                                            )}
                                        </p>
                                    </div>
                                    <div className="sm:text-right border-l-2 sm:border-l-0 border-emerald-500 pl-4 sm:pl-0">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5" style={fontStyle}>Organized By</p>
                                        <p className="font-bold text-emerald-700 text-base leading-tight" style={fontStyle}>{companyName}</p>
                                    </div>
                                </div>

                                {/* Key details grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={fontStyle}><Calendar className="w-3 h-3"/> Event Date</p>
                                        <p className="font-semibold text-gray-900 text-sm leading-tight" style={fontStyle}>{formatDate(eventDate)}</p>
                                    </div>
                                    {eventType && (
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={fontStyle}><Ticket className="w-3 h-3"/> Type</p>
                                            <p className="font-semibold text-gray-900 text-sm leading-tight capitalize" style={fontStyle}>{eventType}</p>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={fontStyle}><Users className="w-3 h-3"/> Slots</p>
                                        <p className="font-semibold text-gray-900 text-sm leading-tight" style={fontStyle}>{booking?.people || 1} Pax</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5" style={fontStyle}><CreditCard className="w-3 h-3"/> Total Paid</p>
                                        <p className="font-extrabold text-emerald-600 text-lg leading-none mt-0.5" style={fontStyle}>₹{Number(booking?.price || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>

                                {/* Selected Pickup */}
                                {selectedPickup && selectedPickup.location && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-6 relative z-10">
                                        <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest mb-2 flex items-center gap-1.5" style={fontStyle}>
                                            <Navigation className="w-3 h-3" /> Selected Pickup / Drop-off
                                        </p>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                            <p className="font-semibold text-gray-900 text-sm" style={fontStyle}>{selectedPickup.location}</p>
                                            {selectedPickup.time && <p className="text-xs font-medium text-gray-600 flex items-center gap-1" style={fontStyle}><Clock className="w-3 h-3 text-emerald-500" /> {selectedPickup.time}</p>}
                                            {selectedPickup.link && <a href={selectedPickup.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1" style={fontStyle}><ExternalLink className="w-3 h-3" /> View on Map</a>}
                                        </div>
                                    </div>
                                )}

                                {/* Fallback: show all pickup points if no selected one */}
                                {(!selectedPickup || !selectedPickup.location) && pickupPoints.length > 0 && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-6 relative z-10">
                                        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest mb-2 flex items-center gap-1.5" style={fontStyle}>
                                            <Navigation className="w-3 h-3 text-emerald-500" /> Selected Pickup / Drop-off Points
                                        </p>
                                        <div className="space-y-2">
                                            {pickupPoints.map((pp, i) => (
                                                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm">
                                                    <p className="font-semibold text-gray-900" style={fontStyle}>{pp.location}</p>
                                                    {pp.time && <p className="text-xs font-medium text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3 text-emerald-500" /> {pp.time}</p>}
                                                    {pp.link && <a href={pp.link} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Map</a>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ═══════ TRAVELLER DETAILS ═══════ */}
                            {travelers.length > 0 && (
                                <div className="p-6 sm:p-8 border-b border-gray-100">
                                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-widest mb-4" style={fontStyle}>Traveller Details</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {travelers.map((t, idx) => (
                                            <div key={idx} className="flex flex-col p-3 border border-gray-200 rounded-xl bg-white shadow-sm gap-1">
                                                <p className="font-semibold text-gray-900 text-sm flex items-center gap-2" style={fontStyle}>
                                                    <User className="w-4 h-4 text-emerald-600 shrink-0" /> {t.name || "Unnamed"}
                                                </p>
                                                <div className="text-[10px] font-medium text-gray-500 uppercase space-y-0.5 pl-6" style={fontStyle}>
                                                    <p>{t.idType || 'ID'}: <span className="text-gray-900 font-semibold">{t.idNumber || 'N/A'}</span></p>
                                                    <p>{t.gender || "-"} | {t.age || "-"} yrs {t.bloodGroup ? `| ${t.bloodGroup}` : ''}</p>
                                                    {t.country && <p>Country: {t.country}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ═══════ EVENT POSTER ═══════ */}
                            {poster && (
                                <div className="p-6 sm:p-8 border-b border-gray-100">
                                    <SectionTitle icon={Sparkles} title="Event Poster" />
                                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm max-w-sm">
                                        <Image src={poster} alt={eventName} width={400} height={250} className="w-full h-auto object-cover" />
                                    </div>
                                </div>
                            )}

                            {/* ═══════ HIGHLIGHTS ═══════ */}
                            {highlights.length > 0 && (
                                <div className="p-6 sm:p-8 border-b border-gray-100">
                                    <SectionTitle icon={Sparkles} title="Event Highlights" />
                                    <BulletList items={highlights} />
                                </div>
                            )}

                            {/* ═══════ INCLUSIONS & EXCLUSIONS ═══════ */}
                            {(whatsIncluded.length > 0 || whatsExcluded.length > 0) && (
                                <div className="p-6 sm:p-8 border-b border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <SectionTitle icon={CheckCircle2} title="What's Included" />
                                            <BulletList items={whatsIncluded} />
                                        </div>
                                        <div>
                                            <SectionTitle icon={X} title="What's Excluded" iconColor="text-rose-500" />
                                            <BulletList items={whatsExcluded} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═══════ ITINERARY ═══════ */}
                            {itinerary.length > 0 && (
                                <div className="p-6 sm:p-8 border-b border-gray-100">
                                    <SectionTitle icon={ListIcon} title="Itinerary" />
                                    <BulletList items={itinerary} />
                                </div>
                            )}

                            {/* ═══════ WHAT TO BRING & RESTRICTIONS ═══════ */}
                            {(whatToBring.length > 0 || restrictions.length > 0) && (
                                <div className="p-6 sm:p-8 border-b border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {whatToBring.length > 0 && (
                                            <div>
                                                <SectionTitle icon={Navigation} title="What to Bring" iconColor="text-amber-500" />
                                                <BulletList items={whatToBring} />
                                            </div>
                                        )}
                                        {restrictions.length > 0 && (
                                            <div>
                                                <SectionTitle icon={AlertTriangle} title="Restrictions" iconColor="text-red-500" />
                                                <BulletList items={restrictions} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ═══════ POLICIES & TERMS ═══════ */}
                            <div className="p-6 sm:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <SectionTitle icon={ShieldCheck} title="bagspackgo Policies" />
                                        <ul className="list-disc pl-4 space-y-1.5 text-sm text-gray-600" style={fontStyle}>
                                            <li className="leading-relaxed">Booking is confirmed subject to payment realization.</li>
                                            <li className="leading-relaxed font-bold text-red-600">Event bookings are strictly non-refundable under all circumstances, including no-shows or late arrivals.</li>
                                            <li className="leading-relaxed">Each QR code on the pass is valid for a single-use entry only.</li>
                                            <li className="leading-relaxed">All guests must carry a valid government-issued photo ID (Aadhaar, Passport, Driving License, etc.) for check-in and verification.</li>
                                            <li className="leading-relaxed">Possession or use of illegal substances and drugs is strictly prohibited.</li>
                                            <li className="leading-relaxed">bagspackgo acts strictly as an aggregator and platform facilitator. The event organizer is solely responsible for service execution and safety.</li>
                                            <li className="leading-relaxed">Your personal data is managed strictly in compliance with our Privacy Policy.</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <SectionTitle icon={CheckCircle2} title="Provider Terms & Conditions" />
                                        <p className="italic font-medium text-gray-400 text-sm" style={fontStyle}>No terms provided by the organizer.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══════ ACTION BUTTONS ═══════ */}
                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pb-10">
                            <button
                                onClick={() => router.push('/user/bookings')}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-semibold shadow-[0_8px_20px_rgba(16,185,129,0.25)] transition-all active:scale-[0.98]"
                                style={fontStyle}
                            >
                                <Navigation className="w-5 h-5" />
                                See Bookings
                                <ChevronRight className="w-4 h-4 opacity-70" />
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="sm:w-40 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 h-14 rounded-2xl font-semibold hover:bg-gray-50 transition-all active:scale-[0.98] shadow-sm"
                                style={fontStyle}
                            >
                                <Home className="w-5 h-5 opacity-60 text-gray-400" />
                                Home
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function BookingSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F0FDF4]/30 flex items-center justify-center pb-20">
                <style dangerouslySetInnerHTML={{ __html: `footer, .secondary-nav-wrapper { display: none !important; }` }} />
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-emerald-700 font-semibold tracking-widest uppercase text-xs">Finalizing...</p>
                </div>
            </div>
        }>
            <BookingSuccessContent />
        </Suspense>
    );
}
