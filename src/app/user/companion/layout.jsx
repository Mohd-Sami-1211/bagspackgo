// src/app/user/companion/layout.jsx
export const metadata = {
    title: 'Travel Companion — Expert Consultation for Independent Travellers',
    description:
        'Explore Kashmir, Ladakh & beyond independently with a verified local Companion by your side. 24/7 support, custom itinerary, honest pricing, hidden gems. Request a free callback today.',
    keywords: [
        'kashmir travel companion',
        'kashmir travel consultant',
        'kashmir independent travel help',
        'solo travel kashmir expert',
        'kashmir trip planning service',
        'kashmir local guide consultation',
        'kashmir travel 24 7 support',
        'ladakh travel companion',
        'kashmir hidden gems',
        'independent travel kashmir',
    ],
    openGraph: {
        title: 'Travel Companion — Expert Help for Independent Travellers | bagspackgo',
        description:
            'Get a verified local expert assigned to you for your Kashmir trip. 24/7 support, honest prices, hidden gems. Request a free callback.',
        url: 'https://bagspackgo.com/user/companion',
        type: 'website',
    },
    alternates: {
        canonical: 'https://bagspackgo.com/user/companion',
    },
};

export default function CompanionLayout({ children }) {
    return (
        <div className="min-h-screen bg-white">
            {children}
        </div>
    );
}
