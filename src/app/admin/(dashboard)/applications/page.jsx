'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle2, XCircle, Loader2, AlertTriangle, Building, MapPin, Mail, Phone, ExternalLink, X } from 'lucide-react';
import Image from 'next/image';

function RejectModal({ app, onClose, onConfirm }) {
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl">
                
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <XCircle className="w-6 h-6 text-red-500" /> Reject Application
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <p className="text-sm text-gray-400 mb-6">
                    You are rejecting the application for <span className="text-white font-medium">{app.companyname}</span>. Please provide a reason — this will be visible to the service provider.
                </p>

                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="E.g., Missing valid business license, unclear ID verification..."
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 outline-none transition-all min-h-[120px] resize-y"
                    required
                />

                <div className="flex items-center justify-end gap-3 mt-6">
                    <button onClick={onClose} disabled={submitting} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all">Cancel</button>
                    <button onClick={async () => {
                        if (!notes.trim()) return alert('Notes are required for rejection');
                        setSubmitting(true);
                        await onConfirm(app._id, 'rejected', notes);
                    }} disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition-all">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Rejection'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function AdminApplicationsPage() {
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
    const [error, setError] = useState('');
    const [rejectingApp, setRejectingApp] = useState(null);
    const [viewingImage, setViewingImage] = useState(null);

    const fetchApps = useCallback(async (currentFilter) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/applications?filter=${currentFilter}`);
            const data = await res.json();
            if (data.success) {
                setApps(data.applications);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApps(filter);
    }, [filter, fetchApps]);

    const handleAction = async (id, status, notes = '') => {
        if (status === 'approved' && !confirm('Are you sure you want to approve this application? The provider will immediately gain full access to the platform.')) return;
        
        try {
            const res = await fetch(`/api/admin/applications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminNotes: notes })
            });
            const data = await res.json();
            if (data.success) {
                // If filter isn't 'all', just remove it from the list
                if (filter !== 'all') {
                    setApps(apps.filter(a => a._id !== id));
                } else {
                    setApps(apps.map(a => a._id === id ? { ...a, status, adminNotes: notes } : a));
                }
                setRejectingApp(null); // Close modal if open
            } else {
                alert(data.message);
            }
        } catch {
            alert('Action failed. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-amber-400" /> Applications
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Review service provider registrations and legal documents.</p>
                </div>

                <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl w-full sm:w-auto overflow-x-auto text-sm flex-shrink-0">
                    {['pending', 'approved', 'rejected', 'all'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-2 flex-1 sm:flex-none rounded-lg font-medium transition-all capitalize whitespace-nowrap ${
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

            {/* List */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                    <p className="text-gray-500 text-sm">Loading applications...</p>
                </div>
            ) : apps.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center bg-gray-900/50 border border-gray-800 border-dashed rounded-3xl">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-white font-semibold">No applications found</p>
                    <p className="text-gray-500 text-sm mt-1">There are no {filter !== 'all' ? filter : ''} applications right now.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {apps.map(app => (
                            <motion.div key={app._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 overflow-hidden">
                                
                                <div className="flex flex-col md:flex-row gap-6 md:divide-x divide-gray-800">
                                    {/* Left: General Info */}
                                    <div className="md:w-1/3 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <Building className="w-5 h-5 text-amber-500" /> {app.companyname}
                                                </h3>
                                                {app.guide && <p className="text-sm text-gray-500 mt-1">Submitted by {app.guide.username}</p>}
                                            </div>
                                            <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                                                app.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                                app.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                                                'bg-amber-500/10 text-amber-500 animate-pulse'
                                            }`}>
                                                {app.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Mail className="w-4 h-4 text-gray-500" /> {app.companyemail}
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-300">
                                                <Phone className="w-4 h-4 text-gray-500" /> {app.companymobile || app.companyphone || 'No Contact'}
                                            </div>
                                            <div className="flex items-start gap-3 text-gray-300">
                                                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" /> 
                                                <span>{app.address} <br/> <span className="text-xs text-gray-500">Destination: {app.destinationId}</span></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Documents & Links */}
                                    <div className="md:w-1/3 md:pl-6 space-y-4">
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Legal Documents</h4>
                                            <div className="flex gap-4">
                                                <div className="flex flex-col gap-1 w-28">
                                                    <span className="text-xs text-gray-500 font-semibold">License</span>
                                                    {app.licenseFile && app.licenseFile.startsWith('data:') ? (
                                                        <button onClick={() => setViewingImage(app.licenseFile)} className="relative w-full h-20 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden block hover:border-emerald-500 transition-colors">
                                                            <img src={app.licenseFile} alt="License" className="object-cover w-full h-full" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 flex items-center rounded mt-1">Missing / Empty</span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex flex-col gap-1 w-28">
                                                    <span className="text-xs text-gray-500 font-semibold">Govt ID</span>
                                                    {app.idFile && app.idFile.startsWith('data:') ? (
                                                        <button onClick={() => setViewingImage(app.idFile)} className="relative w-full h-20 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden block hover:border-blue-500 transition-colors">
                                                            <img src={app.idFile} alt="ID" className="object-cover w-full h-full" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 flex items-center rounded mt-1">Missing / Empty</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Social Presence</h4>
                                            <div className="flex gap-3">
                                                {app.website && <a href={app.website} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400 text-sm font-medium">Website</a>}
                                                {app.instagram && <a href={`https://instagram.com/${app.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="text-pink-500 hover:text-pink-400 text-sm font-medium">Instagram</a>}
                                                {app.facebook && <a href={app.facebook} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 text-sm font-medium">Facebook</a>}
                                                {(!app.website && !app.instagram && !app.facebook) && <span className="text-xs text-gray-600">No links provided</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="md:w-1/3 md:pl-6 space-y-4 flex flex-col relative">

                                        {(app.status === 'pending' || filter === 'all') && (
                                            <div className="mt-auto pt-4 flex gap-3">
                                                {app.status !== 'approved' && (
                                                    <button onClick={() => handleAction(app._id, 'approved')}
                                                        className="flex-1 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
                                                        <CheckCircle2 className="w-4 h-4" /> Approve
                                                    </button>
                                                )}
                                                {app.status !== 'rejected' && (
                                                    <button onClick={() => setRejectingApp(app)}
                                                        className="flex-1 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
                                                        <XCircle className="w-4 h-4" /> Reject
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {app.status === 'rejected' && app.adminNotes && filter === 'all' && (
                                            <div className="mt-auto pt-4 text-xs">
                                                <span className="text-gray-500 font-semibold block mb-1">Rejection Reason:</span>
                                                <p className="text-red-400 bg-red-500/10 p-2 border border-red-500/20 rounded-lg">{app.adminNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {rejectingApp && (
                    <RejectModal app={rejectingApp} onClose={() => setRejectingApp(null)} onConfirm={handleAction} />
                )}
                {viewingImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setViewingImage(null)}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} 
                            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center p-2" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setViewingImage(null)} className="absolute -top-12 right-0 sm:-right-12 text-gray-400 hover:text-white transition-colors bg-gray-900 rounded-full p-2">
                                <X className="w-6 h-6" />
                            </button>
                            <img src={viewingImage} alt="Document View" className="max-w-full max-h-[85vh] object-contain rounded-xl border border-gray-700 shadow-2xl" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
