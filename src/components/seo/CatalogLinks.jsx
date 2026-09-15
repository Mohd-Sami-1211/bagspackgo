import Link from 'next/link';
import { getPublicCatalog } from '@/lib/publicCatalog';
import { packagePath } from '@/lib/seo';
import { providerProfilePath } from '@/lib/providerSlug';

// These ordinary server-rendered links remain usable before client search loads.
export default async function CatalogLinks({ category }) {
  const catalog = await getPublicCatalog();
  const items = category === 'offbeats' ? catalog.offbeats.map(p => ({ name: p.title, detail: [p.destination, p.region].join(' · '), path: '/user/offbeats/' + p._id }))
    : category === 'events' ? catalog.events.map(p => ({ name: p.title, detail: p.location + ' · ' + new Date(p.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium' }), path: '/user/events/eventdetails/' + p._id }))
    : category === 'providers' ? catalog.providers.map(p => ({ name: p.name, detail: p.destinationId, path: providerProfilePath(p.profileSlug || p.name, p.guide) }))
    : catalog.packages.filter(p => p.category === category).map(p => ({ name: p.name, detail: p.destination + ' · ' + p.days + ' days', path: packagePath(p) }));
  if (!items.length) return <p className="text-sm text-slate-600">New listings will appear here as they become available.</p>;
  return <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.slice(0, 12).map(item =>
    <li key={item.path}><Link href={item.path} className="block h-full rounded-2xl border border-[#17372f]/15 bg-white p-5 transition hover:border-[#17372f]/50">
      <span className="font-semibold text-[#17372f]">{item.name}</span><span className="mt-2 block text-sm text-slate-600">{item.detail}</span>
    </Link></li>)}</ul>;
}

