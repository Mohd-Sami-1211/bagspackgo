import test from 'node:test';
import assert from 'node:assert/strict';
import { eventSearchMetadata, offbeatSearchMetadata, offbeatStructuredData, tripSearchMetadata, tripStructuredData } from '../src/lib/detailSeo.js';
import { pageMetadata } from '../src/lib/seo.js';

const pkg = {
  name: 'Valley Escape', days: 4, destination: 'Kashmir', packageCategory: 'budget', packageType: 'couple',
  provider: { _id: 'provider1', companyname: 'Valley Tours', profileSlug: 'valley_tours' },
  aboutPackage: 'Visit Srinagar and Gulmarg with local guides.',
  activities: [{ name: 'Shikara ride' }],
  itinerary: [{ day: 1, location: 'Srinagar', agenda: 'Explore Dal Lake.' }, { day: 2, travelTo: 'Gulmarg', agenda: 'Visit Gulmarg.' }],
};
const tripOptions = { path: '/trip/package1', image: '/images/trip.webp' };

test('trip metadata exposes its actual destination, category and activity without inventing seasonal availability', () => {
  const metadata = pageMetadata({ ...tripSearchMetadata(pkg), ...tripOptions });
  assert.match(metadata.title, /4-Day Budget Kashmir Trip/);
  assert.match(metadata.description, /Shikara ride/);
  assert.match(metadata.description, /Valley Tours/);
  assert.doesNotMatch(metadata.description, /skiing|winter|climbing|summer/i);
  assert.ok(metadata.description.length <= 160);
  assert.doesNotMatch(tripSearchMetadata({ ...pkg, days: 0, packageCategory: 'unknown' }).title, /0-Day|Budget|Premium|unknown/);
});

test('trip markup identifies its provider and ordered real itinerary stops, never fabricating an offer', () => {
  const schema = tripStructuredData(pkg, tripOptions);
  assert.equal(schema.provider['@id'], 'https://www.bagspackgo.com/valley_tours#provider');
  assert.deepEqual(schema.itinerary.itemListElement.map(stop => [stop.position, stop.item.name]), [[1, 'Srinagar'], [2, 'Gulmarg']]);
  assert.equal(schema.itinerary.itemListElement[0].item.description, 'Explore Dal Lake.');
  assert.equal(schema.offers, undefined);
  assert.deepEqual(tripStructuredData({ ...pkg, itinerary: [] }, tripOptions).itinerary, { '@type': 'Place', name: 'Kashmir' });
});

test('offbeat attraction identity is distinct from its locality and region', () => {
  const destination = { title: '7 Waterfalls of Bani', destination: 'Bani', region: 'Jammu', shortDescription: 'A waterfall trek near Bani.', description: 'Follow the waterfall trail with a local guide.' };
  const schema = offbeatStructuredData(destination, { path: '/user/offbeats/place1', image: '/images/bani.webp' });
  assert.equal(schema.name, '7 Waterfalls of Bani');
  assert.equal(schema.containedInPlace.name, 'Bani');
  assert.equal(schema.containedInPlace.containedInPlace.name, 'Jammu');
  assert.equal(schema.alternateName, undefined);
  assert.match(offbeatSearchMetadata(destination).description, /waterfall trek/);
  assert.doesNotMatch(JSON.stringify(schema), /Kashmir|waterafallls|skiing/);
  assert.equal(offbeatStructuredData({ ...destination, destination: 'Jammu' }, { path: '/user/offbeats/place1', image: '/images/bani.webp' }).containedInPlace.containedInPlace, undefined);
});

test('event snippets carry the registered activity and local calendar date while preserving lifecycle labels', () => {
  const event = { name: 'Mountain Day', eventType: 'Climbing', location: 'Srinagar', date: '2026-10-30T18:30:00.000Z', durationDays: 1, guideName: 'Valley Tours', status: 'published', about: 'A guided climbing event.' };
  const current = eventSearchMetadata(event, new Date('2026-09-01'));
  assert.match(current.title, /Climbing in Srinagar/);
  assert.match(current.title, /31 Oct 2026/);
  assert.doesNotMatch(current.title, /Past|Cancelled|closed/);
  assert.match(eventSearchMetadata(event, new Date('2026-10-31T12:00:00Z')).description, /^Registration closed\./);
  assert.match(eventSearchMetadata(event, new Date('2026-11-01')).title, /Past event/);
  assert.match(eventSearchMetadata({ ...event, status: 'cancelled' }, new Date('2026-09-01')).title, /Cancelled event/);
  assert.doesNotMatch(eventSearchMetadata({ ...event, date: 'invalid' }, new Date('2026-09-01')).title, /Invalid Date|2026/);
});
