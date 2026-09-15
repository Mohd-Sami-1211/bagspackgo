import Link from 'next/link';
import { travelGuides } from '@/data/travelGuides';
import { pageMetadata, breadcrumbs } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
export const metadata = pageMetadata({ title: 'Kashmir Travel Guides: Planning, Budget, Treks & Offbeats', description: 'Practical Kashmir trip-planning guides from Bagspackgo. Compare packages, calculate a budget, find treks and offbeat trips, and plan independent travel.', path: '/travel-guides' });
export default function GuidesPage() {
  return <section className="mx-auto max-w-7xl px-5 py-16 text-[#17372f] sm:px-8">
    <JsonLd data={breadcrumbs([{ name: 'Travel guides', path: '/travel-guides' }])} />
    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9b7440]">Start with a good question</p>
    <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight sm:text-6xl">Your Kashmir trip,<br />a little clearer.</h1>
    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">From the first itinerary to the final budget, find practical ways to compare your options and plan the journey that suits you.</p>
    <div className="mt-12 grid gap-6 md:grid-cols-2">{travelGuides.map(g => <article key={g.slug} className="rounded-3xl border border-[#17372f]/15 bg-[#f8f6f0] p-7"><p className="text-xs font-bold uppercase tracking-widest text-[#9b7440]">{g.category}</p><h2 className="mt-4 font-serif text-3xl"><Link href={'/travel-guides/' + g.slug} className="hover:underline">{g.title}</Link></h2><p className="mt-4 leading-7 text-slate-600">{g.description}</p></article>)}</div>
  </section>;
}

