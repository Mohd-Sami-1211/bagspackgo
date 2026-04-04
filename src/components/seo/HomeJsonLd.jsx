// src/components/seo/HomeJsonLd.jsx
// Structured data for homepage — Organization, WebSite, FAQPage

export default function HomeJsonLd() {
    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'TravelAgency',
        name: 'bagspackgo',
        url: 'https://bagspackgo.com',
        logo: 'https://bagspackgo.com/images/logo.png',
        description:
            'Kashmir travel platform connecting tourists with verified local guides for customized tour packages and trekking expeditions.',
        foundingDate: '2025',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Srinagar',
            addressRegion: 'Jammu & Kashmir',
            addressCountry: 'IN',
        },
        areaServed: {
            '@type': 'Place',
            name: 'Kashmir, India',
        },
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            url: 'https://bagspackgo.com/user/help',
        },
    };

    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'bagspackgo',
        url: 'https://bagspackgo.com',
        description: 'Book Kashmir tour packages and treks with verified local guides.',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://bagspackgo.com/user/trip?destination={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
        },
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'What is bagspackgo?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'bagspackgo is a travel platform that connects tourists directly with verified local guides and small travel firms in Kashmir, offering customized tour packages with transparent pricing and no middlemen.',
                },
            },
            {
                '@type': 'Question',
                name: 'How much does a Kashmir trip cost?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Kashmir trip costs vary by season and package type. Budget packages start from ₹4,999/person for 3 days, premium packages from ₹12,000/person. Costs depend on duration, accommodation, activities, and group size.',
                },
            },
            {
                '@type': 'Question',
                name: 'Is Kashmir safe for tourists in 2026?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, Kashmir is safe for tourists. Popular destinations like Srinagar, Gulmarg, Pahalgam, and Sonmarg have excellent tourism infrastructure. bagspackgo connects you with verified local guides for added safety and authentic experiences.',
                },
            },
            {
                '@type': 'Question',
                name: 'What is the best time to visit Kashmir?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Kashmir is beautiful year-round. March-May for tulips and spring blooms, June-August for pleasant summer weather, September-November for stunning autumn foliage, and December-February for snowfall and skiing in Gulmarg.',
                },
            },
            {
                '@type': 'Question',
                name: 'How do I book a tour on bagspackgo?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Search by destination, dates, and group size, then browse verified local guides. Compare packages, view ratings and reviews, customize your itinerary, and book directly through the platform with secure payment.',
                },
            },
            {
                '@type': 'Question',
                name: 'Are guides on bagspackgo verified?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, all guides undergo identity verification, quality screening, and have community reviews. Only approved guides can list packages on the platform.',
                },
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </>
    );
}
