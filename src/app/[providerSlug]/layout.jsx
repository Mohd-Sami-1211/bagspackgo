import { notFound } from 'next/navigation';
import { getPublicProviderProfile } from '@/lib/publicProviderProfile';
export const revalidate = 300;
export default async function ProviderLayout({ children, params }) {
  const { providerSlug } = await params;
  if (!await getPublicProviderProfile(providerSlug)) notFound();
  return children;
}

