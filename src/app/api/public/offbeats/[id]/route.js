import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OffBeat } from '@/models/offbeat.model';
import mongoose from 'mongoose';
import { offbeatCoverUrl } from '@/lib/offbeatMedia';

const CACHE_HEADERS = {
    'Cache-Control': 'public, max-age=60, s-maxage=300, must-revalidate',
    'X-Robots-Tag': 'noindex, follow',
};

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }
        await dbConnect();
        const offbeat = await OffBeat.findOne({ _id: id, status: 'published' })
            .select('-photographs -videos')
            .lean();
        
        if (!offbeat) {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: { ...offbeat, coverPhoto: offbeatCoverUrl(offbeat) } }, { headers: CACHE_HEADERS });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
