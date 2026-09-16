import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import GuideDetails from '@/components/home/TripSection/GuideDetails';
import { getPublicPackage, tripGuideFromPackage } from '@/lib/publicCatalog';
import { pageMetadata, packagePath, breadcrumbs } from '@/lib/seo';
import { tripSearchMetadata, tripStructuredData } from '@/lib/detailSeo';
import JsonLd from '@/components/seo/JsonLd';
import { packageHeroFor } from '@/lib/packageHero';
export const revalidate = 300;
export async function generateMetadata({ params }) {
  const { id } = await params;
  const pkg = await getPublicPackage(id);
  if (!pkg || pkg.category !== 'trip') return { title: 'Trip not found', robots: { index: false } };
  return pageMetadata({ ...tripSearchMetadata(pkg),
    path: packagePath(pkg), image: packageHeroFor(id) });
}
export default async function TripPage({ params }) {
  const { id } = await params;
  const pkg = await getPublicPackage(id);
  if (!pkg || pkg.category !== 'trip') notFound();
  const path = packagePath(pkg);
  return <>
    <JsonLd data={breadcrumbs([{ name: 'Trips', path: '/user/trip' }, { name: pkg.name, path }])} />
    <JsonLd data={tripStructuredData(pkg, { path, image: packageHeroFor(id) })} />
    <Suspense fallback={<p className="px-6 py-24">{pkg.name}</p>}><GuideDetails guide={tripGuideFromPackage(pkg)} /></Suspense>
  </>;
}
