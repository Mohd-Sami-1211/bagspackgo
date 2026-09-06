'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useBookingPass } from '@/lib/useTripCache';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, User, Mail, Phone, Instagram, Facebook, Globe, CheckCircle2, Navigation, Mountain, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const formatTimeWithAMPM = (time) => {
    if (!time || !time.toString().trim()) return "Not specified";
    const t = time.toString().trim();
    if (t.includes("AM") || t.includes("PM")) return t;
    // Only convert if it's a valid HH:MM format
    const match = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return t; // Return as-is (could be alphabets or any format)
    const hourNum = parseInt(match[1], 10);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${match[2]} ${ampm}`;
};

export default function TrekPassPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const { openAuthModal, isAuthenticated } = useAuth();
    const { data: passData, isLoading: fetchLoading, mutate } = useBookingPass(id);
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!fetchLoading) {
            if (passData?.success && passData?.data) {
                setBooking(passData.data);
            } else {
                setBooking(null);
                if (passData?.message === 'Please login to your account to access pass' && !isAuthenticated) {
                    openAuthModal();
                }
            }
            setLoading(false);
        }
    }, [passData, fetchLoading, isAuthenticated, openAuthModal]);

    // Whenever authentication status changes (like after login), we can optionally re-fetch
    useEffect(() => {
        if (isAuthenticated && passData?.message === 'Please login to your account to access pass') {
            mutate();
        }
    }, [isAuthenticated, passData, mutate]);

    useEffect(() => {
        if (!loading && booking) {
            const ref = booking.bookingRef || (booking._id ? booking._id.substring(0, 8).toUpperCase() : '');
            document.title = `BPG_Trek_Pass_${ref}`;
            if (searchParams.get('print') === 'true') {
                const timer = setTimeout(() => window.print(), 800);
                return () => clearTimeout(timer);
            }
        }
    }, [loading, booking, searchParams]);

    const formatDate = (d) => {
        if (!d) return 'TBD';
        const date = new Date(d);
        if (isNaN(date)) return d;
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center p-8 bg-[#F0FDF4]"><div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div></div>;
    
    if (!booking) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#F0FDF4] gap-4">
            <p className="text-xl font-bold text-gray-700 text-center">
                {passData?.message || "Booking Pass Not Found"}
            </p>
            {passData?.message === 'Please login to your account to access pass' && (
                <button 
                    onClick={() => openAuthModal()} 
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
                >
                    Log In
                </button>
            )}
        </div>
    );

    // Map `arrivalDeparture` OR `pickupDropoff` depending on the object
    const arrivalDepartureOrPickupDropoff = booking?.pickupDropoff || booking?.arrivalDeparture || {};

    const {
        packageSnapshot = {},
        startDate,
        numPeople,
        totalAmount,
        personalDetails = {},
    } = booking || {};

    const pSnapshot = booking?.packageSnapshot || booking?.packageId || booking?.package || {};
    const gSnapshot = booking?.guideId || booking?.guideSnapshot || {};
    
    const getList = (key) => booking?.[key] || pSnapshot?.[key] || [];
    const inclusivesList = getList('inclusivesList');
    const exclusivesList = getList('exclusivesList');
    const additionalPoints = getList('additionalPoints').filter(p => (p?.text || p)?.trim?.());
    const termsAndConditionsList = getList('termsAndConditions');
    const itineraryList = getList('itinerary');
    
    const packageName = pSnapshot.name || booking?.packageName || "Premium Trek Package";
    const providerName = booking?.guideName || booking?.companyName || gSnapshot.companyName || gSnapshot.name || booking?.providerName || "bagspackgo Verified Partner";
    const destinationName = pSnapshot.destination || booking?.destination || arrivalDepartureOrPickupDropoff?.pickup?.city || "Himalayan Trails";
    const travelers = personalDetails?.personalDetails || [];
    const gallery = getList('photos');

    const passUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/user/trek/pass/${id}` 
        : `https://bagspackgo.com/user/trek/pass/${id}`;
        
    const qrPrintUrl = passUrl + "?print=true";

    return (
        <div className="min-h-screen bg-[#F0FDF4] p-4 sm:p-8 flex items-center justify-center font-sans" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                header, nav, footer, .secondary-nav-wrapper { display: none !important; }

                @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    html, body {
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Hide everything by default but show the ticket */
                    body * { visibility: hidden !important; }
                    #pass-ticket, #pass-ticket * { visibility: visible !important; }
                    
                    /* Position ticket perfectly */
                    #pass-ticket {
                        visibility: visible !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        max-width: none !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                        border: 2px solid #059669 !important;
                    }
                    
                    /* Prevent page breaks within sections */
                    .print-section {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
            `}} />
            <div id="pass-ticket" className="w-full max-w-4xl mx-auto border-[3px] border-emerald-600 rounded-3xl overflow-hidden bg-white shadow-2xl flex flex-col relative text-left my-2 sm:my-8">

                {/* Top Section */}
                <div className="p-5 sm:p-8 sm:pb-6 bg-white shrink-0 print-section">
                    <div className="flex flex-row justify-between items-center mb-6 sm:mb-8 border-b-2 border-gray-100 pb-6 sm:pb-8 gap-4">
                        <div className="flex flex-col items-center sm:items-start min-w-0">
                           <div className="mb-1 sm:mb-2">
                                <Image src="/images/logo.svg" alt="bagspackgo" width={140} height={38} priority className="w-[100px] sm:w-[148px] h-auto block" />
                           </div>
                           <p className="text-gray-500 font-semibold text-[8px] sm:text-sm tracking-wide text-center sm:text-left">Official E-Ticket & Trek Pass</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0 text-right">
                            <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-0.5 sm:mb-1">Booking Ref</p>
                            <h2 className="text-sm sm:text-3xl font-black text-gray-900 font-mono tracking-tight sm:tracking-wider break-all">{booking.bookingRef || id.substring(0,8).toUpperCase()}</h2>
                            <p className="text-[7px] sm:text-xs font-bold text-emerald-600 uppercase mt-1 sm:mt-2 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-emerald-50 inline-block rounded-full border border-emerald-100">Confirmed</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-stretch gap-6 sm:gap-8">
                        <div className="flex-1 w-full max-w-full md:max-w-[60%]">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 sm:mb-2 text-left">Selected Package</p>
                            <h1 className="text-2xl sm:text-3xl font-black text-emerald-900 leading-tight mb-2 text-left">{packageName}</h1>
                            <p className="text-base sm:text-lg font-bold text-gray-500 flex items-center gap-2">
                                {booking?.bookingType === 'trek' ? <Mountain className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> : <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />} 
                                {destinationName}
                            </p>
                        </div>
                        <div className="flex-1 w-full md:text-right border-l-4 border-emerald-500 pl-4 sm:pl-6 bg-emerald-50/30 p-4 rounded-r-2xl shrink-0 flex flex-col justify-center">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5 md:text-right">{booking?.bookingType === 'trek' ? 'Trek Managed By' : 'Trip Managed By'}</p>
                            <div className="flex md:justify-end items-center gap-3">
                                {booking?.providerLogo && (
                                    <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-white shrink-0">
                                        <img src={booking.providerLogo} alt={providerName} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <h2 className="text-lg sm:text-xl font-black text-gray-900 md:text-right">
                                    {booking?.provider ? (
                                        <Link href={`/user/provider/${booking.provider}`} className="hover:text-emerald-700 hover:underline">{providerName}</Link>
                                    ) : providerName}
                                </h2>
                            </div>
                            <div className="flex flex-col md:items-end gap-1 mt-3">
                                {booking?.providerPhone && (
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-600 flex items-center gap-1.5">
                                        <Phone className="w-3 h-3 text-emerald-500" /> +91 {booking.providerPhone}
                                    </p>
                                )}
                                {booking?.providerEmail && (
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-600 flex items-center gap-1.5">
                                        <Mail className="w-3 h-3 text-emerald-500" /> {booking.providerEmail}
                                    </p>
                                )}
                                <div className="flex gap-4 mt-2">
                                    {booking?.instagram && <a href={booking.instagram.startsWith('http') ? booking.instagram : `https://instagram.com/${booking.instagram}`} target="_blank" rel="noreferrer"><Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500 hover:opacity-80 transition-opacity cursor-pointer" /></a>}
                                    {booking?.facebook && <a href={booking.facebook.startsWith('http') ? booking.facebook : `https://facebook.com/${booking.facebook}`} target="_blank" rel="noreferrer"><Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 hover:opacity-80 transition-opacity cursor-pointer" /></a>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative w-full h-8 flex items-center justify-center shrink-0">
                    <div className="absolute left-[-20px] w-10 h-10 bg-[#F0FDF4] rounded-full border-[3px] border-emerald-600"></div>
                    <div className="flex-1 border-t-2 border-dashed border-emerald-300 mx-5 z-10 w-full min-w-0"></div>
                    <div className="absolute right-[-20px] w-10 h-10 bg-[#F0FDF4] rounded-full border-[3px] border-emerald-600"></div>
                </div>

                <div className="p-5 sm:p-8 sm:pt-6 bg-white flex flex-col shrink-0 min-h-[300px]">
                    <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-8 mb-8 sm:mb-10 print-section">
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-4 sm:gap-6 items-start">
                                <div className="text-center sm:text-left">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Travel Date</p>
                                    <p className="font-bold text-gray-900 text-sm sm:text-base">{formatDate(startDate)}</p>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-center sm:justify-start gap-1">Pickup</p>
                                    {(arrivalDepartureOrPickupDropoff?.pickup?.address && arrivalDepartureOrPickupDropoff?.pickup?.time) ? (
                                        <div className="flex flex-col gap-0.5">
                                            <p className="font-bold text-gray-900 text-[10px] sm:text-xs leading-tight">{arrivalDepartureOrPickupDropoff.pickup.address} {arrivalDepartureOrPickupDropoff.pickup.location ? `(${arrivalDepartureOrPickupDropoff.pickup.location})` : ''}</p>
                                            <p className="font-medium text-gray-500 text-[9px] sm:text-[10px]">{formatDate(arrivalDepartureOrPickupDropoff.pickup.date || startDate)} @ {arrivalDepartureOrPickupDropoff.pickup.time}</p>
                                            <a href={arrivalDepartureOrPickupDropoff.pickup.mapLink || `https://maps.google.com/?q=${encodeURIComponent(arrivalDepartureOrPickupDropoff.pickup.address + ' ' + (arrivalDepartureOrPickupDropoff.pickup.location || ''))}`} target="_blank" rel="noreferrer" className="text-[9px] text-emerald-600 font-bold hover:underline flex items-center justify-center sm:justify-start mt-0.5"><MapPin className="w-2.5 h-2.5 mr-0.5" /> View Map</a>
                                        </div>
                                    ) : <p className="font-bold text-gray-900 text-[10px] sm:text-xs">TBD</p>}
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-center sm:justify-start gap-1">Dropoff</p>
                                    {(arrivalDepartureOrPickupDropoff?.dropoff?.address && arrivalDepartureOrPickupDropoff?.dropoff?.time) ? (
                                        <div className="flex flex-col gap-0.5">
                                            <p className="font-bold text-gray-900 text-[10px] sm:text-xs leading-tight">{arrivalDepartureOrPickupDropoff.dropoff.address} {arrivalDepartureOrPickupDropoff.dropoff.location ? `(${arrivalDepartureOrPickupDropoff.dropoff.location})` : ''}</p>
                                            <p className="font-medium text-gray-500 text-[9px] sm:text-[10px]">{formatDate(arrivalDepartureOrPickupDropoff.dropoff.date || booking.endDate || startDate)} @ {arrivalDepartureOrPickupDropoff.dropoff.time}</p>
                                            <a href={arrivalDepartureOrPickupDropoff.dropoff.mapLink || `https://maps.google.com/?q=${encodeURIComponent(arrivalDepartureOrPickupDropoff.dropoff.address + ' ' + (arrivalDepartureOrPickupDropoff.dropoff.location || ''))}`} target="_blank" rel="noreferrer" className="text-[9px] text-emerald-600 font-bold hover:underline flex items-center justify-center sm:justify-start mt-0.5"><MapPin className="w-2.5 h-2.5 mr-0.5" /> View Map</a>
                                        </div>
                                    ) : <p className="font-bold text-gray-900 text-[10px] sm:text-xs">TBD</p>}
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Guests</p>
                                    <p className="font-bold text-gray-900 text-sm sm:text-base">{numPeople} Pax</p>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Booked On</p>
                                    <p className="font-bold text-gray-900 text-sm sm:text-base">
                                        {(booking.createdAt || booking.bookingDate) ? (() => { 
                                            const d = new Date(booking.createdAt || booking.bookingDate); 
                                            return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`; 
                                        })() : '—'}
                                    </p>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                                    <p className="font-black text-emerald-600 text-sm sm:text-base">₹{Number(totalAmount || 0).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-white border-2 border-emerald-100 rounded-2xl shadow-sm w-full sm:w-[180px] mt-4 sm:mt-0 print:border-emerald-200">
                            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2 text-center leading-tight">Scan to Download</p>
                            <a href={qrPrintUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:opacity-80 transition-opacity" title="Click to download PDF">
                                <QRCodeSVG value={qrPrintUrl} size={110} level="H" />
                            </a>
                            <p className="text-[10px] font-mono text-gray-400 mt-2 truncate w-full text-center overflow-hidden">{id}</p>
                        </div>
                    </div>

                    <div className="flex-1 print-section">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Passenger Manifest</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {travelers.map((t, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 border border-gray-200 rounded-xl bg-white shadow-sm gap-2">
                                    <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                        <User className="w-4 h-4 text-emerald-600 shrink-0" /> {t.name || "Unnamed"}
                                    </p>
                                    <div className="md:text-right">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">
                                            {t.idType?.label || (typeof t.idType === 'string' ? t.idType : "ID")}: <span className="text-gray-900">{t.idNumber}</span>
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">
                                            {t.gender?.label || (typeof t.gender === 'string' ? t.gender : "-")} | {t.age || "-"} yrs
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="text-center border-t border-gray-100 mt-6 pt-4 shrink-0 w-full relative px-2 print-section">
                        <p className="text-[10px] sm:text-xs text-gray-400 font-medium leading-tight">Please preset this pass alongside a valid, government-issued photo ID at the time of pickup.</p>
                        <p className="text-[10px] sm:text-xs font-bold text-emerald-600 mt-1">Thank you for choosing bagspackgo!</p>
                    </div>
                </div>

                {/* Terms & Conditions Section */}
                <div className="mt-auto p-5 sm:p-8 sm:pt-6 bg-gray-50 border-t border-emerald-100 text-[9px] sm:text-[10px] text-gray-600 leading-relaxed pb-8 shrink-0 rounded-b-[1.7rem]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 print-section">
                        <div>
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> bagspackgo Policies
                            </h4>
                            <ul className="list-disc pl-4 space-y-2">
                                <li>Booking is confirmed subject to payment realization.</li>
                                <li>Cancellation within 24 hours of booking is eligible for ~90% refund.</li>
                                <li>Cancellation after 24H & more than 7 days before start is eligible for ~75% refund.</li>
                                <li>Cancellation after 24H & less than 7 days before start is eligible for ~60% refund.</li>
                                <li>Cancellation within 48 hours prior to start is eligible for ~30% refund.</li>
                                <li>No refunds will be granted for no-shows or failure to participate.</li>
                                <li>All guests must carry a valid photo ID (Aadhaar, Passport, etc.) for verification.</li>
                                <li>bagspackgo holds final authority on all refund decisions. Our service partners are solely responsible for trek execution.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Provider Conditions
                            </h4>
                            {termsAndConditionsList.length > 0 ? (
                                <ul className="list-disc pl-4 space-y-2">
                                    {termsAndConditionsList.map((term, i) => (
                                        <li key={i}>{term?.text || term}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic font-medium text-gray-400">Terms and conditions not available.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-emerald-100 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 print-section">
                        <div>
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> What's Included
                            </h4>
                            {inclusivesList.length > 0 ? (
                                <ul className="list-disc pl-4 space-y-2">
                                    {inclusivesList.map((item, i) => (
                                        <li key={i}>{item?.text || item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic font-medium text-gray-400">Not specified.</p>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                <X className="w-3 h-3 text-rose-500" /> What's Excluded
                            </h4>
                            {exclusivesList.length > 0 ? (
                                <ul className="list-disc pl-4 space-y-2">
                                    {exclusivesList.map((item, i) => (
                                        <li key={i}>{item?.text || item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic font-medium text-gray-400">Not specified.</p>
                            )}
                        </div>
                    </div>

                    {additionalPoints.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-emerald-100">
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                <Navigation className="w-3 h-3 text-amber-500" /> Additional Points
                            </h4>
                            <ul className="list-disc pl-4 space-y-2">
                                {additionalPoints.map((item, i) => (
                                    <li key={i}>{item?.text || item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Trek Gallery Snippet */}
                    {gallery && gallery.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-emerald-100 print-section">
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-4 text-[11px] flex items-center gap-2">
                                <Mountain className="w-3 h-3 text-emerald-600" /> Trek Gallery
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {gallery.slice(0, 5).map((photo, pIdx) => (
                                    <Image key={pIdx} priority src={photo} alt={`Trek Photo`} width={120} height={80} className="object-cover rounded-xl border border-gray-200 shadow-sm print:max-w-none w-[120px] h-[80px] shrink-0" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detailed Itinerary Row */}
                    {itineraryList.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-emerald-100 print-section">
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-4 text-[11px] flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Complete Itinerary
                            </h4>
                            <div className="space-y-4">
                                {itineraryList.map((day, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="shrink-0 w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex flex-col items-center justify-center font-bold">
                                            <span className="text-[9px] uppercase">Day</span>
                                            <span className="text-sm leading-none">{day.day}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-[11px] mb-1">{day.location || `Day ${day.day}`}</p>
                                            
                                            {/* Day 1 Pickup */}
                                            {idx === 0 && arrivalDepartureOrPickupDropoff?.pickup?.address && (
                                                <div className="mb-2 p-1.5 bg-emerald-50 rounded border border-emerald-100 flex items-start gap-1.5">
                                                    <Navigation className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-gray-800 leading-tight mb-0.5">
                                                            Day 1 Pickup Details
                                                        </p>
                                                        <p className="text-[9px] font-medium text-gray-600 leading-tight mb-1">
                                                            <span className="font-bold">Date:</span> {formatDate(arrivalDepartureOrPickupDropoff.pickup.date || startDate)} &nbsp;|&nbsp; 
                                                            <span className="font-bold">Time:</span> {arrivalDepartureOrPickupDropoff.pickup.time || 'TBD'}
                                                        </p>
                                                        <p className="text-[9px] font-medium text-gray-600 leading-tight mb-1">
                                                            <span className="font-bold">Location:</span> {arrivalDepartureOrPickupDropoff.pickup.address}{arrivalDepartureOrPickupDropoff.pickup.location ? `, ${arrivalDepartureOrPickupDropoff.pickup.location}` : ''}.
                                                        </p>
                                                        <a href={arrivalDepartureOrPickupDropoff.pickup.mapLink || `https://maps.google.com/?q=${encodeURIComponent(arrivalDepartureOrPickupDropoff.pickup.address + ' ' + (arrivalDepartureOrPickupDropoff.pickup.location || ''))}`} target="_blank" rel="noreferrer" className="text-[10px] text-emerald-600 font-bold hover:underline inline-flex items-center mt-0.5">
                                                            <MapPin className="w-3 h-3 mr-1" /> Open Map Directions
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {(() => {
                                                let sections = [];
                                                if (day.highlights && day.highlights.length > 0) {
                                                    sections = [...day.highlights];
                                                } else if (day.agenda) {
                                                    sections = day.agenda.split('|').map(s => s.trim()).filter(Boolean);
                                                }
                                                if (day.activities && day.activities.length > 0) {
                                                    sections = [...sections, ...day.activities];
                                                }

                                                if (sections.length > 0) {
                                                    return (
                                                        <div className="mb-2">
                                                            <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block mb-1">Highlights:</span>
                                                            <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-gray-600 font-medium capitalize">
                                                                {sections.map((item, i) => (
                                                                    <li key={i}>{item.replace(/-/g, ' ')}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                            {day.hotelPhotos && day.hotelPhotos.length > 0 && (
                                                <div className="mb-2">
                                                    <p className="text-[10px] font-bold text-gray-800 mb-1 flex items-center gap-1">
                                                        <span className="text-gray-500 font-medium">Hotel:</span> {day.hotelName || 'Selected Accommodation'} 
                                                        {day.hotelStars && <span className="text-[#D4AF37] tracking-widest text-[8px] uppercase border px-1 py-0.5 rounded-full border-amber-200 bg-amber-50">⭐ {day.hotelStars} Star</span>}
                                                    </p>
                                                    <div className="flex gap-2 flex-wrap pb-1">
                                                        {day.hotelPhotos.map((photo, pIdx) => (
                                                            <Image key={pIdx} src={photo} alt={`${day.hotelName || 'Hotel'}`} width={60} height={40} className="object-cover rounded border border-gray-200 shadow-sm print:max-w-none w-[60px] h-[40px] shrink-0" />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {(day.destinationPhotos?.length > 0 || day.photos?.length > 0) && (
                                                <div className="mb-1">
                                                    <p className="text-[10px] font-bold text-gray-800 mb-1">
                                                        <span className="text-gray-500 font-medium">{day.photos?.length ? 'Trek Views' : 'Destination'}:</span> {day.location || `Day ${day.day} Location`}
                                                    </p>
                                                    <div className="flex gap-2 flex-wrap pb-1">
                                                        {(day.destinationPhotos || day.photos).map((photo, pIdx) => (
                                                            <Image key={pIdx} src={photo} alt={`Destination View`} width={60} height={40} className="object-cover rounded border border-gray-200 shadow-sm print:max-w-none w-[60px] h-[40px] shrink-0" />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Last Day Dropoff */}
                                            {idx === itineraryList.length - 1 && arrivalDepartureOrPickupDropoff?.dropoff?.address && (
                                                <div className="mb-2 mt-4 p-1.5 bg-blue-50 rounded border border-blue-100 flex items-start gap-1.5">
                                                    <Navigation className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-bold text-gray-800 leading-tight mb-0.5">
                                                            Final Dropoff Details
                                                        </p>
                                                        <p className="text-[9px] font-medium text-gray-600 leading-tight mb-1">
                                                            <span className="font-bold">Date:</span> {formatDate(arrivalDepartureOrPickupDropoff.dropoff.date || booking.endDate || startDate)} &nbsp;|&nbsp; 
                                                            <span className="font-bold">Time:</span> {arrivalDepartureOrPickupDropoff.dropoff.time || 'TBD'}
                                                        </p>
                                                        <p className="text-[9px] font-medium text-gray-600 leading-tight mb-1">
                                                            <span className="font-bold">Location:</span> {arrivalDepartureOrPickupDropoff.dropoff.address}{arrivalDepartureOrPickupDropoff.dropoff.location ? `, ${arrivalDepartureOrPickupDropoff.dropoff.location}` : ''}.
                                                        </p>
                                                        <a href={arrivalDepartureOrPickupDropoff.dropoff.mapLink || `https://maps.google.com/?q=${encodeURIComponent(arrivalDepartureOrPickupDropoff.dropoff.address + ' ' + (arrivalDepartureOrPickupDropoff.dropoff.location || ''))}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline inline-flex items-center mt-0.5">
                                                            <MapPin className="w-3 h-3 mr-1" /> Open Map Directions
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
