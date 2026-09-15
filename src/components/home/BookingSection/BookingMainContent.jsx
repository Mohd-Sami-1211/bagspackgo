'use client';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Compass, Ticket, Inbox, ChevronLeft, ChevronRight, CheckCircle2, CalendarCheck2 } from 'lucide-react';
import BookingCard from 'src/components/home/BookingSection/BookingCard';
import AccountPageHeader from '@/components/user/AccountPageHeader';
import { packageHeroFor } from '@/lib/packageHero';

const BookingMainContent = () => {
  const router = useRouter();
  const { data: allBookings = [], error: bookingsError, isLoading: loading } = useSWR('user-confirmed-bookings-feed', async () => {
        const fetchBookings = async (url) => {
          const response = await fetch(url, { headers: { Accept: 'application/json' } });
          const payload = await response.json().catch(() => null);
          if (!response.ok || !payload?.success) throw new Error(payload?.message || 'Unable to load bookings');
          return payload;
        };

        const [eventsResult, tripsResult] = await Promise.allSettled([
          fetchBookings('/api/user/bookings?view=list'),
          fetchBookings('/api/user/trip-bookings?view=list'),
        ]);
        if (eventsResult.status === 'rejected' && tripsResult.status === 'rejected') {
          throw new Error('Unable to load your bookings');
        }
        const eventsData = eventsResult.status === 'fulfilled' ? eventsResult.value : { success: false, data: [] };
        const tripsData = tripsResult.status === 'fulfilled' ? tripsResult.value : { success: false, data: [] };

        const allFetched = [];

        const ensureString = (val) => {
          if (!val) return '';
          if (typeof val === 'object') return val.label || val.value || JSON.stringify(val);
          return String(val);
        };

        if (eventsData.success && eventsData.data) {
          eventsData.data.forEach(b => {
            // My Bookings is intentionally a confirmed-bookings view. Pending
            // checkouts are reconciled by the payment flow and must not look
            // like usable bookings to the traveller.
            if (b.status !== 'confirmed') return;
            const bId = b.id || b._id;
            allFetched.push({
              ...b,
              id: bId,
              packageId: b.packageId,
              type: 'Event',
              name: ensureString(b.name),
              destination: ensureString(b.destination),
              category: ensureString(b.category),
              guide: ensureString(b.guide),
              passUrl: b.status === 'confirmed' ? (b.passUrl || `/user/event/pass/${bId}`) : null,
              createdAt: b.createdAt || b.bookingDate,
            });
          });
        }

        if (tripsData.success && tripsData.data) {
          tripsData.data.forEach(b => {
            if (b.status !== 'confirmed') return;
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
              totalAmount: b.totalAmount,
              amountPaid: b.amountPaid ?? b.totalAmount,
              remainingAmount: b.remainingAmount ?? Math.max(0, Number(b.totalAmount || 0) - Number(b.amountPaid ?? b.totalAmount ?? 0)),
              paymentMode: b.paymentMode || 'full',
              people: b.numPeople,
              bookingRef: b.bookingRef,
              duration: `${b.days} Days`,
              image: packageHeroFor(b.packageId || bId),
              passUrl: b.status === 'confirmed' ? `/user/trip/pass/${bId}` : null,
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



        // Sort by newest bookings first using creation date (createdAt)
        allFetched.sort((a, b) => {
          const timeA = new Date(a.createdAt || a.date || 0).getTime();
          const timeB = new Date(b.createdAt || b.date || 0).getTime();
          return timeB - timeA;
        });
        return allFetched;
  }, { dedupingInterval: 60000, revalidateOnFocus: false, keepPreviousData: true });

  const [bookingStatusFilter, setBookingStatusFilter] = useState('upcoming');
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);

  const dateFilteredBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allBookings.filter((b) => {
      const bookingDate = new Date(b.date);
      const matchStatus =
        bookingStatusFilter === 'all' ||
        (bookingStatusFilter === 'upcoming' && bookingDate >= today) ||
        (bookingStatusFilter === 'completed' && bookingDate < today);
      return matchStatus;
    });
  }, [allBookings, bookingStatusFilter]);
  const filteredBookings = useMemo(() => dateFilteredBookings.filter((booking) => bookingCategoryFilter === 'all' || booking.type === bookingCategoryFilter), [dateFilteredBookings, bookingCategoryFilter]);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const paginatedBookings = filteredBookings.slice((page - 1) * pageSize, page * pageSize);
  const tripCount = dateFilteredBookings.filter((booking) => booking.type === 'Trip').length;
  const eventCount = dateFilteredBookings.filter((booking) => booking.type === 'Event').length;

  const updateStatusFilter = (value) => {
    setBookingStatusFilter(value);
    setPage(1);
  };

  const updateCategoryFilter = (value) => {
    setBookingCategoryFilter(value);
    setPage(1);
  };

  // ——— Filter chips data ———
  const statusFilters = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Past' },
    { key: 'all', label: 'All confirmed' },
  ];
  const categoryFilters = [
    { key: 'all', label: 'All Types' },
    { key: 'Trip', label: 'Trips', icon: Compass },
    { key: 'Event', label: 'Events', icon: Ticket },
  ];

  return (
    <main className="min-h-screen bg-[#f5f8f6] pb-16 pt-8 font-sans sm:pt-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AccountPageHeader eyebrow="Your journeys" title="My Bookings" description="View your confirmed trips and events in one place." icon={CalendarCheck2} backHref="/" trailing={<div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-black text-emerald-800"><CheckCircle2 className="h-4 w-4" />{allBookings.length} confirmed</div>} />

        <section className="mt-8 border-b border-slate-200">
          <div className="flex gap-7 overflow-x-auto scrollbar-hide">
            {statusFilters.map((filter) => <button key={filter.key} onClick={() => updateStatusFilter(filter.key)} className={`relative whitespace-nowrap px-1 pb-4 text-sm font-black transition ${bookingStatusFilter === filter.key ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'}`}>{filter.label}{bookingStatusFilter === filter.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-700" />}</button>)}
          </div>
        </section>

        <section className="my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categoryFilters.map((filter) => { const Icon = filter.icon; const count = filter.key === 'Trip' ? tripCount : filter.key === 'Event' ? eventCount : dateFilteredBookings.length; return <button key={filter.key} onClick={() => updateCategoryFilter(filter.key)} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${bookingCategoryFilter === filter.key ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50'}`}>{Icon && <Icon className="h-3.5 w-3.5" />}{filter.label} ({count})</button>; })}
          </div>
          <p className="text-xs font-semibold text-slate-400">{filteredBookings.length} booking{filteredBookings.length === 1 ? '' : 's'}</p>
        </section>

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((item) => <div key={item} className="h-60 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"><div className="h-full w-full rounded-xl bg-slate-100" /></div>)}
          </div>
        ) : bookingsError ? (
          <div className="rounded-[28px] border border-rose-200 bg-white px-6 py-20 text-center shadow-sm"><Inbox className="mx-auto h-9 w-9 text-rose-400" /><h2 className="mt-4 text-xl font-black text-slate-900">We could not load your bookings</h2><p className="mt-2 text-sm text-slate-500">Check your connection and try this page again.</p></div>
        ) : paginatedBookings.length > 0 ? (
          <div className="space-y-5">
            {paginatedBookings.map((booking) => <BookingCard key={`${booking.type}-${booking.id}`} booking={booking} onClick={() => router.push(`/user/bookings/${booking.id}`)} />)}
          </div>
        ) : (
          <div className="rounded-[30px] border border-dashed border-emerald-200 bg-white px-6 py-20 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50"><Inbox className="h-7 w-7 text-emerald-600" /></div><h2 className="mt-5 text-xl font-black text-slate-900">No confirmed bookings here</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Only confirmed bookings appear on this page. Try another filter if you are looking for a past trip or event.</p></div>
        )}

        {!loading && !bookingsError && totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Booking pages">
            <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft className="h-4 w-4" /></button>
            <span className="rounded-full bg-white px-5 py-2.5 text-xs font-black text-slate-700 shadow-sm">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-35"><ChevronRight className="h-4 w-4" /></button>
          </nav>
        )}
      </div>
    </main>
  );
};

export default BookingMainContent;
