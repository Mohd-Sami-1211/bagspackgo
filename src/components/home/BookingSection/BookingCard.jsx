'use client';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Clock, ArrowRight, Tag, AlertCircle, CheckCircle, XCircle, RotateCcw, RefreshCcw } from 'lucide-react';

const STATUS_CONFIG = {
    confirmed: {
        label: 'Confirmed',
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        Icon: CheckCircle,
    },
    pending: {
        label: 'Pending',
        color: 'bg-amber-100 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        Icon: AlertCircle,
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-700 border-red-200',
        dot: 'bg-red-500',
        Icon: XCircle,
    },
    cancellation_requested: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-700 border-red-200',
        dot: 'bg-red-500',
        Icon: XCircle,
    },
    refund_initiated: {
        label: 'Refund Initiated',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        Icon: RefreshCcw,
    },
};

const TYPE_COLORS = {
    trip: 'from-emerald-600 to-teal-600',
    Trek: 'from-emerald-600 to-teal-600',
    Event: 'from-emerald-600 to-teal-600',
};

const BookingCard = ({ booking, onClick }) => {
    const ensureString = (val) => {
        if (!val) return '';
        if (typeof val === 'object') return val.label || val.value || '';
        return String(val);
    };

    const name = ensureString(booking.name);
    const destination = ensureString(booking.destination);
    const guide = ensureString(booking.guide);
    const status = booking.status || 'pending';
    const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const type = booking.type || 'trip';
    const gradientClass = TYPE_COLORS[type] || TYPE_COLORS.trip;

    const formatDate = (d) => {
        if (!d) return 'TBD';
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const rupee = (v) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.12)' }}
            whileTap={{ scale: 0.995 }}
            onClick={onClick}
            className="relative bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 cursor-pointer transition-all group"
        >
            {/* Coloured top bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${gradientClass}`} />

            <div className="p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gradient-to-r ${gradientClass} text-white`}>
                                {type}
                            </span>
                            {booking.bookingRef && (
                                <span className="text-[10px] font-bold text-gray-400 font-mono">#{booking.bookingRef}</span>
                            )}
                        </div>
                        <h3 className="text-base font-black text-gray-900 leading-snug truncate pr-2">
                            {name || 'Trip Package'}
                        </h3>
                        {destination && (
                            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                                {destination}
                            </p>
                        )}
                    </div>

                    {/* Status badge */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black shrink-0 ${statusCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                    </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4 border-b border-gray-100">
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Date</p>
                        <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-emerald-500 shrink-0" />
                            {formatDate(booking.date)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Duration</p>
                        <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                            {booking.duration || 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Guide</p>
                        <p className="text-xs font-bold text-gray-800 truncate">{guide || '—'}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Travellers</p>
                        <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                            <Users className="w-3 h-3 text-blue-500 shrink-0" />
                            {booking.people || 1} Pax
                        </p>
                    </div>
                </div>

                {/* Footer row: price + CTA */}
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Amount Paid</p>
                        <p className="text-lg font-black text-emerald-600">{rupee(booking.price)}</p>
                    </div>
                    <button
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-white bg-gradient-to-r ${gradientClass} shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all`}
                        onClick={onClick}
                    >
                        View Details <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Cancellation warning banner */}
                {(status === 'refund_initiated') && (
                    <div className={`mt-3 flex items-center gap-2 text-xs font-semibold rounded-xl px-3 py-2 border ${statusCfg.color}`}>
                        <statusCfg.Icon className="w-3.5 h-3.5 shrink-0" />
                        Refund has been initiated. Please allow 5-7 business days.
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default BookingCard;
