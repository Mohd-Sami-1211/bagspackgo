import { Suspense } from 'react';
import EventMainContent from '@/components/home/EventSection/EventMainContent';
import { pageMetadata } from '@/lib/seo';
export const revalidate = 300;
export const metadata = pageMetadata({ title: 'Kashmir Trekking Events & Adventure Activities', description: 'Discover trekking events and adventure activities from local organizers on Bagspackgo. Check event dates, locations, availability and participation details.', path: '/user/events' });
export default function EventsPage() {
  return <Suspense fallback={null}><EventMainContent /></Suspense>;
}
