'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, CheckCircle2, XCircle, Loader2, AlertTriangle, CalendarX, MessageSquare, X } from 'lucide-react';
import Image from 'next/image';

function RequestModal({ req, onClose, onConfirm }) {
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('approved');
    const [submitting, setSubmitting] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl">
                
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        Resolve Action Request
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="mb-6 space-y-2 text-sm bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                    <p className="text-gray-400">Target: <span className="font-semibold text-white">{req.title} ({req.model})</span></p>
                    <p className="text-gray-400">Reason: <span className="text-white italic">&quot;{req.deleteRequest.reason}&quot;</span></p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm font-semibold">
                    <button onClick={() => setStatus('approved')} className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        status === 'approved' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    }`}>
                        <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => setStatus('rejected')} className={`py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                        status === 'rejected' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    }`}>
                        <XCircle className="w-4 h-4" /> Reject
                    </button>
                </div>

                <div className="space-y-1.5 mb-6">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">Admin Notes (Optional)</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Why are you taking this action?"
                        className="w-full bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all min-h-[100px] resize-y"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 mt-2">
                    <button onClick={onClose} disabled={submitting} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all">Cancel</button>
                    <button onClick={async () => {
                        setSubmitting(true);
                        await onConfirm(req._id, status, notes);
                    }} disabled={submitting} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 transition-all flex items-center gap-2">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Resolution'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('pending'); // 'pending' or 'resolved'
    const [activeReq, setActiveReq] = useState(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/requests');
            const data = await res.json();
            if (data.success) {
                setRequests(data.requests);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to load requests');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleConfirm = async (id, status, notes) => {
        try {
            const res = await fetch(`/api/admin/requests/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminNotes: notes })
            });
            const data = await res.json();
            if (data.success) {
                setRequests(requests.map(r => r._id === id ? {
                    ...r, 
                    deleteRequest: { ...r.deleteRequest, adminStatus: status, adminNotes: notes, resolvedAt: new Date().toISOString() }
                } : r));
                setActiveReq(null);
            } else {
                alert(data.message);
            }
        } catch {
            alert('Action failed');
        }
    };

    const filtered = requests.filter(r => 
        filter === 'pending' ? r.deleteRequest.adminStatus === 'pending' 
        : r.deleteRequest.adminStatus !== 'pending'
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ClipboardList className="w-6 h-6 text-blue-400" /> Provider Action Requests
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Review event/package deletion and modification requests.</p>
                </div>

                <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl w-full sm:w-auto overflow-x-auto text-sm flex-shrink-0">
                    {['pending', 'resolved'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-6 py-2 flex-1 sm:flex-none rounded-lg font-medium transition-all capitalize whitespace-nowrap ${
                                filter === f ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" /> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {loading ? (
                        <div className="col-span-1 md:col-span-2 xl:col-span-3 py-20 flex flex-col items-center justify-center">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                            <p className="text-gray-500 text-sm">Loading requests...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 xl:col-span-3 py-20 flex flex-col items-center justify-center bg-gray-900/50 border border-gray-800 border-dashed rounded-3xl">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-white font-semibold flex items-center gap-2">No {filter} requests</p>
                            <p className="text-gray-500 text-sm mt-1">You are all caught up!</p>
                        </div>
                    ) : filtered.map(req => (
                        <motion.div key={req._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col h-full shadow-sm hover:border-gray-700 transition-colors">
                            
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-white max-w-[200px] truncate">{req.title}</h3>
                                    <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mt-1">{req.model} Deletion</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider flex-shrink-0 ${
                                    req.deleteRequest.adminStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    req.deleteRequest.adminStatus === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                    'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                                }`}>
                                    {req.deleteRequest.adminStatus}
                                </span>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div className="bg-gray-800/40 rounded-xl p-3 border border-gray-800 flex items-start gap-3">
                                    <MessageSquare className="w-4 h-4 mt-0.5 text-gray-500 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold mb-0.5">Provider Reason</p>
                                        <p className="text-sm text-gray-300 italic">"{req.deleteRequest.reason}"</p>
                                    </div>
                                </div>

                                <div className="text-sm">
                                    <p className="flex justify-between text-gray-400 mb-1">Provider: <span className="text-white">{req.guide?.username}</span></p>
                                    <p className="flex justify-between text-gray-400">Date: <span className="text-white">{new Date(req.deleteRequest.requestedAt).toLocaleDateString('en-GB')}</span></p>
                                </div>
                            </div>

                            {req.deleteRequest.adminStatus === 'pending' ? (
                                <button onClick={() => setActiveReq(req)} className="w-full mt-6 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 font-semibold text-sm transition-colors">
                                    Resolve Request
                                </button>
                            ) : (
                                <div className="mt-6 pt-4 border-t border-gray-800/50">
                                    <p className="text-xs text-gray-500 font-semibold mb-1">Resolution Notes</p>
                                    <p className="text-sm text-gray-300">{req.deleteRequest.adminNotes || 'No notes provided.'}</p>
                                    <p className="text-xs text-gray-500 mt-2 text-right">{new Date(req.deleteRequest.resolvedAt).toLocaleString('en-GB')}</p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {activeReq && <RequestModal req={activeReq} onClose={() => setActiveReq(null)} onConfirm={handleConfirm} />}
            </AnimatePresence>
        </div>
    );
}
