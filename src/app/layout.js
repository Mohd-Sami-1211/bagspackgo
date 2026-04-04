// src/app/layout.js — Server Component (enables metadata for ALL pages)
import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/common/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    metadataBase: new URL('https://bagspackgo.com'),
    title: {
        default: 'bagspackgo — Kashmir Tour Packages with Verified Local Guides',
        template: '%s | bagspackgo',
    },
    description:
        'Explore Kashmir with verified local guides. Book budget & premium tour packages for Gulmarg, Pahalgam, Sonmarg & more. Customize your Kashmir trip with transparent pricing — no middlemen.',
    keywords: [
        'kashmir tour packages',
        'kashmir trip',
        'kashmir travel',
        'local guide kashmir',
        'kashmir tourism',
        'kashmir trekking',
        'gulmarg',
        'pahalgam',
        'sonmarg',
        'srinagar tour',
        'kashmir honeymoon packages',
        'kashmir budget trip',
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
    openGraph: {
        type: 'website',
        locale: 'en_IN',
        url: 'https://bagspackgo.com',
        siteName: 'bagspackgo',
        title: 'bagspackgo — Kashmir Tour Packages with Verified Local Guides',
        description:
            'Explore Kashmir with verified local guides. Book budget & premium tour packages for Gulmarg, Pahalgam, Sonmarg & more. Transparent pricing, no middlemen.',
        images: [
            {
                url: '/images/og-homepage.jpg',
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
            'Book Kashmir trips with verified local guides. Budget & premium packages for Gulmarg, Pahalgam, Sonmarg.',
        images: ['/images/og-homepage.jpg'],
    },
    alternates: {
        canonical: 'https://bagspackgo.com',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="w-full overflow-x-hidden">
            <body
                className={`${inter.className} bg-white/90 text-gray-800 min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden`}
            >
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}