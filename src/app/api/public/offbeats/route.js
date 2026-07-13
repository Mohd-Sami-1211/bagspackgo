import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OffBeat } from '@/models/offbeat.model';

export async function GET(req) {
    try {
        await dbConnect();
        const offbeats = await OffBeat.find({ status: 'published' }).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: offbeats });
    } catch (error) {
        console.error('Failed to fetch public offbeats:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
