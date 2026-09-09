import { notFound } from 'next/navigation';
import EventDetails from '@/components/home/EventSection/EventDetails';
import { getPublicEventDetails } from '@/lib/publicEvent';

export const revalidate = 30;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const event = await getPublicEventDetails(id);
  if (!event) return { title: 'Event not found' };

  const description = (event.about || `View ${event.name} on bagspackgo`).slice(0, 160);
  const image = /^https:\/\//i.test(event.image || '') ? event.image : undefined;

  return {
    title: event.name,
    description,
    openGraph: {
      title: event.name,
      description,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function EventDetailsPage({ params }) {
  const { id } = await params;
  const event = await getPublicEventDetails(id);
  if (!event) notFound();

  // Data is fetched during server rendering and reused by metadata/API cache,
  // removing the client hydration -> API request waterfall on shared links.
  return <EventDetails event={event} loading={false} />;
}
