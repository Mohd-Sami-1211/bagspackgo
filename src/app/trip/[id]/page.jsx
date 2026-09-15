import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import GuideDetails from '@/components/home/TripSection/GuideDetails';
import { getPublicPackage, tripGuideFromPackage } from '@/lib/publicCatalog';
import { pageMetadata, packagePath, absoluteUrl, breadcrumbs, plainText } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import { packageHeroFor } from '@/lib/packageHero';
import { providerProfilePath } from '@/lib/providerSlug';
export const revalidate = 300;
export async function generateMetadata({ params }) {
  const { id } = await params;
  const pkg = await getPublicPackage(id);
  if (!pkg || pkg.category !== 'trip') return { title: 'Trip not found', robots: { index: false } };
  return pageMetadata({ title: pkg.name + ' — ' + pkg.days + ' Days in ' + pkg.destination,
    description: pkg.aboutPackage || 'Explore ' + pkg.name + ' by ' + pkg.provider.companyname + '. View the itinerary, pricing, inclusions and booking details.',
    path: packagePath(pkg), image: packageHeroFor(id) });
}
export default async function TripPage({ params }) {
  const { id } = await params;
  const pkg = await getPublicPackage(id);
  if (!pkg || pkg.category !== 'trip') notFound();
  const path = packagePath(pkg);
  return <>
    <JsonLd data={breadcrumbs([{ name: 'Trips', path: '/user/trip' }, { name: pkg.name, path }])} />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'TouristTrip', name: pkg.name, url: absoluteUrl(path),
      description: plainText(pkg.aboutPackage || pkg.name, 5000), image: absoluteUrl(packageHeroFor(id)),
      provider: { '@type': 'TravelAgency', name: pkg.provider.companyname, url: absoluteUrl(providerProfilePath(pkg.provider.profileSlug || pkg.provider.companyname, pkg.provider._id)) },
      touristType: pkg.packageType }} />
    <Suspense fallback={<p className="px-6 py-24">{pkg.name}</p>}><GuideDetails guide={tripGuideFromPackage(pkg)} /></Suspense>
  </>;
}
