// src/app/user/events/layout.jsx
export const metadata = {
    title: 'Kashmir, Ladakh & Bhaderwah Events 2026 — Unique Local Adventures',
    description:
        'Discover unique Himalayan events: skiing camps in Gulmarg, photography tours in Ladakh, and cultural festivals in Bhaderwah. Book your experience on bagspackgo.',
    keywords: [
        'kashmir events',
        'ladakh events',
        'bhaderwah tourism',
        'kishtwar trekking',
        'kashmir skiing camp',
        'ladakh photography tour',
        'bhaderwah cultural festival',
        'things to do in kashmir',
        'himalayan adventure activities',
    ],
    openGraph: {
        title: 'Kashmir & Ladakh Events & Experiences 2026 | bagspackgo',
        description:
            'Book unique Himalayan events and local experiences. Skiing, photography tours, cultural festivals & more.',
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