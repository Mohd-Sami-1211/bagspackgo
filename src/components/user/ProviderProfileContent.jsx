'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Mountain,
  Navigation,
  Share2,
  Sparkles,
  Star,
  Ticket,
  Users,
} from 'lucide-react';
import { useProviderProfile } from '@/lib/useTripCache';
import { packageHeroFor } from '@/lib/packageHero';
import { providerProfilePath } from '@/lib/providerSlug';

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(value) {
  if (!value) return 'Date to be announced';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date to be announced';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function eventState(event, now) {
  const startDate = new Date(event.date);
  if (Number.isNaN(startDate.getTime())) return 'recent';

  // Event dates are entered as calendar dates, not precise start times. Compare
  // local day boundaries so today's event does not become "recent" at midnight.
  startDate.setHours(0, 0, 0, 0);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const endExclusive = startDate.getTime() + Math.max(1, Number(event.duration || 1)) * DAY_MS;

  return today.getTime() < endExclusive ? 'live' : 'recent';
}

function packagePrice(pkg) {
  if (!pkg.pricingTiers?.length) return 0;
  return Math.min(...pkg.pricingTiers.map((tier) => {
    const price = Number(tier.price || 0);
    return price * (1 - Number(tier.discount || 0) / 100);
  }));
}

function SectionHeading({ eyebrow, title, description, icon: Icon, count }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
          <Icon className="h-4 w-4" /> {eyebrow}
        </p>
        <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {Number.isFinite(count) && (
        <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500">
          {count}
        </span>
      )}
    </div>
  );
}

