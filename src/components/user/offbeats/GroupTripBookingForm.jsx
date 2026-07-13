'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, CalendarDays, CalendarRange } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
                    className="bg-white rounded-xl border border-slate-200 w-full max-w-md shadow-lg overflow-hidden relative flex flex-col max-h-[90vh]"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 z-20">
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>

                    <div className="flex flex-col space-y-1.5 p-6 pb-0 shrink-0">
                        <h2 className="text-lg font-semibold leading-none tracking-tight text-slate-900">Group Trip Interest</h2>
                        <p className="text-sm text-slate-500">Register your interest for: {offbeatTitle}</p>
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
                                    <h3 className="text-lg font-semibold text-slate-900">Interest Registered!</h3>
                                    <p className="text-slate-500 mt-1 text-sm">
                                        Thank you! We have recorded your interest in a group trip. We will notify you when enough travelers join for your selected dates.
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">Group Size (Your Party)</label>
                                    <div className="flex items-center space-x-2">
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setNumberOfPersons(Math.max(1, numberOfPersons - 1))}
                                            className="h-9 w-9 shrink-0"
                                        >
                                            -
                                        </Button>
                                        <Input 
                                            type="number" 
                                            min="1" 
                                            required
                                            value={numberOfPersons}
                                            onChange={e => setNumberOfPersons(parseInt(e.target.value) || 1)}
                                            className="h-9 text-center"
                                        />
                                        <Button 
                                            type="button" 
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setNumberOfPersons(numberOfPersons + 1)}
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
                                        value={contactNumber}
                                        onChange={e => setContactNumber(e.target.value)}
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">Preferred Dates</label>
                                    </div>
                                    
                                    <div className="flex p-1 bg-slate-100 rounded-md">
                                        <button 
                                            type="button"
                                            onClick={() => setDateMode('multiple')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-sm transition-all ${
                                                dateMode === 'multiple' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            <CalendarDays size={14} /> Multiple Dates
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setDateMode('range')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-sm transition-all ${
                                                dateMode === 'range' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            <CalendarRange size={14} /> Date Range
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

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900">Special Requirements (Optional)</label>
                                    <Textarea 
                                        value={specialRequirements}
                                        onChange={e => setSpecialRequirements(e.target.value)}
                                        rows={2}
                                        className="resize-none"
                                        placeholder="Any specific requests?"
                                    />
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                                        {error}
                                    </div>
                                )}

                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Register Interest
                                </Button>
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
                    background-color: #0f172a !important;
                    color: white !important;
                    border-radius: 9999px !important;
                }
                .group-trip-datepicker .react-datepicker__day--keyboard-selected {
                    background-color: #f1f5f9 !important;
                    color: #0f172a !important;
                    border-radius: 9999px !important;
                }
            `}</style>
        </>
    );
}
