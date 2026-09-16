import OffbeatsLandingContent from '@/components/user/OffbeatsLandingContent';
import { pageMetadata } from '@/lib/seo';
import { getPublicOffbeatList } from '@/lib/publicOffbeatList';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata({ title: 'Offbeat Destinations in Kashmir, Jammu & Chenab Valley', description: 'Explore lesser-known destinations on Bagspackgo. Request a personalized offbeat trip or register interest in a future group departure.', path: '/user/offbeats' });
export default async function OffbeatsPage() {
  const [initialFeaturedData, initialLatestData] = await Promise.all([
    getPublicOffbeatList(new URLSearchParams({ featured: 'true', region: 'All', page: '1', limit: '24', sort: 'popular' })),
    getPublicOffbeatList(new URLSearchParams({ region: 'All', page: '1', limit: '24', sort: 'newest' })),
  ]);
  return <OffbeatsLandingContent initialFeaturedData={JSON.parse(JSON.stringify(initialFeaturedData))} initialLatestData={JSON.parse(JSON.stringify(initialLatestData))} />;
}
