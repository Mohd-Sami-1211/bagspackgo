'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserBookings } from '@/lib/useTripCache';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Home, MapPin, Calendar, Users, CreditCard, ChevronRight, Hash, User, Clock, Navigation, QrCode, Download, Eye, EyeOff, Ticket, Instagram, Facebook, Mail, Phone, Globe } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function BookingSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookingId = searchParams.get('bookingId');
    const bookingRef = searchParams.get('ref') || 'Processing...';

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [isPassOpen, setIsPassOpen] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const passRef = useRef(null);

    const { data: bookingsData, isLoading: fetchLoading } = useUserBookings({
        isPaused: () => !bookingId
    });

    useEffect(() => {
        if (!bookingId) {
            setLoading(false);
            return;
        }

        if (!fetchLoading && bookingsData) {
            if (bookingsData.success) {
                const found = bookingsData.data?.find(b => b.id === bookingId || b._id === bookingId);
                setBooking(found || null);
            }
            setLoading(false);
            setTimeout(() => setShowContent(true), 150);
        } else if (!fetchLoading && bookingsData === undefined) {
            setLoading(false);
            setTimeout(() => setShowContent(true), 150);
        }
    }, [bookingsData, fetchLoading, bookingId]);

    const handleDownloadPDF = () => {
        if (!bookingId) return;
        // Open the HTML pass page and trigger browser's native print-to-PDF
        window.open(`/user/trip/pass/${bookingId}?print=true`, '_blank');
    };

    const formatDate = (d) => {
        if (!d) return 'TBD';
        const date = new Date(d);
        if (isNaN(date)) return d;
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Retrieving Booking Details...</p>
            </div>
        );
    }

    const {
        packageSnapshot = {},
        startDate,
        numPeople,
        category,
        totalAmount,
        arrivalDeparture = {},
        personalDetails = {},
        paymentId
    } = booking || {};

    // More robust data extraction from the booking object
    const pSnapshot = booking?.packageSnapshot || booking?.packageId || {};
    const gSnapshot = booking?.guideId || booking?.guideSnapshot || {};
    
    const packageName = pSnapshot.name || booking?.packageName || "Premium Trip Package";
    const providerName = booking?.companyName || gSnapshot.companyName || gSnapshot.name || booking?.providerName || "bagspackgo Verified Partner";
    const destinationName = pSnapshot.destination || booking?.destination || arrivalDeparture?.arrival?.city || "Kashmir Valleys";
    const travelers = personalDetails?.personalDetails || [];

    // Full URL to the pass page — matches the "View Pass" button
    const passUrl = typeof window !== 'undefined' ? `${window.location.origin}/user/trip/pass/${bookingId}` : `https://bagspackgo.com/user/trip/pass/${bookingId}`;

    const ensureString = (val) => {
        if (!val) return '';
        if (typeof val === 'object') return val.label || val.value || 'N/A';
        return String(val);
    };

    const dName = ensureString(destinationName);
    const catLabel = ensureString(category);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center font-sans">
            
            {/* Hide footer & secondary nav - keep main navbar */}
            <style dangerouslySetInnerHTML={{ __html: `
                footer, .secondary-nav-wrapper { display: none !important; }
                body { background-color: #f8fafc; }
                .print-only { display: none; }
                
                @media print {
                    @page { size: A4 portrait; margin: 0; }
                    html, body { width: 100%; height: 100%; margin: 0 !important; padding: 0 !important; background-color: white !important; }
                    body > * { display: none !important; }
                    .print-only { display: block !important; position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100vh !important; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print-only * { visibility: visible !important; }
                }
            `}} />
            
            <AnimatePresence>
                {showContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="w-full max-w-3xl mx-auto py-10 px-4 sm:px-6 relative no-print"
                    >
                        {/* Status Header */}
                        <div className="text-center mb-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="w-16 h-16 bg-emerald-100/50 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-200 shadow-sm"
                            >
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </motion.div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">Booking Confirmed</h1>
                            <p className="text-emerald-700 font-medium px-4 py-1 bg-emerald-100 inline-block rounded-full text-xs">
                                Payment successful & Trip Booked
                            </p>
                        </div>

                        {/* Interactive QR Reveal Container */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 flex flex-col sm:flex-row items-stretch">
                            <div className="flex-1 p-6 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-gray-200 bg-white">
                                <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-1 flex items-center gap-1"><Hash className="w-3.5 h-3.5"/> Booking Ref</p>
                                <p className="font-mono font-bold text-slate-900 text-xl tracking-widest mb-4">{bookingRef}</p>
                                
                                <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-1 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5"/> Payment ID</p>
                                <p className="font-mono font-medium text-slate-900 text-xs mb-4 truncate max-w-xs">{paymentId || "RAZORPAY_VERIFIED"}</p>
                                
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button 
                                        onClick={() => handleDownloadPDF(false)}
                                        disabled={downloading}
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
                                    >
                                        {downloading ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        PDF Booking Pass
                                    </button>
                                    <button 
                                         onClick={() => {
                                             if (bookingId) window.open(`/user/trip/pass/${bookingId}`, '_blank');
                                         }}
                                         className="flex items-center gap-2 bg-white border border-gray-200 text-slate-700 font-medium py-2 px-4 rounded-lg text-sm transition-colors shadow-sm hover:bg-slate-50 hover:text-slate-900"
                                     >
                                         <Eye className="w-4 h-4" /> View Pass
                                     </button>
                                </div>
                            </div>
                            
                            <div className="p-6 relative flex flex-col items-center justify-center min-w-[200px] bg-slate-50">
                                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Official E-Ticket</h3>
                                
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
                                            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider bg-white/90 px-2 py-0.5 rounded shadow-sm">Reveal QR</span>
                                        </div>
                                    )}
                                    {showQR && (
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span 
                                                className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 uppercase tracking-wider flex items-center gap-1 z-10"
                                                onClick={(e) => { e.stopPropagation(); setShowQR(false); }}
                                            >
                                                <EyeOff className="w-3 h-3" /> Hide QR
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Details Document Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                            
                            {/* Trip Summary Details */}
                            <div className="p-6 sm:p-8 border-b border-gray-200 relative">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 relative z-10">Trip Summary</h3>
                                
                                {/* Info Box specifically for Provider/Package */}
                                <div className="bg-slate-50 border border-gray-200 rounded-lg p-5 mb-6 relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                            <Navigation className="w-3.5 h-3.5"/> Package Name
                                        </p>
                                        <p className="font-bold text-slate-900 text-lg leading-tight">{packageName}</p>
                                        <p className="text-sm font-medium text-slate-500 mt-1">{dName}</p>
                                    </div>
                                    <div className="sm:text-right border-l-2 sm:border-l-0 border-gray-200 pl-4 sm:pl-0">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Service Provider</p>
                                        <p className="font-semibold text-slate-900 text-base leading-tight">{providerName}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400"/> Travel Dates</p>
                                        <p className="font-semibold text-slate-900 text-sm leading-tight">{formatDate(startDate)}</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400"/> Guests</p>
                                        <p className="font-semibold text-slate-900 text-sm leading-tight">{numPeople || 1} {catLabel || 'Pax'}</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400"/> Pickup Time</p>
                                        <p className="font-semibold text-slate-900 text-sm leading-tight">{arrivalDeparture?.pickup?.time || 'Pending'}</p>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400"/> Total Paid</p>
                                        <p className="font-bold text-emerald-600 text-lg leading-none mt-0.5">₹{Number(totalAmount || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Travelers Roster */}
                            <div className="p-6 sm:p-8 bg-slate-50">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                                    <User className="w-4 h-4 text-emerald-600" /> Confirmed Travelers
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {travelers.length > 0 ? travelers.map((t, idx) => (
                                        <div key={idx} className="flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <p className="font-bold text-slate-900 text-sm mb-1">{t.name || "Unnamed Traveler"}</p>
                                            <div className="flex justify-between items-end">
                                                <p className="text-xs font-medium text-slate-500 capitalize">
                                                    {t.gender?.label || t.gender || "-"} • {t.age ? `${t.age} yrs` : "-"}
                                                </p>
                                                {t.idType && (
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{t.idType?.label || (typeof t.idType === 'string' ? t.idType : "ID")}</p>
                                                        <p className="text-xs font-mono font-medium text-slate-700 uppercase mt-0.5">{t.idNumber}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm font-medium text-slate-500 italic col-span-2">No specific traveler names recorded.</p>
                                    )}
                                </div>
                            </div>

                        </div>
                        {/* Bottom Action Navigators */}
                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pb-10">
                            <button
                                onClick={() => router.push('/user/bookings')}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-12 rounded-lg font-medium shadow-sm transition-colors"
                            >
                                <Navigation className="w-4 h-4" />
                                See Bookings
                                <ChevronRight className="w-4 h-4 opacity-70" />
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="sm:w-40 flex items-center justify-center gap-2 bg-white border border-gray-200 text-slate-700 h-12 rounded-lg font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                            >
                                <Home className="w-4 h-4 opacity-60 text-slate-400" />
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-20">
                <style dangerouslySetInnerHTML={{ __html: `footer, .secondary-nav-wrapper { display: none !important; }` }} />
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-emerald-700 font-bold tracking-widest uppercase text-xs">Finalizing...</p>
                </div>
            </div>
        }>
            <BookingSuccessContent />
        </Suspense>
    );
}
