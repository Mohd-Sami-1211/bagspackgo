'use client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, useInView } from 'framer-motion';
import posthog from '@/lib/posthog';
import {
  MapPin, Phone, Users, Shield,
  CheckCircle, Loader2, CalendarCheck,
  CreditCard, Compass,
  MessageCircle, Headphones, Plus, Minus, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import destinationsData from '@/data/data.json';

/* ─────────────────────────────────────────────
   Reusable Animation Helpers
───────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const supportMoments = [
  {
    icon: Compass,
    eyebrow: 'Before you leave',
    title: 'Turn ideas into a route that works',
    desc: 'We help shape a realistic itinerary around your pace, interests and available days.',
    points: ['Day-by-day route review', 'Stay and transport guidance'],
  },
  {
    icon: CreditCard,
    eyebrow: 'While you plan',
    title: 'Avoid inflated tourist prices',
    desc: 'Before confirming a stay, ride or activity, ask what a fair local rate looks like and reduce the risk of being overcharged.',
    points: ['Price and quote checks', 'Trusted local alternatives'],
  },
  {
    icon: Headphones,
    eyebrow: 'During the journey',
    title: 'Get help the moment plans change',
    desc: 'Call your Companion whenever you are confused, delayed or simply need a local opinion.',
    points: ['24/7 call assistance', 'Real-time route suggestions'],
  },
];

const steps = [
  {
    num: '01',
    title: 'Tell us about the trip',
    desc: 'Share your destination, approximate date and group size.',
    icon: Phone,
  },
  {
    num: '02',
    title: 'Meet your local Companion',
    desc: 'We connect you with a verified expert who knows the destination.',
    icon: Users,
  },
  {
    num: '03',
    title: 'Review the plan together',
    desc: 'Discuss the route, stays, transport and likely costs before leaving.',
    icon: Compass,
  },
  {
    num: '04',
    title: 'Travel with a safety net',
    desc: 'Keep one familiar local contact available throughout the journey.',
    icon: Headphones,
  },
];

const destinationOptions = [
  ...(destinationsData.destinations || []).filter((destination) => destination.value === 'kashmir'),
  {
    label: 'Available Soon',
    options: (destinationsData.destinations || [])
      .filter((destination) => destination.value !== 'kashmir')
      .map((destination) => ({ ...destination, isDisabled: true })),
  },
];

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '44px',
    fontSize: '0.875rem',
    borderRadius: '0.75rem',
    backgroundColor: '#fafaf7',
    borderColor: state.isFocused ? '#1d6b55' : 'rgba(23, 55, 47, 0.14)',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(29, 107, 85, 0.12)' : 'none',
    '&:hover': { borderColor: state.isFocused ? '#1d6b55' : 'rgba(23, 55, 47, 0.28)' },
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '0.875rem',
    backgroundColor: state.isSelected ? '#1d6b55' : state.isFocused ? '#edf3ee' : 'white',
    color: state.isSelected ? 'white' : state.isDisabled ? '#9ca3af' : '#1f2937',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    opacity: state.isDisabled ? 0.6 : 1,
  }),
  menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
};

/* ─────────────────────────────────────────────
   Callback Form
───────────────────────────────────────────── */
function CallbackForm() {
  const { user, openAuthModal } = useAuth();
  const [form, setForm] = useState({
    name: '', phone: '', message: '',
  });
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [peopleCount, setPeopleCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal({ closable: true, tab: 'user' });
      return;
    }
    setError('');
    if (!form.name || !form.phone || !selectedDestination) {
      setError('Please fill in your name, phone, and destination.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        destination: selectedDestination.label,
        travelDates: startDate ? startDate.toISOString() : '',
        groupSize: peopleCount.toString(), // Still named groupSize in API for compatibility
      };
      const res = await fetch('/api/user/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setForm({ name: '', phone: '', message: '' });
        setSelectedDestination(null);
        setStartDate(null);
        setPeopleCount(1);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[440px] flex-col items-center justify-center rounded-[1.5rem] bg-white px-6 py-16 text-center"
      >
        <CheckCircle className="mb-5 h-12 w-12 text-[#1d6b55]" />
        <h3 className="font-serif text-3xl tracking-[-0.03em] text-[#17372f]">Your request is with us.</h3>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#60716c]">
          A member of our team will call you within 24 hours to understand your journey.
        </p>
        <Button
          variant="outline"
          className="mt-7 rounded-full border-[#17372f]/15 text-[#17372f]"
          onClick={() => setSuccess(false)}
        >
          Submit another request
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit} 
      className="space-y-6 rounded-[1.5rem] bg-white p-5 sm:p-7 lg:p-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#405b54]">Your name *</label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Arjun Sharma"
            required
            className="h-11 rounded-xl border-[#17372f]/15 bg-[#fafaf7] focus-visible:ring-[#1d6b55]/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#405b54]">Phone number *</label>
          <div className="flex h-11 overflow-hidden rounded-xl border border-[#17372f]/15 bg-[#fafaf7] transition-all focus-within:border-[#1d6b55] focus-within:ring-2 focus-within:ring-[#1d6b55]/15">
            <span className="flex items-center border-r border-[#17372f]/10 bg-[#f0f2ed] px-3 text-sm font-medium text-[#60716c]">
              +91
            </span>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              required
              className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 px-3 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5 relative z-50">
          <label className="text-sm font-semibold text-[#405b54]">Destination *</label>
          <Select
            options={destinationOptions}
            value={selectedDestination}
            onChange={setSelectedDestination}
            placeholder="Select destination"
            styles={selectStyles}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
            menuPosition="fixed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[#405b54]">Number of travellers</label>
          <div className="flex h-11 items-center rounded-xl border border-[#17372f]/15 bg-[#fafaf7] transition-all hover:border-[#17372f]/30">
            <button
              type="button"
              onClick={() => setPeopleCount(prev => Math.max(prev - 1, 1))}
              disabled={peopleCount <= 1}
              className="flex h-full w-11 items-center justify-center rounded-l-xl text-[#60716c] transition-colors hover:bg-[#edf3ee] hover:text-[#1d6b55] disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Minus size={16} />
            </button>
            <div className="flex-1 text-center text-sm font-bold text-gray-800 tabular-nums">
              {peopleCount}
            </div>
            <button
              type="button"
              onClick={() => setPeopleCount(prev => Math.min(prev + 1, 50))}
              className="flex h-full w-11 items-center justify-center rounded-r-xl text-[#60716c] transition-colors hover:bg-[#edf3ee] hover:text-[#1d6b55]"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 relative z-[60]">
        <label className="text-sm font-semibold text-[#405b54]">Approximate travel date</label>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            <CalendarCheck className="h-4 w-4 text-gray-400" />
          </div>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            customInput={
              <Input
                type="text"
                placeholder="Select Date"
                className="h-11 w-full cursor-pointer rounded-xl border-[#17372f]/15 bg-[#fafaf7] pl-9 focus-visible:ring-[#1d6b55]/20"
                readOnly
              />
            }
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            showMonthDropdown
            showYearDropdown
            dropdownMode="scroll"
            popperClassName="z-[1000]"
            wrapperClassName="w-full"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-[#405b54]">What would you like help with?</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          placeholder="Tell us about your route, concerns or places you want to visit."
          className="w-full resize-none rounded-xl border border-[#17372f]/15 bg-[#fafaf7] px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-[#1d6b55] focus:outline-none focus:ring-2 focus:ring-[#1d6b55]/15"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm font-medium">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full min-w-[200px] rounded-full bg-[#17372f] px-6 font-semibold text-white hover:bg-[#214b40] sm:w-auto"
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Phone className="w-4 h-4 mr-2" />}
        {loading ? 'Submitting...' : 'Request a Callback'}
      </Button>
    </motion.form>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function CompanionLandingPage() {
  const { user, openAuthModal } = useAuth();
  
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        openAuthModal({ closable: true, tab: 'user' });
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [user, openAuthModal]);

  useEffect(() => {
    if (user) {
      posthog.capture('companion_page_view', {
        user_id: user._id || user.id,
        username: user.username,
        email: user.email,
        phone: user.phone
      });
      
      // Track page visit for admin activity
      fetch('/api/activity/track-companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartbeat: false }),
      }).catch(console.error);

      // Setup heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        fetch('/api/activity/track-companion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ heartbeat: true }),
        }).catch(console.error);
      }, 30000);

      return () => clearInterval(heartbeatInterval);
    }
  }, [user]);

  const scrollToForm = () => {
    document.getElementById('callback-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f6f0] font-sans text-[#17372f]">
      <section className="relative isolate flex min-h-[650px] items-end overflow-hidden bg-[#0f1014] text-white md:min-h-[690px] md:items-center">
        <Image
          src="/images/companion-consultant.jpg"
          alt="A local travel Companion planning a Kashmir journey"
          fill
          priority
          className="object-cover object-[61%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/72 to-[#0f1014]/22 md:bg-[linear-gradient(90deg,rgba(15,16,20,0.88)_0%,rgba(15,16,20,0.68)_36%,rgba(15,16,20,0.16)_66%,transparent_82%)]" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0f1014]/52 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-32 sm:px-6 sm:pb-11 md:pb-8 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#e0c28b]">
              <Headphones className="h-4 w-4" /> 24/7 travel assistance
            </p>
            <h1 className="max-w-xl font-serif text-5xl leading-[0.94] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Travel your way. Keep a local expert close.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
              For travellers who prefer shaping their own journey but still want a trusted local to help with confusing routes, fair prices, stays and unexpected changes along the way.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button onClick={scrollToForm} className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#17372f] shadow-xl transition hover:-translate-y-0.5 hover:bg-white/90">
                Request a callback <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <span className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 text-sm font-semibold text-white/85 backdrop-blur-md">
                <Shield className="h-4 w-4 text-[#e0c28b]" /> Verified local experts
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-[#17372f]/10 bg-white/75">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#17372f]/10 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          {[
            ['01', 'Independent by choice', 'No fixed package or group itinerary.'],
            ['02', 'Local knowledge on call', 'Practical answers when you need them.'],
            ['03', 'Support through the trip', 'One familiar contact from plan to return.'],
          ].map(([number, title, text]) => (
            <div key={number} className="flex gap-4 py-5 sm:px-5 sm:first:pl-0 sm:last:pr-0">
              <span className="font-serif text-xl text-[#9b7440]">{number}</span>
              <div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-[#60716c]">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeUp className="mb-10 max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#9b7440]">Support that follows you</p>
            <h2 className="font-serif text-4xl leading-[1.02] tracking-[-0.04em] sm:text-5xl">Help for the decisions that make or break a trip.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#60716c]">Your Companion advises you; you stay in control of every booking and every choice.</p>
          </FadeUp>

          <div className="grid gap-5 lg:grid-cols-3">
            {supportMoments.map((item, index) => (
              <FadeUp key={item.title} delay={index * 0.08}>
                <article className="group flex h-full flex-col rounded-[1.75rem] border border-[#17372f]/10 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(23,55,47,0.6)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-35px_rgba(23,55,47,0.5)] sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8efe9] text-[#1d6b55]"><item.icon className="h-5 w-5" /></span>
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#9b7440]">{item.eyebrow}</span>
                  </div>
                  <h3 className="mt-8 font-serif text-3xl leading-[1.05] tracking-[-0.03em]">{item.title}</h3>
                  <p className="mt-4 text-base leading-7 text-[#60716c]">{item.desc}</p>
                  <ul className="mt-7 space-y-3 border-t border-[#17372f]/10 pt-5">
                    {item.points.map((point) => <li key={point} className="flex items-center gap-2.5 text-sm font-semibold"><CheckCircle className="h-4 w-4 text-[#1d6b55]" /> {point}</li>)}
                  </ul>
                </article>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#17201e] px-4 py-16 text-white sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeUp className="grid gap-5 border-b border-white/10 pb-9 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#e0c28b]">How Companion works</p>
              <h2 className="font-serif text-4xl leading-none tracking-[-0.04em] sm:text-5xl">One conversation to get started.</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-white/65 md:justify-self-end">Tell us where you are heading. We will understand the trip first, then match you with someone who can genuinely help.</p>
          </FadeUp>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <FadeUp key={step.num} delay={index * 0.07}>
                <div className="relative border-l border-white/15 pl-5">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl text-[#e0c28b]">{step.num}</span>
                    <step.icon className="h-5 w-5 text-white/45" />
                  </div>
                  <h3 className="mt-6 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section id="callback-form" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-[#17372f]/10 bg-white shadow-[0_30px_80px_-55px_rgba(23,55,47,0.6)] lg:grid-cols-[0.72fr_1.28fr]">
          <FadeUp className="relative overflow-hidden bg-[#dfe8e1] p-7 sm:p-9 lg:p-10">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9b7440]">Request your Companion</p>
              <h2 className="mt-4 font-serif text-4xl leading-[1.02] tracking-[-0.04em] sm:text-5xl">Start with a quick callback.</h2>
              <p className="mt-5 text-base leading-7 text-[#526761]">Share the basics. Our team will call within 24 hours to understand how you want to travel and where you need support.</p>
              <div className="mt-9 space-y-4 border-t border-[#17372f]/10 pt-7">
                <p className="flex items-center gap-3 text-sm font-semibold"><Phone className="h-4 w-4 text-[#1d6b55]" /> A real conversation, not a sales script</p>
                <p className="flex items-center gap-3 text-sm font-semibold"><MessageCircle className="h-4 w-4 text-[#1d6b55]" /> Ask questions before deciding</p>
                <p className="flex items-center gap-3 text-sm font-semibold"><MapPin className="h-4 w-4 text-[#1d6b55]" /> Currently available for Kashmir</p>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.08} className="p-1 text-gray-900 sm:p-3 lg:p-4">
            <CallbackForm />
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
