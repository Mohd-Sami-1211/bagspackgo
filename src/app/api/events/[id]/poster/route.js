import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Event } from '@/models/event.model';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { EVENT_MEDIA_STATUSES, eventMediaHeaders } from '@/lib/eventMediaAccess';

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
    try {
        const { id } = await context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Event poster not found' }, { status: 404 });
        }

        await dbConnect();
        const event = await Event.findOne({ _id: id, status: { $in: EVENT_MEDIA_STATUSES } })
            .select('poster guide status visibility').lean();
        const poster = event?.poster?.trim();

        if (!poster || !event?.guide) {
            return NextResponse.json({ success: false, message: 'Event poster not found' }, { status: 404 });
        }

        const [guide, details] = await Promise.all([
            Guide.findById(event.guide).select('applicationStatus isActive').lean(),
            GuideDetails.findOne({ guide: event.guide }).select('status pausedServices.event').lean(),
        ]);
        const headers = eventMediaHeaders(event, guide, details);
        if (!headers) return NextResponse.json({ success: false, message: 'Event poster not found' }, { status: 404 });

        if (/^https?:\/\//i.test(poster)) {
            return NextResponse.redirect(poster, { headers });
        }

        if (poster.startsWith('/')) {
            return NextResponse.redirect(new URL(poster, request.url), { headers });
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
                ...headers,
                'Content-Type': dataUrl[1].toLowerCase(),
                'Content-Length': String(body.length),
            },
        });
    } catch (error) {
        console.error('Failed to fetch event poster:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
