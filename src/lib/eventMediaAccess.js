import { isPublicProvider } from './seo.js';

export const EVENT_MEDIA_STATUSES = ['published', 'completed', 'cancelled'];

// Unlisted events still work by direct link; their media must not become an
// independently indexed or shared-cache copy of a private listing.
export function eventMediaHeaders(event, account, details) {
  if (!event || !EVENT_MEDIA_STATUSES.includes(event.status)
    || !isPublicProvider(account, details) || details.pausedServices?.event === true) return null;

  return {
    'X-Content-Type-Options': 'nosniff',
    ...(event.visibility === 'public' ? {
      'Cache-Control': 'public, max-age=60, s-maxage=300, must-revalidate',
    } : {
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
    }),
  };
}
