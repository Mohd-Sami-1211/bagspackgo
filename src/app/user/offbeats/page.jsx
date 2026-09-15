import OffbeatsLandingContent from '@/components/user/OffbeatsLandingContent';
import { pageMetadata } from '@/lib/seo';
export const revalidate = 300;
export const metadata = pageMetadata({ title: 'Offbeat Destinations in Kashmir, Jammu & Chenab Valley', description: 'Explore lesser-known destinations on Bagspackgo. Request a personalized offbeat trip or register interest in a future group departure.', path: '/user/offbeats' });
export default function OffbeatsPage() {
  return <OffbeatsLandingContent />;
}
