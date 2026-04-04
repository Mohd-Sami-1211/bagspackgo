// src/app/user/provider/[id]/page.jsx
// SEO-optimized provider profile page with dynamic metadata + JSON-LD
import { Suspense } from 'react';
import ProviderProfileContent from '@/components/user/ProviderProfileContent';
import dbConnect from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { Package } from '@/models/package.model';

// ── Dynamic Metadata — this is what makes the company name appear in Google ──
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
        const bio = details.bio || '';
        const speciality = details.speciality || '';

        // Fetch package count and categories for richer meta
        const packages = await Package.find({
            provider: id,
            status: { $in: ['active', 'published'] },
        }).select('category packageCategory').lean();

        const tripCount = packages.filter(p => p.category === 'trip').length;
        const trekCount = packages.filter(p => p.category === 'trek').length;

        // Build a rich, keyword-packed title
        // e.g. "Kashmir Adventures — Verified Kashmir Tour Guide | bagspackgo"
        const titleParts = [companyName];
        if (destination) titleParts.push(`Verified ${capitalize(destination)} Tour Guide`);

        const title = titleParts.join(' — ');

        // Build a rich meta description
        const descParts = [`${companyName} is a verified tour guide on bagspackgo`];
        if (destination) descParts[0] += ` based in ${capitalize(destination)}`;
        if (speciality) descParts.push(`Specializes in ${speciality}`);
        if (tripCount > 0) descParts.push(`${tripCount} trip package${tripCount > 1 ? 's' : ''} available`);
        if (trekCount > 0) descParts.push(`${trekCount} trek package${trekCount > 1 ? 's' : ''} available`);
        descParts.push('View ratings, reviews & book directly on bagspackgo.');
        const description = descParts.join('. ');

        return {
            title,
            description,
            keywords: [
                companyName.toLowerCase(),
                `${companyName.toLowerCase()} tours`,
                `${companyName.toLowerCase()} packages`,
                `${companyName.toLowerCase()} reviews`,
                `${capitalize(destination).toLowerCase()} tour guide`,
                `${capitalize(destination).toLowerCase()} travel agent`,
                'bagspackgo guide',
            ],
            openGraph: {
                title: `${companyName} — Tour Packages & Reviews | bagspackgo`,
                description,
                url: `https://bagspackgo.com/user/provider/${id}`,
                type: 'profile',
                images: details.logo
                    ? [{ url: details.logo, width: 400, height: 400, alt: companyName }]
                    : [],
            },
            twitter: {
                card: 'summary',
                title: `${companyName} | bagspackgo`,
                description: description.substring(0, 150),
            },
            alternates: {
                canonical: `https://bagspackgo.com/user/provider/${id}`,
            },
        };
    } catch (err) {
        console.error('generateMetadata error for provider:', err);
        return { title: 'Tour Guide Profile | bagspackgo' };
    }
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
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

        const companyName = details.companyname || guideData?.username || 'Guide';
        const destination = details.destinationId || 'Kashmir';

        // LocalBusiness schema — makes the company appear in Google's knowledge panel
        const localBusinessSchema = {
            '@context': 'https://schema.org',
            '@type': 'TravelAgency',
            name: companyName,
            description: details.bio || `${companyName} — Verified tour guide in ${capitalize(destination)} on bagspackgo.`,
            url: `https://bagspackgo.com/user/provider/${id}`,
            image: details.logo || '',
            address: {
                '@type': 'PostalAddress',
                addressLocality: capitalize(destination),
                addressRegion: 'Jammu & Kashmir',
                addressCountry: 'IN',
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
            ...(details.rating > 0 && {
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: details.rating,
                    reviewCount: details.reviews || 1,
                    bestRating: 5,
                    worstRating: 1,
                },
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
                          provider: {
                              '@type': 'TravelAgency',
                              name: companyName,
                          },
                          ...(pkg.pricingTiers?.length > 0 && {
                              offers: {
                                  '@type': 'Offer',
                                  price: Math.min(...pkg.pricingTiers.map(t => t.price)),
                                  priceCurrency: 'INR',
                              },
                          }),
                      },
                  })),
              }
            : null;

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
