import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { OffBeatBooking } from '@/models/offbeatBooking.model';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'Must be logged in to book' }, { status: 401 });
        }

        await dbConnect();
        const { offbeatId, numberOfPersons, contactNumber, date, specialRequirements, inquiryType, dateOptions } = await req.json();

        const booking = new OffBeatBooking({
            offbeat: offbeatId,
            user: currentUser.userId,
            numberOfPersons,
            contactNumber,
            date,
            specialRequirements,
            inquiryType: inquiryType || 'private',
            dateOptions: dateOptions || [],
            status: 'pending'
        });

        await booking.save();
        
        return NextResponse.json({ success: true, data: booking });
    } catch (error) {
        console.error('Failed to create offbeat booking:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'Must be logged in' }, { status: 401 });
        }

        await dbConnect();
        
        const bookings = await OffBeatBooking.find({ user: currentUser.userId })
            .populate('offbeat')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: bookings });
    } catch (error) {
        console.error('Failed to fetch offbeat bookings:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
