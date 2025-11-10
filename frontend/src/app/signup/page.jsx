'use client';
import { useState, useEffect , useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
export default function SignUpPage() {
  const [role, setRole] = useState('user');
  const [step, setStep] = useState(1); // 1: Initial form, 2: OTP, 3: Complete profile
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyEmail: '',
    state: '',
    address: ''
  });
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const router = useRouter();

  // Default OTP for demo purposes
  const DEFAULT_OTP = '0000';

  // Validate email or phone
  const validateEmailOrPhone = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    return emailRegex.test(input) || phoneRegex.test(input);
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Verify OTP
  const verifyOtp = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === DEFAULT_OTP) {
      setIsVerified(true);
      setStep(3);
      setError('');
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  // Resend OTP
  const resendOtp = () => {
    setTimer(30);
    setOtp(['', '', '', '']);
    setError('');
  };

  // it changes the state whenver the emailOrPhone changes to get the latest data from the state variable
  useEffect(() => {
    const isEmail = emailOrPhone.includes('@');
    setUserData(prev => ({
      ...prev,
      email: isEmail ? emailOrPhone : '',
      phone: !isEmail ? emailOrPhone : ''
    }));
  }, [emailOrPhone]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (userData.password !== userData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (role === 'user') {
      if (!userData.name || !userData.dob || (!userData.email && !userData.phone)) {
        setError('Please fill all required fields');
        return;
      }
    } else {
      if (!userData.name || !userData.companyName || !userData.companyEmail || 
          !userData.state || !userData.address || (!userData.email && !userData.phone)) {
        setError('Please fill all required fields');
        return;
      }
    }

    setIsSubmitted(true);
  };

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (timer > 0 && step === 2) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  // Handle initial form submission (request OTP)
  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmailOrPhone(emailOrPhone)) {
      setError('Please enter a valid email or 10-digit phone number');
      return;
    }
    // Not getting the latest Data from the userData when it gets updated

    // const isEmail = emailOrPhone.includes('@');
    // setUserData(prev => ({ 
    //   ...prev, 
    //   [isEmail ? 'email' : 'phone']: emailOrPhone 
    // }));

    //Send OTP to user using backend
    //Call the backend API's to check the email and give validation to the user
    try {
      console.log("Inside try")
      console.log(userData.email)
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/signup`, {
          email: userData.email
        });
      console.log(res.data);
    } 
    catch (error) {
      console.error('Axios error:', error);
    }
    
    setStep(2);
    setError('');
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex flex-1 min-h-screen mx-auto">
      {/* Travel Hero Panel */}
      <div className="hidden md:block md:w-1/2 relative">
        <Image
          src="/images/signin.jpg" 
          alt="Travel Adventure"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 flex flex-col p-12 text-white">
          <h2 className="text-4xl font-bold mb-4 mx-auto">Begin Your Journey</h2>
          <p className="text-xl mb-6 pl-8">
            {role === 'user' 
              ? "Join our community of travelers and discover unforgettable experiences." 
              : "Connect with travelers and showcase your exceptional services."}
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-1 bg-green-400 ml-8"></div>
            <span className="text-sm font-medium">Explore the world</span>
          </div>
        </div>
      </div>

      {/* Right Side Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-1 items-center justify-center px-8 bg-green-100"
      >
        {step === 1 && (
          <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-lg rounded-xl px-8 py-10 w-full max-w-md">
            <div className="text-center mb-10">
              <Image
                src="/images/logo.svg"
                alt="Logo"
                width={160}
                height={160}
                className="mx-auto mb-6 -mt-6 rounded-3xl"
              />
              <h2 className="text-3xl font-bold text-green-800">Sign Up</h2>
              <p className="text-gray-600 mt-2">
                Create your {role === 'user' ? 'traveler' : 'provider'} account
              </p>
            </div>

            <div className="flex gap-3 justify-center mb-16 -mt-4">
              {['user', 'provider'].map((t) => (
                <motion.button
                  key={t}
                  onClick={() => {
                    setRole(t);
                    setError('');
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2 rounded-full font-medium transition ${
                    role === t
                      ? 'bg-green-400 text-white'
                      : 'bg-white text-green-800 border-b-2 border-green-300'
                  }`}
                >
                  {t === 'user' ? 'User' : 'Service Provider'}
                </motion.button>
              ))}
            </div>

            <form className="space-y-4" onSubmit={handleInitialSubmit}>
              <motion.div whileFocus={{ scale: 1.02 }}>
                <div className="relative">
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    required
                    className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 mb-2 text-black placeholder-transparent focus:outline-none"
                    placeholder="Email / Phone Number"
                  />
                  <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                    Email / Phone Number
                  </label>
                </div>
              </motion.div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-lg font-semibold shadow hover:shadow-lg transition"
              >
                Sign Up as {role === 'user' ? 'User' : 'Provider'}
              </motion.button>
            </form>

            <div className="mt-4 text-center text-black">
              Already have an account?{' '}
              <Link href="/signin" className="underline text-blue-600 hover:text-blue-900">
                Sign in
              </Link>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-lg rounded-xl px-8 py-10 w-full max-w-md">
            <div className="text-center mb-6">
              <Image
                src="/images/logo.svg"
                alt="Logo"
                width={160}
                height={160}
                className="mx-auto mb-4 rounded-3xl"
              />
              <h2 className="text-2xl font-bold text-green-800">Verify Your Account</h2>
              <p className="text-gray-600 mt-2">
                We've sent a 4-digit code to {emailOrPhone}
              </p>
            </div>

            <div className="flex justify-center gap-3 mb-8">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-16 h-16 text-3xl text-center border-2 border-gray-300 rounded-lg focus:border-green-400 focus:outline-none"
                  inputMode="numeric"
                />
              ))}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center mb-4"
              >
                {error}
              </motion.div>
            )}

            <div className="text-center mb-6">
              {timer > 0 ? (
                <p className="text-gray-500">Resend OTP in {timer}s</p>
              ) : (
                <button 
                  onClick={resendOtp}
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <motion.button
              onClick={verifyOtp}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-lg font-semibold shadow hover:shadow-lg transition"
            >
              Verify OTP
            </motion.button>

          
          </div>
        )}

        {step === 3 && !isSubmitted && (
          <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-lg rounded-xl px-8 py-2 w-full max-w-md">
            <div className="text-center mb-6">
              <Image
                src="/images/logo.svg"
                alt="Logo"
                width={160}
                height={160}
                className="mx-auto mb-2 rounded-3xl"
              />
              <h2 className="text-2xl font-bold text-green-800">
                Complete Your {role === 'user' ? 'Profile' : 'Company Details'}
              </h2>
              <p className="text-gray-600 mt-2">
                Please provide the following information
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  required
                  className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black placeholder-transparent focus:outline-none"
                  placeholder="Full Name"
                />
                <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                  Full Name*
                </label>
              </div>

              {/* Primary Credential (fixed) */}
              <div className="relative">
                <input
                  type={userData.email ? "email" : "tel"}
                  value={userData.email || userData.phone}
                  readOnly
                  className="w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black focus:outline-none focus:ring-0"
                />
                <label className="absolute left-0 -top-2 text-sm text-gray-500">
                  {userData.email ? "Email*" : "Phone Number*"}
                </label>
              </div>

              {/* Secondary Credential (optional) */}
              <div className="relative">
                <input
                  type={userData.email ? "tel" : "email"}
                  name={userData.email ? "phone" : "email"}
                  value={userData.email ? userData.phone : userData.email}
                  onChange={handleInputChange}
                  className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black placeholder-transparent focus:outline-none"
                  placeholder={userData.email ? "Phone Number" : "Email"}
                />
                <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                  {userData.email ? "Phone Number" : "Email"}
                </label>
              </div>

              {/* User Specific Fields */}
              {role === 'user' && (
                <div className="relative">
                  <input
                    type="date"
                    name="dob"
                    value={userData.dob}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black focus:outline-none"
                  />
                  <label className="absolute left-0 -top-2 text-sm text-gray-500">
                    Date of Birth*
                  </label>
                </div>
              )}

            
             
              {/* Password Fields */}
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  required
                  className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black placeholder-transparent focus:outline-none"
                  placeholder="Password"
                />
                <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                  Password*
                </label>
              </div>

              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black placeholder-transparent focus:outline-none"
                  placeholder="Confirm Password"
                />
                <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                  Confirm Password*
                </label>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-lg font-semibold shadow hover:shadow-lg transition mt-6"
              >
                Complete Registration
              </motion.button>
            </form>
          </div>
        )}

        {step === 3 && isSubmitted && (
          <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-lg rounded-xl px-8 py-10 w-full max-w-md">
            <div className="text-center mb-6">
              <Image
                src="/images/logo.svg"
                alt="Logo"
                width={120}
                height={120}
                className="mx-auto mb-4 rounded-3xl"
              />
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <svg
                  className="w-20 h-20 text-green-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                Welcome {userData.name}!
              </h2>
              <p className="text-gray-600 mb-6">
                Your {role === 'user' ? 'traveler' : 'service provider'} account has been created successfully.
              </p>
              <motion.button
                onClick={() => router.push('/signin')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-lg font-semibold shadow hover:shadow-lg transition"
              >
                Continue to Login
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}