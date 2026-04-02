import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'provider') return NextResponse.json({ success: false, message: 'Only providers can scan passes.' }, { status: 403 });

        const body = await req.json();
        const { bookingId, passCode } = body;

        if (!bookingId || !passCode) {
            return NextResponse.json({ success: false, message: 'bookingId and passCode are required.' }, { status: 400 });
        }

        await dbConnect();

        const booking = await Booking.findById(bookingId).populate('event');
        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
        }

        // Verify that this provider owns the event
        if (booking.event.guide.toString() !== user.userId) {
            return NextResponse.json({ success: false, message: 'You do not have permission to verify passes for this event.' }, { status: 403 });
        }

        if (booking.status !== 'confirmed') {
            return NextResponse.json({ success: false, message: `Booking status is ${booking.status}, cannot verify.` }, { status: 400 });
        }

        // Find the specific participant
        const participantIndex = booking.participants.findIndex(p => p.passCode === passCode);
        
        if (participantIndex === -1) {
            return NextResponse.json({ success: false, message: 'Invalid pass code.' }, { status: 400 });
        }

        if (booking.participants[participantIndex].checkedIn) {
            return NextResponse.json({ success: false, message: 'Pass has already been scanned and used.' }, { status: 400 });
        }

        // Mark as checked in
        booking.participants[participantIndex].checkedIn = true;
        await booking.save();

        return NextResponse.json({
            success: true,
            message: 'Pass verified successfully!',
            participant: {
                name: booking.participants[participantIndex].name,
                idNumber: booking.participants[participantIndex].idNumber
            }
        });

    } catch (error) {
        console.error('Verify pass code error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
