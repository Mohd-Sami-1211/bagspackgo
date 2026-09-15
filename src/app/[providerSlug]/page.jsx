import { notFound, redirect } from 'next/navigation';
import ProviderProfileContent from '@/components/user/ProviderProfileContent';
import { getPublicProviderProfile } from '@/lib/publicProviderProfile';
import { providerProfilePath, toProviderSlug } from '@/lib/providerSlug';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { providerSlug } = await params;
  const data = await getPublicProviderProfile(providerSlug);
  if (!data?.provider) return { title: 'Provider Not Found | bagspackgo', robots: { index: false, follow: false } };

  const provider = data.provider;
  const canonicalPath = providerProfilePath(provider.name, provider._id);
  const description = provider.bio
    ? provider.bio.slice(0, 155)
    : `Explore trips, treks and events hosted by ${provider.name} on bagspackgo.`;

  return {
    title: `${provider.name} — Trips, Treks & Events`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: 'profile',
      url: canonicalPath,
      title: `${provider.name} | bagspackgo`,
      description,
      images: [{ url: provider.logo, width: 500, height: 500, alt: `${provider.name} logo` }],
    },
    twitter: { card: 'summary', title: `${provider.name} | bagspackgo`, description, images: [provider.logo] },
  };
}

export default async function PublicProviderPage({ params }) {
  const { providerSlug } = await params;
  const data = await getPublicProviderProfile(providerSlug);
  if (!data?.provider) notFound();

  const canonicalSlug = toProviderSlug(data.provider.slug || data.provider.name);
  if (toProviderSlug(providerSlug) !== canonicalSlug) redirect(`/${canonicalSlug}`);

  const profileUrl = `https://bagspackgo.com/${canonicalSlug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': profileUrl,
    name: data.provider.name,
    description: data.provider.bio || `Travel experiences hosted by ${data.provider.name}.`,
    url: profileUrl,
    image: `https://bagspackgo.com${data.provider.logo}`,
    areaServed: data.provider.location ? { '@type': 'Place', name: data.provider.location } : undefined,
    aggregateRating: data.provider.rating > 0 && data.provider.reviews > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: data.provider.rating,
      reviewCount: data.provider.reviews,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };

  return (
    <>
      <div id="datepicker-portal" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <ProviderProfileContent
        providerId={data.provider._id}
        providerSlug={canonicalSlug}
        initialData={data}
      />
    </>
  );
}
