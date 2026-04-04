'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Users, UserCheck, CalendarCheck, IndianRupee,
    FileText, Headphones, Bell, TrendingUp, TrendingDown,
    Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, Loader2
} from 'lucide-react';
import Link from 'next/link';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAdmin } from '@/context/AdminContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PIE_COLORS = { confirmed: '#10b981', pending: '#f59e0b', cancelled: '#ef4444' };

function StatCard({ icon: Icon, label, value, sub, color = 'emerald', link, loading }) {
    const colorMap = {
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
        red: 'bg-red-500/10 border-red-500/20 text-red-400',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4 hover:border-gray-700 transition-all"
        >
            <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {link && (
                    <Link href={link} className="text-gray-600 hover:text-gray-300 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
            {loading ? (
                <div className="space-y-2 animate-pulse">
                    <div className="h-8 w-20 bg-gray-800 rounded" />
                    <div className="h-3 w-28 bg-gray-800 rounded" />
                </div>
            ) : (
                <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                    {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
                </div>
            )}
        </motion.div>
    );
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-xl">
            <p className="text-xs text-gray-400 mb-2">{label}</p>
            {payload.map(p => (
                <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
};

export default function AdminDashboardPage() {
    const { admin } = useAdmin();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/dashboard');
            const json = await res.json();
            if (json.success) setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

    // Prepare monthly chart data
    const chartData = (() => {
        if (!data) return [];
        const now = new Date();
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
            const m = d.getMonth() + 1;
            const y = d.getFullYear();
            const tripEntry = data.charts.monthlyBookings.trips.find(t => t._id.month === m && t._id.year === y);
            const trekEntry = data.charts.monthlyBookings.treks.find(t => t._id.month === m && t._id.year === y);
            return { name: MONTHS[m - 1], Trips: tripEntry?.count || 0, Treks: trekEntry?.count || 0 };
        });
    })();

    const pieData = data ? Object.entries(data.charts.statusBreakdown).map(([k, v]) => ({
        name: k.charAt(0).toUpperCase() + k.slice(1), value: v
    })) : [];

    const stats = data?.stats;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-white">
                    Welcome back, {admin?.name || 'Admin'} 👋
                </motion.h1>
                <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening on bagspackgo today.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Travelers" value={stats?.totalUsers ?? '—'} color="blue" link="/admin/users" loading={loading} />
                <StatCard icon={UserCheck} label="Service Providers" value={stats?.totalProviders ?? '—'} color="emerald" link="/admin/providers" loading={loading} />
                <StatCard icon={CalendarCheck} label="Total Bookings" value={stats?.totalBookings ?? '—'} color="violet" link="/admin/bookings" loading={loading} />
                <StatCard icon={IndianRupee} label="Revenue This Month" value={stats ? `₹${stats.revenueThisMonth.toLocaleString('en-IN')}` : '—'} color="amber" link="/admin/payments" loading={loading} />
            </div>

            {/* Secondary stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={FileText} label="Pending Applications" value={stats?.pendingApplications ?? '—'} color="amber" link="/admin/applications" loading={loading} sub="Awaiting your review" />
                <StatCard icon={Headphones} label="Open Support Tickets" value={stats?.unresolvedSupport ?? '—'} color="red" link="/admin/support" loading={loading} sub="Pending or in-progress" />
                <StatCard icon={Bell} label="Unread Notifications" value={stats?.unreadNotifications ?? '—'} color="violet" link="/admin/notifications" loading={loading} sub="Click to review" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Bookings */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-base font-bold text-white mb-6">Monthly Bookings (Last 6 Months)</h2>
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend formatter={v => <span className="text-gray-400 text-xs">{v}</span>} />
                                <Line type="monotone" dataKey="Trips" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="Treks" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Booking Status Pie */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-base font-bold text-white mb-6">Booking Status</h2>
                    {loading || !pieData.length ? (
                        <div className="h-64 flex items-center justify-center">
                            {loading ? <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /> :
                                <p className="text-gray-600 text-sm">No data yet</p>}
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={index} fill={PIE_COLORS[entry.name.toLowerCase()] || '#6b7280'} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend formatter={v => <span className="text-gray-400 text-xs">{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Recent Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Applications */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-bold text-white">Pending Applications</h2>
                        <Link href="/admin/applications" className="text-xs text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {loading ? [1,2,3].map(i => (
                            <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />
                        )) : data?.recent.applications.length === 0 ? (
                            <p className="text-gray-600 text-sm text-center py-4">No pending applications</p>
                        ) : data?.recent.applications.map(app => (
                            <Link key={app._id} href={`/admin/applications`}>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{app.companyname}</p>
                                        <p className="text-xs text-gray-500">{app.companyemail}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Support */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-bold text-white">Open Support</h2>
                        <Link href="/admin/support" className="text-xs text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {loading ? [1,2,3].map(i => (
                            <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />
                        )) : data?.recent.support.length === 0 ? (
                            <p className="text-gray-600 text-sm text-center py-4">All tickets resolved 🎉</p>
                        ) : data?.recent.support.map(ticket => (
                            <Link key={ticket._id} href="/admin/support">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                                        <Headphones className="w-4 h-4 text-red-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{ticket.subject || ticket.type}</p>
                                        <p className="text-xs text-gray-500 capitalize">{ticket.side} · {ticket.type}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-bold text-white">Recent Bookings</h2>
                        <Link href="/admin/bookings" className="text-xs text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1">
                            View all <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {loading ? [1,2,3].map(i => (
                            <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />
                        )) : data?.recent.bookings.length === 0 ? (
                            <p className="text-gray-600 text-sm text-center py-4">No bookings yet</p>
                        ) : data?.recent.bookings.map(b => (
                            <Link key={b._id} href="/admin/bookings">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                        <CalendarCheck className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-white truncate">{b.package?.name || b.bookingRef}</p>
                                        <p className="text-xs text-gray-500 truncate">{b.user?.username} · ₹{b.totalAmount?.toLocaleString('en-IN')}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                                        b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                                        b.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                        'bg-red-500/10 text-red-400'
                                    }`}>{b.status}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
