// src/app/user/trip/layout.jsx
import HomeJsonLd from '@/components/seo/HomeJsonLd';

export const metadata = {
    title: 'Kashmir Tour Packages 2026 — Budget & Premium Trips with Local Guides',
    description:
        'Compare 50+ Kashmir tour packages starting ₹4,999. Budget, premium, honeymoon & family packages with verified local guides. Srinagar, Gulmarg, Pahalgam, Sonmarg covered. Book on bagspackgo.',
    keywords: [
        'kashmir tour packages',
        'kashmir trip packages',
        'kashmir holiday packages',
        'kashmir budget tour',
        'kashmir premium tour',
        'kashmir honeymoon package',
        'kashmir family tour package',
        'srinagar tour package',
        'gulmarg tour package',
        'pahalgam tour package',
        'sonmarg tour package',
        'kashmir tour packages 2026',
    ],
    openGraph: {
        title: 'Kashmir Tour Packages 2026 — Budget & Premium | bagspackgo',
        description:
            'Book Kashmir tour packages with verified local guides. Budget & premium options for Gulmarg, Pahalgam, Sonmarg & more.',
        url: 'https://bagspackgo.com/user/trip',
        type: 'website',
        images: [
            {
                url: '/images/og-homepage.jpg',
                width: 1200,
                height: 630,
                alt: 'Kashmir Tour Packages — bagspackgo',
            },
        ],
    },
    alternates: {
        canonical: 'https://bagspackgo.com/user/trip',
    },
};

export default function TripLayout({ children }) {
    return (
        <div className="min-h-screen bg-white">
            <HomeJsonLd />
            {children}
        </div>
    );
}
