import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        const booking = await Booking.findOne({ _id: id, user: user.userId })
            // Status polling and booking detail lookups do not need the
            // event's base64 poster. Keep this response small, especially
            // while the payment-processing page polls it after a disconnect.
            .populate('event', 'title eventType date duration slots location destination pricePerSlot guide highlights whatsIncluded whatsExcluded whatToBring restrictions includePickup pickupPoints itinerary termsAndConditions')
            .exec();

        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, booking });
    } catch (error) {
        console.error('Failed to fetch booking details:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
