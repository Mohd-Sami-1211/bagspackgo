import OffbeatsLandingContent from '@/components/user/OffbeatsLandingContent';
import TravelSection from '@/components/seo/TravelSection';
import CatalogLinks from '@/components/seo/CatalogLinks';
import { pageMetadata } from '@/lib/seo';
export const revalidate = 300;
export const metadata = pageMetadata({ title: 'Offbeat Destinations in Kashmir, Jammu & Chenab Valley', description: 'Explore lesser-known destinations on Bagspackgo. Request a personalized offbeat trip or register interest in a future group departure.', path: '/user/offbeats' });
export default function OffbeatsPage() {
  return <><OffbeatsLandingContent /><TravelSection headingLevel={1} title="Offbeat destinations in Kashmir, Jammu & Chenab Valley" description="Find the destination’s story, highlights and trip options. Request a personalized journey or register interest in a future group trip." links={[{ name: 'How to plan an offbeat trip', path: '/travel-guides/offbeat-kashmir-travel' }]}><CatalogLinks category="offbeats" /></TravelSection></>;
}
