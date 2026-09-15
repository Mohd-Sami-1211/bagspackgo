import Link from 'next/link';
import { notFound } from 'next/navigation';
import EventDetails from '@/components/home/EventSection/EventDetails';
import { getPublicEventDetails } from '@/lib/publicEvent';
import { pageMetadata, breadcrumbs, eventSchema, eventHasEnded, eventRegistrationClosed } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
export const revalidate = 30;
export async function generateMetadata({ params }) {
  const { id } = await params;
  const event = await getPublicEventDetails(id);
  if (!event) return { title: 'Event not found', robots: { index: false } };
  return pageMetadata({ title: event.name + ' — ' + event.location, description: event.about,
    path: '/user/events/eventdetails/' + id, image: event.image, noindex: event.visibility !== 'public' });
}
function EventArchive({ event }) {
  const label = event.status === 'cancelled' ? 'Cancelled event' : eventHasEnded(event) ? 'Past event' : 'Registration closed';
  return <article className="mx-auto max-w-5xl px-5 py-12 text-[#17372f] sm:px-8">
    <Link href="/user/events" className="text-sm font-semibold underline">Explore current events</Link>
    <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-[#9b7440]">{label}</p>
    <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">{event.name}</h1>
    <p className="mt-5 text-slate-600">{event.location} · {new Date(event.date).toLocaleDateString('en-IN', { dateStyle: 'long', timeZone: 'Asia/Kolkata' })} · {event.duration}</p>
    <p className="mt-4 text-sm">Organized by <Link href={event.guidePath || '/providers'} className="font-semibold underline">{event.guideName}</Link></p>
    <div className="mt-8 rounded-2xl bg-[#f8f6f0] p-6 leading-7">{label === 'Registration closed' ? 'This event has already started. Registration is closed.' : 'This listing is kept as a record of a ' + label.toLowerCase() + '. Booking is closed.'} <Link href="/user/events" className="font-semibold underline">Find another upcoming adventure.</Link></div>
    <img width={1200} height={800} src={event.image} alt={event.name + " event poster"} loading="lazy" className="mt-8 max-h-[520px] w-full rounded-3xl object-contain" />
    <h2 className="mt-10 font-serif text-3xl">About this event</h2><p className="mt-5 whitespace-pre-line leading-8 text-slate-600">{event.about}</p>
    {event.highlights.length > 0 && <section className="mt-10"><h2 className="font-serif text-3xl">Event highlights</h2><ul className="mt-5 list-disc space-y-3 pl-6 text-slate-600">{event.highlights.map((h,i) => <li key={i}>{h}</li>)}</ul></section>}
    {event.faqs.length > 0 && <section className="mt-10"><h2 className="font-serif text-3xl">Event questions</h2>{event.faqs.map((f,i) => <details key={i} className="border-b border-slate-200 py-5"><summary className="cursor-pointer font-semibold">{f.question}</summary><p className="mt-4 leading-7">{f.answer}</p></details>)}</section>}
  </article>;
}
export default async function EventDetailsPage({ params }) {
  const { id } = await params;
  const event = await getPublicEventDetails(id);
  if (!event) notFound();
  const archive = eventRegistrationClosed(event) || eventHasEnded(event);
  return <>
    {event.visibility === 'public' && <><JsonLd data={breadcrumbs([{ name: 'Events', path: '/user/events' }, { name: event.name, path: '/user/events/eventdetails/' + id }])} /><JsonLd data={eventSchema(event)} /></>}
    {archive ? <EventArchive event={event} /> : <EventDetails event={event} loading={false} />}
  </>;
}
