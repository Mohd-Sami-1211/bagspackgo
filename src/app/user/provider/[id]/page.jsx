// src/app/user/provider/[id]/page.jsx
// SEO-optimized provider profile page with dynamic metadata + JSON-LD
import { Suspense } from 'react';
import ProviderProfileContent from '@/components/user/ProviderProfileContent';
import dbConnect from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { Package } from '@/models/package.model';
import Review from '@/models/review.model';

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Dynamic Metadata — company name appears in Google search ──
export async function generateMetadata({ params }) {
    const { id } = await params;

    try {
        await dbConnect();

        const guideData = await Guide.findById(id).select('username applicationStatus').lean();
        if (!guideData) {
            return { title: 'Guide Not Found | bagspackgo' };
        }

        const details = (await GuideDetails.findOne({ guide: id }).lean()) || {};
        const companyName = details.companyname || guideData.username;
        const destination = details.destinationId || 'Kashmir';
        const speciality = details.speciality || '';

        const packages = await Package.find({
            provider: id,
            status: { $in: ['active', 'published'] },
        }).select('category packageCategory').lean();

        const tripCount = packages.filter(p => p.category === 'trip').length;
        const trekCount = packages.filter(p => p.category === 'trek').length;

        // Title: "CompanyName — Tours, Treks & Reviews | bagspackgo"
        // Starts with company name so Google matches when user searches the name
        const title = `${companyName} — Tours, Treks & Reviews | bagspackgo`;

        // Rich meta description packed with the company name and location keywords
        const descParts = [`Book ${companyName} packages on bagspackgo`];
        if (destination) descParts[0] += `, a verified tour operator in ${capitalize(destination)}`;
        if (speciality) descParts.push(`Specializes in ${speciality}`);
        if (tripCount > 0) descParts.push(`${tripCount} trip package${tripCount > 1 ? 's' : ''}`);
        if (trekCount > 0) descParts.push(`${trekCount} trek package${trekCount > 1 ? 's' : ''}`);
        descParts.push(`Read real reviews of ${companyName} and book instantly on bagspackgo.`);
        const description = descParts.join('. ');

        return {
            title,
            description,
            keywords: [
                companyName,
                companyName.toLowerCase(),
                `${companyName} tours`,
                `${companyName} reviews`,
                `${companyName} packages`,
                `${companyName} bagspackgo`,
                `${companyName} ${capitalize(destination)} tour`,
                `${capitalize(destination)} tour guide`,
                `${capitalize(destination)} travel agent`,
                `${capitalize(destination)} trip packages`,
                'bagspackgo',
                'bagspackgo guide',
                'book tour india',
            ],
            openGraph: {
                title: `${companyName} — Tour Packages & Reviews | bagspackgo`,
                description,
                url: `https://bagspackgo.com/user/provider/${id}`,
                siteName: 'bagspackgo',
                type: 'profile',
                images: details.logo
                    ? [{ url: details.logo, width: 400, height: 400, alt: `${companyName} logo` }]
                    : [{ url: 'https://bagspackgo.com/logo.png', width: 200, height: 200, alt: 'bagspackgo' }],
            },
            twitter: {
                card: 'summary',
                title: `${companyName} | bagspackgo`,
                description: description.substring(0, 150),
            },
            alternates: {
                canonical: `https://bagspackgo.com/user/provider/${id}`,
            },
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
        };
    } catch (err) {
        console.error('generateMetadata error for provider:', err);
        return { title: 'Tour Guide Profile | bagspackgo' };
    }
}

