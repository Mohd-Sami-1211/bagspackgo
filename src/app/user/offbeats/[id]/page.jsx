import { notFound } from 'next/navigation';
import OffbeatDetailsContent from '@/components/user/OffbeatDetailsContent';
import { getPublicOffbeat } from '@/lib/publicCatalog';
import { pageMetadata, breadcrumbs, absoluteUrl, DEFAULT_IMAGE, plainText } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
function shareImage(item) { return /^(https:\/\/|\/)/.test(item.coverPhoto || '') ? item.coverPhoto : DEFAULT_IMAGE; }
export const revalidate = 300;
export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getPublicOffbeat(id);
  if (!item) return { title: 'Destination not found', robots: { index: false } };
  return pageMetadata({ title: item.title + ' — ' + item.region + ' Offbeat Trip', description: item.shortDescription, path: '/user/offbeats/' + id, image: shareImage(item) });
}
export default async function OffbeatPage({ params }) {
  const { id } = await params;
  const item = await getPublicOffbeat(id);
  if (!item) notFound();
  const path = '/user/offbeats/' + id;
  return <>
    <JsonLd data={breadcrumbs([{ name: 'Offbeats', path: '/user/offbeats' }, { name: item.title, path }])} />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'TouristDestination', name: item.destination, description: plainText(item.description, 5000), url: absoluteUrl(path), image: absoluteUrl(shareImage(item)), containedInPlace: { '@type': 'Place', name: item.region } }} />
    <OffbeatDetailsContent id={id} initialData={item} />
  </>;
}
