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
    const bookingRefFromUrl = searchParams.get('ref') || '';

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [isPassOpen, setIsPassOpen] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const passRef = useRef(null);

    const { data: bookingsData, error: bookingsError, isLoading: fetchLoading, isValidating } = useUserBookings({
        isPaused: () => !bookingId,
        revalidateOnMount: true,
        dedupingInterval: 0,
    });

    useEffect(() => {
        if (!bookingId) {
            setLoading(false);
            return;
        }

        if (!fetchLoading && !isValidating && bookingsData) {
            if (bookingsData.success) {
                const found = bookingsData.data?.find(b => b.id === bookingId || b._id === bookingId);
                setBooking(found || null);
            }
            setLoading(false);
            setTimeout(() => setShowContent(true), 150);
        } else if (!fetchLoading && !isValidating && bookingsData === undefined) {
            setLoading(false);
            setTimeout(() => setShowContent(true), 150);
        }
    }, [bookingsData, fetchLoading, isValidating, bookingId]);

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
            <div className="fixed inset-0 z-50 bg-[#06110e] flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-emerald-400 rounded-full animate-spin mb-4" />
                <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Retrieving Booking Details...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-[#06110e] flex items-center justify-center p-4 text-white">
                <style dangerouslySetInnerHTML={{ __html: `footer, .secondary-nav-wrapper { display: none !important; }` }} />
                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur-xl">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                        <CreditCard className="h-7 w-7" />
                    </div>
                    <h1 className="text-2xl font-black">Booking details unavailable</h1>
                    <p className="mt-3 text-sm leading-6 text-white/65">
                        {bookingsError?.message || 'We could not load this confirmed booking. Please check My Bookings or try again.'}
                    </p>
                    <button onClick={() => router.push('/user/bookings')} className="mt-7 w-full rounded-2xl bg-emerald-400 px-5 py-3.5 font-black text-[#062018] transition hover:bg-emerald-300">
                        Open My Bookings
                    </button>
                </div>
            </div>
        );
    }

    const {
        packageSnapshot = {},
        startDate,
        numPeople,
        category,
        totalAmount,
        amountPaid,
        remainingAmount,
        paymentMode,
        arrivalDeparture = {},
        personalDetails = {},
        paymentId
    } = booking || {};

    const tripTotal = Number(totalAmount || 0);
    const paidNow = Number(amountPaid ?? tripTotal);
    const balanceDue = Math.max(0, Number(remainingAmount ?? tripTotal - paidNow));
    const isPartialPayment = paymentMode === 'partial' || balanceDue > 0;
    const displayBookingRef = booking?.bookingRef || bookingRefFromUrl || '—';

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
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#16483b_0%,_#06110e_44%,_#030807_100%)] flex flex-col items-center font-sans text-slate-900">
            
            {/* Hide footer & secondary nav - keep main navbar */}
            <style dangerouslySetInnerHTML={{ __html: `
                footer, .secondary-nav-wrapper { display: none !important; }
                body { background-color: #06110e; }
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
                            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">Booking Confirmed</h1>
                            <p className="text-emerald-100 font-bold px-4 py-1.5 bg-emerald-400/15 border border-emerald-300/20 inline-block rounded-full text-xs">
                                Payment received · Trip booked
                            </p>
                            {isPartialPayment && <p className="mt-3 text-sm font-semibold text-white/65">30% paid now · balance due on the trip day</p>}
                        </div>

                        {/* Interactive QR Reveal Container */}
                        <div className="bg-white/95 rounded-2xl shadow-2xl border border-white/20 overflow-hidden mb-6 flex flex-col sm:flex-row items-stretch">
                            <div className="flex-1 p-6 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-gray-200 bg-white">
                                <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-1 flex items-center gap-1"><Hash className="w-3.5 h-3.5"/> Booking Ref</p>
                                <p className="font-mono font-bold text-slate-900 text-xl tracking-widest mb-4">{displayBookingRef}</p>
                                
                                <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-1 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5"/> Payment ID</p>
                                <p className="font-mono font-medium text-slate-900 text-xs mb-4 truncate max-w-xs">{paymentId || "RAZORPAY_VERIFIED"}</p>
                                
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button 
                                        onClick={handleDownloadPDF}
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
                            
                            <div className="p-6 relative flex flex-col items-center justify-center min-w-[200px] bg-emerald-50/70">
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
                        <div className="bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden mb-8">
                            
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
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-slate-400"/> Paid Now</p>
                                        <p className="font-bold text-emerald-600 text-lg leading-none mt-0.5">₹{paidNow.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <div className={`mt-6 rounded-xl border p-4 ${isPartialPayment ? 'border-amber-200 bg-amber-50' : 'border-emerald-100 bg-emerald-50'}`}>
                                    <div className="flex items-center justify-between gap-4 text-sm">
                                        <span className="font-semibold text-slate-600">Trip total</span>
                                        <span className="font-black text-slate-900">₹{tripTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                    {isPartialPayment ? (
                                        <div className="mt-2 flex items-center justify-between gap-4 text-sm">
                                            <span className="font-bold text-amber-800">Balance due on trip day</span>
                                            <span className="font-black text-amber-700">₹{balanceDue.toLocaleString('en-IN')}</span>
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-xs font-semibold text-emerald-700">Paid in full. No further payment is due.</p>
                                    )}
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
