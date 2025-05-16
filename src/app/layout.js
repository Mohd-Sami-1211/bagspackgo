'use client';
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/common/Navbar';
import SecondaryNav from '@/components/common/SecondaryNav';
import Footer from '@/components/common/Footer';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isGuideListPage = pathname === '/trip/guidelist';

  return (
    <html lang="en">
      <head />
      <body className={`${inter.className} bg-white/90 text-gray-800 min-h-screen flex flex-col`}>
        <Navbar />
        {!isGuideListPage && <SecondaryNav />}
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}