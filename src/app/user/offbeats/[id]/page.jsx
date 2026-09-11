'use client';

import { use, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    ArrowRight,
    Bookmark,
    Calendar,
    Camera,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Compass,
    Info,
    MapPin,
    Maximize2,
    Mountain,
    Play,
    Share2,
    Sparkles,
    X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import OffbeatBookingForm from '@/components/user/offbeats/OffbeatBookingForm';
import GroupTripBookingForm from '@/components/user/offbeats/GroupTripBookingForm';
import { useOffbeatDetail, useOffbeatMedia } from '@/lib/useTripCache';

const FALLBACK_IMAGE = '/images/hero-kashmir-v3.webp';

function OffbeatDetailsSkeleton() {
    return (
        <div className="min-h-screen animate-pulse bg-[#f7f5ef]" role="status" aria-label="Loading destination">
            <div className="relative h-[82vh] min-h-[640px] max-h-[920px] overflow-hidden bg-[#17201d]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#36463f] via-[#1c2824] to-[#101513]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />
                <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
                    <div className="h-3 w-44 rounded-full bg-white/20" />
                    <div className="mt-5 h-14 w-3/4 max-w-2xl rounded-2xl bg-white/20 sm:h-20" />
                    <div className="mt-5 h-4 w-full max-w-xl rounded-full bg-white/15" />
                    <div className="mt-3 h-4 w-4/5 max-w-lg rounded-full bg-white/15" />
                    <div className="mt-7 h-12 w-44 rounded-full bg-white/20" />
                </div>
            </div>
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
                <div className="space-y-12">
                    <div className="space-y-4"><div className="h-4 w-32 rounded bg-[#17372f]/10" /><div className="h-10 w-3/5 rounded-xl bg-[#17372f]/10" /><div className="h-4 w-full rounded bg-[#17372f]/10" /><div className="h-4 w-5/6 rounded bg-[#17372f]/10" /></div>
                    <div className="grid h-80 grid-cols-2 gap-3 sm:grid-cols-4"><div className="col-span-2 row-span-2 rounded-3xl bg-[#17372f]/10" /><div className="rounded-3xl bg-[#17372f]/10" /><div className="rounded-3xl bg-[#17372f]/10" /><div className="col-span-2 rounded-3xl bg-[#17372f]/10" /></div>
                </div>
                <div className="h-80 rounded-3xl bg-[#17372f]/10" />
            </div>
            <span className="sr-only">Loading destination details</span>
        </div>
    );
}

function MediaTile({ item, index, onOpen, full = false }) {
    const previewClasses = index === 0
        ? 'col-span-2 row-span-2 min-h-64 sm:min-h-80'
        : index === 3
            ? 'col-span-2 min-h-36 sm:min-h-40'
            : 'min-h-36 sm:min-h-40';

    return (
        <button
            type="button"
            onClick={() => onOpen(item)}
            className={`group relative overflow-hidden bg-[#dfe5df] text-left ${full ? 'aspect-[4/3] rounded-2xl' : `rounded-3xl ${previewClasses}`}`}
        >
            {item.type === 'video' ? (
                <video src={item.url} muted playsInline preload="metadata" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            ) : (
                <img src={item.url} alt={`Destination gallery ${index + 1}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70 transition group-hover:opacity-90" />
            <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md transition group-hover:scale-105 group-hover:bg-black/50">
                {item.type === 'video' ? <Play className="h-4 w-4 fill-white" /> : <Maximize2 className="h-4 w-4" />}
            </span>
        </button>
    );
}

function ListPanel({ title, items, tone = 'green' }) {
    if (!items?.length) return null;
    const colors = tone === 'red'
        ? 'bg-rose-50 text-rose-700 border-rose-100'
        : tone === 'amber'
            ? 'bg-amber-50 text-amber-800 border-amber-100'
            : 'bg-[#eaf2ec] text-[#1d6b55] border-[#d6e5da]';
    return (
        <div className="rounded-3xl border border-[#17372f]/10 bg-white p-6 shadow-[0_18px_45px_-36px_rgba(23,55,47,.4)] sm:p-7">
            <h3 className="font-serif text-2xl tracking-[-0.025em] text-[#17372f]">{title}</h3>
            <ul className="mt-5 space-y-3">
                {items.map((item, index) => (
                    <li key={`${title}-${index}`} className="flex items-start gap-3 text-sm leading-6 text-[#40564f]">
                        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${colors}`}><Check className="h-3.5 w-3.5" /></span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function OffBeatDetailsPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, isAuthenticated, openAuthModal, loading: authLoading } = useAuth();
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isGroupBookingOpen, setIsGroupBookingOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [galleryPage, setGalleryPage] = useState(1);
    const [activeItineraryDay, setActiveItineraryDay] = useState(0);
    const trackedRef = useRef(false);

    const { data, isLoading, error } = useOffbeatDetail(id);
    const offbeat = data?.data || null;
    const { data: previewData, isLoading: previewLoading } = useOffbeatMedia(
        data?.success ? id : null,
        { page: 1, limit: 4 }
    );
    const { data: galleryData, isLoading: galleryLoading } = useOffbeatMedia(
        galleryOpen ? id : null,
        { page: galleryPage, limit: 12 },
        { keepPreviousData: true }
    );

    const previewMedia = previewData?.data?.media || [];
    const mediaTotal = previewData?.pagination?.total || 0;

    useEffect(() => {
        if (!isAuthenticated || !id) return;
        fetch(`/api/user/saved/check?itemId=${encodeURIComponent(id)}`, { headers: { Accept: 'application/json' } })
            .then((response) => response.json())
            .then((result) => setIsSaved(Boolean(result.success && result.isSaved)))
            .catch(() => {});
    }, [id, isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || !offbeat?._id || trackedRef.current) return;
        trackedRef.current = true;
        fetch('/api/activity/track-offbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ offbeatId: offbeat._id, heartbeat: false }),
        }).catch(() => {});
    }, [isAuthenticated, offbeat?._id]);

    useEffect(() => {
        if (authLoading || isAuthenticated || !openAuthModal) return undefined;
        const timer = window.setTimeout(() => {
            openAuthModal({ closable: false, hideTabs: true, tab: 'user' });
        }, 7000);
        return () => window.clearTimeout(timer);
    }, [authLoading, isAuthenticated, openAuthModal]);

    useEffect(() => {
        if (!galleryOpen && !selectedMedia) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, [galleryOpen, selectedMedia]);

    const askToBook = (group = false) => {
        if (!isAuthenticated && openAuthModal) {
            openAuthModal({ closable: true, hideTabs: false, tab: 'user' });
            return;
        }
        if (group) setIsGroupBookingOpen(true);
        else setIsBookingOpen(true);
    };

    const handleSaveToggle = async () => {
        if (!isAuthenticated && openAuthModal) {
            openAuthModal({ closable: true, hideTabs: false, tab: 'user' });
            return;
        }
        setSaving(true);
        try {
            const response = await fetch(isSaved ? `/api/user/saved?itemId=${encodeURIComponent(id)}` : '/api/user/saved', {
                method: isSaved ? 'DELETE' : 'POST',
                headers: isSaved ? undefined : { 'Content-Type': 'application/json' },
                body: isSaved ? undefined : JSON.stringify({ itemId: id, itemType: 'offbeat' }),
            });
            if (response.ok) setIsSaved((value) => !value);
        } finally {
            setSaving(false);
        }
    };

    const handleShare = async () => {
        const shareData = { title: offbeat?.title, text: offbeat?.shortDescription, url: window.location.href };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (error) { if (error?.name !== 'AbortError') console.error(error); }
        } else {
            await navigator.clipboard.writeText(window.location.href);
        }
    };

    if (isLoading) return <OffbeatDetailsSkeleton />;

    if (error || !offbeat || !data?.success) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f5ef] px-4 text-center text-[#17372f]">
                <Compass className="mb-5 h-10 w-10 text-[#9b7440]" />
                <h1 className="font-serif text-4xl tracking-[-0.035em]">This trail is not available</h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#61716c]">The destination may have been removed or is not published right now.</p>
                <Link href="/user/offbeats" className="mt-7 rounded-full bg-[#17372f] px-6 py-3 text-sm font-bold text-white">Explore offbeats</Link>
            </div>
        );
    }

    const heroImage = offbeat.coverPhoto || FALLBACK_IMAGE;
    const itinerary = offbeat.itinerary || [];
    const activeDay = itinerary[activeItineraryDay];

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f7f5ef] pb-20 text-[#17372f]">
            <section className="relative isolate h-[82vh] min-h-[640px] max-h-[920px] overflow-hidden bg-[#111816] text-white">
                <img src={heroImage} alt={offbeat.title} fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/60 to-[#0f1014]/35 md:hidden" />
                <div
                    className="absolute inset-0 hidden md:block"
                    style={{ background: 'linear-gradient(90deg, rgba(15,16,20,0.78) 0%, rgba(15,16,20,0.48) 27%, rgba(15,16,20,0.14) 48%, transparent 66%)' }}
                />
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 via-black/10 to-transparent" />

                <div className="absolute left-4 right-4 top-24 z-20 mx-auto flex max-w-7xl items-center justify-between sm:left-6 sm:right-6 lg:left-8 lg:right-8">
                    <button type="button" onClick={() => router.back()} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-black/35"><ArrowLeft className="h-4 w-4" /> Back</button>
                    <div className="flex gap-2">
                        <button type="button" onClick={handleShare} aria-label="Share destination" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/20 backdrop-blur-md transition hover:bg-black/35"><Share2 className="h-4 w-4" /></button>
                        <button type="button" onClick={handleSaveToggle} disabled={saving} aria-label={isSaved ? 'Remove saved destination' : 'Save destination'} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/20 backdrop-blur-md transition hover:bg-black/35 disabled:opacity-50"><Bookmark className={`h-4 w-4 ${isSaved ? 'fill-white' : ''}`} /></button>
                    </div>
                </div>

                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-12 pt-40 sm:px-6 sm:pb-16 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-3xl">
                        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#e1c48e]"><Sparkles className="h-4 w-4" /> Quietly extraordinary</p>
                        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[.94] tracking-[-0.045em] sm:text-6xl lg:text-7xl">{offbeat.title}</h1>
                        <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-white/80"><MapPin className="h-4 w-4 text-[#e1c48e]" /> {offbeat.destination}{offbeat.region ? ` · ${offbeat.region}` : ''}</p>
                        <p className="mt-5 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">{offbeat.shortDescription}</p>
                        <button type="button" onClick={() => askToBook(false)} className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#17372f] shadow-xl transition hover:-translate-y-0.5 hover:bg-[#f7f5ef]">Plan this escape <ArrowRight className="h-4 w-4" /></button>
                    </motion.div>
                </div>
            </section>

            <main className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8 lg:py-16">
                <div className="min-w-0 space-y-16 lg:space-y-20">
                    <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }}>
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9b7440]">The place, at a glance</p>
                        <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-[1.02] tracking-[-0.035em] sm:text-5xl">Far from the usual route. Close to what matters.</h2>
                        <div className="mt-7 max-w-3xl whitespace-pre-wrap text-base leading-8 text-[#52665f]">{offbeat.description}</div>
                    </motion.section>

                    {(previewLoading || mediaTotal > 0) && (
                        <section>
                            <div className="mb-7 flex items-end justify-between gap-4">
                                <div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9b7440]">Seen on the trail</p><h2 className="mt-2 font-serif text-4xl tracking-[-0.035em]">Gallery</h2></div>
                                {!previewLoading && mediaTotal > 0 && <button type="button" onClick={() => { setGalleryPage(1); setGalleryOpen(true); }} className="hidden items-center gap-2 rounded-full border border-[#17372f]/15 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition hover:bg-[#edf3ee] sm:inline-flex"><Camera className="h-4 w-4" /> View all {mediaTotal}</button>}
                            </div>
                            {previewLoading ? (
                                <div className="grid h-[420px] animate-pulse grid-cols-2 grid-rows-2 gap-3 sm:grid-cols-4"><div className="col-span-2 row-span-2 rounded-3xl bg-[#17372f]/10" /><div className="rounded-3xl bg-[#17372f]/10" /><div className="rounded-3xl bg-[#17372f]/10" /><div className="col-span-2 rounded-3xl bg-[#17372f]/10" /></div>
                            ) : (
                                <div className="grid grid-cols-2 auto-rows-fr gap-3 sm:grid-cols-4">{previewMedia.map((item, index) => <MediaTile key={`${item.type}-${index}`} item={item} index={index} onOpen={setSelectedMedia} />)}</div>
                            )}
                            {!previewLoading && mediaTotal > 0 && <button type="button" onClick={() => { setGalleryPage(1); setGalleryOpen(true); }} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#17372f]/15 bg-white px-4 py-3 text-sm font-bold sm:hidden"><Camera className="h-4 w-4" /> View all {mediaTotal}</button>}
                        </section>
                    )}

                    {offbeat.highlights?.length > 0 && (
                        <section>
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9b7440]">Worth the detour</p>
                            <h2 className="mt-2 font-serif text-4xl tracking-[-0.035em]">Experience highlights</h2>
                            <div className="mt-7 grid gap-4 sm:grid-cols-2">{offbeat.highlights.map((item, index) => <div key={index} className="flex items-start gap-4 rounded-3xl border border-[#17372f]/10 bg-white p-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf2ec] text-[#1d6b55]"><Mountain className="h-4 w-4" /></span><p className="pt-1 text-sm leading-6 text-[#40564f]">{item}</p></div>)}</div>
                        </section>
                    )}

                    {itinerary.length > 0 && (
                        <section>
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9b7440]">A simple way through</p>
                            <h2 className="mt-2 font-serif text-4xl tracking-[-0.035em]">Suggested itinerary</h2>
                            <div className="mt-7 overflow-hidden rounded-[2rem] border border-[#17372f]/10 bg-white shadow-[0_24px_60px_-48px_rgba(23,55,47,.55)] lg:grid lg:grid-cols-[250px_1fr]">
                                <div className="flex gap-2 overflow-x-auto border-b border-[#17372f]/10 bg-[#edf3ee] p-3 lg:flex-col lg:border-b-0 lg:border-r lg:p-4">
                                    {itinerary.map((day, index) => <button key={index} type="button" onClick={(event) => { setActiveItineraryDay(index); event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }} className={`min-w-44 rounded-2xl px-4 py-3 text-left transition lg:min-w-0 ${activeItineraryDay === index ? 'bg-[#17372f] text-white shadow-lg' : 'text-[#52665f] hover:bg-white/70'}`}><span className="text-[10px] font-bold uppercase tracking-[.18em] opacity-60">Day {index + 1}</span><span className="mt-1 block truncate text-sm font-bold">{typeof day === 'object' ? day.title || `Explore day ${index + 1}` : `Explore day ${index + 1}`}</span></button>)}
                                </div>
                                <div className="min-h-72 p-6 sm:p-8">
                                    <AnimatePresence mode="wait"><motion.div key={activeItineraryDay} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-[#9b7440]"><Calendar className="h-4 w-4" /> Day {activeItineraryDay + 1}</p><h3 className="mt-3 font-serif text-3xl tracking-[-0.025em]">{typeof activeDay === 'object' ? activeDay.title || 'Explore at your pace' : 'Explore at your pace'}</h3>{typeof activeDay === 'string' ? <p className="mt-5 leading-7 text-[#52665f]">{activeDay}</p> : <ul className="mt-6 space-y-4">{activeDay?.points?.map((point, index) => <li key={index} className="flex items-start gap-3 text-sm leading-6 text-[#52665f]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9b7440]" />{point}</li>)}</ul>}</motion.div></AnimatePresence>
                                </div>
                            </div>
                        </section>
                    )}

                    {(offbeat.whatsIncluded?.length > 0 || offbeat.whatsExcluded?.length > 0 || offbeat.whatToBring?.length > 0 || offbeat.restrictions?.length > 0) && (
                        <section><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9b7440]">Know before you go</p><h2 className="mt-2 font-serif text-4xl tracking-[-0.035em]">The essentials</h2><div className="mt-7 grid gap-5 sm:grid-cols-2"><ListPanel title="What's included" items={offbeat.whatsIncluded} /><ListPanel title="Not included" items={offbeat.whatsExcluded} tone="red" /><ListPanel title="What to bring" items={offbeat.whatToBring} /><ListPanel title="Restrictions" items={offbeat.restrictions} tone="amber" /></div></section>
                    )}

                    {offbeat.faqs?.length > 0 && (
                        <section><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9b7440]">Good to know</p><h2 className="mt-2 font-serif text-4xl tracking-[-0.035em]">Frequently asked questions</h2><div className="mt-7 divide-y divide-[#17372f]/10 rounded-3xl border border-[#17372f]/10 bg-white px-5 sm:px-7">{offbeat.faqs.map((faq, index) => <details key={index} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[#17372f]"><span>{faq.question}</span><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf3ee] transition group-open:rotate-45">+</span></summary><p className="max-w-2xl pb-1 pt-4 text-sm leading-7 text-[#61716c]">{faq.answer}</p></details>)}</div></section>
                    )}
                </div>

                <aside className="min-w-0">
                    <div className="sticky top-24 space-y-5">
                        <div className="overflow-hidden rounded-[2rem] bg-[#17372f] p-7 text-white shadow-[0_28px_70px_-38px_rgba(23,55,47,.75)]">
                            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#e1c48e]">Made personal</p>
                            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-[-.025em]">Visit it your way.</h2>
                            <p className="mt-4 text-sm leading-6 text-white/68">Tell us your dates and preferences. We will help shape the route and connect the local details.</p>
                            <button type="button" onClick={() => askToBook(false)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-bold text-[#17372f] transition hover:bg-[#f7f5ef]">Plan a personal trip <ArrowRight className="h-4 w-4" /></button>
                        </div>
                        <button type="button" onClick={() => askToBook(true)} className="w-full rounded-[2rem] border border-[#17372f]/10 bg-white p-6 text-left shadow-[0_18px_50px_-40px_rgba(23,55,47,.45)] transition hover:-translate-y-0.5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf3ee] text-[#1d6b55]"><Calendar className="h-4 w-4" /></span><span className="mt-4 block font-serif text-2xl tracking-[-.02em]">Prefer a group trip?</span><span className="mt-2 block text-sm leading-6 text-[#61716c]">Register your interest and we will let you know when a group is forming.</span><span className="mt-4 flex items-center gap-2 text-sm font-bold text-[#1d6b55]">Submit interest <ArrowRight className="h-4 w-4" /></span></button>
                        {(offbeat.pickupPoints?.length > 0 || offbeat.dropoffPoints?.length > 0) && <div className="rounded-3xl border border-[#17372f]/10 bg-[#ece9df] p-6"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#9b7440]"><Clock3 className="h-4 w-4" /> Meeting details</p>{offbeat.pickupPoints?.slice(0, 3).map((point, index) => <div key={`pickup-${index}`} className="mt-4"><p className="text-sm font-bold">{point.location}</p>{point.time && <p className="mt-1 text-xs text-[#61716c]">Pickup · {point.time}</p>}</div>)}</div>}
                    </div>
                </aside>
            </main>

            <OffbeatBookingForm isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} offbeatId={offbeat._id} offbeatTitle={offbeat.title} user={user} />
            <GroupTripBookingForm isOpen={isGroupBookingOpen} onClose={() => setIsGroupBookingOpen(false)} offbeatId={offbeat._id} offbeatTitle={offbeat.title} user={user} />

            <AnimatePresence>
                {galleryOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[220] overflow-y-auto bg-[#07110e]/96 px-4 py-6 text-white backdrop-blur-xl sm:px-6 sm:py-8" role="dialog" aria-modal="true" aria-label="Full destination gallery">
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-7 flex items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#e1c48e]">{offbeat.destination}</p><h2 className="mt-2 font-serif text-3xl tracking-[-.03em] sm:text-4xl">Full gallery</h2></div><button type="button" onClick={() => setGalleryOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 transition hover:bg-white/20" aria-label="Close gallery"><X className="h-5 w-5" /></button></div>
                            {galleryLoading && !galleryData ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"><div className="aspect-[4/3] animate-pulse rounded-2xl bg-white/10" /><div className="aspect-[4/3] animate-pulse rounded-2xl bg-white/10" /><div className="aspect-[4/3] animate-pulse rounded-2xl bg-white/10" /></div> : <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{(galleryData?.data?.media || []).map((item, index) => <MediaTile key={`${galleryPage}-${item.type}-${index}`} item={item} index={index} onOpen={setSelectedMedia} full />)}{galleryLoading && <div className="absolute inset-0 rounded-2xl bg-black/35" />}</div>}
                            {(galleryData?.pagination?.totalPages || 0) > 1 && <div className="mt-8 flex items-center justify-center gap-4"><button type="button" onClick={() => setGalleryPage((page) => Math.max(1, page - 1))} disabled={galleryPage === 1} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10 disabled:opacity-35"><ChevronLeft className="h-4 w-4" /> Previous</button><span className="text-sm text-white/55">{galleryPage} / {galleryData.pagination.totalPages}</span><button type="button" onClick={() => setGalleryPage((page) => Math.min(galleryData.pagination.totalPages, page + 1))} disabled={!galleryData.pagination.hasMore} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm font-bold transition hover:bg-white/10 disabled:opacity-35">Next <ChevronRight className="h-4 w-4" /></button></div>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedMedia && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[240] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md" onClick={() => setSelectedMedia(null)} role="dialog" aria-modal="true" aria-label="Media viewer">
                        <button type="button" onClick={() => setSelectedMedia(null)} className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white" aria-label="Close media"><X className="h-5 w-5" /></button>
                        {selectedMedia.type === 'video' ? <video src={selectedMedia.url} controls autoPlay playsInline className="max-h-[88vh] max-w-full rounded-2xl" onClick={(event) => event.stopPropagation()} /> : <img src={selectedMedia.url} alt="Destination gallery full view" className="max-h-[88vh] max-w-full rounded-2xl object-contain" onClick={(event) => event.stopPropagation()} />}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
