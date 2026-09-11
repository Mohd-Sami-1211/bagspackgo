import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OffBeat } from '@/models/offbeat.model';
import mongoose from 'mongoose';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    'CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
    'Vercel-CDN-Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
};

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }
        const { searchParams } = new URL(req.url);
        const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10);
        const requestedLimit = Number.parseInt(searchParams.get('limit') || '4', 10);
        const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
        const limit = Number.isFinite(requestedLimit) ? Math.min(24, Math.max(1, requestedLimit)) : 4;
        const skip = (page - 1) * limit;
        await dbConnect();

        const [result] = await OffBeat.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id), status: 'published' } },
            {
                $project: {
                    images: {
                        $filter: {
                            input: { $ifNull: ['$photographs', []] },
                            as: 'photo',
                            cond: { $and: [{ $ne: ['$$photo', '$coverPhoto'] }, { $ne: ['$$photo', ''] }] },
                        },
                    },
                    videos: { $filter: { input: { $ifNull: ['$videos', []] }, as: 'video', cond: { $ne: ['$$video', ''] } } },
                },
            },
            {
                $project: {
                    media: {
                        $concatArrays: [
                            { $map: { input: '$images', as: 'url', in: { type: 'image', url: '$$url' } } },
                            { $map: { input: '$videos', as: 'url', in: { type: 'video', url: '$$url' } } },
                        ],
                    },
                    total: { $add: [{ $size: '$images' }, { $size: '$videos' }] },
                },
            },
            { $project: { media: { $slice: ['$media', skip, limit] }, total: 1 } },
        ]);

        if (!result) {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }

        const totalPages = Math.ceil(result.total / limit);
        return NextResponse.json({
            success: true,
            data: { media: result.media || [] },
            pagination: { page, limit, total: result.total, totalPages, hasMore: page < totalPages },
        }, { headers: CACHE_HEADERS });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
