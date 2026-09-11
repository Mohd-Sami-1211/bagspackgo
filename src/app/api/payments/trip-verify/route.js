import { NextResponse } from 'next/server';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { TripBooking } from '@/models/tripbooking.model';
import { getCurrentUser } from '@/lib/auth';
import {
    confirmTripBooking,
    refundTripBookingPayment,
    runTripConfirmationEffects,
    sendTripRefundInitiationOnce,
    TripBookingValidationError,
    validateCapturedTripPayment,
} from '@/lib/tripBooking';

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
        if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return NextResponse.json({ success: false, message: 'A valid booking ID is required.' }, { status: 400 });
        }
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json({ success: false, message: 'Incomplete payment verification data.' }, { status: 400 });
        }
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ success: false, message: 'Payment gateway not configured' }, { status: 500 });
        }

        await dbConnect();
        let booking = await TripBooking.findOne({ _id: bookingId, user: user.userId });
        if (!booking) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });

        if (booking.orderId !== razorpay_order_id) {
            return NextResponse.json({ success: false, message: 'Payment order does not match this booking.' }, { status: 400 });
        }
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${booking.orderId}|${razorpay_payment_id}`)
            .digest('hex');
        if (!signaturesMatch(razorpay_signature, expectedSignature)) {
            return NextResponse.json({ success: false, message: 'Payment verification failed — invalid signature' }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        let payment;
        try {
            payment = await razorpay.payments.fetch(razorpay_payment_id);
        } catch (gatewayError) {
            console.error('Could not fetch trip payment for verification:', gatewayError);
            return NextResponse.json({
                success: false,
                processing: true,
                bookingId,
                message: 'Payment was received and is being verified. Please do not pay again.',
            }, { status: 202 });
        }

        try {
            validateCapturedTripPayment(booking, payment);
        } catch (error) {
            if (error instanceof TripBookingValidationError && error.status === 202) {
                return NextResponse.json({
                    success: false,
                    processing: true,
                    bookingId,
                    message: 'Payment is authorised and is waiting for confirmation. Please do not pay again.',
                }, { status: 202 });
            }
            throw error;
        }

        if (booking.status === 'refund_initiated') {
            await sendTripRefundInitiationOnce(booking._id);
            return NextResponse.json({
                success: false,
                paymentCaptured: true,
                refundInitiated: true,
                bookingId,
                message: 'Your payment was received and its refund has already been initiated.',
            }, { status: 409 });
        }

        if (['cancelled', 'cancellation_requested'].includes(booking.status)) {
            booking = await TripBooking.findByIdAndUpdate(
                booking._id,
                {
                    $set: {
                        paymentId: razorpay_payment_id,
                        status: 'cancellation_requested',
                        'cancellationDetails.refundAmount': booking.amountPaid,
                        'cancellationDetails.refundStatus': 'pending',
                    },
                },
                { new: true }
            );
            const refund = await refundTripBookingPayment(booking, razorpay_payment_id);
            return NextResponse.json({
                success: false,
                paymentCaptured: true,
                refundPending: true,
                refundInitiated: refund.kind === 'refunded',
                bookingId,
                message: refund.kind === 'refunded'
                    ? 'Your payment was received after the booking closed. A refund has been initiated and should arrive within 3 business days.'
                    : 'Your payment was received after the booking closed. Support has been notified to process the refund.',
            }, { status: 409 });
        }

        const outcome = await confirmTripBooking({
            bookingId,
            userId: user.userId,
            orderId: booking.orderId,
            paymentId: razorpay_payment_id,
        });
        if (outcome.kind !== 'confirmed') {
            return NextResponse.json({
                success: false,
                paymentCaptured: true,
                bookingId,
                message: 'Payment was received but the booking needs reconciliation. Please do not pay again.',
            }, { status: 409 });
        }

        await runTripConfirmationEffects(outcome.booking);
        return NextResponse.json({
            success: true,
            message: outcome.newlyConfirmed ? 'Payment verified! Booking confirmed.' : 'Booking already confirmed.',
            bookingId: outcome.booking._id.toString(),
            bookingRef: outcome.booking.bookingRef,
        });
    } catch (error) {
        console.error('Trip verify error:', error);
        if (error instanceof TripBookingValidationError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        return NextResponse.json({
            success: false,
            processing: true,
            message: 'We could not finish verification yet. Please do not pay again while we check the payment.',
        }, { status: 202 });
    }
}
