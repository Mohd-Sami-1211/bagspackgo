'use client';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClipboardList, FaUsers, FaHeart, FaFilter, FaCalendarAlt, FaHistory } from 'react-icons/fa';
import BookingCard from '@/components/home/BookingSection/BookingCard';
import MergerCard from '@/components/home/BookingSection/MergerCard';

const BookingMainContent = () => {
  const [activeTab, setActiveTab] = useState('upcoming-bookings');

  // ===== Sample Data (3 current, 2 past, 2 mergers) =====
  const currentBookings = [
    {
      id: 1,
      category: 'Trek',
      name: 'Annapurna Base Camp Trek',
      guide: 'Rajesh Thapa',
      date: '2025-11-15',
      duration: '10 days',
      people: 4,
      destination: 'Pokhara, Nepal',
      price: 90000,
      image: 'https://images.unsplash.com/photo-1509644851229-fe68a58f0e1a'
    },
    {
      id: 2,
      category: 'Trip',
      name: 'Goa Luxury Beach Getaway',
      guide: 'Anjali Mehta',
      date: '2025-12-05',
      duration: '3 days',
      people: 2,
      destination: 'Goa, India',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
    },
    {
      id: 3,
      category: 'Event',
      name: 'Mountain Biking Championship',
      guide: 'Arun Patil',
      date: '2025-01-20',
      duration: '1 day',
      people: 1,
      destination: 'Manali, India',
      price: 5000,
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c'
    }
  ];

  const pastBookings = [
    {
      id: 4,
      category: 'Trek',
      name: 'Everest View Trek',
      guide: 'Mingma Sherpa',
      date: '2025-05-10',
      duration: '7 days',
      people: 3,
      destination: 'Kathmandu, Nepal',
      price: 70000,
      image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d9'
    },
    {
      id: 5,
      category: 'Trip',
      name: 'Kerala Backwaters Experience',
      guide: 'Ajay Menon',
      date: '2025-02-12',
      duration: '5 days',
      people: 2,
      destination: 'Alleppey, India',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1541417904950-b855846fe074'
    }
  ];

  const mergers = [
    {
      id: 1,
      name: 'Himalayan Explorers Group',
      location: 'Multiple destinations',
      guide: 'Ramesh',
      date: '2025-12-01',
      price: 76000,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1509644851229-fe68a58f0e1a',
      destination: 'Kashmir',
      members: '8/10',
      capacity: '10'
    },
    {
      id: 2,
      name: 'Uttarakhand Trail Mix',
      location: 'Uttarakhand',
      guide: 'Sneha',
      date: '2025-09-10',
      price: 26000,
      status: 'active',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
      destination: 'Uttarakhand',
      members: '6/12',
      capacity: '12'
    }
  ];

  const wishlist = [
    // can be filled later; left empty to show fallback UI
  ];

  // ===== Filters state =====
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState('all');
  const [mergerStatusFilter, setMergerStatusFilter] = useState('all');
  const [mergerDestinationFilter, setMergerDestinationFilter] = useState('all');
  const [wishlistSort, setWishlistSort] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);

  // ===== Derived filtered lists =====
  const filteredCurrentBookings = useMemo(() => {
    return currentBookings.filter((b) => {
      const statusMatch =
        bookingStatusFilter === 'all' ||
        (bookingStatusFilter === 'upcoming' && new Date(b.date) >= new Date()) ||
        (bookingStatusFilter === 'completed' && new Date(b.date) < new Date() ||
        (bookingStatusFilter === 'cancelled' && b.status === 'cancelled'));
      const categoryMatch = bookingCategoryFilter === 'all' || b.category === bookingCategoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [currentBookings, bookingStatusFilter, bookingCategoryFilter]);

  const filteredPastBookings = useMemo(() => {
    return pastBookings.filter((b) => {
      const statusMatch =
        bookingStatusFilter === 'all' ||
        (bookingStatusFilter === 'upcoming' && new Date(b.date) >= new Date()) ||
        (bookingStatusFilter === 'completed' && new Date(b.date) < new Date() ||
        (bookingStatusFilter === 'cancelled' && b.status === 'cancelled'));
      const categoryMatch = bookingCategoryFilter === 'all' || b.category === bookingCategoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [pastBookings, bookingStatusFilter, bookingCategoryFilter]);

  const filteredMergers = useMemo(() => {
    return mergers.filter((m) => {
      const statusMatch = mergerStatusFilter === 'all' || m.status === mergerStatusFilter;
      const destMatch = mergerDestinationFilter === 'all' || m.destination === mergerDestinationFilter;
      return statusMatch && destMatch;
    });
  }, [mergers, mergerStatusFilter, mergerDestinationFilter]);

  // ===== Small UI components =====
  const SidebarButton = ({ tab, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full text-left ${
        activeTab === tab ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon />
      {label}
    </button>
  );

  const FilterButton = ({ active, children, onClick }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
        active ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );

  const SectionHeader = ({ children }) => (
    <div className="flex items-center justify-between mb-4">
      {children}
    </div>
  );

  const Fallback = ({ title, subtitle }) => (
    <div className="flex flex-col items-center justify-center py-14 text-center text-gray-500">
      <div className="w-36 h-36 rounded-xl bg-gradient-to-tr from-emerald-50 to-teal-50 flex items-center justify-center mb-4">
        <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
          <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-sm">{subtitle}</p>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-6 mx-auto max-w-7xl mb-16 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg py-6 px-4">
      {/* SIDEBAR */}
      <aside className="md:w-64 bg-white rounded-2xl shadow-lg p-4 top-20 h-fit">
        <div className="mb-3 px-2">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Bookings</h4>
          <div className="space-y-1">
            <SidebarButton tab="upcoming-bookings" icon={FaCalendarAlt} label="Upcoming" />
            <SidebarButton tab="past-bookings" icon={FaHistory} label="Past Bookings" />
          </div>
        </div>

        <div className="mb-3 px-2 mt-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Others</h4>
          <div className="space-y-1">
            <SidebarButton tab="mergers" icon={FaUsers} label="My Mergers" />
            <SidebarButton tab="wishlist" icon={FaHeart} label="Wishlist" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {/* UPCOMING BOOKINGS */}
          {activeTab === 'upcoming-bookings' && (
            <motion.section
              key="upcoming-bookings"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <SectionHeader>
                <h2 className="text-2xl font-bold text-green-600">My Bookings</h2>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <FaFilter className="text-xs" />
                  Filters
                </button>
              </SectionHeader>

              {/* Filters for bookings */}
              {showFilters && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                      <div className="flex flex-wrap gap-2">
                        <FilterButton 
                          active={bookingStatusFilter === 'all'} 
                          onClick={() => setBookingStatusFilter('all')}
                        >
                          All
                        </FilterButton>
                        <FilterButton 
                          active={bookingStatusFilter === 'upcoming'} 
                          onClick={() => setBookingStatusFilter('upcoming')}
                        >
                          Upcoming
                        </FilterButton>
                        <FilterButton 
                          active={bookingStatusFilter === 'completed'} 
                          onClick={() => setBookingStatusFilter('completed')}
                        >
                          Completed
                        </FilterButton>
                        <FilterButton 
                          active={bookingStatusFilter === 'cancelled'} 
                          onClick={() => setBookingStatusFilter('cancelled')}
                        >
                          Cancelled
                        </FilterButton>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                      <div className="flex flex-wrap gap-2">
                        <FilterButton 
                          active={bookingCategoryFilter === 'all'} 
                          onClick={() => setBookingCategoryFilter('all')}
                        >
                          All
                        </FilterButton>
                        <FilterButton 
                          active={bookingCategoryFilter === 'Trip'} 
                          onClick={() => setBookingCategoryFilter('Trip')}
                        >
                          Trips
                        </FilterButton>
                        <FilterButton 
                          active={bookingCategoryFilter === 'Trek'} 
                          onClick={() => setBookingCategoryFilter('Trek')}
                        >
                          Treks
                        </FilterButton>
                        <FilterButton 
                          active={bookingCategoryFilter === 'Event'} 
                          onClick={() => setBookingCategoryFilter('Event')}
                        >
                          Events
                        </FilterButton>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {filteredCurrentBookings.length ? (
                  filteredCurrentBookings.map((b) => (
                    <BookingCard key={b.id} booking={b} onClick={() => alert(`Open booking: ${b.name}`)} />
                  ))
                ) : (
                  <Fallback
                    title="No upcoming bookings"
                    subtitle="Looks like you don't have any upcoming bookings — explore trips and add to your bookings!"
                  />
                )}
              </div>
            </motion.section>
          )}

          {/* PAST BOOKINGS */}
          {activeTab === 'past-bookings' && (
            <motion.section
              key="past-bookings"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <SectionHeader>
                <h2 className="text-2xl font-bold text-green-600">Past Bookings</h2>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <FaFilter className="text-xs" />
                  Filters
                </button>
              </SectionHeader>

              {/* Filters for bookings */}
              {showFilters && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                      <div className="flex flex-wrap gap-2">
                        <FilterButton 
                          active={bookingStatusFilter === 'all'} 
                          onClick={() => setBookingStatusFilter('all')}
                        >
                          All
                        </FilterButton>
                        <FilterButton 
                          active={bookingStatusFilter === 'upcoming'} 
                          onClick={() => setBookingStatusFilter('upcoming')}
                        >
                          Upcoming
                        </FilterButton>
                        <FilterButton 
                          active={bookingStatusFilter === 'completed'} 
                          onClick={() => setBookingStatusFilter('completed')}
                        >
                          Completed
                        </FilterButton>
                        <FilterButton 
                          active={bookingStatusFilter === 'cancelled'} 
                          onClick={() => setBookingStatusFilter('cancelled')}
                        >
                          Cancelled
                        </FilterButton>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                      <div className="flex flex-wrap gap-2">
                        <FilterButton 
                          active={bookingCategoryFilter === 'all'} 
                          onClick={() => setBookingCategoryFilter('all')}
                        >
                          All
                        </FilterButton>
                        <FilterButton 
                          active={bookingCategoryFilter === 'Trip'} 
                          onClick={() => setBookingCategoryFilter('Trip')}
                        >
                          Trips
                        </FilterButton>
                        <FilterButton 
                          active={bookingCategoryFilter === 'Trek'} 
                          onClick={() => setBookingCategoryFilter('Trek')}
                        >
                          Treks
                        </FilterButton>
                        <FilterButton 
                          active={bookingCategoryFilter === 'Event'} 
                          onClick={() => setBookingCategoryFilter('Event')}
                        >
                          Events
                        </FilterButton>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {filteredPastBookings.length ? (
                  filteredPastBookings.map((b) => (
                    <BookingCard key={b.id} booking={b} past onClick={() => alert(`Open booking: ${b.name}`)} />
                  ))
                ) : (
                  <Fallback
                    title="No past bookings"
                    subtitle="You don't have any past bookings that match the filters."
                  />
                )}
              </div>
            </motion.section>
          )}

          {/* MERGERS */}
          {activeTab === 'mergers' && (
            <motion.section
              key="mergers"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <SectionHeader>
                <h2 className="text-2xl font-bold text-green-600">My Mergers</h2>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <FaFilter className="text-xs" />
                  Filters
                </button>
              </SectionHeader>

              {/* Merger filters */}
              {showFilters && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                      <div className="flex flex-wrap gap-2">
                        <FilterButton 
                          active={mergerStatusFilter === 'all'} 
                          onClick={() => setMergerStatusFilter('all')}
                        >
                          All
                        </FilterButton>
                        <FilterButton 
                          active={mergerStatusFilter === 'active'} 
                          onClick={() => setMergerStatusFilter('active')}
                        >
                          Active
                        </FilterButton>
                        <FilterButton 
                          active={mergerStatusFilter === 'cancelled'} 
                          onClick={() => setMergerStatusFilter('cancelled')}
                        >
                          Cancelled
                        </FilterButton>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Destination</label>
                      <div className="flex flex-wrap gap-2">
                        <FilterButton 
                          active={mergerDestinationFilter === 'all'} 
                          onClick={() => setMergerDestinationFilter('all')}
                        >
                          All
                        </FilterButton>
                        <FilterButton 
                          active={mergerDestinationFilter === 'Kashmir'} 
                          onClick={() => setMergerDestinationFilter('Kashmir')}
                        >
                          Kashmir
                        </FilterButton>
                        <FilterButton 
                          active={mergerDestinationFilter === 'Uttarakhand'} 
                          onClick={() => setMergerDestinationFilter('Uttarakhand')}
                        >
                          Uttarakhand
                        </FilterButton>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                {filteredMergers.length ? (
                  filteredMergers.map((m) => (
                    <MergerCard key={m.id} merger={m} onClick={() => alert(`Open merger: ${m.name}`)} />
                  ))
                ) : (
                  <Fallback
                    title="No mergers yet"
                    subtitle="Create or join a merger (group) to travel with others — matches will show here."
                  />
                )}
              </div>
            </motion.section>
          )}

          {/* WISHLIST */}
          {activeTab === 'wishlist' && (
            <motion.section
              key="wishlist"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <SectionHeader>
                <h2 className="text-2xl font-bold text-green-600">Wishlist</h2>
                <div className="flex items-center gap-3">
                  <select
                    className="px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                    value={wishlistSort}
                    onChange={(e) => setWishlistSort(e.target.value)}
                  >
                    <option value="recent">Most recent</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                  </select>
                </div>
              </SectionHeader>

              <div className="grid grid-cols-1 gap-4">
                {wishlist.length ? (
                  wishlist.map((w, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-4 shadow">
                      {w}
                    </div>
                  ))
                ) : (
                  <Fallback
                    title="Your wishlist is empty"
                    subtitle="Tap the heart on any trip to save it here for later."
                  />
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default BookingMainContent;