import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Event } from '@/models/event.model';

export const revalidate = 3600;

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    'X-Content-Type-Options': 'nosniff',
};

export async function GET(request, context) {
    try {
        const { id } = await context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Event poster not found' }, { status: 404 });
        }

        await dbConnect();
        const event = await Event.findOne({ _id: id, status: { $in: ['published', 'completed', 'cancelled'] } }).select('poster').lean();
        const poster = event?.poster?.trim();

        if (!poster) {
            return NextResponse.json({ success: false, message: 'Event poster not found' }, { status: 404 });
        }

        if (/^https?:\/\//i.test(poster)) {
            return NextResponse.redirect(poster, { headers: CACHE_HEADERS });
        }

        if (poster.startsWith('/')) {
            return NextResponse.redirect(new URL(poster, request.url), { headers: CACHE_HEADERS });
        }

        const dataUrl = poster.match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i);
        if (!dataUrl) {
            return NextResponse.json({ success: false, message: 'Invalid event poster' }, { status: 422 });
        }

        const body = Buffer.from(dataUrl[2].replace(/\s/g, ''), 'base64');
        if (!body.length) {
            return NextResponse.json({ success: false, message: 'Invalid event poster' }, { status: 422 });
        }

        return new Response(body, {
            headers: {
                ...CACHE_HEADERS,
                'Content-Type': dataUrl[1].toLowerCase(),
                'Content-Length': String(body.length),
            },
        });
    } catch (error) {
        console.error('Failed to fetch event poster:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
