import { absoluteUrl, plainText } from './seo.js';
import { providerProfilePath } from './providerSlug.js';

const SOCIAL_HOSTS = {
  instagram: ['instagram.com'],
  facebook: ['facebook.com', 'fb.com'],
  youtube: ['youtube.com', 'youtu.be'],
  twitter: ['twitter.com', 'x.com'],
};

// Only use public links actually supplied by the company. Do not guess handles,
// brand aliases, spelling corrections, or unrelated social accounts.
export function providerIdentityLinks(details = {}) {
  const links = [];
  for (const field of ['website', ...Object.keys(SOCIAL_HOSTS)]) {
    const value = String(details[field] || '').trim();
    if (!value || /\s/.test(value)) continue;
    try {
      const candidate = /^https?:\/\//i.test(value)
        ? value
        : /^(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/|$)/i.test(value) ? `https://${value}` : '';
      if (!candidate) continue;
      const url = new URL(candidate);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) continue;
      const host = url.hostname.toLowerCase().replace(/^www\./, '');
      if (!host.includes('.') || host === 'localhost' || /^\d+(?:\.\d+){3}$/.test(host)) continue;
      if (SOCIAL_HOSTS[field] && (!SOCIAL_HOSTS[field].includes(host) || url.pathname === '/')) continue;
      url.hash = '';
      for (const key of [...url.searchParams.keys()]) {
        if (/^utm_/i.test(key) || ['fbclid', 'igshid'].includes(key)) url.searchParams.delete(key);
      }
      links.push(url.href);
    } catch { /* Ignore incomplete or invalid public profile URLs. */ }
  }
  return [...new Set(links)];
}

export function providerSearchDescription(provider) {
  const name = plainText(provider.name, 100);
  const location = plainText(provider.location || '', 80);
  const intro = `Explore ${name}${location ? ` in ${location}` : ''} on Bagspackgo.`;
  return plainText(`${intro} ${provider.bio || 'View the company profile, trip packages and travel events.'}`);
}

export function providerSchema(provider) {
  const url = absoluteUrl(providerProfilePath(provider.slug || provider.name, provider._id));
  const identity = `${url}#provider`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage', '@id': `${url}#webpage`, url,
        name: `${provider.name} — Trips & Events`,
        description: providerSearchDescription(provider),
        isPartOf: { '@id': absoluteUrl('/#website') },
        mainEntity: { '@id': identity },
      },
      {
        '@type': 'TravelAgency', '@id': identity,
        name: provider.name, url,
        description: plainText(provider.bio || `Travel experiences hosted by ${provider.name}.`, 5000),
        image: absoluteUrl(provider.logo),
        mainEntityOfPage: { '@id': `${url}#webpage` },
        ...(provider.identityLinks?.length ? { sameAs: provider.identityLinks } : {}),
        ...(provider.location ? { areaServed: { '@type': 'Place', name: provider.location } } : {}),
        ...(provider.rating >= 1 && provider.rating <= 5 && provider.reviews > 0
          ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: provider.rating, reviewCount: provider.reviews, bestRating: 5, worstRating: 1 } }
          : {}),
      },
    ],
  };
}
