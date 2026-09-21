import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Event } from '@/models/event.model';
import { generateThumbnails } from '@/lib/generateThumbnails';
import mongoose from 'mongoose';

export const revalidate = 300;

/**
 * GET /api/events/[id]/photos
 * Returns only the heavy gallery images for an event, plus tiny blurred
 * thumbnails for progressive loading. Kept separate from the event detail
 * response so the page can render instantly and stream photos in afterwards.
 */
export async function GET(request, context) {
    const params = await context.params;
    try {
        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid Event ID format' }, { status: 404 });
        }

        const { searchParams } = new URL(request.url);
        const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10);
        const requestedLimit = Number.parseInt(searchParams.get('limit') || '5', 10);
        const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
        const limit = Number.isFinite(requestedLimit) ? Math.min(24, Math.max(1, requestedLimit)) : 5;
        const skip = (page - 1) * limit;

        const event = await Event.findOne({ _id: id, status: 'published' }).select('photographs').lean();

        if (!event) {
            return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
        }

        const allPhotographs = event.photographs || [];
        const total = allPhotographs.length;
        const totalPages = Math.ceil(total / limit);

        const photographs = allPhotographs.slice(skip, skip + limit);
        const photographThumbnails = await generateThumbnails(photographs);

        return NextResponse.json(
            {
                success: true,
                data: {
                    photographs,
                    photographThumbnails,
                },
                pagination: { page, limit, total, totalPages, hasMore: page < totalPages },
            },
            { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' } }
        );
    } catch (error) {
        console.error('Failed to fetch event photos:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
