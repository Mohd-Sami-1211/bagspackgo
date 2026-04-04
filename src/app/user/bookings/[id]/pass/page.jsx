'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, CheckCircle, Ticket, MapPin, Calendar, Clock, User, Phone, Mail } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function DownloadPassPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qrCodes, setQrCodes] = useState({});
    const [downloading, setDownloading] = useState(false);
    const passRef = useRef(null);

    useEffect(() => {
        async function fetchPassDetails() {
            try {
                const detailRes = await fetch(`/api/user/bookings/${id}`);
                const detailData = await detailRes.json();
                if (detailData.success) {
                    setBooking(detailData.booking);
                } else {
                    console.error('Pass details fetch unsuccessful', detailData.message);
                }
            } catch (err) {
                console.error('Error fetching pass details:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchPassDetails();
    }, [id]);

    useEffect(() => {
        if (booking && booking.participants) {
            const generatedQRs = {};
            booking.participants.forEach(async (p, idx) => {
                try {
                    // Add basic pass verification data
                    const qrData = JSON.stringify({
                        passCode: p.passCode,
                        bookingId: id,
                        name: p.name,
                        event: booking?.event?.title || 'Event'
                    });
                    const url = await QRCode.toDataURL(qrData);
                    generatedQRs[idx] = url;
                    if (Object.keys(generatedQRs).length === booking.participants.length) {
                        setQrCodes({ ...generatedQRs });
                    }
                } catch (err) {
                    console.error(err);
                }
            });
        }
    }, [booking, id]);

    const handleDownloadPDF = async () => {
        setDownloading(true);
        try {
            const element = passRef.current;
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const safeTitle = booking?.event?.title || 'Event_Pass';
            pdf.save(`bagspackgo_Pass_${safeTitle.replace(/\s+/g, '_')}_${booking.orderId}.pdf`);
        } catch (err) {
            console.error("Failed to generate PDF", err);
            alert("Failed to download pass. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center bg-gray-50">
                <p className="text-xl text-gray-600 mb-6">Pass not found or unauthorized.</p>
                <button onClick={() => router.push('/user/bookings')} className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" /> Back to Bookings
                </button>
            </div>
        );
    }

    const eventData = booking?.event || {};
    const formattedDate = new Date(eventData?.date || booking?.bookingDate || new Date()).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="min-h-screen pt-28 pb-16 bg-gray-50/50 relative overflow-hidden">
            {/* Background Decorative patterns */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-600 to-emerald-800 skew-y-3 -translate-y-24 z-0"></div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4 border-b border-gray-200/50 pb-6">
                    <button
                        onClick={() => router.push('/user/bookings')}
                        className="flex items-center justify-center gap-2 text-emerald-900 bg-white hover:bg-gray-50 border border-gray-200 px-6 py-2.5 rounded-full shadow-sm transition font-medium w-full sm:w-auto"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Bookings
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={downloading}
                        className="flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 px-8 py-2.5 rounded-full font-bold shadow-md transition-transform hover:scale-105 disabled:opacity-75 disabled:scale-100 w-full sm:w-auto"
                    >
                        {downloading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Download className="w-5 h-5" />
                        )}
                        {downloading ? 'Preparing Pass...' : 'Download Pass (PDF)'}
                    </button>
                </div>

                {/* Pass Container to be captured by HTML2Canvas */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                    ref={passRef}
                >
                    {/* Pass Header Banner */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white relative flex flex-col items-center text-center overflow-hidden">
                        <div className="flex items-center justify-center mb-5 bg-white p-3 rounded-xl shadow-sm inline-flex">
                            <img src="/images/logo.png" alt="bagspackgo" className="h-10 w-auto object-contain" crossOrigin="anonymous" />
                        </div>
                        <CheckCircle className="w-12 h-12 text-emerald-400 mb-3 opacity-90" />
                        <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 tracking-tight">Booking Confirmed</h1>
                        <p className="text-gray-300 font-medium tracking-wide text-sm mb-1">Order ID: {booking.orderId}</p>
                        <p className="text-gray-400 font-medium text-xs flex items-center gap-1.5 mx-auto">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Booked: {booking.createdAt || booking.bookingDate ? `${new Date(booking.createdAt || booking.bookingDate).toLocaleDateString('en-GB')} at ${new Date(booking.createdAt || booking.bookingDate).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}` : 'Unknown'}
                        </p>

                        {/* Decorative ripped paper effect bottom */}
                        <div className="absolute bottom-0 left-0 w-full h-4 bg-white" style={{ maskImage: 'radial-gradient(circle at 10px 0, transparent 0, transparent 10px, black 11px)', maskSize: '20px 20px', maskRepeat: 'repeat-x' }}></div>
                    </div>

                    <div className="p-8 sm:p-12">
                        {/* Event Detail Summary */}
                        <div className="border-b-2 border-dashed border-gray-200 pb-8 mb-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
                                <div className="flex-1">
                                    <div className="inline-block bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider mb-4">
                                        {eventData.eventType || eventData.type || 'Experience'}
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{eventData.title}</h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"><Calendar className="w-5 h-5 text-emerald-600" /></div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-semibold">Date</p>
                                                <p className="font-semibold text-gray-800">{formattedDate}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"><MapPin className="w-5 h-5 text-emerald-600" /></div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-semibold">Location</p>
                                                <p className="font-semibold text-gray-800">{eventData.location?.city || eventData.meetingPoint || 'TBD'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"><Ticket className="w-5 h-5 text-emerald-600" /></div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-semibold">Total Passes</p>
                                                <p className="font-semibold text-gray-800">{booking.slots}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"><Clock className="w-5 h-5 text-emerald-600" /></div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-semibold">Status</p>
                                                <p className="font-semibold text-emerald-600 capitalize">{booking.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                                    <p className="text-sm font-semibold text-gray-500 mb-1">Total Paid</p>
                                    <p className="text-3xl font-extrabold text-gray-900">₹{booking.amountPaid?.toLocaleString('en-IN')}</p>
                                    {eventData.pricePerSlot && (
                                        <div className="mt-3 text-xs text-gray-500 font-medium text-center bg-white px-3 py-1.5 rounded border border-gray-100 shadow-sm w-full">
                                            <p>{booking.slots} pass{booking.slots > 1 ? 'es' : ''} × ₹{eventData.pricePerSlot.toLocaleString('en-IN')}</p>
                                            <p className="mt-1 text-[10px] text-gray-400 uppercase tracking-widerborder-t border-gray-100 pt-1">+ 18% GST Included</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Participant Tickets */}
                        <div className="space-y-8">
                            {booking.participants?.map((participant, index) => (
                                <div key={index} className="flex flex-row items-stretch bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    {/* Ticket Left Edge Style */}
                                    <div className="w-2 bg-emerald-500 shrink-0"></div>

                                    {/* QR Code Section (Moved to front) */}
                                    <div className="p-4 sm:p-6 bg-emerald-50/30 flex flex-col items-center justify-center shrink-0 w-[130px] sm:w-[200px]">
                                        {qrCodes[index] ? (
                                            <div className="bg-white p-2 rounded-xl shadow-sm border border-emerald-100 mb-2">
                                                <img src={qrCodes[index]} alt={`QR Code for ${participant.name}`} className="w-20 h-20 sm:w-32 sm:h-32 object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gray-200 animate-pulse rounded-xl mb-2"></div>
                                        )}
                                        <p className="text-[10px] sm:text-xs font-mono text-gray-500 uppercase tracking-widest text-center">{participant.passCode}</p>
                                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1 font-semibold text-center leading-tight">SCAN FOR<br />ENTRY</p>
                                    </div>

                                    {/* Dash Divider for Ticket Feel */}
                                    <div className="border-l-2 border-dashed border-gray-200 relative shrink-0">
                                        <div className="absolute top-0 -translate-x-1/2 -mt-2 w-4 h-4 rounded-full bg-gray-50"></div>
                                        <div className="absolute bottom-0 -translate-x-1/2 -mb-2 w-4 h-4 rounded-full bg-gray-50"></div>
                                    </div>

                                    {/* Info section */}
                                    <div className="flex-1 p-4 sm:p-6 relative min-w-0">
                                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0" />
                                            <span className="truncate">#{index + 1} {participant.name || 'Anonymous'}</span>
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 sm:gap-y-4 gap-x-4 text-[10px] sm:text-sm mt-2 sm:mt-3">
                                            <div className="flex flex-col min-w-0">
                                                <p className="text-gray-400 text-[10px] sm:text-xs uppercase">Email</p>
                                                <p className="font-semibold text-gray-800 truncate" title={participant.email || booking.contactDetails?.email}>{participant.email || booking.contactDetails?.email || 'N/A'}</p>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <p className="text-gray-400 text-[10px] sm:text-xs uppercase">Phone</p>
                                                <p className="font-semibold text-gray-800 truncate">{participant.phone || booking.contactDetails?.phone || 'N/A'}</p>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <p className="text-gray-400 text-[10px] sm:text-xs uppercase">ID</p>
                                                <p className="font-semibold text-gray-800 uppercase line-clamp-1">{participant.idType || 'N/A'} {participant.idNumber ? `(${participant.idNumber.substring(0, 4)}...)` : ''}</p>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <p className="text-gray-400 text-[10px] sm:text-xs uppercase">Age / Gender</p>
                                                <p className="font-semibold text-gray-800 uppercase truncate">{participant.age} | {participant.gender}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 text-center text-sm text-gray-400 border-t border-gray-100 pt-8">
                            <p>This pass is uniquely generated for this booking. Do not share the QR codes externally.</p>
                            <p className="font-semibold mt-2 text-emerald-700">Need help? Contact support@bagspackgo.com</p>
                        </div>

                    </div>
                </motion.div>
            </div>
        </div>
    );
}
