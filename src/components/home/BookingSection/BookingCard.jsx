'use client';
import { MapPin, Calendar, Users, Clock, ArrowRight, CheckCircle, AlertCircle, XCircle, RefreshCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const STATUS_CONFIG = {
    confirmed: {
        label: 'Confirmed',
        variant: 'success',
        Icon: CheckCircle,
    },
    pending: {
        label: 'Pending',
        variant: 'warning',
        Icon: AlertCircle,
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'destructive',
        Icon: XCircle,
    },
    cancellation_requested: {
        label: 'Cancelled',
        variant: 'destructive',
        Icon: XCircle,
    },
    refund_initiated: {
        label: 'Refund Initiated',
        variant: 'outline',
        Icon: RefreshCcw,
    },
};

const TYPE_CONFIG = {
    Trip: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    Trek: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    Event: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
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
    const type = booking.type || 'Trip';
    const typeCfg = TYPE_CONFIG[type] || TYPE_CONFIG.Trip;

    const formatDate = (d) => {
        if (!d) return 'TBD';
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };



    const rupee = (v) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

    const isCancelled = ['cancelled', 'cancellation_requested', 'refund_initiated'].includes(status);

    return (
        <Card
            onClick={onClick}
            className="group cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200/80 overflow-hidden"
        >
            <div className="p-4 sm:p-5">
                {/* Header: Type badge + Status + Ref */}
                <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}>
                            {type}
                        </span>
                        {booking.bookingRef && (
                            <span className="text-[11px] text-gray-400 font-mono">#{booking.bookingRef}</span>
                        )}
                    </div>
                    <Badge variant={statusCfg.variant} className="text-[10px] gap-1 shrink-0">
                        <statusCfg.Icon className="w-3 h-3" />
                        {statusCfg.label}
                    </Badge>
                </div>

                {/* Title + Destination */}
                <h3 className={`text-[15px] font-semibold text-gray-900 leading-snug truncate mb-1 ${isCancelled ? 'line-through opacity-60' : ''}`}>
                    {name || 'Package'}
                </h3>
                {destination && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-4 font-medium">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        {destination}
                    </p>
                )}

                <Separator className="mb-4" />

                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Travel Date</p>
                        <p className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                            {formatDate(booking.date)}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                        <p className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                            {booking.duration || '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Booked On</p>
                        <p className="text-[11px] font-semibold text-gray-500">
                            {(booking.createdAt || booking.bookingDate) ? (
                                (() => {
                                    const d = new Date(booking.createdAt || booking.bookingDate);
                                    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
                                })()
                            ) : '—'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Travellers</p>
                        <p className="text-xs font-semibold text-gray-800 flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-gray-400 shrink-0" />
                            {booking.people || 1}
                        </p>
                    </div>
                </div>

                <Separator className="my-4" />

                {/* Footer: Price + CTA */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Total</p>
                        <p className={`text-lg font-bold tabular-nums ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {rupee(booking.price)}
                        </p>
                    </div>
                    <button
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900"
                        onClick={onClick}
                    >
                        View Details
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>

                {/* Refund notice */}
                {status === 'refund_initiated' && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-2.5 border border-blue-200 bg-blue-50 text-blue-700">
                        <RefreshCcw className="w-3.5 h-3.5 shrink-0" />
                        Refund has been initiated. Please allow 5–7 business days.
                    </div>
                )}
            </div>
        </Card>
    );
};

export default BookingCard;
