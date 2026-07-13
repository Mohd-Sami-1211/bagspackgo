import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OffBeatBooking } from '@/models/offbeatBooking.model';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const inquiryType = searchParams.get('type') || 'private';

        const bookings = await OffBeatBooking.find({ inquiryType })
            .populate('offbeat', 'title destination')
            .populate('user', 'username email')
            .sort({ createdAt: -1 });
            
        return NextResponse.json({ success: true, data: bookings });
    } catch (error) {
        console.error('Failed to fetch offbeat inquiries:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
