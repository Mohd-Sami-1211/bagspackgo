import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

// Exercise the shared listing query without connecting to a real database.
const fixture = { accounts: [], details: [], events: [], query: null };
globalThis.__publicEventListModels = {
  Guide: {
    find() { return { select() { return this; }, async lean() { return fixture.accounts; } }; },
  },
  GuideDetails: {
    find(query) {
      return {
        select() { return this; },
        async lean() {
          return fixture.details.filter((details) =>
            query['pausedServices.event']?.$ne !== true || details.pausedServices?.event !== true
          );
        },
      };
    },
  },
  Event: {
    find(query) {
      fixture.query = query;
      return {
        select() { return this; }, sort() { return this; },
        skip() { return this; }, limit() { return this; }, async lean() { return fixture.events; },
      };
    },
    async countDocuments() { return 0; },
  },
};

const stubs = {
  '@/lib/db': 'export default async function dbConnect() {}',
  '@/models/event.model': 'export const Event = globalThis.__publicEventListModels.Event;',
  '@/models/guide.model': 'export const Guide = globalThis.__publicEventListModels.Guide;',
  '@/models/guidedetails.model': 'export const GuideDetails = globalThis.__publicEventListModels.GuideDetails;',
};
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (stubs[specifier]) {
      return { url: `data:text/javascript,${encodeURIComponent(stubs[specifier])}`, shortCircuit: true };
    }
    if (specifier === '@/lib/seo') {
      return { url: new URL('../src/lib/seo.js', import.meta.url).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
const { getPublicEventList } = await import('../src/lib/publicEventList.js');
hooks.deregister();

test('event lists restrict every result and facet to active, approved, unpaused organizers', async () => {
  fixture.accounts = [
    { _id: 'approved', applicationStatus: 'approved' },
    { _id: 'details-approved', applicationStatus: 'pending' },
    { _id: 'paused', applicationStatus: 'approved' },
    { _id: 'inactive', applicationStatus: 'approved', isActive: false },
    { _id: 'pending', applicationStatus: 'pending' },
  ];
  fixture.details = [
    { guide: 'approved', companyname: 'Approved' },
    { guide: 'details-approved', status: 'approved', companyname: 'Details approved' },
    { guide: 'paused', status: 'approved', companyname: 'Paused', pausedServices: { event: true } },
    { guide: 'inactive', status: 'approved', companyname: 'Inactive' },
    { guide: 'pending', status: 'pending', companyname: 'Pending' },
    { guide: 'missing-account', status: 'approved', companyname: 'Missing' },
  ];

  const result = await getPublicEventList(new URLSearchParams({ includeFacets: 'true' }));
  assert.deepEqual(fixture.query.guide.$in, ['approved', 'details-approved']);
  assert.equal(fixture.query.status, 'published');
  assert.deepEqual(fixture.query.visibility, { $ne: 'private' });
  assert.deepEqual(result.organizers.map((organizer) => organizer.name), ['Approved', 'Details approved']);
  assert.ok(fixture.query.date.$gte instanceof Date);
});

test('no eligible organizers produces an empty allowlist, never a public unfiltered query', async () => {
  fixture.accounts = [];
  fixture.details = [];
  const result = await getPublicEventList(new URLSearchParams({ tab: 'past', search: 'Trek [7].' }));
  assert.deepEqual(fixture.query.guide, { $in: [] });
  assert.equal(fixture.query.status, 'published');
  assert.deepEqual(fixture.query.visibility, { $ne: 'private' });
  assert.ok(fixture.query.date.$lt instanceof Date);
  assert.equal(fixture.query.$or[0].title.$regex, 'Trek \\[7\\]\\.');
  assert.equal(result.total, 0);
  assert.equal(result.hasNextPage, false);
});

test('event feeds reference original images without embedding their bytes in page HTML', async () => {
  const id = '6a3e501739e87eaeae55b9bc';
  const embedded = 'data:image/png;base64,iVBORw0KGgo=';
  fixture.accounts = [{ _id: 'host', applicationStatus: 'approved' }];
  fixture.details = [{ guide: 'host', companyname: 'Local company', logo: embedded }];
  fixture.events = [{ _id: id, guide: 'host', title: 'Real trek', poster: embedded, totalSlots: 10 }];
  const first = await getPublicEventList(new URLSearchParams());
  assert.equal(first.events[0].image, `/api/events/${id}/poster`);
  assert.equal(first.events[0].guideLogo, `/api/events/${id}/guide-logo`);
  assert.equal(JSON.stringify(first).includes('data:image'), false);
  fixture.events[0].poster = 'https://images.example.com/trek.jpg';
  fixture.details[0].logo = '/images/logo.png';
  const second = await getPublicEventList(new URLSearchParams());
  assert.equal(second.events[0].image, 'https://images.example.com/trek.jpg');
  assert.equal(second.events[0].guideLogo, '/images/logo.png');
  fixture.events = [];
});
