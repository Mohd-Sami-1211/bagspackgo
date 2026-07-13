'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, ArrowRight, CalendarCheck } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

    const [startDate, setStartDate] = useState(null);
    const [dateInput, setDateInput] = useState('');

    const handleDateInputChange = (e) => {
        const input = e.target.value;
        const digits = input.replace(/\D/g, '').slice(0, 8);
        let formatted = '';
        if (digits.length <= 2) formatted = digits;
        else if (digits.length <= 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
        else formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
        setDateInput(formatted);

        if (formatted.length === 10) {
            const [day, month, year] = formatted.split('/').map(Number);
            const parsedDate = new Date(year, month - 1, day);
            if (!isNaN(parsedDate.getTime()) && parsedDate >= new Date(new Date().setHours(0,0,0,0))) {
                setStartDate(parsedDate);
                setFormData(p => ({ ...p, date: parsedDate.toISOString() }));
            }
            else {
                setStartDate(null);
                setFormData(p => ({ ...p, date: '' }));
            }
        } else {
            setStartDate(null);
            setFormData(p => ({ ...p, date: '' }));
        }
    };

    const handleDateChange = (date) => {
        setStartDate(date);
        setDateInput(date ? date.toLocaleDateString('en-GB').split('/').map(v => v.padStart(2, '0')).join('/') : '');
        setFormData(p => ({ ...p, date: date ? date.toISOString() : '' }));
    };

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
                    setStartDate(null);
                    setDateInput('');
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
            {isOpen && (
                <div key="private-trip-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-20">
                        <X size={20} />
                    </button>

                    <div className="bg-emerald-50 p-8 sm:p-6 md:p-8 border-b border-emerald-100 text-center relative overflow-hidden shrink-0">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/50 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-200/50 rounded-full blur-3xl" />
                        
                        <h2 className="text-2xl font-bold text-slate-800 relative z-10">Plan Your Adventure</h2>
                        <p className="text-emerald-700 text-sm mt-1 relative z-10 font-medium">To: {offbeatTitle}</p>
                    </div>

                    <div className="p-8 sm:p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
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
                                    <div className="relative w-full z-[1000]">
                                        <DatePicker
                                            selected={startDate}
                                            onChange={handleDateChange}
                                            customInput={
                                                <div className="relative w-full">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                                        <CalendarCheck className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={dateInput}
                                                        onChange={handleDateInputChange}
                                                        placeholder="DD/MM/YYYY"
                                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition text-slate-700"
                                                    />
                                                </div>
                                            }
                                            dateFormat="dd/MM/yyyy"
                                            minDate={new Date()}
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="scroll"
                                            scrollableYearDropdown
                                            yearDropdownItemNumber={100}
                                            placeholderText="DD/MM/YYYY"
                                            popperClassName="z-[1050]"
                                            popperPlacement="bottom-start"
                                            calendarClassName="border-emerald-200 rounded-xl shadow-xl bg-white font-sans"
                                            wrapperClassName="w-full"
                                        />
                                    </div>
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

                                <div className="flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={onClose}
                                        disabled={loading}
                                        className="w-1/3 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition disabled:opacity-70"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition disabled:opacity-70 group"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>Submit Inquiry <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /></>
                                        )}
                                    </button>
                                </div>
                                <p className="text-center text-xs text-slate-400 mt-4">
                                    No payment required at this step. We'll contact you to confirm details.
                                </p>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
            )}
        </AnimatePresence>
    );
}
