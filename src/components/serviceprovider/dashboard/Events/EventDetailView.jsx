'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Calendar, MapPin, Clock, Users, IndianRupee, Star,
    Globe, Tag, CheckCircle, Edit3, Save, Loader2, AlertCircle,
    Download, Eye, ChevronDown, ChevronUp,
    FileText, UserCheck, ScanLine, MessageSquare, Plus,
    PlayCircle, Route, Phone, Share2,
    CheckCircle2, Image as ImageIcon, Copy, Send, Check, X,
    Sparkles, TrendingUp, Camera, FlipHorizontal, Keyboard
} from 'lucide-react';

// ── QR Camera Scanner Component ──
// Only mounted when the user explicitly opens the camera.
// Unmounting this component = camera stops. No external stop() calls needed.
function QrScannerCamera({ onScan, onError }) {
    const html5QrRef = useRef(null);
    const [facingMode, setFacingMode] = useState('environment');
    const [started, setStarted] = useState(false);
    // Use a stable, unique DOM ID per mount to avoid stale-element errors
    const scannerIdRef = useRef(`qr-scanner-${Math.random().toString(36).slice(2)}`);
    const scannerId = scannerIdRef.current;

    useEffect(() => {
        let scanner = null;
        let stopped = false;

        const run = async () => {
            if (typeof window === 'undefined') return;
            const { Html5Qrcode } = await import('html5-qrcode');
            if (stopped) return;
            scanner = new Html5Qrcode(scannerId);
            html5QrRef.current = scanner;
            try {
                await scanner.start(
                    { facingMode },
                    { fps: 10, qrbox: { width: 200, height: 200 } },
                    (decodedText) => { if (!stopped) onScan(decodedText); },
                    () => {}
                );
                if (!stopped) setStarted(true);
            } catch (err) {
                if (!stopped) onError(err?.message || 'Camera access denied. Please allow camera permission and try again.');
            }
        };

        run();

        return () => {
            stopped = true;
            setStarted(false);
            const s = html5QrRef.current;
            if (s) {
                s.stop()
                    .catch(() => {})
                    .finally(() => { try { s.clear(); } catch {} });
                html5QrRef.current = null;
            }
        };
    // Re-run when facingMode changes (flip camera)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facingMode]);

    const flipCamera = () => setFacingMode(f => f === 'environment' ? 'user' : 'environment');

    return (
        <div className="relative">
            <div className="relative rounded-2xl overflow-hidden bg-neutral-900" style={{ aspectRatio: '4/3', maxHeight: '300px' }}>
                {/* The html5-qrcode library fills this div with a <video> element */}
                <div id={scannerId} className="w-full h-full" />

                {/* Animated scanning line — shown once camera is live */}
                {started && (
                    <motion.div
                        className="absolute left-1/2 -translate-x-1/2 w-[200px] h-0.5 bg-emerald-400 rounded-full"
                        style={{ boxShadow: '0 0 10px 2px rgba(52,211,153,0.7)' }}
                        initial={{ top: 'calc(50% - 100px)' }}
                        animate={{ top: 'calc(50% + 100px)' }}
                        transition={{ duration: 1.6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                    />
                )}

                {/* Corner frame guides */}
                {[
                    'top-[calc(50%-100px)] left-[calc(50%-100px)] border-t-4 border-l-4 rounded-tl-xl',
                    'top-[calc(50%-100px)] right-[calc(50%-100px)] border-t-4 border-r-4 rounded-tr-xl',
                    'bottom-[calc(50%-100px)] left-[calc(50%-100px)] border-b-4 border-l-4 rounded-bl-xl',
                    'bottom-[calc(50%-100px)] right-[calc(50%-100px)] border-b-4 border-r-4 rounded-br-xl',
                ].map((cls, i) => (
                    <div key={i} className={`absolute w-8 h-8 border-emerald-400 ${cls}`} />
                ))}

                {/* Initialising overlay */}
                {!started && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-900/80">
                        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                        <p className="text-white/70 text-sm">Starting camera…</p>
                    </div>
                )}
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-2 mt-3">
                <p className="flex-1 text-xs text-neutral-500">Point camera at the QR code on the guest's booking pass</p>
                <button
                    onClick={flipCamera}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 hover:bg-neutral-200 transition text-xs font-semibold"
                    title="Flip camera"
                >
                    <FlipHorizontal className="w-4 h-4" /> Flip
                </button>
            </div>
        </div>
    );
}

// ── Mock reviews ──
const mockReviews = [
    { id: 'R001', userName: 'Rahul Sharma', rating: 5, comment: 'Absolutely incredible experience! The guide was knowledgeable and the views were breathtaking.', date: '2025-06-15' },
    { id: 'R002', userName: 'Priya Kapoor', rating: 4, comment: 'Great trip overall. Well organized and the itinerary was well planned. Could improve on pickup timing.', date: '2025-06-16' },
    { id: 'R003', userName: 'Amit Verma', rating: 5, comment: "Best adventure experience I've ever had. Highly recommended for anyone looking for something unique.", date: '2025-06-17' },
];

// ── Star Rating ──
function StarRating({ rating, size = 'sm' }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                />
            ))}
        </div>
    );
}

