'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Phone, Calendar, Users, MessageSquare, CheckCircle, XCircle, X, Edit, Search } from 'lucide-react';

export default function CompanionRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/companion?status=${filter}`);
            const data = await res.json();
            if (data.success) {
                setRequests(data.requests);
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/admin/companion/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setRequests((prev) =>
                    prev.map((r) => (r._id === id ? data.request : r))
                );
                if (selectedRequest && selectedRequest._id === id) {
                    setSelectedRequest(data.request);
                }
            }
        } catch (error) {
            console.error('Failed to update request', error);
        }
    };

    const updateNotes = async (id, notes) => {
        try {
            const res = await fetch(`/api/admin/companion/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNotes: notes }),
            });
            const data = await res.json();
            if (data.success) {
                setRequests((prev) =>
                    prev.map((r) => (r._id === id ? data.request : r))
                );
                setSelectedRequest(data.request);
            }
        } catch (error) {
            console.error('Failed to update notes', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'contacted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'successful': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'unsuccessful': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'closed': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Companion Requests</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage consultation requests for the Companion service.</p>
                </div>
                
                <div className="flex bg-gray-800/50 p-1 rounded-xl border border-gray-700">
                    {['all', 'pending', 'successful', 'closed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                                filter === f ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">No requests found</h3>
                    <p className="text-gray-500 text-sm mt-1">Try changing your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-4">
                        {requests.map(req => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={req._id}
                                onClick={() => setSelectedRequest(req)}
                                className={`bg-gray-900 border rounded-2xl p-5 cursor-pointer transition-all ${
                                    selectedRequest?._id === req._id ? 'border-emerald-500/50 bg-gray-800/50' : 'border-gray-800 hover:border-gray-700'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{req.name}</h3>
                                        <p className="text-emerald-400 text-sm font-medium mt-0.5">{req.destination}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusColor(req.status)}`}>
                                        {req.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Phone</p>
                                        <p className="text-gray-300 text-sm flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-500" /> {req.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Date</p>
                                        <p className="text-gray-300 text-sm flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-500" /> {req.travelDates ? new Date(req.travelDates).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">People</p>
                                        <p className="text-gray-300 text-sm flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-500" /> {req.groupSize || 1}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Received</p>
                                        <p className="text-gray-400 text-sm">{new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {req.message && (
                                    <p className="text-gray-400 text-sm line-clamp-2 border-t border-gray-800 pt-3 mt-1">
                                        "{req.message}"
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    <div className="xl:col-span-1">
                        <AnimatePresence mode="wait">
                            {selectedRequest ? (
                                <motion.div
                                    key={selectedRequest._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-6"
                                >
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
                                        <h2 className="text-lg font-bold text-white">Manage Request</h2>
                                        <button onClick={() => setSelectedRequest(null)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 text-gray-400">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Quick Actions</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => updateStatus(selectedRequest._id, 'successful')}
                                                    className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors text-sm font-medium"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Successful
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(selectedRequest._id, 'unsuccessful')}
                                                    className="flex items-center justify-center gap-2 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium"
                                                >
                                                    <XCircle className="w-4 h-4" /> Unsuccessful
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(selectedRequest._id, 'contacted')}
                                                    className="flex items-center justify-center gap-2 py-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors text-sm font-medium"
                                                >
                                                    <Phone className="w-4 h-4" /> Contacted
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(selectedRequest._id, 'closed')}
                                                    className="flex items-center justify-center gap-2 py-2.5 bg-gray-800 text-gray-300 border border-gray-700 rounded-xl hover:bg-gray-700 transition-colors text-sm font-medium"
                                                >
                                                    Close Request
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Admin Notes</label>
                                            <textarea
                                                className="w-full h-32 bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-emerald-500 resize-none"
                                                placeholder="Add private notes here..."
                                                value={selectedRequest.adminNotes || ''}
                                                onChange={(e) => setSelectedRequest({...selectedRequest, adminNotes: e.target.value})}
                                                onBlur={(e) => updateNotes(selectedRequest._id, e.target.value)}
                                            />
                                        </div>

                                        <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                                            <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-emerald-500" /> Full Message</h4>
                                            <p className="text-gray-400 text-sm whitespace-pre-wrap leading-relaxed">
                                                {selectedRequest.message || 'No additional message provided.'}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center sticky top-6">
                                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                        <Search className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <h3 className="text-gray-300 font-medium">Select a Request</h3>
                                    <p className="text-gray-500 text-sm mt-2">Click on any request from the list to view details and manage it.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}
