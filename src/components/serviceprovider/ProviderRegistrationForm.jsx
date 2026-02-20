'use client';
import { useMemo, useState, useRef } from 'react';
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

function FileUploadCard({ label, icon: Icon, accept, error, required, onSelect }) {
    const ref = useRef(null);
    const [file, setFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const handleFile = (f) => { if (f) { setFile(f); onSelect(f); } };

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
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-5 transition-all text-center ${dragOver ? 'border-emerald-400 bg-emerald-50/50'
                        : file ? 'border-emerald-300 bg-emerald-50/30'
                            : error ? 'border-rose-300 bg-rose-50/30'
                                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50'
                    }`}
            >
                <input ref={ref} type="file" className="hidden" accept={accept} onChange={(e) => handleFile(e.target.files?.[0])} />
                {file ? (
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); onSelect(null); }}
                            className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-red-50 flex items-center justify-center transition-colors">
                            <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                        </button>
                    </div>
                ) : (
                    <div className="py-3">
                        <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500"><span className="font-semibold text-emerald-600">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
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
    const { checkAuth } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [form, setForm] = useState({
        companyName: '', companyMail: '', companyMobile: '', destinationId: '',
        address: '', instagram: '', facebook: '', licenseFile: null, idFile: null,
        availability: { trips: true, treks: true, mergers: true }, agree: false,
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [apiError, setApiError] = useState('');

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
        <div className="min-h-[100dvh] w-full flex bg-white font-sans text-gray-900 overflow-x-hidden">
            {/* LEFT: Immersive Image Panel */}
            <div className="fixed inset-0 md:relative md:w-1/2 lg:w-[55%] flex-shrink-0 bg-black z-0">
                <Image src="/images/signin.jpg" alt="Service Provider" fill className="object-cover opacity-50 md:opacity-100" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 md:bg-gradient-to-t md:from-black/80 md:via-black/30 md:to-transparent" />
                <div className="hidden md:flex flex-col justify-end absolute inset-0 p-8 lg:p-14 text-white z-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="max-w-lg mb-12">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-1 w-8 bg-emerald-400 rounded-full" />
                            <span className="text-emerald-400 text-sm font-semibold tracking-wider uppercase">Partner Program</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] mb-5 tracking-tight">
                            {rejected ? 'Resubmit &\nGet Approved' : 'Grow Your\nTravel Business'}
                        </h1>
                        <p className="text-lg text-white/80 leading-relaxed max-w-md">
                            Join 2,000+ verified service providers reaching millions of travelers across India.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-8">
                            {[{ icon: Shield, text: 'Verified Partners' }, { icon: Globe, text: '15+ Destinations' }, { icon: Sparkles, text: 'Premium Tools' }].map((b) => (
                                <div key={b.text} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                                    <b.icon className="h-4 w-4 text-emerald-400" />
                                    <span className="text-white/90">{b.text}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 flex gap-3">
                            {STEPS.map((s) => (
                                <div key={s.id}><div className={`h-2 rounded-full transition-all duration-500 ${step >= s.id ? 'w-10 bg-emerald-400' : 'w-6 bg-white/20'}`} /></div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT: Form Panel */}
            <div className="relative w-full md:w-1/2 lg:w-[45%] flex items-start md:items-center justify-center p-4 sm:p-6 md:p-8 z-10 min-h-[100dvh] overflow-y-auto">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
                    className="w-full max-w-[480px] bg-white/95 backdrop-blur-xl md:bg-white rounded-3xl md:rounded-none shadow-2xl md:shadow-none p-6 sm:p-8 border border-white/20 md:border-none my-4 md:my-0">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href="/" className="inline-block mb-5">
                            <div className="w-[130px] h-[40px] relative">
                                <Image src="/images/logo.svg" alt="BagspackGo" fill className="object-contain" />
                            </div>
                        </Link>
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                                    {rejected ? 'Resubmit Application' : 'Provider Application'}
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">{STEPS[step - 1].subtitle}</p>
                            </div>
                            <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full whitespace-nowrap">
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
                                        <div className="relative group">
                                            <select value={form.destinationId} onChange={e => update('destinationId', e.target.value)}
                                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none pl-11 font-medium appearance-none text-gray-700">
                                                <option value="">Select your operating location</option>
                                                {destinations.map(d => (<option key={d.value} value={d.value}>{d.label}</option>))}
                                            </select>
                                            <MapPin className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-500" />
                                            <ChevronRight className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90" />
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
                                    <FileUploadCard label="Business License / Registration" icon={FileText} accept=".pdf,.jpg,.png" error={errors.licenseFile} required onSelect={f => update('licenseFile', f)} />
                                    <FileUploadCard label="Owner ID Proof (Aadhaar / PAN)" icon={IdCard} accept=".pdf,.jpg,.png" error={errors.idFile} required onSelect={f => update('idFile', f)} />
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Services You Offer</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { key: 'trips', label: 'Trips', emoji: String.fromCodePoint(0x1F697) },
                                                { key: 'treks', label: 'Treks', emoji: String.fromCodePoint(0x1F3D4) },
                                                { key: 'mergers', label: 'Mergers', emoji: String.fromCodePoint(0x1F465) },
                                            ].map(s => (
                                                <motion.button key={s.key} type="button" whileTap={{ scale: 0.95 }} onClick={() => toggleAvail(s.key)}
                                                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${form.availability[s.key] ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                                                        }`}>
                                                    <span className="text-xl">{s.emoji}</span>
                                                    <span className={`text-xs font-bold ${form.availability[s.key] ? 'text-emerald-700' : 'text-gray-500'}`}>{s.label}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                    <label className={`flex items-start gap-3 rounded-2xl p-4 border-2 transition-all cursor-pointer ${form.agree ? 'border-emerald-500 bg-emerald-50/50'
                                            : errors.agree ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200 hover:border-gray-300'
                                        }`}>
                                        <input type="checkbox" checked={form.agree} onChange={e => update('agree', e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                        <span className="text-sm text-gray-600 leading-relaxed">
                                            {"I agree to BagspackGo's "}
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

                    <p className="text-center text-xs text-gray-400 mt-6">
                        {"Already a partner? "}
                        <Link href="/signin?role=provider" className="text-emerald-600 font-semibold hover:underline">Sign in</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
