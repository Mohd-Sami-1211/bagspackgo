import { absoluteUrl } from '@/lib/seo';
export default function robots() {
  return {
    rules: [{
      userAgent: '*',
      allow: [
        '/',
        // Google needs these public JSON resources when rendering the existing
        // listing filters. Exact path/query rules do not open private APIs.
        '/api/events$', '/api/events?',
        '/api/public/offbeats$', '/api/public/offbeats?',
        '/api/events/*/poster', '/api/events/*/guide-logo',
        '/api/public/provider/*/logo', '/api/public/provider/*/cover',
        '/api/public/packages/*/cover',
        '/api/public/offbeats/*/cover',
      ],
      disallow: ['/api/'],
    }],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
