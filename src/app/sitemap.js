import { getPublicCatalog } from '@/lib/publicCatalog';
import { absoluteUrl, packagePath } from '@/lib/seo';
import { providerProfilePath } from '@/lib/providerSlug';
import { travelGuides, GUIDE_UPDATED_AT } from '@/data/travelGuides';
export const revalidate = 300;
export default async function sitemap() {
  // A failed refresh must not replace the last successful sitemap with a partial one.
  const catalog = await getPublicCatalog();
  const entries = [
    ...['/user/trip', '/user/trek', '/user/events', '/user/offbeats', '/user/companion', '/about', '/providers', '/travel-guides', '/privacy', '/terms'].map(path => ({ url: absoluteUrl(path) })),
    ...travelGuides.map(g => ({ url: absoluteUrl('/travel-guides/' + g.slug), lastModified: GUIDE_UPDATED_AT })),
    ...catalog.providers.map(p => ({ url: absoluteUrl(providerProfilePath(p.profileSlug || p.name, p.guide)), lastModified: p.updatedAt })),
    ...catalog.packages.map(p => ({ url: absoluteUrl(packagePath(p)), lastModified: p.updatedAt })),
    ...catalog.offbeats.map(p => ({ url: absoluteUrl('/user/offbeats/' + p._id), lastModified: p.updatedAt })),
    ...catalog.events.map(e => ({ url: absoluteUrl('/user/events/eventdetails/' + e._id), lastModified: e.updatedAt })),
  ];
  const unique = [...new Map(entries.map(entry => [entry.url, entry])).values()];
  if (unique.length > 50000) throw new Error('Sitemap exceeds 50,000 URLs; split it with generateSitemaps before publishing.');
  return unique;
}
