'use client';
import Image from 'next/image';
import { CalendarCheck, Headphones } from 'lucide-react';
import SecondaryNav from '@/components/common/SecondaryNav';
import AnimatedButton from '@/components/common/AnimatedButton';
import MainContent from '../../../components/common/mainContent';
//changed the path to deploy
export default function TripLayout({ children }) {
  return (
    <>
      <nav className="flex items-center justify-between px-6 py-4 bg-green-400 shadow-md">
        <div className="flex items-center">
          <a href="/" className="inline-block w-[150px] h-[40px] overflow-hidden relative rounded-3xl bg-white">
            <Image 
              src="/images/logo.svg" 
              alt="Logo" 
              fill 
              className="object-contain" 
              priority 
            />
          </a>
        </div>

        <div className="flex items-center space-x-4 text-white/90 text-[15px] font-semibold">
          <a href="/bookings" className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20 hover:text-black transition-colors">
            <CalendarCheck size={16} />
            Bookings
          </a>
          <a href="/help" className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/20 hover:text-black transition-colors">
            <Headphones size={16} />
            Help
          </a>
          <AnimatedButton />
        </div>
      </nav>

      <SecondaryNav />

      <main className="bg-[#F2FFFC] bg-[url('/images/hero.svg')] bg-no-repeat min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
          <div className="">
            <MainContent /> 
          </div>
        </div>
      </main>
    </>
  );
}