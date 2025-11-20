'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from "axios";
import { useDispatch , useSelector } from 'react-redux';
import {addServiceProvider} from 'src/slices/serviceProviderSlice'

export default function SignInPage() {
  const dispatch = useDispatch();
  const providerCompanyData = useSelector((store)=>store.providerCompany.currentCompany);
  const getProviderData = useSelector((store)=>store.provider.currentProvider);
  const [role, setRole] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    //write backend API here 
    try {
      
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/signin`, {
        email,
        password,
        role : role =='user'? 'user' : 'provider',
      });
      console.log(res);
      if(role=='user'){
        router.push('/user/trip');
      }
      else{
        const providerData = res.data.data;
        dispatch(addServiceProvider(providerData));
        if(!providerCompanyData){
          router.push('/serviceprovider')
        }
        else{
          if(getProviderData?._id === providerCompanyData?.providerId){
            router.push('/serviceprovider/dashboard')

          }
          else{
            router.push('/serviceprovider');
          }

        }
       
        
      }

    } 
    catch (error) {
      const backendMessage = error.response?.data?.message ||'Unable to SignIn . Please try again.';
      setError(backendMessage);
      console.error('Axios error:', error);
    
    }
  };


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

      {/* Glassmorphism Form Panel */}
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

          <div className="flex gap-3 justify-center mb-6">
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <motion.div whileFocus={{ scale: 1.02 }}>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black placeholder-transparent focus:outline-none"
                  placeholder="Email / Phone Number"
                />
                <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                  Email / Phone Number
                </label>
              </div>
            </motion.div>

            <motion.div whileFocus={{ scale: 1.02 }}>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="peer w-full bg-transparent border-b-2 border-gray-400 pt-4 pb-1 text-black placeholder-transparent focus:outline-none"
                  placeholder="Password"
                />
                <label className="absolute left-0 -top-2 text-sm text-gray-500 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-1 peer-focus:text-sm transition-all duration-200 ease-in-out pointer-events-none">
                  Password
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
              className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-lg font-semibold shadow hover:shadow-lg transition"
            >
              Sign In
            </motion.button>
          </form>

          <div className="mt-4 text-center text-black">
            Don't have an account?{' '}
            <Link href="/signup" className="underline text-blue-600 hover:text-blue-900">
              Sign up
            </Link>
          </div>

          
        </div>
      </motion.div>
    </div>
  );
}