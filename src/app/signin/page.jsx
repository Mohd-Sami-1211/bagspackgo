'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

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

  // Auto-select role from URL
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
        onLogin(data.user);

        // Slight delay for animation
        setTimeout(() => {
          if (data.user.role === 'provider') {
            router.push('/serviceprovider/dashboard');
          } else {
            router.push('/user/trip');
          }
        }, 500);
      } else {
        setError(data.message);
        setLoading(false);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex bg-white font-sans text-gray-900 overflow-x-hidden">

      {/* 🎨 LEFT: Immersive Image Panel (Hidden on tiny screens, Full on Mobile via absolute) */}
      <div className="fixed inset-0 md:relative md:w-1/2 lg:w-[55%] xl:w-[60%] flex-shrink-0 bg-black z-0">
        <Image
          src="/images/signin.jpg"
          alt="Travel Adventure"
          fill
          className="object-cover opacity-60 md:opacity-100" // Dark overlay on mobile
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-black/30 md:via-transparent" />

        {/* Hero Text */}
        <div className="hidden md:block absolute bottom-0 left-0 p-8 md:p-12 lg:p-16 text-white max-w-2xl z-10 w-full mb-16 md:mb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
              {role === 'user' ? 'Explore the Unseen.' : 'Share the Adventure.'}
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light max-w-md leading-relaxed hidden sm:block">
              {role === 'user'
                ? 'Join a community of 50,000+ travelers discovering the world\'s hidden gems.'
                : 'Connect with travelers worldwide and grow your business with our intuitive tools.'}
            </p>


          </motion.div>
        </div>
      </div>

      {/* 📝 RIGHT: Form Section (Glassmorphism on Mobile, White on Desktop) */}
      <div className="relative w-full md:w-1/2 lg:w-[45%] xl:w-[40%] flex items-center justify-center p-4 sm:p-8 z-10">

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl md:bg-white rounded-2xl md:rounded-none shadow-2xl md:shadow-none p-6 sm:p-10 border border-white/20 md:border-none"
        >
          {/* Header */}
          <div className="text-center md:text-left mb-10">
            <Link href="/" className="inline-block mb-8">
              <div className="w-[140px] h-[45px] relative">
                <Image src="/images/logo.svg" alt="BagspackGo" fill className="object-contain" />
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 mt-2 text-sm">Please enter your details to sign in.</p>
          </div>

          {/* Role Toggle */}
          <div className="p-1 bg-gray-100/80 rounded-xl flex mb-8 relative">
            <motion.div
              className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm border border-black/5 z-0"
              initial={false}
              animate={{
                left: role === 'user' ? '4px' : '50%',
                width: 'calc(50% - 4px)'
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            {['user', 'provider'].map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); setError(''); }}
                className={`flex-1 relative z-10 py-2.5 text-sm font-medium text-center transition-colors duration-200 ${role === r ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {r === 'user' ? 'Traveler' : 'Service Provider'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Identifier Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider pl-1">
                Email / Mobile
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none pl-11 text-gray-900 placeholder-gray-400 font-medium"
                  placeholder="name@example.com"
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-500" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <Link href="#" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none pl-11 pr-11 text-gray-900 placeholder-gray-400 font-medium"
                  placeholder="Enter your password"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all ${loading
                ? 'bg-emerald-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Don&apos;t have an account?{' '}
              <Link href={`/signup?role=${role}`} className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}