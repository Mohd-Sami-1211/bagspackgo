'use client';
import { MapPin, Calendar, Users, Clock, ArrowRight, CheckCircle, AlertCircle, XCircle, RefreshCcw, Compass, Ticket } from 'lucide-react';
import { Card } from '@/components/ui/card';

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
    const totalAmount = Number(booking.totalAmount ?? booking.price ?? 0);
    const amountPaid = Number(booking.amountPaid ?? booking.price ?? totalAmount);
    const remainingAmount = Math.max(0, Number(booking.remainingAmount ?? totalAmount - amountPaid));
    const isPartialPayment = type === 'Trip' && (booking.paymentMode === 'partial' || remainingAmount > 0);

    const formatDate = (d) => {
        if (!d) return 'TBD';
        return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };



    const rupee = (v) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

    const isCancelled = ['cancelled', 'cancellation_requested', 'refund_initiated'].includes(status);
    const TypeIcon = type === 'Event' ? Ticket : Compass;

    return (
        <Card
            onClick={onClick}
            className="group cursor-pointer overflow-hidden rounded-2xl border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-lg sm:p-5"
        >
          <div className="grid gap-5 md:grid-cols-[240px_1fr]">
            <div className="relative min-h-48 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-700 to-teal-950 md:min-h-full">
                {booking.image && <img src={booking.image} alt={name || type} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                {!booking.image && <TypeIcon className="absolute bottom-5 right-5 h-20 w-20 text-white/15" />}
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-800 backdrop-blur"><TypeIcon className="h-3 w-3" />{type}</span>
            </div>

            <div className="min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h3 className={`text-xl font-black leading-tight text-slate-950 ${isCancelled ? 'line-through opacity-70' : ''}`}>{name || 'Package'}</h3><p className="mt-1.5 font-mono text-xs font-semibold text-slate-400">{booking.bookingRef ? `Booking ID: ${booking.bookingRef}` : 'Confirmed booking'}</p></div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-black text-emerald-800"><statusCfg.Icon className="h-3 w-3" />{statusCfg.label}</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-emerald-700" />{formatDate(booking.date)}{booking.endDate ? ` – ${formatDate(booking.endDate)}` : ''}</span>
                    {destination && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-700" />{destination}</span>}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-slate-100 pt-4 text-xs font-bold text-slate-600">
                    <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" />{booking.people || 1} traveller{Number(booking.people || 1) === 1 ? '' : 's'}</span>
                    <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" />{booking.duration || 'Duration to be confirmed'}</span>
                </div>

                {isPartialPayment ? (
                    <div className="mt-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-black text-amber-900">30% paid now · {rupee(amountPaid)}</p>
                            <p className="mt-0.5 text-[11px] font-semibold text-amber-700">Trip total: {rupee(totalAmount)}</p>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pay on trip day</p>
                            <p className="text-base font-black text-amber-900">{rupee(remainingAmount)}</p>
                        </div>
                    </div>
                ) : null}

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{isPartialPayment ? 'Paid now' : 'Total paid'}</p>
                        <p className={`text-lg font-bold tabular-nums ${isCancelled ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {rupee(isPartialPayment ? amountPaid : totalAmount)}
                        </p>
                    </div>
                    <button
                        className="flex items-center gap-1.5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-800"
                        onClick={(event) => {
                            event.stopPropagation();
                            onClick?.();
                        }}
                    >
                        View Details
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </div>

                {status === 'refund_initiated' && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium rounded-lg px-3 py-2.5 border border-blue-200 bg-blue-50 text-blue-700">
                        <RefreshCcw className="w-3.5 h-3.5 shrink-0" />
                        Refund has been initiated. Please allow 5–7 business days.
                    </div>
                )}
            </div>
          </div>
        </Card>
    );
};

export default BookingCard;
