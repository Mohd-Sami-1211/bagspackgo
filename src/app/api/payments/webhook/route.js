import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';
import {
    confirmEventBooking,
    refundEventBookingPayment,
    sendEventConfirmationOnce,
} from '@/lib/eventBooking';

function signaturesMatch(actual, expected) {
    if (typeof actual !== 'string' || actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export async function POST(req) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!secret) {
            console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET not configured');
            return NextResponse.json({ success: false, message: 'Webhook secret not configured' }, { status: 500 });
        }

        // Verify signature
        const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
        if (!signaturesMatch(signature, expectedSignature)) {
            console.error('[Webhook] Invalid signature');
            return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
        }

        const data = JSON.parse(rawBody);
        const eventName = data.event; // e.g. 'payment.captured' or 'order.paid'

        if (eventName !== 'payment.captured' && eventName !== 'order.paid') {
            return NextResponse.json({ success: true, message: 'Event ignored' });
        }

        const payload = data.payload;
        let orderId = null;
        let paymentId = null;

        if (eventName === 'payment.captured') {
            orderId = payload.payment?.entity?.order_id;
            paymentId = payload.payment?.entity?.id;
        } else if (eventName === 'order.paid') {
            orderId = payload.order?.entity?.id;
            paymentId = payload.payment?.entity?.id || null;
        }

        if (!orderId) {
            return NextResponse.json({ success: false, message: 'No order ID in payload' }, { status: 400 });
        }

        // The order can be created at Razorpay just before the database write
        // is interrupted. In that small window the booking still has the
        // temporary `creating` marker, so looking up only by orderId would
        // strand a captured payment. The receipt/notes carry the booking id
        // for webhook-side reconciliation.
        const orderReceipt = payload.order?.entity?.receipt;
        const notedBookingId = payload.order?.entity?.notes?.bookingId
            || payload.payment?.entity?.notes?.bookingId
            || (typeof orderReceipt === 'string' ? orderReceipt.match(/^ev_([a-f0-9]{24})$/i)?.[1] : null);

        await dbConnect();

        // 1. Check Event Bookings. Browser callbacks and webhooks share the
        // same transactional confirmation path, so slots can only increment once.
        const eventBooking = await Booking.findOne({
            $or: [
                { orderId },
                ...(notedBookingId
                    ? [{ _id: notedBookingId, status: 'pending', orderId: { $in: ['pending', 'creating'] } }]
                    : []),
            ],
        }).lean();
        if (eventBooking) {
            if (!paymentId && eventBooking.status === 'pending') {
                return NextResponse.json({ success: false, message: 'No payment ID in event payload' }, { status: 400 });
            }

            const reportedAmount = Number(payload.payment?.entity?.amount ?? payload.order?.entity?.amount_paid);
            const expectedAmount = Math.round(eventBooking.amountPaid * 100);
            if (Number.isFinite(reportedAmount) && reportedAmount !== expectedAmount) {
                console.error(`[Webhook] Amount mismatch for event booking ${eventBooking._id}`);
                return NextResponse.json({ success: false, message: 'Payment amount mismatch' }, { status: 400 });
            }

            const outcome = await confirmEventBooking({
                bookingId: eventBooking._id,
                orderId,
                paymentId: paymentId || eventBooking.paymentId,
            });

            if (outcome.kind === 'expired') {
                if (outcome.shouldRefund && paymentId) {
                    await refundEventBookingPayment(outcome.booking, paymentId);
                }
                return NextResponse.json({ success: true, message: 'Checkout expired; full refund workflow checked' });
            }
            if (outcome.kind === 'sold_out') {
                if (outcome.shouldRefund && paymentId) {
                    await refundEventBookingPayment(outcome.booking, paymentId);
                }
                return NextResponse.json({ success: true, message: 'Event unavailable; refund workflow started' });
            }
            if (
                outcome.kind === 'unavailable'
                && outcome.booking?.status === 'cancelled'
                && outcome.booking?.cancellationDetails?.refundAmount > 0
                && (paymentId || outcome.booking.paymentId)
            ) {
                await refundEventBookingPayment(outcome.booking, paymentId || outcome.booking.paymentId);
                return NextResponse.json({ success: true, message: 'Event unavailable; refund workflow checked' });
            }
            if (outcome.kind === 'confirmed') {
                if (outcome.newlyConfirmed) await sendEventConfirmationOnce(outcome.booking._id);
                return NextResponse.json({ success: true, message: outcome.newlyConfirmed ? 'Event booking confirmed' : 'Event booking already processed' });
            }
            return NextResponse.json({ success: true, message: 'Event booking already processed' });
        }

        // 2. Check Trip Bookings
        let booking = await TripBooking.findOneAndUpdate(
            { orderId, status: 'pending' },
            { $set: { status: 'confirmed', paymentId: paymentId } },
            { new: true }
        );
        if (booking) return NextResponse.json({ success: true, message: 'Trip booking confirmed' });
        const existingTrip = await TripBooking.findOne({ orderId });
        if (existingTrip) return NextResponse.json({ success: true, message: 'Trip booking already processed' });

        // 3. Check Trek Bookings
        booking = await TrekBooking.findOneAndUpdate(
            { orderId, status: 'pending' },
            { $set: { status: 'confirmed', paymentId: paymentId } },
            { new: true }
        );
        if (booking) return NextResponse.json({ success: true, message: 'Trek booking confirmed' });
        const existingTrek = await TrekBooking.findOne({ orderId });
        if (existingTrek) return NextResponse.json({ success: true, message: 'Trek booking already processed' });

        // Booking not found
        console.warn(`[Webhook] No booking found for orderId: ${orderId}`);
        return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });

    } catch (error) {
        console.error('[Webhook] Error:', error);
        return NextResponse.json({ success: false, message: 'Webhook processing failed' }, { status: 500 });
    }
}
