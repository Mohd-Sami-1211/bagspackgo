// src/components/common/ClientLayout.jsx
'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from 'src/components/common/Navbar';
import Footer from 'src/components/common/Footer';
import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/auth/AuthModal';
import PendingBookingNotification from 'src/components/common/PendingBookingNotification';
import SWRProvider from '@/components/common/SWRProvider';
import PresenceHeartbeat from '@/components/common/PresenceHeartbeat';

export default function ClientLayout({ children }) {
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);

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
        <SWRProvider>
            <AuthProvider>
                <AuthModal />
                <PendingBookingNotification />
                <PresenceHeartbeat />
                {!hideNavbar && <Navbar />}

                <main className="flex-grow w-full pb-20 md:pb-0">{children}</main>

                {!hideFooter && <Footer />}
            </AuthProvider>
        </SWRProvider>
    );
}
