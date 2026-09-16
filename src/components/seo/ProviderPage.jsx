import ProviderProfileContent from '@/components/user/ProviderProfileContent';
import JsonLd from '@/components/seo/JsonLd';
import { providerProfilePath } from '@/lib/providerSlug';
import { pageMetadata, breadcrumbs } from '@/lib/seo';
import { providerSchema, providerSearchDescription } from '@/lib/providerSeo';
export function providerPath(provider) { return providerProfilePath(provider.slug || provider.name, provider._id); }
export function providerMetadata(data) {
  if (!data?.provider) return { title: 'Provider not found', robots: { index: false } };
  const p = data.provider;
  return pageMetadata({ title: p.name + ' — Trips & Events', description: providerSearchDescription(p), path: providerPath(p), image: p.logo });
}
export default function ProviderPage({ data }) {
  const p = data.provider;
  const path = providerPath(p);
  return <>
    <div id="datepicker-portal" />
    <JsonLd data={breadcrumbs([{ name: p.name, path }])} />
    <JsonLd data={providerSchema(p)} />
    <ProviderProfileContent providerId={p._id} providerSlug={p.slug} initialData={data} />
  </>;
}

