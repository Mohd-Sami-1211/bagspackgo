'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Home, Download, MapPin, Calendar, Users, CreditCard, QrCode, Package, Sparkles } from 'lucide-react';

// Generate SVG QR-like pattern (deterministic from bookingRef)
function generateQRPattern(ref = 'BPG-000000') {
    const seed = ref.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const blocks = [];
    const size = 10;
    for (let i = 0; i < size * size; i++) {
        const val = (seed * (i + 1) * 7919) % 100;
        blocks.push(val < 45);
    }
    return blocks;
}

function QRCode({ bookingRef }) {
    const pattern = generateQRPattern(bookingRef);
    const size = 10;
    return (
        <div className="inline-block p-3 bg-white rounded-2xl shadow-inner border-2 border-green-100">
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 20px)`, gap: '2px' }}>
                {pattern.map((filled, i) => (
                    <div key={i} style={{
                        width: 20, height: 20, borderRadius: 3,
                        background: filled ? '#15803d' : '#f0fdf4',
                        transition: 'all 0.3s',
                    }} />
                ))}
            </div>
            <p className="text-center text-xs text-gray-500 mt-2 font-mono">{bookingRef}</p>
        </div>
    );
}

function BookingSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookingId = searchParams.get('bookingId');
    const bookingRef = searchParams.get('ref') || 'BPG-TREK-' + Date.now().toString(36).toUpperCase();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const printRef = useRef(null);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) { setLoading(false); return; }
            try {
                const res = await fetch('/api/user/trek-bookings');
                const data = await res.json();
                if (data.success) {
                    const found = data.data?.find(b => b.id === bookingId);
                    setBooking(found || null);
                }
            } catch (e) {
                console.error('Fetch booking error:', e);
            } finally {
                setLoading(false);
                setTimeout(() => setShowContent(true), 300);
            }
        };
        fetchBooking();
    }, [bookingId]);

    const handleDownloadPass = () => {
        window.print();
    };

    const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD';

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
            {/* Confetti-like background particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div key={i}
                        initial={{ opacity: 0, y: -20, x: Math.random() * window.innerWidth }}
                        animate={{ opacity: [0, 1, 0], y: window.innerHeight + 20, rotate: Math.random() * 360 }}
                        transition={{ duration: 3 + Math.random() * 4, delay: Math.random() * 2, repeat: Infinity, repeatDelay: Math.random() * 5 }}
                        className="absolute w-3 h-3 rounded-sm"
                        style={{ background: ['#22c55e', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'][i % 5] }}
                    />
                ))}
            </div>

            <AnimatePresence>
                {showContent && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="w-full max-w-2xl"
                    >
                        {/* Success card */}
                        <div ref={printRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 p-10 text-center relative overflow-hidden">
                                {/* Decorative circles */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full" />

                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                                    className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
                                >
                                    <CheckCircle className="w-14 h-14 text-green-500" />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <h1 className="text-3xl font-bold text-white mb-2">Trek Booking Confirmed! 🎉</h1>
                                    <p className="text-green-100">Your trek adventure is officially locked in. Get ready to explore!</p>
                                </motion.div>
                            </div>

                            <div className="p-8">
                                {/* Booking ref + QR */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex flex-col md:flex-row items-center gap-8 mb-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100"
                                >
                                    <div className="flex-1 text-center md:text-left">
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-1">Booking Reference</p>
                                        <p className="text-3xl font-black text-green-700 font-mono tracking-wider">{bookingRef}</p>
                                        <p className="text-sm text-gray-500 mt-2">Show this at check-in</p>
                                    </div>
                                    <div className="shrink-0">
                                        <QRCode bookingRef={bookingRef} />
                                    </div>
                                </motion.div>

                                {/* Booking details */}
                                {booking && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="grid grid-cols-2 gap-4 mb-8"
                                    >
                                        {[
                                            { icon: Package, label: 'Package', value: booking.packageName },
                                            { icon: MapPin, label: 'Destination', value: booking.destination },
                                            { icon: Calendar, label: 'Start Date', value: fmt(booking.startDate) },
                                            { icon: Calendar, label: 'End Date', value: fmt(booking.endDate) },
                                            { icon: Users, label: 'Travellers', value: `${booking.numPeople} ${booking.numPeople > 1 ? 'people' : 'person'}` },
                                            { icon: CreditCard, label: 'Amount Paid', value: `₹${Number(booking.totalAmount).toLocaleString('en-IN')}` },
                                        ].map(({ icon: Icon, label, value }) => (
                                            <div key={label} className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
                                                <div className="p-2 bg-green-100 rounded-lg shrink-0">
                                                    <Icon className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                                                    <p className="text-sm font-bold text-gray-800 truncate">{value || 'N/A'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                {/* Email notice */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-center"
                                >
                                    <p className="text-sm text-blue-700">
                                        📧 A confirmation email has been sent to you and your guide.
                                    </p>
                                </motion.div>

                                {/* Action buttons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                    className="flex flex-col sm:flex-row gap-3"
                                >
                                    <button
                                        onClick={handleDownloadPass}
                                        className="flex-1 flex items-center justify-center gap-2 border-2 border-green-500 text-green-600 py-3 px-6 rounded-xl font-semibold hover:bg-green-50 transition"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Pass
                                    </button>
                                    <button
                                        onClick={() => router.push('/user/bookings')}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition"
                                    >
                                        <QrCode className="w-5 h-5" />
                                        My Bookings
                                    </button>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition"
                                    >
                                        <Home className="w-5 h-5" />
                                        Home
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Print styles */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: fixed; inset: 0; background: white; }
                }
            `}</style>
        </div>
    );
}

export default function TrekBookingSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-green-700 font-medium">Loading your trek booking...</p>
                </div>
            </div>
        }>
            <BookingSuccessContent />
        </Suspense>
    );
}
