import ProviderProfileContent from '@/components/user/ProviderProfileContent';
import JsonLd from '@/components/seo/JsonLd';
import { providerProfilePath } from '@/lib/providerSlug';
import { absoluteUrl, pageMetadata, breadcrumbs } from '@/lib/seo';
export function providerPath(provider) { return providerProfilePath(provider.slug || provider.name, provider._id); }
export function providerMetadata(data) {
  if (!data?.provider) return { title: 'Provider not found', robots: { index: false } };
  const p = data.provider;
  return pageMetadata({ title: p.name + ' — Trips & Events', description: p.bio || 'Explore trips and events hosted by ' + p.name + ' on Bagspackgo.', path: providerPath(p), image: p.logo });
}
export default function ProviderPage({ data }) {
  const p = data.provider;
  const path = providerPath(p);
  return <>
    <div id="datepicker-portal" />
    <JsonLd data={breadcrumbs([{ name: p.name, path }])} />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'TravelAgency', '@id': absoluteUrl(path) + '#provider',
      name: p.name, description: p.bio || 'Travel experiences hosted by ' + p.name + '.', url: absoluteUrl(path), image: absoluteUrl(p.logo),
      ...(p.location ? { areaServed: { '@type': 'Place', name: p.location } } : {}),
      ...(p.rating >= 1 && p.rating <= 5 && p.reviews > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews, bestRating: 5, worstRating: 1 } } : {}) }} />
    <ProviderProfileContent providerId={p._id} providerSlug={p.slug} initialData={data} />
  </>;
}

