'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiInfo, 
  FiCheckCircle, 
  FiDollarSign, 
  FiCalendar, 
  FiUsers, 
  FiMapPin, 
  FiUser, 
  FiUpload, 
  FiChevronRight,
  FiChevronLeft,
  FiCreditCard,
  FiShield,
  FiAlertCircle,
  FiClock,
  FiSun,
  FiMoon,
  FiCoffee,
  FiCompass,
  FiGlobe,
  FiStar,
  FiHeart
} from 'react-icons/fi';

const NewMerger = ({ data = { guides: [], destinations: [] } }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    date: '',
    guideId: '',
    destinationId: '',
    members: '4/10',
    paymentOption: 'full',
    name: '',
    email: '',
    mobile: '',
    idType: 'passport',
    idNumber: '',
    idPhoto: null
  });

  const { guides, destinations } = data;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const calculateTotal = () => {
    const selectedGuide = guides.find(g => g.id === formData.guideId);
    const basePrice = selectedGuide ? selectedGuide.price.individual : 0;
    return formData.paymentOption === 'full' ? basePrice + 100 : 100;
  };

  const handleNext = (e) => {
    e?.preventDefault();
    if (activeTab < 3) {
      setActiveTab(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (activeTab > 0) {
      setActiveTab(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredGuides = guides.filter(g => g.location === formData.destinationId);
  const selectedGuide = guides.find(g => g.id === formData.guideId);
  const selectedDestination = destinations.find(d => d.value === formData.destinationId);

  const getItinerary = () => {
    if (!formData.destinationId) return [];
    
    return [
      { day: 1, title: "Arrival & Orientation", activities: ["Airport pickup", "Hotel check-in", "Welcome dinner", "Briefing session"] },
      { day: 2, title: "Exploring the Area", activities: ["Morning hike", "Local market visit", "Cultural show"] },
      { day: 3, title: "Adventure Day", activities: ["Full-day excursion", "Lunch at scenic spot", "Sunset photography"] },
      { day: 4, title: "Leisure & Departure", activities: ["Free time", "Farewell lunch", "Airport transfer"] }
    ];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 2000);
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const renderTripDetails = () => (
    <motion.form
      onSubmit={handleNext}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 overflow-hidden"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FiCompass className="text-green-600 bg-green-100 p-2 rounded-full" />
        <span>Trip Information</span>
      </h2>
      
      <motion.div 
        variants={itemVariants}
        className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-start gap-3"
      >
        <div className="bg-green-100 p-2 rounded-lg">
          <FiInfo className="text-green-600 text-xl" />
        </div>
        <div>
          <h3 className="font-semibold text-green-800 mb-1">Creating a successful group</h3>
          <p className="text-sm text-green-700">
            Choose an attractive title and clear dates to help others join your trip. 
            The more details you provide, the better your chances of finding travel buddies!
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          Trip Title
          <span className="text-xs text-gray-500">(Be creative!)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white pl-12"
            placeholder="E.g., Himalayan Adventure 2023"
            required
          />
          <div className="absolute left-3 top-3 text-gray-400">
            <FiGlobe className="text-xl" />
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination
          </label>
          <div className="relative">
            <select
              name="destinationId"
              value={formData.destinationId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white appearance-none pl-12"
              required
            >
              <option value="">Select Destination</option>
              {destinations.map(dest => (
                <option key={dest.value} value={dest.value}>
                  {dest.label}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-3 text-gray-400">
              <FiMapPin className="text-xl" />
            </div>
          </div>
        </motion.div>

        {formData.destinationId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            variants={itemVariants}
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Guide
            </label>
            <div className="relative">
              <select
                name="guideId"
                value={formData.guideId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white appearance-none pl-12"
                required
              >
                <option value="">Select Guide</option>
                {filteredGuides.map(guide => (
                  <option key={guide.id} value={guide.id}>
                    {guide.name} (₹{guide.price.individual})
                  </option>
                ))}
              </select>
              <div className="absolute left-3 top-3 text-gray-400">
                <FiUser className="text-xl" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trip Date
          </label>
          <div className="relative">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white pl-12"
              required
            />
            <div className="absolute left-3 top-3 text-gray-400">
              <FiCalendar className="text-xl" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Size
          </label>
          <div className="relative">
            <select
              name="members"
              value={formData.members}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white appearance-none pl-12"
              required
            >
              <option value="4/10">Small (4-10 people)</option>
              <option value="6/12">Medium (6-12 people)</option>
              <option value="8/15">Large (8-15 people)</option>
            </select>
            <div className="absolute left-3 top-3 text-gray-400">
              <FiUsers className="text-xl" />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Option
        </label>
        <div className="space-y-3">
          <motion.label 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
              formData.paymentOption === 'full' 
                ? 'border-green-600 bg-green-50 shadow-sm' 
                : 'border-gray-200 hover:border-green-400 bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="paymentOption"
              value="full"
              checked={formData.paymentOption === 'full'}
              onChange={handleInputChange}
              className="mt-1 text-green-600 focus:ring-green-600"
            />
            <div className="ml-3">
              <span className="block text-sm font-medium text-gray-900">
                Pay full trip amount
              </span>
              <span className="block text-sm text-gray-500 mt-1">
                ₹{guides.find(g => g.id === formData.guideId)?.price.individual || '0'} (includes ₹100 creation fee)
              </span>
            </div>
          </motion.label>

          <motion.label 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
              formData.paymentOption === 'creation' 
                ? 'border-green-600 bg-green-50 shadow-sm' 
                : 'border-gray-200 hover:border-green-400 bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="paymentOption"
              value="creation"
              checked={formData.paymentOption === 'creation'}
              onChange={handleInputChange}
              className="mt-1 text-green-600 focus:ring-green-600"
            />
            <div className="ml-3">
              <span className="block text-sm font-medium text-gray-900">
                Pay only creation fee now
              </span>
              <span className="block text-sm text-gray-500 mt-1">
                ₹100 (pay trip amount later)
              </span>
            </div>
          </motion.label>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="mt-6 flex justify-end"
      >
        <button
          type="submit"
          className="py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg"
        >
          Continue to Personal Info
          <FiChevronRight className="text-lg" />
        </button>
      </motion.div>
    </motion.form>
  );

  const renderPersonalInfo = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 overflow-hidden"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FiUser className="text-green-600 bg-green-100 p-2 rounded-full" />
        <span>Your Information</span>
      </h2>
      
      <motion.div 
        variants={itemVariants}
        className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3"
      >
        <div className="bg-blue-100 p-2 rounded-lg">
          <FiAlertCircle className="text-blue-600 text-xl" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-800 mb-1">Why we need your details</h3>
          <p className="text-sm text-blue-700">
            This information helps us verify your identity and ensure the safety of all group members. 
            Your details will only be shared with your guide and trip participants.
          </p>
        </div>
      </motion.div>

      <motion.form
        onSubmit={handleNext}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white pl-12"
                placeholder="Your full name"
                required
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <FiUser className="text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white pl-12"
                placeholder="your@email.com"
                required
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <FiDollarSign className="text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <div className="relative">
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white pl-12"
                placeholder="+91 9876543210"
                required
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <FiCreditCard className="text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Type
            </label>
            <div className="relative">
              <select
                name="idType"
                value={formData.idType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white appearance-none pl-12"
                required
              >
                <option value="passport">Passport</option>
                <option value="aadhar">Aadhar Card</option>
                <option value="driver">Driver's License</option>
                <option value="voter">Voter ID</option>
              </select>
              <div className="absolute left-3 top-3 text-gray-400">
                <FiShield className="text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Number
            </label>
            <div className="relative">
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white pl-12"
                placeholder="ID number"
                required
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <FiCheckCircle className="text-xl" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload ID (Front)
            </label>
            <div className="relative">
              <input
                type="file"
                name="idPhoto"
                onChange={handleInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                required
              />
              <div className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all flex items-center justify-between bg-gray-50 hover:bg-gray-100">
                <span className={`truncate ${formData.idPhoto ? 'text-gray-800' : 'text-gray-500'}`}>
                  {formData.idPhoto ? formData.idPhoto.name : 'Choose file...'}
                </span>
                <FiUpload className="text-gray-400" />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="flex justify-between mt-8"
        >
          <motion.button
            type="button"
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="py-3 px-6 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <FiChevronLeft className="text-lg" />
            Back
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg"
          >
            View Itinerary
            <FiChevronRight className="text-lg" />
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );

  const renderItinerary = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 overflow-hidden"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FiClock className="text-green-600 bg-green-100 p-2 rounded-full" />
        <span>Trip Itinerary</span>
      </h2>
      
      <motion.div 
        variants={itemVariants}
        className="bg-green-600 rounded-xl p-6 text-white mb-6 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            <FiMapPin className="text-2xl" />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-1">{selectedDestination?.label || 'Your Destination'}</h3>
            <p className="opacity-90">{formData.date || 'Selected dates'} • {formData.members.replace('/', '-')} people</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {getItinerary().map((day, index) => (
          <motion.div 
            key={day.day}
            variants={itemVariants}
            className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center gap-3">
              <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-medium">
                {day.day}
              </div>
              <h3 className="font-medium text-gray-800">{day.title}</h3>
            </div>
            <div className="p-5 bg-white">
              <ul className="space-y-3">
                {day.activities.map((activity, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={`mt-1 flex-shrink-0 ${
                      i % 3 === 0 ? 'text-blue-500' : 
                      i % 3 === 1 ? 'text-green-500' : 'text-purple-500'
                    }`}>
                      {i % 3 === 0 ? <FiSun /> : i % 3 === 1 ? <FiCoffee /> : <FiMoon />}
                    </div>
                    <span className="text-gray-700">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}

        {selectedGuide && (
          <motion.div 
            variants={itemVariants}
            className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5 flex items-start gap-4 shadow-sm"
          >
            <div className="bg-yellow-500 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <FiUser className="text-xl" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Your Guide: {selectedGuide.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedGuide.bio || 'Experienced local guide'}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-white px-2 py-1 rounded-md border border-yellow-200 text-yellow-700 shadow-sm">
                  <FiStar className="inline mr-1" />
                  {selectedGuide.rating} ★
                </span>
                <span className="bg-white px-2 py-1 rounded-md border border-yellow-200 text-yellow-700 shadow-sm">
                  <FiCompass className="inline mr-1" />
                  {selectedGuide.trips} trips
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div 
          variants={itemVariants}
          className="flex justify-between mt-8"
        >
          <motion.button
            type="button"
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="py-3 px-6 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <FiChevronLeft className="text-lg" />
            Back
          </motion.button>
          <motion.button
            type="button"
            onClick={handleNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg"
          >
            Proceed to Payment
            <FiChevronRight className="text-lg" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  const renderPayment = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 overflow-hidden"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <FiCreditCard className="text-green-600 bg-green-100 p-2 rounded-full" />
        <span>Complete Payment</span>
      </h2>
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-8"
      >
        <motion.div variants={itemVariants}>
          <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 mb-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiDollarSign className="text-green-600" />
              <span>Payment Summary</span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Room Creation Fee</span>
                <span className="font-medium">₹100</span>
              </div>
              {formData.paymentOption === 'full' && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Trip Charges</span>
                  <span className="font-medium">₹{selectedGuide?.price.individual || 0}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-medium">Total Payable</span>
                <span className="font-bold text-green-600 text-lg">₹{calculateTotal()}</span>
              </div>
            </div>
          </div>

          <motion.div variants={itemVariants}>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-blue-500" />
              <span>Payment Methods</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {['esewa', 'khalti', 'connectips'].map((method) => (
                <motion.button
                  key={method}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:border-green-500 transition-colors flex items-center justify-center bg-white shadow-sm hover:shadow-md"
                >
                  <img 
                    src={`/icons/${method}.png`} 
                    alt={method} 
                    className="h-6 object-contain"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FiCreditCard className="text-green-600" />
              <span>Card Payment</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white pl-12"
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <FiCreditCard className="text-xl" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white pl-12"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      <FiCalendar className="text-xl" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white pl-12"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      <FiShield className="text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all bg-gray-50 focus:bg-white pl-12"
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <FiUser className="text-xl" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <div className="bg-green-100 p-1 rounded-full">
                  <FiShield className="text-green-600" />
                </div>
                <span>Your payment is secured with SSL encryption</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition-all mt-4 font-medium flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  `Pay ₹${calculateTotal()}`
                )}
              </motion.button>
            </div>
          </div>

          <motion.div 
            variants={itemVariants}
            className="flex justify-start mt-6"
          >
            <motion.button
              type="button"
              onClick={handleBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-6 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <FiChevronLeft className="text-lg" />
              Back
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  const renderCurrentTab = () => {
    switch(activeTab) {
      case 0: return renderTripDetails();
      case 1: return renderPersonalInfo();
      case 2: return renderItinerary();
      case 3: return renderPayment();
      default: return null;
    }
  };

      return (
    <div className="min-h-screen py-4 sm:px-6 lg:px-8 -mt-8 ">
      <div className="max-w-7xl mx-auto">
        {/* 1. Heading Section with green-100 background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center bg-green-100 rounded-xl p-6 shadow-sm max-w-5xl mx-auto"
        >
          <motion.h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Create Your Merger
          </motion.h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fill in the details below to create your group trip and invite others to join
          </p>
        </motion.div>

        {/* 2. Nodes & Progress Line Section with white background */}
        <motion.div 
          className="mb-12 mt-4 relative bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Progress line container - controls the width */}
          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-3/4 sm:w-1/2">
            {/* Progress line background */}
            <div className="h-2 bg-gray-200 rounded-full"></div>
            
            {/* Progress fill */}
            <div 
              className="absolute top-0 left-0 h-2 bg-green-600 rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${(activeTab / 3) * 100}%` }}
            ></div>
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-between max-w-2xl mx-auto relative z-10">
            {['Trip Details', 'Your Info', 'Itinerary', 'Payment'].map((step, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all ${
                  index < activeTab ? 'bg-green-600 text-white shadow-md' : 
                  index === activeTab ? 'bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-600 text-green-600 shadow-md' : 
                  'bg-gray-200 text-gray-600 group-hover:bg-gray-300 transition-colors'
                }`}>
                  {index < activeTab ? <FiCheckCircle className="text-lg" /> : index + 1}
                </div>
                <span className={`text-sm font-medium ${
                  index <= activeTab ? 'text-gray-800' : 'text-gray-500'
                }`}>{step}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* 3. Main Content Section with gradient background */}
        <div className="max-w-7xl bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 shadow-sm">
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-6 right-6 z-50"
              >
                <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-green-600 max-w-sm flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <FiCheckCircle className="text-green-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Trip Created Successfully!</h3>
                    <p className="text-sm text-gray-600">Your group trip is now live and visible to other travelers.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              {renderCurrentTab()}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 top-6"
              >
              <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2">
                <FiCompass className="text-blue-500" />
                <span>Trip Summary</span>
              </h3>
              
              {selectedDestination && (
                <div className="mb-4">
                  <div className="relative rounded-xl overflow-hidden h-48 mb-3 group">
                    <img 
                      src={selectedDestination.image || '/images/default-destination.jpg'} 
                      alt={selectedDestination.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h4 className="font-bold text-xl">{selectedDestination.label}</h4>
                      <p className="text-sm opacity-90">{formData.date || 'Select date'}</p>
                    </div>
                    <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/30 transition-colors">
                      <FiHeart className="text-xl" />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FiUser className="text-gray-400" />
                    Guide
                  </span>
                  <span className="font-medium text-right">
                    {selectedGuide?.name || 'Not selected'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FiUsers className="text-gray-400" />
                    Group Size
                  </span>
                  <span className="font-medium">{formData.members.replace('/', '-')} people</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <FiDollarSign className="text-gray-400" />
                    Payment Option
                  </span>
                  <span className="font-medium">
                    {formData.paymentOption === 'full' ? 'Full payment' : 'Creation fee only'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-3">
                  <span className="font-medium text-gray-700">Total Amount</span>
                  <span className="font-bold text-green-600 text-xl">₹{calculateTotal()}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-blue-50 rounded-2xl shadow-sm p-6 border-2 border-blue-200"
            >
              <h3 className="font-bold text-lg text-blue-800 mb-3 flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FiInfo className="text-blue-600" />
                </div>
                <span>Tips for a Great Group</span>
              </h3>
              
              <ul className="space-y-3 text-sm text-blue-700">
                <motion.li 
                  className="flex items-start gap-2 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                  whileHover={{ x: 5 }}
                >
                  <FiCheckCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Be clear about your expectations in the group description</span>
                </motion.li>
                <motion.li 
                  className="flex items-start gap-2 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                  whileHover={{ x: 5 }}
                >
                  <FiCheckCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Set a reasonable deadline for others to join</span>
                </motion.li>
                <motion.li 
                  className="flex items-start gap-2 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                  whileHover={{ x: 5 }}
                >
                  <FiCheckCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Communicate early about any special requirements</span>
                </motion.li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-red-50 rounded-2xl shadow-sm p-6 border-2 border-red-200"
            >
              <h3 className="font-bold text-lg text-red-800 mb-3 flex items-center gap-2">
                <div className="bg-red-100 p-2 rounded-lg">
                  <FiAlertCircle className="text-red-600" />
                </div>
                <span>Cancellation Policy</span>
              </h3>
              
              <ul className="space-y-3 text-sm text-red-700">
                <motion.li 
                  className="flex items-start gap-2 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                  whileHover={{ x: 5 }}
                >
                  <span className="font-medium text-red-500">•</span>
                  <span>100% refund if cancelled 15+ days before trip</span>
                </motion.li>
                <motion.li 
                  className="flex items-start gap-2 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                  whileHover={{ x: 5 }}
                >
                  <span className="font-medium text-red-500">•</span>
                  <span>50% refund if cancelled 7-14 days before trip</span>
                </motion.li>
                <motion.li 
                  className="flex items-start gap-2 p-3 bg-white/50 rounded-lg backdrop-blur-sm"
                  whileHover={{ x: 5 }}
                >
                  <span className="font-medium text-red-500">•</span>
                  <span>No refund if cancelled less than 7 days before trip</span>
                </motion.li>
              </ul>
            </motion.div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMerger;