import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';
import {
    confirmEventBooking,
    EVENT_CHECKOUT_HOLD_MS,
    refundEventBookingPayment,
    releaseEventBookingHold,
    sendEventConfirmationOnce,
} from '@/lib/eventBooking';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Vercel Cron Authentication (if CRON_SECRET is defined)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ success: false, message: 'Unauthorized cron trigger' }, { status: 401 });
        }

        await dbConnect();

        // Keep a realistic checkout window. Orders that were already sent to
        // Razorpay are reconciled with the gateway before their slot hold is
        // released, so a late capture is confirmed or refunded rather than
        // silently losing the booking.
        const checkoutHoldCutoff = new Date(Date.now() - EVENT_CHECKOUT_HOLD_MS);

        const eventFilter = {
            status: 'pending',
            $or: [
                { expiresAt: { $lte: new Date() } },
                { expiresAt: null, createdAt: { $lt: checkoutHoldCutoff } },
            ],
        };
        const packageFilter = {
            status: 'pending',
            createdAt: { $lt: thirtyMinutesAgo },
        };

        const expiredEvents = await Booking.find(eventFilter)
            .select('_id orderId paymentId')
            .lean();
        let releasedEvents = 0;
        const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
            ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
            : null;

        for (const booking of expiredEvents) {
            const hasGatewayOrder = booking.orderId && !['pending', 'creating'].includes(booking.orderId);

            if (hasGatewayOrder) {
                // If Razorpay cannot be reached, leave the hold in place for
                // the next cron/webhook attempt. Releasing on an unknown
                // gateway state could create a double booking or lose a paid
                // order.
                if (!razorpay) continue;

                try {
                    const [order, paymentList] = await Promise.all([
                        razorpay.orders.fetch(booking.orderId),
                        razorpay.orders.fetchPayments(booking.orderId),
                    ]);
                    const payments = Array.isArray(paymentList?.items) ? paymentList.items : [];
                    const captured = payments.find((payment) => payment.status === 'captured');
                    if (captured) {
                        const outcome = await confirmEventBooking({
                            bookingId: booking._id,
                            orderId: booking.orderId,
                            paymentId: captured.id,
                        });
                        if (outcome.kind === 'confirmed') {
                            if (outcome.newlyConfirmed) await sendEventConfirmationOnce(outcome.booking._id);
                        } else if (['sold_out', 'expired'].includes(outcome.kind) && outcome.shouldRefund) {
                            await refundEventBookingPayment(outcome.booking, captured.id);
                        }
                        releasedEvents += 1;
                        continue;
                    }

                    const paymentStillInProgress = payments.some((payment) => ['created', 'authorized'].includes(payment.status));
                    if (paymentStillInProgress || order?.status === 'paid') continue;
                } catch (gatewayError) {
                    console.error('[Cron] Could not reconcile event order:', booking.orderId, gatewayError);
                    continue;
                }
            }

            const result = await releaseEventBookingHold(booking._id, {
                reason: hasGatewayOrder ? 'Checkout expired without a captured payment' : 'Checkout expired without payment',
                // Keep gateway-issued bookings as a tombstone so a very late
                // captured webhook can trigger a full refund instead of being
                // treated as an unknown order.
                deleteBooking: !hasGatewayOrder,
            });
            if (result.kind === 'released') releasedEvents += 1;
        }

        const [tripResult, trekResult] = await Promise.all([
            TripBooking.deleteMany(packageFilter),
            TrekBooking.deleteMany(packageFilter)
        ]);

        return NextResponse.json({
            success: true,
            message: 'Abandoned pending bookings cleaned up (5-minute window)',
            deleted: {
                events: releasedEvents,
                trips: tripResult.deletedCount,
                treks: trekResult.deletedCount
            }
        });
    } catch (error) {
        console.error('[Cron] Cleanup failed:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
