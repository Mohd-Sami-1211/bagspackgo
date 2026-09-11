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
import { reconcileTripBooking, refundTripBookingPayment } from '@/lib/tripBooking';
import { reconcileTrekBooking, refundTrekBookingPayment } from '@/lib/trekBooking';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Never expose a destructive cleanup endpoint without authentication.
        const authHeader = request.headers.get('authorization');
        if (!process.env.CRON_SECRET) {
            return NextResponse.json({ success: false, message: 'Cron secret not configured' }, { status: 503 });
        }
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ success: false, message: 'Unauthorized cron trigger' }, { status: 401 });
        }

        await dbConnect();

        // Keep a realistic checkout window. Orders that were already sent to
        // Razorpay are reconciled with the gateway before their slot hold is
        // released, so a late capture is confirmed or refunded rather than
        // silently losing the booking.
        const checkoutHoldCutoff = new Date(Date.now() - EVENT_CHECKOUT_HOLD_MS);
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

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

        const expiredTrips = await TripBooking.find(packageFilter).sort({ createdAt: 1 }).limit(200);
        let deletedTrips = 0;
        let reconciledTrips = 0;

        for (let trip of expiredTrips) {
            let hasGatewayOrder = trip.orderId && !['pending', 'creating'].includes(trip.orderId);

            if (trip.orderId === 'creating') {
                // A request may have timed out after Razorpay created the order
                // but before MongoDB stored its id. Recover it by unique receipt.
                if (!razorpay) continue;
                try {
                    const recovered = await razorpay.orders.all({ receipt: `tr_${trip._id.toString()}`, count: 10 });
                    const order = recovered?.items?.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))[0];
                    if (order?.id) {
                        trip = await TripBooking.findByIdAndUpdate(
                            trip._id,
                            { $set: { orderId: order.id, orderCreationStartedAt: null } },
                            { new: true }
                        );
                        hasGatewayOrder = true;
                    } else {
                        await TripBooking.deleteOne({ _id: trip._id, status: 'pending', orderId: 'creating' });
                        deletedTrips += 1;
                        continue;
                    }
                } catch (error) {
                    console.error('[Cron] Could not recover trip order:', trip._id, error);
                    continue;
                }
            }

            if (hasGatewayOrder) {
                if (!razorpay) continue;
                try {
                    const outcome = await reconcileTripBooking(trip);
                    if (['confirmed', 'refunded'].includes(outcome.kind)) {
                        reconciledTrips += 1;
                        continue;
                    }
                    if (['processing', 'unknown'].includes(outcome.kind)) continue;
                } catch (error) {
                    // Unknown gateway state is never safe to delete.
                    console.error('[Cron] Could not reconcile trip order:', trip.orderId, error);
                    continue;
                }
            }

            const deleted = await TripBooking.deleteOne({ _id: trip._id, status: 'pending' });
            deletedTrips += deleted.deletedCount || 0;
        }

        // Retry refunds that were left pending/failed by a transient gateway
        // or database error. The helper first recovers any existing Razorpay
        // refund, so this retry cannot issue the same refund twice.
        const tripRefundsToRetry = await TripBooking.find({
            status: 'cancellation_requested',
            paymentId: { $nin: ['', null] },
            // `pending` is a normal user cancellation awaiting provider
            // approval. Only retry refunds that were already attempted.
            'cancellationDetails.refundStatus': 'failed',
        }).sort({ updatedAt: 1 }).limit(50);
        let retriedTripRefunds = 0;
        for (const trip of tripRefundsToRetry) {
            const outcome = await refundTripBookingPayment(trip);
            if (outcome.kind === 'refunded') retriedTripRefunds += 1;
        }

        // A user can cancel while a payment is still authorising. If its
        // captured webhook is missed, reconcile the cancelled tombstone here.
        const cancelledCheckoutCandidates = await TripBooking.find({
            status: 'cancelled',
            orderId: { $nin: ['', 'pending', 'creating', null] },
            paymentId: { $in: ['', null] },
            createdAt: { $lt: thirtyMinutesAgo },
        }).sort({ updatedAt: 1 }).limit(50);
        for (const trip of cancelledCheckoutCandidates) {
            try {
                const outcome = await reconcileTripBooking(trip);
                if (outcome.kind === 'refunded') retriedTripRefunds += 1;
            } catch (error) {
                console.error('[Cron] Could not reconcile cancelled trip checkout:', trip.orderId, error);
            }
        }

        const confirmationRetries = await TripBooking.find({
            status: 'confirmed',
            confirmedAt: { $ne: null },
            confirmationEmailSentAt: null,
        }).sort({ updatedAt: 1 }).limit(50);
        let retriedTripConfirmations = 0;
        for (const trip of confirmationRetries) {
            try {
                await reconcileTripBooking(trip);
                retriedTripConfirmations += 1;
            } catch (error) {
                console.error('[Cron] Could not retry trip confirmation effects:', trip._id, error);
            }
        }

        const expiredTreks = await TrekBooking.find(packageFilter).sort({ createdAt: 1 }).limit(200);
        let deletedTreks = 0;
        let reconciledTreks = 0;
        for (let trek of expiredTreks) {
            let hasGatewayOrder = trek.orderId && !['pending', 'creating'].includes(trek.orderId);

            if (trek.orderId === 'creating') {
                if (!razorpay) continue;
                try {
                    const recovered = await razorpay.orders.all({ receipt: `tk_${trek._id.toString()}`, count: 10 });
                    const order = recovered?.items?.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))[0];
                    if (order?.id) {
                        trek = await TrekBooking.findByIdAndUpdate(
                            trek._id,
                            { $set: { orderId: order.id, orderCreationStartedAt: null } },
                            { new: true }
                        );
                        hasGatewayOrder = true;
                    } else {
                        const deleted = await TrekBooking.deleteOne({ _id: trek._id, status: 'pending', orderId: 'creating' });
                        deletedTreks += deleted.deletedCount || 0;
                        continue;
                    }
                } catch (error) {
                    console.error('[Cron] Could not recover trek order:', trek._id, error);
                    continue;
                }
            }

            if (hasGatewayOrder) {
                if (!razorpay) continue;
                try {
                    const outcome = await reconcileTrekBooking(trek);
                    if (['confirmed', 'refunded'].includes(outcome.kind)) {
                        reconciledTreks += 1;
                        continue;
                    }
                    if (['processing', 'unknown'].includes(outcome.kind)) continue;
                } catch (error) {
                    console.error('[Cron] Could not reconcile trek order:', trek.orderId, error);
                    continue;
                }
            }

            const deleted = await TrekBooking.deleteOne({ _id: trek._id, status: 'pending' });
            deletedTreks += deleted.deletedCount || 0;
        }

        const trekRefundsToRetry = await TrekBooking.find({
            status: 'cancellation_requested',
            paymentId: { $nin: ['', null] },
            'cancellationDetails.refundStatus': 'failed',
        }).sort({ updatedAt: 1 }).limit(50);
        let retriedTrekRefunds = 0;
        for (const trek of trekRefundsToRetry) {
            const outcome = await refundTrekBookingPayment(trek);
            if (outcome.kind === 'refunded') retriedTrekRefunds += 1;
        }

        const cancelledTrekCandidates = await TrekBooking.find({
            status: 'cancelled',
            orderId: { $nin: ['', 'pending', 'creating', null] },
            paymentId: { $in: ['', null] },
            createdAt: { $lt: thirtyMinutesAgo },
        }).sort({ updatedAt: 1 }).limit(50);
        for (const trek of cancelledTrekCandidates) {
            try {
                const outcome = await reconcileTrekBooking(trek);
                if (outcome.kind === 'refunded') retriedTrekRefunds += 1;
            } catch (error) {
                console.error('[Cron] Could not reconcile cancelled trek checkout:', trek.orderId, error);
            }
        }

        const trekConfirmationRetries = await TrekBooking.find({
            status: 'confirmed',
            confirmedAt: { $ne: null },
            confirmationEmailSentAt: null,
        }).sort({ updatedAt: 1 }).limit(50);
        let retriedTrekConfirmations = 0;
        for (const trek of trekConfirmationRetries) {
            try {
                await reconcileTrekBooking(trek);
                retriedTrekConfirmations += 1;
            } catch (error) {
                console.error('[Cron] Could not retry trek confirmation effects:', trek._id, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Abandoned bookings reconciled and cleaned up',
            deleted: {
                events: releasedEvents,
                trips: deletedTrips,
                treks: deletedTreks
            },
            reconciled: {
                trips: reconciledTrips,
                tripRefunds: retriedTripRefunds,
                tripConfirmations: retriedTripConfirmations,
                treks: reconciledTreks,
                trekRefunds: retriedTrekRefunds,
                trekConfirmations: retriedTrekConfirmations,
            },
        });
    } catch (error) {
        console.error('[Cron] Cleanup failed:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}
