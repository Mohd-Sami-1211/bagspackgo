// src/components/common/ClientLayout.jsx
'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from 'src/components/common/Navbar';
import SecondaryNav from 'src/components/common/SecondaryNav';
import Footer from 'src/components/common/Footer';
import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import PendingBookingNotification from 'src/components/common/PendingBookingNotification';

export default function ClientLayout({ children }) {
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);

    const hideSecondaryNav =
        pathname === '/user/trip/guidelist' ||
        pathname === '/user/trek/guidelist' ||
        pathname?.includes('/tripdetails') ||
        pathname?.includes('/trekdetails') ||
        pathname?.includes('/eventdetails') ||
        pathname?.includes('/bookings') ||
        pathname?.includes('/saved') ||
        pathname?.includes('/help') ||
        pathname?.includes('/notifications') ||
        pathname?.includes('/signin') ||
        pathname?.includes('/signup') ||
        pathname?.includes('/admin') ||
        pathname?.includes('/serviceprovider');

    const hideNavbar =
        pathname === '/signin' ||
        pathname === '/signup' ||
        pathname?.includes('/admin') ||
        pathname?.includes('/serviceprovider');

    const hideFooter =
        pathname === '/signin' ||
        pathname === '/signup' ||
        pathname?.includes('/admin') ||
        pathname?.includes('/serviceprovider');

    return (
        <AuthProvider>
            <AuthModal />
            <PendingBookingNotification />
            {/* Top Navbar (hidden for specific pages) */}
            {!hideNavbar && <Navbar />}

            {/* SecondaryNav — normal on large screens, bottom-fixed on small */}
            {!hideSecondaryNav && (
                <div className="secondary-nav-wrapper hidden md:block w-full">
                    <SecondaryNav />
                </div>
            )}

            {/* Main content */}
            <main className="flex-grow w-full pb-16 md:pb-0">{children}</main>

            {/* Footer (hidden on auth/provider pages) */}
            {!hideFooter && <Footer />}

            {/* Mobile bottom navigation */}
            {!hideSecondaryNav && (
                <div className="secondary-nav-wrapper block md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-gray-200 shadow-lg w-full">
                    <SecondaryNav />
                </div>
            )}
        </AuthProvider>
    );
}
