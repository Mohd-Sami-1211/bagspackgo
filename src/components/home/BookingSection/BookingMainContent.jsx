'use client';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, SlidersHorizontal, Calendar, Compass, Mountain, Ticket, Inbox } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BookingCard from 'src/components/home/BookingSection/BookingCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const BookingMainContent = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming-bookings');

  // ===== Booking Data from API =====
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const safeFetch = (url) => fetch(url).catch(() => ({ json: async () => ({ success: false, data: [] }) }));
        const safeJson = (res) => res.json().catch(() => ({ success: false, data: [] }));
        
        const [eventsRes, tripsRes, treksRes] = await Promise.all([
          safeFetch('/api/user/bookings'),
          safeFetch('/api/user/trip-bookings'),
          safeFetch('/api/user/trek-bookings'),
        ]);
        const [eventsData, tripsData, treksData] = await Promise.all([
          safeJson(eventsRes), 
          safeJson(tripsRes), 
          safeJson(treksRes)
        ]);

        const now = new Date();
        const allFetched = [];

        const ensureString = (val) => {
          if (!val) return '';
          if (typeof val === 'object') return val.label || val.value || JSON.stringify(val);
          return String(val);
        };

        if (eventsData.success && eventsData.data) {
          eventsData.data.forEach(b => {
            const bId = b.id || b._id;
            allFetched.push({
              ...b,
              id: bId,
              type: 'Event',
              name: ensureString(b.name),
              destination: ensureString(b.destination),
              category: ensureString(b.category),
              guide: ensureString(b.guide),
              passUrl: b.passUrl || `/user/event/pass/${bId}`,
              createdAt: b.createdAt || b.bookingDate,
            });
          });
        }

        if (tripsData.success && tripsData.data) {
          tripsData.data.forEach(b => {
            const bId = b.id || b._id;
            allFetched.push({
              id: bId,
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
              passUrl: `/user/trip/pass/${bId}`,
              cancellationDetails: b.cancellationDetails || {},
              personalDetails: b.personalDetails || {},
              arrivalDeparture: b.arrivalDeparture || {},
              packageSnapshot: b.packageSnapshot || {},
              guideName: b.guideName || '',
              companyName: b.companyName || '',
              providerPhone: b.providerPhone || '',
              providerEmail: b.providerEmail || '',
              createdAt: b.createdAt || b.bookingDate,
            });
          });
        }

        if (treksData.success && treksData.data) {
          treksData.data.forEach(b => {
            const bId = b.id || b._id;
            allFetched.push({
              id: bId,
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
              passUrl: `/user/trek/pass/${bId}`,
              createdAt: b.createdAt || b.bookingDate,
            });
          });
        }

        // Sort by newest bookings first using creation date (createdAt)
        allFetched.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.date || 0).getTime();
          const timeB = new Date(b.createdAt || b.date || 0).getTime();
          return timeB - timeA;
        });
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

  // ——— Filter chips data ———
  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];
  const categoryFilters = [
    { key: 'all', label: 'All Types' },
    { key: 'Trip', label: 'Trips', icon: Compass },
    { key: 'Trek', label: 'Treks', icon: Mountain },
    { key: 'Event', label: 'Events', icon: Ticket },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-2 sm:py-4 mb-16 font-sans">

      {/* ——— Page header ——— */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">My Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track your travel experiences.</p>
        </div>
      </div>

      {/* ——— Filter chips ——— */}
      <div className="space-y-3 mb-6">
        {/* Status filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {statusFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setBookingStatusFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                bookingStatusFilter === f.key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categoryFilters.map(f => {
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                onClick={() => setBookingCategoryFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                  bookingCategoryFilter === f.key
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* ——— Results count ——— */}
      {!loading && (
        <p className="text-xs font-medium text-gray-400 mb-4">
          {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* ——— Booking list ——— */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900 mb-4" />
            <p className="text-sm font-medium text-gray-500">Loading your bookings…</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((b) => (
            <BookingCard key={b.id} booking={b} onClick={() => router.push(`/user/bookings/${b.id}`)} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">No bookings found</h3>
            <p className="text-sm text-gray-400 max-w-xs">Try adjusting your filters or book your next adventure.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingMainContent;