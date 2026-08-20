'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Search, RefreshCw, ChevronDown, ChevronUp,
    User, Mail, Phone, Calendar, Eye, TrendingUp, Clock,
    MapPin, AlertCircle
} from 'lucide-react';

function timeAgo(date) {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function VisitRow({ visit, index }) {
    const [expanded, setExpanded] = useState(false);
    const isLive = Date.now() - new Date(visit.lastVisitedAt).getTime() <= 45000;

    const itemTitle = visit.companionTitle || visit.offbeatTitle || visit.packageTitle || visit.eventTitle || 'Unknown';
    const itemType = visit.companionTitle ? 'Companion' : visit.offbeatTitle ? 'Offbeat' : visit.packageTitle ? 'Package' : 'Event';
    const isCompanion = !!visit.companionTitle;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="border border-gray-700/60 rounded-xl overflow-hidden"
        >
            {/* Main Row */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-800/40 hover:bg-gray-800/70 transition-colors text-left"
            >
                {/* Visit count badge / companion badge */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm
                    ${isCompanion ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' :
                      visit.visitCount >= 5 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      visit.visitCount >= 3 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'}`}
                >
                    {isCompanion ? '🧭' : visit.visitCount}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">
                            {visit.userSnapshot?.username || 'Unknown User'}
                        </span>
                        {isLive && (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                LIVE
                            </span>
                        )}
                        {visit.visitCount > 1 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap">
                                {visit.visitCount}× revisit
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                        <MapPin className="w-3 h-3 inline mr-1 opacity-60" />
                        <span className="text-gray-600 mr-1">[{itemType}]</span>
                        {itemTitle}
                    </p>
                </div>

                {/* Time */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                    <p className="text-xs font-medium text-gray-300">{timeAgo(visit.lastVisitedAt)}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(visit.lastVisitedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                {/* Expand toggle */}
                <div className="text-gray-500 flex-shrink-0">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {/* Expanded Details */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 py-4 bg-gray-900/60 border-t border-gray-700/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Name</p>
                                    <p className="text-gray-200 font-medium">{visit.userSnapshot?.username || '—'}</p>
                                </div>
                            </div>
                            {visit.userSnapshot?.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Email</p>
                                        <p className="text-gray-200 font-medium break-all">{visit.userSnapshot.email}</p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Phone</p>
                                    <p className="text-gray-200 font-medium">{visit.userSnapshot?.phone || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">{itemType}</p>
                                    <p className="text-gray-200 font-medium">{itemTitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Eye className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Visit Count</p>
                                    <p className="text-gray-200 font-bold">{visit.visitCount} visit{visit.visitCount !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Last Visited</p>
                                    <p className="text-gray-200 font-medium">
                                        {new Date(visit.lastVisitedAt).toLocaleString('en-IN', {
                                            day: '2-digit', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function ActivityPage() {
    const [tab, setTab] = useState('events'); // 'events' | 'packages' | 'offbeats' | 'companion'
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [lastRefreshed, setLastRefreshed] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [liveOnSite, setLiveOnSite] = useState(null); // site-wide live count (all pages)

    const fetchActivity = useCallback(async (isManual = false) => {
        try {
            if (isManual) setRefreshing(true);
            const base = tab === 'packages'
                ? '/api/admin/activity/packages'
                : tab === 'offbeats'
                ? '/api/admin/activity/offbeats'
                : tab === 'companion'
                ? '/api/admin/activity/companion'
                : '/api/admin/activity';
            const params = search ? `?search=${encodeURIComponent(search)}` : '';
            const res = await fetch(`${base}${params}`);
            const data = await res.json();
            if (data.success) {
                setVisits(data.visits || []);
                setError('');
            } else {
                setError(data.message || 'Failed to load activity');
            }
        } catch (err) {
            setError('Network error — could not load activity');
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLastRefreshed(new Date());
        }
    }, [search, tab]);

    // Site-wide live count (independent of the events/packages tab)
    const fetchPresence = useCallback(async () => {
        try {
            const res = await fetch('/api/presence');
            const data = await res.json();
            if (data.success) setLiveOnSite(data.liveCount);
        } catch { /* ignore */ }
    }, []);

    // Initial fetch (re-runs when search or tab changes)
    useEffect(() => {
        setLoading(true);
        fetchActivity();
    }, [search, tab]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => fetchActivity(), 30000);
        return () => clearInterval(interval);
    }, [fetchActivity]);

    // Site-wide live count: fetch now + refresh every 15s
    useEffect(() => {
        fetchPresence();
        const interval = setInterval(fetchPresence, 15000);
        return () => clearInterval(interval);
    }, [fetchPresence]);

    // Stats derived from visits
    const totalVisits = visits.reduce((sum, v) => sum + v.visitCount, 0);
    const uniqueUsers = visits.length;
    const revisitors = visits.filter(v => v.visitCount > 1).length;
    const liveUsers = visits.filter(v => Date.now() - new Date(v.lastVisitedAt).getTime() <= 45000).length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Visit Activity</h1>
                            <p className="text-gray-500 text-xs mt-0.5">User retargeting — last 24 hours only</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Site-wide live count — everyone currently on the website */}
                    <span className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {liveOnSite === null ? '—' : liveOnSite} on site
                    </span>
                    {lastRefreshed && (
                        <p className="text-[11px] text-gray-600 hidden sm:block">
                            Updated {timeAgo(lastRefreshed)}
                        </p>
                    )}
                    <button
                        onClick={() => fetchActivity(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Events / Packages / Offbeats / Companion tab switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-800/50 border border-gray-700/60 rounded-xl w-fit flex-wrap">
                {[
                    { key: 'events', label: 'Events' },
                    { key: 'packages', label: 'Trip Packages' },
                    { key: 'offbeats', label: 'Offbeat Destinations' },
                    { key: 'companion', label: '🧭 Companion' },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => { if (t.key !== tab) { setTab(t.key); setSearch(''); } }}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            tab === t.key
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'text-gray-400 hover:text-white border border-transparent'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Live Now', value: liveUsers, icon: Activity, color: 'rose' },
                    { label: 'Unique Visitors', value: uniqueUsers, icon: User, color: 'emerald' },
                    { label: 'Total Page Views', value: totalVisits, icon: Eye, color: 'blue' },
                    { label: 'Revisitors', value: revisitors, icon: TrendingUp, color: 'amber' },
                ].map((stat) => (
                    <div key={stat.label} className={`bg-gray-800/50 border border-gray-700/60 rounded-2xl p-4`}>
                        <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20 flex items-center justify-center mb-3`}>
                            <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                        </div>
                        <p className="text-2xl font-black text-white">
                            {loading ? '—' : stat.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder={`Search by name, phone${tab !== 'companion' ? ', email' : ''} or ${tab === 'packages' ? 'package' : tab === 'offbeats' ? 'offbeat' : tab === 'companion' ? 'destination' : 'event'}…`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                />
            </div>

            {/* Visit List */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-gray-400">
                        {loading ? 'Loading…' : `${visits.length} visitor${visits.length !== 1 ? 's' : ''} — sorted by most recent`}
                    </h2>
                    <div className="flex items-center gap-2 text-[10px] text-gray-600">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 1–2 visits
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 3–4 visits
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> 5+ visits
                        </span>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-4">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Loading skeleton */}
                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-14 bg-gray-800/40 rounded-xl animate-pulse border border-gray-700/40" />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && visits.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
                            <Activity className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-gray-400 font-semibold">No activity yet</h3>
                        <p className="text-gray-600 text-sm mt-1">
                            {search ? 'No results for your search.' : `No users have visited ${tab === 'packages' ? 'package' : 'event'} details in the last 24 hours.`}
                        </p>
                    </div>
                )}

                {/* Visits list */}
                {!loading && visits.length > 0 && (
                    <div className="space-y-2">
                        {visits.map((visit, index) => (
                            <VisitRow
                                key={`${visit.user}-${visit.event || visit.package || visit.offbeat || index}`}
                                visit={visit}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Auto-refresh notice */}
            <p className="text-center text-[11px] text-gray-700 pb-4">
                <Clock className="w-3 h-3 inline mr-1 opacity-60" />
                Auto-refreshes every 30 seconds · Records expire after 24 hours automatically
            </p>
        </div>
    );
}
