import test from 'node:test';
import assert from 'node:assert/strict';
import { jsonLd, pageMetadata, eventSchema, eventDate, eventEndDate, eventHasEnded, isPublicProvider, packagePath } from '../src/lib/seo.js';
import { providerProfilePath, toProviderSlug } from '../src/lib/providerSlug.js';

test('metadata uses the production host and the page canonical, including social cards', () => {
  const m=pageMetadata({title:'A real destination',description:'A useful description',path:'/user/offbeats/123'});
  assert.equal(m.alternates.canonical,'https://www.bagspackgo.com/user/offbeats/123');
  assert.equal(m.openGraph.url,m.alternates.canonical);
  assert.ok(m.twitter.images[0].startsWith('https://www.bagspackgo.com/'));
  assert.equal(pageMetadata({title:'Private',description:'Details',path:'/event',noindex:true}).robots.index,false);
});
test('provider-supplied text cannot close a JSON-LD script', () => {
  const value={name:'</script><script>alert("test")</script>',line:'hello\u2028world'};
  const encoded=jsonLd(value);
  assert.ok(!encoded.includes('<'));
  assert.deepEqual(JSON.parse(encoded),value);
});
const event={id:'123',name:'Test adventure',location:'Srinagar',date:'2026-10-31',durationDays:2,price:500,slotsLeft:4,visibility:'public',status:'published',image:'/images/EventCover.webp',guideName:'Test operator',about:'Test description'};
test('date-only events preserve the calendar day and cross month boundaries',()=>{
  assert.equal(eventDate('2026-10-31'),'2026-10-31');
  assert.equal(eventEndDate('2026-10-31',2),'2026-11-01');
  assert.equal(eventDate('2026-10-30T18:30:00.000Z'),'2026-10-31');
  assert.equal(eventDate('invalid'),undefined);
});
test('live events use accurate availability and free events keep a zero price',()=>{
  const now=new Date('2026-09-01');
  const schema=eventSchema(event,now);
  assert.equal(schema.startDate,'2026-10-31');
  assert.equal(schema.endDate,'2026-11-01');
  assert.equal(schema.offers.price,500);
  assert.equal(schema.offers.availability,'https://schema.org/InStock');
  assert.equal(eventSchema({...event,slotsLeft:0},now).offers.availability,'https://schema.org/SoldOut');
  assert.equal(eventSchema({...event,price:0},now).offers.price,0);
});
test('private, cancelled and finished events do not advertise current ticket offers',()=>{
  assert.equal(eventSchema({...event,visibility:'private'}),null);
  const cancelled=eventSchema({...event,status:'cancelled'},new Date('2026-09-01'));
  assert.equal(cancelled.eventStatus,'https://schema.org/EventCancelled');
  assert.equal(cancelled.offers,undefined);
  assert.equal(eventSchema(event,new Date('2026-11-03')).offers,undefined);
  assert.equal(eventSchema({...event,status:'completed'},new Date('2026-09-01')).offers,undefined);
  assert.equal(eventHasEnded(event,new Date('2026-11-01T18:29:00Z')),false);
  assert.equal(eventHasEnded(event,new Date('2026-11-01T18:30:00Z')),true);
});
test('provider visibility matches approval and account activation',()=>{
  assert.equal(isPublicProvider({isActive:false,applicationStatus:'approved'},{status:'approved'}),false);
  assert.equal(isPublicProvider({applicationStatus:'pending'},{status:'pending'}),false);
  assert.equal(isPublicProvider({applicationStatus:'approved'},{status:'pending'}),true);
  assert.equal(isPublicProvider({applicationStatus:'none'},{status:'approved'}),true);
  assert.equal(isPublicProvider(null,{status:'approved'}),false);
});
test('provider slugs cannot collide with the guide or directory routes',()=>{
  assert.equal(toProviderSlug('Mountain & Valley Tours'),'mountain_and_valley_tours');
  assert.equal(providerProfilePath('Travel Guides','123'),'/user/provider/123');
  assert.equal(providerProfilePath('About','123'),'/user/provider/123');
  assert.equal(providerProfilePath('Local Adventures','123'),'/local_adventures');
});
test('package URLs use the canonical trip path without search parameters',()=>{
  assert.equal(packagePath({_id:'123',category:'trip'}),'/trip/123');
});
test('an event that has started cannot advertise registration even before its end date',()=>{
  assert.equal(eventSchema(event,new Date('2026-10-31T12:00:00Z')).offers,undefined);
});
