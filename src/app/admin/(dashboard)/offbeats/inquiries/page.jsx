'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, Loader2, CheckCircle, XCircle, Clock, Users, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminOffBeatBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('private'); // 'private' | 'group'

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/offbeats/inquiries?type=${activeTab}`);
            const data = await res.json();
            if (data.success) {
                setBookings(data.data);
            }
        } catch (error) {
            console.error('Error fetching offbeat bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            const res = await fetch(`/api/admin/offbeats/inquiries/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) fetchBookings();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/offbeats" className="text-gray-400 hover:text-white transition">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="text-emerald-400" /> OffBeat Inquiries
                    </h1>
                    <p className="text-gray-400 text-sm">Manage user booking inquiries for OffBeat destinations.</p>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-gray-800/50 border border-gray-700/60 rounded-xl w-fit">
                {[
                    { key: 'private', label: 'Private Inquiries', icon: MessageSquare },
                    { key: 'group', label: 'Group Trip Inquiries', icon: Users },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                            activeTab === t.key
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'text-gray-400 hover:text-white border border-transparent'
                        }`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-gray-800/50 text-gray-300">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User Details</th>
                                <th className="px-6 py-4 font-semibold">Destination</th>
                                <th className="px-6 py-4 font-semibold">Persons</th>
                                <th className="px-6 py-4 font-semibold">Date(s)</th>
                                {activeTab === 'private' && (
                                    <th className="px-6 py-4 font-semibold">Requirements</th>
                                )}
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading inquiries...
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        No {activeTab} inquiries found.
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <motion.tr 
                                        key={booking._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-800/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{booking.user?.username || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{booking.contactNumber}</div>
                                            <div className="text-xs text-gray-500">{booking.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">
                                            {booking.offbeat?.title || 'Deleted OffBeat'}
                                        </td>
                                        <td className="px-6 py-4">{booking.numberOfPersons}</td>
                                        <td className="px-6 py-4">
                                            {booking.inquiryType === 'group' && booking.dateOptions?.length > 0 ? (
                                                <div className="space-y-1">
                                                    {booking.dateOptions.map((opt, i) => (
                                                        <span key={i} className="block text-xs bg-gray-800 px-2 py-1 rounded w-max border border-gray-700">
                                                            {opt}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : booking.date ? (
                                                <span className="whitespace-nowrap">{new Date(booking.date).toLocaleDateString()}</span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        {activeTab === 'private' && (
                                            <td className="px-6 py-4 max-w-[200px] truncate" title={booking.specialRequirements}>
                                                {booking.specialRequirements || '-'}
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-max ${
                                                booking.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                booking.status === 'contacted' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                booking.status === 'converted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                'bg-red-500/10 text-red-400 border border-red-500/20'
                                            }`}>
                                                {booking.status === 'pending' && <Clock size={12} />}
                                                {booking.status === 'converted' && <CheckCircle size={12} />}
                                                {booking.status === 'cancelled' && <XCircle size={12} />}
                                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <select 
                                                value={booking.status}
                                                onChange={(e) => updateStatus(booking._id, e.target.value)}
                                                className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="converted">Converted</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
