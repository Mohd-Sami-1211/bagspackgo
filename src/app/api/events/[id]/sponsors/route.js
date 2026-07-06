import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Event } from '@/models/event.model';
import mongoose from 'mongoose';

/**
 * GET /api/events/[id]/sponsors
 * Returns only the sponsors for an event. Kept separate from the event detail
 * response so the page can render instantly and stream heavy base64 logo images in afterwards.
 */
export async function GET(request, context) {
    const params = await context.params;
    try {
        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid Event ID format' }, { status: 404 });
        }

        const event = await Event.findById(id).select('sponsors').lean();

        if (!event) {
            return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
        }

        const sponsors = event.sponsors || [];

        return NextResponse.json(
            {
                success: true,
                data: {
                    sponsors,
                },
            },
            { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
        );
    } catch (error) {
        console.error('Failed to fetch event sponsors:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
