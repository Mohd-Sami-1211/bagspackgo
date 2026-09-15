import { Suspense } from 'react';
import TrekMainContent from '@/components/home/TrekSection/TrekMainContent';
import TravelSection from '@/components/seo/TravelSection';
import CatalogLinks from '@/components/seo/CatalogLinks';
import { pageMetadata } from '@/lib/seo';
export const revalidate = 300;
export const metadata = pageMetadata({ title: 'Kashmir Trekking Packages & Local Organizers', description: 'Discover Kashmir trek packages from local organizers. Compare routes, duration, difficulty, inclusions and trip details on Bagspackgo.', path: '/user/trek' });
export default function TrekPage() {
  return <><Suspense fallback={null}><TrekMainContent /></Suspense>
    <TravelSection title="Explore available trek packages" description="Choose a route that fits your experience, time and group. Ask the organizer about the itinerary and participation requirements." links={[{ name: 'How to choose a Kashmir trek', path: '/travel-guides/kashmir-trekking-and-events' }, { name: 'Find dated events', path: '/user/events' }]}><CatalogLinks category="trek" /></TravelSection>
  </>;
}
