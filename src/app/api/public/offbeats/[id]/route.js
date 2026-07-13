import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OffBeat } from '@/models/offbeat.model';

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        await dbConnect();
        const offbeat = await OffBeat.findById(id);
        
        if (!offbeat || offbeat.status !== 'published') {
            return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, data: offbeat });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
