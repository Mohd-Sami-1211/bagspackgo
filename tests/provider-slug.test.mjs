import test from 'node:test';
import assert from 'node:assert/strict';
import { providerProfilePath, retainedProviderSlug } from '../src/lib/providerSlug.js';

test('renaming a company preserves its indexed profile URL', () => {
  const slug = retainedProviderSlug('mye_kashmir', 'Mye Kashmir', 'Mye Kashmir Travels');
  assert.equal(providerProfilePath(slug, 'provider-id'), '/mye_kashmir');
});

test('a legacy provider keeps the previously derived URL when its slug is first stored', () => {
  const slug = retainedProviderSlug('', 'Mountain & Valley Tours', 'Mountain Holidays');
  assert.equal(providerProfilePath(slug, 'provider-id'), '/mountain_and_valley_tours');
});

test('a new provider receives a normalized slug and reserved names retain the ID route', () => {
  assert.equal(retainedProviderSlug(undefined, undefined, 'New Local Tours'), 'new_local_tours');
  assert.equal(providerProfilePath(retainedProviderSlug('', 'About', 'About Holidays'), 'provider-id'), '/user/provider/provider-id');
});
