import { notFound, permanentRedirect } from 'next/navigation';
import { getPublicProviderProfile } from '@/lib/publicProviderProfile';
import ProviderPage, { providerPath, providerMetadata } from '@/components/seo/ProviderPage';
export const revalidate = 300;
export async function generateMetadata({ params }) {
  const { providerSlug } = await params;
  return providerMetadata(await getPublicProviderProfile(providerSlug));
}
export default async function PublicProviderPage({ params }) {
  const { providerSlug } = await params;
  const data = await getPublicProviderProfile(providerSlug);
  if (!data?.provider) notFound();
  const path = providerPath(data.provider);
  if ('/' + providerSlug !== path) permanentRedirect(path);
  return <ProviderPage data={data} />;
}
