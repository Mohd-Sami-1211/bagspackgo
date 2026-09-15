'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Calendar, Users, Clock, Tag, CheckCircle2, XCircle,
    AlertCircle, RotateCcw, Star, RefreshCcw, AlertTriangle,
    Phone, Mail, Download, QrCode, Navigation, CalendarCheck2
} from 'lucide-react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import AccountPageHeader from '@/components/user/AccountPageHeader';
import useHistoryBack from '@/hooks/useHistoryBack';

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
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 font-sans"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Cancel Booking</h3>
                        <p className="text-sm text-gray-500">This action cannot be undone.</p>
                    </div>
                </div>

                <div className="p-6">
                    {step === 'reason' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                            <p className="text-sm font-medium text-gray-700 mb-4">Please tell us why you want to cancel:</p>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {reasons.map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setReason(r)}
                                        className={`text-xs font-semibold px-3 py-2.5 rounded-lg border text-left transition-all ${reason === r ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                            {reason === 'Other' && (
                                <textarea
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 resize-none outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                    rows={3}
                                    placeholder="Tell us more..."
                                    onChange={(e) => setReason('Other: ' + e.target.value)}
                                />
                            )}
                            <div className="flex gap-3 mt-6">
                                <button onClick={onClose} className="flex-1 py-2 rounded-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                    Keep Booking
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!reason.trim()}
                                    className="flex-1 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-50"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'confirm' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-4">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Reason</p>
                                <p className="text-sm font-semibold text-gray-900">{reason}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Type <span className="font-bold text-emerald-600 select-none">confirm</span> to proceed:
                            </p>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder="Type 'confirm'"
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-mono text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 mb-6"
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            />
                            <div className="flex gap-3">
                                <button onClick={() => setStep('reason')} className="flex-1 py-2 rounded-md border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={confirmText.trim().toLowerCase() !== 'confirm' || loading}
                                    className="flex-1 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-sm font-medium text-white shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Cancel Booking'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
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
    const providerName = booking?.companyName || booking?.guideName || 'bagspackgo Verified Partner';
    const destinationName = ensureString(pSnapshot.destination || booking?.destination || '');
    const travelers = booking?.personalDetails?.personalDetails || [];
    const arrivalDeparture = booking?.arrivalDeparture || {};
    const totalAmount = Number(booking?.totalAmount ?? booking?.price ?? 0);
    const amountPaid = Number(booking?.amountPaid ?? booking?.price ?? totalAmount);
    const remainingAmount = Math.max(0, Number(booking?.remainingAmount ?? totalAmount - amountPaid));
    const isPartialPayment = booking?.type?.toLowerCase() === 'trip' && (booking?.paymentMode === 'partial' || remainingAmount > 0);

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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-left sm:text-right">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Booking Ref</p>
                            <p className="text-xl font-black text-gray-900 font-mono tracking-wider">
                                {booking.bookingRef || booking.id?.substring(0, 8).toUpperCase()}
                            </p>
                            <span className="inline-block text-[10px] font-black text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full mt-1 border border-emerald-200">
                                {isPartialPayment ? 'Booking Confirmed · 30% Paid' : 'Payment Confirmed'}
                            </span>
                        </div>
                        {passUrl && (
                            <div className="shrink-0 bg-white p-1.5 rounded-xl border border-emerald-200 shadow-sm flex flex-col items-center ml-0 sm:ml-2">
                                <QRCodeSVG value={passUrl} size={64} level="H" />
                                <p className="text-[7px] font-bold text-emerald-800 uppercase tracking-[0.1em] mt-1">Scan for Pass</p>
                            </div>
                        )}
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
                                // Trip pickup
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
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Paid Now</p>
                            <p className="text-sm font-black text-emerald-600">{rupee(amountPaid)}</p>
                        </div>
                        {isPartialPayment && (
                            <div className="col-span-2 sm:col-span-4 flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">Trip Total</p>
                                    <p className="text-xs font-bold text-amber-950">{rupee(totalAmount)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">Balance Due On Trip Day</p>
                                    <p className="text-sm font-black text-amber-800">{rupee(remainingAmount)}</p>
                                </div>
                            </div>
                        )}
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
                            {travelers.map((t, i) => (
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
                                </div>
                            ))}
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
    const goBack = useHistoryBack('/user/bookings');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [toast, setToast] = useState(null);
    const { data: booking, error: bookingError, isLoading: loading, mutate } = useSWR(
        id ? `/api/user/bookings/${id}?view=detail` : null,
        async (url) => {
            const response = await fetch(url, { headers: { Accept: 'application/json' } });
            const payload = await response.json().catch(() => null);
            if (!response.ok || !payload?.success) {
                const error = new Error(payload?.message || 'Unable to load booking');
                error.status = response.status;
                throw error;
            }
            return payload.data;
        },
        {
            dedupingInterval: 300000,
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            keepPreviousData: true,
        },
    );

    const handleCancelConfirm = async (reason) => {
        if (!booking) return;
        setCancelling(true);
        try {
            const endpoint = `/api/user/trip-bookings/${id}/cancel`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason }),
            });
            const data = await res.json();
            if (data.success) {
                setShowCancelModal(false);
                setToast({ type: 'success', message: 'Cancellation requested. We\'ll process your refund shortly.' });
                await mutate();
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
    const bookingTotal = Number(booking?.totalAmount ?? booking?.price ?? 0);
    const bookingPaid = Number(booking?.amountPaid ?? booking?.price ?? bookingTotal);
    const bookingBalance = Math.max(0, Number(booking?.remainingAmount ?? bookingTotal - bookingPaid));
    const isPartialTripPayment = booking?.type?.toLowerCase() === 'trip' && (booking?.paymentMode === 'partial' || bookingBalance > 0);

    const pSnapshot = booking?.packageSnapshot || booking?.packageId || booking?.package || {};
    const getList = (key) => booking?.[key] || pSnapshot?.[key] || [];
    
    const filterItems = (items) => items.filter(item => {
        const text = item?.text || item;
        return text && text !== 'Not specified' && (typeof text !== 'string' || text.trim() !== '');
    });
    
    const inclusivesList = filterItems(getList('inclusivesList'));
    const exclusivesList = filterItems(getList('exclusivesList'));
    const termsAndConditionsList = getList('termsAndConditions');
    const itineraryList = getList('itinerary');
    const highlights = getList('highlights');
    const whatToBring = getList('whatToBring');
    const restrictions = getList('restrictions');
    const sponsors = booking?.sponsors || pSnapshot?.sponsors || [];
    const coverImage = booking?.poster || booking?.coverImage || '/images/hero.svg';

    /* ─── Loading ─── */
    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-emerald-700 font-semibold text-sm">Loading booking details...</p>
            </div>
        );
    }

    if (!booking || bookingError) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-xl font-black text-gray-800">Booking Not Found</h2>
                <p className="text-sm text-gray-500 text-center max-w-xs">{bookingError?.status === 404 ? 'This booking does not exist or may have been removed.' : 'We could not load this booking. Please check your connection and try again.'}</p>
                <button type="button" onClick={goBack} className="mt-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
                    Back to My Bookings
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f5f8f6] pb-16 pt-8 font-sans sm:pt-10">
            <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
                <AccountPageHeader
                    eyebrow="Booking details"
                    title="View Booking"
                    description="Everything you need for this confirmed journey, payment and travel pass."
                    icon={CalendarCheck2}
                    backHref="/user/bookings"
                    trailing={<span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black ${cfg.bg} ${cfg.border} ${cfg.text}`}><cfg.Icon className="h-4 w-4" />{cfg.label}</span>}
                />

                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="relative h-64 overflow-hidden sm:h-72">
                        <img src={coverImage} alt={booking.name || 'Booking'} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/10" />
                        <div className="absolute left-5 right-5 top-5 flex flex-wrap items-center justify-between gap-3">
                            <span className="rounded-full border border-white/25 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-800 backdrop-blur">{booking.type}</span>
                            {isPartialTripPayment && <span className="rounded-full border border-amber-200/50 bg-amber-300 px-3 py-1.5 text-[10px] font-black text-amber-950">30% paid</span>}
                        </div>
                        <div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-7 sm:left-7 sm:right-7">
                            <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-white/65">Booking ID: {booking.bookingRef || booking.id?.slice(-10).toUpperCase()}</p>
                            <h2 className="text-2xl font-black leading-tight sm:text-4xl">{booking.name}</h2>
                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/80 sm:text-sm">
                                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{booking.destination || 'Location to be confirmed'}</span>
                                <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{formatDate(booking.date)}</span>
                                <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" />{booking.people || 1} traveller{Number(booking.people || 1) === 1 ? '' : 's'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Managed by</p><p className="mt-1 text-sm font-black text-slate-900">{booking.companyName || booking.guide || 'Verified Partner'}</p></div>
                        <div className="flex flex-wrap items-center gap-2">
                        {!cancelStatus && booking.passUrl && (
                            <Link href={booking.passUrl}
                                className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800">
                                <QrCode className="w-4 h-4" /> View Pass
                            </Link>
                        )}
                        {!cancelStatus && booking.passUrl && (
                            <Link href={`${booking.passUrl}?print=true`} target="_blank"
                                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                                <Download className="w-4 h-4" /> Download / Print
                            </Link>
                        )}
                        {canCancel && (
                            <button onClick={() => setShowCancelModal(true)}
                                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100">
                                <XCircle className="w-4 h-4" /> Cancel Booking
                            </button>
                        )}
                        </div>
                    </div>
                </motion.section>

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
                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50"><Tag className="h-4 w-4 text-emerald-700" /></span>
                        <div><p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">At a glance</p><h3 className="text-base font-black text-slate-900">Booking summary</h3></div>
                    </div>
                    {booking?.type?.toLowerCase() === 'event' ? (
                        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 sm:p-6 lg:grid-cols-4">
                            {[
                                { label: 'Event Name', value: booking.name },
                                { label: 'Location', value: booking.destination },
                                { label: 'Organizer', value: booking.guide },
                                { label: 'Date', value: formatDate(booking.date) },
                                { label: 'Duration', value: booking.duration },
                                { label: 'Slots Booked', value: `${booking.people || 1} Pax` },
                                { label: 'Category', value: booking.category || 'Event' },
                                { label: 'Booked On', value: (booking.createdAt || booking.bookingDate) ? (() => { const d = new Date(booking.createdAt || booking.bookingDate); return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`; })() : '—' },
                                { label: 'Amount Paid', value: rupee(booking.price), highlight: true },
                            ].map(({ label, value, highlight }) => (
                                <div key={label} className="rounded-xl bg-slate-50 p-3.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                                    <p className={`text-sm font-bold ${highlight ? 'text-emerald-600' : 'text-gray-900'}`}>{value || '—'}</p>
                                </div>
                            ))}
                            {(booking.includePickup !== false) && (booking.selectedPickup?.location || booking.pickupPoints?.length > 0) && (() => {
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
                        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 sm:p-6">
                            {[
                                { label: 'Package', value: booking.name },
                                { label: 'Destination', value: booking.destination },
                                { label: 'Guide / Provider', value: booking.guide },
                                { label: 'Start Date', value: formatDate(booking.date) },
                                { label: 'End Date', value: formatDate(booking.endDate) },
                                { label: 'Duration', value: booking.duration },
                                { label: 'Travellers', value: `${booking.people || 1} Pax` },
                                { label: 'Category', value: booking.category },
                                { label: 'Pickup', value: booking.arrivalDeparture?.pickup?.address ? `${booking.arrivalDeparture.pickup.address}${booking.arrivalDeparture.pickup.location ? `, ${booking.arrivalDeparture.pickup.location}` : ''} @ ${formatTimeWithAMPM(booking.arrivalDeparture.pickup.time) || 'TBD'}` : 'TBD' },
                                { label: 'Booked On', value: (booking.createdAt || booking.bookingDate) ? (() => { const d = new Date(booking.createdAt || booking.bookingDate); return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`; })() : '—' },
                                { label: 'Trip Total', value: rupee(bookingTotal) },
                                { label: 'Paid Now', value: rupee(bookingPaid), highlight: true },
                                ...(isPartialTripPayment ? [{ label: 'Balance Due On Trip Day', value: rupee(bookingBalance), warning: true }] : []),
                            ].map(({ label, value, highlight, warning }) => (
                                <div key={label} className={`rounded-xl p-3.5 ${warning ? 'border border-amber-200 bg-amber-50' : highlight ? 'border border-emerald-100 bg-emerald-50' : 'bg-slate-50'}`}>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                                    <p className={`text-sm font-bold ${warning ? 'text-amber-700' : highlight ? 'text-emerald-600' : 'text-gray-900'}`}>{value || '—'}</p>
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
                {(inclusivesList.length > 0 || exclusivesList.length > 0) && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-base font-black text-gray-700">What's Included & Excluded</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {inclusivesList.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> What's Included
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                                        {inclusivesList.map((item, i) => (
                                            <li key={i}>{item?.text || item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {exclusivesList.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-800 uppercase tracking-widest mb-3 text-[11px] flex items-center gap-2">
                                        <XCircle className="w-3.5 h-3.5 text-red-500" /> What's Excluded
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                                        {exclusivesList.map((item, i) => (
                                            <li key={i}>{item?.text || item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

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

                {/* Event Sponsors */}
                {sponsors.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="w-5 h-5 text-amber-500" />
                            <h3 className="text-base font-black text-gray-700">Event Sponsors</h3>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {sponsors.map((sponsor, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    {sponsor.image || sponsor.logo ? (
                                        <img src={sponsor.image || sponsor.logo} alt={sponsor.name} className="w-12 h-12 object-contain" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xl">
                                            {sponsor.name.charAt(0)}
                                        </div>
                                    )}
                                    <p className="text-xs font-semibold text-gray-700 text-center">{sponsor.name}</p>
                                </div>
                            ))}
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
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> bagspackgo Policies
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
                                <li>bagspackgo acts only as an aggregator and is not directly responsible for delays caused by the service provider.</li>
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
        </main>
    );
}
