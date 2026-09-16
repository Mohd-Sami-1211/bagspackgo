# Search readiness — 16 September 2026

## Scope

Improve discovery and identification of existing Bagspackgo listings while preserving page designs, visible wording and timed sign-in. The public homepage remains `/user/trip`. No provider directory, founder name, generic articles, keyword blocks or spelling-variant pages are added.

## Implemented

- Events and Offbeats preload their existing initial listings on the server. The API and page use the same filters. Existing filter interactions retain their own cache keys.
- Event cards contain normal links to their detail pages. Public event lists exclude drafts, private events, inactive/unapproved organizers and paused event services.
- Narrow robots exceptions allow the public Events and Offbeats listing JSON needed for rendering. Those JSON responses carry `noindex`; HTML detail pages remain the search destinations. Account, booking, pass and other private APIs stay blocked.
- An offbeat's attraction title identifies its `TouristDestination`; its locality and region describe where it is. Real cover images receive fetchable URLs instead of being repeated as base64 in page HTML.
- Event feeds likewise reference their existing poster/logo endpoints, preventing future published events from adding embedded image bytes to the initial HTML.
- Trip metadata uses the stored destination, duration, budget/premium category, company and activities. Structured data identifies real itinerary stops and the same provider entity used by its profile.
- Event metadata uses its actual activity, location and local calendar date. Cancelled, past and registration-closed states are distinguished. No future dates or seasonal availability are fabricated.
- Provider profile markup links to public website/social URLs actually saved by that company, when valid. It does not expose contact, bank or identity-document fields. Existing profile URLs remain stable through company-name edits, including their internal and shared links.
- Public/private event image responses follow publication and organizer eligibility; private direct-link images are marked `noindex` and are not publicly cached.

## Search wording and spelling

Google handles spelling correction and language interpretation. The code gives it accurate page text, names, relationships and crawlable links; it cannot assign a result to every misspelling.

For example, the existing 7 Waterfalls of Bani listing can provide attraction/locality/trek context for searches phrased as “Bani waterfall trek.” This is a relevant target, not a verified ranking claim. A search like “7 waterafallls trek” is ambiguous without a place name. Google's choice of the intended place and its ranking are separate decisions.

Only genuinely used alternative company/place names should be added to identity metadata after verification. Do not generate typo lists, hidden paragraphs, keyword-stuffed titles, duplicate destination URLs or fake reviews. `alternateName` is not an instruction to rank for misspellings.

The models do not contain a reliable seasonal-availability field. A listing can surface seasonal context already in its real title, description or itinerary; do not promise that every trip is available in winter, spring, summer and autumn. Accurate prices and budget/premium categories can support commercial queries, but do not establish that an offer is the cheapest.

## After deployment

1. Deploy the reviewed code using the normal release process. No production deployment or database content edits are part of this change.
2. Keep the existing sitemap submission: `https://www.bagspackgo.com/sitemap.xml`. New eligible records enter it automatically after cache refresh.
3. Inspect the homepage, Offbeats landing page, a destination, a package and a provider in Search Console. Check rendered HTML, indexing status and Google-selected canonical. Inspect a real public event after one is published. A successful live test is not proof of indexing.
4. Review the reasons behind excluded important pages rather than assuming every exclusion is a failure. Draft/private/removed records and account pages should not be search results.
5. Use Performance → Search results to review Queries and Pages together. Track brand spelling variants, provider names, destinations, activity terms, budget terms and seasonal terms that actually receive impressions. Compare bookings and enquiries as well as clicks.

## Validation commands

`npm run test:seo`

`npm run build`

`node scripts/verify-seo.mjs http://localhost:3007 --all`

The HTTP verifier reads pages and public APIs and writes its result to `docs/seo/verification.json`. Tests use synthetic fixtures for lifecycle/identity cases; they do not create or publish trial records.

Production verification passed all 270 checks across the 42 sitemap pages. The optimized Offbeats response measured 39,652 bytes, with no inline base64 images; all three cover responses matched the SHA-256 hashes of their original stored image bytes. The earlier embedded-image SSR response was approximately 5.72 MB. Existing JSX class values were unchanged across all 17 edited JSX files. Browser checks confirmed the existing Offbeats layout and Jammu filter.

## References

- [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google's explanation of spelling correction](https://blog.google/products-and-platforms/products/search/abcs-spelling-google-search/)
- [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [URL Inspection](https://support.google.com/webmasters/answer/9012289)

These changes improve eligibility and clarity. Google controls indexing, query interpretation, ranking and rich-result display; none is guaranteed by deployment or sitemap submission.
