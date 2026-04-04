// src/app/user/events/layout.jsx
export const metadata = {
    title: 'Kashmir Events & Experiences 2026 — Unique Local Adventures',
    description:
        'Discover unique Kashmir events: skiing camps, photography tours, cultural festivals & group adventures. Limited slots — book your Kashmir experience on bagspackgo.',
    keywords: [
        'kashmir events',
        'kashmir experiences',
        'kashmir adventure activities',
        'kashmir skiing camp',
        'kashmir photography tour',
        'kashmir cultural festival',
        'things to do in kashmir',
        'kashmir group activities',
    ],
    openGraph: {
        title: 'Kashmir Events & Experiences 2026 | bagspackgo',
        description:
            'Book unique Kashmir events and local experiences. Skiing, photography tours, cultural festivals & more.',
        url: 'https://bagspackgo.com/user/events',
        type: 'website',
    },
    alternates: {
        canonical: 'https://bagspackgo.com/user/events',
    },
};

export default function EventsLayout({ children }) {
    return (
        <div className="min-h-screen bg-white">
            {children}
        </div>
    );
}