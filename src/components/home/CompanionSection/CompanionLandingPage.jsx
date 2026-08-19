'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  MapPin, Phone, Users, Shield,
  CheckCircle, Loader2, CalendarCheck,
  Home, CreditCard, Compass, Heart, Calendar,
  MessageCircle, Headphones, Plus, Minus, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const painPoints = [
  {
    icon: CreditCard,
    title: 'Getting Overcharged',
    desc: 'Vendors see a tourist and double the price. Pay local prices instead.',
  },
  {
    icon: Home,
    title: 'No Idea Where to Stay',
    desc: 'Avoid fake reviews. Get honest hotel recommendations from locals.',
  },
  {
    icon: Compass,
    title: 'Confused Itinerary',
    desc: 'Stop rushing. See the must-visits and skip the tourist traps.',
  },
  {
    icon: Heart,
    title: 'Missing Hidden Gems',
    desc: 'Discover secret spots and local cafes that only residents know.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Request a Callback',
    desc: 'Fill in a quick form with your destination and dates.',
    icon: Phone,
  },
  {
    num: '02',
    title: 'Meet Your Expert',
    desc: 'We assign a verified local expert who knows the area.',
    icon: Users,
  },
  {
    num: '03',
    title: 'Plan Together',
    desc: 'Curate a custom itinerary and finalize your budget.',
    icon: Calendar,
  },
  {
    num: '04',
    title: '24/7 Support',
    desc: 'Your Companion stays one call away during your trip.',
    icon: Headphones,
  },
];

const features = [
  { icon: MapPin, label: 'Custom Itinerary', desc: 'Day-by-day plan crafted for your style' },
  { icon: Home, label: 'Hotel Guidance', desc: 'Honest picks for your budget' },
  { icon: CreditCard, label: 'Fair Price Check', desc: 'Know what locals pay' },
  { icon: Compass, label: 'Hidden Gems', desc: 'Secret spots and off-beat trails' },
  { icon: Shield, label: 'Verified Experts', desc: 'Background-checked locals' },
  { icon: Headphones, label: '24/7 Support', desc: 'Reachable via WhatsApp & call' },
  { icon: MessageCircle, label: 'Local Connects', desc: 'Direct referrals to trusted vendors' },
];

const destinationOptions = [
  {
    label: 'Available Now',
    options: [
      { value: 'kashmir', label: 'Kashmir' }
    ]
  },
  {
    label: 'Available Soon',
    options: [
      { value: 'ladakh', label: 'Ladakh', isDisabled: true },
      { value: 'bhaderwah', label: 'Bhaderwah', isDisabled: true },
      { value: 'warwan', label: 'Warwan Valley', isDisabled: true },
      { value: 'marwah', label: 'Marwah Valley', isDisabled: true },
    ]
  }
];

const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '40px',
    fontSize: '0.875rem',
    borderRadius: '0.5rem',
    borderColor: state.isFocused ? '#10b981' : '#e5e7eb',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(16, 185, 129, 0.2)' : null,
    '&:hover': { borderColor: state.isFocused ? '#10b981' : '#d1d5db' },
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '0.875rem',
    backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#ecfdf5' : 'white',
    color: state.isSelected ? 'white' : state.isDisabled ? '#9ca3af' : '#1f2937',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    opacity: state.isDisabled ? 0.6 : 1,
  }),
};

/* ─────────────────────────────────────────────
   Callback Form
───────────────────────────────────────────── */
function CallbackForm() {
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
        className="flex flex-col items-center justify-center text-center py-16 bg-white border border-gray-100 rounded-xl shadow-sm"
      >
        <CheckCircle className="w-12 h-12 text-emerald-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Request Received!</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Your dedicated Companion will reach out within 24 hours.
        </p>
        <Button
          variant="outline"
          className="mt-6"
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
      className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 sm:p-8 space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Your Name *</label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Arjun Sharma"
            required
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Phone Number *</label>
          <div className="flex h-10 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <span className="flex items-center px-3 text-gray-500 text-sm font-medium border-r border-gray-200 bg-gray-100">
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
          <label className="text-sm font-medium text-gray-700">Destination *</label>
          <Select
            options={destinationOptions}
            value={selectedDestination}
            onChange={setSelectedDestination}
            placeholder="Select destination"
            styles={selectStyles}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">No. of People</label>
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg h-10 transition-all hover:border-emerald-400">
            <button
              type="button"
              onClick={() => setPeopleCount(prev => Math.max(prev - 1, 1))}
              disabled={peopleCount <= 1}
              className="flex items-center justify-center w-10 h-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-l-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Minus size={16} />
            </button>
            <div className="flex-1 text-center text-sm font-bold text-gray-800 tabular-nums">
              {peopleCount}
            </div>
            <button
              type="button"
              onClick={() => setPeopleCount(prev => Math.min(prev + 1, 50))}
              className="flex items-center justify-center w-10 h-full text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-r-lg transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 relative z-40">
        <label className="text-sm font-medium text-gray-700">Travel Date (approx.)</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          customInput={
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <CalendarCheck className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Select Date"
                className="w-full pl-9 bg-gray-50 cursor-pointer"
                readOnly
              />
            </div>
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

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">How can we help you?</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          placeholder="e.g. Need help with itinerary and budget stays..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm font-medium">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto min-w-[200px]"
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
  const scrollToForm = () => {
    document.getElementById('callback-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-slate-50 min-h-screen text-gray-900 font-sans pb-20 overflow-x-hidden">
      
      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <FadeUp>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                Travel Free. <span className="text-emerald-600">Never Alone.</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Explore on your own terms with a verified local expert by your side. 24/7 support, honest prices, hidden gems, and perfect stays.
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Button size="lg" onClick={scrollToForm} className="shadow-md group">
                  Get a Free Consultation
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 px-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Verified Locals Only
                </div>
              </div>
            </FadeUp>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="order-1 lg:order-2 relative w-full max-w-md mx-auto lg:max-w-none"
          >
            <div className="aspect-[4/3] sm:aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg relative">
              <Image
                src="/images/companion-consultant.jpg"
                alt="Travel Companion"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PAIN POINTS SECTION
      ══════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Travel Problems</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Independent travel shouldn't mean figuring everything out the hard way.
            </p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {painPoints.map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 h-full hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS & FEATURES
      ══════════════════════════════════════════ */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Left: How it works */}
          <div>
            <FadeUp>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">How it Works</h2>
            </FadeUp>
            <div className="space-y-8">
              {steps.map((step, i) => (
                <FadeUp key={i} delay={i * 0.1}>
                  <div className="flex gap-4 relative">
                    {i !== steps.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-[-2rem] w-px bg-gray-200" />
                    )}
                    <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center shrink-0 relative z-10">
                      <step.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="pt-2">
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Right: What you get */}
          <div>
            <FadeUp>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">What You Get</h2>
            </FadeUp>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <FadeIn key={i} delay={i * 0.05}>
                  <div className="flex gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all h-full">
                    <div className="shrink-0 mt-0.5">
                      <f.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{f.label}</h4>
                      <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CALLBACK FORM
      ══════════════════════════════════════════ */}
      <section id="callback-form" className="py-16 md:py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Your Companion</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Fill in your details and our team will assign a verified local expert to call you back within 24 hours.
            </p>
          </FadeUp>
          
          <FadeUp delay={0.2} className="text-gray-900">
            <CallbackForm />
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
