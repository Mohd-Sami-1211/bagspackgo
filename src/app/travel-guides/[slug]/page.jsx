import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { travelGuides, GUIDE_UPDATED_AT } from '@/data/travelGuides';
import { pageMetadata, breadcrumbs, absoluteUrl } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import ServiceCards from '@/components/seo/ServiceCards';

export function generateStaticParams() { return travelGuides.map(({ slug }) => ({ slug })); }
export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = travelGuides.find(item => item.slug === slug);
  return page ? pageMetadata({ title: page.title, description: page.description, path: '/travel-guides/' + slug }) : { robots: { index: false } };
}

export default async function TravelLandingPage({ params }) {
  const { slug } = await params;
  const page = travelGuides.find(item => item.slug === slug);
  if (!page) notFound();
  const path = '/travel-guides/' + slug;

  return <div className="bg-[#f8f6f0] text-[#17372f]">
    <JsonLd data={breadcrumbs([{ name: 'Explore Bagspackgo', path: '/travel-guides' }, { name: page.shortTitle, path }])} />
    <JsonLd data={{
      '@context': 'https://schema.org', '@type': 'WebPage', '@id': absoluteUrl(path) + '#webpage',
      name: page.title, description: page.description, url: absoluteUrl(path), dateModified: GUIDE_UPDATED_AT,
      about: { '@type': 'Organization', '@id': absoluteUrl('/#organization'), name: 'Bagspackgo' },
      publisher: { '@type': 'Organization', '@id': absoluteUrl('/#organization'), name: 'Bagspackgo' },
    }} />

    <section className="bg-[#17372f] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-14 pt-7 sm:px-8 lg:pb-20">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-6 text-white/70 sm:text-sm">
          <Link href="/user/trip" className="underline underline-offset-4 hover:text-white">Home</Link><span aria-hidden="true">/</span>
          <Link href="/travel-guides" className="underline underline-offset-4 hover:text-white">Explore Bagspackgo</Link><span aria-hidden="true">/</span>
          <span aria-current="page" className="text-white">{page.shortTitle}</span>
        </nav>
        <div className="mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#e4cba3]">{page.category}</p>
            <h1 className="mt-5 max-w-2xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">{page.heading}</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">{page.intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-5">
              <Link href={page.primary[1]} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#e4cba3] px-6 py-3.5 text-sm font-bold text-[#17372f] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                {page.primary[0]}<ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href={page.secondary[1]} className="py-2 text-sm font-semibold underline decoration-white/40 underline-offset-4 hover:decoration-white">{page.secondary[0]}</Link>
            </div>
            <p className="mt-8 text-sm text-white/65">Kashmir-based. Built around your journey. <Link href="/about" className="underline underline-offset-4 hover:text-white">Meet Bagspackgo.</Link></p>
          </div>
          <div className="overflow-hidden rounded-3xl bg-white text-[#17372f]">
            <div className="relative h-48 sm:h-64 lg:h-56">
              <Image src="/images/hero-kashmir-v3.webp" alt="Mountain scenery in Kashmir" fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17372f]/40 to-transparent" />
              <span className="absolute bottom-5 left-6 text-xs font-semibold uppercase tracking-[.18em] text-white">Experience Kashmir with Bagspackgo</span>
            </div>
            <div className="p-6 sm:p-8">
              <h2 className="font-serif text-3xl leading-tight">{page.panel.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{page.panel.text}</p>
              <ul className="mt-5 space-y-3">{page.panel.points.map(point => <li key={point} className="flex gap-3 text-sm leading-6"><Check size={18} className="mt-1 shrink-0 text-[#8c6939]" aria-hidden="true" /><span>{point}</span></li>)}</ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section aria-label="Why choose Bagspackgo" className="border-b border-[#17372f]/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-3 lg:gap-12">
        {page.benefits.map((benefit, index) => <div key={benefit.title}>
          <p aria-hidden="true" className="text-xs font-bold tracking-widest text-[#8c6939]">0{index + 1}</p>
          <h2 className="mt-3 font-serif text-2xl">{benefit.title}</h2>
          <p className="mt-3 leading-7 text-slate-600">{benefit.text}</p>
        </div>)}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-[#8c6939]">Find your next step</p>
      <h2 className="mt-4 max-w-3xl font-serif text-3xl leading-tight sm:text-4xl">{page.offerTitle}</h2>
      <p className="mb-8 mt-4 max-w-2xl leading-7 text-slate-600">{page.offerIntro}</p>
      <ServiceCards services={page.services} />
    </section>

    <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:pb-20">
      <div className="grid gap-6 border-t border-[#17372f]/15 pt-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#8c6939]">Before you get started</p><h2 className="mt-4 font-serif text-3xl">A few things about<br className="hidden lg:block" /> your Bagspackgo trip.</h2></div>
        <div className="divide-y divide-[#17372f]/15">{page.faqs.map(([question, answer]) => <details key={question} className="py-5 first:pt-0"><summary className="cursor-pointer pr-3 font-semibold leading-7">{question}</summary><p className="mt-4 leading-7 text-slate-600">{answer}</p></details>)}</div>
      </div>
    </section>

    <section className="bg-[#17372f] px-5 py-14 text-white sm:px-8 lg:py-16">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div><h2 className="max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">{page.closingTitle}</h2><p className="mt-4 max-w-2xl leading-7 text-white/75">{page.closingText}</p></div>
        <Link href={page.primary[1]} className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[#e4cba3] px-6 py-4 text-sm font-bold text-[#17372f] transition hover:bg-white">{page.primary[0]}<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
  </div>;
}

