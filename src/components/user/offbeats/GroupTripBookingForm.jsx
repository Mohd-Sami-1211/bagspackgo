'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, CalendarDays, CalendarRange } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function GroupTripBookingForm({ isOpen, onClose, offbeatId, offbeatTitle, user }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    
    // Form fields
    const [numberOfPersons, setNumberOfPersons] = useState(1);
    const [contactNumber, setContactNumber] = useState(user?.phone || '');
    const [specialRequirements, setSpecialRequirements] = useState('');
    
    // Date selection mode
    const [dateMode, setDateMode] = useState('multiple'); // 'multiple' | 'range'
    
    // Date states
    const [selectedDates, setSelectedDates] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        let dateOptions = [];
        if (dateMode === 'multiple') {
            if (selectedDates.length === 0) {
                setError('Please select at least one date.');
                return;
            }
            dateOptions = selectedDates.map(d => new Date(d).toLocaleDateString());
        } else {
            if (!startDate || !endDate) {
                setError('Please select a valid date range.');
                return;
            }
            dateOptions = [`${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`];
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/user/offbeat-bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    offbeatId,
                    numberOfPersons,
                    contactNumber,
                    specialRequirements,
                    inquiryType: 'group',
                    dateOptions
                })
            });

            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setNumberOfPersons(1);
                    setSelectedDates([]);
                    setDateRange([null, null]);
                    setSpecialRequirements('');
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
        <>
            <AnimatePresence>
                {isOpen && (
                    <div key="group-trip-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-20">
                        <X size={20} />
                    </button>

                    <div className="bg-blue-50 p-8 sm:p-6 md:p-8 border-b border-blue-100 text-center relative overflow-hidden shrink-0">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/50 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-200/50 rounded-full blur-3xl" />
                        
                        <h2 className="text-2xl font-bold text-slate-800 relative z-10">Group Trip Interest</h2>
                        <p className="text-blue-700 text-sm mt-1 relative z-10 font-medium">To: {offbeatTitle}</p>
                    </div>

                    <div className="p-8 sm:p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {success ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                className="text-center py-8 flex flex-col items-center gap-4"
                            >
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                    <CheckCircle size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Interest Registered!</h3>
                                    <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                                        Thank you! We have recorded your interest in a group trip. We will notify you when enough travelers join for your selected dates.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Group Size (Your Party)</label>
                                    <div className="flex items-center">
                                        <button 
                                            type="button" 
                                            onClick={() => setNumberOfPersons(Math.max(1, numberOfPersons - 1))}
                                            className="w-12 h-12 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-l-xl text-slate-600 hover:bg-slate-200 transition"
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            required
                                            value={numberOfPersons}
                                            onChange={e => setNumberOfPersons(parseInt(e.target.value) || 1)}
                                            className="w-full h-12 text-center bg-white border-y border-slate-200 font-bold text-lg focus:outline-none"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setNumberOfPersons(numberOfPersons + 1)}
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
                                        value={contactNumber}
                                        onChange={e => setContactNumber(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-semibold text-slate-700">Preferred Dates</label>
                                    </div>
                                    
                                    <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
                                        <button 
                                            type="button"
                                            onClick={() => setDateMode('multiple')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                                                dateMode === 'multiple' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            <CalendarDays size={16} /> Multiple Dates
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setDateMode('range')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                                                dateMode === 'range' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            <CalendarRange size={16} /> Date Range
                                        </button>
                                    </div>

                                    <div className="date-picker-wrapper group-trip-datepicker">
                                        {dateMode === 'multiple' ? (
                                            <DatePicker
                                                selectsMultiple
                                                selectedDates={selectedDates}
                                                onChange={dates => setSelectedDates(dates)}
                                                inline
                                                minDate={new Date()}
                                                calendarClassName="w-full !border-slate-200 !rounded-xl !shadow-sm !font-sans"
                                                dayClassName={date => "hover:!bg-blue-50 !rounded-full"}
                                            />
                                        ) : (
                                            <DatePicker
                                                selectsRange={true}
                                                startDate={startDate}
                                                endDate={endDate}
                                                onChange={(update) => {
                                                    setDateRange(update);
                                                }}
                                                inline
                                                minDate={new Date()}
                                                calendarClassName="w-full !border-slate-200 !rounded-xl !shadow-sm !font-sans"
                                                dayClassName={date => "hover:!bg-blue-50 !rounded-full"}
                                            />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 text-center">
                                        {dateMode === 'multiple' 
                                            ? `${selectedDates.length} date(s) selected` 
                                            : startDate && endDate 
                                                ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}` 
                                                : "Select start and end dates"}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Special Requirements (Optional)</label>
                                    <textarea 
                                        value={specialRequirements}
                                        onChange={e => setSpecialRequirements(e.target.value)}
                                        rows="2"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Any specific requests?"
                                    ></textarea>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Register Interest'}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
            )}
            </AnimatePresence>
            
            <style jsx global>{`
                .group-trip-datepicker .react-datepicker {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                }
                .group-trip-datepicker .react-datepicker__month-container {
                    width: 100%;
                }
                .group-trip-datepicker .react-datepicker__header {
                    background-color: transparent;
                    border-bottom: 1px solid #f1f5f9;
                    padding-top: 1rem;
                }
                .group-trip-datepicker .react-datepicker__day--selected,
                .group-trip-datepicker .react-datepicker__day--in-range,
                .group-trip-datepicker .react-datepicker__day--in-selecting-range {
                    background-color: #2563eb !important;
                    color: white !important;
                    border-radius: 9999px !important;
                }
                .group-trip-datepicker .react-datepicker__day--keyboard-selected {
                    background-color: #bfdbfe !important;
                    color: #1e3a8a !important;
                    border-radius: 9999px !important;
                }
            `}</style>
        </>
    );
}
