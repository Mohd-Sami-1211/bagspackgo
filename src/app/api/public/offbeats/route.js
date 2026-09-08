import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OffBeat } from '@/models/offbeat.model';

const LIST_PROJECTION = {
    title: 1,
    destination: 1,
    region: 1,
    shortDescription: 1,
    coverPhoto: 1,
    featured: 1,
    visitCount: 1,
    status: 1,
    createdAt: 1,
};

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'CDN-Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    'Vercel-CDN-Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
};

const FRESH_FEATURED_HEADERS = {
    'Cache-Control': 'no-store, max-age=0',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store',
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalize = (value = '') => value.toLowerCase().trim();

function editDistance(first, second) {
    const left = normalize(first);
    const right = normalize(second);
    const row = Array.from({ length: right.length + 1 }, (_, index) => index);

    for (let i = 1; i <= left.length; i += 1) {
        let diagonal = row[0];
        row[0] = i;
        for (let j = 1; j <= right.length; j += 1) {
            const previous = row[j];
            row[j] = left[i - 1] === right[j - 1]
                ? diagonal
                : Math.min(diagonal, row[j - 1], row[j]) + 1;
            diagonal = previous;
        }
    }

    return row[right.length];
}

function matchScore(offbeat, input) {
    const query = normalize(input);
    const values = [offbeat.title, offbeat.destination, offbeat.region].map(normalize).filter(Boolean);

    if (values.some((value) => value === query)) return 0;
    if (values.some((value) => value.startsWith(query))) return 0.05;
    if (values.some((value) => value.includes(query))) return 0.1;

    return Math.min(...values.map((value) => editDistance(value, query) / Math.max(value.length, query.length, 1)));
}

function rankMatches(items, input) {
    return items
        .map((item) => ({ item, score: matchScore(item, input) }))
        .sort((first, second) => first.score - second.score || (second.item.visitCount || 0) - (first.item.visitCount || 0));
}

function sortFor(value) {
    if (value === 'popular') return { visitCount: -1, createdAt: -1, _id: -1 };
    if (value === 'name_asc') return { title: 1, _id: 1 };
    if (value === 'name_desc') return { title: -1, _id: -1 };
    return { createdAt: -1, _id: -1 };
}

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(24, Math.max(1, Number.parseInt(searchParams.get('limit') || '9', 10)));
        const requestedRegion = searchParams.get('region')?.trim() || 'All';
        const isAllRegions = ['all', 'all regions'].includes(normalize(requestedRegion));
        const region = isAllRegions ? 'All' : requestedRegion;
        const search = searchParams.get('search')?.trim() || '';
        const suggestionInput = searchParams.get('suggest')?.trim() || '';
        const featured = searchParams.get('featured');
        const sort = searchParams.get('sort') || 'newest';
        const skip = (page - 1) * limit;

        if (suggestionInput) {
            const suggestionQuery = { status: 'published' };
            if (region !== 'All') suggestionQuery.region = region;

            const candidates = await OffBeat.collection.find(suggestionQuery, { projection: LIST_PROJECTION })
                .sort({ visitCount: -1, createdAt: -1 })
                .limit(150)
                .toArray();

            const suggestions = rankMatches(candidates, suggestionInput)
                .slice(0, limit)
                .map(({ item, score }) => ({
                    id: item._id.toString(),
                    title: item.title,
                    destination: item.destination,
                    region: item.region,
                    coverPhoto: item.coverPhoto,
                    exact: score === 0,
                }));

            return NextResponse.json({ success: true, suggestions }, { headers: CACHE_HEADERS });
        }

        const query = { status: 'published' };
        if (region !== 'All') query.region = region;
        if (featured === 'true') query.featured = { $in: [true, 'true', 1] };
        if (featured === 'false') query.featured = { $ne: true };
        if (search) {
            const safeSearch = escapeRegExp(search);
            const exactMatch = await OffBeat.collection.findOne(
                {
                    ...query,
                    $or: [
                        { title: { $regex: `^${safeSearch}$`, $options: 'i' } },
                        { destination: { $regex: `^${safeSearch}$`, $options: 'i' } },
                    ],
                },
                { projection: { _id: 1 } }
            );

            if (exactMatch) {
                query._id = exactMatch._id;
            } else {
                query.$or = [
                    { title: { $regex: safeSearch, $options: 'i' } },
                    { destination: { $regex: safeSearch, $options: 'i' } },
                    { region: { $regex: safeSearch, $options: 'i' } },
                ];
            }
        }

        let [offbeats, total] = await Promise.all([
            OffBeat.collection.find(query, { projection: LIST_PROJECTION })
                .sort(sortFor(sort))
                .skip(skip)
                .limit(limit)
                .toArray(),
            OffBeat.collection.countDocuments(query),
        ]);

        let usedNearestMatch = false;
        let hadNoDirectMatch = false;
        let suggestedQuery = null;
        if (search && total === 0) {
            hadNoDirectMatch = true;
            const fallbackQuery = { status: 'published' };
            if (region !== 'All') fallbackQuery.region = region;

            const candidates = await OffBeat.collection.find(fallbackQuery, { projection: LIST_PROJECTION })
                .sort({ visitCount: -1, createdAt: -1 })
                .limit(150)
                .toArray();
            const ranked = rankMatches(candidates, search);
            suggestedQuery = ranked[0]?.item?.title || null;
            const bestScore = ranked[0]?.score ?? 1;
            const nearest = ranked
                .filter(({ score }) => score <= Math.min(bestScore + 0.15, 0.75))
                .slice(0, 6)
                .map(({ item }) => item);

            total = nearest.length;
            offbeats = nearest.slice(skip, skip + limit);
            usedNearestMatch = nearest.length > 0;
        }

        const totalPages = Math.ceil(total / limit);
        return NextResponse.json(
            {
                success: true,
                data: offbeats,
                matchType: hadNoDirectMatch ? (usedNearestMatch ? 'nearest' : 'none') : search ? 'exact-or-partial' : 'default',
                suggestedQuery,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasMore: page < totalPages,
                },
            },
            { headers: featured === null ? CACHE_HEADERS : FRESH_FEATURED_HEADERS }
        );
    } catch (error) {
        console.error('Failed to fetch public offbeats:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
