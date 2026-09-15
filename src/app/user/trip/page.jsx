import { Suspense } from 'react';
import TripMainContent from '@/components/home/TripSection/TripMainContent';
import HomeJsonLd from '@/components/seo/HomeJsonLd';
import { pageMetadata } from '@/lib/seo';
export const revalidate = 300;
export const metadata = pageMetadata({ title: 'Kashmir Trips, Offbeats, Events & Companion', description: 'Bagspackgo is a Kashmir-based startup. Compare local tour packages, discover offbeat trips and events, and get 24×7 Companion assistance.', path: '/user/trip' });
export default function TripsHomePage() {
  return <>
    <HomeJsonLd />
    <Suspense fallback={null}><TripMainContent /></Suspense>
  </>;
}
