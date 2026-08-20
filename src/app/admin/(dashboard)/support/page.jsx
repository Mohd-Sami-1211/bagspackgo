'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, Search, Loader2, AlertTriangle, Send, Phone, Mail, CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';

function TicketModal({ ticket, onClose, onReply }) {
    const [reply, setReply] = useState(ticket.adminReply || '');
    const [status, setStatus] = useState(ticket.status);
    const [sendEmail, setSendEmail] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl">
                
                <div className="flex items-center justify-between p-6 border-b border-gray-800 flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">Ticket #{ticket.ticketNumber}</h3>
                        <span className={`inline-flex px-2 py-0.5 mt-2 rounded text-[10px] uppercase font-bold tracking-wider ${
                            status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                            status === 'in-progress' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-blue-500/10 text-blue-400'
                        }`}>
                            {status}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50">
                        <div className="flex-1 min-w-0 text-sm">
                            <p className="text-gray-400 mb-1">From: <span className="font-semibold text-white">{ticket.sender?.username}</span> <span className="uppercase text-[10px] ml-2 text-violet-400 font-bold bg-violet-500/10 px-2 rounded-sm">{ticket.side}</span></p>
                            <p className="flex items-center gap-2 text-gray-400"><Mail className="w-3.5 h-3.5" /> {ticket.senderEmail}</p>
                            <p className="flex items-center gap-2 text-gray-400 mt-1"><Phone className="w-3.5 h-3.5" /> {ticket.phone}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-2">{ticket.subject}</h4>
                        <div className="bg-gray-800/20 border border-gray-800 p-4 rounded-xl">
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-800">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Admin Reply</label>
                        <textarea
                            value={reply}
                            onChange={e => setReply(e.target.value)}
                            placeholder="Type your response to the user..."
                            className="w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all min-h-[120px] resize-y"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-800/20 flex-shrink-0 flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <select 
                            value={status} onChange={e => setStatus(e.target.value)}
                            className="bg-gray-900 border border-gray-700 text-sm rounded-lg px-3 py-1.5 text-white outline-none focus:border-blue-500">
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                            <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="rounded border-gray-600 outline-none" />
                            Email user
                        </label>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={onClose} disabled={submitting} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all">Cancel</button>
                        <button onClick={async () => {
                            setSubmitting(true);
                            await onReply(ticket._id, status, reply, sendEmail);
                        }} disabled={submitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-all">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Save & Send</>}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, resolved
    const [sideFilter, setSideFilter] = useState('all'); // all, provider, user
    const [activeTicket, setActiveTicket] = useState(null);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/support?side=${sideFilter}`);
            const data = await res.json();
            if (data.success) {
                setTickets(data.support);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to load tickets');
        } finally {
            setLoading(false);
        }
    }, [sideFilter]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleReply = async (id, status, reply, sendEmail) => {
        try {
            const res = await fetch(`/api/admin/support/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminReply: reply, sendEmail })
            });
            const data = await res.json();
            if (data.success) {
                setTickets(tickets.map(t => t._id === id ? { ...t, status, adminReply: reply, repliedAt: data.ticket.repliedAt } : t));
                setActiveTicket(null);
            } else {
                alert(data.message);
            }
        } catch {
            alert('Action failed');
        }
    };

    const filtered = tickets.filter(t => {
        if (filter === 'pending') return t.status === 'pending' || t.status === 'in-progress';
        if (filter === 'resolved') return t.status === 'resolved' || t.status === 'closed';
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <LifeBuoy className="w-6 h-6 text-sky-400" /> Support Desk
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage inquiries from users and providers.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-gray-800 pb-4">
                <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto text-sm w-max">
                    {['pending', 'resolved', 'all'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-lg font-medium transition-all capitalize ${
                                filter === f ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                            }`}>
                            {f === 'pending' ? 'Active' : f}
                        </button>
                    ))}
                </div>

                <select value={sideFilter} onChange={e => setSideFilter(e.target.value)}
                    className="bg-gray-900 border border-gray-800 text-sm rounded-xl px-4 py-2 sm:py-0 text-gray-300 outline-none focus:border-sky-500">
                    <option value="all">Everyone</option>
                    <option value="user">Users (Travelers)</option>
                    <option value="provider">Service Providers</option>
                </select>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {loading ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
                            <p className="text-gray-500 text-sm">Loading support tickets...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 flex flex-col items-center justify-center bg-gray-900/50 border border-gray-800 border-dashed rounded-3xl">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-8 h-8 text-sky-600/50" />
                            </div>
                            <p className="text-white font-semibold">Inbox Zero!</p>
                            <p className="text-gray-500 text-sm mt-1">No {filter !== 'all' ? filter : ''} support tickets found.</p>
                        </div>
                    ) : filtered.map(t => (
                        <motion.div key={t._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            onClick={() => setActiveTicket(t)}
                            className="bg-gray-900 border border-gray-800 hover:border-sky-500/50 cursor-pointer rounded-2xl p-5 flex flex-col h-full shadow-sm transition-all group">
                            
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0 pr-3">
                                    <h3 className="font-bold text-white text-sm truncate">{t.subject}</h3>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">#{t.ticketNumber}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider flex-shrink-0 ${
                                    t.status === 'resolved' || t.status === 'closed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    t.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                    'bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse'
                                }`}>
                                    {t.status}
                                </span>
                            </div>

                            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                                {t.message}
                            </p>

                            <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-xs">
                                <div className="text-gray-500 font-medium">
                                    {t.sender?.username} <span className="text-gray-700 mx-1">•</span> <span className="uppercase text-violet-400">{t.side}</span>
                                </div>
                                <div className="text-gray-500">
                                    {new Date(t.createdAt).toLocaleDateString('en-GB')}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {activeTicket && <TicketModal ticket={activeTicket} onClose={() => setActiveTicket(null)} onReply={handleReply} />}
            </AnimatePresence>
        </div>
    );
}
