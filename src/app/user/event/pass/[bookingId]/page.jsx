'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import Image from 'next/image';
import { MapPin, User, CheckCircle2, Ticket, Calendar, Users, Clock, ExternalLink, X, Sparkles, AlertTriangle, ShieldCheck, Navigation, List } from 'lucide-react';

export default function EventPassPage() {
    const { bookingId } = useParams();
    const searchParams = useSearchParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) return;
            try {
                const res = await fetch(`/api/public/pass/${bookingId}`);
                const data = await res.json();
                if (data.success && data.data) {
                    setBooking(data.data);
                } else {
                    setBooking(null);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    useEffect(() => {
        if (!loading && booking) {
            const ref = booking.id?.substring(0, 8).toUpperCase() || bookingId.substring(0, 8).toUpperCase();
            document.title = `BPG_Event_Pass_${ref}`;
            if (searchParams.get('print') === 'true') {
                const timer = setTimeout(() => window.print(), 800);
                return () => clearTimeout(timer);
            }
        }
    }, [loading, booking, searchParams, bookingId]);

    const formatDate = (d) => {
        if (!d) return 'TBD';
        const date = new Date(d);
        if (isNaN(date)) return d;
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center p-8 bg-[#F0FDF4]"><div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div></div>;
    
    if (!booking) return <div className="min-h-screen flex items-center justify-center p-8 bg-[#F0FDF4]"><p className="text-xl font-bold text-gray-500">Booking Pass Not Found</p></div>;

    const eventName = booking.name || '';
    const companyName = booking.guideName || booking.companyName || booking.guide || 'Organizer';
    const destinationName = booking.destination || booking.location || '';
    const destinationLink = booking.destinationLink || '';
    const eventType = booking.category || '';
    const eventDate = booking.date;
    const duration = booking.duration || '';
    const travelers = booking.participants || [];
    const selectedPickup = booking.selectedPickup || null;
    const highlights = booking.highlights || [];
    const whatsIncluded = booking.whatsIncluded || [];
    const whatsExcluded = booking.whatsExcluded || [];
    const whatToBring = booking.whatToBring || [];
    const restrictions = booking.restrictions || [];
    const itinerary = booking.itinerary || [];
    const poster = booking.poster || booking.image || '';
    const pickupPoints = booking.pickupPoints || [];

    // Font style
    const fontStyle = {};

    const SectionHeader = ({ icon: Icon, title, iconColor = 'text-emerald-600' }) => (
        <h4 className="font-semibold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2" style={fontStyle}>
            <Icon className={`w-3.5 h-3.5 ${iconColor}`} /> {title}
        </h4>
    );

    const ListSection = ({ items, emptyText = 'Not specified.' }) => (
        items.length > 0 ? (
            <ul className="list-disc pl-4 space-y-1.5" style={fontStyle}>
                {items.map((item, i) => (
                    <li key={i} className="leading-relaxed">{typeof item === 'object' ? (item.text || item.label || JSON.stringify(item)) : item}</li>
                ))}
            </ul>
        ) : (
            <p className="italic font-medium text-gray-400" style={fontStyle}>{emptyText}</p>
        )
    );

    return (
        <div className="min-h-screen bg-[#F0FDF4] p-4 sm:p-8 flex items-center justify-center" style={fontStyle}>
            <style dangerouslySetInnerHTML={{ __html: `
                header, nav, footer, .secondary-nav-wrapper { display: none !important; }

                @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    html, body {
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body * { visibility: hidden !important; }
                    #pass-ticket, #pass-ticket * { visibility: visible !important; }
                    
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

                {/* ═══════ HEADER ═══════ */}
                <div className="p-5 sm:p-8 sm:pb-6 bg-white shrink-0 print-section">
                    <div className="flex flex-row justify-between items-center mb-6 sm:mb-8 border-b-2 border-gray-100 pb-6 sm:pb-8 gap-4">
                        <div className="flex flex-col items-center sm:items-start min-w-0">
                           <div className="mb-1 sm:mb-2">
                                <Image src="/images/logo.svg" alt="bagspackgo" width={140} height={38} priority className="w-[100px] sm:w-[148px] h-auto block" />
                           </div>
                           <p className="text-gray-500 font-semibold text-[8px] sm:text-sm tracking-wide text-center sm:text-left" style={fontStyle}>Official Event E-Ticket</p>
                        </div>
                        <div className="flex flex-col items-end shrink-0 text-right">
                            <p className="text-[8px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] mb-0.5 sm:mb-1" style={fontStyle}>Booking Ref</p>
                            <h2 className="text-sm sm:text-3xl font-black text-gray-900 font-mono tracking-tight sm:tracking-wider break-all">{(booking.id || bookingId).substring(0,8).toUpperCase()}</h2>
                            <div className="flex flex-col items-end mt-1 sm:mt-2 gap-1.5">
                                <span className="text-[7px] sm:text-xs font-semibold text-emerald-600 uppercase mt-1 sm:mt-2 px-1.5 sm:px-3 py-0.5 sm:py-1 bg-emerald-50 inline-block rounded-full border border-emerald-100" style={fontStyle}>Confirmed</span>
                                <span className="text-[8px] sm:text-[10px] font-medium text-gray-500 flex items-center gap-1 justify-end" style={fontStyle}>
                                    <Calendar className="w-2 h-2 sm:w-3 sm:h-3 text-emerald-500" /> {booking.bookingDate || booking.createdAt ? new Date(booking.bookingDate || booking.createdAt).toLocaleDateString('en-GB') : 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Event Name + Provider */}
                    <div className="flex flex-col md:flex-row justify-between items-stretch gap-6 sm:gap-8">
                        <div className="flex-1 w-full max-w-full md:max-w-[60%]">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 sm:mb-2 text-left" style={fontStyle}>Event Name</p>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 leading-tight mb-2 text-left" style={fontStyle}>{eventName}</h1>
                            <p className="text-base sm:text-lg font-medium text-gray-500 flex items-center gap-2" style={fontStyle}>
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> {destinationName}
                                {destinationLink && (
                                    <a href={destinationLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline text-xs flex items-center gap-0.5 ml-1">
                                        <ExternalLink className="w-3 h-3" /> Map
                                    </a>
                                )}
                            </p>
                        </div>
                        <div className="flex-1 w-full md:text-right border-l-4 border-emerald-500 pl-4 sm:pl-6 bg-emerald-50/30 p-4 rounded-r-2xl shrink-0 flex flex-col justify-center">
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1.5 md:text-right" style={fontStyle}>Organized By</p>
                            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 md:text-right" style={fontStyle}>{companyName}</h2>
                        </div>
                    </div>
                </div>

                {/* ═══════ TEAR LINE ═══════ */}
                <div className="relative w-full h-8 flex items-center justify-center shrink-0">
                    <div className="absolute left-[-20px] w-10 h-10 bg-[#F0FDF4] rounded-full border-[3px] border-emerald-600"></div>
                    <div className="flex-1 border-t-2 border-dashed border-emerald-300 mx-5 z-10 w-full min-w-0"></div>
                    <div className="absolute right-[-20px] w-10 h-10 bg-[#F0FDF4] rounded-full border-[3px] border-emerald-600"></div>
                </div>

                {/* ═══════ EVENT DETAILS GRID ═══════ */}
                <div className="p-5 sm:p-8 sm:pt-6 bg-white flex flex-col shrink-0">
                    <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-200 mb-8 print-section">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                            <div>
                                <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1" style={fontStyle}>Event Date</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base" style={fontStyle}>{formatDate(eventDate)}</p>
                            </div>
                            {eventType && (
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1" style={fontStyle}>Type</p>
                                    <p className="font-semibold text-gray-900 text-sm sm:text-base capitalize" style={fontStyle}>{eventType}</p>
                                </div>
                            )}
                            {duration && (
                                <div>
                                    <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1" style={fontStyle}>Duration</p>
                                    <p className="font-semibold text-gray-900 text-sm sm:text-base capitalize" style={fontStyle}>{duration}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1" style={fontStyle}>Guests</p>
                                <p className="font-semibold text-gray-900 text-sm sm:text-base" style={fontStyle}>{booking.people} Pax</p>
                            </div>
                            <div>
                                <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1" style={fontStyle}>Total Paid</p>
                                <p className="font-extrabold text-emerald-600 text-sm sm:text-base" style={fontStyle}>₹{Number(booking.price || 0).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>

                    {/* ═══════ SELECTED PICKUP/DROPOFF ═══════ */}
                    {selectedPickup && selectedPickup.location && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 mb-8 print-section">
                            <p className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2" style={fontStyle}>
                                <Navigation className="w-3.5 h-3.5" /> Selected Pickup / Drop-off Point
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                                <p className="font-semibold text-gray-900 text-sm sm:text-base" style={fontStyle}>{selectedPickup.location}</p>
                                {selectedPickup.time && (
                                    <p className="text-xs font-medium text-gray-600 flex items-center gap-1" style={fontStyle}>
                                        <Clock className="w-3 h-3 text-emerald-500" /> {selectedPickup.time}
                                    </p>
                                )}
                                {selectedPickup.link && (
                                    <a href={selectedPickup.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 underline" style={fontStyle}>
                                        <ExternalLink className="w-3 h-3" /> View on Map
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Show all available pickup points if no specific one was selected */}
                    {(!selectedPickup || !selectedPickup.location) && pickupPoints.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 mb-8 print-section">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3 flex items-center gap-2" style={fontStyle}>
                                <Navigation className="w-3.5 h-3.5 text-emerald-500" /> Selected Pickup / Drop-off Points
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

                    {/* ═══════ TRAVELLER DETAILS + QR CODES ═══════ */}
                    <div className="mb-8 print-section">
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2" style={fontStyle}>Passenger Tickets & Entry QRs</p>
                        <div className="grid grid-cols-1 gap-5">
                            {travelers.map((t, idx) => {
                                const verifyUrl = typeof window !== 'undefined' 
                                    ? `${window.location.origin}/serviceprovider/scan?bookingId=${bookingId}&passCode=${t.passCode}` 
                                    : `https://bagspackgo.com/serviceprovider/scan?bookingId=${bookingId}&passCode=${t.passCode}`;
                                
                                return (
                                <div key={idx} className="flex flex-row items-center p-4 border border-emerald-200 rounded-xl bg-emerald-50/20 shadow-sm gap-4">
                                    <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-white border border-emerald-100 rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.05)] w-[110px] sm:w-[120px]">
                                        <p className="text-[9px] font-semibold text-emerald-800 uppercase tracking-widest mb-2 text-center leading-tight" style={fontStyle}>Entry QR</p>
                                        <div className="p-1 max-w-[100px] w-full bg-white">
                                            <QRCodeSVG value={verifyUrl} size={90} level="M" style={{ width: '100%', height: 'auto' }} />
                                        </div>
                                        <p className="text-[9px] font-mono font-semibold text-gray-600 mt-2 tracking-widest text-center">{t.passCode || 'CODE'}</p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-1" style={fontStyle}>
                                            <Ticket className="w-5 h-5 text-emerald-600 shrink-0" /> <span className="truncate">{t.name || "Unnamed"}</span>
                                        </p>
                                        <div className="text-left mt-2 space-y-0.5" style={fontStyle}>
                                            {t.email && <p className="text-[10px] font-medium text-gray-500 truncate">{t.email}</p>}
                                            {t.phone && <p className="text-[10px] font-medium text-gray-500 truncate">{t.phone}</p>}
                                            <p className="text-[10px] font-medium text-gray-500 uppercase truncate">
                                                {t.idType || 'ID'}: <span className="text-gray-900 font-semibold">{t.idNumber || 'N/A'}</span>
                                            </p>
                                            <p className="text-[10px] font-medium text-gray-500 uppercase truncate">
                                                {t.gender || "-"} | {t.age || "-"} yrs {t.bloodGroup ? `| ${t.bloodGroup}` : ''}
                                            </p>
                                            {t.country && <p className="text-[10px] font-medium text-gray-500 uppercase truncate">Country: {t.country}</p>}
                                        </div>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                    
                    <div className="text-center border-t border-gray-100 pt-4 shrink-0 w-full relative px-2 mb-2 print-section">
                        <p className="text-[10px] sm:text-xs text-gray-400 font-medium leading-relaxed" style={fontStyle}>Please present these QR entry passes alongside a valid photo ID.</p>
                        <p className="text-[10px] sm:text-xs font-semibold text-emerald-600 mt-1" style={fontStyle}>Thank you for choosing bagspackgo!</p>
                    </div>
                </div>

                {/* ═══════ RICH CONTENT SECTION ═══════ */}
                <div className="p-5 sm:p-8 sm:pt-6 bg-gray-50 border-t border-emerald-100 text-[9px] sm:text-[10px] text-gray-600 leading-relaxed shrink-0">

                    {/* Event Poster */}
                    {poster && (
                        <div className="mb-8 print-section">
                            <SectionHeader icon={Sparkles} title="Event Poster" />
                            <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm max-w-md">
                                <Image src={poster} alt={eventName} width={500} height={300} className="w-full h-auto object-cover" />
                            </div>
                        </div>
                    )}

                    {/* Highlights */}
                    {highlights.length > 0 && (
                        <div className="mb-6 print-section">
                            <SectionHeader icon={Sparkles} title="Event Highlights" />
                            <ListSection items={highlights} />
                        </div>
                    )}

                    {/* Inclusions & Exclusions side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6 print-section">
                        <div>
                            <SectionHeader icon={CheckCircle2} title="What's Included" />
                            <ListSection items={whatsIncluded} />
                        </div>
                        <div>
                            <SectionHeader icon={X} title="What's Excluded" iconColor="text-rose-500" />
                            <ListSection items={whatsExcluded} />
                        </div>
                    </div>

                    {/* Itinerary */}
                    {itinerary.length > 0 && (
                        <div className="mb-6 pt-6 border-t border-emerald-100 print-section">
                            <SectionHeader icon={List} title="Itinerary" />
                            <ul className="list-disc pl-4 space-y-1.5" style={fontStyle}>
                                {itinerary.map((item, i) => (
                                    <li key={i} className="leading-relaxed">{typeof item === 'object' ? (item.text || JSON.stringify(item)) : item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* What to Bring & Restrictions */}
                    {(whatToBring.length > 0 || restrictions.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-6 border-t border-emerald-100 mb-6 print-section">
                            {whatToBring.length > 0 && (
                                <div>
                                    <SectionHeader icon={Navigation} title="What to Bring" iconColor="text-amber-500" />
                                    <ListSection items={whatToBring} />
                                </div>
                            )}
                            {restrictions.length > 0 && (
                                <div>
                                    <SectionHeader icon={AlertTriangle} title="Restrictions" iconColor="text-red-500" />
                                    <ListSection items={restrictions} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ═══════ POLICIES & TERMS ═══════ */}
                <div className="p-5 sm:p-8 sm:pt-6 bg-gray-50 border-t border-emerald-100 text-[9px] sm:text-[10px] text-gray-600 leading-relaxed pb-8 shrink-0 rounded-b-[1.7rem] print-section">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div>
                            <SectionHeader icon={ShieldCheck} title="bagspackgo Policies" />
                            <ul className="list-disc pl-4 space-y-2" style={fontStyle}>
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
                            <SectionHeader icon={CheckCircle2} title="Provider Terms & Conditions" />
                            <p className="italic font-medium text-gray-400" style={fontStyle}>No terms provided by the organizer.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
