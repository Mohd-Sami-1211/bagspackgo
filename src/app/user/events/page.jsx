import { Suspense } from 'react';
import EventMainContent from '@/components/home/EventSection/EventMainContent';
import { pageMetadata } from '@/lib/seo';
import { getPublicEventList } from '@/lib/publicEventList';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata({ title: 'Kashmir Trekking Events & Adventure Activities', description: 'Discover trekking events and adventure activities from local organizers on Bagspackgo. Check event dates, locations, availability and participation details.', path: '/user/events' });
export default async function EventsPage() {
  const [initialLiveData, initialRecentData] = await Promise.all([
    getPublicEventList(new URLSearchParams({ tab: 'upcoming', page: '1', limit: '6' })),
    getPublicEventList(new URLSearchParams({ tab: 'past', page: '1', limit: '6' })),
  ]);
  return <Suspense fallback={null}><EventMainContent initialLiveData={JSON.parse(JSON.stringify(initialLiveData))} initialRecentData={JSON.parse(JSON.stringify(initialRecentData))} /></Suspense>;
}
