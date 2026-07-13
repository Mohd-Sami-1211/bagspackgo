'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, ArrowRight, CalendarCheck } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
                    className="bg-white rounded-xl border border-slate-200 w-full max-w-md shadow-lg overflow-hidden relative flex flex-col max-h-[90vh]"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 z-20">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>

                    <div className="flex flex-col space-y-1.5 p-6 pb-0 shrink-0">
                        <h2 className="text-lg font-semibold leading-none tracking-tight text-slate-900">Plan Your Adventure</h2>
                        <p className="text-sm text-slate-500">To: {offbeatTitle}</p>
                    </div>

                    <div className="p-6 pt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {success ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                className="text-center py-6 flex flex-col items-center gap-3"
                            >
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900">Inquiry Sent!</h3>
                                    <p className="text-slate-500 mt-1 text-sm">
                                        Our travel experts will review your request and get back to you shortly with pricing and details.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">Number of Persons</label>
                                    <div className="flex items-center space-x-2">
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setFormData(p => ({ ...p, numberOfPersons: Math.max(1, p.numberOfPersons - 1) }))}
                                            className="h-9 w-9 shrink-0"
                                        >
                                            -
                                        </Button>
                                        <Input 
                                            type="number" 
                                            min="1" 
                                            required
                                            value={formData.numberOfPersons}
                                            onChange={e => setFormData(p => ({ ...p, numberOfPersons: parseInt(e.target.value) || 1 }))}
                                            className="h-9 text-center"
                                        />
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setFormData(p => ({ ...p, numberOfPersons: p.numberOfPersons + 1 }))}
                                            className="h-9 w-9 shrink-0"
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">Contact Number</label>
                                    <Input 
                                        type="tel" 
                                        required
                                        placeholder="+91 9876543210"
                                        value={formData.contactNumber}
                                        onChange={e => setFormData(p => ({ ...p, contactNumber: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">Tentative Date</label>
                                    <div className="relative w-full z-[1000]">
                                        <DatePicker
                                            selected={startDate}
                                            onChange={handleDateChange}
                                            customInput={
                                                <div className="relative w-full">
                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                        <CalendarCheck className="h-4 w-4 text-slate-400" />
                                                    </div>
                                                    <Input
                                                        type="text"
                                                        required
                                                        value={dateInput}
                                                        onChange={handleDateInputChange}
                                                        placeholder="DD/MM/YYYY"
                                                        className="pl-9"
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
                                            calendarClassName="border-slate-200 rounded-md shadow-md bg-white font-sans text-sm"
                                            wrapperClassName="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">Special Requirements (Optional)</label>
                                    <Textarea 
                                        rows={3}
                                        placeholder="Any dietary restrictions, medical conditions, or specific requests?"
                                        value={formData.specialRequirements}
                                        onChange={e => setFormData(p => ({ ...p, specialRequirements: e.target.value }))}
                                        className="resize-none"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={loading}
                                        className="w-1/3"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={loading}
                                        className="flex-1 group"
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Submit Inquiry
                                        {!loading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                                    </Button>
                                </div>
                                <p className="text-center text-xs text-slate-500 mt-2">
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
