'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, ArrowRight } from 'lucide-react';

export default function OffbeatBookingForm({ isOpen, onClose, offbeatId, offbeatTitle, user }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        numberOfPersons: 1,
        contactNumber: user?.phone || '',
        date: '',
        specialRequirements: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/user/offbeat-bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, offbeatId })
            });

            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setFormData({ numberOfPersons: 1, contactNumber: user?.phone || '', date: '', specialRequirements: '' });
                }, 3000);
            } else {
                setError(data.message || 'Failed to submit inquiry');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-10">
                        <X size={20} />
                    </button>

                    <div className="bg-emerald-50 p-8 border-b border-emerald-100 text-center relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/50 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200/50 rounded-full blur-3xl" />
                        
                        <h2 className="text-2xl font-bold text-slate-800 relative z-10">Plan Your Adventure</h2>
                        <p className="text-emerald-700 text-sm mt-1 relative z-10 font-medium">To: {offbeatTitle}</p>
                    </div>

                    <div className="p-8">
                        {success ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                className="text-center py-8 flex flex-col items-center gap-4"
                            >
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                    <CheckCircle size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Inquiry Sent!</h3>
                                    <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                        Our travel experts will review your request and get back to you shortly with pricing and details.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Persons</label>
                                    <div className="flex items-center">
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(p => ({ ...p, numberOfPersons: Math.max(1, p.numberOfPersons - 1) }))}
                                            className="w-12 h-12 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-l-xl text-slate-600 hover:bg-slate-200 transition"
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            required
                                            value={formData.numberOfPersons}
                                            onChange={e => setFormData(p => ({ ...p, numberOfPersons: parseInt(e.target.value) || 1 }))}
                                            className="w-full h-12 text-center bg-white border-y border-slate-200 font-bold text-lg focus:outline-none"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(p => ({ ...p, numberOfPersons: p.numberOfPersons + 1 }))}
                                            className="w-12 h-12 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-r-xl text-slate-600 hover:bg-slate-200 transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Contact Number</label>
                                    <input 
                                        type="tel" 
                                        required
                                        placeholder="+91 9876543210"
                                        value={formData.contactNumber}
                                        onChange={e => setFormData(p => ({ ...p, contactNumber: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tentative Date</label>
                                    <input 
                                        type="date" 
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formData.date}
                                        onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-slate-700"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Special Requirements (Optional)</label>
                                    <textarea 
                                        rows={3}
                                        placeholder="Any dietary restrictions, medical conditions, or specific requests?"
                                        value={formData.specialRequirements}
                                        onChange={e => setFormData(p => ({ ...p, specialRequirements: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition resize-none"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-70 group"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                        <>Submit Inquiry <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /></>
                                    )}
                                </button>
                                <p className="text-center text-xs text-slate-400 mt-4">
                                    No payment required at this step. We'll contact you to confirm details.
                                </p>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