// ── Info Tile ──
function InfoTile({ icon: Icon, label, value, accent = 'emerald' }) {
    const accents = {
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        violet: 'bg-violet-50 text-violet-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600',
        teal: 'bg-teal-50 text-teal-600',
    };
    return (
        <div className="bg-white rounded-2xl border border-neutral-100 p-5 hover:shadow-md transition-shadow overflow-hidden">
            <div className={`w-9 h-9 rounded-xl ${accents[accent]} flex items-center justify-center mb-3`}>
                <Icon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
            </div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1 truncate">{label}</p>
            <p className="font-bold text-neutral-800 text-sm leading-snug break-words overflow-hidden">{value || '—'}</p>
        </div>
    );
}

// ── Collapsible Section ──
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false, badge }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-2xl border border-neutral-200 overflow-hidden bg-white">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-5 hover:bg-neutral-50/80 transition"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="font-semibold text-neutral-800">{title}</span>
                    {badge && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">{badge}</span>
                    )}
                </div>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${open ? 'bg-emerald-100' : 'bg-neutral-100'}`}>
                    {open ? <ChevronUp className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                </div>
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-1 border-t border-neutral-100">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Share Modal ──
function ShareModal({ eventId, title, onClose }) {
    const [copied, setCopied] = useState(false);
    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/user/events/eventdetails/${eventId}`
        : `/user/events/eventdetails/${eventId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Share2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-neutral-900">Share Event</h3>
                            <p className="text-xs text-neutral-500">Share link for user booking</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-sm font-semibold text-neutral-700 mb-3 truncate">{title}</p>
                <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 mb-4">
                    <p className="flex-1 text-xs text-neutral-600 truncate font-mono">{shareUrl}</p>
                    <button
                        onClick={handleCopy}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'}`}
                    >
                        {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleCopy}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50 transition text-sm font-medium"
                    >
                        <Copy className="w-4 h-4" /> Copy Link
                    </button>
                    {typeof navigator !== 'undefined' && navigator.share && (
                        <button
                            onClick={() => navigator.share({ title, url: shareUrl })}
                            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:opacity-90 transition"
                        >
                            <Send className="w-4 h-4" /> Share
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════
// ── MAIN COMPONENT ──
// ═══════════════════════════════════════════════════

export default function EventDetailView({ eventId }) {
    const router = useRouter();
    const [event, setEvent] = useState(null);
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    // Scanner state — 'idle' | 'camera' | 'manual'
    const [scanMode, setScanMode] = useState('idle');
    const [scanInput, setScanInput] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [scanVerifying, setScanVerifying] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [showShare, setShowShare] = useState(false);

    const ensureString = (val) => {
        if (!val) return '';
        if (typeof val === 'object') return val.label || val.value || 'N/A';
        return String(val);
    };

    const title = ensureString(event?.title);
    const loc = ensureString(event?.location);
    const dest = ensureString(event?.destination);

    // Reset scanner completely when leaving the scanner tab
    useEffect(() => {
        if (activeTab !== 'scanner') {
            setScanMode('idle');
            setScanResult(null);
            setScanInput('');
            setCameraError('');
        }
    }, [activeTab]);

    const getViewMode = (evt) => {
        if (!evt) return 'live';
        const now = new Date();
        const eventDate = new Date(evt.date);
        if (evt.status === 'draft') return 'upcoming';
        if (evt.status === 'completed' || evt.status === 'cancelled' || eventDate < now) return 'past';
        return 'live';
    };

    useEffect(() => { fetchEvent(); }, [eventId]);

    const fetchEvent = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/provider/events/${eventId}`);
            const data = await res.json();
            if (data.success) {
                setEvent(data.event);
                setEditData(data.event);
                setGuests(data.guests || []);
            } else {
                setError(data.message || 'Event not found');
            }
        } catch {
            setError('Failed to load event');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMsg('');
        try {
            const res = await fetch(`/api/provider/events/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData),
            });
            const data = await res.json();
            if (data.success) {
                setSaveMsg('Changes saved successfully!');
                setEditMode(false);
                fetchEvent();
            } else {
                setSaveMsg(data.message || 'Failed to save');
            }
        } catch {
            setSaveMsg('Network error');
        } finally {
            setSaving(false);
        }
    };

    const handlePublishDraft = async () => {
        if (!confirm('Publish this event? Once published, it will be visible to users.')) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/provider/events/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'publish' }),
            });
            const data = await res.json();
            if (data.success) { fetchEvent(); }
            else { alert(data.message || 'Failed to publish'); }
        } catch {
            alert('Network error');
        } finally {
            setSaving(false);
        }
    };

    const handleVerifyCode = useCallback(async (code) => {
        const trimmed = (code || '').trim();
        if (!trimmed || scanVerifying) return;
        setScanVerifying(true);
        setScanResult(null);
        try {
            const res = await fetch(`/api/provider/events/${eventId}/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passCode: trimmed }),
            });
            const data = await res.json();
            if (data.success) {
                setScanResult({ success: true, guest: data.guest, alreadyCheckedIn: data.alreadyCheckedIn, message: data.message });
                // Refresh guest list to update counts
                fetchEvent();
            } else {
                setScanResult({ success: false, message: data.message || 'Invalid pass code.' });
            }
        } catch {
            setScanResult({ success: false, message: 'Network error. Please try again.' });
        } finally {
            setScanVerifying(false);
        }
    }, [eventId, scanVerifying]);

    const handleQrDetected = useCallback((decodedText) => {
        // Prevent re-triggering if we already have a result
        setScanResult(prev => {
            if (prev) return prev;
            handleVerifyCode(decodedText);
            return prev;
        });
    }, [handleVerifyCode]);

    const handleManualScan = () => handleVerifyCode(scanInput);

    const viewMode = getViewMode(event);

    const tabsConfig = {
        live: [
            { key: 'details', label: 'Details', icon: FileText },
            { key: 'guests', label: 'Guests', icon: Users },
            { key: 'scanner', label: 'Scanner', icon: ScanLine },
        ],
        upcoming: [
            { key: 'details', label: 'Details', icon: FileText },
        ],
        past: [
            { key: 'details', label: 'Details', icon: FileText },
            { key: 'guests', label: 'Guests', icon: Users },
            { key: 'reviews', label: 'Reviews', icon: MessageSquare },
        ],
    };
    const tabs = tabsConfig[viewMode] || tabsConfig.live;

    // ── Loading ──
    if (loading) {
        return (
            <div className="space-y-6 pb-12">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-neutral-200 animate-pulse" />
                    <div className="space-y-2 flex-1">
                        <div className="h-6 w-64 bg-neutral-200 rounded-lg animate-pulse" />
                        <div className="h-4 w-40 bg-neutral-100 rounded-lg animate-pulse" />
                    </div>
                </div>
                <div className="h-56 rounded-2xl bg-neutral-200 animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-neutral-100 animate-pulse" />)}
                </div>
                <div className="flex items-center justify-center py-6 gap-3 text-neutral-400">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    <span className="text-sm">Loading event details…</span>
                </div>
            </div>
        );
    }

    // ── Error ──
    if (error || !event) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <AlertCircle className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">Event Not Found</h2>
                    <p className="text-neutral-500 text-sm mb-6">{error || 'This event does not exist or you do not have permission.'}</p>
                    <button
                        onClick={() => router.push('/serviceprovider/dashboard/events')}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

    const occupancyPercent = event.totalSlots > 0
        ? Math.round(((event.bookedSlots || 0) / event.totalSlots) * 100)
        : 0;

    const viewModeColors = {
        live: 'from-emerald-600 via-teal-600 to-cyan-700',
        upcoming: 'from-blue-600 via-indigo-600 to-purple-700',
        past: 'from-neutral-500 via-neutral-600 to-neutral-700',
    };

    const statusBadgeStyles = {
        live: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
        past: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    };

    return (
        <>
            <div className="space-y-6 pb-16 min-w-0 overflow-x-hidden">
                {/* ── Hero Banner ── */}
                <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-r ${viewModeColors[viewMode]} min-h-[200px]`}>
                    {event.poster && (
                        <img
                            src={event.poster}
                            alt={event.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-40"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="relative p-4 md:p-8 flex flex-col md:flex-row md:items-end gap-4 min-h-[220px]">
                        {/* Back */}
                        <button
                            onClick={() => router.push('/serviceprovider/dashboard/events')}
                            className="absolute top-5 left-5 p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 transition text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>

                        {/* Status badge top-right */}
                        <div className="absolute top-5 right-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md bg-white/20 text-white border-white/30`}>
                                {viewMode === 'live' && <><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live</>}
                                {viewMode === 'upcoming' && <><Clock className="w-3 h-3" /> Draft</>}
                                {viewMode === 'past' && <><CheckCircle2 className="w-3 h-3" /> Past</>}
                            </span>
                        </div>

                        {/* Title block */}
                        <div className="mt-auto pt-12 min-w-0 flex-1">
                            <p className="text-white/70 text-sm mb-1 truncate">{event.eventType}</p>
                            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-md break-words">{title}</h1>
                            <p className="text-white/80 text-sm mt-2 flex items-center gap-2 flex-wrap">
                                <span className="flex items-center gap-1 flex-shrink-0"><Calendar className="w-3.5 h-3.5" />{formattedDate}</span>
                                <span className="opacity-50">•</span>
                                <span className="flex items-center gap-1 min-w-0"><MapPin className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{loc}</span></span>
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-wrap md:ml-auto flex-shrink-0">
                            {viewMode === 'live' && (
                                <button
                                    onClick={() => setShowShare(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold hover:bg-white/30 transition"
                                >
                                    <Share2 className="w-4 h-4" /> Share
                                </button>
                            )}
                            {viewMode === 'upcoming' && !editMode && (
                                <>
                                    <button
                                        onClick={() => setEditMode(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold hover:bg-white/30 transition"
                                    >
                                        <Edit3 className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={handlePublishDraft}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-700 text-sm font-bold hover:bg-emerald-50 transition shadow-lg"
                                    >
                                        <PlayCircle className="w-4 h-4" /> Publish Now
                                    </button>
                                </>
                            )}
                            {editMode && (
                                <>
                                    <button
                                        onClick={() => { setEditMode(false); setEditData(event); setSaveMsg(''); }}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold hover:bg-white/30 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-700 text-sm font-bold hover:bg-emerald-50 transition shadow-lg"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {saving ? 'Saving…' : 'Save'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Save/Error Message ── */}
                {saveMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${saveMsg.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                    >
                        {saveMsg.includes('success') ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {saveMsg}
                    </motion.div>
                )}

                {/* ── Quick Stats Row ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                    <InfoTile icon={Calendar} label="Date" value={new Date(event.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} accent="emerald" />
                    <InfoTile icon={MapPin} label="Location" value={loc} accent="teal" />
                    <InfoTile icon={Globe} label="Destination" value={dest} accent="blue" />
                    <InfoTile icon={Clock} label="Duration" value={`${event.duration} day${event.duration > 1 ? 's' : ''}`} accent="violet" />
                    <InfoTile icon={IndianRupee} label="Price / Slot" value={`₹${event.pricePerSlot?.toLocaleString('en-IN')}`} accent="amber" />
                    <InfoTile icon={Users} label="Slots" value={`${event.bookedSlots || 0} / ${event.totalSlots}`} accent="rose" />
                </div>

                {/* ── Occupancy ── */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-neutral-800 text-sm">Occupancy</span>
                        </div>
                        <span className={`font-bold text-sm ${occupancyPercent >= 80 ? 'text-red-600' : occupancyPercent >= 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {occupancyPercent}%
                        </span>
                    </div>
                    <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${occupancyPercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                            className={`h-full rounded-full ${occupancyPercent >= 80 ? 'bg-gradient-to-r from-red-400 to-red-600' : occupancyPercent >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                        />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                        {event.bookedSlots || 0} booked, {event.totalSlots - (event.bookedSlots || 0)} slots remaining
                    </p>
                </div>

                {/* ── Tabs ── */}
                <div className="flex border-b border-neutral-200 gap-1 overflow-x-auto scrollbar-none">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative pb-3 px-4 text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === tab.key ? 'text-emerald-700' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                            {activeTab === tab.key && (
                                <motion.div layoutId="detail-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ── */}
                <AnimatePresence mode="wait">
                    {/* ─────────── DETAILS TAB ─────────── */}
                    {activeTab === 'details' && (
                        <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                            {/* About */}
                            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                                <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                    <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    About This Event
                                </h3>
                                {editMode ? (
                                    <textarea
                                        value={editData.about || ''}
                                        onChange={(e) => setEditData(prev => ({ ...prev, about: e.target.value }))}
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-neutral-700 leading-relaxed resize-none transition"
                                    />
                                ) : (
                                    <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere text-sm [overflow-wrap:anywhere]"
                                       style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                                        {event.about}
                                    </p>
                                )}
                            </div>

                            {/* Collapsible sections */}
                            <div className="space-y-3">
                                {event.highlights?.length > 0 && (
                                    <CollapsibleSection title="Highlights" icon={Star} defaultOpen badge={event.highlights.length}>
                                        <ul className="space-y-2 pt-2">
                                            {event.highlights.map((h, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                                                    </div>
                                                    {editMode ? (
                                                        <input
                                                            value={editData.highlights?.[i] || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(editData.highlights || [])];
                                                                updated[i] = e.target.value;
                                                                setEditData(prev => ({ ...prev, highlights: updated }));
                                                            }}
                                                            className="flex-1 px-3 py-1 rounded-lg border border-neutral-200 text-sm focus:ring-1 focus:ring-emerald-400"
                                                        />
                                                    ) : (
                                                        <span className="text-neutral-700 text-sm">{h}</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </CollapsibleSection>
                                )}

                                {event.whatsIncluded?.length > 0 && (
                                    <CollapsibleSection title="What's Included" icon={CheckCircle} badge={event.whatsIncluded.length}>
                                        <ul className="space-y-2 pt-2">
                                            {event.whatsIncluded.map((w, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <Check className="w-3 h-3 text-blue-600" />
                                                    </div>
                                                    <span className="text-neutral-700 text-sm">{w}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CollapsibleSection>
                                )}

                                {event.itinerary?.length > 0 && (
                                    <CollapsibleSection title="Itinerary" icon={Route} badge={event.itinerary.filter(Boolean).length + ' steps'}>
                                        <ol className="space-y-4 pt-2">
                                            {event.itinerary.filter(Boolean).map((step, i) => (
                                                <li key={i} className="flex items-start gap-4">
                                                    <span className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                                                        {i + 1}
                                                    </span>
                                                    <div className="flex-1 pt-0.5">
                                                        <span className="text-neutral-700 text-sm">{step}</span>
                                                        {i < event.itinerary.filter(Boolean).length - 1 && (
                                                            <div className="w-px h-4 bg-neutral-200 ml-3.5 mt-2" />
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ol>
                                    </CollapsibleSection>
                                )}

                                {event.pickupPoints?.length > 0 && (
                                    <CollapsibleSection title="Pickup Points" icon={MapPin} badge={event.pickupPoints.length}>
                                        <div className="space-y-3 pt-2">
                                            {event.pickupPoints.map((p, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-neutral-800 text-sm">{p.location}</p>
                                                        {p.time && <p className="text-neutral-500 text-xs mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />{p.time}</p>}
                                                    </div>
                                                    {p.link && (
                                                        <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-emerald-600 hover:underline flex-shrink-0 flex items-center gap-1">
                                                            <Globe className="w-3 h-3" /> Map
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleSection>
                                )}

                                {event.faqs?.length > 0 && (
                                    <CollapsibleSection title="FAQs" icon={MessageSquare} badge={event.faqs.length}>
                                        <div className="space-y-4 pt-2">
                                            {event.faqs.map((faq, i) => (
                                                <div key={i} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                                                    <p className="font-semibold text-neutral-800 text-sm mb-1.5">Q: {faq.question}</p>
                                                    <p className="text-neutral-600 text-sm leading-relaxed">A: {faq.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleSection>
                                )}

                                {event.whatToBring?.length > 0 && (
                                    <CollapsibleSection title="What to Bring" icon={Tag} badge={event.whatToBring.length}>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                            {event.whatToBring.map((item, i) => (
                                                <li key={i} className="flex items-center gap-2 text-neutral-700 text-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </CollapsibleSection>
                                )}

                                {event.restrictions?.length > 0 && (
                                    <CollapsibleSection title="Restrictions" icon={AlertCircle} badge={event.restrictions.length}>
                                        <ul className="space-y-2 pt-2">
                                            {event.restrictions.map((r, i) => (
                                                <li key={i} className="flex items-center gap-2 text-red-700 text-sm">
                                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                    {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </CollapsibleSection>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ─────────── GUESTS TAB ─────────── */}
                    {activeTab === 'guests' && (
                        <motion.div key="guests" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900">Guest List</h2>
                                    <p className="text-neutral-500 text-sm">{guests.length} guests registered · {guests.filter(g => g.checkedIn).length} checked in</p>
                                </div>
                                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition self-start">
                                    <Download className="w-4 h-4" /> Export CSV
                                </button>
                            </div>

                            {/* Stats pills */}
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { label: 'Total', value: guests.length, color: 'bg-neutral-100 text-neutral-700' },
                                    { label: 'Checked In', value: guests.filter(g => g.checkedIn).length, color: 'bg-emerald-100 text-emerald-700' },
                                    { label: 'Pending', value: guests.filter(g => !g.checkedIn).length, color: 'bg-amber-100 text-amber-700' },
                                ].map(s => (
                                    <div key={s.label} className={`${s.color} px-4 py-2 rounded-xl text-sm font-semibold`}>
                                        <span className="text-lg font-bold mr-1.5">{s.value}</span>{s.label}
                                    </div>
                                ))}
                            </div>

                            {/* Desktop table */}
                            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[720px]">
                                        <thead>
                                            <tr className="bg-neutral-50 border-b border-neutral-200">
                                                {['#', 'Name', 'Age', 'Gender', 'Mobile', 'ID Proof', 'Status', 'Actions'].map(h => (
                                                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {guests.map((guest, i) => (
                                                <tr key={guest.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/80 transition">
                                                    <td className="px-4 py-4 text-neutral-400 text-xs font-mono">{i + 1}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                                                                {guest.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-neutral-900">{ensureString(guest.name)}</p>
                                                                <p className="text-neutral-500 text-xs">{ensureString(guest.email)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-neutral-700">{ensureString(guest.age)}</td>
                                                    <td className="px-4 py-4 text-neutral-700">{ensureString(guest.gender)}</td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-1.5 text-neutral-700">
                                                            <Phone className="w-3.5 h-3.5 text-neutral-400" />
                                                            {ensureString(guest.mobile)}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="text-neutral-700">{ensureString(guest.idProofType)}</p>
                                                        <p className="text-neutral-500 text-xs">{ensureString(guest.idProofNumber)}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${guest.checkedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-700'}`}>
                                                            {guest.checkedIn ? <UserCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                            {guest.checkedIn ? 'Checked In' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <button title="Download ID" className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-emerald-600 hover:border-emerald-200 transition">
                                                                <Download className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button title="View" className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-blue-600 hover:border-blue-200 transition">
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {guests.length === 0 && (
                                    <div className="text-center py-14">
                                        <Users className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                                        <p className="text-neutral-500 font-medium">No guests yet</p>
                                        <p className="text-neutral-400 text-sm mt-1">Guests will appear here when they book this event</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ─────────── SCANNER TAB ─────────── */}
                    {activeTab === 'scanner' && (
                        <motion.div key="scanner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="max-w-xl mx-auto space-y-5">

                                {/* ══ IDLE HOME SCREEN ══ */}
                                {scanMode === 'idle' && (
                                    <>
                                        {/* Header */}
                                        <div className="text-center py-4">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                                <ScanLine className="w-8 h-8 text-white" />
                                            </div>
                                            <h2 className="text-xl font-bold text-neutral-900 mb-1">Guest Check-In</h2>
                                            <p className="text-neutral-500 text-sm">Choose how to verify a guest's booking pass</p>
                                        </div>

                                        {/* Action cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Camera scan */}
                                            <button
                                                onClick={() => { setScanResult(null); setCameraError(''); setScanMode('camera'); }}
                                                className="group flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border-2 border-neutral-200 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-50 transition-all text-left"
                                            >
                                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                                    <Camera className="w-7 h-7 text-white" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold text-neutral-900 mb-1">Scan QR Code</p>
                                                    <p className="text-neutral-500 text-xs leading-relaxed">Open camera and point it at the QR code on the guest's booking pass</p>
                                                </div>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl group-hover:bg-emerald-700 transition">
                                                    <Camera className="w-3.5 h-3.5" /> Open Camera
                                                </span>
                                            </button>

                                            {/* Manual entry */}
                                            <button
                                                onClick={() => { setScanResult(null); setScanInput(''); setScanMode('manual'); }}
                                                className="group flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border-2 border-neutral-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-50 transition-all text-left"
                                            >
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                                    <Keyboard className="w-7 h-7 text-white" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold text-neutral-900 mb-1">Enter Code Manually</p>
                                                    <p className="text-neutral-500 text-xs leading-relaxed">Type or paste the pass code from the guest's booking confirmation</p>
                                                </div>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl group-hover:bg-blue-700 transition">
                                                    <Keyboard className="w-3.5 h-3.5" /> Enter Code
                                                </span>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* ══ CAMERA SCAN VIEW ══ */}
                                {scanMode === 'camera' && (
                                    <div className="space-y-4">
                                        {/* Back button */}
                                        <button
                                            onClick={() => { setScanMode('idle'); setScanResult(null); setCameraError(''); }}
                                            className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Back
                                        </button>

                                        <div className="bg-white rounded-2xl border-2 border-neutral-200 overflow-hidden">
                                            {/* Card header */}
                                            <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-sm font-bold text-neutral-800">Camera Scanner</span>
                                                <span className="ml-auto text-xs text-neutral-400">Auto-detects QR on guest's pass</span>
                                            </div>

                                            <div className="p-4">
                                                {/* Camera error state */}
                                                {cameraError ? (
                                                    <div className="flex flex-col items-center justify-center py-8 gap-4 text-center">
                                                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                                                            <AlertCircle className="w-7 h-7 text-red-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-neutral-800 mb-1">Camera Unavailable</p>
                                                            <p className="text-neutral-500 text-sm max-w-xs">{cameraError}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => setCameraError('')}
                                                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
                                                        >
                                                            Retry
                                                        </button>
                                                    </div>
                                                /* Result shown after scan */
                                                ) : scanResult ? (
                                                    <div className="space-y-4 py-2">
                                                        <motion.div
                                                            key="cam-result"
                                                            initial={{ opacity: 0, scale: 0.95, y: 8 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            className={`rounded-2xl border-2 p-5 ${
                                                                scanResult.success
                                                                    ? scanResult.alreadyCheckedIn ? 'border-amber-300 bg-amber-50' : 'border-emerald-300 bg-emerald-50'
                                                                    : 'border-red-300 bg-red-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                                    !scanResult.success ? 'bg-red-600' : scanResult.alreadyCheckedIn ? 'bg-amber-500' : 'bg-emerald-600'
                                                                }`}>
                                                                    {scanResult.success ? <UserCheck className="w-6 h-6 text-white" /> : <X className="w-6 h-6 text-white" />}
                                                                </div>
                                                                <div>
                                                                    <h3 className={`font-bold text-base ${
                                                                        !scanResult.success ? 'text-red-800' : scanResult.alreadyCheckedIn ? 'text-amber-800' : 'text-emerald-800'
                                                                    }`}>
                                                                        {scanResult.success
                                                                            ? scanResult.alreadyCheckedIn ? '⚠ Already Checked In' : '✓ Checked In!'
                                                                            : '✗ Invalid Pass'}
                                                                    </h3>
                                                                    <p className={`text-sm ${
                                                                        !scanResult.success ? 'text-red-600' : scanResult.alreadyCheckedIn ? 'text-amber-600' : 'text-emerald-600'
                                                                    }`}>{scanResult.message}</p>
                                                                </div>
                                                            </div>
                                                            {scanResult.success && (
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {[
                                                                        { label: 'Name', val: scanResult.guest?.name },
                                                                        { label: 'Pass Code', val: scanResult.guest?.passCode },
                                                                        { label: 'ID Proof', val: scanResult.guest?.idProofType },
                                                                        { label: 'Mobile', val: scanResult.guest?.mobile },
                                                                    ].map(f => (
                                                                        <div key={f.label} className="bg-white/70 rounded-xl p-3">
                                                                            <p className="text-xs font-semibold text-neutral-500 mb-0.5">{f.label}</p>
                                                                            <p className="font-bold text-neutral-900 text-sm break-words">{f.val || '—'}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                        {/* Scan next */}
                                                        <button
                                                            onClick={() => setScanResult(null)}
                                                            className="w-full py-2.5 border-2 border-neutral-200 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition flex items-center justify-center gap-2"
                                                        >
                                                            <Camera className="w-4 h-4" /> Scan Next Guest
                                                        </button>
                                                    </div>
                                                /* Verifying */
                                                ) : scanVerifying ? (
                                                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                                                        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                                                        <p className="text-sm font-semibold text-neutral-600">Verifying pass…</p>
                                                    </div>
                                                /* Live camera */
                                                ) : (
                                                    <QrScannerCamera
                                                        onScan={handleQrDetected}
                                                        onError={(msg) => setCameraError(msg)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ══ MANUAL ENTRY VIEW ══ */}
                                {scanMode === 'manual' && (
                                    <div className="space-y-4">
                                        {/* Back button */}
                                        <button
                                            onClick={() => { setScanMode('idle'); setScanResult(null); setScanInput(''); }}
                                            className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Back
                                        </button>

                                        <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 space-y-5">
                                            <div>
                                                <p className="text-sm font-bold text-neutral-800 mb-1">Enter Pass Code</p>
                                                <p className="text-xs text-neutral-500 mb-4">Type or paste the code from the guest's booking confirmation email</p>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={scanInput}
                                                        onChange={(e) => setScanInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
                                                        placeholder="e.g., BPG-EVT-001-G001"
                                                        autoFocus
                                                        className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono tracking-wider text-sm transition"
                                                    />
                                                    <button
                                                        onClick={handleManualScan}
                                                        disabled={!scanInput.trim() || scanVerifying}
                                                        className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:opacity-90 transition flex items-center gap-2 shadow-md disabled:opacity-50"
                                                    >
                                                        {scanVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
                                                        Verify
                                                    </button>
                                                </div>
                                            </div>

                                            <AnimatePresence mode="wait">
                                                {scanResult && (
                                                    <motion.div
                                                        key="manual-result"
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0 }}
                                                        className={`rounded-2xl border-2 p-5 ${
                                                            scanResult.success
                                                                ? scanResult.alreadyCheckedIn ? 'border-amber-300 bg-amber-50' : 'border-emerald-300 bg-emerald-50'
                                                                : 'border-red-300 bg-red-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                                !scanResult.success ? 'bg-red-500' : scanResult.alreadyCheckedIn ? 'bg-amber-500' : 'bg-emerald-600'
                                                            }`}>
                                                                {scanResult.success ? <UserCheck className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
                                                            </div>
                                                            <div>
                                                                <p className={`font-bold ${
                                                                    !scanResult.success ? 'text-red-800' : scanResult.alreadyCheckedIn ? 'text-amber-800' : 'text-emerald-800'
                                                                }`}>
                                                                    {scanResult.success
                                                                        ? scanResult.alreadyCheckedIn ? '⚠ Already Checked In' : '✓ Checked In!'
                                                                        : '✗ Invalid Pass'}
                                                                </p>
                                                                <p className={`text-xs ${
                                                                    !scanResult.success ? 'text-red-600' : scanResult.alreadyCheckedIn ? 'text-amber-600' : 'text-emerald-600'
                                                                }`}>{scanResult.message}</p>
                                                            </div>
                                                        </div>
                                                        {scanResult.success && (
                                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                                        {[
                                                                    { label: 'Name', val: ensureString(scanResult.guest?.name) },
                                                                    { label: 'Pass Code', val: scanResult.guest?.passCode },
                                                                    { label: 'ID Type', val: ensureString(scanResult.guest?.idProofType) },
                                                                    { label: 'Mobile', val: scanResult.guest?.mobile },
                                                                ].map(f => (
                                                                    <div key={f.label} className="bg-white/70 rounded-xl p-2.5">
                                                                        <p className="text-xs font-semibold text-neutral-500 mb-0.5">{f.label}</p>
                                                                        <p className="font-bold text-neutral-900 text-sm break-words">{f.val || '—'}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* Quick stats — always shown */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Total Guests', value: guests.length, color: 'text-neutral-900', bg: 'bg-white' },
                                        { label: 'Checked In', value: guests.filter(g => g.checkedIn).length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                        { label: 'Pending', value: guests.filter(g => !g.checkedIn).length, color: 'text-amber-600', bg: 'bg-amber-50' },
                                    ].map(s => (
                                        <div key={s.label} className={`${s.bg} rounded-2xl border border-neutral-200 p-4 text-center`}>
                                            <p className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</p>
                                            <p className="text-neutral-500 text-xs">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </motion.div>
                    )}

                    {/* ─────────── REVIEWS TAB ─────────── */}
                    {activeTab === 'reviews' && (
                        <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                            {/* Summary card */}
                            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                                <div className="flex items-center gap-8">
                                    <div className="text-center flex-shrink-0">
                                        <p className="text-5xl font-black text-neutral-900">
                                            {(mockReviews.reduce((s, r) => s + r.rating, 0) / mockReviews.length).toFixed(1)}
                                        </p>
                                        <StarRating rating={Math.round(mockReviews.reduce((s, r) => s + r.rating, 0) / mockReviews.length)} size="lg" />
                                        <p className="text-neutral-500 text-xs mt-1">{mockReviews.length} reviews</p>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = mockReviews.filter(r => r.rating === star).length;
                                            const pct = (count / mockReviews.length) * 100;
                                            return (
                                                <div key={star} className="flex items-center gap-3">
                                                    <span className="text-xs text-neutral-500 w-3">{star}</span>
                                                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                        <div className="bg-yellow-400 h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-xs text-neutral-400 w-4 text-right">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Individual reviews */}
                            <div className="space-y-4">
                                {mockReviews.map((review) => (
                                    <div key={review.id} className="bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-md transition">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {review.userName.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-neutral-900 text-sm">{review.userName}</p>
                                                    <p className="text-neutral-400 text-xs">{new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <StarRating rating={review.rating} />
                                        </div>
                                        <p className="text-neutral-600 text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Share Modal ── */}
            <AnimatePresence>
                {showShare && (
                    <ShareModal eventId={eventId} title={event.title} onClose={() => setShowShare(false)} />
                )}
            </AnimatePresence>
        </>
    );
}
