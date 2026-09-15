import Link from 'next/link';
import { notFound } from 'next/navigation';
import { travelGuides, competitors, GUIDE_UPDATED_AT } from '@/data/travelGuides';
import { pageMetadata, breadcrumbs, absoluteUrl } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import TripBudgetCalculator from '@/components/seo/TripBudgetCalculator';
export function generateStaticParams() { return travelGuides.map(({ slug }) => ({ slug })); }
export const dynamicParams = false;
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = travelGuides.find(g => g.slug === slug);
  return guide ? pageMetadata({ title: guide.title, description: guide.description, path: '/travel-guides/' + slug, type: 'article' }) : { robots: { index: false } };
}
export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = travelGuides.find(g => g.slug === slug);
  if (!guide) notFound();
  const path = '/travel-guides/' + slug;
  return <article className="mx-auto max-w-5xl px-5 py-14 text-[#17372f] sm:px-8">
    <JsonLd data={breadcrumbs([{ name: 'Travel guides', path: '/travel-guides' }, { name: guide.shortTitle, path }])} />
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: guide.title, description: guide.description, mainEntityOfPage: absoluteUrl(path),
      author: { '@type': 'Organization', name: 'Bagspackgo', url: absoluteUrl('/about') }, publisher: { '@type': 'Organization', '@id': absoluteUrl('/#organization'), name: 'Bagspackgo', logo: { '@type': 'ImageObject', url: absoluteUrl('/images/logo.png') } },
      dateModified: GUIDE_UPDATED_AT, image: absoluteUrl('/images/hero-kashmir-v3.webp') }} />
    <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap gap-2 text-sm text-slate-600"><Link href="/user/trip" className="underline">Home</Link><span>/</span><Link href="/travel-guides" className="underline">Travel guides</Link><span>/ {guide.shortTitle}</span></nav>
    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9b7440]">{guide.category}</p>
    <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">{guide.title}</h1>
    <p className="mt-5 text-sm text-slate-500">By <Link href="/about" className="underline underline-offset-4">Bagspackgo</Link> · Updated <time dateTime={GUIDE_UPDATED_AT}>15 September 2026</time></p>
    <p className="mt-8 text-xl leading-9 text-slate-600">{guide.intro}</p>
    <nav aria-label="On this page" className="my-10 rounded-2xl bg-[#f8f6f0] p-6"><p className="font-semibold">In this guide</p><ol className="mt-4 list-inside list-decimal space-y-2 text-sm">{guide.sections.map((section,i) => <li key={section.title}><a href={'#section-' + i} className="underline underline-offset-4">{section.title}</a></li>)}</ol></nav>
    {guide.comparison && <div className="my-10 overflow-x-auto rounded-2xl border border-[#17372f]/15">
      <table className="w-full min-w-[620px] text-left text-sm"><caption className="bg-[#17372f] p-5 text-left font-semibold text-white">Kashmir travel options: what to compare</caption><thead className="bg-[#f8f6f0]"><tr><th scope="col" className="p-4">Platform</th><th scope="col" className="p-4">What its public pages show</th><th scope="col" className="p-4">Your comparison focus</th></tr></thead><tbody>
        <tr className="border-t border-[#17372f]/15"><th scope="row" className="p-4"><Link href="/about" className="underline">Bagspackgo</Link></th><td className="p-4 leading-6">Local packages, offbeat trip requests, events and Companion call assistance.</td><td className="p-4 leading-6">Choose between a package, a personalized request, a dated activity and independent travel support.</td></tr>
        {competitors.map(c => <tr key={c.name} className="border-t border-[#17372f]/15"><th scope="row" className="p-4"><a href={c.url} className="underline underline-offset-4">{c.name}</a></th><td className="p-4 leading-6">{c.offering}</td><td className="p-4 leading-6">{c.compare}</td></tr>)}
      </tbody></table></div>}
    {guide.sections.map((section,i) => <section id={'section-' + i} key={section.title} className="my-10 scroll-mt-24">
      <h2 className="font-serif text-3xl leading-tight">{section.title}</h2>
      {section.text && <p className="mt-5 text-base leading-8 text-slate-600">{section.text}{section.source && <> <a href={section.source.url} className="underline underline-offset-4">{section.source.label}</a>.</>}</p>}
      {section.bullets && <ul className="mt-5 list-disc space-y-3 pl-6 leading-8 text-slate-600">{section.bullets.map(item => <li key={item}>{item}</li>)}</ul>}
      {guide.calculator && i === 1 && <TripBudgetCalculator />}
    </section>)}
    <section className="mt-14"><h2 className="font-serif text-3xl">Questions travelers ask</h2><div className="mt-6 divide-y divide-[#17372f]/15">{guide.faqs.map(([q,a]) => <details key={q} className="py-5"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-4 leading-8 text-slate-600">{a}</p></details>)}</div></section>
    <aside className="mt-12 rounded-3xl bg-[#17372f] p-7 text-white"><h2 className="font-serif text-3xl">Put your plan into motion.</h2><div className="mt-6 flex flex-wrap gap-3">{guide.links.map(([name,href]) => <Link key={href} href={href} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#17372f]">{name} →</Link>)}</div></aside>
  </article>;
}

