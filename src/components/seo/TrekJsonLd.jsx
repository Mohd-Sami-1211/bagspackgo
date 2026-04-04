// src/components/seo/TrekJsonLd.jsx
// Structured data for the trek listing page — FAQPage + ItemList

export default function TrekJsonLd() {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'What is the best time for trekking in Kashmir?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Most Kashmir treks operate from June to September when trails are open and weather is pleasant. Early-season (May-June) and late-season (October) treks are available on select routes. Winter treks like snow trekking in Sonamarg run December-February.',
                },
            },
            {
                '@type': 'Question',
                name: 'What are the best treks in Kashmir?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The top Kashmir treks include: Kashmir Great Lakes Trek (7 days, moderate), Tarsar Marsar Trek (6 days, moderate), Kolahoi Glacier Trek (5 days, challenging), Naranag Gangabal Trek (4 days, moderate), and Aru Valley Trek (3 days, easy). Book with verified local trek leaders on bagspackgo.',
                },
            },
            {
                '@type': 'Question',
                name: 'Do I need prior trekking experience for Kashmir treks?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'It depends on the difficulty level. Kashmir offers treks for all levels: Aru Valley and Betaab Valley walks are beginner-friendly, Great Lakes and Tarsar Marsar are moderate, while Kolahoi Glacier requires prior experience. Each listing specifies difficulty on bagspackgo.',
                },
            },
            {
                '@type': 'Question',
                name: 'How much does a Kashmir trek cost?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Kashmir trek costs range from ₹2,000-4,000/person for short 2-3 day treks to ₹8,000-15,000/person for longer 6-8 day expeditions like the Great Lakes Trek. Prices include guides, camping, and meals. Compare prices from multiple guides on bagspackgo.',
                },
            },
            {
                '@type': 'Question',
                name: 'Are guides and porters included in Kashmir trek packages?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes, every trek booked on bagspackgo is led by verified local guides. Porter and cook availability is listed on each package. Most multi-day treks include all meals and camping accommodation.',
                },
            },
        ],
    };

    const trekListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Best Treks in Kashmir',
        description: 'Curated list of the best trekking routes in Kashmir with verified local guides',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Kashmir Great Lakes Trek',
                description: 'A 7-day odyssey past Vishansar, Krishansar, Gadsar, Satsar, and Gangabal lakes — the crown jewel of Kashmir trekking.',
                url: 'https://bagspackgo.com/user/trek',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Tarsar Marsar Trek',
                description: 'Six days through meadows of wildflowers to the iconic heart-shaped Tarsar Lake and the ethereal Marsar Lake.',
                url: 'https://bagspackgo.com/user/trek',
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: 'Kolahoi Glacier Trek',
                description: 'A challenging 5-day route to the Goddess of Light — the largest glacier in Kashmir at 4,700m.',
                url: 'https://bagspackgo.com/user/trek',
            },
            {
                '@type': 'ListItem',
                position: 4,
                name: 'Naranag Gangabal Trek',
                description: 'Starting at ancient temple ruins, this 4-day trek leads to the sacred Gangabal Lake beneath Harmukh peak.',
                url: 'https://bagspackgo.com/user/trek',
            },
            {
                '@type': 'ListItem',
                position: 5,
                name: 'Sonamarg Vishansar Trek',
                description: 'Begin from the Meadow of Gold and cross the Nichnai Pass (4,100m) to reach the turquoise waters of Vishansar.',
                url: 'https://bagspackgo.com/user/trek',
            },
            {
                '@type': 'ListItem',
                position: 6,
                name: 'Aru Valley Trek',
                description: 'A beginner-friendly 3-day route following the Lidder River to the beautiful Lidderwat camping grounds.',
                url: 'https://bagspackgo.com/user/trek',
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(trekListSchema) }}
            />
        </>
    );
}
