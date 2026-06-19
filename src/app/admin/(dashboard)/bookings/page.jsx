'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Search, FileText, IndianRupee, MapPin, User, Mail, Phone, ChevronRight, CheckCircle2, XCircle, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const TABS = [
    { id: 'trips', label: 'Trips' },
    { id: 'treks', label: 'Treks' },
    { id: 'events', label: 'Events' }
];

function DetailDrawer({ booking, type, onClose }) {
    if (!booking) return null;

    const isEvent = type === 'events';
    const amount = isEvent ? booking.amountPaid : booking.totalAmount;
    const ref = isEvent ? booking.paymentId : booking.bookingRef;
    const title = isEvent ? booking.event?.title : booking.package?.name;
    const destination = isEvent ? booking.event?.location : booking.package?.destination;
    const providerStr = isEvent ? 'Event Organizer' : booking.provider?.username;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="relative w-full max-w-xl h-full bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10 flex-shrink-0">
                    <button onClick={onClose} className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            Booking Details
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider font-mono">{ref}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                    
                    {/* Status & Amount */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 flex flex-wrap gap-6 items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                booking.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-500' : booking.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                {booking.status}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Total Amount</p>
                            <p className="text-2xl font-bold text-white tracking-tight">₹{booking.totalAmount?.toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    {/* Payment Mode Info */}
                    {!isEvent && (
                        <div className={`rounded-2xl p-4 border ${
                            booking.paymentMode === 'partial'
                                ? 'bg-amber-500/5 border-amber-500/20'
                                : 'bg-emerald-500/5 border-emerald-500/20'
                        }`}>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Payment Mode</p>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    booking.paymentMode === 'partial'
                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                    {booking.paymentMode === 'partial' ? 'Partial (30%)' : 'Full Payment'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Paid</p>
                                    <p className="text-lg font-bold text-emerald-400">₹{(booking.amountPaid || booking.totalAmount)?.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-semibold mb-1">Remaining</p>
                                    <p className={`text-lg font-bold ${(booking.remainingAmount || 0) > 0 ? 'text-amber-400' : 'text-gray-600'}`}>
                                        ₹{(booking.remainingAmount || 0).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                            {booking.paymentMode === 'partial' && (booking.remainingAmount || 0) > 0 && (
                                <p className="text-[10px] text-amber-400/70 mt-2 font-medium">
                                    • Remaining amount to be collected on trip day
                                </p>
                            )}
                        </div>
                    )}

                    {/* Booking Reference Info */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Tour & Provider</h3>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{title}</p>
                                    <p className="text-xs text-gray-500">{destination || 'No destination specified'}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{providerStr || 'Unknown Provider'}</p>
                                    <p className="text-xs text-gray-500">Service Provider</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Traveler Info */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Booked By (Main Traveler)</h3>
                        <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center gap-3 text-gray-300"><User className="w-4 h-4 text-gray-500" /> <span className="text-white font-medium">{booking.user?.username || 'Unknown'}</span></div>
                            <div className="flex items-center gap-3 text-gray-300"><Mail className="w-4 h-4 text-gray-500" /> {booking.user?.email}</div>
                            <div className="flex items-center gap-3 text-gray-300"><Phone className="w-4 h-4 text-gray-500" /> {booking.user?.phone || 'No phone'}</div>
                        </div>
                    </div>

                    {/* Specific Booking details based on type */}
                    {!isEvent && booking.personalDetails && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Personal Details Submitted</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-xs text-gray-500">Name</p><p className="text-white">{booking.personalDetails.firstName} {booking.personalDetails.lastName}</p></div>
                                <div><p className="text-xs text-gray-500">Age Bracket</p><p className="text-white">{booking.personalDetails.ageBracket}</p></div>
                                <div><p className="text-xs text-gray-500">Gender</p><p className="text-white capitalize">{booking.personalDetails.gender}</p></div>
                                <div><p className="text-xs text-gray-500">Profession</p><p className="text-white">{booking.personalDetails.profession}</p></div>
                                <div className="col-span-2"><p className="text-xs text-gray-500">Full Address</p><p className="text-white">{booking.personalDetails.address}, {booking.personalDetails.state}, {booking.personalDetails.country} - {booking.personalDetails.pinCode}</p></div>
                            </div>
                        </div>
                    )}

                    {isEvent && booking.participants?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Passes / Participants ({booking.slots})</h3>
                            <div className="space-y-3">
                                {booking.participants.map((p, i) => (
                                    <div key={i} className="bg-gray-800/50 p-3 rounded-lg flex items-center justify-between text-sm">
                                        <div>
                                            <p className="text-white font-medium">{p.name} <span className="text-gray-500 text-xs text-normal">({p.age}/{p.gender})</span></p>
                                            <p className="text-gray-400 text-xs">{p.email} | {p.idType}: {p.idNumber}</p>
                                        </div>
                                        {p.checkedIn ? (
                                            <span className="text-emerald-500 text-xs font-bold px-2 py-1 bg-emerald-500/10 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Checked In</span>
                                        ) : (
                                            <span className="text-gray-500 text-xs px-2 py-1 bg-gray-800 rounded">Pending</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payment Information */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">Payment Logs</h3>
                        <div className="bg-gray-800/30 rounded-lg p-4 font-mono text-xs text-gray-400 space-y-2 border border-gray-800">
                            <p><span className="text-gray-500">Payment ID:</span> <span className="text-blue-400">{booking.paymentId || 'N/A'}</span></p>
                            <p><span className="text-gray-500">Order ID:</span> {booking.orderId || 'N/A'}</p>
                            <p><span className="text-gray-500">Date:</span> {new Date(booking.bookingDate || booking.createdAt).toLocaleString('en-GB')}</p>
                            <div className="mt-4 pt-4 border-t border-gray-700/50">
                                <p><span className="text-gray-500">Provider Payout:</span> <span className={`${booking.providerPaymentStatus === 'completed' ? 'text-emerald-400' : 'text-amber-400'} uppercase font-bold`}>{booking.providerPaymentStatus}</span></p>
                                {booking.providerTransactionId && <p><span className="text-gray-500">Payout TXN:</span> {booking.providerTransactionId}</p>}
                                {booking.providerPaymentDate && <p><span className="text-gray-500">Payout Date:</span> {new Date(booking.providerPaymentDate).toLocaleString('en-GB')}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('trips');
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [activeBooking, setActiveBooking] = useState(null);

    const fetchBookings = useCallback(async (currentType, searchQuery = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/bookings?type=${currentType}&search=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings(type);
    }, [type, fetchBookings]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBookings(type, search);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CalendarCheck className="w-6 h-6 text-violet-400" /> All Bookings
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Cross-platform booking directory.</p>
                </div>

                <div className="flex items-center gap-3">
                    <form onSubmit={handleSearch} className="relative w-full sm:w-64 flex-shrink-0">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Ref # or Payment ID..." 
                            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 outline-none transition-all"
                        />
                    </form>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto text-sm p-1">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => { setType(t.id); setSearch(''); }}
                        className={`px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider transition-all flex-1 sm:flex-none whitespace-nowrap ${
                            type === t.id ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                        }`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" /> {error}
                </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-gray-800/50 text-xs uppercase text-gray-500 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Ref / Entity</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4 whitespace-nowrap">Date / Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-500" />
                                        Loading bookngs...
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No bookings found.
                                    </td>
                                </tr>
                            ) : bookings.map(b => {
                                const isEvent = type === 'events';
                                const ref = isEvent ? b.paymentId : b.bookingRef;
                                const title = isEvent ? b.event?.title : b.package?.name;
                                const amount = isEvent ? b.amountPaid : b.totalAmount;

                                return (
                                    <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-mono text-xs text-blue-400 mb-1">{ref}</p>
                                            <p className="font-medium text-white max-w-[200px] truncate">{title}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-white max-w-[150px] truncate">{b.user?.username || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{b.user?.phone}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-gray-400 mb-0.5">{new Date(b.bookingDate || b.createdAt).toLocaleDateString('en-GB')}</p>
                                            <p className="font-bold text-white">₹{amount?.toLocaleString('en-IN')}</p>
                                            {!isEvent && b.paymentMode === 'partial' && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 mt-1">30% Paid</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                b.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-red-500/10 text-red-500'
                                            }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => setActiveBooking(b)} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-gray-400 hover:bg-violet-500/10 hover:text-violet-400 transition-colors">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {activeBooking && (
                    <DetailDrawer booking={activeBooking} type={type} onClose={() => setActiveBooking(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
