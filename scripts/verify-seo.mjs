import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const base = process.argv[2] || 'http://localhost:3000';
const request = (path, options = {}) => fetch(new URL(path,base), { signal: AbortSignal.timeout(60000), ...options });
const results=[];
function record(path,check,passed,detail='') { results.push({path,check,passed,detail}); }
function attrs(tag) { return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]])); }
async function inspectPage(path) {
  try {
    const response=await request(path);
    const html=await response.text();
    const canonicalTags=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>attrs(m[0])).filter(a=>a.rel==='canonical');
    record(path,'HTTP 200',response.status===200,String(response.status));
    record(path,'one self canonical',canonicalTags.length===1 && canonicalTags[0].href==='https://www.bagspackgo.com'+path,canonicalTags.map(a=>a.href).join(','));
    record(path,'server-rendered heading',/<h1\b[^>]*>[\s\S]*?<\/h1>/.test(html));
    const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
    record(path,'page title present',/<title>.+?<\/title>/.test(html));
    const schemas=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    for(const match of schemas) JSON.parse(match[1]);
    record(path,'JSON-LD parses',true,schemas.length+' blocks');
    record(path,'indexable public page',!/<meta name="robots" content="[^"]*noindex/.test(html) && !response.headers.get('x-robots-tag')?.includes('noindex'));
    if(path==='/user/trip') record(path,'Kashmir-based brand identity is readable',visible.includes('Kashmir-based'));
  } catch(error) { record(path,'page inspection',false,error.message); }
}

const root=await request('/',{redirect:'manual'});
record('/','permanent homepage redirect',root.status===308 && root.headers.get('location')==='/user/trip',root.status+' '+root.headers.get('location'));
const sitemapResponse=await request('/sitemap.xml');
const sitemap=await sitemapResponse.text();
assert.equal(sitemapResponse.status,200,'Sitemap must load');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1].replaceAll('&amp;','&'));
assert.equal(new Set(urls).size,urls.length,'Sitemap contains duplicates');
assert.ok(urls.every(url=>url.startsWith('https://www.bagspackgo.com/')&&!url.includes('?')));
assert.ok(urls.every(url=>!/(\/api\/|\/admin|\/serviceprovider|\/signin|\/pass\/|reviewjourney|booking-success)/.test(url)));
console.log(JSON.stringify({sitemapUrls:urls.length}));
const paths=urls.map(url=>new URL(url).pathname);
assert.ok(!paths.includes('/providers'),'Removed provider directory must not be in the sitemap');
const staticPaths=paths.filter(p=>['/user/trip','/user/events','/user/offbeats','/user/companion','/about','/travel-guides','/privacy','/terms'].includes(p)||p.startsWith('/travel-guides/'));
const samples=[
  paths.find(p=>/^\/trip\/[^/]+$/.test(p)),
  paths.find(p=>/^\/user\/offbeats\/[^/]+$/.test(p)),
  ...paths.filter(p=>/^\/user\/events\/eventdetails\/[^/]+$/.test(p)).slice(0,2),
  paths.find(p=>/^\/[^/]+$/.test(p)&&!staticPaths.includes(p)),
].filter(Boolean);
const selected = process.argv.includes('--all') ? paths : [...new Set([...staticPaths,...samples])];
for(let i=0;i<selected.length;i+=3) { await Promise.all(selected.slice(i,i+3).map(inspectPage)); console.log('Checked ' + Math.min(i+3,selected.length) + '/' + selected.length + ' public pages'); }
for(const path of ['/signin','/user/saved','/user/trip/guidelist','/user/offbeats/results']) {
  const response=await request(path,{redirect:'manual'});
  record(path,'noindex response header',response.headers.get('x-robots-tag')?.includes('noindex')===true);
}
for(const path of ['/providers','/trip/not-a-valid-id','/user/offbeats/not-a-valid-id','/user/events/eventdetails/not-a-valid-id']) {
  const response=await request(path,{headers:{'User-Agent':'Googlebot'}});
  record(path,'missing listing gives 404',response.status===404,String(response.status));
}
const robots=await (await request('/robots.txt')).text();
record('/robots.txt','production sitemap declared',robots.includes('Sitemap: https://www.bagspackgo.com/sitemap.xml'));
record('/robots.txt','public media crawl exceptions',robots.includes('Allow: /api/events/*/poster')&&robots.includes('Allow: /api/public/provider/*/logo'));
await fs.mkdir('docs/seo',{recursive:true});
await fs.writeFile('docs/seo/verification.json',JSON.stringify({testedAt:new Date().toISOString(),base,sitemapUrls:urls.length,pages: selected.length,results},null,2));
const failures=results.filter(r=>!r.passed);
console.log(JSON.stringify({checks:results.length,pages:selected.length,passed:results.length-failures.length,failures},null,2));
process.exitCode=failures.length?1:0;

