'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, MapPin, Calendar, Users, Clock, Tag,
    Printer, CheckCircle2, XCircle, AlertCircle, RotateCcw,
    RefreshCcw, AlertTriangle, Phone, Mail, Download, Globe,
    Instagram, Facebook, QrCode, Navigation
} from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

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

/* ─── Status config ─────────────────────────────────────────── */
const STATUS_CFG = {
    confirmed: {
        label: 'Confirmed', color: 'emerald',
        bg: 'bg-emerald-50', border: 'border-emerald-200',
        text: 'text-emerald-700', dot: 'bg-emerald-500',
        Icon: CheckCircle2,
    },
    pending: {
        label: 'Pending', color: 'amber',
        bg: 'bg-amber-50', border: 'border-amber-200',
        text: 'text-amber-700', dot: 'bg-amber-500',
        Icon: AlertCircle,
    },
    cancellation_requested: {
        label: 'Cancellation Submitted', color: 'orange',
        bg: 'bg-orange-50', border: 'border-orange-200',
        text: 'text-orange-700', dot: 'bg-orange-500',
        Icon: RotateCcw,
    },
    refund_initiated: {
        label: 'Refund Initiated', color: 'blue',
        bg: 'bg-blue-50', border: 'border-blue-200',
        text: 'text-blue-700', dot: 'bg-blue-500',
        Icon: RefreshCcw,
    },
    cancelled: {
        label: 'Cancelled', color: 'red',
        bg: 'bg-red-50', border: 'border-red-200',
        text: 'text-red-700', dot: 'bg-red-500',
        Icon: XCircle,
    },
};

/* ─── Cancellation step tracker ─────────────────────────────── */
const CANCEL_STEPS = [
    { key: 'cancellation_requested', label: 'Request Submitted', desc: 'Your cancellation request has been received.' },
    { key: 'refund_initiated', label: 'Refund Initiated', desc: 'Refund has been processed to your original payment method.' },
    { key: 'cancelled', label: 'Completed', desc: 'Booking successfully cancelled & refund completed.' },
];

