'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Password validation rules (mirrored from server-side)
const COMMON_PASSWORDS = [
  'password', '12345678', '123456789', '1234567890', 'qwerty123',
  'password1', 'iloveyou', 'abcdefgh', 'abc12345', 'qwertyui',
  'password123', 'admin123', 'letmein1', 'welcome1', 'trustno1',
];

function validatePasswordClient(password) {
  if (!password) return { isValid: false, errors: [], strength: 0 };
  const errors = [];
  let strength = 0;

  if (password.length < 8) errors.push('Min 8 characters');
  else { strength += 1; if (password.length >= 12) strength += 1; }

  if (!/[A-Z]/.test(password)) errors.push('1 uppercase letter');
  else strength += 1;

  if (!/[a-z]/.test(password)) errors.push('1 lowercase letter');
  else strength += 1;

  if (!/\d/.test(password)) errors.push('1 number');
  else strength += 1;

  if (!/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]/.test(password)) errors.push('1 special character');
  else strength += 1;

  if (/\s/.test(password)) errors.push('No spaces');
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) { errors.push('Too common'); strength = 0; }
  if (/(.)\1{3,}/.test(password)) { errors.push('No repeating chars'); strength = Math.max(0, strength - 1); }

  return { isValid: errors.length === 0, errors, strength: Math.min(4, Math.floor(strength * 4 / 6)) };
}

const STRENGTH_INFO = [
  { label: 'Very Weak', color: '#ef4444', bg: 'bg-red-500' },
  { label: 'Weak', color: '#f97316', bg: 'bg-orange-500' },
  { label: 'Fair', color: '#eab308', bg: 'bg-yellow-500' },
  { label: 'Strong', color: '#22c55e', bg: 'bg-green-500' },
  { label: 'Very Strong', color: '#16a34a', bg: 'bg-green-600' },
];

