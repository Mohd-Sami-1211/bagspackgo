// page.jsx (RootLayout)
'use client';
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from 'src/components/common/Navbar';
import SecondaryNav from 'src/components/common/SecondaryNav';
import Footer from 'src/components/common/Footer';
import { usePathname } from 'next/navigation';
import ReduxProvider from './ReduxProvider';
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const hideSecondaryNav =
    pathname === '/user/trip/guidelist' ||
    pathname === '/user/trek/guidelist' ||
    pathname?.includes('/tripdetails') ||
    pathname?.includes('/trekdetails') ||
    pathname?.includes('/mergerdetails') ||
    pathname?.includes('/eventdetails') ||
    pathname?.includes('/createmerger') ||
    pathname?.includes('/bookings') ||
    pathname?.includes('/help') ||
    pathname?.includes('/signin') ||
    pathname?.includes('/signup') ||
    pathname?.includes('/serviceprovider');

  const hideNavbar =
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname?.includes('/serviceprovider');

  const hideFooter =
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname?.includes('/serviceprovider');

  return (
    <html lang="en" className="w-full overflow-x-hidden">
      <head />
      <body
        cz-shortcut-listen="true"
        className={`${inter.className} bg-white/90 text-gray-800 min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden`}
      >
        <ReduxProvider>
          {/* Top Navbar (hidden for specific pages) */}
          {!hideNavbar && <Navbar />}

          {/* SecondaryNav — normal on large screens, bottom-fixed on small */}
          {!hideSecondaryNav && (
            <div className="hidden md:block w-full">
              <SecondaryNav />
            </div>
          )}

          {/* Main content */}
          <main className="flex-grow w-full pb-16 md:pb-0">{children}</main>

          {/* Footer (hidden on auth/provider pages) */}
          {!hideFooter && <Footer />}

          {/* Mobile bottom navigation */}
          {!hideSecondaryNav && (
            <div className="block md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-gray-200 shadow-lg w-full">
              <SecondaryNav />
            </div>
          )}
        </ReduxProvider>
      </body>
    </html>
  );
}