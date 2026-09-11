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
        await dbConnect();
        const offbeat = await OffBeat.findOne({ _id: id, status: 'published' })
            .select('-photographs -videos')
            .lean();
        
        if (!offbeat) {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: offbeat }, { headers: CACHE_HEADERS });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
