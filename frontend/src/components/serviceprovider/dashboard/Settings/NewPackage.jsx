'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Image,
  Star,
} from 'lucide-react';

const NewPackage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [features, setFeatures] = useState(['Private Guide', 'Luxury Stay', 'All Meals Included']);
  const [newFeature, setNewFeature] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'normal',
    price: '',
    originalPrice: '',
    destination: '',
    duration: '',
    description: '',
    inclusions: '',
    exclusions: '',
    itinerary: '',
    highlights: '',
    isFeatured: false,
    status: 'active',
  });

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Here you would make an API call to save the package
      console.log('Form data:', { ...formData, features });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect back to packages list after successful submission
      router.push('/serviceprovider/dashboard/settings/packages');
    } catch (error) {
      console.error('Error creating package:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-4 -mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Package</h1>
                <p className="text-gray-600 mt-1">Add a new travel package to your offerings</p>
              </div>
            </div>
            <button
              type="submit"
              form="packageForm"
              disabled={isSubmitting}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Package
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form id="packageForm" onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Package Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="Eg: Premium Himalayan Trek"
                />
              </div>

              {/* Package Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="normal"
                      checked={formData.type === 'normal'}
                      onChange={handleChange}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Normal Package</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="premium"
                      checked={formData.type === 'premium'}
                      onChange={handleChange}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      Premium Package
                    </span>
                  </label>
                </div>
              </div>

              {/* Featured Package */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Featured packages appear first in listings</p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="29999"
                />
              </div>

              {/* Original Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="39999"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty if no discount</p>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination *
                </label>
                <input
                  type="text"
                  name="destination"
                  required
                  value={formData.destination}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="Eg: Himachal Pradesh"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  required
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="Eg: 7 Days 6 Nights"
                />
              </div>

              {/* Features */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Features
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                    placeholder="Add a feature"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg flex items-center gap-2"
                    >
                      <span>{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="hover:text-red-600 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Description *
                </label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="Describe your package in detail..."
                />
              </div>

              {/* Inclusions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inclusions
                </label>
                <textarea
                  name="inclusions"
                  value={formData.inclusions}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="What's included? (Separate with commas)"
                />
              </div>

              {/* Exclusions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exclusions
                </label>
                <textarea
                  name="exclusions"
                  value={formData.exclusions}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="What's not included? (Separate with commas)"
                />
              </div>

              {/* Highlights */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trip Highlights
                </label>
                <textarea
                  name="highlights"
                  value={formData.highlights}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="Key highlights of this trip..."
                />
              </div>

              {/* Itinerary */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Itinerary
                </label>
                <textarea
                  name="itinerary"
                  value={formData.itinerary}
                  onChange={handleChange}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  placeholder="Day 1: Arrival and check-in...&#10;Day 2: Sightseeing..."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              form="packageForm"
              disabled={isSubmitting}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Package
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                // Save as draft functionality
                setFormData({ ...formData, status: 'draft' });
              }}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Save as Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPackage;