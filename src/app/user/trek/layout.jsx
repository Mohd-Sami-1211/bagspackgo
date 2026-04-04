// src/app/user/trek/layout.jsx
import TrekJsonLd from '@/components/seo/TrekJsonLd';

export const metadata = {
    title: 'Kashmir Treks 2026 — Great Lakes, Tarsar Marsar & Guided Expeditions',
    description:
        'Book guided Kashmir treks: Great Lakes, Tarsar Marsar, Kolahoi Glacier, Naranag Gangabal & more. Easy to challenging treks with verified local trek leaders. Transparent pricing on bagspackgo.',
    keywords: [
        'kashmir treks',
        'kashmir trekking packages',
        'great lakes trek kashmir',
        'tarsar marsar trek',
        'kolahoi glacier trek',
        'naranag gangabal trek',
        'kashmir trek with guide',
        'best treks in kashmir',
        'easy treks kashmir',
        'alpine treks kashmir',
        'kashmir trekking 2026',
    ],
    openGraph: {
        title: 'Kashmir Treks 2026 — Guided Trekking Expeditions | bagspackgo',
        description:
            'Explore 9+ Kashmir treks from alpine lakes to glacier routes. Book verified local trek leaders on bagspackgo.',
        url: 'https://bagspackgo.com/user/trek',
        type: 'website',
        images: [
            {
                url: '/images/GL1.jpeg',
                width: 1200,
                height: 630,
                alt: 'Kashmir Great Lakes Trek — bagspackgo',
            },
        ],
    },
    alternates: {
        canonical: 'https://bagspackgo.com/user/trek',
    },
};

export default function TrekLayout({ children }) {
    return (
        <div className="min-h-screen bg-white">
            <TrekJsonLd />
            {children}
        </div>
    );
}
