// src/app/user/community/layout.jsx
export const metadata = {
    title: 'Kashmir Travel Stories & Reviews — Real Trip Experiences',
    description:
        'Read real Kashmir travel stories from verified travelers. Honeymoon tales, solo adventures, trek diaries & budget trip reviews. Share your Kashmir story on bagspackgo.',
    keywords: [
        'kashmir travel stories',
        'kashmir trip review',
        'kashmir tour experience',
        'kashmir honeymoon story',
        'kashmir solo trip story',
        'kashmir trek experience',
        'kashmir budget trip review',
        'kashmir travel blog',
    ],
    openGraph: {
        title: 'Kashmir Travel Stories & Reviews | bagspackgo',
        description:
            'Real Kashmir travel stories — honeymoon tales, solo adventures, trek diaries & budget reviews from verified travelers.',
        url: 'https://bagspackgo.com/user/community',
        type: 'website',
    },
    alternates: {
        canonical: 'https://bagspackgo.com/user/community',
    },
};

export default function CommunityLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {children}
        </div>
    );
}