export default function SignUpPage() {
  const [role, setRole] = useState('user');
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [apiErrors, setApiErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const router = useRouter();

  // Password strength (memoized)
  const passwordCheck = useMemo(() => validatePasswordClient(userData.password), [userData.password]);
  const strengthInfo = STRENGTH_INFO[passwordCheck.strength] || STRENGTH_INFO[0];

  // Validate email or phone
  const validateIdentifier = (input) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || /^\d{10}$/.test(input);
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) document.getElementById(`otp-${index + 1}`).focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      setOtp(pasted.split(''));
      document.getElementById('otp-3').focus();
    }
  };

  // Send OTP
  const sendOTP = async () => {
    setLoading(true);
    setError('');
    setApiErrors([]);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), role }),
      });

      const data = await res.json();

      if (data.success) {
        setIdentifierType(data.identifierType);
        setStep(2);
        setTimer(30);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), otp: enteredOtp }),
      });

      const data = await res.json();
      if (data.success) setStep(3);
      else setError(data.message);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    setOtp(['', '', '', '']);
    setError('');
    await sendOTP();
  };

  // Submit Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setApiErrors([]);

    if (!userData.name.trim()) { setError('Please enter your name'); return; }

    // Client-side password validation
    if (!passwordCheck.isValid) {
      setError('Please fix the password issues listed below');
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (role === 'user' && !userData.dob) {
      setError('Please enter your date of birth');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          identifierType,
          role,
          name: userData.name,
          email: identifierType === 'phone' ? userData.email : identifier.trim(),
          phone: identifierType === 'email' ? userData.phone : identifier.trim(),
          dob: userData.dob,
          password: userData.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        setError(data.message);
        if (data.errors) setApiErrors(data.errors);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    let interval;
    if (timer > 0 && step === 2) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  // Initial submit
  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!validateIdentifier(identifier.trim())) {
      setError('Please enter a valid email address or 10-digit mobile number');
      return;
    }
    sendOTP();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const getMaskedIdentifier = () => {
    if (identifierType === 'email') {
      const [user, domain] = identifier.split('@');
      return `${user.slice(0, 2)}****@${domain}`;
    }
    return `${identifier.slice(0, 3)}****${identifier.slice(7)}`;
  };

  const LoadingSpinner = ({ text }) => (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {text}
    </span>
  );

  // Eye icon for password toggle
  const EyeIcon = ({ show, onClick }) => (
    <button type="button" onClick={onClick} className="absolute right-0 top-3 text-gray-400 hover:text-gray-600 p-1">
      {show ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  );

  return (
    <div className="flex flex-1 min-h-screen mx-auto">
      {/* Travel Hero Panel */}
      <div className="hidden md:block md:w-1/2 relative">
        <Image src="/images/signin.jpg" alt="Travel Adventure" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 flex flex-col p-12 text-white">
          <h2 className="text-4xl font-bold mb-4 mx-auto">Begin Your Journey</h2>
          <p className="text-xl mb-6 pl-8">
            {role === 'user'
              ? 'Join our community of travelers and discover unforgettable experiences.'
              : 'Connect with travelers and showcase your exceptional services.'}
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
        {/* ─────────── STEP 1 ─────────── */}
        {step === 1 && (
          <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-lg rounded-xl px-8 py-10 w-full max-w-md">
            <div className="text-center mb-10">
              <Image src="/images/logo.svg" alt="Logo" width={160} height={160} className="mx-auto mb-6 -mt-6 rounded-3xl" />
              <h2 className="text-3xl font-bold text-green-800">Sign Up</h2>
              <p className="text-gray-600 mt-2">Create your {role === 'user' ? 'traveler' : 'provider'} account</p>
            </div>

            <div className="flex gap-3 justify-center mb-16 -mt-4">
              {['user', 'provider'].map((t) => (
                <motion.button
                  key={t}
                  onClick={() => { setRole(t); setError(''); }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2 rounded-full font-medium transition ${role === t ? 'bg-green-400 text-white' : 'bg-white text-green-800 border-b-2 border-green-300'
                    }`}
                >
                  {t === 'user' ? 'User' : 'Service Provider'}
                </motion.button>
              ))}
            </div>

            <form className="space-y-4" onSubmit={handleInitialSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 mb-2 text-black placeholder-transparent focus:outline-none"
                  placeholder="Email / Mobile Number"
                />
                <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                  Email / Mobile Number
                </label>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm text-center">
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-lg font-semibold shadow hover:shadow-lg transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? <LoadingSpinner text="Sending OTP..." /> : `Sign Up as ${role === 'user' ? 'User' : 'Provider'}`}
              </motion.button>
            </form>

            <div className="mt-4 text-center text-black">
              Already have an account?{' '}
              <Link href="/signin" className="underline text-blue-600 hover:text-blue-900">Sign in</Link>
            </div>
          </div>
        )}

        {/* ─────────── STEP 2: OTP ─────────── */}
        {step === 2 && (
          <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-lg rounded-xl px-8 py-10 w-full max-w-md">
            <div className="text-center mb-6">
              <Image src="/images/logo.svg" alt="Logo" width={160} height={160} className="mx-auto mb-4 rounded-3xl" />
              <h2 className="text-2xl font-bold text-green-800">
                {identifierType === 'email' ? 'Check Your Email' : 'Verify Your Number'}
              </h2>
              <p className="text-gray-600 mt-2">
                We&apos;ve sent a 4-digit code to{' '}
                <span className="font-semibold text-green-700">{getMaskedIdentifier()}</span>
              </p>
              {identifierType === 'email' && (
                <p className="text-gray-400 text-xs mt-1">Check your spam folder if you don&apos;t see it</p>
              )}
              {identifierType === 'phone' && (
                <p className="text-gray-400 text-xs mt-1">Check the server terminal for the OTP code</p>
              )}
            </div>

            <div className="flex justify-center gap-3 mb-8" onPaste={handleOtpPaste}>
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-16 h-16 text-3xl text-center border-2 border-gray-300 rounded-lg focus:border-green-400 focus:outline-none"
                  inputMode="numeric"
                />
              ))}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm text-center mb-4">
                {error}
              </motion.div>
            )}

            <div className="text-center mb-6">
              {timer > 0 ? (
                <p className="text-gray-500">Resend OTP in {timer}s</p>
              ) : (
                <button onClick={resendOtp} disabled={loading} className="text-green-600 hover:text-green-800 font-medium">
                  Resend OTP
                </button>
              )}
            </div>

            <motion.button
              onClick={verifyOtp}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-lg font-semibold shadow hover:shadow-lg transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? <LoadingSpinner text="Verifying..." /> : 'Verify OTP'}
            </motion.button>

            <button
              onClick={() => { setStep(1); setOtp(['', '', '', '']); setError(''); }}
              className="w-full text-center mt-4 text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Change {identifierType === 'email' ? 'email' : 'mobile number'}
            </button>
          </div>
        )}

        {/* ─────────── STEP 3: Profile ─────────── */}
        {step === 3 && !isSubmitted && (
          <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-lg rounded-xl px-8 py-2 w-full max-w-md">
            <div className="text-center mb-6">
              <Image src="/images/logo.svg" alt="Logo" width={160} height={160} className="mx-auto mb-2 rounded-3xl" />
              <h2 className="text-2xl font-bold text-green-800">Complete Your Profile</h2>
              <p className="text-gray-600 mt-2">Please provide the following information</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={userData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={50}
                  className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black placeholder-transparent focus:outline-none"
                  placeholder="Full Name"
                />
                <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                  Full Name*
                </label>
              </div>

              {/* Verified identifier */}
              <div className="relative">
                <input type="text" value={identifier} readOnly className="w-full bg-gray-50 border-b-2 border-green-400 pt-4 pb-1 text-black focus:outline-none cursor-not-allowed" />
                <label className="absolute left-0 -top-2 text-sm text-green-600 font-medium">
                  {identifierType === 'email' ? 'Email' : 'Mobile Number'} ✓ Verified
                </label>
              </div>

              {/* Secondary contact */}
              {identifierType === 'phone' ? (
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black placeholder-transparent focus:outline-none"
                    placeholder="Email Address"
                  />
                  <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                    Email Address
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setUserData((prev) => ({ ...prev, phone: val }));
                    }}
                    maxLength={10}
                    inputMode="numeric"
                    className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black placeholder-transparent focus:outline-none"
                    placeholder="Mobile Number"
                  />
                  <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                    Mobile Number
                  </label>
                </div>
              )}

              {/* DOB */}
              {role === 'user' && (
                <div className="relative">
                  <input
                    type="date"
                    name="dob"
                    value={userData.dob}
                    onChange={handleInputChange}
                    required
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                    className="w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black focus:outline-none"
                  />
                  <label className="absolute left-0 -top-2 text-sm text-gray-500">Date of Birth* (must be 13+)</label>
                </div>
              )}

              {/* Password with strength meter */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  required
                  className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 pr-10 text-black placeholder-transparent focus:outline-none"
                  placeholder="Password"
                />
                <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                  Password*
                </label>
                <EyeIcon show={showPassword} onClick={() => setShowPassword(!showPassword)} />
              </div>

              {/* Password strength meter */}
              {userData.password && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                  {/* Strength bar */}
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= passwordCheck.strength ? strengthInfo.bg : 'bg-gray-200'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium" style={{ color: strengthInfo.color }}>
                      {strengthInfo.label}
                    </span>
                  </div>

                  {/* Requirement checklist */}
                  {!passwordCheck.isValid && (
                    <div className="text-xs space-y-0.5 mt-1">
                      {[
                        { label: 'Min 8 characters', met: userData.password.length >= 8 },
                        { label: '1 uppercase (A-Z)', met: /[A-Z]/.test(userData.password) },
                        { label: '1 lowercase (a-z)', met: /[a-z]/.test(userData.password) },
                        { label: '1 number (0-9)', met: /\d/.test(userData.password) },
                        { label: '1 special char (!@#$...)', met: /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/`~\\]/.test(userData.password) },
                      ].map(({ label, met }) => (
                        <div key={label} className={`flex items-center gap-1.5 ${met ? 'text-green-600' : 'text-gray-400'}`}>
                          {met ? (
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="4" />
                            </svg>
                          )}
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 pr-10 text-black placeholder-transparent focus:outline-none"
                  placeholder="Confirm Password"
                />
                <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                  Confirm Password*
                </label>
                <EyeIcon show={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
              </div>

              {/* Password match indicator */}
              {userData.confirmPassword && (
                <p className={`text-xs ${userData.password === userData.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {userData.password === userData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}

              {/* Error display */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm text-center">
                  {error}
                </motion.div>
              )}

              {/* Server-side password errors */}
              {apiErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-xs font-medium mb-1">Password requirements not met:</p>
                  <ul className="text-red-500 text-xs space-y-0.5 list-disc list-inside">
                    {apiErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading || !passwordCheck.isValid || userData.password !== userData.confirmPassword}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-lg font-semibold shadow hover:shadow-lg transition mt-6 ${loading || !passwordCheck.isValid || userData.password !== userData.confirmPassword
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                  }`}
              >
                {loading ? <LoadingSpinner text="Creating Account..." /> : 'Complete Registration'}
              </motion.button>
            </form>
          </div>
        )}

        {/* ─────────── SUCCESS ─────────── */}
        {step === 3 && isSubmitted && (
          <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-lg rounded-xl px-8 py-10 w-full max-w-md">
            <div className="text-center mb-6">
              <Image src="/images/logo.svg" alt="Logo" width={120} height={120} className="mx-auto mb-4 rounded-3xl" />
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
                <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Welcome {userData.name}!</h2>
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