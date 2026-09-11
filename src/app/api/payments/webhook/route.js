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
    sendEventRefundInitiationOnce,
} from '@/lib/eventBooking';
import {
    confirmTripBooking,
    refundTripBookingPayment,
    runTripConfirmationEffects,
    sendTripRefundInitiationOnce,
    validateCapturedTripPayment,
} from '@/lib/tripBooking';
import {
    confirmTrekBooking,
    refundTrekBookingPayment,
    runTrekConfirmationEffects,
    sendTrekRefundInitiationOnce,
    validateCapturedTrekPayment,
} from '@/lib/trekBooking';

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
            || (typeof orderReceipt === 'string' ? orderReceipt.match(/^(?:ev|tr|tk)_([a-f0-9]{24})$/i)?.[1] : null);

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
            if (outcome.kind === 'unavailable' && outcome.booking?.status === 'refund_initiated') {
                await sendEventRefundInitiationOnce(outcome.booking._id);
                return NextResponse.json({ success: true, message: 'Event booking already refunded; notification workflow checked' });
            }
            if (outcome.kind === 'confirmed') {
                if (outcome.newlyConfirmed) await sendEventConfirmationOnce(outcome.booking._id);
                return NextResponse.json({ success: true, message: outcome.newlyConfirmed ? 'Event booking confirmed' : 'Event booking already processed' });
            }
            return NextResponse.json({ success: true, message: 'Event booking already processed' });
        }

        // 2. Check Trip Bookings. This shares the same idempotent confirmation
        // and side-effect path as the browser callback.
        let tripBooking = await TripBooking.findOne({
            $or: [
                { orderId },
                ...(notedBookingId
                    ? [{ _id: notedBookingId, status: 'pending', orderId: { $in: ['', 'pending', 'creating', null] } }]
                    : []),
            ],
        });
        if (tripBooking) {
            if (!paymentId || !payload.payment?.entity) {
                return NextResponse.json({ success: false, message: 'No payment details in trip payload' }, { status: 400 });
            }
            if (tripBooking.orderId !== orderId) {
                const recoveredTrip = await TripBooking.findOneAndUpdate(
                    { _id: tripBooking._id, status: 'pending', orderId: { $in: ['', 'pending', 'creating', null] } },
                    { $set: { orderId, orderCreationStartedAt: null } },
                    { new: true }
                );
                tripBooking = recoveredTrip || await TripBooking.findById(tripBooking._id);
            }

            const paymentEntity = {
                ...payload.payment.entity,
                order_id: orderId,
                amount: payload.payment.entity.amount ?? payload.order?.entity?.amount_paid,
                currency: payload.payment.entity.currency ?? payload.order?.entity?.currency,
                status: payload.payment.entity.status || 'captured',
                captured: payload.payment.entity.captured ?? true,
            };
            validateCapturedTripPayment(tripBooking, paymentEntity);

            if (tripBooking.status === 'refund_initiated') {
                await sendTripRefundInitiationOnce(tripBooking._id);
                return NextResponse.json({ success: true, message: 'Trip refund already initiated' });
            }
            if (['cancelled', 'cancellation_requested'].includes(tripBooking.status)) {
                tripBooking = await TripBooking.findByIdAndUpdate(
                    tripBooking._id,
                    {
                        $set: {
                            paymentId,
                            status: 'cancellation_requested',
                            'cancellationDetails.refundAmount': tripBooking.amountPaid,
                            'cancellationDetails.refundStatus': 'pending',
                        },
                    },
                    { new: true }
                );
                await refundTripBookingPayment(tripBooking, paymentId);
                return NextResponse.json({ success: true, message: 'Late trip payment refund workflow checked' });
            }

            const outcome = await confirmTripBooking({
                bookingId: tripBooking._id,
                orderId,
                paymentId,
            });
            if (outcome.kind === 'confirmed') {
                await runTripConfirmationEffects(outcome.booking);
                return NextResponse.json({ success: true, message: outcome.newlyConfirmed ? 'Trip booking confirmed' : 'Trip booking already processed' });
            }
            return NextResponse.json({ success: false, message: 'Trip booking could not be confirmed' }, { status: 409 });
        }

        // 3. Check Trek Bookings using the same guarded confirmation path.
        let trekBooking = await TrekBooking.findOne({
            $or: [
                { orderId },
                ...(notedBookingId
                    ? [{ _id: notedBookingId, status: 'pending', orderId: { $in: ['', 'pending', 'creating', null] } }]
                    : []),
            ],
        });
        if (trekBooking) {
            if (!paymentId || !payload.payment?.entity) {
                return NextResponse.json({ success: false, message: 'No payment details in trek payload' }, { status: 400 });
            }
            if (trekBooking.orderId !== orderId) {
                const recovered = await TrekBooking.findOneAndUpdate(
                    { _id: trekBooking._id, status: 'pending', orderId: { $in: ['', 'pending', 'creating', null] } },
                    { $set: { orderId, orderCreationStartedAt: null } },
                    { new: true }
                );
                trekBooking = recovered || await TrekBooking.findById(trekBooking._id);
            }

            const paymentEntity = {
                ...payload.payment.entity,
                order_id: orderId,
                amount: payload.payment.entity.amount ?? payload.order?.entity?.amount_paid,
                currency: payload.payment.entity.currency ?? payload.order?.entity?.currency,
                status: payload.payment.entity.status || 'captured',
                captured: payload.payment.entity.captured ?? true,
            };
            validateCapturedTrekPayment(trekBooking, paymentEntity);

            if (trekBooking.status === 'refund_initiated') {
                await sendTrekRefundInitiationOnce(trekBooking._id);
                return NextResponse.json({ success: true, message: 'Trek refund already initiated' });
            }
            if (['cancelled', 'cancellation_requested'].includes(trekBooking.status)) {
                trekBooking = await TrekBooking.findByIdAndUpdate(
                    trekBooking._id,
                    {
                        $set: {
                            paymentId,
                            status: 'cancellation_requested',
                            'cancellationDetails.refundAmount': trekBooking.amountPaid || trekBooking.totalAmount,
                            'cancellationDetails.refundStatus': 'pending',
                        },
                    },
                    { new: true }
                );
                await refundTrekBookingPayment(trekBooking, paymentId);
                return NextResponse.json({ success: true, message: 'Late trek payment refund workflow checked' });
            }

            const outcome = await confirmTrekBooking({
                bookingId: trekBooking._id,
                orderId,
                paymentId,
            });
            if (outcome.kind === 'confirmed') {
                await runTrekConfirmationEffects(outcome.booking);
                return NextResponse.json({ success: true, message: outcome.newlyConfirmed ? 'Trek booking confirmed' : 'Trek booking already processed' });
            }
            return NextResponse.json({ success: false, message: 'Trek booking could not be confirmed' }, { status: 409 });
        }

        // Booking not found
        console.warn(`[Webhook] No booking found for orderId: ${orderId}`);
        return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });

    } catch (error) {
        console.error('[Webhook] Error:', error);
        return NextResponse.json({ success: false, message: 'Webhook processing failed' }, { status: 500 });
    }
}
