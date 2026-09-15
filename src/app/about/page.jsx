import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { pageMetadata, breadcrumbs } from '@/lib/seo';
export const metadata = pageMetadata({ title: 'About Bagspackgo & Founder Mohd Samiullah', description: 'Meet Bagspackgo, a Kashmir-based travel startup founded by Mohd Samiullah, bringing trips, offbeat destinations, events and Companion assistance together.', path: '/about' });
export default function AboutPage() {
  return <article className="mx-auto max-w-5xl px-5 py-16 text-[#17372f] sm:px-8">
    <JsonLd data={breadcrumbs([{ name: 'About Bagspackgo', path: '/about' }])} />
    <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9b7440]">Our story</p>
    <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-tight sm:text-6xl">From Kashmir.<br />For the way you travel.</h1>
    <p className="mt-8 max-w-3xl text-xl leading-9 text-slate-600">Bagspackgo is a Kashmir-based travel startup that brings travel packages, hidden destinations, events and on-trip assistance together in one place.</p>
    <section id="founder" className="mt-12 rounded-3xl bg-[#f8f6f0] p-8">
      <h2 className="font-serif text-3xl">Founded by Mohd Samiullah</h2>
      <p className="mt-5 max-w-3xl leading-8 text-slate-600">Mohd Samiullah is the founder of Bagspackgo. The platform is built around a simple idea: travelers should have more choice and flexibility, with local travel services easier to discover and compare.</p>
    </section>
    <section className="mt-12">
      <h2 className="font-serif text-3xl">Four ways to make the journey yours</h2>
      <dl className="mt-6 grid gap-8 sm:grid-cols-2">
        {[
          ['Trips', '/user/trip', 'Local travel companies list packages with detailed itineraries, pricing and inclusions, so you can compare options in one place.'],
          ['Offbeats', '/user/offbeats', 'Discover lesser-known places, request a personalized trip or register interest in a future group trip organized around demand.'],
          ['Events', '/user/events', 'Local organizers and travel companies share trekking trips and other travel activities you can discover and join.'],
          ['Companion', '/user/companion', 'Travel independently with 24×7 call assistance throughout your journey for planning questions, local advice and help when plans become confusing.'],
        ].map(([name, path, text]) => <div key={name}><dt className="text-xl font-bold"><Link href={path} className="underline underline-offset-4">{name}</Link></dt><dd className="mt-3 leading-7 text-slate-600">{text}</dd></div>)}
      </dl>
    </section>
    <section className="mt-12 border-t border-[#17372f]/15 pt-10"><h2 className="font-serif text-3xl">Start with the details that matter to you</h2><p className="mt-5 leading-8 text-slate-600">Check who operates an experience, what the quoted price covers, the itinerary and the cancellation terms on the relevant listing. For independently booked travel, explore Companion and discuss your journey before getting started.</p><Link href="/travel-guides" className="mt-6 inline-block font-bold underline underline-offset-4">Read our Kashmir planning guides →</Link></section>
  </article>;
}

