'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Edit,
  Eye,
  MoreVertical,
  Star,
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Package as PackageIcon,
  ChevronRight,
  TrendingUp,
  Award,
  Heart,
  User,
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────── */
const fmtAmt = (a) => `₹${Number(a || 0).toLocaleString('en-IN')}`;

const Packages = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState('active');
  const [viewCategory, setViewCategory] = useState(tabFromUrl === 'trek' ? 'trek' : 'trip');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');

  // Fetch packages on mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/provider/packages');
        const data = await res.json();
        if (data.success) {
          const mappedPackages = data.packages.map(p => {
            let minPrice = 0;
            if (p.pricingTiers && p.pricingTiers.length > 0) {
              const prices = p.pricingTiers.map(t => parseInt(t.price)).filter(val => !isNaN(val));
              if (prices.length > 0) {
                minPrice = Math.min(...prices);
              }
            }

            const rawStatus = p.status || 'active';
            const displayStatus = rawStatus === 'published' ? 'active' : rawStatus;

            return {
              id: p._id,
              title: p.name,
              category: p.category || 'trip',
              type: p.packageCategory, // 'premium' or 'budget'
              price: minPrice,
              destination: p.destination,
              duration: `${p.days}d / ${p.nights || p.days - 1}n`,
              status: displayStatus,
              bookings: p.bookingsCount || 0, 
              rating: p.rating || 0,
              packageType: p.packageType,
              features: p.activities ? p.activities.slice(0, 3).map(a => a.name) : [],
              lastUpdated: p.updatedAt,
            };
          });
          setPackages(mappedPackages);
        }
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const q = search.toLowerCase();
  const filteredPackages = packages.filter(pkg =>
    (activeTab === 'active' ? pkg.status === 'active' : pkg.status === 'inactive') &&
    (pkg.category === viewCategory) &&
    (!q || pkg.title.toLowerCase().includes(q) || pkg.destination.toLowerCase().includes(q))
  );

  const togglePackageStatus = async (id) => {
    try {
      const res = await fetch(`/api/provider/packages?id=${id}`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setPackages(packages.map(pkg =>
          pkg.id === id ? { ...pkg, status: data.newStatus } : pkg
        ));
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const deletePackage = async (id) => {
    try {
      const res = await fetch(`/api/provider/packages?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPackages(packages.filter(pkg => pkg.id !== id));
      }
    } catch (error) {
      console.error('Error deleting package:', error);
    }
    setShowDeleteConfirm(null);
  };

  const duplicatePackage = async (id) => {
    try {
      const res = await fetch('/api/provider/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate', packageId: id })
      });
      const data = await res.json();
      if (data.success) {
        // Redir to the edit page of the duplicated package
        router.push(`/serviceprovider/dashboard/settings/packages/edit/${data.packageId}`);
      } else {
        alert(data.message || 'Failed to duplicate package');
      }
    } catch (error) {
      console.error('Error duplicating package:', error);
      alert('Error duplicating package');
    }
  };

  const PackageCard = ({ pkg, index }) => {
    const [showOptions, setShowOptions] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-0.5 transition-all duration-300"
      >
        <div className={`h-0.5 w-full ${pkg.type === 'premium' ? 'bg-amber-400' : 'bg-emerald-500'}`} />

        <div className="p-4 sm:p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {pkg.type === 'premium' && (
                  <span className="flex items-center gap-1.1 bg-amber-50 text-amber-600 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-amber-100">
                    <Award size={10} className="fill-amber-500" />
                    Premium
                  </span>
                )}
                {pkg.packageType === 'couple' && (
                  <span className="flex items-center gap-1 bg-rose-50 text-rose-600 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-rose-100">
                    <Heart size={10} className="fill-rose-500" />
                    Couple
                  </span>
                )}
                {pkg.packageType === 'individual' && (
                  <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-blue-100">
                    <User size={10} className="fill-blue-500" />
                    Individual
                  </span>
                )}
                <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${
                  pkg.status === 'active' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {pkg.status}
                </span>
              </div>
              <h3 className="text-[16px] font-bold text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors truncate">
                {pkg.title}
              </h3>
            </div>

            <div className="relative ml-2">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 flex items-center justify-center transition-all"
              >
                <MoreVertical size={16} />
              </button>

              <AnimatePresence>
                {showOptions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 z-20 py-1.5 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          togglePackageStatus(pkg.id);
                          setShowOptions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        {pkg.status === 'active' ? (
                          <>
                            <XCircle size={14} className="text-gray-400" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <CheckCircle size={14} className="text-emerald-500" />
                            Activate
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => {
                          duplicatePackage(pkg.id);
                          setShowOptions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[12px] font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <RefreshCw size={14} className="text-gray-400" />
                        Duplicate
                      </button>
                      <div className="h-px bg-gray-50 my-1" />
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(pkg.id);
                          setShowOptions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-[12px] font-medium text-rose-500 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-400 mb-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-emerald-400" />
              <span className="truncate max-w-[120px]">{pkg.destination}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-emerald-400" />
              <span>{pkg.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} className={pkg.rating > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
              <span className="font-bold text-gray-600">{pkg.rating || 'New'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {pkg.features.map((feature, i) => (
              <span key={i} className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-md font-medium">
                {feature}
              </span>
            ))}
          </div>

          <div className="flex items-end justify-between pt-4 border-t border-gray-50">
            <div>
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider leading-none mb-1">Starting from</p>
              <div className="flex items-center gap-2">
                 <span className="text-[20px] font-black text-gray-900 leading-none">{fmtAmt(pkg.price)}</span>
                 {pkg.bookings > 0 && (
                   <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md">
                     <TrendingUp size={10} />
                     {pkg.bookings}
                   </div>
                 )}
              </div>
            </div>

            <div className="flex gap-2">
               <button 
                onClick={() => router.push(`/serviceprovider/dashboard/settings/packages/edit/${pkg.id}`)}
                className="w-9 h-9 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-100 hover:border-emerald-100 rounded-xl transition-all shadow-sm active:scale-95"
               >
                <Edit size={15} />
               </button>
               <button 
                  onClick={() => router.push(`/serviceprovider/dashboard/settings/packages/view/${pkg.id}`)}
                  className="h-9 px-3.5 bg-emerald-600 text-white rounded-xl text-[12px] font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200/50 active:scale-95 flex items-center gap-1.5"
               >
                <Eye size={14} />
                <span>View</span>
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full space-y-6 pb-20">
      
      {/* ── Page Header & Command Bar ─────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
            <PackageIcon className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[17px] font-black text-gray-900 tracking-tight leading-none mb-1 truncate">Travel Packages</h1>
            <p className="text-[11px] text-gray-400 font-medium truncate">{packages.length} total offerings</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative hidden sm:block w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search packages…"
              className="w-full pl-8 pr-3 py-2 text-[12px] bg-white border border-gray-200 rounded-xl placeholder-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all shadow-sm shadow-gray-100"
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-[12px] font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Package</span>
              <span className="sm:hidden">Add</span>
            </button>
            
            <AnimatePresence>
              {showAddMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowAddMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 z-30 p-1.5 overflow-hidden"
                  >
                    <button
                      onClick={() => router.push('/serviceprovider/dashboard/settings/packages/new')}
                      className="w-full text-left p-3 hover:bg-emerald-50 rounded-xl transition-all group border border-transparent hover:border-emerald-100"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[13px] font-bold text-gray-800 group-hover:text-emerald-700">Trip Package</p>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-400 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[10px] text-gray-400 group-hover:text-emerald-500/70">For sightseeing & group tours</p>
                    </button>
                    <button
                      onClick={() => router.push('/serviceprovider/dashboard/settings/packages/new-trek')}
                      className="w-full text-left p-3 hover:bg-emerald-50 rounded-xl transition-all group border border-transparent hover:border-emerald-100 mt-0.5"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[13px] font-bold text-gray-800 group-hover:text-emerald-700">Trek Package</p>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-400 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-[10px] text-gray-400 group-hover:text-emerald-500/70">For hiking & mountain tours</p>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search packages by name or destination…"
          className="w-full pl-10 pr-4 py-2.5 text-[12px] bg-white border border-gray-100 rounded-xl placeholder-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 transition-all shadow-sm"
        />
      </div>

      {/* ── Stats Summary ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Active" value={packages.filter(p => p.status === 'active').length} color="bg-emerald-500" lightColor="bg-emerald-50" textColor="text-emerald-600" />
        <StatCard label="Inactive" value={packages.filter(p => p.status === 'inactive').length} color="bg-gray-400" lightColor="bg-gray-50" textColor="text-gray-500" />
        <StatCard label="Premium" value={packages.filter(p => p.type === 'premium').length} color="bg-amber-400" lightColor="bg-amber-50" textColor="text-amber-600" />
      </div>

      {/* ── Quick Filter Tabs ─────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 shrink-0">
          <button
            onClick={() => setViewCategory('trip')}
            className={`flex items-center gap-1.5 py-1.5 px-4 rounded-xl text-[11px] font-bold transition-all duration-200 ${
              viewCategory === 'trip' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Trips
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${viewCategory === 'trip' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200'}`}>
              {packages.filter(p => p.category === 'trip').length}
            </span>
          </button>
          <button
            onClick={() => setViewCategory('trek')}
            className={`flex items-center gap-1.5 py-1.5 px-4 rounded-xl text-[11px] font-bold transition-all duration-200 ${
              viewCategory === 'trek' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Treks
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${viewCategory === 'trek' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200'}`}>
              {packages.filter(p => p.category === 'trek').length}
            </span>
          </button>
        </div>

        <div className="h-4 w-px bg-gray-200 hidden sm:block" />

        <div className="flex bg-gray-100 p-1 rounded-2xl gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-1.5 py-1.5 px-4 rounded-xl text-[11px] font-bold transition-all duration-200 ${
              activeTab === 'active' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Active
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200'}`}>
              {packages.filter(p => p.status === 'active').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`flex items-center gap-1.5 py-1.5 px-4 rounded-xl text-[11px] font-bold transition-all duration-200 ${
              activeTab === 'inactive' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Inactive
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === 'inactive' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200'}`}>
              {packages.filter(p => p.status === 'inactive').length}
            </span>
          </button>
        </div>
      </div>

      <div className="relative">
        {!isLoading && (
          <p className="text-[11px] text-gray-400 font-medium mb-3 px-1">
            Showing {filteredPackages.length} {activeTab} {viewCategory}{filteredPackages.length !== 1 ? 's' : ''}
            {search && ` · matching "${search}"`}
          </p>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-[13px] font-medium text-gray-400">Loading your packages...</p>
            </motion.div>
          ) : filteredPackages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center justify-center py-24 px-4 rounded-[32px] border border-gray-200 bg-white/50 border-dashed"
            >
              <div className="w-16 h-16 rounded-[24px] bg-white shadow-xl shadow-gray-100 border border-gray-100 flex items-center justify-center mb-6">
                <PackageIcon size={30} className="text-gray-200" />
              </div>
              <h3 className="text-[16px] font-black text-gray-900 mb-2">No results found</h3>
              <p className="text-[12px] text-gray-400 text-center max-w-[240px] font-medium mb-8">
                {search 
                  ? `We couldn't find any packages matching "${search}" in this category.` 
                  : `You haven't listed any ${activeTab} ${viewCategory} packages yet.`}
              </p>
              <button
                onClick={() => { setShowAddMenu(true); setSearch(''); }}
                className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-2xl text-[12px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                Create new package
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredPackages.map((pkg, idx) => (
                  <PackageCard key={pkg.id} pkg={pkg} index={idx} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <Trash2 size={28} />
                </div>
                <h3 className="text-[18px] font-black text-gray-900 mb-2">Delete Package?</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-6 font-medium">
                  Are you sure you want to remove this package? This action is permanent and cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-500 text-[13px] font-bold rounded-xl hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deletePackage(showDeleteConfirm)}
                    className="flex-1 px-4 py-2.5 bg-rose-500 text-white text-[13px] font-bold rounded-xl hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all"
                  >
                    Delete Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, color, lightColor, textColor, className = "" }) => (
  <div className={`p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 shrink-0 ${className}`}>
    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${lightColor} rounded-xl flex items-center justify-center shrink-0`}>
      <div className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full ${color}`} />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1 truncate">{label}</p>
      <p className={`text-[16px] sm:text-[18px] font-black ${textColor} leading-none`}>{value}</p>
    </div>
  </div>
);

export default Packages;