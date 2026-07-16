import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OffBeat } from '@/models/offbeat.model';

// Lightweight projection for listing cards — excludes heavy base64 image arrays and full-text fields
const LIST_PROJECTION = {
    title: 1,
    destination: 1,
    region: 1,
    shortDescription: 1,
    coverPhoto: 1,
    visitCount: 1,
    status: 1,
    createdAt: 1,
    // Exclude: photographs, videos, description, itinerary, faqs, whatsIncluded,
    // whatsExcluded, whatToBring, restrictions, pickupPoints, dropoffPoints, highlights
};

export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page    = Math.max(1, parseInt(searchParams.get('page')  || '1', 10));
        const limit   = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '9', 10)));
        const region  = searchParams.get('region') || 'All';
        const skip    = (page - 1) * limit;

        // Build query
        const query = { status: 'published' };
        if (region && region !== 'All') {
            query.region = region;
        }

        const [offbeats, total] = await Promise.all([
            OffBeat.find(query, LIST_PROJECTION)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            OffBeat.countDocuments(query),
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: offbeats,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasMore: page < totalPages,
            },
        });
    } catch (error) {
        console.error('Failed to fetch public offbeats:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
