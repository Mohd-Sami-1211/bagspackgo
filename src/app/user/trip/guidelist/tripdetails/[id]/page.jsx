import { notFound, permanentRedirect } from 'next/navigation';
import { getPublicPackage } from '@/lib/publicCatalog';
import { getPublicProviderProfile } from '@/lib/publicProviderProfile';
import { providerProfilePath } from '@/lib/providerSlug';
export async function generateMetadata() { return { robots: { index: false, follow: true } }; }
export default async function LegacyTripPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const packageId = typeof query.packageId === 'string' ? query.packageId : id;
  const pkg = await getPublicPackage(packageId);
  if (pkg?.category === 'trip') {
    const suffix = new URLSearchParams();
    for (const [key,value] of Object.entries(query)) if (typeof value === 'string' && key !== 'packageId') suffix.set(key,value);
    permanentRedirect('/trip/' + pkg._id + (suffix.size ? '?' + suffix.toString() : ''));
  }
  if (query.packageId) notFound();
  const profile = await getPublicProviderProfile(id);
  if (!profile?.provider) notFound();
  permanentRedirect(providerProfilePath(profile.provider.slug || profile.provider.name, profile.provider._id));
}
