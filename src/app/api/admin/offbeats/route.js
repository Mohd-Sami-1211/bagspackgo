import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OffBeat } from '@/models/offbeat.model';

export const maxDuration = 60; // Allow more time for large uploads

export async function GET(req) {
    try {
        await dbConnect();
        const offbeats = await OffBeat.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: offbeats });
    } catch (error) {
        console.error('Failed to fetch offbeats:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();
        
        const newOffbeat = new OffBeat(body);
        await newOffbeat.save();
        
        return NextResponse.json({ success: true, data: newOffbeat });
    } catch (error) {
        console.error('Failed to create offbeat:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
