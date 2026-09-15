import { Suspense } from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import TrekGuideDetails from '@/components/home/TrekSection/GuideDetails';
import { getPublicPackage } from '@/lib/publicCatalog';
import { pageMetadata, packagePath, breadcrumbs, absoluteUrl, plainText } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
export const revalidate = 300;
async function resolvePackage(params, searchParams) {
  const { id } = await params;
  const query = await searchParams;
  const packageId = typeof query.trekId === 'string' ? query.trekId : id;
  return getPublicPackage(packageId);
}
export async function generateMetadata({ params, searchParams }) {
  const pkg = await resolvePackage(params, searchParams);
  if (!pkg || pkg.category !== 'trek') return { title: 'Trek not found', robots: { index: false } };
  return pageMetadata({ title: pkg.name + ' — ' + pkg.days + '-Day Trek', description: pkg.aboutPackage || 'Explore ' + pkg.name + ' with ' + pkg.provider.companyname + '. Compare the route, difficulty, itinerary and inclusions.', path: packagePath(pkg) });
}
export default async function TrekPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const pkg = await resolvePackage(params, searchParams);
  if (!pkg || pkg.category !== 'trek') notFound();
  if (id !== pkg._id) {
    const suffix = new URLSearchParams();
    for (const [key,value] of Object.entries(query)) if (typeof value === 'string' && key !== 'trekId') suffix.set(key,value);
    permanentRedirect(packagePath(pkg) + (suffix.size ? '?' + suffix.toString() : ''));
  }
  return <>
    <JsonLd data={breadcrumbs([{ name: 'Treks', path: '/user/trek' }, { name: pkg.name, path: packagePath(pkg) }])} />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'TouristTrip', name: pkg.name, url: absoluteUrl(packagePath(pkg)), description: plainText(pkg.aboutPackage || pkg.name, 5000), provider: { '@type': 'TravelAgency', name: pkg.provider.companyname } }} />
    <Suspense fallback={<p className="p-8">{pkg.name}</p>}><TrekGuideDetails guide={pkg} /></Suspense>
  </>;
}
