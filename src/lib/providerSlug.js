const RESERVED_ROOT_PATHS = new Set([
  'admin',
  'api',
  'privacy',
  'provider-privacy',
  'provider-terms',
  'serviceprovider',
  'signin',
  'signup',
  'terms',
  'trip',
  'user',
]);

export function toProviderSlug(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .slice(0, 72);
}

export function isReservedProviderSlug(value = '') {
  return RESERVED_ROOT_PATHS.has(toProviderSlug(value).replace(/_/g, '-'));
}

export function providerProfilePath(companyName, providerId = '') {
  const slug = toProviderSlug(companyName);
  return slug && !isReservedProviderSlug(slug)
    ? `/${slug}`
    : `/user/provider/${providerId}`;
}

