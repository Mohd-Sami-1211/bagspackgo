import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { TripBooking } from '@/models/tripbooking.model';
import { reconcileTripBooking, TripBookingValidationError } from '@/lib/tripBooking';

function responseFor(outcome) {
    const booking = outcome.booking;
    if (outcome.kind === 'confirmed') {
        return {
            success: true,
            state: 'confirmed',
            bookingId: booking._id.toString(),
            bookingRef: booking.bookingRef,
        };
    }
    if (['refunded', 'processing_refund'].includes(outcome.kind) || booking?.status === 'refund_initiated') {
        return {
            success: false,
            state: 'refund_initiated',
            bookingId: booking?._id?.toString(),
            message: 'Your payment was received, but the booking could not be completed. The refund should reach your original payment method within 3 business days.',
        };
    }
    if (
        booking?.status === 'cancellation_requested'
        && (booking.paymentId || Number(booking.cancellationDetails?.refundAmount) > 0)
    ) {
        return {
            success: false,
            state: 'refund_processing',
            bookingId: booking._id.toString(),
            message: 'Your payment was received and your refund is being arranged. Please do not make another payment.',
        };
    }
    return {
        success: false,
        state: outcome.kind === 'failed' ? 'failed' : 'processing',
        bookingId: booking?._id?.toString(),
        message: outcome.kind === 'failed'
            ? 'The payment attempt was not completed. You can safely try again.'
            : 'We are checking the payment with Razorpay. Please do not pay again yet.',
    };
}

export async function GET(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Users only' }, { status: 403 });

        const bookingId = new URL(request.url).searchParams.get('bookingId');
        if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return NextResponse.json({ success: false, message: 'A valid booking ID is required.' }, { status: 400 });
        }

        await dbConnect();
        const booking = await TripBooking.findOne({ _id: bookingId, user: user.userId });
        if (!booking) return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });

        const outcome = await reconcileTripBooking(booking);
        return NextResponse.json(responseFor(outcome));
    } catch (error) {
        console.error('Trip payment status error:', error);
        if (error instanceof TripBookingValidationError) {
            return NextResponse.json({ success: false, state: 'review_required', message: error.message }, { status: error.status });
        }
        return NextResponse.json({
            success: false,
            state: 'processing',
            message: 'Payment status is temporarily unavailable. Please do not pay again yet.',
        }, { status: 202 });
    }
}
