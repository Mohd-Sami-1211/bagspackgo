import { notFound } from 'next/navigation';
import OffbeatDetailsContent from '@/components/user/OffbeatDetailsContent';
import { getPublicOffbeat } from '@/lib/publicCatalog';
import { pageMetadata, breadcrumbs, DEFAULT_IMAGE } from '@/lib/seo';
import { offbeatSearchMetadata, offbeatStructuredData } from '@/lib/detailSeo';
import JsonLd from '@/components/seo/JsonLd';
function shareImage(item) { return /^(https:\/\/|\/)/.test(item.coverPhoto || '') ? item.coverPhoto : DEFAULT_IMAGE; }
export const revalidate = 300;
export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = await getPublicOffbeat(id);
  if (!item) return { title: 'Destination not found', robots: { index: false } };
  return pageMetadata({ ...offbeatSearchMetadata(item), path: '/user/offbeats/' + id, image: shareImage(item) });
}
export default async function OffbeatPage({ params }) {
  const { id } = await params;
  const item = await getPublicOffbeat(id);
  if (!item) notFound();
  const path = '/user/offbeats/' + id;
  return <>
    <JsonLd data={breadcrumbs([{ name: 'Offbeats', path: '/user/offbeats' }, { name: item.title, path }])} />
    <JsonLd data={offbeatStructuredData(item, { path, image: shareImage(item) })} />
    <OffbeatDetailsContent id={id} initialData={item} />
  </>;
}
