import { absoluteUrl } from '@/lib/seo';
export default function robots() {
  return { rules: [{ userAgent: '*', allow: ['/', '/api/events/*/poster', '/api/events/*/guide-logo', '/api/public/provider/*/logo', '/api/public/provider/*/cover', '/api/public/packages/*/cover'], disallow: ['/api/'] }], sitemap: absoluteUrl('/sitemap.xml') };
}
