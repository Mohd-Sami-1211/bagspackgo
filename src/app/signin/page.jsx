'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SignInPage() {
  const [role, setRole] = useState('user');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { onLogin } = useAuth();

  // Auto-select role from URL query param (e.g. /signin?role=provider)
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'provider' || roleParam === 'user') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your email or mobile number');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          role,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update global auth state
        onLogin(data.user);

        // Redirect based on role
        if (data.user.role === 'provider') {
          router.push('/serviceprovider');
        } else {
          router.push('/user/trip');
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Eye icon component
  const EyeIcon = () => (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-0 top-3 text-gray-400 hover:text-gray-600 p-1"
    >
      {showPassword ? (
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

  // Loading spinner
  const LoadingSpinner = ({ text }) => (
    <span className="flex items-center justify-center gap-2">
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {text}
    </span>
  );

  return (
    <div className="flex flex-1 min-h-screen mx-auto">
      {/* Travel Hero Panel */}
      <div className="hidden md:block md:w-1/2 relative">
        <Image
          src="/images/signin.jpg"
          alt="Travel Hero"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 flex flex-col p-12 text-white">
          <h2 className="text-4xl font-bold mb-4 mx-auto">Welcome Back</h2>
          <p className="text-xl mb-6 pl-8">
            {role === 'user'
              ? 'Continue your journey and discover unforgettable experiences.'
              : 'Manage your services and connect with travelers.'}
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-1 bg-green-400 ml-8"></div>
            <span className="text-sm font-medium">Explore the world</span>
          </div>
        </div>
      </div>

      {/* Sign In Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-1 items-center justify-center p-8 bg-green-100"
      >
        <div className="bg-white/90 backdrop-blur-md border border-white/40 shadow-lg rounded-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Image
              src="/images/logo.svg"
              alt="Logo"
              width={160}
              height={160}
              className="mx-auto mb-4 rounded-3xl"
            />
            <h2 className="text-3xl font-bold text-green-800">Sign In</h2>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-3 justify-center mb-6">
            {['user', 'provider'].map((t) => (
              <motion.button
                key={t}
                onClick={() => {
                  setRole(t);
                  setError('');
                }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2 rounded-full font-medium transition ${role === t
                  ? 'bg-green-400 text-white'
                  : 'bg-white text-green-800 border-b-2 border-green-300'
                  }`}
              >
                {t === 'user' ? 'User' : 'Service Provider'}
              </motion.button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email / Phone */}
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black placeholder-transparent focus:outline-none"
                placeholder="Email / Mobile Number"
              />
              <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                Email / Mobile Number
              </label>
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 pr-10 text-black placeholder-transparent focus:outline-none"
                placeholder="Password"
              />
              <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                Password
              </label>
              <EyeIcon />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-lg font-semibold shadow hover:shadow-lg transition ${loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {loading ? <LoadingSpinner text="Signing In..." /> : 'Sign In'}
            </motion.button>
          </form>

          {/* Links */}
          <div className="mt-4 text-center text-black">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline text-blue-600 hover:text-blue-900">
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}