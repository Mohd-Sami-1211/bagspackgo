'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeIndianRupee,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Compass,
  Headphones,
  MapPin,
  Route,
  ShieldCheck,
  Users,
} from 'lucide-react';
import TripSearchInput from './TripSearchInput';

const fetcher = (url) => fetch(url).then((response) => {
  if (!response.ok) throw new Error('Unable to load');
  return response.json();
});

const faqs = [
  {
    question: 'What is bagspackgo?',
    answer: 'bagspackgo brings travel packages, offbeat destinations, hosted events and on-trip assistance together in one place, with a focus on trusted local providers.',
  },
  {
    question: 'How are trip packages different here?',
    answer: 'Instead of calling local companies one by one, you can compare their itineraries, prices, inclusions and dates on the same platform before choosing.',
  },
  {
    question: 'Can I visit an offbeat destination privately?',
    answer: 'Yes. Choose a personal visit when available, or submit your interest for a future group trip if you prefer travelling with others.',
  },
  {
    question: 'What does Companion include?',
    answer: 'Companion gives independent travellers 24/7 call assistance for itinerary decisions, local pricing, places to visit and situations where they need quick guidance.',
  },
  {
    question: 'Who hosts the events?',
    answer: 'Local travel and trekking companies publish their scheduled experiences. You can review what is happening, availability and destination before joining.',
  },
  {
    question: 'Are local companies verified?',
    answer: 'Providers go through an onboarding and review process before their services are published on bagspackgo.',
  },
];

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

function SectionIntro({ label, title, description, light = false }) {
  return (
    <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
      <p className={`mb-4 text-[11px] font-bold uppercase tracking-[0.24em] ${light ? 'text-white/65' : 'text-[#9b7440]'}`}>{label}</p>
      <h2 className={`font-serif text-4xl leading-[1.02] tracking-[-0.035em] sm:text-5xl lg:text-6xl ${light ? 'text-white' : 'text-[#17372f]'}`}>{title}</h2>
      {description && <p className={`mt-5 max-w-xl text-sm leading-7 sm:text-base ${light ? 'text-white/70' : 'text-slate-600'}`}>{description}</p>}
    </motion.div>
  );
}

