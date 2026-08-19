// src/app/sitemap.js — Dynamic sitemap generation for Google Search Console
import dbConnect from '@/lib/db';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';

export default async function sitemap() {
    const baseUrl = 'https://bagspackgo.com';

    // ── Static pages ──────────────────────────────────────────────
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/user/trip`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/user/trek`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/user/events`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/user/companion`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // ── Dynamic: All approved guide/company profile pages ─────────
    let providerPages = [];
    try {
        await dbConnect();

        // Find all approved guides
        const approvedGuides = await Guide.find({
            applicationStatus: 'approved',
        })
            .select('_id updatedAt')
            .lean();

        // Cross-check with GuideDetails for approved status
        const guideIds = approvedGuides.map((g) => g._id);
        const approvedDetails = await GuideDetails.find({
            guide: { $in: guideIds },
            status: 'approved',
        })
            .select('guide updatedAt')
            .lean();

        const detailsMap = new Map(
            approvedDetails.map((d) => [d.guide.toString(), d.updatedAt])
        );

        providerPages = approvedGuides
            .filter((g) => detailsMap.has(g._id.toString()))
            .map((guide) => ({
                url: `${baseUrl}/user/provider/${guide._id}`,
                lastModified: detailsMap.get(guide._id.toString()) || guide.updatedAt,
                changeFrequency: 'weekly',
                priority: 0.8,
            }));
    } catch (err) {
        console.error('Sitemap: Failed to fetch providers:', err);
    }

    // ── Dynamic: Package detail pages (extend later) ──────────────
    // import { Package } from '@/models/package.model';
    // const packages = await Package.find({ status: 'active' }).select('_id updatedAt').lean();
    // const packagePages = packages.map(pkg => ({
    //     url: `${baseUrl}/user/trip/tripdetails/${pkg._id}`,
    //     lastModified: pkg.updatedAt,
    //     changeFrequency: 'weekly',
    //     priority: 0.7,
    // }));

    return [...staticPages, ...providerPages];
}
