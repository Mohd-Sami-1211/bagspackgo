'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  Archive,
  RefreshCw,
  Package,
} from 'lucide-react';

const Packages = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch packages on mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/provider/packages');
        const data = await res.json();
        if (data.success) {
          // Re-map db package object to match existing UI
          const mappedPackages = data.packages.map(p => {
            // get minimum price among tiers
            let minPrice = 'N/A';
            if (p.pricingTiers && p.pricingTiers.length > 0) {
              const prices = p.pricingTiers.map(t => parseInt(t.price)).filter(val => !isNaN(val));
              if (prices.length > 0) {
                minPrice = `₹${Math.min(...prices).toLocaleString('en-IN')}`;
              }
            }

            // Normalize status: treat legacy 'published' as 'active'
            const rawStatus = p.status || 'active';
            const displayStatus = rawStatus === 'published' ? 'active' : rawStatus;

            return {
              id: p._id,
              title: p.name,
              type: p.packageType,
              price: minPrice,
              destination: p.destination,
              duration: `${p.days} Days`,
              status: displayStatus,
              bookings: 0,
              rating: p.rating || 0,
              features: p.activities ? p.activities.slice(0, 3).map(a => a.name) : [],
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

  const filteredPackages = packages.filter(pkg =>
    activeTab === 'active' ? pkg.status === 'active' : pkg.status === 'inactive'
  );

  const togglePackageStatus = async (id) => {
    try {
      const res = await fetch(`/api/provider/packages?id=${id}`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setPackages(packages.map(pkg =>
          pkg.id === id ? { ...pkg, status: data.newStatus } : pkg
        ));
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Internal error when updating package status');
    }
  };

  const deletePackage = async (id) => {
    try {
      const res = await fetch(`/api/provider/packages?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPackages(packages.filter(pkg => pkg.id !== id));
      } else {
        alert(data.message || 'Failed to delete package');
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Internal error when deleting package');
    }
    setShowDeleteConfirm(null);
  };
  const handleAddNewPackage = () => {
    const el = document.getElementById('add-package-dropdown');
    if (el) el.classList.toggle('hidden');
  };

  const handleBackToSettings = () => {
    router.push('/serviceprovider/dashboard/settings');
  };

  const PackageCard = ({ pkg }) => {
    const [showOptions, setShowOptions] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        {/* Premium Badge */}
        {pkg.type === 'premium' && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 text-sm font-semibold">
            <div className="flex items-center gap-1">
              <Star size={14} />
              <span>PREMIUM</span>
            </div>
          </div>
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{pkg.title}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{pkg.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{pkg.duration}</span>
                </div>
              </div>
            </div>

            {/* Three dots menu */}
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <MoreVertical size={20} />
              </button>

              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      togglePackageStatus(pkg.id);
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                  >
                    {pkg.status === 'active' ? (
                      <>
                        <XCircle size={16} className="text-gray-500" />
                        <span>Make Inactive</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="text-gray-500" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      // Handle edit - redirect to edit page or open modal
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit size={16} className="text-gray-500" />
                    <span>Edit Package</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                    <RefreshCw size={16} className="text-gray-500" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(pkg.id);
                      setShowOptions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    <span>Delete Package</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {pkg.features.map((feature, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{pkg.price}</span>
                {pkg.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">{pkg.originalPrice}</span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(pkg.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({pkg.rating}) • {pkg.bookings} bookings</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition flex items-center gap-2">
                <Eye size={16} />
                View
              </button>
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2">
                <Edit size={16} />
                Edit
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4 -mt-2">
          {/* Back button and title */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleBackToSettings}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Travel Packages</h1>
              <p className="text-gray-600 mt-1">Manage your tour packages and create new ones</p>
            </div>
          </div>

          {/* Stats and Add button */}
          <div className="flex justify-between items-center">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-medium">
                  Active: {packages.filter(p => p.status === 'active').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm font-medium">
                  Inactive: {packages.filter(p => p.status === 'inactive').length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium">
                  Premium: {packages.filter(p => p.type === 'premium').length}
                </span>
              </div>
            </div>

            {/* Add New Package Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  const el = document.getElementById('add-package-dropdown');
                  if (el) el.classList.toggle('hidden');
                }}
                className="bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
              >
                <Plus size={20} />
                Add New Package
              </button>
              <div
                id="add-package-dropdown"
                className="hidden absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10 overflow-hidden"
              >
                <button
                  onClick={() => router.push('/serviceprovider/dashboard/settings/packages/new')}
                  className="w-full text-left px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700 transition text-sm font-medium border-b"
                >
                  Trip Package
                </button>
                <button
                  onClick={() => router.push('/serviceprovider/dashboard/settings/packages/new-trek')}
                  className="w-full text-left px-4 py-3 hover:bg-emerald-50 hover:text-emerald-700 transition text-sm font-medium"
                >
                  Trek Package
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'active' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                Active Packages ({packages.filter(p => p.status === 'active').length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'inactive' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="flex items-center gap-2">
                <XCircle size={16} />
                Inactive Packages ({packages.filter(p => p.status === 'inactive').length})
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No {activeTab} packages found</h3>
            <p className="text-gray-500 mt-1">
              {activeTab === 'active'
                ? 'All your packages are currently inactive'
                : 'All your packages are currently active'}
            </p>
            <button
              onClick={() => {
                const el = document.getElementById('add-package-dropdown');
                if (el) el.classList.remove('hidden');
              }}
              className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Create Your First Package
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Package</h3>
                <p className="text-gray-500 mb-6">
                  Are you sure you want to delete this package? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => deletePackage(showDeleteConfirm)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Delete Package
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Packages;