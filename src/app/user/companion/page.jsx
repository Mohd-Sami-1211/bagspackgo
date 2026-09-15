import CompanionLandingPage from '@/components/home/CompanionSection/CompanionLandingPage';
import JsonLd from '@/components/seo/JsonLd';
import { pageMetadata, absoluteUrl } from '@/lib/seo';
export const metadata = pageMetadata({ title: 'Companion: 24×7 Call Assistance for Independent Travel', description: 'Plan Kashmir independently with Bagspackgo Companion. Get 24×7 call assistance during your journey for itinerary questions, local advice and help with changing plans.', path: '/user/companion' });
export default function CompanionPage() {
  return <>
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Service', name: 'Bagspackgo Companion', serviceType: 'On-trip call assistance', url: absoluteUrl('/user/companion'), description: '24×7 call assistance during the journey for travelers who prefer to plan and travel independently.', provider: { '@type': 'Organization', '@id': absoluteUrl('/#organization'), name: 'Bagspackgo' }, areaServed: { '@type': 'Place', name: 'Kashmir' } }} />
    <CompanionLandingPage />
  </>;
}