export function ProviderProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#f5f8f6] pb-20">
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
          <div className="h-44 bg-slate-200 sm:h-56 lg:h-64" />
          <div className="p-6 sm:p-8">
          <div className="-mt-16 flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="h-28 w-28 rounded-full border-4 border-white bg-slate-100" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-28 rounded bg-emerald-100" />
              <div className="h-9 w-2/3 max-w-md rounded-lg bg-slate-100" />
              <div className="h-4 w-full max-w-2xl rounded bg-slate-100" />
              <div className="h-4 w-3/4 max-w-xl rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-16 rounded-2xl bg-slate-50" />)}
          </div>
          </div>
        </div>
        <div className="mt-10 h-8 w-52 rounded bg-slate-100" />
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="h-44 bg-slate-100" />
              <div className="space-y-3 p-5"><div className="h-5 w-3/4 rounded bg-slate-100" /><div className="h-4 w-1/2 rounded bg-slate-100" /><div className="h-10 rounded-xl bg-slate-100" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PackageCard({ pkg, providerId, onNavigate }) {
  const isTrek = pkg.category === 'trek';
  const price = packagePrice(pkg);
  const href = isTrek
    ? `/user/trek/guidelist/trekdetails/${providerId}?trekId=${pkg._id}`
    : `/trip/${pkg._id}`;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_45px_-38px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_55px_-38px_rgba(15,23,42,0.6)]">
      <button type="button" onClick={() => onNavigate(href)} className="block w-full text-left">
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <img
            src={pkg.coverImage}
            alt={pkg.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            onError={(event) => { event.currentTarget.src = packageHeroFor(pkg._id); }}
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 backdrop-blur-md">
            {isTrek ? pkg.trekLevel || 'Trek' : pkg.packageCategory || 'Trip'}
          </span>
          <span className="absolute bottom-4 left-4 rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            {pkg.days} day{pkg.days === 1 ? '' : 's'}
          </span>
        </div>
        <div className="p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">{isTrek ? 'Trek package' : 'Trip package'}</p>
          <h3 className="mt-1.5 line-clamp-2 text-lg font-black leading-snug text-slate-950">{pkg.name}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-4 w-4 text-emerald-600" /> {pkg.destination}</p>
          <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Starting from</p>
              <p className="mt-1 text-xl font-black text-slate-950">{price > 0 ? `₹${Math.round(price).toLocaleString('en-IN')}` : 'View price'}</p>
            </div>
            <span className="flex h-10 items-center gap-1 rounded-full bg-emerald-700 px-4 text-xs font-bold text-white">
              View <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

function EventCard({ event, state, onNavigate }) {
  const isLive = state === 'live';
  return (
    <article className={`group overflow-hidden rounded-3xl border bg-white shadow-[0_18px_45px_-38px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 ${isLive ? 'border-emerald-300 ring-4 ring-emerald-50' : 'border-slate-200'}`}>
      <button type="button" onClick={() => onNavigate(`/user/events/eventdetails/${event._id}`)} className="block w-full text-left">
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <img src={event.poster} alt={event.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
          <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${isLive ? 'bg-rose-500 text-white' : 'bg-white/90 text-slate-700'}`}>
            {isLive ? '● Live' : 'Recent'}
          </span>
          <p className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-bold text-white"><CalendarDays className="h-4 w-4" /> {formatDate(event.date)}</p>
        </div>
        <div className="p-5">
          <h3 className="line-clamp-2 text-lg font-black leading-snug text-slate-950">{event.title}</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-500">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-600" /> {event.location || event.destination}</p>
            <p className="flex items-center gap-2"><Users className="h-4 w-4 text-emerald-600" /> {event.slotsLeft > 0 ? `${event.slotsLeft} slots available` : 'Fully booked'}</p>
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-lg font-black text-slate-950">{event.pricePerSlot > 0 ? `₹${event.pricePerSlot.toLocaleString('en-IN')}` : 'Free'}</p>
            <span className="flex items-center gap-1 text-xs font-black text-emerald-700">View event <ChevronRight className="h-4 w-4" /></span>
          </div>
        </div>
      </button>
    </article>
  );
}

export default function ProviderProfileContent({ providerId, providerSlug, initialData = null }) {
  const router = useRouter();
  const identifier = providerSlug || providerId;
  const { data, isLoading, error, mutate } = useProviderProfile(identifier, {
    fallbackData: initialData || undefined,
    revalidateOnMount: !initialData,
  });
  const [showAllTrips, setShowAllTrips] = useState(false);
  const [showAllTreks, setShowAllTreks] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmit, setRatingSubmit] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const provider = data?.provider;
  const packages = data?.packages || [];
  const events = data?.events || [];
  const feedbacks = data?.feedbacks || [];

  const tripPackages = useMemo(() => packages.filter((pkg) => pkg.category === 'trip'), [packages]);
  const trekPackages = useMemo(() => packages.filter((pkg) => pkg.category === 'trek'), [packages]);
  const liveEvents = useMemo(() => events.filter((event) => eventState(event, now) === 'live'), [events, now]);
  const recentEvents = useMemo(() => events
    .filter((event) => eventState(event, now) === 'recent')
    .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()), [events, now]);

  if (isLoading && !data) return <ProviderProfileSkeleton />;

  if (error || !provider) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#f5f8f6] px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Award className="h-7 w-7" /></div>
        <h1 className="mt-5 text-2xl font-black text-slate-950">Provider not found</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">This profile may have moved or is not publicly available.</p>
        <button type="button" onClick={() => router.push('/')} className="mt-6 rounded-full bg-emerald-700 px-6 py-3 text-sm font-bold text-white">Back to home</button>
      </div>
    );
  }

  const navigate = (href) => router.push(href);
  const canonicalPath = providerProfilePath(provider.name, provider._id);

  const handleShare = async () => {
    const url = `${window.location.origin}${canonicalPath}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${provider.name} on bagspackgo`, text: `Explore journeys hosted by ${provider.name}.`, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch (shareError) {
      if (shareError?.name !== 'AbortError') console.error('Share failed:', shareError);
    }
  };

  const handleSubmitFeedback = async (event) => {
    event.preventDefault();
    if (!ratingSubmit || !feedbackText.trim() || submittingFeedback) return;
    setSubmittingFeedback(true);
    try {
      const response = await fetch(`/api/user/provider/${provider._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: ratingSubmit, comment: feedbackText.trim() }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || 'Unable to submit review');
      await mutate({ ...data, feedbacks: [payload.review, ...feedbacks] }, false);
      setRatingSubmit(0);
      setFeedbackText('');
    } catch (submitError) {
      alert(submitError.message || 'Unable to submit review');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const stats = [
    { label: 'Rating', value: provider.rating > 0 ? provider.rating.toFixed(1) : 'New', icon: Star },
    { label: 'Trips', value: tripPackages.length, icon: Navigation },
    { label: 'Treks', value: trekPackages.length, icon: Mountain },
    { label: 'Events', value: events.length, icon: Ticket },
  ];

  const aboutBio = provider.bio?.trim() || `${provider.name} creates thoughtfully planned trips, treks and local experiences.`;

  const renderPackages = (items, showAll) => (showAll ? items : items.slice(0, 6)).map((pkg) => (
    <PackageCard key={pkg._id} pkg={pkg} providerId={provider._id} onNavigate={navigate} />
  ));

  return (
    <div className="min-h-screen bg-[#f5f8f6] pb-20 text-slate-900">
      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-9 lg:px-8">
        <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_28px_80px_-56px_rgba(15,23,42,0.7)] sm:rounded-[2.25rem]">
          <div className="relative h-44 overflow-hidden bg-slate-200 sm:h-56 lg:h-64">
            <img src={provider.coverPhoto} alt="" fetchPriority="high" className="h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 via-black/5 to-black/20" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-6">
              <button type="button" onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/85 text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-emerald-700" aria-label="Go back">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={handleShare} className="flex h-10 items-center gap-2 rounded-full border border-white/80 bg-white/85 px-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-emerald-700 sm:px-4" aria-label="Share profile">
                <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Share profile</span>
              </button>
            </div>
          </div>

          <div className="relative px-5 pb-6 sm:px-8 sm:pb-8 lg:px-10 lg:pb-10">
            <div className="relative -mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:gap-7">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_14px_34px_-16px_rgba(15,23,42,0.55)] sm:h-28 sm:w-28">
                <img src={provider.logo} alt={`${provider.name} logo`} className="h-full w-full rounded-full object-contain" />
              </div>
              <div className="min-w-0 flex-1 pb-1">
                <h1 className="break-words text-3xl font-black leading-[1.05] tracking-[-0.035em] text-slate-950 sm:text-5xl">{provider.name}</h1>
              </div>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <div className="flex flex-wrap gap-2">
                  {provider.location && <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600"><MapPin className="h-3.5 w-3.5 text-emerald-600" /> {provider.location}</span>}
                  {provider.speciality && <span className="flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"><Sparkles className="h-3.5 w-3.5" /> {provider.speciality}</span>}
                </div>
                <p className="mt-4 line-clamp-2 max-w-3xl whitespace-pre-line break-words text-sm leading-7 text-slate-600 sm:text-[15px]">{aboutBio}</p>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/70 px-4 py-2 text-xs font-bold text-emerald-800 lg:flex">
                <Award className="h-4 w-4" /> Trusted on bagspackgo
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6 sm:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-slate-100 bg-[#f8faf9] p-4 transition hover:border-emerald-100 hover:bg-emerald-50/40">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400"><Icon className="h-4 w-4 text-emerald-600" /> {label}</div>
                <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
              </div>
            ))}
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_-48px_rgba(15,23,42,0.55)] sm:rounded-[2rem]">
          <div className="grid lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]">
            <div className="p-6 sm:p-8 lg:p-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Meet your host</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">About {provider.name}</h2>
              <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-slate-600 sm:text-[15px]">{aboutBio}</p>
            </div>
            <div className="border-t border-slate-100 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/60 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <div className="space-y-5">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-5 w-5" /></span>
                  <div><p className="font-black text-slate-900">Thoughtfully planned</p><p className="mt-0.5 text-xs leading-5 text-slate-500">Journeys designed around meaningful local experiences.</p></div>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700"><MapPin className="h-5 w-5" /></span>
                  <div><p className="font-black text-slate-900">Local expertise</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{provider.speciality || provider.location || 'Thoughtfully curated local experiences.'}</p></div>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700"><Award className="h-5 w-5" /></span>
                  <div><p className="font-black text-slate-900">Secure booking</p><p className="mt-0.5 text-xs leading-5 text-slate-500">Book and manage journeys through bagspackgo.</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {liveEvents.length > 0 && (
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.55)] sm:p-8">
            <SectionHeading eyebrow="Happening now" title="Live" description="Published events that are currently available or still ongoing." icon={Sparkles} count={liveEvents.length} />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {liveEvents.map((event) => <EventCard key={event._id} event={event} state="live" onNavigate={navigate} />)}
            </div>
          </section>
        )}

        {tripPackages.length > 0 && (
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.55)] sm:p-8">
            <SectionHeading eyebrow="Curated journeys" title="Trip packages" description="Flexible journeys designed and hosted by this provider." icon={Navigation} count={tripPackages.length} />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{renderPackages(tripPackages, showAllTrips)}</div>
            {tripPackages.length > 6 && <button type="button" onClick={() => setShowAllTrips((value) => !value)} className="mt-5 w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 hover:border-emerald-200 hover:text-emerald-700">{showAllTrips ? 'Show fewer trips' : `View all ${tripPackages.length} trips`}</button>}
          </section>
        )}

        {trekPackages.length > 0 && (
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.55)] sm:p-8">
            <SectionHeading eyebrow="On the trail" title="Trek packages" description="Guided routes for travellers looking for a more active journey." icon={Mountain} count={trekPackages.length} />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{renderPackages(trekPackages, showAllTreks)}</div>
            {trekPackages.length > 6 && <button type="button" onClick={() => setShowAllTreks((value) => !value)} className="mt-5 w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 hover:border-emerald-200 hover:text-emerald-700">{showAllTreks ? 'Show fewer treks' : `View all ${trekPackages.length} treks`}</button>}
          </section>
        )}

        {recentEvents.length > 0 && (
          <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.55)] sm:p-8">
            <SectionHeading eyebrow="Previously hosted" title="Recent events" description="Events from this provider that have already ended." icon={CalendarDays} count={recentEvents.length} />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {(showAllEvents ? recentEvents : recentEvents.slice(0, 6)).map((event) => <EventCard key={event._id} event={event} state="recent" onNavigate={navigate} />)}
            </div>
            {recentEvents.length > 6 && <button type="button" onClick={() => setShowAllEvents((value) => !value)} className="mt-5 w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 hover:border-emerald-200 hover:text-emerald-700">{showAllEvents ? 'Show fewer events' : `View all ${recentEvents.length} events`}</button>}
          </section>
        )}

        {packages.length === 0 && events.length === 0 && (
          <section className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Clock3 className="mx-auto h-8 w-8 text-emerald-600" />
            <h2 className="mt-4 text-xl font-black text-slate-950">New journeys are being prepared</h2>
            <p className="mt-2 text-sm text-slate-500">Check back soon for packages and events from {provider.name}.</p>
          </section>
        )}

        <section className="mt-12 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-white via-amber-50/50 to-emerald-50/50 p-6 sm:p-8">
            <SectionHeading eyebrow="Traveller stories" title="Ratings & reviews" description="Feedback from people who booked through bagspackgo." icon={Star} count={feedbacks.length} />
          </div>
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
            <div className="space-y-5">
              {feedbacks.length > 0 ? feedbacks.map((feedback) => (
                <article key={feedback.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="font-bold text-slate-800">{feedback.user}</p><div className="mt-1 flex">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`h-3.5 w-3.5 ${star <= feedback.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}</div></div>
                    <time className="shrink-0 text-xs font-medium text-slate-400">{formatDate(feedback.date)}</time>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feedback.comment}</p>
                </article>
              )) : <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">No reviews yet. You can be the first to share an experience.</p>}
            </div>

            <form onSubmit={handleSubmitFeedback} className="h-fit rounded-3xl border border-slate-200 bg-[#f8faf9] p-5 sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Share your experience</p>
              <h3 className="mt-2 text-xl font-black text-slate-950">Rate {provider.name}</h3>
              <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onMouseEnter={() => setRatingHover(star)} onMouseLeave={() => setRatingHover(0)} onClick={() => setRatingSubmit(star)} className="rounded-lg p-1 transition hover:scale-110" aria-label={`${star} star rating`}>
                    <Star className={`h-7 w-7 ${star <= (ratingHover || ratingSubmit) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <textarea value={feedbackText} onChange={(event) => setFeedbackText(event.target.value)} maxLength={1000} placeholder="Tell other travellers about your experience..." className="mt-4 min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-400" />
              <button type="submit" disabled={!ratingSubmit || !feedbackText.trim() || submittingFeedback} className="mt-3 flex h-11 w-full items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                {submittingFeedback ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : 'Submit review'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
