'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import { MapPin, User, Mail, Phone, Instagram, Facebook, Globe, CheckCircle2, Navigation } from 'lucide-react';

const formatTimeWithAMPM = (time) => {
    if (!time) return "";
    if (typeof time !== 'string') return String(time);
    if (time.includes("AM") || time.includes("PM")) return time;
    const parts = time.split(":");
    if (parts.length < 2) return time;
    const hours = parts[0];
    const minutes = parts[1];
    const hourNum = parseInt(hours, 10);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

export default function TripPassPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!id) return;
            try {
                // Check trips
                const tRes = await fetch('/api/user/trip-bookings');
                const tData = await tRes.json();
                let found = tData.success ? tData.data?.find(b => b.id === id || b._id === id) : null;
                
                if (found) {
                    setBooking({ ...found, bookingType: 'trip' });
                } else {
                    // Check treks
                    const trekRes = await fetch('/api/user/trek-bookings');
                    const trekData = await trekRes.json();
                    found = trekData.success ? trekData.data?.find(b => b.id === id || b._id === id) : null;
                    if (found) setBooking({ ...found, bookingType: 'trek' });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    // Auto-trigger print dialog when ?print=true is in URL
    useEffect(() => {
        if (!loading && booking && searchParams.get('print') === 'true') {
            // Small delay to ensure the page renders fully before printing
            const timer = setTimeout(() => window.print(), 800);
            return () => clearTimeout(timer);
        }
    }, [loading, booking, searchParams]);

    const formatDate = (d) => {
        if (!d) return 'TBD';
        const date = new Date(d);
        if (isNaN(date)) return d;
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center p-8 bg-[#F0FDF4]"><div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div></div>;
    
    if (!booking) return <div className="min-h-screen flex items-center justify-center p-8 bg-[#F0FDF4]"><p className="text-xl font-bold text-gray-500">Booking Pass Not Found</p></div>;

    const {
        packageSnapshot = {},
        startDate,
        numPeople,
        category,
        totalAmount,
        arrivalDeparture = {},
        personalDetails = {},
    } = booking || {};

    const pSnapshot = booking?.packageSnapshot || booking?.packageId || {};
    const gSnapshot = booking?.guideId || booking?.guideSnapshot || {};
    
    const packageName = pSnapshot.name || booking?.packageName || "Premium Trip Package";
    const providerName = booking?.companyName || gSnapshot.companyName || gSnapshot.name || booking?.providerName || "BagsPackGo Verified Partner";
    const destinationName = pSnapshot.destination || booking?.destination || arrivalDeparture?.arrival?.city || "Kashmir Valleys";
    const travelers = personalDetails?.personalDetails || [];

    const passUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/api/user/${booking?.bookingType === 'trek' ? 'trek' : 'trip'}-bookings/${id}/pdf` 
        : `https://bagspackgo.com/api/user/${booking?.bookingType === 'trek' ? 'trek' : 'trip'}-bookings/${id}/pdf`;

    return (
        <div className="min-h-screen bg-[#F0FDF4] p-4 sm:p-8 flex items-center justify-center font-sans">
            <style dangerouslySetInnerHTML={{ __html: `
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
                }
            `}} />
            <div id="pass-ticket" className="w-full max-w-4xl mx-auto border-[3px] border-emerald-600 rounded-3xl overflow-hidden bg-white shadow-2xl flex flex-col relative text-left my-2 sm:my-8">

                {/* Top Section */}
                <div className="p-5 sm:p-8 sm:pb-6 bg-white shrink-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 border-b-2 border-gray-100 pb-6 sm:pb-8">
                        <div className="mb-4 sm:mb-0">
                           <div className="mb-2 sm:mb-4">
                                <Image src="/images/logo.svg" alt="BagsPackGo" width={180} height={45} priority className="sm:w-[220px]" />
                           </div>
                           <p className="text-gray-500 font-bold text-xs sm:text-sm">Official E-Ticket & Travel Pass</p>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Booking Reference</p>
                            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-mono tracking-wider break-all">{booking.bookingRef || id.substring(0,8).toUpperCase()}</h2>
                            <p className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-widest mt-2 px-3 py-1 bg-emerald-50 inline-block rounded-full border border-emerald-100">Payment Confirmed</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-stretch gap-6 sm:gap-8">
                        <div className="flex-1 w-full max-w-full md:max-w-[60%]">
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 sm:mb-2 text-left">Selected Package</p>
                            <h1 className="text-2xl sm:text-3xl font-black text-emerald-900 leading-tight mb-2 text-left">{packageName}</h1>
                            <p className="text-base sm:text-lg font-bold text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> {destinationName}</p>
                        </div>
                        <div className="flex-1 w-full md:text-right border-l-4 border-emerald-500 pl-4 sm:pl-6 bg-emerald-50/30 p-4 rounded-r-2xl shrink-0 flex flex-col justify-center">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1.5 md:text-right">Trip Managed By</p>
                            <h2 className="text-lg sm:text-xl font-black text-gray-900 md:text-right">{providerName}</h2>
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
                                    {booking?.website && <a href={booking.website.startsWith('http') ? booking.website : `https://${booking.website}`} target="_blank" rel="noreferrer"><Globe className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 hover:opacity-80 transition-opacity cursor-pointer" /></a>}
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
                    <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-8 mb-8 sm:mb-10">
                        <div className="flex-1 bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
                                <div className="text-center sm:text-left">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Travel Date</p>
                                    <p className="font-bold text-gray-900 text-sm sm:text-base">{formatDate(startDate)}</p>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup</p>
                                    <p className="font-bold text-gray-900 text-[10px] sm:text-xs">{(arrivalDeparture?.pickup?.location && arrivalDeparture?.pickup?.time) ? `${arrivalDeparture.pickup.location} @ ${arrivalDeparture.pickup.time}` : 'TBD'}</p>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dropoff</p>
                                    <p className="font-bold text-gray-900 text-[10px] sm:text-xs">{(arrivalDeparture?.dropoff?.location && arrivalDeparture?.dropoff?.time) ? `${arrivalDeparture.dropoff.location} @ ${arrivalDeparture.dropoff.time}` : 'TBD'}</p>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Guests</p>
                                    <p className="font-bold text-gray-900 text-sm sm:text-base">{numPeople} Pax</p>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                                    <p className="font-black text-emerald-600 text-sm sm:text-base">₹{Number(totalAmount || 0).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-white border-2 border-emerald-100 rounded-2xl shadow-sm w-full sm:w-[180px] mt-4 sm:mt-0 print:border-emerald-200">
                            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2 text-center leading-tight">Scan for PDF</p>
                            <a href={passUrl} target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:opacity-80 transition-opacity" title="Click to view PDF">
                                <QRCodeSVG value={passUrl} size={110} level="H" />
                            </a>
                            <p className="text-[10px] font-mono text-gray-400 mt-2 truncate w-full text-center overflow-hidden">{id}</p>
                        </div>
                    </div>

                    <div className="flex-1">
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
                    
                    <div className="text-center border-t border-gray-100 mt-6 pt-4 shrink-0 w-full relative px-2">
                        <p className="text-[10px] sm:text-xs text-gray-400 font-medium leading-tight">Please preset this pass alongside a valid, government-issued photo ID at the time of pickup.</p>
                        <p className="text-[10px] sm:text-xs font-bold text-emerald-600 mt-1">Thank you for choosing BagsPackGo!</p>
                    </div>
                </div>

                {/* Terms & Conditions Section */}
                <div className="mt-auto p-5 sm:p-8 sm:pt-6 bg-gray-50 border-t border-emerald-100 text-[9px] sm:text-[10px] text-gray-600 leading-relaxed pb-8 shrink-0 rounded-b-[1.7rem]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> BagsPackGo Policies
                            </h4>
                            <ul className="list-disc pl-4 space-y-2">
                                <li>Booking is confirmed subject to payment realization.</li>
                                <li>Cancellations made 7 days prior to departure are eligible for a 75% refund.</li>
                                <li>Cancellations within 48 hours of departure are strictly non-refundable.</li>
                                <li>BagsPackGo acts only as an aggregator and is not directly responsible for delays caused by the service provider.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Provider Conditions
                            </h4>
                            {booking?.termsAndConditions && booking.termsAndConditions.length > 0 ? (
                                <ul className="list-disc pl-4 space-y-2">
                                    {booking.termsAndConditions.map((term, i) => (
                                        <li key={i}>{term}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic font-medium text-gray-400">Terms and conditions not available.</p>
                            )}
                        </div>
                    </div>

                    {/* Detailed Itinerary Row */}
                    {booking?.itinerary && booking.itinerary.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-emerald-100">
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-4 text-[11px] flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Complete Itinerary
                            </h4>
                            <div className="space-y-4">
                                {booking.itinerary.map((day, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="shrink-0 w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex flex-col items-center justify-center font-bold">
                                            <span className="text-[9px] uppercase">Day</span>
                                            <span className="text-sm leading-none">{day.day}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 text-[11px] mb-1">{day.location || `Day ${day.day}`}</p>
                                            
                                            {/* Day 1 Pickup */}
                                            {idx === 0 && booking.arrivalDeparture?.pickup?.address && (
                                                <div className="mb-2 p-1.5 bg-emerald-50 rounded border border-emerald-100 flex items-start gap-1.5">
                                                    <Navigation className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-bold text-gray-800 leading-tight">
                                                            Pickup from {booking.arrivalDeparture.pickup.address}{booking.arrivalDeparture.pickup.location ? `, ${booking.arrivalDeparture.pickup.location}` : ''} at {booking.arrivalDeparture.pickup.time || 'given time'}.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Last Day Dropoff */}
                                            {idx === booking.itinerary.length - 1 && booking.arrivalDeparture?.dropoff?.address && (
                                                <div className="mb-2 p-1.5 bg-blue-50 rounded border border-blue-100 flex items-start gap-1.5">
                                                    <Navigation className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-[9px] font-bold text-gray-800 leading-tight">
                                                            Drop off at {booking.arrivalDeparture.dropoff.address}{booking.arrivalDeparture.dropoff.location ? `, ${booking.arrivalDeparture.dropoff.location}` : ''} at {booking.arrivalDeparture.dropoff.time || 'given time'}.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {day.agenda && <p className="mb-1 text-[10px] text-gray-700 font-semibold capitalize">{day.agenda.replace(/-/g, ' ')}</p>}
                                            {((day.activities && day.activities.length > 0) || (day.highlights && day.highlights.length > 0)) && (
                                                <div className="mb-2">
                                                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block mb-1">Highlights:</span>
                                                    <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-gray-600 font-medium">
                                                        {[...(day.activities || []), ...(day.highlights || [])].map((item, i) => (
                                                            <li key={i}>{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
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
                                            {day.destinationPhotos && day.destinationPhotos.length > 0 && (
                                                <div className="mb-1">
                                                    <p className="text-[10px] font-bold text-gray-800 mb-1">
                                                        <span className="text-gray-500 font-medium">Destination:</span> {day.location || `Day ${day.day} Location`}
                                                    </p>
                                                    <div className="flex gap-2 flex-wrap pb-1">
                                                        {day.destinationPhotos.map((photo, pIdx) => (
                                                            <Image key={pIdx} src={photo} alt={`Destination`} width={60} height={40} className="object-cover rounded border border-gray-200 shadow-sm print:max-w-none w-[60px] h-[40px] shrink-0" />
                                                        ))}
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
