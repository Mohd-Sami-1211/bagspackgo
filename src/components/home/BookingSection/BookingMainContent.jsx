'use client';
import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaClipboardList, FaUsers, FaHeart, FaFilter, FaCalendarAlt, FaHistory, FaChevronLeft } from 'react-icons/fa';
import BookingCard from 'src/components/home/BookingSection/BookingCard';
const BookingMainContent = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming-bookings');

  // ===== Booking Data from API =====
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        // Fetch event, trip, and trek bookings in parallel
        const [eventsRes, tripsRes, treksRes] = await Promise.all([
          fetch('/api/user/bookings'),
          fetch('/api/user/trip-bookings'),
          fetch('/api/user/trek-bookings'),
        ]);
        const [eventsData, tripsData, treksData] = await Promise.all([eventsRes.json(), tripsRes.json(), treksRes.json()]);

        const now = new Date();
        const allFetched = [];

        const ensureString = (val) => {
          if (!val) return '';
          if (typeof val === 'object') return val.label || val.value || JSON.stringify(val);
          return String(val);
        };

        if (eventsData.success && eventsData.data) {
          eventsData.data.forEach(b => {
            allFetched.push({
              ...b,
              type: 'Event',
              name: ensureString(b.name),
              destination: ensureString(b.destination),
              category: ensureString(b.category),
              guide: ensureString(b.guide),
              createdAt: b.createdAt,
            });
          });
        }

        if (tripsData.success && tripsData.data) {
          tripsData.data.forEach(b => {
            allFetched.push({
              id: b.id,
              type: 'Trip',
              name: ensureString(b.packageName),
              date: b.startDate,
              endDate: b.endDate,
              destination: ensureString(b.destination),
              guide: ensureString(b.guideName),
              category: ensureString(b.category),
              status: b.status,
              price: b.totalAmount,
              people: b.numPeople,
              bookingRef: b.bookingRef,
              duration: `${b.days} Days`,
              image: b.packageSnapshot?.poster || '/images/hero.svg',
              passUrl: `/user/trip/pass/${b.id}`,
              cancellationDetails: b.cancellationDetails || {},
              personalDetails: b.personalDetails || {},
              arrivalDeparture: b.arrivalDeparture || {},
              packageSnapshot: b.packageSnapshot || {},
              guideName: b.guideName || '',
              companyName: b.companyName || '',
              providerPhone: b.providerPhone || '',
              providerEmail: b.providerEmail || '',
              createdAt: b.createdAt,
            });
          });
        }

        if (treksData.success && treksData.data) {
          treksData.data.forEach(b => {
            allFetched.push({
              id: b.id,
              type: 'Trek',
              name: ensureString(b.packageName),
              date: b.startDate,
              endDate: b.endDate,
              destination: ensureString(b.destination),
              guide: ensureString(b.guideName),
              category: ensureString(b.category || 'Trek'),
              status: b.status,
              price: b.totalAmount,
              people: b.numPeople,
              bookingRef: b.bookingRef,
              duration: `${b.days} Days`,
              image: b.packageSnapshot?.poster || '/images/hero.svg',
              passUrl: `/user/trek/pass/${b.id}`,
              createdAt: b.createdAt,
            });
          });
        }

        allFetched.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        setAllBookings(allFetched);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredBookings = useMemo(() => {
    return allBookings.filter((b) => {
      const matchStatus = 
        bookingStatusFilter === 'all' ||
        (bookingStatusFilter === 'upcoming' && (new Date(b.date) >= new Date() && !['cancelled', 'refund_initiated', 'cancellation_requested'].includes(b.status))) ||
        (bookingStatusFilter === 'completed' && (new Date(b.date) < new Date() && !['cancelled', 'refund_initiated', 'cancellation_requested'].includes(b.status))) ||
        (bookingStatusFilter === 'cancelled' && ['cancelled', 'cancellation_requested', 'refund_initiated'].includes(b.status));
      
      const matchCategory = bookingCategoryFilter === 'all' || b.type === bookingCategoryFilter;
      return matchStatus && matchCategory;
    });
  }, [allBookings, bookingStatusFilter, bookingCategoryFilter]);

  const SectionHeader = ({ children }) => (
    <div className="flex items-center justify-between mb-4">
      {children}
    </div>
  );

  const Fallback = ({ title, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-14 text-center text-gray-500">
      <div className="w-36 h-36 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      </div>
      <h3 className="text-lg font-black text-gray-700 mb-2">{title}</h3>
      <p className="text-sm">{subtitle}</p>
    </div>
  );

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Status</label>
        <div className="flex flex-col gap-3">
          {['all', 'upcoming', 'completed', 'cancelled'].map(s => (
            <label key={s} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" checked={bookingStatusFilter === s} onChange={() => setBookingStatusFilter(s)} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
              <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-600 transition-colors capitalize">{s === 'all' ? 'All Status' : s}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Category</label>
        <div className="flex flex-col gap-3">
          {['all', 'Trip', 'Trek', 'Event'].map(c => (
            <label key={c} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" checked={bookingCategoryFilter === c} onChange={() => setBookingCategoryFilter(c)} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
              <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-600 transition-colors capitalize">{c === 'all' ? 'All Categories' : c}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 mx-auto max-w-7xl mb-16 px-4 py-8">
      {/* SIDEBAR Filters (Large screens) */}
      <aside className="hidden md:block md:w-64 shrink-0 bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-50 p-6 h-fit sticky top-24">
        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
           <FaFilter className="text-emerald-500" /> Filters
        </h3>
        <FilterContent />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-full overflow-hidden min-h-[500px]">
        <SectionHeader>
          <div className="flex items-center gap-4">
             <button onClick={() => router.back()} className="p-2 sm:p-2.5 rounded-2xl bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm active:scale-95 shrink-0">
                <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
             <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 leading-none tracking-tight">My Bookings</h2>
                <p className="text-sm md:text-base font-semibold text-gray-500 mt-1.5">Manage and track your travel experiences.</p>
             </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center gap-2 px-4 py-2 text-sm font-black rounded-xl border-2 border-emerald-100 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
          >
            <FaFilter className="text-xs" /> Filters
          </button>
        </SectionHeader>

        {/* Mobile Filters Dropdown */}
        <AnimatePresence>
          {showFilters && (
             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-white p-6 rounded-3xl shadow-lg border border-emerald-100 mb-6 overflow-hidden">
                <FilterContent />
             </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4 pt-2">
          {loading ? (
             <Fallback title="Loading bookings..." subtitle="Fetching your latest data..." />
          ) : filteredBookings.length ? (
            filteredBookings.map((b) => (
              <BookingCard key={b.id} booking={b} onClick={() => router.push(`/user/bookings/${b.id}`)} />
            ))
          ) : (
            <Fallback title="No bookings found" subtitle="Try adjusting your filters to see more results." />
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingMainContent;