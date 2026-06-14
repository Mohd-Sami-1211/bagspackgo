// src/app/layout.js — Server Component (enables metadata for ALL pages)
import './globals.css';
import { DM_Sans } from 'next/font/google';
import ClientLayout from '@/components/common/ClientLayout';
import ToastProvider from '@/components/ui/ToastProvider';
import { ErrorProvider } from '@/context/ErrorContext';

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
    variable: '--font-dm-sans',
});

export const metadata = {
    metadataBase: new URL('https://bagspackgo.com'),
    title: {
        default: 'bagspackgo — Kashmir Tour Packages with Verified Local Guides',
        template: '%s | bagspackgo',
    },
    description:
        'Explore Kashmir, Ladakh, Bhaderwah, and Warwan and Marwah Valley with verified local guides. Book budget & premium tour packages, treks, and events with transparent pricing — no middlemen.',
    keywords: [
        'kashmir tour packages',
        'ladakh tour packages',
        'bhaderwah tourism',
        'warwan and marwah valley trekking',
        'kashmir trip',
        'kashmir travel',
        'local guide kashmir',
        'kashmir tourism',
        'kashmir trekking',
        'gulmarg',
        'pahalgam',
        'sonmarg',
        'srinagar tour',
        'ladakh trip',
        'kashmir honeymoon packages',
        'kashmir budget trip',
        'offbeat kashmir',
    ],
    authors: [{ name: 'bagspackgo', url: 'https://bagspackgo.com' }],
    creator: 'bagspackgo',
    publisher: 'bagspackgo',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'google-site-verification-id',
    },
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://bagspackgo.com',
        siteName: 'bagspackgo',
        title: 'bagspackgo — Kashmir Tour Packages with Verified Local Guides',
        description:
            'Explore Kashmir, Ladakh, Bhaderwah, and Warwan and Marwah Valley with verified local guides. Book budget & premium tour packages, treks, and events. Transparent pricing, no middlemen.',
        images: [
            {
                url: '/logo.png',
                width: 1200,
                height: 630,
                alt: 'bagspackgo — Explore Kashmir with Local Guides',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'bagspackgo — Kashmir Tour Packages with Verified Local Guides',
        description:
            'Book trips in Kashmir, Ladakh, and more with verified local guides. Budget & premium packages available.',
        images: ['/logo.png'],
    },
    alternates: {
        canonical: 'https://bagspackgo.com',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${dmSans.variable} w-full overflow-x-hidden`}>
            <body
                className={`${dmSans.className} bg-white/90 text-gray-800 min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden antialiased`}
            >
                <ErrorProvider>
                    <ClientLayout>{children}</ClientLayout>
                </ErrorProvider>
                <ToastProvider />
            </body>
        </html>
    );
}