import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { travelGuides } from '@/data/travelGuides';
import { pageMetadata, breadcrumbs } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import ServiceCards from '@/components/seo/ServiceCards';

export const metadata = pageMetadata({ title: 'Explore Kashmir with Bagspackgo', description: 'Your Kashmir journey starts here. Explore Bagspackgo tour packages, personalized offbeat trips, local events and 24×7 Companion call assistance.', path: '/travel-guides' });

export default function ExploreBagspackgoPage() {
  return <div className="bg-[#f8f6f0] text-[#17372f]">
    <JsonLd data={breadcrumbs([{ name: 'Explore Bagspackgo', path: '/travel-guides' }])} />
    <section className="bg-[#17372f] px-5 py-16 text-white sm:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#e4cba3]">Kashmir-based. Built around your journey.</p>
        <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">Your kind of Kashmir.<br />Your Bagspackgo.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">The package that fits. The place you want to discover. The adventure you want to join. The support to travel your way. Find it all on Bagspackgo.</p>
        <Link href="/user/trip" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#e4cba3] px-6 py-4 text-sm font-bold text-[#17372f] hover:bg-white">Explore tour packages<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
      <h2 className="mb-8 font-serif text-3xl sm:text-4xl">Four ways to make the journey yours.</h2>
      <ServiceCards services={['trips', 'offbeats', 'events', 'companion']} />
    </section>
    <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:pb-20">
      <div className="border-t border-[#17372f]/15 pt-10">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#8c6939]">What brings you to Kashmir?</p>
        <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Find your reason to go with Bagspackgo.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">{travelGuides.map(page => <Link key={page.slug} href={'/travel-guides/' + page.slug} className="group flex items-center justify-between gap-5 rounded-2xl border border-[#17372f]/15 bg-white p-6 transition hover:border-[#17372f]/50">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-[#8c6939]">{page.category}</p><h3 className="mt-2 text-lg font-semibold">{page.shortTitle}</h3></div>
          <ArrowRight size={21} className="shrink-0 transition group-hover:translate-x-1" aria-hidden="true" />
        </Link>)}</div>
      </div>
    </section>
  </div>;
}

