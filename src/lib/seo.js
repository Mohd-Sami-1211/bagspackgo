// Shared URL, metadata, and structured-data rules.
export const SITE_URL = 'https://www.bagspackgo.com';
export const SITE_NAME = 'Bagspackgo';
export const SITE_DESCRIPTION = 'Bagspackgo is a Kashmir-based travel platform for comparing local tour packages, discovering offbeat destinations, joining events and getting 24×7 Companion call assistance.';
export const DEFAULT_IMAGE = '/images/hero-kashmir-v3.webp';

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL + '/').toString();
}
export function plainText(value = '', limit = 160) {
  const text = String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > limit ? text.slice(0, limit - 1).trimEnd() + '…' : text;
}
export function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
export function pageMetadata({ title, description, path, image = DEFAULT_IMAGE, noindex = false, type = 'website' }) {
  const url = absoluteUrl(path);
  const summary = plainText(description);
  return {
    title, description: summary, alternates: { canonical: url },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type, title: title + ' | ' + SITE_NAME, description: summary, url, siteName: SITE_NAME, locale: 'en_IN', images: [{ url: absoluteUrl(image), alt: title }] },
    twitter: { card: 'summary_large_image', title: title + ' | ' + SITE_NAME, description: summary, images: [absoluteUrl(image)] },
  };
}
export function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/user/trip' }, ...items.filter(item => item.path !== '/user/trip')].map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path),
    })),
  };
}
export function packagePath(pkg) {
  return pkg.category === 'trek' ? '/user/trek/guidelist/trekdetails/' + pkg._id : '/trip/' + pkg._id;
}
export function isPublicProvider(account, details) {
  return Boolean(account && details && account.isActive !== false &&
    (account.applicationStatus === 'approved' || details.status === 'approved'));
}
// The organizer enters a date, not a start time. Do not invent midnight.
export function eventDate(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
export function eventEndDate(value, duration = 1) {
  const start = eventDate(value);
  if (!start) return undefined;
  const end = new Date(start + 'T00:00:00Z');
  end.setUTCDate(end.getUTCDate() + Math.max(1, Number(duration) || 1) - 1);
  return end.toISOString().slice(0, 10);
}
export function eventHasEnded(event, now = new Date()) {
  const end = eventEndDate(event.date, event.durationDays || parseInt(event.duration, 10) || 1);
  return event.status === 'completed' || Boolean(end && new Date(end + 'T23:59:59+05:30') < now);
}
export function eventRegistrationClosed(event, now = new Date()) {
  return event.status !== 'published' || !event.date || new Date(event.date) < now;
}
export function eventSchema(event, now = new Date()) {
  if (event.visibility !== 'public') return null;
  const url = absoluteUrl('/user/events/eventdetails/' + event.id);
  const ended = eventHasEnded(event, now);
  const cancelled = event.status === 'cancelled';
  return {
    '@context': 'https://schema.org', '@type': 'Event', '@id': url + '#event',
    name: event.name, description: plainText(event.about, 5000), url,
    image: [absoluteUrl(event.image)],
    startDate: eventDate(event.date), endDate: eventEndDate(event.date, event.durationDays),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: cancelled ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: event.location, address: event.location },
    organizer: { '@type': 'Organization', name: event.guideName, ...(event.guidePath ? { url: absoluteUrl(event.guidePath) } : {}) },
    ...(!ended && !cancelled && !eventRegistrationClosed(event, now) && Number.isFinite(event.price) && event.price >= 0 ? {
      offers: { '@type': 'Offer', url, price: event.price, priceCurrency: 'INR',
        availability: event.slotsLeft > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut' },
    } : {}),
  };
}

