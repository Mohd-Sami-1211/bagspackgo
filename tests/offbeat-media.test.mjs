import test from 'node:test';
import assert from 'node:assert/strict';
import { offbeatCoverUrl, offbeatCoverRedirect, parseImageDataUrl } from '../src/lib/offbeatMedia.js';

const id = '6a55efdad48a387532d62ad9';
const image = 'data:image/png;base64,iVBORw0KGgo=';

test('embedded offbeat covers use stable image URLs that change when the record is updated', () => {
  const first = { _id: id, coverPhoto: image, updatedAt: '2026-09-16T00:00:00Z' };
  assert.equal(offbeatCoverUrl(first), `/api/public/offbeats/${id}/cover?v=1789516800000`);
  assert.equal(offbeatCoverUrl({ ...first, updatedAt: new Date(first.updatedAt) }), offbeatCoverUrl(first));
  assert.notEqual(offbeatCoverUrl({ ...first, updatedAt: '2026-09-17T00:00:00Z' }), offbeatCoverUrl(first));
  assert.equal(offbeatCoverUrl({ _id: id, coverPhoto: image }), `/api/public/offbeats/${id}/cover`);
});

test('ordinary cover URLs and absent images remain unchanged', () => {
  for (const coverPhoto of ['https://images.example.com/cover.webp', '/images/cover.webp', null, undefined]) {
    assert.equal(offbeatCoverUrl({ _id: id, coverPhoto }), coverPhoto);
  }
});

test('image decoding preserves the stored bytes and rejects non-image content', () => {
  const parsed = parseImageDataUrl(image);
  assert.equal(parsed.contentType, 'image/png');
  assert.deepEqual(Buffer.from(parsed.base64, 'base64'), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(parseImageDataUrl('data:text/html;base64,PHNjcmlwdD4='), null);
  assert.equal(parseImageDataUrl('data:image/png;base64,a'), null);
  assert.equal(parseImageDataUrl('javascript:alert(1)'), null);
});

test('remote image handling uses safe redirects and never requires server fetching', () => {
  const origin = 'https://www.bagspackgo.com';
  assert.equal(offbeatCoverRedirect('/images/cover.webp', origin), origin + '/images/cover.webp');
  assert.equal(offbeatCoverRedirect('https://images.example.com/cover.webp', origin), 'https://images.example.com/cover.webp');
  assert.equal(offbeatCoverRedirect('//images.example.com/cover.webp', origin), null);
  assert.equal(offbeatCoverRedirect('javascript:alert(1)', origin), null);
  assert.equal(offbeatCoverRedirect('file:///private/image.png', origin), null);
});
