import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Event } from '@/models/event.model';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { EVENT_MEDIA_STATUSES, eventMediaHeaders } from '@/lib/eventMediaAccess';

export const dynamic = 'force-dynamic';

function imageResponse(source, request, headers) {
    const image = source?.trim();
    if (!image) return null;

    if (/^https?:\/\//i.test(image)) {
        return NextResponse.redirect(image, { headers });
    }

    if (image.startsWith('/')) {
        return NextResponse.redirect(new URL(image, request.url), { headers });
    }

    const dataUrl = image.match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i);
    if (!dataUrl) return null;

    const body = Buffer.from(dataUrl[2].replace(/\s/g, ''), 'base64');
    if (!body.length) return null;

    return new Response(body, {
        headers: {
            ...headers,
            'Content-Type': dataUrl[1].toLowerCase(),
            'Content-Length': String(body.length),
        },
    });
}

export async function GET(request, context) {
    try {
        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Guide logo not found' }, { status: 404 });
        }

        await dbConnect();
        const event = await Event.findOne({ _id: id, status: { $in: EVENT_MEDIA_STATUSES } })
            .select('guide status visibility').lean();
        if (!event?.guide) {
            return NextResponse.json({ success: false, message: 'Guide logo not found' }, { status: 404 });
        }

        const [details, guide] = await Promise.all([
            GuideDetails.findOne({ guide: event.guide }).select('logo status pausedServices.event').lean(),
            Guide.findById(event.guide).select('profileImage applicationStatus isActive').lean(),
        ]);

        const headers = eventMediaHeaders(event, guide, details);
        if (!headers) return NextResponse.json({ success: false, message: 'Guide logo not found' }, { status: 404 });

        const response = imageResponse(details?.logo || guide?.profileImage, request, headers);
        return response
            || NextResponse.json({ success: false, message: 'Guide logo not found' }, { status: 404 });
    } catch (error) {
        console.error('Failed to fetch event guide logo:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