function CancelTimeline({ status, cancellationDetails }) {
    const stepIndex = { cancellation_requested: 0, refund_initiated: 1, cancelled: 2 };
    const current = stepIndex[status] ?? -1;

    return (
        <div className="mt-4 space-y-4">
            {CANCEL_STEPS.map((step, i) => {
                const done = i <= current;
                const active = i === current;
                return (
                    <div key={step.key} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 ${done ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-200'}`}>
                            {done
                                ? <CheckCircle2 className="w-4 h-4 text-white" />
                                : <span className="w-2 h-2 rounded-full bg-gray-300" />}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-bold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                            <p className={`text-xs ${done ? 'text-gray-500' : 'text-gray-300'}`}>{step.desc}</p>
                            {active && step.key === 'cancellation_requested' && cancellationDetails?.requestedAt && (
                                <p className="text-[10px] font-bold text-orange-600 mt-0.5">
                                    {new Date(cancellationDetails.requestedAt).toLocaleString('en-IN')}
                                </p>
                            )}
                            {step.key === 'refund_initiated' && cancellationDetails?.refundInitiatedAt && (
                                <p className="text-[10px] font-bold text-blue-600 mt-0.5">
                                    {new Date(cancellationDetails.refundInitiatedAt).toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ─── Cancel Modal ───────────────────────────────────────────── */
function CancelModal({ onClose, onConfirm, loading }) {
    const [reason, setReason] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [step, setStep] = useState('reason'); // 'reason' | 'confirm'

    const reasons = [
        'Change of plans',
        'Found a better deal',
        'Medical emergency',
        'Weather concerns',
        'Travel restrictions',
        'Other',
    ];

    const handleNext = () => {
        if (!reason.trim()) return;
        setStep('confirm');
    };

    const handleSubmit = () => {
        if (confirmText.trim().toLowerCase() !== 'confirm') return;
        onConfirm(reason);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.96 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black">Cancel Booking</h3>
                            <p className="text-sm text-white/80">This action cannot be undone</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {step === 'reason' && (
                            <motion.div key="reason" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                <p className="text-sm font-semibold text-gray-600 mb-4">Please tell us why you want to cancel:</p>
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {reasons.map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setReason(r)}
                                            className={`text-xs font-bold px-3 py-2.5 rounded-xl border-2 text-left transition-all ${reason === r ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                {reason === 'Other' && (
                                    <textarea
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 resize-none outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                        rows={3}
                                        placeholder="Tell us more..."
                                        onChange={(e) => setReason('Other: ' + e.target.value)}
                                    />
                                )}
                                <div className="flex gap-3 mt-4">
                                    <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                                        Keep Booking
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!reason.trim()}
                                        className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-black text-white shadow-lg shadow-red-200 transition disabled:opacity-40"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'confirm' && (
                            <motion.div key="confirm" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                                    <p className="text-xs font-bold text-orange-700 uppercase tracking-widest mb-1">Reason</p>
                                    <p className="text-sm font-semibold text-gray-800">{reason}</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">
                                    Type <span className="font-black text-red-600 font-mono">confirm</span> to proceed:
                                </p>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="Type 'confirm'"
                                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 mb-4"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                />
                                <div className="flex gap-3">
                                    <button onClick={() => setStep('reason')} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition">
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={confirmText.trim().toLowerCase() !== 'confirm' || loading}
                                        className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-black text-white shadow-lg shadow-red-200 transition disabled:opacity-40 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Cancel Booking'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ─── Pass embed (read-only, no print buttons) ───────────────── */
function BookingPassEmbed({ booking }) {
    const ensureString = (val) => {
        if (!val) return '';
        if (typeof val === 'object') return val.label || val.value || '';
        return String(val);
    };

    const pSnapshot = booking?.packageSnapshot || {};
    const gSnapshot = booking?.guideId || {};
    const isEvent = booking?.type?.toLowerCase() === 'event';
    const selectedPickup = isEvent ? (booking?.selectedPickup || null) : null;
    const pickupPoints = isEvent ? (booking?.pickupPoints || []) : [];
    const packageName = isEvent ? (booking?.name || 'Event') : (pSnapshot.name || booking?.packageName || 'Trip Package');
    const providerName = booking?.companyName || booking?.guideName || 'BagsPackGo Verified Partner';
    const destinationName = ensureString(pSnapshot.destination || booking?.destination || '');
    const travelers = booking?.personalDetails?.personalDetails || [];
    const arrivalDeparture = booking?.arrivalDeparture || {};

    const passUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${booking.passUrl || `/user/trip/pass/${booking.id}`}`
        : '';

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';
    const rupee = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

    return (
        <div className="w-full border-2 border-emerald-200 rounded-2xl overflow-hidden bg-white text-left">

            {/* Header */}
            <div className="p-5 sm:p-7 border-b border-emerald-100 bg-emerald-50/30">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                E-Ticket
                            </span>
                        </div>
                        <h2 className="text-xl font-black text-emerald-900 leading-tight">{packageName}</h2>
                        {destinationName && (
                            <p className="text-sm font-semibold text-gray-500 flex items-center gap-1 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {destinationName}
                            </p>
                        )}
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Booking Ref</p>
                        <p className="text-xl font-black text-gray-900 font-mono tracking-wider">
                            {booking.bookingRef || booking.id?.substring(0, 8).toUpperCase()}
                        </p>
                        <span className="inline-block text-[10px] font-black text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full mt-1 border border-emerald-200">
                            Payment Confirmed
                        </span>
                    </div>
                </div>
            </div>

            {/* Details grid */}
            <div className="p-5 sm:p-7">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Travel Date</p>
                            <p className="text-sm font-black text-gray-900">{formatDate(booking.date)}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup / Drop-off</p>
                            
                            {isEvent ? (
                                // Event pickup: use selectedPickup first, then fall back to pickupPoints
                                (() => {
                                    const pp = (selectedPickup && selectedPickup.location) ? selectedPickup : pickupPoints[0];
                                    if (!pp?.location) return <p className="text-xs font-black text-gray-900 leading-tight">TBD</p>;
                                    return (
                                        <div className="space-y-1.5 mt-1">
                                            <p className="text-xs font-black text-gray-900 leading-tight flex items-start gap-1.5">
                                                <MapPin className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>{pp.location}</span>
                                            </p>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {pp.time && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                                        <Clock className="w-2.5 h-2.5" /> {formatTimeWithAMPM(pp.time)}
                                                    </span>
                                                )}
                                                {pp.link && (
                                                    <a href={pp.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 bg-white px-1.5 py-0.5 rounded-md border border-emerald-100 shadow-sm transition-all hover:shadow-md">
                                                        <Navigation className="w-2.5 h-2.5" /> View Map
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : (
                                // Trip/Trek pickup
                                arrivalDeparture?.pickup?.location ? (
                                    <div className="space-y-1.5 mt-1">
                                        <p className="text-xs font-black text-gray-900 leading-tight flex items-start gap-1.5">
                                            <MapPin className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{arrivalDeparture.pickup.location}</span>
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {arrivalDeparture.pickup.time && (
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                                    <Clock className="w-2.5 h-2.5" /> {formatTimeWithAMPM(arrivalDeparture.pickup.time)}
                                                </span>
                                            )}
                                            {arrivalDeparture.pickup.link && (
                                                <a href={arrivalDeparture.pickup.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-700 bg-white px-1.5 py-0.5 rounded-md border border-emerald-100 shadow-sm transition-all hover:shadow-md">
                                                    <Navigation className="w-2.5 h-2.5" /> View Map
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs font-black text-gray-900 leading-tight">TBD</p>
                                )
                            )}
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Guests</p>
                            <p className="text-sm font-black text-gray-900">{booking.people || 1} Pax</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                            <p className="text-sm font-black text-emerald-600">{rupee(booking.price)}</p>
                        </div>
                    </div>

                    <div className="shrink-0 w-full lg:w-48 bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-center">
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Managed By</p>
                        <p className="font-black text-gray-900 text-sm">{providerName}</p>
                        {booking.providerPhone && (
                            <p className="text-[10px] text-gray-600 flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3 text-emerald-500" /> {booking.providerPhone}
                            </p>
                        )}
                        {booking.providerEmail && (
                            <p className="text-[10px] text-gray-600 flex items-center gap-1 mt-0.5 truncate">
                                <Mail className="w-3 h-3 text-emerald-500" /> {booking.providerEmail}
                            </p>
                        )}
                    </div>
                </div>

                {/* Travelers */}
                {travelers.length > 0 && (
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">
                            Passenger Manifest
                        </p>
                        <div className="flex flex-col gap-3">
                            {travelers.map((t, i) => {
                                const verifyUrl = typeof window !== 'undefined' 
                                    ? `${window.location.origin}/serviceprovider/scan?bookingId=${booking.id}&passCode=${t.passCode}` 
                                    : `https://bagspackgo.com/serviceprovider/scan?bookingId=${booking.id}&passCode=${t.passCode}`;

                                return (
                                <div key={i} className="flex justify-between items-center p-4 border border-emerald-100 rounded-2xl bg-emerald-50/30">
                                    <div>
                                        <p className="text-base font-bold text-gray-900 mb-0.5">{t.name || 'Unnamed Passenger'}</p>
                                        <p className="text-xs text-gray-500 font-bold mb-1.5">
                                            {t.gender?.label || t.gender || '—'} · {t.age || '—'} yrs
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">
                                            {t.idType?.label || t.idType || 'ID'}: <span className="text-gray-900">{t.idNumber}</span>
                                        </p>
                                        {t.phone && <p className="text-[10px] font-medium text-gray-500 mt-0.5">Contact: <span className="text-gray-900 font-semibold">{t.phone}</span></p>}
                                    </div>
                                    <div className="shrink-0 bg-white p-1.5 rounded-lg border border-emerald-200 shadow-sm ml-4 flex flex-col items-center justify-center">
                                        <QRCodeSVG value={verifyUrl} size={70} level="H" />
                                        <p className="text-[8px] font-bold text-emerald-800 uppercase tracking-widest mt-1">Scan to Enter</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function BookingDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [toast, setToast] = useState(null);

    const fetchBooking = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            // Fetch from all booking sources and find the right one
            const [tripsRes, treksRes, eventsRes] = await Promise.all([
                fetch('/api/user/trip-bookings'),
                fetch('/api/user/trek-bookings'),
                fetch('/api/user/bookings'),
            ]);
            const [tripsData, treksData, eventsData] = await Promise.all([tripsRes.json(), treksRes.json(), eventsRes.json()]);

            let found = null;
            const ensureString = (val) => {
                if (!val) return '';
                if (typeof val === 'object') return val.label || val.value || '';
                return String(val);
            };

            if (tripsData.success) {
                const raw = tripsData.data?.find(b => b.id === id || b._id === id);
                if (raw) {
                    found = {
                        ...raw,
                        type: 'trip',
                        name: ensureString(raw.packageName),
                        destination: ensureString(raw.destination),
                        guide: ensureString(raw.guideName),
                        people: raw.numPeople,
                        date: raw.startDate,
                        endDate: raw.endDate,
                        price: raw.totalAmount,
                        duration: `${raw.days} Days`,
                        passUrl: `/user/trip/pass/${raw.id}`,
                    };
                }
            }

            if (!found && treksData.success) {
                const raw = treksData.data?.find(b => b.id === id || b._id === id);
                if (raw) {
                    found = {
                        ...raw,
                        type: 'Trek',
                        name: ensureString(raw.packageName),
                        destination: ensureString(raw.destination),
                        guide: ensureString(raw.guideName),
                        people: raw.numPeople,
                        date: raw.startDate,
                        endDate: raw.endDate,
                        price: raw.totalAmount,
                        duration: `${raw.days} Days`,
                        passUrl: `/user/trek/pass/${raw.id}`,
                        arrivalDeparture: raw.pickupDropoff || raw.arrivalDeparture || {},
                    };
                }
            }

            if (!found && eventsData.success) {
                const raw = eventsData.data?.find(b => b.id === id || b._id === id);
                if (raw) {
                    found = {
                        ...raw,
                        type: 'Event',
                        name: ensureString(raw.name),
                        destination: ensureString(raw.destination),
                        guide: ensureString(raw.guide),
                        people: raw.people,
                        date: raw.date,
                        price: raw.price,
                        duration: raw.duration || '1 Day',
                        passUrl: `/user/event/pass/${raw.id}`,
                        // Normalize for UI components
                        personalDetails: { personalDetails: raw.participants || [] },
                        selectedPickup: raw.selectedPickup || null,
                        pickupPoints: raw.pickupPoints || [],
                        arrivalDeparture: {},
                        inclusivesList: raw.whatsIncluded || [],
                        exclusivesList: raw.whatsExcluded || [],
                        termsAndConditions: raw.termsAndConditions || [],
                        itinerary: raw.itinerary || [],
                        highlights: raw.highlights || [],
                        whatToBring: raw.whatToBring || [],
                        restrictions: raw.restrictions || [],
                        poster: raw.poster || raw.image || '',
                    };
                }
            }

            if (found) setBooking(found);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchBooking(); }, [fetchBooking]);

    const handleCancelConfirm = async (reason) => {
        if (!booking) return;
        setCancelling(true);
        try {
            const endpoint = booking.type === 'Trek'
                ? `/api/user/trek-bookings/${id}/cancel`
                : `/api/user/trip-bookings/${id}/cancel`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            const data = await res.json();
            if (data.success) {
                setShowCancelModal(false);
                setToast({ type: 'success', message: 'Cancellation requested. We\'ll process your refund shortly.' });
                await fetchBooking(); // refresh state
            } else {
                setToast({ type: 'error', message: data.message || 'Failed to cancel booking.' });
            }
        } catch (e) {
            setToast({ type: 'error', message: 'Something went wrong. Please try again.' });
        } finally {
            setCancelling(false);
        }

        setTimeout(() => setToast(null), 5000);
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'TBD';
    const rupee = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

    const canCancel = booking && ['confirmed', 'pending'].includes(booking.status) && booking.type?.toLowerCase() !== 'event';
    const cancelStatus = booking && ['cancellation_requested', 'refund_initiated', 'cancelled'].includes(booking.status);
    const cfg = STATUS_CFG[booking?.status] || STATUS_CFG.pending;

    const pSnapshot = booking?.packageSnapshot || booking?.packageId || booking?.package || {};
    const getList = (key) => booking?.[key] || pSnapshot?.[key] || [];
    
    const inclusivesList = getList('inclusivesList');
    const exclusivesList = getList('exclusivesList');
    const additionalPoints = getList('additionalPoints').filter(p => (p?.text || p)?.trim?.());
    const termsAndConditionsList = getList('termsAndConditions');
    const itineraryList = getList('itinerary');
    const highlights = getList('highlights');
    const whatToBring = getList('whatToBring');
    const restrictions = getList('restrictions');

    /* ─── Loading ─── */
    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-emerald-700 font-semibold text-sm">Loading booking details...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-black text-gray-800">Booking Not Found</h2>
                <p className="text-sm text-gray-500 text-center max-w-xs">This booking doesn't exist or may have been removed.</p>
                <Link href="/user/bookings" className="mt-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
                    Back to My Bookings
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-6">

                {/* Back */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Link href="/user/bookings"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-emerald-700 transition-colors mt-4">
                        <ChevronLeft className="w-4 h-4" /> My Bookings
                    </Link>
                </motion.div>

                {/* Status + actions header */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border ${cfg.bg} ${cfg.border} p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
                            <cfg.Icon className={`w-5 h-5 ${cfg.text}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booking Status</p>
                            <p className={`text-lg font-black ${cfg.text}`}>{cfg.label}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* View Full Pass */}
                        {!cancelStatus && booking.passUrl && (
                            <Link href={booking.passUrl}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition shadow-sm">
                                <QrCode className="w-4 h-4" /> View Pass
                            </Link>
                        )}
                        {/* Print Pass */}
                        {!cancelStatus && booking.passUrl && (
                            <Link href={`${booking.passUrl}?print=true`} target="_blank"
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-bold transition">
                                <Printer className="w-4 h-4" /> Print
                            </Link>
                        )}
                        {/* Cancel */}
                        {canCancel && (
                            <button onClick={() => setShowCancelModal(true)}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-sm font-bold transition">
                                <XCircle className="w-4 h-4" /> Cancel Booking
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Cancellation tracker */}
                {cancelStatus && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-base font-black text-gray-800 mb-1">Cancellation Status</h3>
                        <p className="text-xs text-gray-500 mb-2">Track the progress of your cancellation details.</p>
                        {booking.cancellationDetails?.ticketId && (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-2 text-xs font-semibold text-gray-700 flex items-center justify-between">
                                <span><span className="font-black text-gray-900 uppercase">Ticket ID:</span> <span className="font-mono text-emerald-600 ml-1">{booking.cancellationDetails.ticketId}</span></span>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                    booking.status === 'cancelled' 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : booking.status === 'refund_initiated' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-amber-100 text-amber-700 animate-pulse'
                                }`}>
                                    {booking.status === 'cancelled' ? 'Resolved' : booking.status === 'refund_initiated' ? 'Refunding' : 'Pending'}
                                </span>
                            </div>
                        )}
                        {booking.cancellationDetails?.reason && (
                            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-4 text-xs font-semibold text-orange-700">
                                <span className="font-black">Reason: </span>{booking.cancellationDetails.reason}
                            </div>
                        )}
                        <CancelTimeline status={booking.status} cancellationDetails={booking.cancellationDetails} />
                        {booking.cancellationDetails && booking.cancellationDetails.refundAmount >= 0 && (
                            <details className="mt-4 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden group cursor-pointer transition-all open:bg-emerald-50 open:border-emerald-100">
                                <summary className="px-4 py-3 flex items-center justify-between outline-none">
                                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest"><span className="text-gray-500 hidden sm:inline">Refundable Credit:</span> <span className="sm:hidden">Refund:</span> {rupee(booking.cancellationDetails.refundAmount)}</span>
                                    <span className="text-[10px] text-gray-400 font-bold group-open:hidden border px-2 py-0.5 rounded-full border-gray-200">View Breakdown ↓</span>
                                    <span className="text-[10px] text-emerald-600 font-bold hidden group-open:block border px-2 py-0.5 rounded-full border-emerald-200 bg-emerald-50">Hide ↑</span>
                                </summary>
                                <div className="px-4 pb-3 pt-1 text-xs text-gray-600 border-t border-emerald-100/50">
                                    <div className="flex justify-between py-1">
                                        <span>Total Amount Paid</span>
                                        <span className="font-bold text-gray-800">{rupee(booking.price)}</span>
                                    </div>
                                    <div className="flex justify-between py-1">
                                        <span>Platform & Convenience Fee</span>
                                        <span className="font-bold text-red-600">-{rupee(booking.price - booking.cancellationDetails.refundAmount)}</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 mt-1 border-t border-emerald-200 font-black text-emerald-700 text-sm">
                                        <span>Total Refund</span>
                                        <span>{rupee(booking.cancellationDetails.refundAmount)}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-2 leading-tight">Note: Cancellation is processed in line with our refund policy. Platform charges are non-refundable.</p>
                                </div>
                            </details>
                        )}
                    </motion.div>
                )}

                {/* Booking summary card */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-sm font-black text-gray-700 tracking-tight uppercase">Booking Summary</h3>
                    </div>
                    {booking?.type?.toLowerCase() === 'event' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6">
                            {[
                                { label: 'Event Name', value: booking.name },
                                { label: 'Location', value: booking.destination },
                                { label: 'Organizer', value: booking.guide },
                                { label: 'Date', value: formatDate(booking.date) },
                                { label: 'Duration', value: booking.duration },
                                { label: 'Slots Booked', value: `${booking.people || 1} Pax` },
                                { label: 'Category', value: booking.category || 'Event' },
                                { label: 'Amount Paid', value: rupee(booking.price), highlight: true },
                            ].map(({ label, value, highlight }) => (
                                <div key={label}>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                                    <p className={`text-sm font-bold ${highlight ? 'text-emerald-600' : 'text-gray-900'}`}>{value || '—'}</p>
                                </div>
                            ))}
                            {(booking.selectedPickup?.location || booking.pickupPoints?.length > 0) && (() => {
                                const pp = booking.selectedPickup?.location ? booking.selectedPickup : booking.pickupPoints?.[0];
                                if (!pp?.location) return null;
                                return (
                                <div className="col-span-2 sm:col-span-4 mt-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Selected Pickup / Drop-off</p>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                            <p className="text-sm font-bold text-gray-900 leading-snug">
                                                {pp.location}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3 flex-wrap ml-6">
                                            {pp.time && (
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                                    <Clock className="w-3.5 h-3.5" /> {formatTimeWithAMPM(pp.time)}
                                                </div>
                                            )}
                                            {pp.link && (
                                                <a href={pp.link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white shadow-sm border border-emerald-100 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all text-xs font-bold">
                                                    <Navigation className="w-3.5 h-3.5" /> Open in Maps
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6">
                            {[
                                { label: 'Package', value: booking.name },
                                { label: 'Destination', value: booking.destination },
                                { label: 'Guide / Provider', value: booking.guide },
                                { label: 'Start Date', value: formatDate(booking.date) },
                                { label: 'End Date', value: formatDate(booking.endDate) },
                                { label: 'Duration', value: booking.duration },
                                { label: 'Travellers', value: `${booking.people || 1} Pax` },
                                ...(booking?.type?.toLowerCase() !== 'trek' ? [{ label: 'Category', value: booking.category }] : []),
                                { label: 'Pickup', value: booking.arrivalDeparture?.pickup?.address ? `${booking.arrivalDeparture.pickup.address}${booking.arrivalDeparture.pickup.location ? `, ${booking.arrivalDeparture.pickup.location}` : ''} @ ${formatTimeWithAMPM(booking.arrivalDeparture.pickup.time) || 'TBD'}` : 'TBD' },
                                { label: 'Dropoff', value: booking.arrivalDeparture?.dropoff?.address ? `${booking.arrivalDeparture.dropoff.address}${booking.arrivalDeparture.dropoff.location ? `, ${booking.arrivalDeparture.dropoff.location}` : ''} @ ${formatTimeWithAMPM(booking.arrivalDeparture.dropoff.time) || 'TBD'}` : 'TBD' },
                                { label: 'Amount Paid', value: rupee(booking.price), highlight: true },
                            ].map(({ label, value, highlight }) => (
                                <div key={label}>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                                    <p className={`text-sm font-bold ${highlight ? 'text-emerald-600' : 'text-gray-900'}`}>{value || '—'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Embedded booking pass */}
                {!cancelStatus && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                        <h3 className="text-base font-black text-gray-700 mb-3 flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-emerald-600" />
                            Your Travel Pass
                        </h3>
                        <BookingPassEmbed booking={booking} />
                    </motion.div>
                )}

                {/* Event Poster and Highlights Row */}
                {(booking.poster || highlights.length > 0) && (
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {booking.poster && (
                            <div className={`rounded-3xl overflow-hidden border border-gray-100 shadow-xl relative group ${highlights.length > 0 ? 'md:col-span-1 aspect-[4/5] sm:aspect-[16/7] md:aspect-auto' : 'md:col-span-3 aspect-[16/7]'}`}>
                                <img src={booking.poster} alt={booking.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                    <h2 className="text-xl font-black leading-tight">{booking.name}</h2>
                                    <p className="text-xs font-semibold text-white/80 line-clamp-2">{booking.destination}</p>
                                </div>
                            </div>
                        )}

                        {highlights.length > 0 && (
                            <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 ${booking.poster ? 'md:col-span-2' : 'md:col-span-3'}`}>
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <h3 className="text-base font-black text-gray-700">Event Highlights</h3>
                                </div>
                                <ul className="space-y-3">
                                    {highlights.map((h, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5 block" />
                                            <span className="leading-relaxed">{h}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    </motion.div>
                )}

                {/* Itinerary Section */}
                {itineraryList.length > 0 && booking?.type?.toLowerCase() !== 'event' && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-base font-black text-gray-700">Detailed Itinerary</h3>
                        </div>
                        <div className="space-y-4">
                            {itineraryList.map((day, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex flex-col items-center justify-center font-bold">
                                        <span className="text-[9px] uppercase">Day</span>
                                        <span className="text-sm">{day.day}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-800 text-sm mb-1">{day.location || `Day ${day.day}`}</p>
                                        
                                        {/* Day 1 Pickup */}
                                        {idx === 0 && booking.arrivalDeparture?.pickup?.address && (
                                            <div className="mb-3 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 flex items-start gap-2.5">
                                                <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-600 shrink-0">
                                                    <Navigation className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 leading-tight">
                                                        Pickup from {booking.arrivalDeparture.pickup.address}{booking.arrivalDeparture.pickup.location ? `, ${booking.arrivalDeparture.pickup.location}` : ''} at {booking.arrivalDeparture.pickup.time ? formatTimeWithAMPM(booking.arrivalDeparture.pickup.time) : 'given time'}.
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <MapPin className="w-3 h-3 text-emerald-500" />
                                                        {booking.arrivalDeparture.pickup.mapLink ? (
                                                            <a href={booking.arrivalDeparture.pickup.mapLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline truncate">
                                                                View Address Link
                                                            </a>
                                                        ) : (
                                                            <span className="text-[10px] text-gray-500 font-medium italic">No link available</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Last Day Dropoff */}
                                        {idx === itineraryList.length - 1 && booking.arrivalDeparture?.dropoff?.address && (
                                            <div className="mb-3 bg-blue-50 p-2.5 rounded-lg border border-blue-100 flex items-start gap-2.5">
                                                <div className="p-1.5 bg-blue-100 rounded-md text-blue-600 shrink-0">
                                                    <Navigation className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 leading-tight">
                                                        Drop off at {booking.arrivalDeparture.dropoff.address}{booking.arrivalDeparture.dropoff.location ? `, ${booking.arrivalDeparture.dropoff.location}` : ''} at {booking.arrivalDeparture.dropoff.time ? formatTimeWithAMPM(booking.arrivalDeparture.dropoff.time) : 'given time'}.
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <MapPin className="w-3 h-3 text-blue-500" />
                                                        {booking.arrivalDeparture.dropoff.mapLink ? (
                                                            <a href={booking.arrivalDeparture.dropoff.mapLink} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline truncate">
                                                                View Address Link
                                                            </a>
                                                        ) : (
                                                            <span className="text-[10px] text-gray-500 font-medium italic">No link available</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {day.agenda && <p className="text-sm text-gray-700 font-semibold mb-2 capitalize">{day.agenda.replace(/-/g, ' ')}</p>}
                                        {((day.activities && day.activities.length > 0) || (day.highlights && day.highlights.length > 0)) && (
                                            <div className="mb-4">
                                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mb-1.5">Highlights / Activities:</span>
                                                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 font-medium">
                                                    {[...(day.activities || []), ...(day.highlights || [])].map((item, i) => (
                                                        <li key={i} className="pl-1">{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {day.hotelPhotos && day.hotelPhotos.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-xs font-bold text-gray-800 mb-1.5">
                                                    <span className="text-gray-500 font-medium">Hotel:</span> {day.hotelName || 'Selected Accommodation'} 
                                                    {day.hotelStars && <span className="ml-1 text-[#D4AF37] font-black tracking-widest text-[10px] uppercase border px-1.5 py-0.5 rounded-full border-amber-200 bg-amber-50">⭐ {day.hotelStars} Star</span>}
                                                </p>
                                                <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                                                    {day.hotelPhotos.map((photo, pIdx) => (
                                                        <img key={pIdx} src={photo} alt={`${day.hotelName || 'Hotel'}`} className="w-28 h-20 object-cover rounded-xl shrink-0 snap-center border border-gray-100 shadow-sm" />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {day.destinationPhotos && day.destinationPhotos.length > 0 && (
                                            <div className="mb-2">
                                                <p className="text-xs font-bold text-gray-800 mb-1.5">
                                                    <span className="text-gray-500 font-medium">Destination:</span> {day.location || `Day ${day.day} Location`}
                                                </p>
                                                <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                                                    {day.destinationPhotos.map((photo, pIdx) => (
                                                        <img key={pIdx} src={photo} alt={`Destination`} className="w-28 h-20 object-cover rounded-xl shrink-0 snap-center border border-gray-100 shadow-sm" />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Inclusions and Exclusions Section */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Tag className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-base font-black text-gray-700">What's Included & Excluded</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> What's Included
                            </h4>
                            {inclusivesList.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                                    {inclusivesList.map((item, i) => (
                                        <li key={i}>{item?.text || item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic text-sm text-gray-400">Not specified.</p>
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                <XCircle className="w-3.5 h-3.5 text-red-500" /> What's Excluded
                            </h4>
                            {exclusivesList.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                                    {exclusivesList.map((item, i) => (
                                        <li key={i}>{item?.text || item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic text-sm text-gray-400">Not specified.</p>
                            )}
                        </div>
                    </div>
                    {additionalPoints.length > 0 && booking?.type?.toLowerCase() === 'trek' && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                <Navigation className="w-3.5 h-3.5 text-amber-500" /> Additional Points
                            </h4>
                            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                                {additionalPoints.map((item, i) => (
                                    <li key={i}>{item?.text || item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>

                {/* What to Bring and Restrictions (for events usually) */}
                {(whatToBring.length > 0 || restrictions.length > 0) && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <h3 className="text-base font-black text-gray-700">Important Instructions</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {whatToBring.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                        <Tag className="w-3.5 h-3.5 text-emerald-600" /> What to Bring
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                                        {whatToBring.map((item, i) => (
                                            <li key={i}>{item?.text || item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {restrictions.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Restrictions
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                                        {restrictions.map((item, i) => (
                                            <li key={i}>{item?.text || item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Terms and Policies */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-base font-black text-gray-700">Policies & Conditions</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                        <div>
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> BagsPackGo Policies
                            </h4>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Booking is confirmed subject to payment realization.</li>
                                {booking?.type?.toLowerCase() === 'event' ? (
                                    <li className="font-black text-rose-600">Cancellations are strictly non-refundable for event bookings.</li>
                                ) : (
                                    <>
                                        <li>Cancellations made 7 days prior to departure are eligible for a 75% refund.</li>
                                        <li>Cancellations within 48 hours of departure are strictly non-refundable.</li>
                                    </>
                                )}
                                <li>BagsPackGo acts only as an aggregator and is not directly responsible for delays caused by the service provider.</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Provider Conditions
                            </h4>
                            {termsAndConditionsList.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2">
                                    {termsAndConditionsList.map((term, i) => (
                                        <li key={i}>{term?.text || term}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="italic text-gray-400">Terms and conditions not available.</p>
                            )}
                        </div>
                    </div>
                </motion.div>

            </div>

            {/* Cancel Modal */}
            <AnimatePresence>
                {showCancelModal && (
                    <CancelModal
                        onClose={() => setShowCancelModal(false)}
                        onConfirm={handleCancelConfirm}
                        loading={cancelling}
                    />
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.9 }}
                        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-bold text-white max-w-sm w-full mx-4 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
                    >
                        {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
