'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft, User, Building2, Mail, Phone, MapPin, Globe, Shield, ShieldCheck,
    Package, Calendar, IndianRupee, Loader2, AlertTriangle, ExternalLink,
    Ban, CheckCircle2, Trash2, Eye, Star, Mountain, Car, Tent, Clock,
    Instagram, Facebook, Twitter, Youtube, CreditCard, FileText, Key,
    Plus, Copy, Edit2, ChevronDown, Download
} from 'lucide-react';

export default function AdminProviderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`/api/admin/providers/${id}`);
                const data = await res.json();
                if (data.success) setProvider(data.provider);
                else setError(data.message);
            } catch { setError('Failed to load provider'); }
            finally { setLoading(false); }
        }
        load();
    }, [id]);

    const toggleStatus = async () => {
        if (!confirm(`Are you sure you want to ${provider.isActive ? 'put on hold' : 'unhold'} this provider?`)) return;
        try {
            const res = await fetch(`/api/admin/providers/${id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !provider.isActive })
            });
            const data = await res.json();
            if (data.success) setProvider(p => ({ ...p, isActive: data.provider.isActive }));
            else alert(data.message);
        } catch { alert('Action failed'); }
    };

    const removeProvider = async () => {
        if (!confirm('CRITICAL: Permanently delete this provider? This cannot be undone.')) return;
        try {
            const res = await fetch(`/api/admin/providers/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) router.push('/admin/providers');
            else alert(data.message);
        } catch { alert('Action failed'); }
    };

    if (loading) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
            <p className="text-gray-500 text-sm">Loading provider details...</p>
        </div>
    );

    const handleViewDocument = (base64Data) => {
        if (!base64Data.startsWith('data:')) {
            window.open(base64Data, '_blank');
            return;
        }
        try {
            const arr = base64Data.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (e) {
            console.error('Error viewing document:', e);
            alert('Could not open document.');
        }
    };

    const handleDownloadDocument = (base64Data, filename) => {
        const a = document.createElement("a");
        a.href = base64Data;
        a.download = filename;
        a.click();
    };

    if (error || !provider) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
            <AlertTriangle className="w-10 h-10 text-red-400" />
            <p className="text-red-400">{error || 'Provider not found'}</p>
            <button onClick={() => router.back()} className="text-emerald-400 font-bold hover:underline text-sm">Go Back</button>
        </div>
    );

    const d = provider.details || {};
    const bs = provider.bookingStats || {};
    const fmt = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'packages', label: `Packages (${provider.packages?.length || 0})` },
        { id: 'events', label: `Events (${provider.events?.length || 0})` },
        { id: 'financials', label: 'Financials' },
        { id: 'credentials', label: 'Credentials' },
    ];

    const getInitials = (name) => {
        if (!name) return '??';
        const w = name.trim().split(/\s+/);
        return w.length >= 2 ? (w[0][0] + w[1][0]).toUpperCase() : w[0][0].toUpperCase();
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Back + Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin/providers')} className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 flex items-center justify-center transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white">{provider.username}</h1>
                        <p className="text-gray-500 text-sm">{d.companyname || 'No company set up'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={toggleStatus} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${provider.isActive ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'}`}>
                        {provider.isActive ? <><Ban size={16} /> Put On Hold</> : <><CheckCircle2 size={16} /> Remove Hold</>}
                    </button>
                    <button onClick={removeProvider} className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
            </div>

            {/* Profile Hero */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center overflow-hidden shrink-0">
                    {d.logo ? <img src={d.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl font-black text-emerald-400">{getInitials(d.companyname || provider.username)}</span>}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                        <h2 className="text-2xl font-bold text-white">{d.companyname || provider.username}</h2>
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${provider.applicationStatus === 'approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : provider.applicationStatus === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : provider.applicationStatus === 'rejected' ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-gray-700 text-gray-400'}`}>
                            {provider.applicationStatus}
                        </span>
                        {provider.isActive ? (
                            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active</span>
                        ) : (
                            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> On Hold</span>
                        )}
                    </div>
                    {d.speciality && <p className="text-emerald-400/80 text-sm font-medium mb-1">{d.speciality}</p>}
                    <p className="text-gray-500 text-sm">Joined {new Date(provider.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 shrink-0">
                    {[
                        { label: 'Packages', value: provider.packages?.length || 0, icon: Package },
                        { label: 'Bookings', value: bs.total || 0, icon: Calendar },
                        { label: 'Events', value: provider.events?.length || 0, icon: Star },
                    ].map(s => (
                        <div key={s.label} className="text-center px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700/50">
                            <s.icon size={18} className="mx-auto text-gray-500 mb-1" />
                            <p className="text-xl font-bold text-white">{s.value}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 border-b border-gray-800 pb-0 overflow-x-auto hide-scrollbar">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-5 py-3 rounded-t-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-gray-800 text-emerald-400 border border-gray-700 border-b-gray-800' : 'text-gray-500 hover:text-gray-300'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

                {/* ── OVERVIEW ── */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <Card title="Personal Information" icon={User}>
                            <InfoRow label="Full Name" value={provider.username} />
                            <InfoRow label="Email" value={provider.email} />
                            <InfoRow label="Phone" value={provider.phone} />
                            <InfoRow label="Date of Birth" value={provider.dob ? new Date(provider.dob).toLocaleDateString() : 'Not set'} />
                            <InfoRow label="Phone Verified" value={provider.isPhoneVerified ? '✅ Yes' : '❌ No'} />
                            <InfoRow label="Email Verified" value={provider.isEmailVerified ? '✅ Yes' : '❌ No'} />
                        </Card>

                        {/* Company Info */}
                        <Card title="Company Details" icon={Building2}>
                            <InfoRow label="Company Name" value={d.companyname} />
                            <InfoRow label="Company Email" value={d.companyemail} />
                            <InfoRow label="Company Phone" value={d.companymobile} />
                            <InfoRow label="Address" value={d.address} />
                            <InfoRow label="Destination ID" value={d.destinationId} />
                            <InfoRow label="Speciality" value={d.speciality} />
                        </Card>

                        {/* Bio */}
                        {d.bio && (
                            <Card title="About" icon={FileText} className="lg:col-span-2">
                                <p className="text-gray-300 text-sm leading-relaxed">{d.bio}</p>
                            </Card>
                        )}

                        {/* Social Links */}
                        <Card title="Social & Web" icon={Globe}>
                            <InfoRow label="Website" value={d.website} link />
                            <InfoRow label="Instagram" value={d.instagram} />
                            <InfoRow label="Facebook" value={d.facebook} />
                            <InfoRow label="Twitter" value={d.twitter} />
                            <InfoRow label="YouTube" value={d.youtube} />
                        </Card>

                        {/* Bank Details */}
                        <Card title="Bank / Payout Details" icon={CreditCard}>
                            <InfoRow label="Bank Name" value={d.bankName} />
                            <InfoRow label="Account Holder" value={d.accountHolderName} />
                            <InfoRow label="Account Type" value={d.accountType} />
                            <InfoRow label="Account Number" value={d.accountNumber} sensitive />
                            <InfoRow label="IFSC Code" value={d.ifscCode} />
                            <InfoRow label="PAN" value={d.panNumber} sensitive />
                            <InfoRow label="GST" value={d.gstNumber} />
                        </Card>

                        {/* Service Status */}
                        <Card title="Service Status" icon={Shield} className="lg:col-span-2">
                            <div className="grid grid-cols-3 gap-4">
                                {['trip', 'trek', 'event'].map(svc => {
                                    const paused = d.pausedServices?.[svc];
                                    return (
                                        <div key={svc} className={`p-4 rounded-xl border text-center ${paused ? 'border-amber-500/20 bg-amber-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{svc}</p>
                                            <p className={`text-sm font-bold ${paused ? 'text-amber-400' : 'text-emerald-400'}`}>{paused ? 'Paused' : 'Active'}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Documents */}
                        {(d.licenseFile || d.idFile) && (
                            <Card title="Uploaded Documents" icon={FileText} className="lg:col-span-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {d.licenseFile && (
                                        <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 group">
                                            <FileText size={20} className="text-emerald-500 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white">Business License</p>
                                                <div className="flex gap-3 mt-1.5">
                                                    <button onClick={() => handleViewDocument(d.licenseFile)} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
                                                        <Eye size={12} /> View
                                                    </button>
                                                    <button onClick={() => handleDownloadDocument(d.licenseFile, 'business_license')} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
                                                        <Download size={12} /> Download
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {d.idFile && (
                                        <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 group">
                                            <FileText size={20} className="text-blue-500 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-white">ID Document</p>
                                                <div className="flex gap-3 mt-1.5">
                                                    <button onClick={() => handleViewDocument(d.idFile)} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                                                        <Eye size={12} /> View
                                                    </button>
                                                    <button onClick={() => handleDownloadDocument(d.idFile, 'id_document')} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                                                        <Download size={12} /> Download
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* ── PACKAGES ── */}
                {activeTab === 'packages' && (
                    <div className="space-y-4">
                        {/* Add Package Button */}
                        <div className="flex justify-end relative">
                            <button onClick={() => setShowAddMenu(!showAddMenu)} className="px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                                <Plus size={16} /> Add Package <ChevronDown size={14} className={`transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
                            </button>
                            {showAddMenu && (
                                <div className="absolute right-0 top-12 z-20 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[180px]">
                                    <button onClick={() => { setShowAddMenu(false); router.push(`/admin/providers/${id}/packages/new?type=trip`); }} className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white flex items-center gap-3 transition-colors">
                                        <Car size={16} className="text-purple-400" /> Trip Package
                                    </button>
                                    <button onClick={() => { setShowAddMenu(false); router.push(`/admin/providers/${id}/packages/new?type=trek`); }} className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white flex items-center gap-3 transition-colors border-t border-gray-700/50">
                                        <Mountain size={16} className="text-blue-400" /> Trek Package
                                    </button>
                                </div>
                            )}
                        </div>

                        {(!provider.packages || provider.packages.length === 0) ? (
                            <EmptyState icon={Package} text="No packages created yet. Click 'Add Package' to create one." />
                        ) : provider.packages.map(pkg => {
                            const minPrice = pkg.pricingTiers?.length > 0 ? Math.min(...pkg.pricingTiers.map(t => parseFloat(t.price) || 0).filter(p => p > 0)) : 0;
                            const maxPrice = pkg.pricingTiers?.length > 0 ? Math.max(...pkg.pricingTiers.map(t => parseFloat(t.price) || 0)) : 0;
                            return (
                            <div key={pkg._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gray-600 transition-colors cursor-pointer group" onClick={() => router.push(`/admin/providers/${id}/packages/${pkg._id}`)}>
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${pkg.category === 'trek' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                        {pkg.category === 'trek' ? <Mountain size={18} /> : <Car size={18} />}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{pkg.name}</p>
                                        <p className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                            <span>{pkg.destination}</span>
                                            <span>{pkg.days} days</span>
                                            <span className="capitalize">{pkg.packageCategory}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                                    {minPrice > 0 && (
                                        <span className="text-sm font-bold text-emerald-400 mr-1">
                                            ₹{minPrice.toLocaleString('en-IN')}{maxPrice > minPrice ? ` – ₹${maxPrice.toLocaleString('en-IN')}` : ''}
                                        </span>
                                    )}
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${pkg.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : pkg.status === 'draft' ? 'bg-gray-700 text-gray-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                        {pkg.status}
                                    </span>
                                    {pkg.rating > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                                            <Star size={12} className="fill-amber-400" /> {pkg.rating.toFixed(1)}
                                        </span>
                                    )}
                                    <button
                                        title="Edit Package"
                                        onClick={() => router.push(`/admin/providers/${id}/packages/${pkg._id}/edit`)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        title="Duplicate as New"
                                        onClick={() => router.push(`/admin/providers/${id}/packages/new?type=${pkg.category || 'trip'}&duplicate=${pkg._id}`)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                                    >
                                        <Copy size={14} />
                                    </button>
                                    <button
                                        title="Delete"
                                        onClick={async () => {
                                            if (!confirm(`Delete package "${pkg.name}"? This cannot be undone.`)) return;
                                            setActionLoading(pkg._id);
                                            try {
                                                const res = await fetch(`/api/admin/packages?id=${pkg._id}`, { method: 'DELETE' });
                                                const data = await res.json();
                                                if (data.success) {
                                                    setProvider(p => ({ ...p, packages: p.packages.filter(p2 => p2._id !== pkg._id) }));
                                                } else alert(data.message);
                                            } catch { alert('Delete failed'); }
                                            finally { setActionLoading(null); }
                                        }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}

                {/* ── EVENTS ── */}
                {activeTab === 'events' && (
                    <div className="space-y-4">
                        {(!provider.events || provider.events.length === 0) ? (
                            <EmptyState icon={Calendar} text="No events hosted yet." />
                        ) : provider.events.map(ev => (
                            <div key={ev._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gray-600 transition-colors cursor-pointer group" onClick={() => router.push(`/admin/providers/${id}/events/${ev._id}`)}>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-white truncate group-hover:text-emerald-400 transition-colors">{ev.title}</p>
                                    <p className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                                        <span>{new Date(ev.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                        <span>{ev.location}</span>
                                        <span>{ev.bookedSlots || 0}/{ev.totalSlots || 0} slots</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                                    <span className="text-sm font-bold text-white mr-2">{fmt(ev.pricePerSlot)}<span className="text-gray-500 text-xs font-normal">/slot</span></span>
                                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${ev.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                                        {ev.status}
                                    </span>
                                    <button
                                        title="Edit Event"
                                        onClick={() => router.push(`/admin/providers/${id}/events/${ev._id}/edit`)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        title="Delete"
                                        onClick={async () => {
                                            if (!confirm(`Delete event "${ev.title}"? This cannot be undone.`)) return;
                                            setActionLoading(ev._id);
                                            try {
                                                const res = await fetch(`/api/admin/events/${ev._id}`, { method: 'DELETE' });
                                                const data = await res.json();
                                                if (data.success) {
                                                    setProvider(p => ({ ...p, events: p.events.filter(e => e._id !== ev._id) }));
                                                } else alert(data.message);
                                            } catch { alert('Delete failed'); }
                                            finally { setActionLoading(null); }
                                        }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── FINANCIALS ── */}
                {activeTab === 'financials' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Revenue', value: fmt(bs.totalRevenue), color: 'emerald' },
                                { label: 'Deposited', value: fmt(bs.deposited), color: 'blue' },
                                { label: 'Pending Payout', value: fmt(bs.pendingPayout), color: 'amber' },
                                { label: 'Total Bookings', value: bs.total || 0, color: 'gray' },
                            ].map(s => (
                                <div key={s.label} className={`p-5 rounded-xl border bg-gray-900 border-gray-800`}>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{s.label}</p>
                                    <p className="text-2xl font-black text-white">{s.value}</p>
                                </div>
                            ))}
                        </div>
                        <Card title="Booking Breakdown" icon={Calendar}>
                            <div className="grid grid-cols-3 gap-4">
                                <StatBlock label="Confirmed" value={bs.confirmed || 0} color="emerald" />
                                <StatBlock label="Pending" value={bs.pending || 0} color="amber" />
                                <StatBlock label="Cancelled" value={bs.cancelled || 0} color="red" />
                            </div>
                        </Card>
                    </div>
                )}

                {/* ── CREDENTIALS ── */}
                {activeTab === 'credentials' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Login Credentials" icon={Key}>
                            <InfoRow label="Email" value={provider.email} />
                            <InfoRow label="Phone" value={provider.phone} />
                            <InfoRow label="Password" value={provider.plainPassword || 'Not available (set before tracking)'} />
                            <InfoRow label="Login Attempts" value={String(provider.loginAttempts || 0)} />
                            <InfoRow label="Lock Until" value={provider.lockUntil ? new Date(provider.lockUntil).toLocaleString() : 'Not locked'} />
                        </Card>
                        <Card title="Account Status" icon={ShieldCheck}>
                            <InfoRow label="Application Status" value={provider.applicationStatus} />
                            <InfoRow label="Account Active" value={provider.isActive ? 'Yes' : 'No (On Hold)'} />
                            <InfoRow label="Phone Verified" value={provider.isPhoneVerified ? 'Yes' : 'No'} />
                            <InfoRow label="Email Verified" value={provider.isEmailVerified ? 'Yes' : 'No'} />
                            <InfoRow label="Created" value={new Date(provider.createdAt).toLocaleString('en-IN')} />
                            <InfoRow label="Last Updated" value={new Date(provider.updatedAt).toLocaleString('en-IN')} />
                        </Card>
                        {d.adminNotes && (
                            <Card title="Admin Notes" icon={FileText} className="lg:col-span-2">
                                <p className="text-gray-300 text-sm whitespace-pre-wrap">{d.adminNotes}</p>
                            </Card>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

/* ── Reusable UI Components ── */

function Card({ title, icon: Icon, children, className = '' }) {
    return (
        <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-6 ${className}`}>
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-800">
                {Icon && <Icon size={18} className="text-emerald-500" />}
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function InfoRow({ label, value, sensitive = false, link = false }) {
    const display = value || '—';
    return (
        <div className="flex justify-between items-start gap-4 py-1.5">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider shrink-0">{label}</span>
            {link && value ? (
                <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-400 font-medium text-right truncate max-w-[60%] hover:underline">{display}</a>
            ) : (
                <span className={`text-sm font-medium text-right truncate max-w-[60%] ${sensitive ? 'text-gray-600 font-mono' : 'text-gray-300'}`}>{display}</span>
            )}
        </div>
    );
}

function StatBlock({ label, value, color }) {
    const colors = { emerald: 'text-emerald-400', amber: 'text-amber-400', red: 'text-red-400', blue: 'text-blue-400', gray: 'text-gray-300' };
    return (
        <div className="text-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <p className={`text-2xl font-black ${colors[color] || 'text-white'}`}>{value}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{label}</p>
        </div>
    );
}

function EmptyState({ icon: Icon, text }) {
    return (
        <div className="border border-gray-800 rounded-2xl p-12 text-center bg-gray-900/50">
            <Icon size={40} className="mx-auto text-gray-700 mb-3" />
            <p className="text-gray-500 font-medium">{text}</p>
        </div>
    );
}
