import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OffBeatBooking } from '@/models/offbeatBooking.model';

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        await dbConnect();
        const { status } = await req.json();
        
        const booking = await OffBeatBooking.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );
        
        return NextResponse.json({ success: true, data: booking });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
