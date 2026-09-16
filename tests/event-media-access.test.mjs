import test from 'node:test';
import assert from 'node:assert/strict';
import { eventMediaHeaders } from '../src/lib/eventMediaAccess.js';

const event = { status: 'published', visibility: 'public' };
const account = { applicationStatus: 'approved', isActive: true };
const details = { status: 'approved', pausedServices: { event: false } };

test('public event images remain indexable with bounded caches', () => {
  for (const status of ['published', 'completed', 'cancelled']) {
    const headers = eventMediaHeaders({ ...event, status }, account, details);
    assert.equal(headers['Cache-Control'], 'public, max-age=60, s-maxage=300, must-revalidate');
    assert.equal(headers['X-Robots-Tag'], undefined);
  }
});

test('private direct-link event images are served without indexing or shared caching', () => {
  const headers = eventMediaHeaders({ ...event, visibility: 'private' }, account, details);
  assert.equal(headers['Cache-Control'], 'private, no-store');
  assert.equal(headers['X-Robots-Tag'], 'noindex');
});

test('drafts and unavailable organizers do not expose event images', () => {
  assert.equal(eventMediaHeaders(null, account, details), null);
  assert.equal(eventMediaHeaders({ ...event, status: 'draft' }, account, details), null);
  assert.equal(eventMediaHeaders(event, null, details), null);
  assert.equal(eventMediaHeaders(event, account, null), null);
  assert.equal(eventMediaHeaders(event, { ...account, isActive: false }, details), null);
  assert.equal(eventMediaHeaders(event, { applicationStatus: 'pending' }, { status: 'pending' }), null);
  assert.equal(eventMediaHeaders(event, account, { ...details, pausedServices: { event: true } }), null);
});
