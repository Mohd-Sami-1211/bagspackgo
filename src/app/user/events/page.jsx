import { Suspense } from 'react';
import EventMainContent from '@/components/home/EventSection/EventMainContent';
import TravelSection from '@/components/seo/TravelSection';
import CatalogLinks from '@/components/seo/CatalogLinks';
import { pageMetadata } from '@/lib/seo';
export const revalidate = 300;
export const metadata = pageMetadata({ title: 'Kashmir Trekking Events & Adventure Activities', description: 'Discover trekking events and adventure activities from local organizers on Bagspackgo. Check event dates, locations, availability and participation details.', path: '/user/events' });
export default function EventsPage() {
  return <><Suspense fallback={null}><EventMainContent /></Suspense>
    <TravelSection headingLevel={1} title="Kashmir trekking events & adventure activities" description="Check each event’s date and status. Past events remain available as records of the experience." links={[{ name: 'Choose a trek or event', path: '/travel-guides/kashmir-trekking-and-events' }, { name: 'Meet local organizers', path: '/providers' }]}><CatalogLinks category="events" /></TravelSection>
  </>;
}
