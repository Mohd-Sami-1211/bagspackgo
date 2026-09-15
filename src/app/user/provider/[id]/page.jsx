import { notFound, permanentRedirect } from 'next/navigation';
import { getPublicProviderProfile } from '@/lib/publicProviderProfile';
import ProviderPage, { providerPath, providerMetadata } from '@/components/seo/ProviderPage';
export const revalidate = 300;
export async function generateMetadata({ params }) {
  const { id } = await params;
  return providerMetadata(await getPublicProviderProfile(id));
}
export default async function LegacyProviderProfile({ params }) {
  const { id } = await params;
  const data = await getPublicProviderProfile(id);
  if (!data?.provider) notFound();
  const path = providerPath(data.provider);
  if (path !== '/user/provider/' + id) permanentRedirect(path);
  return <ProviderPage data={data} />;
}
