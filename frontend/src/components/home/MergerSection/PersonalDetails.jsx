'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Car,
  User,
  CreditCard,
  Calendar,
  Clock,
  Mail,
  Phone,
  ChevronDown,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import ArrDep from 'frontend/src/components/home/MergerSection/Arr-Dep';
import TravelerDetails from 'frontend/src/components/home/MergerSection/TravelerDetails';

const PersonalDetails = ({ merger, guide }) => {
  const [activeSection, setActiveSection] = useState('arrival');
  const [isAnimating, setIsAnimating] = useState(false);
  const [formData, setFormData] = useState({
    arrival: {
      location: merger.location || '',
      address: '',
      date: merger.date,
      time: '08:00'
    },
    departure: {
      location: merger.location || '',
      address: '',
      date: new Date(new Date(merger.date).setDate(new Date(merger.date).getDate() + (guide?.duration || 5))),
      time: '17:00'
    },
    personal: {
      name: '',
      email: '',
      phone: '',
      emergencyContact: '',
      idType: '',
      idNumber: '',
      idImage: null
    },
    payment: {
      method: '',
      cardNumber: '',
      expiry: '',
      cvv: ''
    }
  });

  const changeSection = (newSection) => {
    setIsAnimating(true);
    setTimeout(() => {
      setActiveSection(newSection);
      setIsAnimating(false);
    }, 300);
  };

  const handleArrivalSubmit = (data) => {
    setFormData(prev => ({
      ...prev,
      arrival: data.pickup,
      departure: data.dropoff
    }));
    changeSection('personal');
  };

  const handlePersonalSubmit = (data) => {
    setFormData(prev => ({
      ...prev,
      personal: {
        ...data.contactDetails,
        ...data.travelerDetails[0] // Assuming single traveler
      }
    }));
    changeSection('payment');
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    console.log('Booking submitted:', formData);
    // Submit logic here
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'arrival':
        return (
          <ArrDep
            defaultLocation={merger.location}
            date={new Date(merger.date)}
            duration={guide?.duration || 5}
            onNext={handleArrivalSubmit}
            onBack={() => window.history.back()}
          />
        );
      case 'personal':
        return (
          <TravelerDetails
            count={1}
            onNext={() => changeSection('payment')}
            onSave={handlePersonalSubmit}
            onBack={() => changeSection('arrival')}
          />
        );
      case 'payment':
        return (
          <PaymentSection
            price={merger.price}
            onBack={() => changeSection('personal')}
            onSubmit={handlePaymentSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-green-50 to-blue-50 -mt-16 rounded-2xl shadow-lg mb-16">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
          Complete Your Booking
        </h1>
        <p className="text-gray-600 mt-3 text-lg">
          Please provide your details to complete the merger booking
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-12 relative">
        <div className="absolute top-7 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0">
          <motion.div 
            initial={{ width: 0 }}
            animate={{
              width: activeSection === 'arrival' ? '0%' : 
                    activeSection === 'personal' ? '50%' : '100%'
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="h-full relative overflow-hidden"
          >
            <motion.div
              animate={{
                x: [0, 100, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/80 to-transparent"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600" />
          </motion.div>
        </div>

        <div className="flex justify-between relative z-10">
          {['arrival', 'personal', 'payment'].map((step, index) => {
            const isActive = activeSection === step;
            const isCompleted = ['arrival', 'personal', 'payment'].indexOf(activeSection) > index;
            const stepNames = {
              arrival: 'Arrival/Departure',
              personal: 'Personal Details',
              payment: 'Payment'
            };

            const stepIcons = {
              arrival: <Car className="h-5 w-5" />,
              personal: <User className="h-5 w-5" />,
              payment: <CreditCard className="h-5 w-5" />
            };

            return (
              <motion.div 
                key={step}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center"
              >
                <motion.button
                  initial={false}
                  animate={{
                    scale: isActive ? [1, 1.1, 1] : 1,
                    boxShadow: isActive ? "0 0 0 8px rgba(74, 222, 128, 0.2)" : "none"
                  }}
                  transition={{
                    scale: isActive ? { duration: 1, repeat: Infinity } : {},
                    boxShadow: { duration: 0.3 }
                  }}
                  onClick={() => !isAnimating && changeSection(step)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${
                    isActive ? 'bg-gradient-to-br from-green-400 to-green-700 text-white' : 
                    isCompleted ? 'bg-green-500 text-white' : 
                    'bg-white text-gray-400 border-2 border-gray-300'
                  } transition-all duration-300 relative`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    stepIcons[step]
                  )}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1.5 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-green-400/30 -z-10"
                    />
                  )}
                </motion.button>
                
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: isActive ? -2 : 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`mt-3 text-sm font-medium ${
                    isActive ? 'text-green-600 font-bold' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-500'
                  }`}
                >
                  {stepNames[step]}
                </motion.div>
                <div className={`text-xs mt-1 ${
                  isActive ? 'text-green-500' : 'text-gray-400'
                }`}>
                  Step {index + 1}/3
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Content Section */}
      <AnimatePresence mode="wait">
        {renderSectionContent()}
      </AnimatePresence>
    </div>
  );
};

// Payment Section remains the same as in your original code
const PaymentSection = ({ price, onBack, onSubmit }) => {
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleCardChange = (field, value) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-8 space-y-8 border border-gray-100"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl mr-4">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Payment Information</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-green-100 rounded-xl p-6 bg-gradient-to-br from-green-50 to-blue-50">
          <h4 className="text-lg font-semibold text-gray-800 mb-6">Price Summary</h4>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Base Price</span>
              <span className="font-semibold">₹{price.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Taxes & Fees</span>
              <span className="font-semibold">₹{(price * 0.18).toLocaleString('en-IN')}</span>
            </div>
            <div className="pt-4 mt-2">
              <div className="flex justify-between items-center bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-lg">
                <span className="font-bold text-lg text-gray-800">Total Amount</span>
                <span className="font-bold text-lg text-green-700">₹{(price * 1.18).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-blue-100 rounded-xl p-6 bg-gradient-to-br from-green-50 to-blue-50">
          <h4 className="text-lg font-semibold text-gray-800 mb-6">Payment Method</h4>
          
          <div className="space-y-4">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePaymentMethodChange('credit')}
              className={`p-4 border rounded-lg cursor-pointer ${
                paymentMethod === 'credit' ? 'border-green-300 bg-white shadow-md' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  paymentMethod === 'credit' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Credit/Debit Card</p>
                  <p className="text-sm text-gray-500">Pay with Visa, Mastercard, etc.</p>
                </div>
              </div>
              {paymentMethod === 'credit' && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => handleCardChange('number', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => handleCardChange('expiry', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => handleCardChange('cvv', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePaymentMethodChange('upi')}
              className={`p-4 border rounded-lg cursor-pointer ${
                paymentMethod === 'upi' ? 'border-green-300 bg-white shadow-md' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  paymentMethod === 'upi' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                    <path d="M10.5 17.5L7 14l1.5-1.5 2 2 5-5L16 11m-4-9a10 10 0 0110 10 10 10 0 01-10 10A10 10 0 012 12 10 10 0 0112 2z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">UPI Payment</p>
                  <p className="text-sm text-gray-500">Pay using any UPI app</p>
                </div>
              </div>
              {paymentMethod === 'upi' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="yourname@upi"
                  />
                </div>
              )}
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handlePaymentMethodChange('netbanking')}
              className={`p-4 border rounded-lg cursor-pointer ${
                paymentMethod === 'netbanking' ? 'border-green-300 bg-white shadow-md' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  paymentMethod === 'netbanking' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Net Banking</p>
                  <p className="text-sm text-gray-500">Pay directly from your bank</p>
                </div>
              </div>
              {paymentMethod === 'netbanking' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg">
                    <option value="">Select your bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                  </select>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors flex items-center shadow-lg"
        >
          Confirm & Pay ₹{(price * 1.18).toLocaleString('en-IN')}
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>
      </div>
    </motion.div>
  );
};

export default PersonalDetails;