import Link from 'next/link';
import { Suspense } from 'react';
import TripMainContent from '@/components/home/TripSection/TripMainContent';
import HomeJsonLd from '@/components/seo/HomeJsonLd';
import TravelSection from '@/components/seo/TravelSection';
import CatalogLinks from '@/components/seo/CatalogLinks';
import { pageMetadata } from '@/lib/seo';
import { travelGuides } from '@/data/travelGuides';
export const revalidate = 300;
export const metadata = pageMetadata({ title: 'Kashmir Trips, Offbeats, Events & Companion', description: 'Bagspackgo is a Kashmir-based startup founded by Mohd Samiullah. Compare local tour packages, discover offbeat trips and events, and get 24×7 Companion assistance.', path: '/user/trip' });
export default function TripsHomePage() {
  return <>
    <HomeJsonLd />
    <Suspense fallback={null}><TripMainContent /></Suspense>
    <TravelSection title="Bagspackgo: built in Kashmir, for your journey." description="Founded by Mohd Samiullah, Bagspackgo brings local travel packages, hidden destinations, events and 24×7 Companion call assistance together in one place." links={[{ name: 'Our story', path: '/about' }, { name: 'Meet local providers', path: '/providers' }]} />
    <TravelSection title="Explore local tour packages" description="Open a listing for its itinerary, inclusions and pricing. Availability and the applicable price depend on your travel requirements.">
      <Suspense fallback={<Link href="/providers">Browse travel-company profiles</Link>}><CatalogLinks category="trip" /></Suspense>
    </TravelSection>
    <TravelSection title="Plan your Kashmir trip" description="Practical answers for choosing a package, working out a budget, finding a trek and exploring independently." links={travelGuides.map(g => ({ name: g.shortTitle, path: '/travel-guides/' + g.slug }))} />
  </>;
}
