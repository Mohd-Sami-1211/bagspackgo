import { notFound, redirect } from 'next/navigation';
import { getPublicProviderProfile } from '@/lib/publicProviderProfile';
import { providerProfilePath } from '@/lib/providerSlug';

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getPublicProviderProfile(id);
  return {
    title: data?.provider ? `${data.provider.name} | bagspackgo` : 'Provider Not Found | bagspackgo',
    robots: { index: false, follow: true },
    alternates: data?.provider ? { canonical: providerProfilePath(data.provider.name, data.provider._id) } : undefined,
  };
}
export default async function LegacyProviderProfile({ params }) {
  const { id } = await params;
  const data = await getPublicProviderProfile(id);
  if (!data?.provider) notFound();
  redirect(providerProfilePath(data.provider.name, data.provider._id));
}
