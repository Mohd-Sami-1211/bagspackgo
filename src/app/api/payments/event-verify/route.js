import { NextResponse } from 'next/server';
import crypto from 'crypto';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { getCurrentUser } from '@/lib/auth';
import {
    confirmEventBooking,
    refundEventBookingPayment,
    sendEventConfirmationOnce,
} from '@/lib/eventBooking';

function signaturesMatch(actual, expected) {
    if (typeof actual !== 'string' || actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Only users can verify bookings.' }, { status: 403 });

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await request.json();
        if (!bookingId) return NextResponse.json({ success: false, message: 'bookingId required' }, { status: 400 });
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return NextResponse.json({ success: false, message: 'Invalid booking ID.' }, { status: 400 });
        }

        await dbConnect();

        const booking = await Booking.findOne({ _id: bookingId, user: user.userId }).lean();
        if (!booking) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        if (booking.status === 'confirmed') {
            return NextResponse.json({ success: true, message: 'Booking already confirmed.', bookingId: booking._id.toString() });
        }
        // A checkout can expire or be marked unavailable just before the
        // browser callback arrives. Keep accepting a signed callback for a
        // cancelled booking so the same path can issue the full refund.
        if (!['pending', 'cancelled'].includes(booking.status)) {
            return NextResponse.json({ success: false, message: 'Booking is no longer pending.' }, { status: 409 });
        }

        const isFreeEvent = booking.amountPaid === 0;
        let verifiedOrderId = 'free_event';
        let verifiedPaymentId = 'free_event';

        if (!isFreeEvent) {
            if (!process.env.RAZORPAY_KEY_SECRET) {
                return NextResponse.json({ success: false, message: 'Payment gateway not configured' }, { status: 500 });
            }
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return NextResponse.json({ success: false, message: 'Incomplete payment verification data.' }, { status: 400 });
            }
            if (booking.orderId !== razorpay_order_id) {
                return NextResponse.json({ success: false, message: 'Payment order does not match this booking.' }, { status: 400 });
            }

            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest('hex');
            if (!signaturesMatch(razorpay_signature, expectedSignature)) {
                return NextResponse.json({ success: false, message: 'Payment verification failed — invalid signature' }, { status: 400 });
            }
            verifiedOrderId = razorpay_order_id;
            verifiedPaymentId = razorpay_payment_id;
        }

        const outcome = await confirmEventBooking({
            bookingId,
            userId: user.userId,
            orderId: verifiedOrderId,
            paymentId: verifiedPaymentId,
        });

        if (outcome.kind === 'expired') {
            const refunded = outcome.shouldRefund
                ? await refundEventBookingPayment(outcome.booking, verifiedPaymentId)
                : false;
            return NextResponse.json({
                success: false,
                expired: true,
                message: outcome.shouldRefund
                    ? refunded
                        ? 'This checkout expired before confirmation. Your full payment refund has been initiated.'
                        : 'This checkout expired before confirmation. Support has been notified to process your full refund.'
                    : 'This checkout expired. Please start again.',
                bookingId: outcome.booking._id.toString(),
            }, { status: 410 });
        }

        if (outcome.kind === 'sold_out') {
            const refunded = outcome.shouldRefund
                ? await refundEventBookingPayment(outcome.booking, verifiedPaymentId)
                : false;
            return NextResponse.json({
                success: false,
                soldOut: true,
                message: outcome.shouldRefund
                    ? refunded
                        ? 'This event became unavailable while you were paying. A full refund has been initiated.'
                        : 'This event became unavailable while you were paying. Support has been notified to process your refund.'
                    : 'This event is no longer available.',
                bookingId: outcome.booking._id.toString(),
            }, { status: 409 });
        }
        if (
            outcome.kind === 'unavailable'
            && outcome.booking?.status === 'cancelled'
            && outcome.booking?.cancellationDetails?.refundAmount > 0
        ) {
            const refunded = await refundEventBookingPayment(outcome.booking, verifiedPaymentId);
            return NextResponse.json({
                success: false,
                soldOut: true,
                message: refunded
                    ? 'This event became unavailable while you were paying. A full refund is being processed.'
                    : 'This event became unavailable while you were paying. Support has been notified to process your refund.',
                bookingId: outcome.booking._id.toString(),
            }, { status: 409 });
        }
        if (outcome.kind !== 'confirmed') {
            const status = outcome.kind === 'not_found' ? 404 : 409;
            return NextResponse.json({ success: false, message: 'Booking could not be confirmed.' }, { status });
        }

        if (outcome.newlyConfirmed) await sendEventConfirmationOnce(outcome.booking._id);

        return NextResponse.json({
            success: true,
            message: 'Payment verified! Booking confirmed.',
            bookingId: outcome.booking._id.toString(),
        });
    } catch (error) {
        console.error('Event verify error:', error);
        return NextResponse.json({ success: false, message: 'Server error during verification' }, { status: 500 });
    }
}
