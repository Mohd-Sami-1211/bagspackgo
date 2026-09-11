'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CalendarRange, CheckCircle2, Loader2, Minus, Phone, Plus, Sparkles, Users, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const fieldClass = 'h-12 rounded-2xl border-[#17372f]/12 bg-[#f7f5ef] px-4 text-[#17372f] shadow-none placeholder:text-[#7b8a85] focus-visible:border-[#1d6b55]/45 focus-visible:ring-2 focus-visible:ring-[#1d6b55]/10';

export default function GroupTripBookingForm({ isOpen, onClose, offbeatId, offbeatTitle, user }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [numberOfPersons, setNumberOfPersons] = useState(1);
    const [contactNumber, setContactNumber] = useState(user?.phone || '');
    const [specialRequirements, setSpecialRequirements] = useState('');
    const [dateMode, setDateMode] = useState('multiple');
    const [selectedDates, setSelectedDates] = useState([]);
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    useEffect(() => { if (user?.phone) setContactNumber((current) => current || user.phone); }, [user?.phone]);
    useEffect(() => {
        if (!isOpen) return undefined;
        const closeOnEscape = (event) => { if (event.key === 'Escape' && !loading) onClose(); };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [isOpen, loading, onClose]);

    const resetAndClose = () => {
        if (loading) return;
        setError('');
        onClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        let dateOptions = [];
        if (dateMode === 'multiple') {
            if (!selectedDates.length) { setError('Choose at least one preferred date.'); return; }
            dateOptions = selectedDates.map((date) => new Date(date).toLocaleDateString('en-IN'));
        } else {
            if (!startDate || !endDate) { setError('Choose both the start and end date.'); return; }
            dateOptions = [`${startDate.toLocaleDateString('en-IN')} to ${endDate.toLocaleDateString('en-IN')}`];
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/user/offbeat-bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offbeatId, numberOfPersons, contactNumber, specialRequirements, inquiryType: 'group', dateOptions }),
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.message || 'Could not register your interest.');
            setSuccess(true);
            window.setTimeout(() => {
                onClose();
                setSuccess(false);
                setNumberOfPersons(1);
                setSelectedDates([]);
                setDateRange([null, null]);
                setSpecialRequirements('');
            }, 2600);
        } catch (submitError) {
            setError(submitError.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[260] overflow-y-auto bg-[#07110e]/72 p-3 backdrop-blur-md sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) resetAndClose(); }}>
                        <div className="flex min-h-full items-center justify-center">
                            <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.28 }} className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-[0_35px_100px_-35px_rgba(0,0,0,.75)] lg:grid-cols-[.9fr_1.1fr]">
                                <button type="button" onClick={resetAndClose} className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white/90 text-[#17372f] shadow-sm backdrop-blur" aria-label="Close form"><X className="h-4 w-4" /></button>

                                <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8 lg:p-10">
                                    {success ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[34rem] flex-col items-center justify-center text-center">
                                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf2ec] text-[#1d6b55]"><CheckCircle2 className="h-8 w-8" /></span>
                                            <p className="mt-6 text-[10px] font-bold uppercase tracking-[.22em] text-[#9b7440]">Interest registered</p>
                                            <h3 className="mt-2 font-serif text-4xl tracking-[-.035em] text-[#17372f]">You’re on the list.</h3>
                                            <p className="mt-4 max-w-sm text-sm leading-6 text-[#61716c]">We will contact you when a group begins forming around your preferred dates.</p>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            <div className="pr-10"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#9b7440]">Future group departure</p><h2 className="mt-2 font-serif text-4xl leading-none tracking-[-.035em] text-[#17372f]">Travel together, when it fits.</h2><p className="mt-4 text-sm leading-6 text-[#61716c]">Tell us when your party is available. This registers interest—it is not a booking or payment.</p></div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div><label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#52665f]"><Users className="h-4 w-4 text-[#1d6b55]" /> Your party</label><div className="flex items-center rounded-2xl border border-[#17372f]/12 bg-[#f7f5ef] p-1.5"><button type="button" onClick={() => setNumberOfPersons((value) => Math.max(1, value - 1))} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"><Minus className="h-4 w-4" /></button><Input type="number" min="1" max="100" required value={numberOfPersons} onChange={(event) => setNumberOfPersons(Math.min(100, Math.max(1, Number.parseInt(event.target.value, 10) || 1)))} className="h-10 flex-1 border-0 bg-transparent text-center font-bold shadow-none focus-visible:ring-0" /><button type="button" onClick={() => setNumberOfPersons((value) => Math.min(100, value + 1))} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"><Plus className="h-4 w-4" /></button></div></div>
                                                <div><label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#52665f]"><Phone className="h-4 w-4 text-[#1d6b55]" /> Contact number</label><Input type="tel" required maxLength={20} autoComplete="tel" value={contactNumber} onChange={(event) => setContactNumber(event.target.value)} placeholder="Your active number" className={fieldClass} /></div>
                                            </div>

                                            <div><label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#52665f]"><Sparkles className="h-4 w-4 text-[#1d6b55]" /> Notes <span className="normal-case tracking-normal text-[#8a9692]">Optional</span></label><Textarea value={specialRequirements} onChange={(event) => setSpecialRequirements(event.target.value)} rows={3} maxLength={1000} className="min-h-24 resize-none rounded-2xl border-[#17372f]/12 bg-[#f7f5ef] px-4 py-3 shadow-none focus-visible:border-[#1d6b55]/45 focus-visible:ring-2 focus-visible:ring-[#1d6b55]/10" placeholder="Interests, preferences or anything we should know…" /></div>

                                            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
                                            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#17372f] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#244c41] disabled:opacity-60">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Registering…</> : <>Register my interest <ArrowRight className="h-4 w-4" /></>}</button>
                                        </form>
                                    )}
                                </div>

                                {!success && (
                                    <div className="max-h-[90vh] overflow-y-auto border-t border-[#17372f]/10 bg-[#f3f0e7] p-5 pt-16 sm:p-7 sm:pt-16 lg:border-l lg:border-t-0 lg:p-10">
                                        <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#9b7440]">When can you travel?</p>
                                        <h3 className="mt-2 font-serif text-3xl tracking-[-.03em] text-[#17372f]">Choose flexible dates</h3>
                                        <div className="mt-5 flex rounded-2xl bg-[#e5e3da] p-1.5">
                                            <button type="button" onClick={() => { setDateMode('multiple'); setError(''); }} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${dateMode === 'multiple' ? 'bg-white text-[#17372f] shadow-sm' : 'text-[#687772]'}`}><CalendarDays className="h-4 w-4" /> Separate dates</button>
                                            <button type="button" onClick={() => { setDateMode('range'); setError(''); }} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition ${dateMode === 'range' ? 'bg-white text-[#17372f] shadow-sm' : 'text-[#687772]'}`}><CalendarRange className="h-4 w-4" /> Date range</button>
                                        </div>
                                        <div className="group-trip-datepicker mt-5 overflow-x-auto rounded-3xl bg-white p-2 shadow-[0_18px_45px_-38px_rgba(23,55,47,.5)]">
                                            {dateMode === 'multiple' ? <DatePicker selectsMultiple selectedDates={selectedDates} onChange={(dates) => { setSelectedDates(dates || []); setError(''); }} inline minDate={new Date()} /> : <DatePicker selectsRange startDate={startDate} endDate={endDate} onChange={(range) => { setDateRange(range); setError(''); }} inline minDate={new Date()} />}
                                        </div>
                                        <div className="mt-4 rounded-2xl border border-[#17372f]/8 bg-white/70 px-4 py-3 text-center text-xs font-semibold text-[#52665f]">{dateMode === 'multiple' ? selectedDates.length ? `${selectedDates.length} preferred date${selectedDates.length === 1 ? '' : 's'} selected` : 'Select one or more possible dates' : startDate && endDate ? `${startDate.toLocaleDateString('en-IN')} – ${endDate.toLocaleDateString('en-IN')}` : 'Select the start and end of your window'}</div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .group-trip-datepicker .react-datepicker { width: 100%; border: 0; font-family: inherit; }
                .group-trip-datepicker .react-datepicker__month-container { width: 100%; float: none; }
                .group-trip-datepicker .react-datepicker__header { border-bottom: 1px solid rgba(23,55,47,.08); background: white; padding-top: .75rem; }
                .group-trip-datepicker .react-datepicker__month { margin: .75rem auto; }
                .group-trip-datepicker .react-datepicker__day-names,
                .group-trip-datepicker .react-datepicker__week { display: flex; justify-content: space-around; }
                .group-trip-datepicker .react-datepicker__day-name,
                .group-trip-datepicker .react-datepicker__day { margin: .18rem; }
                .group-trip-datepicker .react-datepicker__day--selected,
                .group-trip-datepicker .react-datepicker__day--in-range,
                .group-trip-datepicker .react-datepicker__day--in-selecting-range { border-radius: 9999px !important; background: #17372f !important; color: white !important; }
                .group-trip-datepicker .react-datepicker__day--keyboard-selected { border-radius: 9999px !important; background: #eaf2ec !important; color: #17372f !important; }
                @media (max-width: 380px) {
                    .group-trip-datepicker .react-datepicker__day-name,
                    .group-trip-datepicker .react-datepicker__day { width: 1.65rem; line-height: 1.65rem; margin: .1rem; }
                }
            `}</style>
        </>
    );
}