function LiveEvents() {
  const { data } = useSWR('/api/events?tab=upcoming&limit=4', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });
  const events = data?.success ? data.events || [] : [];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (events.length < 2) return undefined;
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % events.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [events.length]);

  useEffect(() => {
    if (activeSlide >= events.length) setActiveSlide(0);
  }, [activeSlide, events.length]);

  if (!events.length) return null;

  return (
    <section className="bg-[#f8f6f0] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#9b7440]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" /> Live events
            </p>
            <h2 className="font-serif text-4xl tracking-tight text-[#17372f] sm:text-5xl">Happening around you</h2>
          </div>
          <Link href="/user/events" className="hidden items-center gap-2 text-sm font-semibold text-[#17372f] sm:flex">All events <ArrowRight size={16} /></Link>
        </div>

        <div className="sm:hidden">
          <AnimatePresence mode="wait">
            <motion.div key={events[activeSlide].id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4 }}>
              <EventPoster event={events[activeSlide]} />
            </motion.div>
          </AnimatePresence>
          {events.length > 1 && (
            <div className="mt-5 flex justify-center gap-2" aria-label="Choose event">
              {events.map((event, index) => (
                <button key={event.id} onClick={() => setActiveSlide(index)} className={`h-2 rounded-full transition-all ${index === activeSlide ? 'w-7 bg-[#17372f]' : 'w-2 bg-[#17372f]/25'}`} aria-label={`Show event ${index + 1}`} />
              ))}
            </div>
          )}
        </div>

        <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
            >
              <EventPoster event={event} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventPoster({ event }) {
  return (
    <article className="group relative min-h-72 overflow-hidden rounded-2xl bg-[#17372f] shadow-[0_12px_35px_rgba(23,55,47,0.12)] transition-all hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(23,55,47,0.2)]">
      {event.image && <img src={event.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />
      <div className="relative flex min-h-72 flex-col justify-end p-5 text-white">
        <h3 className="line-clamp-2 font-serif text-2xl leading-7">{event.name}</h3>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div className="min-w-0 space-y-2 text-xs font-medium text-white/80">
            <p className="flex items-center gap-2"><MapPin size={15} className="shrink-0" /> <span className="truncate">{event.destination || event.destinationId || 'Location to be announced'}</span></p>
            <p className="flex items-center gap-2"><Users size={15} className="shrink-0" /> {event.slotsLeft > 0 ? `${event.slotsLeft} slots available` : 'Check availability'}</p>
          </div>
          <Link href={`/user/events/eventdetails/${event.id}`} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-[#17372f]">View <ArrowRight size={15} /></Link>
        </div>
      </div>
    </article>
  );
}

function TripStory() {
  const points = [
    { icon: Building2, title: 'Local companies, one platform', text: 'Explore packages from multiple local operators without repeating the same calls and questions.' },
    { icon: Route, title: 'Everything visible before you choose', text: 'See itineraries, prices, inclusions and dates clearly enough to compare with confidence.' },
    { icon: ShieldCheck, title: 'A trip with fewer surprises', text: 'Book with transparent information and know exactly who is helping you experience the destination.' },
    { icon: BadgeIndianRupee, title: 'Book with only 30% advance', text: 'Secure the package without paying the full amount upfront. Pay just 30% in advance to confirm your trip.' },
  ];

  return (
    <section id="about" className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image src="/images/dal-lake-editorial-v1.webp" alt="A shikara crossing Dal Lake beneath Kashmir's mountains" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </motion.div>

        <div>
          <SectionIntro
            label="Trips, made simpler"
            title="The package hunt should not feel like a second job."
            description="We’ve onboarded 15+ registered travel companies with their complete packages. Spend less time collecting scattered details and more time choosing the journey that feels right."
          />
          <div className="mt-10 space-y-7">
            {points.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="grid grid-cols-[48px_1fr] gap-4 border-t border-slate-200 pt-6"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef3ef] text-[#17372f]"><Icon size={20} /></span>
                  <div><h3 className="font-semibold text-[#17372f]">{point.title}</h3><p className="mt-1.5 text-sm leading-6 text-slate-600">{point.text}</p></div>
                </motion.div>
              );
            })}
          </div>
          <Link href="/user/trip" className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#17372f] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">Explore trip packages <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

function OffbeatExplorer() {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.pagination?.hasMore) return null;
    return `/api/public/offbeats?page=${pageIndex + 1}&limit=9`;
  };
  const { data, size, setSize } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false,
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60_000,
  });
  const destinations = useMemo(() => data?.flatMap((page) => page?.data || []) || [], [data]);
  const hasMore = data?.[data.length - 1]?.pagination?.hasMore;
  const [activeIndex, setActiveIndex] = useState(0);
  const wheelLocked = useRef(false);

  useEffect(() => {
    if (activeIndex >= destinations.length - 3 && hasMore) setSize(size + 1);
  }, [activeIndex, destinations.length, hasMore, setSize, size]);

  useEffect(() => {
    if (activeIndex > destinations.length - 1) setActiveIndex(Math.max(0, destinations.length - 1));
  }, [activeIndex, destinations.length]);

  const move = (direction) => {
    if (!destinations.length) return;
    setActiveIndex((current) => (current + direction + destinations.length) % destinations.length);
  };

  const handleWheel = (event) => {
    const isSmallScreen = window.innerWidth < 768;
    const isHorizontalGesture = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if (isSmallScreen && !isHorizontalGesture) return;
    event.preventDefault();
    if (wheelLocked.current) return;
    wheelLocked.current = true;
    const delta = isSmallScreen ? event.deltaX : event.deltaY;
    move(delta > 0 ? 1 : -1);
    window.setTimeout(() => { wheelLocked.current = false; }, 450);
  };

  if (!destinations.length) return null;

  const active = destinations[activeIndex];
  const visibleCount = Math.min(3, destinations.length);
  const middle = Math.floor(visibleCount / 2);
  const visible = Array.from({ length: visibleCount }, (_, position) => {
    const offset = position - middle;
    const index = (activeIndex + offset + destinations.length) % destinations.length;
    return { destination: destinations[index], index, offset };
  });

  return (
    <section id="offbeat-explorer" className="relative min-h-[760px] overflow-hidden bg-[#102a24] text-white lg:min-h-[820px]">
      <AnimatePresence mode="sync">
        <motion.div key={active._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.65 }} className="absolute inset-0">
          <img src={active.coverPhoto || '/images/Doodhpathri1.jpeg'} alt="" className="h-full w-full object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b211c]/95 via-[#0b211c]/72 to-[#0b211c]/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b211c]/80 via-transparent to-[#0b211c]/35" />

      <div className="relative mx-auto grid min-h-[760px] max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:min-h-[820px] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-8">
        <div className="lg:self-start lg:pt-28">
          <SectionIntro label="Beyond the familiar" title="Explore the places that are harder to find—and easier to remember." description="Browse real offbeat destinations, discover what makes each one special, and choose a personal visit or register interest for an upcoming group trip." light />
        </div>

        <div className="flex min-w-0 flex-col items-end lg:justify-center">
          <div onWheel={handleWheel} className="relative mr-1 flex h-[280px] w-[190px] touch-pan-y flex-col items-end justify-center gap-3 sm:mr-4 sm:h-[330px] sm:w-[230px] lg:mr-8 lg:h-[360px] lg:w-[280px]" aria-label="Offbeat destination selector">
            {visible.map(({ destination, index, offset }) => {
              const focused = offset === 0;
              const sizeClass = focused ? 'h-28 w-28 sm:h-32 sm:w-32' : 'h-20 w-20 sm:h-24 sm:w-24';
              return (
                <motion.button
                  layout
                  key={`${destination._id}-${offset}`}
                  onClick={() => setActiveIndex(index)}
                  animate={{ x: -Math.abs(offset) * 22, opacity: focused ? 1 : 0.76, scale: focused ? 1 : 0.96 }}
                  whileHover={{ scale: focused ? 1.03 : 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                  className={`relative shrink-0 cursor-pointer overflow-hidden rounded-full border transition-colors ${sizeClass} ${focused ? 'border-4 border-white shadow-[0_0_0_5px_rgba(255,255,255,0.18)]' : 'border-2 border-white/55 hover:border-white'}`}
                  aria-label={`Focus ${destination.title}`}
                >
                  <img src={destination.coverPhoto || '/images/Doodhpathri1.jpeg'} alt="" className="h-full w-full object-cover" />
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={active._id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.4 }} className="mt-28 w-full max-w-xl rounded-[1.5rem] border border-white/15 bg-black/20 p-6 backdrop-blur-md sm:mt-8 sm:p-8">
              <h3 className="font-serif text-4xl leading-none sm:text-5xl">{active.title}</h3>
              <p className="mt-4 max-w-lg text-sm leading-7 text-white/72">{active.shortDescription || active.destination || 'A quieter side of the region, ready to be explored with local insight.'}</p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <Link href={`/user/offbeats/${active._id}`} className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#17372f]">View destination <ArrowRight size={16} /></Link>
                <div className="flex gap-2">
                  <button onClick={() => move(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white hover:text-[#17372f]" aria-label="Previous destination"><ArrowLeft size={17} /></button>
                  <button onClick={() => move(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white hover:text-[#17372f]" aria-label="Next destination"><ArrowRight size={17} /></button>
                </div>
              </div>
              <p className="mt-4 text-xs text-white/45">{String(activeIndex + 1).padStart(2, '0')} / {String(destinations.length).padStart(2, '0')}{hasMore ? ' +' : ''}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function RecognitionStrip() {
  return (
    <section className="bg-white px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8">
      <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] shadow-[0_16px_45px_rgba(23,55,47,0.1)] sm:grid-cols-[1.55fr_0.45fr]">
        <div className="flex gap-5 bg-[#f1eadc] p-7 sm:items-center sm:p-10">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#17372f] text-white"><Award size={23} /></span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#9b7440]">National recognition</p>
            <p className="mt-2 max-w-3xl font-serif text-2xl leading-tight text-[#17372f] sm:text-3xl">Recognized among India’s top 500 startups at Asia’s largest startup pitching competition, organized by IIT Bombay.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-[#17372f] p-7 text-white sm:flex-col sm:items-start sm:justify-center sm:p-10">
          <Building2 size={26} className="shrink-0 text-[#d9bd86]" />
          <div><p className="text-xs uppercase tracking-[0.2em] text-white/55">Built with trust</p><p className="mt-1 font-serif text-2xl">A registered company</p></div>
        </div>
      </motion.div>
    </section>
  );
}

function CompanionSection() {
  const benefits = ['24/7 call assistance', 'Local price guidance', 'Itinerary help on the move'];
  return (
    <section className="bg-[#f8f6f0] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="relative mx-auto min-h-[620px] max-w-7xl overflow-hidden rounded-[2rem]">
        <Image src="/images/companion-consultant.jpg" alt="Travel companion support" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#102a24]/95 via-[#102a24]/72 to-transparent" />
        <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} className="relative flex min-h-[620px] max-w-2xl flex-col justify-center p-7 text-white sm:p-12 lg:p-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#d9bd86]">Companion</p>
          <h2 className="mt-5 font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">Independent does not have to mean alone.</h2>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/72 sm:text-base">Plan and travel your own way, with a local expert available whenever a price feels wrong, the itinerary stops making sense, or you simply need to know what to do next.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {benefits.map((benefit) => <span key={benefit} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur"><CheckCircle2 size={15} /> {benefit}</span>)}
          </div>
          <Link href="/user/companion" className="mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#17372f]">Explore Companion <ArrowRight size={16} /></Link>
        </motion.div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section id="faq" className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <div>
          <SectionIntro label="Good to know" title="Questions before you go." description="A few quick answers about how bagspackgo helps you plan, compare and travel." />
          <Link href="/user/help" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#17372f]">Visit help centre <ArrowRight size={16} /></Link>
        </div>
        <div className="border-t border-slate-200">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div key={faq.question} className="border-b border-slate-200">
                <button onClick={() => setOpenIndex(open ? -1 : index)} className="flex w-full items-center justify-between gap-4 py-6 text-left">
                  <span className="font-serif text-xl text-[#17372f] sm:text-2xl">{faq.question}</span>
                  <motion.span animate={{ rotate: open ? 180 : 0 }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef3ef] text-[#17372f]"><ChevronDown size={17} /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden"><p className="max-w-2xl pb-6 text-sm leading-7 text-slate-600">{faq.answer}</p></motion.div>}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function TripMainContent() {
  const benefits = [
    { icon: Building2, title: 'Multiple providers', text: 'Compare in one place' },
    { icon: Compass, title: 'Offbeat access', text: 'Find hidden places' },
    { icon: CalendarDays, title: 'Live experiences', text: 'Join what is happening' },
    { icon: Headphones, title: '24/7 support', text: 'Help throughout the trip' },
  ];

  return (
    <div id="top" className="w-full overflow-x-hidden bg-white text-[#17372f]">
      <section className="relative min-h-[780px] overflow-hidden bg-[#102a24] px-4 pb-16 pt-24 text-white sm:px-6 sm:pt-28 lg:px-8">
        <Image src="/images/hero-kashmir-v3.webp" alt="Sunlit snow-capped mountains reflected in a Kashmir lake" fill priority sizes="100vw" className="scale-[1.04] object-cover object-[center_36%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a211c]/88 via-[#0a211c]/38 to-[#0a211c]/48" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a211c]/68 via-transparent to-[#0a211c]/28" />

        <div className="relative mx-auto grid max-w-7xl gap-8 sm:gap-10 lg:min-h-[590px] lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="relative isolate w-full max-w-[310px] py-2 sm:max-w-none lg:-translate-y-2 lg:py-5">
            <div className="pointer-events-none absolute -inset-x-10 -inset-y-16 z-0 bg-[#0a211c]/55 blur-3xl backdrop-blur-md" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%), linear-gradient(to right, black 0%, rgba(0,0,0,0.86) 52%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%), linear-gradient(to right, black 0%, rgba(0,0,0,0.86) 52%, transparent 100%)', maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }} />
            <div className="relative z-10">
              <h1 className="max-w-2xl font-serif text-[2.45rem] leading-[0.98] tracking-[-0.04em] sm:text-7xl lg:max-w-[590px] lg:leading-[0.88] lg:text-[5.6rem]">The trip you imagine, made easier to find.</h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/78 sm:mt-7 sm:text-base sm:leading-7">Compare local packages, discover quieter places, join upcoming adventures or take expert support along for the journey.</p>
              <div className="mt-5 flex flex-wrap gap-4 text-[11px] font-medium text-white/75 sm:mt-8 sm:gap-5 sm:text-xs"><span className="flex items-center gap-2"><CheckCircle2 size={16} /> Clear itineraries</span><span className="flex items-center gap-2"><CheckCircle2 size={16} /> Local providers</span></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }} className="w-full rounded-[1.5rem] border border-white/25 bg-white/12 p-2.5 shadow-2xl shadow-black/25 backdrop-blur-md sm:p-3 lg:mt-24 lg:w-[94%] lg:justify-self-end">
            <div className="mb-2 px-2 pt-1"><p className="font-serif text-xl sm:text-2xl">Where should we take you?</p><p className="mt-0.5 text-[11px] text-white/65 sm:text-xs">Start with a few details. We will show you the options.</p></div>
            <TripSearchInput heroMode />
          </motion.div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-9 max-w-6xl px-4 sm:px-6">
        <div className="grid rounded-2xl bg-white px-6 py-6 shadow-[0_16px_50px_rgba(23,55,47,0.13)] sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return <div key={benefit.title} className={`flex items-center gap-4 py-4 sm:px-5 ${index > 1 ? 'border-t border-slate-200 lg:border-t-0' : ''} ${index % 2 === 1 ? 'sm:border-l sm:border-slate-200' : ''} ${index > 0 ? 'lg:border-l lg:border-slate-200' : ''}`}><Icon size={21} className="shrink-0 text-[#9b7440]" /><div><p className="text-sm font-semibold text-[#17372f]">{benefit.title}</p><p className="mt-1 text-xs text-slate-500">{benefit.text}</p></div></div>;
          })}
        </div>
      </section>

      <LiveEvents />
      <TripStory />
      <RecognitionStrip />
      <OffbeatExplorer />
      <CompanionSection />
      <FaqSection />
    </div>
  );
}
