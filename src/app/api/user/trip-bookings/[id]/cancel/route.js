import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TripBooking } from '@/models/tripbooking.model';
import { getCurrentUser } from '@/lib/auth';

// POST — request cancellation of a trip booking
export async function POST(req, { params }) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Users only' }, { status: 403 });

        const { id } = await params;
        await dbConnect();

        const { reason } = await req.json();

        if (!reason || !reason.trim()) {
            return NextResponse.json({ success: false, message: 'Cancellation reason is required.' }, { status: 400 });
        }

        const booking = await TripBooking.findOne({ _id: id, user: user.userId });
        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
        }

        // Only allow cancellation of confirmed or pending bookings
        if (!['confirmed', 'pending'].includes(booking.status)) {
            return NextResponse.json({ success: false, message: `Cannot cancel a booking with status: ${booking.status}` }, { status: 400 });
        }

        const ticketId = 'CAN-TRIP-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const refundAmt = Math.max(0, booking.totalAmount - (booking.platformFee || 0));

        booking.status = 'cancellation_requested';
        booking.cancellationDetails = {
            ticketId,
            reason: reason.trim(),
            requestedAt: new Date(),
            refundInitiatedAt: null,
            completedAt: null,
            refundAmount: refundAmt,
        };

        await booking.save();

        return NextResponse.json({ success: true, message: 'Cancellation requested successfully.' });
    } catch (error) {
        console.error('Cancel trip booking error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
