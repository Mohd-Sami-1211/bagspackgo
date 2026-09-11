'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CheckCircle2, Compass, Loader2, Minus, Phone, Plus, Sparkles, Users, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const fieldClass = 'h-12 rounded-2xl border-[#17372f]/12 bg-[#f7f5ef] px-4 text-[#17372f] shadow-none outline-none placeholder:text-[#7b8a85] focus-visible:border-[#1d6b55]/45 focus-visible:ring-2 focus-visible:ring-[#1d6b55]/10';

export default function OffbeatBookingForm({ isOpen, onClose, offbeatId, offbeatTitle, user }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({ numberOfPersons: 1, contactNumber: user?.phone || '', date: '', specialRequirements: '' });
    const [startDate, setStartDate] = useState(null);
    const [dateInput, setDateInput] = useState('');

    useEffect(() => {
        if (user?.phone) setFormData((current) => current.contactNumber ? current : { ...current, contactNumber: user.phone });
    }, [user?.phone]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const closeOnEscape = (event) => { if (event.key === 'Escape' && !loading) onClose(); };
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [isOpen, loading, onClose]);

    const setDate = (date) => {
        setStartDate(date);
        setDateInput(date ? date.toLocaleDateString('en-GB').split('/').map((part) => part.padStart(2, '0')).join('/') : '');
        setFormData((current) => ({ ...current, date: date ? date.toISOString() : '' }));
    };

    const handleDateInputChange = (event) => {
        const digits = event.target.value.replace(/\D/g, '').slice(0, 8);
        const formatted = digits.length <= 2 ? digits : digits.length <= 4 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
        setDateInput(formatted);
        if (formatted.length !== 10) {
            setStartDate(null);
            setFormData((current) => ({ ...current, date: '' }));
            return;
        }
        const [day, month, year] = formatted.split('/').map(Number);
        const parsed = new Date(year, month - 1, day);
        const valid = parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day && parsed >= new Date(new Date().setHours(0, 0, 0, 0));
        if (valid) {
            setStartDate(parsed);
            setFormData((current) => ({ ...current, date: parsed.toISOString() }));
        } else {
            setStartDate(null);
            setFormData((current) => ({ ...current, date: '' }));
        }
    };

    const resetAndClose = () => {
        if (loading) return;
        setError('');
        onClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/user/offbeat-bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, offbeatId }),
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.message || 'Could not send your request.');
            setSuccess(true);
            window.setTimeout(() => {
                onClose();
                setSuccess(false);
                setFormData({ numberOfPersons: 1, contactNumber: user?.phone || '', date: '', specialRequirements: '' });
                setStartDate(null);
                setDateInput('');
            }, 2600);
        } catch (submitError) {
            setError(submitError.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[260] overflow-y-auto bg-[#07110e]/72 p-3 backdrop-blur-md sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) resetAndClose(); }}>
                    <div className="flex min-h-full items-center justify-center">
                        <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.28 }} className="relative grid w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-[0_35px_100px_-35px_rgba(0,0,0,.75)] md:grid-cols-[.82fr_1.18fr]">
                            <button type="button" onClick={resetAndClose} className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white/90 text-[#17372f] shadow-sm backdrop-blur transition hover:bg-white" aria-label="Close form"><X className="h-4 w-4" /></button>

                            <div className="relative overflow-hidden bg-[#17372f] p-7 text-white sm:p-9 md:flex md:flex-col md:justify-between">
                                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-white/10" />
                                <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#d8b97a]/10 blur-2xl" />
                                <div className="relative">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10"><Compass className="h-5 w-5" /></span>
                                    <p className="mt-7 text-[10px] font-bold uppercase tracking-[.24em] text-[#e1c48e]">Personal escape</p>
                                    <h2 className="mt-3 font-serif text-4xl leading-[.98] tracking-[-.035em]">Let’s shape your route.</h2>
                                    <p className="mt-4 text-sm leading-6 text-white/68">Share the basics. Our local team will return with a plan and pricing for {offbeatTitle}.</p>
                                </div>
                                <div className="relative mt-8 hidden space-y-3 text-xs text-white/65 md:block">
                                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#e1c48e]" /> No payment at this stage</p>
                                    <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#e1c48e]" /> A local expert will contact you</p>
                                </div>
                            </div>

                            <div className="max-h-[88vh] overflow-y-auto p-6 sm:p-8 md:p-9">
                                {success ? (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-96 flex-col items-center justify-center text-center">
                                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf2ec] text-[#1d6b55]"><CheckCircle2 className="h-8 w-8" /></span>
                                        <p className="mt-6 text-[10px] font-bold uppercase tracking-[.22em] text-[#9b7440]">Request received</p>
                                        <h3 className="mt-2 font-serif text-4xl tracking-[-.035em] text-[#17372f]">We’ll take it from here.</h3>
                                        <p className="mt-4 max-w-sm text-sm leading-6 text-[#61716c]">A travel expert will review your dates and preferences, then contact you with the next steps.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="pr-10"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9b7440]">Your preferences</p><h3 className="mt-2 font-serif text-3xl tracking-[-.03em] text-[#17372f]">A few quick details</h3></div>

                                        <div>
                                            <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#52665f]"><Users className="h-4 w-4 text-[#1d6b55]" /> Travellers</label>
                                            <div className="flex items-center rounded-2xl border border-[#17372f]/12 bg-[#f7f5ef] p-1.5">
                                                <button type="button" onClick={() => setFormData((current) => ({ ...current, numberOfPersons: Math.max(1, current.numberOfPersons - 1) }))} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#17372f] shadow-sm"><Minus className="h-4 w-4" /></button>
                                                <Input type="number" min="1" max="100" required value={formData.numberOfPersons} onChange={(event) => setFormData((current) => ({ ...current, numberOfPersons: Math.min(100, Math.max(1, Number.parseInt(event.target.value, 10) || 1)) }))} className="h-10 flex-1 border-0 bg-transparent text-center text-base font-bold shadow-none focus-visible:ring-0" />
                                                <button type="button" onClick={() => setFormData((current) => ({ ...current, numberOfPersons: Math.min(100, current.numberOfPersons + 1) }))} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#17372f] shadow-sm"><Plus className="h-4 w-4" /></button>
                                            </div>
                                        </div>

                                        <div><label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#52665f]"><Phone className="h-4 w-4 text-[#1d6b55]" /> Contact number</label><Input type="tel" required maxLength={20} autoComplete="tel" placeholder="Your active mobile number" value={formData.contactNumber} onChange={(event) => setFormData((current) => ({ ...current, contactNumber: event.target.value }))} className={fieldClass} /></div>

                                        <div><label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#52665f]"><CalendarDays className="h-4 w-4 text-[#1d6b55]" /> Tentative date</label><DatePicker selected={startDate} onChange={setDate} minDate={new Date()} dateFormat="dd/MM/yyyy" showMonthDropdown showYearDropdown dropdownMode="select" popperPlacement="bottom-start" popperClassName="z-[300]" wrapperClassName="w-full" customInput={<Input type="text" required value={dateInput} onChange={handleDateInputChange} placeholder="DD/MM/YYYY" className={fieldClass} />} /></div>

                                        <div><label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-[#52665f]"><Sparkles className="h-4 w-4 text-[#1d6b55]" /> Anything we should know? <span className="normal-case tracking-normal text-[#8a9692]">Optional</span></label><Textarea rows={3} maxLength={1000} placeholder="Dietary needs, accessibility, interests or a specific request…" value={formData.specialRequirements} onChange={(event) => setFormData((current) => ({ ...current, specialRequirements: event.target.value }))} className="min-h-24 resize-none rounded-2xl border-[#17372f]/12 bg-[#f7f5ef] px-4 py-3 shadow-none focus-visible:border-[#1d6b55]/45 focus-visible:ring-2 focus-visible:ring-[#1d6b55]/10" /></div>

                                        {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

                                        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#17372f] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#244c41] disabled:cursor-wait disabled:opacity-60">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending request…</> : <>Send my request <ArrowRight className="h-4 w-4" /></>}</button>
                                        <p className="text-center text-xs leading-5 text-[#7b8a85]">No payment required. We will confirm availability and pricing before anything else.</p>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
