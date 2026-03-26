'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Calendar, Users, MapPin, Clock,
    CreditCard, Mail, Phone, AlertTriangle,
    CheckCircle2, XCircle, Navigation, Hash, Luggage, Download,
    RotateCcw, RefreshCcw
} from 'lucide-react';
import Link from 'next/link';

/* ── helpers ── */
const STATUS_CFG = {
    confirmed: {
        label: 'Confirmed',
        badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        bar: 'from-emerald-400 to-teal-400',
        icon: CheckCircle2,
    },
    cancelled: {
        label: 'Cancelled',
        badge: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200',
        bar: 'from-rose-400 to-pink-400',
        icon: XCircle,
    },
    cancellation_requested: {
        label: 'Cancellation Requested',
        badge: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
        bar: 'from-orange-400 to-amber-400',
        icon: RotateCcw,
    },
    refund_initiated: {
        label: 'Refund Initiated',
        badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
        bar: 'from-blue-400 to-sky-400',
        icon: RefreshCcw,
    },
    pending: {
        label: 'Pending',
        badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        bar: 'from-amber-400 to-yellow-400',
        icon: AlertTriangle,
    },
};

function StatusBadge({ status }) {
    const isCancelledItem = ['cancelled', 'cancellation_requested', 'refund_initiated'].includes(status);
    const cfg = isCancelledItem ? STATUS_CFG.cancelled : (STATUS_CFG[status] || STATUS_CFG.confirmed);
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${cfg.badge}`}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
        </span>
    );
}

function SectionCard({ title, icon: Icon, accent = 'emerald', children }) {
    const colorMap = {
        emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
        rose: { bg: 'bg-rose-50', icon: 'text-rose-500', border: 'border-rose-100' },
        amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
        indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-100' },
    };
    const c = colorMap[accent];
    return (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className={`px-5 py-3.5 border-b ${c.border} flex items-center gap-3`}>
                <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${c.icon}`} />
                </div>
                <h3 className="text-sm font-bold text-gray-700">{title}</h3>
            </div>
            <div className="px-5 py-4">{children}</div>
        </div>
    );
}

function ContactRow({ icon: Icon, label, value, href }) {
    return (
        <div className="flex items-center gap-3 py-2.5 border-b border-neutral-50 last:border-0">
            <Icon className="w-4 h-4 text-neutral-300 shrink-0" />
            <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
                {href
                    ? <a href={href} className="text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">{value}</a>
                    : <p className="text-sm font-semibold text-gray-800">{value || '—'}</p>
                }
            </div>
        </div>
    );
}

