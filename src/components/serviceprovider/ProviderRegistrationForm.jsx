'use client';
import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
    Building2, Mail, Phone, MapPin, Instagram, Facebook,
    FileText, IdCard, ChevronRight, ChevronLeft, AlertTriangle,
    Loader2, CheckCircle2, Upload, X, Sparkles, Shield, Globe, Map,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import destinationsData from 'src/data/data.json';

const STEPS = [
    { id: 1, title: 'Business Info', subtitle: 'Tell us about your company' },
    { id: 2, title: 'Location & Social', subtitle: 'Where do you operate?' },
    { id: 3, title: 'Documents & Services', subtitle: 'Verify your business' },
];

const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [.22, 1, .36, 1] } },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0, transition: { duration: 0.3 } }),
};

function FloatingInput({ label, icon: Icon, error, children, required }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                {Icon && <Icon className="h-3.5 w-3.5 text-emerald-500" />}
                {label}
                {required && <span className="text-rose-400">*</span>}
            </label>
            {children}
            {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-rose-500 pl-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {error}
                </motion.p>
            )}
        </div>
    );
}

function FileUploadCard({ label, icon: Icon, accept, error, required, currentFile, onSelect }) {
    const ref = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (currentFile && currentFile.type.startsWith('image/')) {
            const url = URL.createObjectURL(currentFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [currentFile]);

    const handleFile = (f) => { if (f) { onSelect(f); } };

    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-emerald-500" />
                {label}
                {required && <span className="text-rose-400">*</span>}
            </label>
            <motion.div
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => ref.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-5 transition-all text-center overflow-hidden group ${dragOver ? 'border-emerald-400 bg-emerald-50/50'
                    : currentFile ? 'border-emerald-300 bg-emerald-50/30'
                        : error ? 'border-rose-300 bg-rose-50/30'
                            : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50'
                    }`}
            >
                <input ref={ref} type="file" className="hidden" accept={accept} onChange={(e) => handleFile(e.target.files?.[0])} />
                {currentFile ? (
                    <div className="flex items-center gap-4 relative z-10 w-full h-full">
                        {previewUrl ? (
                            <div className="h-16 w-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 relative">
                                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                        )}
                        <div className="text-left min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-800 truncate">{currentFile.name}</p>
                            <p className="text-xs text-emerald-600 font-semibold mt-0.5">Uploaded • Click or drag to replace</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); onSelect(null); }}
                            className="h-9 w-9 rounded-xl bg-white/80 backdrop-blur shadow-sm hover:bg-red-50 flex items-center justify-center transition-all flex-shrink-0">
                            <X className="h-4 w-4 text-gray-600 hover:text-red-300" />
                        </button>
                    </div>
                ) : (
                    <div className="py-4 relative z-10">
                        <Upload className="h-8 w-8 text-gray-300 mx-auto mb-3 transition-transform group-hover:-translate-y-1" />
                        <p className="text-sm text-gray-500"><span className="font-semibold text-emerald-600">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1 uppercase font-medium tracking-wide">PDF, JPG, PNG up to 10MB</p>
                    </div>
                )}
            </motion.div>
            {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-rose-500 pl-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {error}
                </motion.p>
            )}
        </div>
    );
}

export default function ProviderRegistrationForm({ rejected = false }) {
    const { checkAuth, openAuthModal } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [form, setForm] = useState({
        companyName: '', companyMail: '', companyMobile: '', destinationId: '',
        address: '', instagram: '', facebook: '', licenseFile: null, idFile: null,
        availability: { trips: true, treks: true }, agree: false,
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [apiError, setApiError] = useState('');
    const [destOpen, setDestOpen] = useState(false);
    const destRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (destRef.current && !destRef.current.contains(event.target)) setDestOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const destinations = useMemo(() => {
        return (destinationsData.destinations || [])
            .filter(d => d?.value && d?.label)
            .map(d => ({ value: d.value, label: d.label }));
    }, []);

    function update(key, val) {
        setForm(prev => ({ ...prev, [key]: val }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
        if (apiError) setApiError('');
    }

    function toggleAvail(key) {
        setForm(prev => ({ ...prev, availability: { ...prev.availability, [key]: !prev.availability[key] } }));
    }

    function validateStep(s) {
        const e = {};
        if (s === 1) {
            if (!form.companyName.trim()) e.companyName = 'Required';
            if (!form.companyMail.trim()) e.companyMail = 'Required';
            else if (!/\S+@\S+\.\S+/.test(form.companyMail)) e.companyMail = 'Invalid email';
            if (!form.companyMobile.trim()) e.companyMobile = 'Required';
        }
        if (s === 2) {
            if (!form.destinationId) e.destinationId = 'Select a destination';
            if (!form.address.trim()) e.address = 'Required';
        }
        if (s === 3) {
            if (!form.licenseFile) e.licenseFile = 'Required';
            if (!form.idFile) e.idFile = 'Required';
            if (!form.agree) e.agree = 'You must agree';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function goNext() { if (validateStep(step)) { setDirection(1); setStep(s => s + 1); } }
    function goBack() { setDirection(-1); setStep(s => s - 1); }

    async function onSubmit(e) {
        e.preventDefault();
        if (!validateStep(3)) return;
        setSubmitting(true);
        setApiError('');
        try {
            const res = await fetch('/api/provider/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: form.companyName, companyMail: form.companyMail,
                    companyMobile: form.companyMobile, destinationId: form.destinationId,
                    address: form.address, instagram: form.instagram, facebook: form.facebook,
                    licenseFile: form.licenseFile ? 'uploaded' : '',
                    idFile: form.idFile ? 'uploaded' : '',
                    availability: form.availability, agree: form.agree,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                await checkAuth();
                setTimeout(() => router.replace('/serviceprovider'), 3000);
            } else {
                setApiError(data.message || 'Something went wrong.');
            }
        } catch {
            setApiError('Network error. Check your connection.');
        } finally {
            setSubmitting(false);
        }
    }

    if (submitted) {
        return (
            <div className="min-h-[100dvh] w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center border border-gray-100">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Thank you for applying. Our team will review your application within <span className="font-semibold text-emerald-600">1-2 business days</span>.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to status page...
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#FAFAFA] text-gray-900 overflow-x-hidden p-2 sm:p-4 relative -mt-5">
            {/* Elegant Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[45vh] bg-gradient-to-b from-emerald-100/60 to-transparent pointer-events-none" />
            <motion.div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-200/50 rounded-full blur-[100px] pointer-events-none" animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }} transition={{ duration: 8, repeat: Infinity }} />
            <motion.div className="absolute top-[40%] -left-32 w-80 h-80 bg-blue-100/40 rounded-full blur-[80px] pointer-events-none" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity }} />

            {/* Centered Form Wrapper */}
            <div className="relative z-10 w-full max-w-[600px] py-4">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring', damping: 25 }}
                    className="w-full bg-white rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-5 sm:p-6 border border-gray-100/80 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-emerald-50/20 pointer-events-none" />
                    <div className="relative z-10">
                        {/* Header */}
                        <div className="mb-4">
                            <Link href="/" className="inline-block mb-3">
                                <div className="w-[110px] h-[30px] relative">
                                    <Image src="/images/logo.svg" alt="bagspackgo" fill className="object-contain" />
                                </div>
                            </Link>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                                        {rejected ? 'Resubmit Application' : 'Provider Application'}
                                    </h2>
                                    <p className="text-gray-500 text-xs mt-0.5">{STEPS[step - 1].subtitle}</p>
                                </div>
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                                    {step} / {STEPS.length}
                                </span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="relative h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
                            <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                                initial={false} animate={{ width: `${(step / STEPS.length) * 100}%` }} transition={{ duration: 0.5, ease: [.22, 1, .36, 1] }} />
                        </div>

                        {/* Rejection notice */}
                        {rejected && step === 1 && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                                className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">Previous application rejected</p>
                                    <p className="text-xs text-amber-600 mt-0.5">Review your details and resubmit.</p>
                                </div>
                            </motion.div>
                        )}

                        {/* API Error */}
                        <AnimatePresence>
                            {apiError && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="mb-5 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" /> {apiError}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={step === 3 ? onSubmit : (e) => { e.preventDefault(); goNext(); }}>
                            <AnimatePresence mode="wait" custom={direction}>
                                {step === 1 && (
                                    <motion.div key="step1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                                        <FloatingInput label="Company Name" icon={Building2} error={errors.companyName} required>
                                            <div className="relative group">
                                                <input value={form.companyName} onChange={e => update('companyName', e.target.value)}
                                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none pl-11 font-medium placeholder-gray-400"
                                                    placeholder="e.g. Mountain Adventures Pvt Ltd" />
                                                <Building2 className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-500" />
                                            </div>
                                        </FloatingInput>
                                        <FloatingInput label="Business Email" icon={Mail} error={errors.companyMail} required>
                                            <div className="relative group">
                                                <input type="email" value={form.companyMail} onChange={e => update('companyMail', e.target.value)}
                                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none pl-11 font-medium placeholder-gray-400"
                                                    placeholder="company@email.com" />
                                                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-500" />
                                            </div>
                                        </FloatingInput>
                                        <FloatingInput label="Business Phone" icon={Phone} error={errors.companyMobile} required>
                                            <div className="relative group">
                                                <input inputMode="numeric" value={form.companyMobile} onChange={e => update('companyMobile', e.target.value)}
                                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none pl-11 font-medium placeholder-gray-400"
                                                    placeholder="+91 98765 43210" />
                                                <Phone className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-500" />
                                            </div>
                                        </FloatingInput>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div key="step2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                                        <FloatingInput label="Primary Destination" icon={MapPin} error={errors.destinationId} required>
                                            <div className="relative group" ref={destRef}>
                                                <div 
                                                    onClick={() => setDestOpen(!destOpen)}
                                                    className={`w-full px-4 py-3.5 bg-gray-50 border rounded-xl transition-all cursor-pointer flex items-center justify-between pl-11 group-hover:bg-white overflow-hidden ${destOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white' : 'border-gray-200 focus:border-emerald-500'}`}
                                                >
                                                    <span className={`font-medium ${form.destinationId ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        {form.destinationId ? destinations.find(d => d.value === form.destinationId)?.label : 'Select your operating location'}
                                                    </span>
                                                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${destOpen ? '-rotate-90 text-emerald-500' : 'rotate-90 group-hover:text-emerald-500'}`} />
                                                </div>
                                                <MapPin className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${destOpen ? 'text-emerald-500' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                                                
                                                <AnimatePresence>
                                                    {destOpen && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: -10 }} 
                                                            animate={{ opacity: 1, y: 0 }} 
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-50 max-h-60 overflow-y-auto"
                                                        >
                                                            {destinations.map(d => (
                                                                <div 
                                                                    key={d.value} 
                                                                    onClick={() => { update('destinationId', d.value); setDestOpen(false); }}
                                                                    className={`px-4 py-3 cursor-pointer transition-colors font-medium text-sm border-b border-gray-50 last:border-0 ${form.destinationId === d.value ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'}`}
                                                                >
                                                                    {d.label}
                                                                </div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </FloatingInput>
                                        <FloatingInput label="Business Address" icon={Map} error={errors.address} required>
                                            <textarea value={form.address} onChange={e => update('address', e.target.value)} rows={3}
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none font-medium placeholder-gray-400 resize-none"
                                                placeholder="Full address including city, state, and PIN code" />
                                        </FloatingInput>
                                        <div className="grid grid-cols-2 gap-3">
                                            <FloatingInput label="Instagram" icon={Instagram}>
                                                <div className="relative group">
                                                    <input value={form.instagram} onChange={e => update('instagram', e.target.value)}
                                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none pl-11 font-medium placeholder-gray-400 text-sm"
                                                        placeholder="@handle" />
                                                    <Instagram className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-pink-500" />
                                                </div>
                                            </FloatingInput>
                                            <FloatingInput label="Facebook" icon={Facebook}>
                                                <div className="relative group">
                                                    <input value={form.facebook} onChange={e => update('facebook', e.target.value)}
                                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none pl-11 font-medium placeholder-gray-400 text-sm"
                                                        placeholder="Page URL" />
                                                    <Facebook className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-500" />
                                                </div>
                                            </FloatingInput>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div key="step3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                                        <FileUploadCard label="Business License / Registration" icon={FileText} accept=".pdf,.jpg,.png" error={errors.licenseFile} required currentFile={form.licenseFile} onSelect={f => update('licenseFile', f)} />
                                        <FileUploadCard label="Owner ID Proof (Aadhaar / PAN)" icon={IdCard} accept=".pdf,.jpg,.png" error={errors.idFile} required currentFile={form.idFile} onSelect={f => update('idFile', f)} />
                                        <label className={`flex items-start gap-3 rounded-2xl p-4 border-2 transition-all cursor-pointer ${form.agree ? 'border-emerald-500 bg-emerald-50/50'
                                            : errors.agree ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200 hover:border-gray-300'
                                            }`}>
                                            <input type="checkbox" checked={form.agree} onChange={e => update('agree', e.target.checked)}
                                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                            <span className="text-sm text-gray-600 leading-relaxed">
                                                {"I agree to bagspackgo's "}
                                                <Link href="/terms" className="text-emerald-600 font-semibold hover:underline">Terms</Link>
                                                {" & "}
                                                <Link href="/privacy" className="text-emerald-600 font-semibold hover:underline">Privacy Policy</Link>
                                            </span>
                                        </label>
                                        {errors.agree && <p className="text-xs text-rose-500 pl-1">{errors.agree}</p>}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center gap-3 mt-7">
                                {step > 1 && (
                                    <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={goBack}
                                        className="px-5 py-3.5 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-1.5">
                                        <ChevronLeft className="h-4 w-4" /> Back
                                    </motion.button>
                                )}
                                <motion.button type="submit" disabled={submitting} whileHover={{ scale: submitting ? 1 : 1.01 }} whileTap={{ scale: submitting ? 1 : 0.98 }}
                                    className={`flex-1 py-3.5 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all ${submitting ? 'bg-emerald-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                                        }`}>
                                    {submitting ? (<><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</>)
                                        : step === 3 ? (<>{rejected ? 'Resubmit Application' : 'Submit Application'} <Sparkles className="h-4 w-4" /></>)
                                            : (<>Continue <ChevronRight className="h-5 w-5" /></>)}
                                </motion.button>
                            </div>
                        </form>

                        <p className="text-center text-xs text-gray-500 mt-4 font-medium">
                            {"Already a partner? "}
                            <button type="button" onClick={() => { localStorage.setItem('bgp_auth_state', JSON.stringify({ tab: 'provider', timestamp: Date.now() })); openAuthModal(); }} className="text-emerald-600 font-bold hover:underline cursor-pointer">Sign in</button>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
