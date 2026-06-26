import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Event } from '@/models/event.model';
import { generateThumbnails } from '@/lib/generateThumbnails';
import mongoose from 'mongoose';

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

        const event = await Event.findById(id).select('photographs').lean();

        if (!event) {
            return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
        }

        const photographs = event.photographs || [];
        const photographThumbnails = await generateThumbnails(photographs);

        return NextResponse.json(
            {
                success: true,
                data: {
                    photographs,
                    photographThumbnails,
                },
            },
            { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
        );
    } catch (error) {
        console.error('Failed to fetch event photos:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
