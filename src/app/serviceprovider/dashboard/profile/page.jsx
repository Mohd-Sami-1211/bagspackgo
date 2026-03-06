'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin,
    Mail,
    Phone,
    Globe,
    Instagram,
    Facebook,
    Twitter,
    Youtube,
    Award,
    Tent,
    Car,
    PartyPopper,
    ShieldCheck,
    Building,
    ArrowLeft,
    Calendar,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProviderProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await fetch('/api/provider/profile');
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.profile);
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-emerald-600 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center flex-col gap-4">
                <p className="text-gray-500">Could not find profile data.</p>
                <button onClick={() => router.back()} className="text-emerald-600 font-bold hover:underline">Go Back</button>
            </div>
        );
    }

    // Calculate year registered
    const memberSince = profile.createdAt ? new Date(profile.createdAt).getFullYear() : '2024';

    const getInitials = (name) => {
        if (!name) return "??";
        const words = name.trim().split(/\s+/);
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return words[0][0].toUpperCase();
    };

    const initials = getInitials(profile.companyname);

    // Animation variants
    const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24">
            {/* 1. Hero Cover Section */}
            <div className="relative h-[280px] md:h-[340px] w-full bg-gradient-to-br from-emerald-800 via-emerald-600 to-teal-700 overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/2 pointer-events-none" />

                {/* BagspackGo branding — text watermark, always visible */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gap-2 px-4">
                    {/* Decorative line */}
                    <div className="w-10 h-0.5 bg-white/30 rounded-full mb-1" />
                    {/* Brand name */}
                    <span className="text-white/60 text-2xl md:text-4xl font-black tracking-[0.15em] uppercase">
                        bagspack<span className="text-emerald-300/80">go</span>
                    </span>
                    <p className="text-white/30 text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mt-1">
                        Service Provider
                    </p>
                    <div className="w-10 h-0.5 bg-white/30 rounded-full mt-1" />
                </div>

                <div className="absolute top-6 left-6 z-10">
                    <button
                        onClick={() => router.back()}
                        className="bg-white/10 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-white/20 transition-all border border-white/20"
                    >
                        <ArrowLeft size={20} />
                    </button>
                </div>
            </div>

            {/* 2. Main Profile Content Container */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32 relative z-10">

                {/* Top Header Card */}
                <motion.div
                    initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-8"
                >
                    {/* Logo Avatar */}
                    <div className="relative -mt-24 md:-mt-32 shrink-0">
                        <div className="w-40 h-40 md:w-52 md:h-52 bg-white rounded-full p-2.5 shadow-xl">
                            <div className="w-full h-full rounded-full overflow-hidden bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center relative">
                                {profile.logo ? (
                                    <img src={profile.logo} alt={profile.companyname} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-6xl font-black text-emerald-600 tracking-tighter">{initials}</span>
                                )}
                                {profile.applicationStatus === 'approved' && (
                                    <div className="absolute bottom-3 right-3 bg-white rounded-full p-1 shadow-md">
                                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Core Info */}
                    <div className="flex-1 text-center md:text-left pb-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                                {profile.companyname || profile.name || "Setup Your Profile"}
                            </h1>
                            {profile.applicationStatus === 'approved' && (
                                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 w-fit mx-auto md:mx-0 flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-emerald-500" /> Verified Partner
                                </span>
                            )}
                        </div>

                        <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2 text-lg mb-4">
                            <MapPin size={18} className="text-emerald-500" />
                            {profile.address ? profile.address.split(',')[0] : 'Location not set'}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-semibold text-gray-600">
                            <span className="flex items-center gap-1.5 bg-gray-50 px-4 py-2 rounded-xl">
                                <Calendar size={16} className="text-gray-400" /> Member since {memberSince}
                            </span>
                            <Link href="/serviceprovider/dashboard/settings?edit=true" className="bg-emerald-600 text-white px-5 py-2 rounded-xl shadow-md hover:bg-emerald-700 transition hover:-translate-y-0.5">
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* 3. Grid Layout for Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (Main Info) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* About Section */}
                        <motion.div
                            initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
                        >
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Building className="text-emerald-500" /> About the Company
                            </h3>
                            <div className="prose prose-emerald max-w-none text-gray-600 leading-relaxed font-normal">
                                {profile.bio ? (
                                    <p>{profile.bio}</p>
                                ) : (
                                    <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
                                        <p className="text-gray-500 mb-3">No biography provided yet.</p>
                                        <Link href="/serviceprovider/dashboard/settings?edit=true" className="text-emerald-600 font-bold hover:underline text-sm">Add Company Bio</Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Specialties & Stats */}
                        <motion.div
                            initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5, delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {/* Speciality Card */}
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10"><Award size={100} /></div>
                                <h4 className="text-emerald-100 font-bold uppercase tracking-wider text-xs mb-2">Core Speciality</h4>
                                <p className="text-2xl font-black leading-tight mb-4 relative z-10">
                                    {profile.speciality || "General Travel & Tourism"}
                                </p>
                                <div className="w-12 h-1 bg-white/30 rounded-full"></div>
                            </div>

                            {/* Stats Grid */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 grid grid-cols-2 gap-4">
                                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex flex-col items-center justify-center text-center">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2"><Tent size={18} /></div>
                                    <span className="text-3xl font-black text-blue-900">{profile.totalTreks || 0}</span>
                                    <span className="text-xs font-bold text-blue-600/70 uppercase tracking-widest mt-1">Treks</span>
                                </div>
                                <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 flex flex-col items-center justify-center text-center">
                                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2"><Car size={18} /></div>
                                    <span className="text-3xl font-black text-purple-900">{profile.totalTrips || 0}</span>
                                    <span className="text-xs font-bold text-purple-600/70 uppercase tracking-widest mt-1">Trips</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column (Sidebar Details) */}
                    <div className="space-y-8">

                        {/* Contact Details Card */}
                        <motion.div
                            initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
                        >
                            <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Contact Information</h3>
                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-gray-50 rounded-xl text-gray-500 shrink-0"><Mail size={18} /></div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                                        <p className="font-semibold text-gray-800 truncate">{profile.companyemail || profile.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-gray-50 rounded-xl text-gray-500 shrink-0"><Phone size={18} /></div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                                        <p className="font-semibold text-gray-800">{profile.companymobile || profile.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-gray-50 rounded-xl text-gray-500 shrink-0"><Globe size={18} /></div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Website</p>
                                        {profile.website ? (
                                            <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-600 hover:underline truncate block">
                                                {profile.website}
                                            </a>
                                        ) : (
                                            <p className="font-medium text-gray-400 italic">Not specified</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Social Media Card */}
                        <motion.div
                            initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5, delay: 0.4 }}
                            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
                        >
                            <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Connect</h3>
                            <div className="flex flex-wrap gap-3">
                                {profile.instagram && (
                                    <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-100 hover:scale-105 transition-all">
                                        <Instagram size={20} />
                                    </a>
                                )}
                                {profile.facebook && (
                                    <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 hover:scale-105 transition-all">
                                        <Facebook size={20} />
                                    </a>
                                )}
                                {profile.twitter && (
                                    <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl hover:bg-sky-100 hover:scale-105 transition-all">
                                        <Twitter size={20} />
                                    </a>
                                )}
                                {profile.youtube && (
                                    <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-12 h-12 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 hover:scale-105 transition-all">
                                        <Youtube size={20} />
                                    </a>
                                )}

                                {(!profile.instagram && !profile.facebook && !profile.twitter && !profile.youtube) && (
                                    <p className="text-gray-400 text-sm font-medium italic w-full">No social media linked.</p>
                                )}
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
}
