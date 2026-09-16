import test from 'node:test';
import assert from 'node:assert/strict';
import { providerIdentityLinks, providerSchema, providerSearchDescription } from '../src/lib/providerSeo.js';

test('company identity uses supplied public URLs and removes tracking duplicates', () => {
  assert.deepEqual(providerIdentityLinks({
    website: 'www.example.com',
    instagram: 'https://www.instagram.com/example/?utm_source=profile&igshid=123#bio',
    facebook: 'https://www.facebook.com/example',
    twitter: 'https://x.com/example',
  }), ['https://www.example.com/', 'https://www.instagram.com/example/', 'https://www.facebook.com/example', 'https://x.com/example']);
  assert.deepEqual(providerIdentityLinks({ website: 'https://x.com/example', twitter: 'https://x.com/example' }), ['https://x.com/example']);
});

test('identity does not invent handles or expose credentials and unsafe URLs', () => {
  for (const website of ['javascript:alert(1)', 'data:text/html,test', 'https://user:secret@example.com', 'https://localhost', 'https://127.0.0.1', 'not a website']) {
    assert.deepEqual(providerIdentityLinks({ website }), []);
  }
  assert.deepEqual(providerIdentityLinks({ instagram: '@example', facebook: 'https://unrelated.com/example', youtube: 'https://youtube.com/' }), []);
});

test('provider profile connects to the same entity used by trip/event pages', () => {
  const provider = { _id: '123', slug: 'original_company', name: 'Renamed Company', location: 'Kashmir', logo: '/images/logo.png', identityLinks: ['https://example.com/'], rating: 0, reviews: 0 };
  const [page, company] = providerSchema(provider)['@graph'];
  assert.equal(page.mainEntity['@id'], 'https://www.bagspackgo.com/original_company#provider');
  assert.equal(company['@id'], page.mainEntity['@id']);
  assert.equal(company.name, 'Renamed Company');
  assert.equal(company.aggregateRating, undefined);
  assert.equal(company.alternateName, undefined);
  assert.deepEqual(company.sameAs, ['https://example.com/']);
  assert.match(providerSearchDescription(provider), /Renamed Company in Kashmir/);
});

test('provider identity honors reserved profile paths without inventing reviews', () => {
  const company = providerSchema({ _id: '123', slug: 'about', name: 'About', logo: '/images/logo.png', rating: 6, reviews: 3 })['@graph'][1];
  assert.equal(company.url, 'https://www.bagspackgo.com/user/provider/123');
  assert.equal(company.aggregateRating, undefined);
  assert.equal(company.sameAs, undefined);
});