/* ── page ── */
export default function SingleTripBooking() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!id) return;
        fetch(`/api/provider/trip-bookings/${id}`)
            .then(r => r.json())
            .then(d => { if (d.success) setBooking(d.data); else setError(d.message || 'Booking not found'); })
            .catch(() => setError('Network error'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleStatusUpdate = async (newStatus) => {
        if (!confirm(`Are you sure you want to update status to ${newStatus}?`)) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/provider/trip-bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                // Refresh booking
                const r = await fetch(`/api/provider/trip-bookings/${id}`);
                const d = await r.json();
                if (d.success) setBooking(d.data);
            } else {
                alert(data.message || 'Failed to update status');
            }
        } catch (e) {
            alert('Error updating status');
        } finally {
            setUpdating(false);
        }
    };


    /* ── loading ── */
    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-sm text-neutral-400 font-medium">Loading booking…</p>
            </div>
        </div>
    );

    /* ── error ── */
    if (error || !booking) return (
        <div className="max-w-md mx-auto mt-16 bg-white rounded-2xl border border-rose-100 shadow-sm p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-700 mb-4">{error || 'Booking not found'}</p>
            <button onClick={() => router.back()}
                className="px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition">
                Go Back
            </button>
        </div>
    );

    const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
    const fmtAmt = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);

    const ensureString = (val) => {
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return val.toString();
        if (val && typeof val === 'object' && val.label) return val.label;
        if (val && typeof val === 'object' && val.value) return val.value;
        return '';
    };

    const travelers = booking.personalDetails?.personalDetails || [];
    const contact = booking.personalDetails?.contactDetails || {};
    const emergency = booking.personalDetails?.emergencyContact || {};
    const arrival = booking.arrivalDeparture?.arrival || {};
    const departure = booking.arrivalDeparture?.departure || {};
    const pickup = booking.arrivalDeparture?.pickup || {};
    const dropoff = booking.arrivalDeparture?.dropoff || {};
    const cfg = STATUS_CFG[booking.status] || STATUS_CFG.confirmed;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-16">

            {/* ── back link ── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Link href="/serviceprovider/dashboard/trips"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-emerald-700 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to bookings
                </Link>
            </motion.div>

            {/* ── Hero card ── */}
            <motion.div
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden"
            >
                {/* gradient bar */}
                <div className={`h-1.5 bg-gradient-to-r ${cfg.bar}`} />

                <div className="p-6 md:p-8">
                    {/* Top row: icon + title + amount */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        {/* left */}
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.bar} shadow-md flex items-center justify-center shrink-0`}>
                                <Luggage className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                                    <StatusBadge status={booking.status} />
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                                        <Hash className="w-3 h-3" />{booking.bookingRef}
                                    </span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                                    {booking.packageName}
                                </h1>
                                <p className="text-sm text-neutral-500 mt-1.5 flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-emerald-500" />
                                    {booking.destination}
                                </p>
                            </div>
                        </div>

                        {/* Actions removed - cancellation managed by admin only */}


                    </div>

                    {/* Divider */}
                    <div className="my-6 h-px bg-neutral-50" />

                    {/* Stat bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Calendar, label: 'Start Date', value: fmtDate(booking.startDate) },
                            { icon: Clock, label: 'Duration', value: `${booking.days} Days` },
                            { icon: Users, label: 'Group', value: `${booking.numPeople} ${booking.category === 'couple' ? 'Couple' : 'Person(s)'}` },
                            { icon: CreditCard, label: 'Confirmed At', value: new Date(booking.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) },
                        ].map(({ icon: Ic, label, value }, i) => (
                            <div key={i} className="flex items-center gap-3 bg-neutral-50 rounded-xl p-3.5 border border-neutral-100">
                                <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
                                    <Ic className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
                                    <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── Body grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Travellers — takes 2 cols ── */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}
                    className="lg:col-span-2"
                >
                    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-neutral-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-emerald-600" />
                                </div>
                                <h3 className="text-sm font-bold text-gray-700">Travellers</h3>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                                {travelers.length} {travelers.length === 1 ? 'person' : 'people'}
                            </span>
                        </div>

                        {travelers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-neutral-50/80 border-b border-neutral-100">
                                            <th className="px-5 py-3 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">#</th>
                                            <th className="px-5 py-3 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Name</th>
                                            <th className="px-5 py-3 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Gender / Age</th>
                                            <th className="px-5 py-3 text-left text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Nationality</th>
                                            <th className="px-5 py-3 text-right text-[10px] font-bold text-neutral-400 uppercase tracking-widest">ID Proof</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-50">
                                        {travelers.map((t, i) => (
                                            <tr key={i} className="hover:bg-emerald-50/20 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <span className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold
                                           flex items-center justify-center border border-emerald-100">
                                                        {i + 1}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 font-semibold text-gray-800">{ensureString(t.name) || `Traveller ${i + 1}`}</td>
                                                <td className="px-5 py-3.5 text-neutral-500">{ensureString(t.gender)} · {ensureString(t.age)} yrs</td>
                                                <td className="px-5 py-3.5 text-neutral-500">{ensureString(t.nationality) || '—'}</td>
                                                <td className="px-5 py-3.5 text-right">
                                                    {t.idType ? (
                                                        <div className="flex justify-end items-center gap-3">
                                                            <div className="text-right">
                                                                <span className="text-[9px] text-neutral-400 uppercase font-bold block tracking-widest">{ensureString(t.idType)}</span>
                                                                <span className="font-mono text-xs font-bold text-gray-700 bg-neutral-50 border border-neutral-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                                                                    {ensureString(t.idNumber)}
                                                                </span>
                                                            </div>
                                                            {(t.idImagePreview || t.idImageUrl || t.idImage) && (
                                                                <div className="flex items-center gap-2 justify-end">
                                                                    <a href={t.idImagePreview || t.idImageUrl || t.idImage} target="_blank" rel="noreferrer" className="h-8 w-12 rounded overflow-hidden border border-neutral-200 block shrink-0 hover:opacity-80 transition bg-neutral-50" title="View ID Proof">
                                                                        <img src={t.idImagePreview || t.idImageUrl || t.idImage} alt="ID" className="w-full h-full object-cover" />
                                                                    </a>
                                                                    <a href={t.idImagePreview || t.idImageUrl || t.idImage} download={`ID_Proof_${ensureString(t.name)}.jpg`} className="p-1.5 rounded-md border border-neutral-200 text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50 transition flex items-center gap-1 bg-white shadow-sm" title="Download ID">
                                                                        <Download className="w-3.5 h-3.5" />
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : <span className="text-neutral-300 text-xs italic">N/A</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-neutral-300" />
                                </div>
                                <p className="text-sm font-semibold text-neutral-500">No traveller details available</p>
                                <p className="text-xs text-neutral-400">Individual passenger info was not submitted.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── Sidebar ── */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.35 }}
                    className="space-y-4"
                >
                    {/* Contact Details */}
                    <SectionCard title="Contact Details" icon={Mail} accent="indigo">
                        <ContactRow icon={Users} label="Booked via account" value={booking.bookedBy} />
                        {contact.email && <ContactRow icon={Mail} label="Email" value={contact.email} href={`mailto:${contact.email}`} />}
                        {contact.mobile && <ContactRow icon={Phone} label="Mobile" value={contact.mobile} href={`tel:${contact.mobile}`} />}
                    </SectionCard>

                    {/* Emergency contact */}
                    {(emergency.name || emergency.phone) && (
                        <SectionCard title="Emergency Contact" icon={AlertTriangle} accent="rose">
                            {emergency.name && <ContactRow icon={Users} label="Name" value={emergency.name} />}
                            {emergency.relation && <ContactRow icon={Users} label="Relation" value={emergency.relation} />}
                            {emergency.phone && <ContactRow icon={Phone} label="Phone" value={emergency.phone} href={`tel:${emergency.phone}`} />}
                        </SectionCard>
                    )}

                    {/* Logistics */}
                    {(arrival.city || departure.city || pickup.location || dropoff.location) && (
                        <SectionCard title="Logistics" icon={Navigation} accent="amber">
                            <div className="relative pl-6 space-y-6">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-300 to-rose-300 rounded-full" />

                                {arrival.city && (
                                    <div className="relative">
                                        <span className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow" />
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Arrival</p>
                                        <p className="text-sm font-bold text-gray-800">{arrival.city}</p>
                                        {arrival.time && (
                                            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {arrival.time}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {departure.city && (
                                    <div className="relative">
                                        <span className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-rose-400 border-2 border-white shadow" />
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Departure</p>
                                        <p className="text-sm font-bold text-gray-800">{departure.city}</p>
                                        {departure.time && (
                                            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {departure.time}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {pickup.location && (
                                    <div className="relative">
                                        <span className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-blue-400 border-2 border-white shadow" />
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Pickup</p>
                                        <p className="text-sm font-bold text-gray-800">{ensureString(pickup.location)}</p>
                                        {pickup.address && <p className="text-xs text-neutral-600 mt-1">{ensureString(pickup.address)}</p>}
                                        {pickup.time && (
                                            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {pickup.time}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {dropoff.location && (
                                    <div className="relative">
                                        <span className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-purple-400 border-2 border-white shadow" />
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Drop-off</p>
                                        <p className="text-sm font-bold text-gray-800">{ensureString(dropoff.location)}</p>
                                        {dropoff.address && <p className="text-xs text-neutral-600 mt-1">{ensureString(dropoff.address)}</p>}
                                        {dropoff.time && (
                                            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {dropoff.time}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    )}
                </motion.div>
            </div>

            {/* ── Payment Breakdown ── */}
            <motion.div
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}
                className="mt-6 bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden"
            >
                <div className="px-5 py-4 border-b border-neutral-50 flex items-center justify-between bg-neutral-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-sm">
                            <CreditCard className="w-4 h-4 text-emerald-700" />
                        </div>
                        <h3 className="text-base font-black text-gray-800 tracking-tight">Payment Breakdown</h3>
                    </div>
                </div>
                <div className="px-6 py-6 space-y-4">
                    <div className="flex justify-between items-center text-sm font-semibold text-gray-600 p-3 bg-neutral-50/50 rounded-xl border border-neutral-100">
                        <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>Package Total (Collected from User)</span>
                        <span className="font-mono">{fmtAmt(booking.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-semibold text-gray-600 p-3 bg-neutral-50/50 rounded-xl border border-neutral-100">
                        <span className="flex items-center gap-2 text-rose-600"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>Platform Charges (10% deducted)</span>
                        <span className="font-mono text-rose-600">- {fmtAmt(booking.totalAmount * 0.1)}</span>
                    </div>
                    <div className="my-2 h-px bg-neutral-100" />
                    <div className="flex justify-between items-center text-lg p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                        <span className="font-black text-emerald-800 tracking-tight">Final Revenue</span>
                        <span className="font-black font-mono text-emerald-700 text-xl">{fmtAmt(booking.totalAmount * 0.9)}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
