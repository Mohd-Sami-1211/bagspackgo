'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Calendar, MapPin, Clock, Users, DollarSign, Star,
    Globe, Tag, CheckCircle, Edit3, Save, Loader2, AlertCircle,
    Download, QrCode, Eye, ChevronDown, ChevronUp,
    FileText, UserCheck, ScanLine, MessageSquare, Trash2, Plus,
    PlayCircle, Image, Route, Phone, CreditCard, Home, User
} from 'lucide-react';

// ── Guests state mapped dynamically below ──

const mockReviews = [
    {
        id: 'R001',
        userName: 'Rahul Sharma',
        rating: 5,
        comment: 'Absolutely incredible experience! The guide was knowledgeable and the views were breathtaking.',
        date: '2025-06-15',
    },
    {
        id: 'R002',
        userName: 'Priya Kapoor',
        rating: 4,
        comment: 'Great trip overall. Well organized and the itinerary was well planned. Could improve on pickup timing.',
        date: '2025-06-16',
    },
    {
        id: 'R003',
        userName: 'Amit Verma',
        rating: 5,
        comment: 'Best adventure experience I\'ve ever had. Highly recommended for anyone looking for something unique.',
        date: '2025-06-17',
    },
];

// ── Helper: Star Rating ──
function StarRating({ rating, size = 16 }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-${size === 16 ? 4 : 5} h-${size === 16 ? 4 : 5} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                />
            ))}
        </div>
    );
}

// ── Detail Row ──
function DetailRow({ icon: Icon, label, value, iconColor = 'text-emerald-600' }) {
    return (
        <div className="flex items-start gap-3 py-3">
            <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
            <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wide">{label}</p>
                <p className="text-neutral-900 font-medium">{value || '—'}</p>
            </div>
        </div>
    );
}