// ── JSON-LD Structured Data for the provider ──
async function ProviderJsonLd({ id }) {
    try {
        await dbConnect();
        const guideData = await Guide.findById(id).select('username').lean();
        const details = (await GuideDetails.findOne({ guide: id }).lean()) || {};
        const packages = await Package.find({
            provider: id,
            status: { $in: ['active', 'published'] },
        }).select('name category pricingTiers rating totalRatings').lean();

        // Fetch real reviews for review snippets
        const reviews = await Review.find({ provider: id }).sort({ createdAt: -1 }).limit(10).lean();

        const companyName = details.companyname || guideData?.username || 'Guide';
        const destination = details.destinationId || 'Kashmir';
        const profileUrl = `https://bagspackgo.com/user/provider/${id}`;

        // LocalBusiness schema — makes the company appear in Google's knowledge panel
        const localBusinessSchema = {
            '@context': 'https://schema.org',
            '@type': 'TravelAgency',
            '@id': profileUrl,
            name: companyName,
            description: details.bio || `${companyName} — Verified tour guide in ${capitalize(destination)} on bagspackgo.`,
            url: profileUrl,
            image: details.logo || 'https://bagspackgo.com/logo.png',
            telephone: '',
            address: {
                '@type': 'PostalAddress',
                addressLocality: capitalize(destination),
                addressRegion: 'Jammu & Kashmir',
                addressCountry: 'IN',
            },
            geo: {
                '@type': 'GeoCoordinates',
                latitude: {
                    kashmir: '34.0837',
                    ladakh: '34.1526',
                    bhaderwah: '32.9806',
                    "warwan-marwah-valley": '33.3106'
                }[destination] || '28.6139',
                longitude: {
                    kashmir: '74.7973',
                    ladakh: '77.5771',
                    bhaderwah: '75.7135',
                    "warwan-marwah-valley": '75.7661'
                }[destination] || '77.2090',
            },
            areaServed: {
                '@type': 'Place',
                name: capitalize(destination) + ', India',
            },
            parentOrganization: {
                '@type': 'Organization',
                name: 'bagspackgo',
                url: 'https://bagspackgo.com',
            },
            sameAs: [profileUrl],
            ...(details.rating > 0 && {
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: details.rating,
                    reviewCount: details.reviews || 1,
                    bestRating: 5,
                    worstRating: 1,
                },
            }),
            ...(reviews.length > 0 && {
                review: reviews.slice(0, 5).map(rev => ({
                    '@type': 'Review',
                    author: {
                        '@type': 'Person',
                        name: rev.name || 'Traveler',
                    },
                    reviewRating: {
                        '@type': 'Rating',
                        ratingValue: rev.rating,
                        bestRating: 5,
                    },
                    reviewBody: rev.content,
                    datePublished: rev.createdAt ? new Date(rev.createdAt).toISOString().split('T')[0] : undefined,
                })),
            }),
        };

        // Offer catalog — lists their packages for rich results
        const offerCatalog = packages.length > 0
            ? {
                  '@context': 'https://schema.org',
                  '@type': 'ItemList',
                  name: `Tour Packages by ${companyName}`,
                  itemListElement: packages.map((pkg, i) => ({
                      '@type': 'ListItem',
                      position: i + 1,
                      item: {
                          '@type': 'TouristTrip',
                          name: pkg.name,
                          url: profileUrl,
                          provider: {
                              '@type': 'TravelAgency',
                              name: companyName,
                          },
                          ...(pkg.pricingTiers?.length > 0 && {
                              offers: {
                                  '@type': 'Offer',
                                  price: Math.min(...pkg.pricingTiers.map(t => t.price)),
                                  priceCurrency: 'INR',
                                  availability: 'https://schema.org/InStock',
                              },
                          }),
                      },
                  })),
              }
            : null;

        // BreadcrumbList — helps Google understand site hierarchy
        const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://bagspackgo.com',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Tour Guides',
                    item: 'https://bagspackgo.com/user/trip/guidelist',
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: companyName,
                    item: profileUrl,
                },
            ],
        };

        // WebPage schema — reinforces the page name so Google titles match
        const webPageSchema = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `${companyName} — Tours, Treks & Reviews | bagspackgo`,
            description: details.bio || `Book ${companyName} tour packages on bagspackgo`,
            url: profileUrl,
            isPartOf: {
                '@type': 'WebSite',
                name: 'bagspackgo',
                url: 'https://bagspackgo.com',
            },
            about: {
                '@type': 'TravelAgency',
                name: companyName,
            },
        };

        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
                />
                {offerCatalog && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerCatalog) }}
                    />
                )}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
                />
            </>
        );
    } catch {
        return null;
    }
}

// ── Page Component ──
export default async function ProviderProfilePage({ params }) {
    const { id } = await params;

    return (
        <>
            {/* Portal target for DatePicker calendar popover z-index fix */}
            <div id="datepicker-portal" />
            <ProviderJsonLd id={id} />
            <Suspense
                fallback={
                    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                        <div className="w-10 h-10 border-[3px] border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
                        <p className="text-gray-500 text-sm font-medium animate-pulse">
                            Loading profile...
                        </p>
                    </div>
                }
            >
                <ProviderProfileContent providerId={id} />
            </Suspense>
        </>
    );
}
