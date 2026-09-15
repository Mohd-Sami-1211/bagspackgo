import { notFound, permanentRedirect } from 'next/navigation';
import { getPublicProviderProfile } from '@/lib/publicProviderProfile';
import { isReservedProviderSlug } from '@/lib/providerSlug';
import ProviderPage, { providerPath, providerMetadata } from '@/components/seo/ProviderPage';
export const revalidate = 300;
export async function generateMetadata({ params }) {
  const { providerSlug } = await params;
  if (isReservedProviderSlug(providerSlug)) return providerMetadata(null);
  return providerMetadata(await getPublicProviderProfile(providerSlug));
}
export default async function PublicProviderPage({ params }) {
  const { providerSlug } = await params;
  if (isReservedProviderSlug(providerSlug)) notFound();
  const data = await getPublicProviderProfile(providerSlug);
  if (!data?.provider) notFound();
  const path = providerPath(data.provider);
  if ('/' + providerSlug !== path) permanentRedirect(path);
  return <ProviderPage data={data} />;
}
