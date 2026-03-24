'use client';
import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) { setLoading(false); return; }
            try {
                const res = await fetch('/api/user/trip-bookings');
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
        fetchBooking();
    }, [bookingId]);

    const handleDownloadPDF = async (openInNewTab = false) => {
        setDownloading(true);
        try {
            const element = passRef.current;
            // Temporarily show the pass for capturing
            const originalStyle = element.style.display;
            element.style.display = 'block';
            
            const canvas = await html2canvas(element, { 
                scale: 2, 
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });
            
            element.style.display = originalStyle;

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            if (openInNewTab) {
                const pdfBlob = pdf.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, '_blank');
            } else {
                const fileName = `BagsPackGo_TripPass_${bookingRef}.pdf`;
                pdf.save(fileName);
            }
        } catch (err) {
            console.error("Failed to generate PDF", err);
            // Fallback to print if PDF generation fails
            if (!openInNewTab) window.print();
        } finally {
            setDownloading(false);
        }
    };

    const formatDate = (d) => {
        if (!d) return 'TBD';
        const date = new Date(d);
        if (isNaN(date)) return d;
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
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
    const providerName = booking?.companyName || gSnapshot.companyName || gSnapshot.name || booking?.providerName || "BagsPackGo Verified Partner";
    const destinationName = pSnapshot.destination || booking?.destination || arrivalDeparture?.arrival?.city || "Kashmir Valleys";
    const travelers = personalDetails?.personalDetails || [];

    // Full URL to the pass which will trigger a PDF download/view when someone scans the QR
    const passUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/user/trip-bookings/${bookingId}/pdf` : `https://bagspackgo.com/api/user/trip-bookings/${bookingId}/pdf`;

    return (
        <div className="min-h-screen bg-[#F0FDF4]/30 flex flex-col items-center font-sans">
            
            {/* Hide footer & secondary nav - keep main navbar */}
            <style dangerouslySetInnerHTML={{ __html: `
                footer, .secondary-nav-wrapper { display: none !important; }
                body { background-color: #F0FDF4; }
                .print-only { display: none; }
                
                @media print {
                    body > * { display: none !important; }
                    .print-only { display: block !important; }
                    .print-only, .print-only * { visibility: visible !important; }
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
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Booking Confirmed</h1>
                            <p className="text-emerald-700 font-semibold px-4 py-1 bg-emerald-100 inline-block rounded-full text-xs">
                                Payment successful & Trip Booked
                            </p>
                        </div>

                        {/* Interactive QR Reveal Container */}
                        <div className="bg-white rounded-3xl shadow-[0_15px_40px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden mb-6 flex flex-col sm:flex-row items-stretch">
                            <div className="flex-1 p-6 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-gray-100 bg-gray-50/30">
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 flex items-center gap-1"><Hash className="w-3 h-3"/> Booking Ref</p>
                                <p className="font-mono font-black text-gray-900 text-xl tracking-wider mb-4">{bookingRef}</p>
                                
                                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 flex items-center gap-1"><CreditCard className="w-3 h-3"/> Payment ID</p>
                                <p className="font-mono font-bold text-gray-900 text-xs mb-4 truncate max-w-xs">{paymentId || "RAZORPAY_VERIFIED"}</p>
                                
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <button 
                                        onClick={() => handleDownloadPDF(false)}
                                        disabled={downloading}
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
                                    >
                                        {downloading ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        PDF Booking Pass
                                    </button>
                                    <button 
                                        onClick={() => handleDownloadPDF(true)}
                                        className="flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 font-bold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm hover:bg-emerald-50 active:scale-95"
                                    >
                                        <Eye className="w-4 h-4" /> View Pass
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6 relative flex flex-col items-center justify-center min-w-[200px] bg-gradient-to-br from-emerald-50 to-white">
                                <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-4">Official E-Ticket</h3>
                                
                                <div className="relative group cursor-pointer" onClick={() => setShowQR(!showQR)}>
                                    <div className={`transition-all duration-500 ${showQR ? 'filter-none blur-0' : 'blur-[6px] opacity-40'}`}>
                                        <div className="p-2 bg-white rounded-xl shadow-sm border border-emerald-100">
                                            <QRCodeSVG value={passUrl} size={110} level="H" includeMargin={false} />
                                        </div>
                                    </div>
                                    
                                    {!showQR && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="bg-emerald-600 text-white p-3 rounded-full mb-2 shadow-lg hover:scale-105 transition-transform">
                                                <Eye className="w-6 h-6" />
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-white/90 px-2 py-0.5 rounded shadow-sm">Reveal QR</span>
                                        </div>
                                    )}
                                    {showQR && (
                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                                <EyeOff className="w-3 h-3" /> Hide QR
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Main Details Document Card */}
                        <div className="bg-white rounded-3xl shadow-[0_15px_40px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden mb-8">
                            
                            {/* Trip Summary Details */}
                            <div className="p-6 sm:p-8 border-b border-gray-100 relative">
                                {/* Decorative corner slice */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[100px] -z-0"></div>
                                
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 relative z-10">Trip Summary</h3>
                                
                                {/* Info Box specifically for Provider/Package */}
                                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 relative z-10 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <Navigation className="w-3 h-3"/> Package Name
                                        </p>
                                        <p className="font-black text-gray-900 text-lg leading-tight">{packageName}</p>
                                        <p className="text-sm font-medium text-gray-500 mt-1">{destinationName}</p>
                                    </div>
                                    <div className="sm:text-right border-l-2 sm:border-l-0 border-emerald-500 pl-4 sm:pl-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Service Provider</p>
                                        <p className="font-bold text-emerald-700 text-base leading-tight">{providerName}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Travel Dates</p>
                                        <p className="font-bold text-gray-900 text-sm leading-tight">{formatDate(startDate)}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Users className="w-3 h-3"/> Guests</p>
                                        <p className="font-bold text-gray-900 text-sm leading-tight">{numPeople || 1} {category || 'Pax'}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3"/> Pickup Time</p>
                                        <p className="font-bold text-gray-900 text-sm leading-tight">{arrivalDeparture?.pickup?.time || 'Pending'}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin className="w-3 h-3"/> Total Paid</p>
                                        <p className="font-black text-emerald-600 text-lg leading-none mt-0.5">₹{Number(totalAmount || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Travelers Roster */}
                            <div className="p-6 sm:p-8 bg-gray-50/50">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <User className="w-4 h-4 text-emerald-600" /> Confirmed Travelers
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {travelers.length > 0 ? travelers.map((t, idx) => (
                                        <div key={idx} className="flex flex-col p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
                                            <p className="font-black text-gray-900 text-sm mb-1">{t.name || "Unnamed Traveler"}</p>
                                            <div className="flex justify-between items-end">
                                                <p className="text-xs font-semibold text-gray-500 capitalize">
                                                    {t.gender?.label || t.gender || "-"} • {t.age ? `${t.age} yrs` : "-"}
                                                </p>
                                                {t.idType && (
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.idType?.label || (typeof t.idType === 'string' ? t.idType : "ID")}</p>
                                                        <p className="text-[11px] font-mono font-bold text-gray-600 uppercase mt-0.5">{t.idNumber}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm font-medium text-gray-500 italic col-span-2">No specific traveler names recorded.</p>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Bottom Action Navigators */}
                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pb-10">
                            <button
                                onClick={() => router.push('/user/bookings')}
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-bold shadow-[0_8px_20px_rgba(16,185,129,0.25)] transition-all active:scale-[0.98]"
                            >
                                <Navigation className="w-5 h-5" />
                                See Bookings
                                <ChevronRight className="w-4 h-4 opacity-70" />
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="sm:w-40 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 h-14 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-[0.98] shadow-sm"
                            >
                                <Home className="w-5 h-5 opacity-60 text-gray-400" />
                                Home
                            </button>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden Print Wrapper for the Downloadable Pass (Used by PDF generator too) */}
            <div className="print-only" ref={passRef} style={{position:'fixed', top:0, left:0, width:'100%', background:'white', zIndex:99999, padding:'32px', fontFamily:'sans-serif'}}>
                <div className="border-[3px] border-emerald-600 rounded-3xl p-8 max-w-4xl mx-auto h-[1000px] relative">
                    {/* Visual Cutout / Ticket Style */}
                    <div className="absolute top-[300px] left-[-20px] w-10 h-10 bg-white rounded-full border-r-[3px] border-emerald-600 border-t-[3px] rotate-45"></div>
                    <div className="absolute top-[300px] right-[-20px] w-10 h-10 bg-white rounded-full border-l-[3px] border-emerald-600 border-b-[3px] rotate-45"></div>
                    <div className="absolute top-[320px] left-10 right-10 border-t-2 border-dashed border-emerald-300"></div>

                    {/* Branding Header */}
                    <div className="flex justify-between items-center mb-8 border-b-2 border-gray-100 pb-8">
                        <div>
                           <div className="mb-4">
                                <Image src="/images/logo.svg" alt="BagsPackGo" width={220} height={55} priority />
                           </div>
                           <p className="text-gray-500 font-bold text-sm">Official E-Ticket & Travel Pass</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Booking Reference</p>
                            <h2 className="text-3xl font-black text-gray-900 font-mono tracking-wider">{bookingRef}</h2>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-2 px-3 py-1 bg-emerald-50 inline-block rounded-full border border-emerald-100">Payment Confirmed</p>
                        </div>
                    </div>

                    {/* Flight/Trip Specifics */}
                    <div className="flex justify-between items-start mb-16 gap-8">
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Selected Package</p>
                            <h1 className="text-3xl font-black text-emerald-900 leading-tight mb-2">{packageName}</h1>
                            <p className="text-lg font-bold text-gray-500 flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-500" /> {destinationName}</p>
                        </div>
                        <div className="flex-1 text-right border-l-4 border-emerald-500 pl-8 bg-emerald-50/30 p-4 rounded-r-2xl">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5">Trip Managed By</p>
                            <h2 className="text-xl font-black text-gray-900">{providerName}</h2>
                            <div className="flex flex-col items-end gap-1 mt-3">
                                {booking?.providerPhone && (
                                    <p className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5">
                                        <Phone className="w-3 h-3 text-emerald-500" /> +91 {booking.providerPhone}
                                    </p>
                                )}
                                {booking?.providerEmail && (
                                    <p className="text-[10px] font-bold text-gray-600 flex items-center gap-1.5">
                                        <Mail className="w-3 h-3 text-emerald-500" /> {booking.providerEmail}
                                    </p>
                                )}
                                <div className="flex gap-2 mt-1">
                                    {booking?.instagram && <Instagram className="w-3.5 h-3.5 text-pink-500" />}
                                    {booking?.facebook && <Facebook className="w-3.5 h-3.5 text-blue-600" />}
                                    {booking?.website && <Globe className="w-3.5 h-3.5 text-emerald-600" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ticket Data Row below dashed line */}
                    <div className="mt-[60px] flex justify-between gap-8 mb-12">
                        <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-200">
                            <div className="grid grid-cols-2 gap-y-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Travel Date</p>
                                    <p className="font-bold text-gray-900 text-lg">{formatDate(startDate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup Time</p>
                                    <p className="font-bold text-gray-900 text-lg">{arrivalDeparture?.pickup?.time || 'TBD'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Guests</p>
                                    <p className="font-bold text-gray-900 text-lg">{numPeople} Pax</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                                    <p className="font-black text-emerald-600 text-xl">₹{Number(totalAmount || 0).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-white border-2 border-emerald-100 rounded-2xl shadow-sm">
                            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-3">Scan to View Online</p>
                            <QRCodeSVG value={passUrl} size={150} level="H" />
                            <p className="text-[10px] font-mono text-gray-400 mt-2">{bookingId}</p>
                        </div>
                    </div>

                    {/* Passengers */}
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Passenger Manifest</p>
                        <div className="grid grid-cols-2 gap-4">
                            {travelers.map((t, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 border border-gray-200 rounded-xl">
                                    <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                        <User className="w-4 h-4 text-emerald-600" /> {t.name || "Unnamed"}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">
                                        {t.idType?.label || (typeof t.idType === 'string' ? t.idType : "ID")}: <span className="text-gray-900">{t.idNumber}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="absolute bottom-8 left-8 right-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-xs text-gray-400 font-medium">Please preset this pass alongside a valid, government-issued photo ID at the time of pickup.</p>
                        <p className="text-xs font-bold text-emerald-600 mt-1">Thank you for choosing BagsPackGo!</p>
                    </div>
                </div>
            </div>

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
                    <p className="text-emerald-700 font-bold tracking-widest uppercase text-xs">Finalizing...</p>
                </div>
            </div>
        }>
            <BookingSuccessContent />
        </Suspense>
    );
}
