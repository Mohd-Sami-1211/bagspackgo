import Link from 'next/link';
import { getPublicProviders } from '@/lib/publicCatalog';
import { providerProfilePath } from '@/lib/providerSlug';
import { pageMetadata, breadcrumbs } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
export const revalidate = 300;
export const metadata = pageMetadata({ title: 'Local Travel Companies & Organizers', description: 'Find local travel companies on Bagspackgo. Explore provider profiles, specialties, tour packages, treks and events before choosing your trip.', path: '/providers' });
export default async function ProvidersPage() {
  const providers = await getPublicProviders();
  return <section className="mx-auto max-w-7xl px-5 py-16 text-[#17372f] sm:px-8">
    <JsonLd data={breadcrumbs([{ name: 'Travel providers', path: '/providers' }])} />
    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9b7440]">The people behind the journey</p>
    <h1 className="mt-4 font-serif text-5xl">Meet our local travel providers</h1>
    <p className="mt-6 max-w-2xl leading-8 text-slate-600">Explore company profiles, compare their trips and discover the events they host. Open a profile to see its available experiences and traveler feedback.</p>
    <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{providers.map(p => <li key={p.guide} className="rounded-3xl border border-[#17372f]/15 bg-[#f8f6f0] p-7"><h2 className="font-serif text-2xl"><Link href={providerProfilePath(p.profileSlug || p.name, p.guide)} className="hover:underline">{p.name}</Link></h2><p className="mt-3 text-sm text-[#9b7440]">{p.destinationId}</p><p className="mt-4 leading-7 text-slate-600">{p.bio?.slice(0, 240) || 'Explore this company’s available trips, treks and events.'}</p></li>)}</ul>
    {!providers.length && <p className="mt-8">Provider profiles will appear here as they become available.</p>}
  </section>;
}

