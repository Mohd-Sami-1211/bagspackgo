import JsonLd from './JsonLd';
import { absoluteUrl, SITE_NAME, SITE_DESCRIPTION } from '@/lib/seo';
export default function HomeJsonLd() {
  return <JsonLd data={{
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': absoluteUrl('/#organization'), name: SITE_NAME,
        url: absoluteUrl('/'), logo: absoluteUrl('/images/logo.png'), description: SITE_DESCRIPTION,
        address: { '@type': 'PostalAddress', addressRegion: 'Jammu and Kashmir', addressCountry: 'IN' },
        areaServed: { '@type': 'Place', name: 'Kashmir' } },
      { '@type': 'WebSite', '@id': absoluteUrl('/#website'), name: SITE_NAME,
        alternateName: 'bagspackgo.com', url: absoluteUrl('/'), description: SITE_DESCRIPTION,
        publisher: { '@id': absoluteUrl('/#organization') }, inLanguage: 'en-IN' },
    ],
  }} />;
}