// ── Section Collapse ──
function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition"
            >
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-neutral-800">{title}</span>
                </div>
                {open ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-5">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
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
    const [scanInput, setScanInput] = useState('');
    const [scanResult, setScanResult] = useState(null);

    // Determine the view mode based on event status + date
    const getViewMode = (evt) => {
        if (!evt) return 'live';
        const now = new Date();
        const eventDate = new Date(evt.date);
        if (evt.status === 'draft') return 'upcoming';
        if (evt.status === 'completed' || evt.status === 'cancelled' || eventDate < now) return 'past';
        return 'live';
    };

    useEffect(() => {
        fetchEvent();
    }, [eventId]);

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
        } catch (err) {
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
                fetchEvent(); // reload
            } else {
                setSaveMsg(data.message || 'Failed to save');
            }
        } catch (err) {
            setSaveMsg('Network error');
        } finally {
            setSaving(false);
        }
    };

    const handlePublishDraft = async () => {
        if (!confirm('Are you sure you want to publish this event? Once published, it will be visible to users and cannot be edited.')) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/provider/events/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'publish' }),
            });
            const data = await res.json();
            if (data.success) {
                fetchEvent();
            } else {
                alert(data.message || 'Failed to publish');
            }
        } catch (err) {
            alert('Network error');
        } finally {
            setSaving(false);
        }
    };

    const handleScan = () => {
        const trimmed = scanInput.trim();
        if (!trimmed) return;
        const found = guests.find(g => g.passCode === trimmed);
        if (found) {
            setScanResult({ success: true, guest: found });
        } else {
            setScanResult({ success: false, message: 'Pass not found. Invalid or expired pass code.' });
        }
    };

    const viewMode = getViewMode(event);

    // Tab configuration per viewMode
    const tabsConfig = {
        live: [
            { key: 'details', label: 'Event Details', icon: FileText },
            { key: 'guests', label: 'Guest List', icon: Users },
            { key: 'scanner', label: 'Scanner', icon: ScanLine },
        ],
        upcoming: [
            { key: 'details', label: 'Event Details', icon: FileText },
        ],
        past: [
            { key: 'details', label: 'Event Details', icon: FileText },
            { key: 'guests', label: 'Guest List', icon: Users },
            { key: 'reviews', label: 'Reviews', icon: MessageSquare },
        ],
    };

    const tabs = tabsConfig[viewMode] || tabsConfig.live;

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    <p className="text-neutral-500 font-medium">Loading event details...</p>
                </div>
            </div>
        );
    }

    // ── Error ──
    if (error || !event) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-neutral-900 mb-2">Event Not Found</h2>
                    <p className="text-neutral-500 mb-6">{error || 'This event does not exist or you do not have permission.'}</p>
                    <button onClick={() => router.push('/serviceprovider/dashboard/events')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

    return (
        <div className="space-y-6 pb-12">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/serviceprovider/dashboard/events')}
                        className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-neutral-900">{event.title}</h1>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${viewMode === 'live' ? 'bg-emerald-100 text-emerald-800' :
                                viewMode === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                    'bg-neutral-100 text-neutral-700'
                                }`}>
                                {viewMode === 'live' && <PlayCircle className="w-3 h-3" />}
                                {viewMode === 'upcoming' && <Clock className="w-3 h-3" />}
                                {viewMode === 'past' && <CheckCircle className="w-3 h-3" />}
                                {viewMode === 'live' ? 'Live' : viewMode === 'upcoming' ? 'Upcoming' : 'Past'}
                            </span>
                        </div>
                        <p className="text-neutral-500 text-sm mt-0.5">{event.eventType} • {formattedDate}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {viewMode === 'upcoming' && !editMode && (
                        <>
                            <button
                                onClick={() => setEditMode(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit Event
                            </button>
                            <button
                                onClick={handlePublishDraft}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                            >
                                <PlayCircle className="w-4 h-4" />
                                Publish Now
                            </button>
                        </>
                    )}
                    {editMode && (
                        <>
                            <button
                                onClick={() => { setEditMode(false); setEditData(event); setSaveMsg(''); }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Save notification */}
            {saveMsg && (
                <div className={`p-3 rounded-lg text-sm font-medium ${saveMsg.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {saveMsg}
                </div>
            )}

            {/* ── Tab Navigation ── */}
            <div className="border-b border-neutral-200">
                <div className="flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.key
                                ? 'border-emerald-500 text-emerald-700'
                                : 'border-transparent text-neutral-500 hover:text-neutral-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab Content ── */}
            <AnimatePresence mode="wait">
                {activeTab === 'details' && (
                    <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        {/* Poster */}
                        {event.poster && (
                            <div className="rounded-2xl overflow-hidden border border-neutral-200 max-h-80">
                                <img src={event.poster} alt={event.title} className="w-full h-full object-cover" />
                            </div>
                        )}

                        {/* Key Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                                <DetailRow icon={Calendar} label="Date" value={formattedDate} />
                            </div>
                            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                                <DetailRow icon={MapPin} label="Location" value={event.location} />
                            </div>
                            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                                <DetailRow icon={Clock} label="Duration" value={`${event.duration} day${event.duration > 1 ? 's' : ''}`} />
                            </div>
                            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                                <DetailRow icon={Globe} label="Destination" value={event.destination} />
                            </div>
                            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                                <DetailRow icon={Users} label="Slots" value={`${event.bookedSlots || 0} / ${event.totalSlots} booked`} />
                            </div>
                            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                                <DetailRow icon={DollarSign} label="Price per Slot" value={`₹${event.pricePerSlot?.toLocaleString('en-IN')}`} />
                            </div>
                        </div>

                        {/* Editable About (upcoming + editMode) or read-only */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-600" />
                                About This Event
                            </h3>
                            {editMode ? (
                                <textarea
                                    value={editData.about || ''}
                                    onChange={(e) => setEditData(prev => ({ ...prev, about: e.target.value }))}
                                    rows={5}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
                                />
                            ) : (
                                <p className="text-neutral-600 leading-relaxed whitespace-pre-line">{event.about}</p>
                            )}
                        </div>

                        {/* Collapsible sections */}
                        <div className="space-y-4">
                            {event.highlights?.length > 0 && (
                                <CollapsibleSection title={`Highlights (${event.highlights.length})`} icon={Star} defaultOpen={true}>
                                    <ul className="space-y-2">
                                        {event.highlights.map((h, i) => (
                                            <li key={i} className="flex items-start gap-2 text-neutral-700">
                                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                {editMode ? (
                                                    <input
                                                        value={editData.highlights?.[i] || ''}
                                                        onChange={(e) => {
                                                            const updated = [...(editData.highlights || [])];
                                                            updated[i] = e.target.value;
                                                            setEditData(prev => ({ ...prev, highlights: updated }));
                                                        }}
                                                        className="flex-1 px-3 py-1 rounded-lg border border-gray-200 text-sm"
                                                    />
                                                ) : (
                                                    <span>{h}</span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </CollapsibleSection>
                            )}

                            {event.whatsIncluded?.length > 0 && (
                                <CollapsibleSection title={`What's Included (${event.whatsIncluded.length})`} icon={CheckCircle}>
                                    <ul className="space-y-2">
                                        {event.whatsIncluded.map((w, i) => (
                                            <li key={i} className="flex items-start gap-2 text-neutral-700">
                                                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                <span>{w}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CollapsibleSection>
                            )}

                            {event.itinerary?.length > 0 && (
                                <CollapsibleSection title={`Itinerary (${event.itinerary.filter(s => s).length} steps)`} icon={Route}>
                                    <ol className="space-y-3">
                                        {event.itinerary.filter(s => s).map((step, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0">
                                                    {i + 1}
                                                </span>
                                                <span className="text-neutral-700 pt-0.5">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </CollapsibleSection>
                            )}

                            {event.pickupPoints?.length > 0 && (
                                <CollapsibleSection title={`Pickup Points (${event.pickupPoints.length})`} icon={MapPin}>
                                    <div className="space-y-3">
                                        {event.pickupPoints.map((p, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                                                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-neutral-800 font-medium">{p.location}</p>
                                                    {p.time && <p className="text-neutral-500 text-sm">Time: {p.time}</p>}
                                                </div>
                                                {p.link && (
                                                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm hover:underline">
                                                        View Map
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CollapsibleSection>
                            )}

                            {event.faqs?.length > 0 && (
                                <CollapsibleSection title={`FAQs (${event.faqs.length})`} icon={MessageSquare}>
                                    <div className="space-y-4">
                                        {event.faqs.map((faq, i) => (
                                            <div key={i} className="border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                                                <p className="font-medium text-neutral-800 mb-1">Q: {faq.question}</p>
                                                <p className="text-neutral-600 text-sm">A: {faq.answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CollapsibleSection>
                            )}

                            {event.whatToBring?.length > 0 && (
                                <CollapsibleSection title={`What to Bring (${event.whatToBring.length})`} icon={Tag}>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {event.whatToBring.map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-neutral-700">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </CollapsibleSection>
                            )}

                            {event.restrictions?.length > 0 && (
                                <CollapsibleSection title={`Restrictions (${event.restrictions.length})`} icon={AlertCircle}>
                                    <ul className="space-y-2">
                                        {event.restrictions.map((r, i) => (
                                            <li key={i} className="flex items-center gap-2 text-red-700">
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

                {/* ═══════════════════════════════════════════════ */}
                {/* ── GUEST LIST TAB ── */}
                {/* ═══════════════════════════════════════════════ */}
                {activeTab === 'guests' && (
                    <motion.div key="guests" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-neutral-900">Guest List</h2>
                                <p className="text-neutral-500 text-sm">{guests.length} guests registered • {guests.filter(g => g.checkedIn).length} checked in</p>
                            </div>
                            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 text-sm font-medium hover:bg-neutral-50 transition">
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>

                        {/* Guest Table */}
                        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-neutral-50 border-b border-neutral-200">
                                            <th className="text-left px-4 py-3 font-semibold text-neutral-600">#</th>
                                            <th className="text-left px-4 py-3 font-semibold text-neutral-600">Name</th>
                                            <th className="text-left px-4 py-3 font-semibold text-neutral-600">Age</th>
                                            <th className="text-left px-4 py-3 font-semibold text-neutral-600">Gender</th>
                                            <th className="text-left px-4 py-3 font-semibold text-neutral-600">Mobile</th>
                                            <th className="text-left px-4 py-3 font-semibold text-neutral-600">ID Proof</th>
                                            <th className="text-left px-4 py-3 font-semibold text-neutral-600">Address</th>
                                            <th className="text-left px-4 py-3 font-semibold text-neutral-600">Status</th>
                                            <th className="text-left px-4 py-3 font-semibold text-neutral-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {guests.map((guest, i) => (
                                            <tr key={guest.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition">
                                                <td className="px-4 py-4 text-neutral-500">{i + 1}</td>
                                                <td className="px-4 py-4">
                                                    <div>
                                                        <p className="font-medium text-neutral-900">{guest.name}</p>
                                                        <p className="text-neutral-500 text-xs">{guest.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-neutral-700">{guest.age}</td>
                                                <td className="px-4 py-4 text-neutral-700">{guest.gender}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3 h-3 text-neutral-400" />
                                                        <span className="text-neutral-700">{guest.mobile}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div>
                                                        <p className="text-neutral-700">{guest.idProofType}</p>
                                                        <p className="text-neutral-500 text-xs">{guest.idProofNumber}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-neutral-700 max-w-[200px] truncate" title={guest.address}>{guest.address}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${guest.checkedIn
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {guest.checkedIn ? <UserCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                        {guest.checkedIn ? 'Checked In' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            title="Download ID Proof"
                                                            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-emerald-600 hover:border-emerald-200 transition"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            title="View Details"
                                                            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-blue-600 hover:border-blue-200 transition"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {guests.length === 0 && (
                                <div className="text-center py-12">
                                    <Users className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                                    <p className="text-neutral-500">No guests have booked this event yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Guest Detail Cards (mobile friendly) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                            {guests.map((guest) => (
                                <div key={guest.id} className="bg-white rounded-xl border border-neutral-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-neutral-900">{guest.name}</p>
                                            <p className="text-neutral-500 text-xs">{guest.email}</p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${guest.checkedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {guest.checkedIn ? 'In' : 'Pending'}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5 text-sm text-neutral-600">
                                        <p><span className="text-neutral-400">Age:</span> {guest.age} • {guest.gender}</p>
                                        <p><span className="text-neutral-400">Phone:</span> {guest.mobile}</p>
                                        <p><span className="text-neutral-400">ID:</span> {guest.idProofType} - {guest.idProofNumber}</p>
                                        <p className="truncate"><span className="text-neutral-400">Address:</span> {guest.address}</p>
                                    </div>
                                    <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-100">
                                        <button className="flex-1 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition flex items-center justify-center gap-1">
                                            <Download className="w-3 h-3" /> ID Proof
                                        </button>
                                        <button className="flex-1 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-1">
                                            <Eye className="w-3 h-3" /> Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* ── SCANNER TAB ── */}
                {/* ═══════════════════════════════════════════════ */}
                {activeTab === 'scanner' && (
                    <motion.div key="scanner" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                                    <ScanLine className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Pass Scanner</h2>
                                <p className="text-neutral-500">Enter or scan the guest pass code to verify and check-in guests</p>
                            </div>

                            {/* Scanner Input */}
                            <div className="bg-white rounded-2xl border-2 border-neutral-200 p-6 mb-6">
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">Pass Code</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={scanInput}
                                        onChange={(e) => setScanInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                                        placeholder="Enter pass code (e.g., BPG-EVT-001-G001)"
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-mono tracking-wider"
                                    />
                                    <button
                                        onClick={handleScan}
                                        className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center gap-2"
                                    >
                                        <ScanLine className="w-5 h-5" />
                                        Verify
                                    </button>
                                </div>
                                <p className="text-xs text-neutral-400 mt-2">You can also use a barcode/QR scanner to input the code automatically</p>
                            </div>

                            {/* Scan Result */}
                            <AnimatePresence>
                                {scanResult && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`rounded-2xl border-2 p-6 ${scanResult.success
                                            ? 'border-emerald-300 bg-emerald-50'
                                            : 'border-red-300 bg-red-50'
                                            }`}
                                    >
                                        {scanResult.success ? (
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 bg-emerald-200 rounded-full flex items-center justify-center">
                                                        <UserCheck className="w-6 h-6 text-emerald-700" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-emerald-800">✓ Pass Verified</h3>
                                                        <p className="text-emerald-600 text-sm">Guest is authorized for this event</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="bg-white/60 rounded-lg p-3">
                                                        <p className="text-emerald-600 text-xs font-medium">Name</p>
                                                        <p className="text-neutral-900 font-semibold">{scanResult.guest.name}</p>
                                                    </div>
                                                    <div className="bg-white/60 rounded-lg p-3">
                                                        <p className="text-emerald-600 text-xs font-medium">Pass Code</p>
                                                        <p className="text-neutral-900 font-mono">{scanResult.guest.passCode}</p>
                                                    </div>
                                                    <div className="bg-white/60 rounded-lg p-3">
                                                        <p className="text-emerald-600 text-xs font-medium">ID Proof</p>
                                                        <p className="text-neutral-900">{scanResult.guest.idProofType}</p>
                                                    </div>
                                                    <div className="bg-white/60 rounded-lg p-3">
                                                        <p className="text-emerald-600 text-xs font-medium">Status</p>
                                                        <p className="text-neutral-900 font-semibold">
                                                            {scanResult.guest.checkedIn ? '✓ Already Checked In' : 'Ready to Check In'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!scanResult.guest.checkedIn && (
                                                    <button className="w-full mt-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition">
                                                        Confirm Check-In
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <AlertCircle className="w-6 h-6 text-red-700" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-red-800">✗ Invalid Pass</h3>
                                                    <p className="text-red-600 text-sm">{scanResult.message}</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-8">
                                <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
                                    <p className="text-3xl font-bold text-neutral-900">{guests.length}</p>
                                    <p className="text-neutral-500 text-sm">Total Guests</p>
                                </div>
                                <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
                                    <p className="text-3xl font-bold text-emerald-600">{guests.filter(g => g.checkedIn).length}</p>
                                    <p className="text-neutral-500 text-sm">Checked In</p>
                                </div>
                                <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
                                    <p className="text-3xl font-bold text-yellow-600">{guests.filter(g => !g.checkedIn).length}</p>
                                    <p className="text-neutral-500 text-sm">Pending</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══════════════════════════════════════════════ */}
                {/* ── REVIEWS TAB ── */}
                {/* ═══════════════════════════════════════════════ */}
                {activeTab === 'reviews' && (
                    <motion.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        {/* Rating Summary */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-5xl font-bold text-neutral-900">
                                        {(mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length).toFixed(1)}
                                    </p>
                                    <StarRating rating={Math.round(mockReviews.reduce((sum, r) => sum + r.rating, 0) / mockReviews.length)} size={20} />
                                    <p className="text-neutral-500 text-sm mt-1">{mockReviews.length} reviews</p>
                                </div>
                                <div className="flex-1 space-y-2">
                                    {[5, 4, 3, 2, 1].map(star => {
                                        const count = mockReviews.filter(r => r.rating === star).length;
                                        const percent = (count / mockReviews.length) * 100;
                                        return (
                                            <div key={star} className="flex items-center gap-3">
                                                <span className="text-sm text-neutral-500 w-3">{star}</span>
                                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                <div className="flex-1 bg-neutral-100 rounded-full h-2">
                                                    <div
                                                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-neutral-400 w-8">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Individual Reviews */}
                        <div className="space-y-4">
                            {mockReviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-xl border border-neutral-200 p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {review.userName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-neutral-900">{review.userName}</p>
                                                <p className="text-neutral-500 text-xs">{new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <StarRating rating={review.rating} />
                                    </div>
                                    <p className="text-neutral-600 leading-relaxed">{review.comment}</p>
                                </div>
                            ))}
                        </div>

                        {mockReviews.length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
                                <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                                <p className="text-neutral-500">No reviews yet for this event.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
