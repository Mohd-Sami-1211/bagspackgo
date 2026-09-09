import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Booking } from '@/models/booking.model';
import { Event } from '@/models/event.model';
import { calculateEventBookingQuote, releaseEventBookingHold } from '@/lib/eventBooking';

export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Only users can book events.' }, { status: 403 });

        const { bookingId } = await request.json();

        if (!bookingId) {
            return NextResponse.json({ success: false, message: 'bookingId is required' }, { status: 400 });
        }
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return NextResponse.json({ success: false, message: 'Invalid booking ID.' }, { status: 400 });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay keys not configured');
            return NextResponse.json({ success: false, message: 'Payment gateway not configured' }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        await dbConnect();

        // Verify the booking belongs to this user and is still pending
        const booking = await Booking.findOne({ _id: bookingId, user: user.userId, status: 'pending' });
        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found or already processed' }, { status: 404 });
        }

        if (booking.expiresAt && booking.expiresAt <= new Date()) {
            await releaseEventBookingHold(booking._id, { reason: 'Checkout expired' });
            return NextResponse.json({ success: false, message: 'This checkout has expired. Please start again.' }, { status: 410 });
        }

        // Idempotent retry: do not create multiple Razorpay orders for one booking.
        if (booking.orderId && !['pending', 'creating'].includes(booking.orderId)) {
            return NextResponse.json({
                success: true,
                orderId: booking.orderId,
                amount: Math.round(booking.amountPaid * 100),
                currency: 'INR',
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
                bookingId,
                reused: true,
            });
        }
        if (booking.orderId === 'creating') {
            const claimIsStale = booking.orderCreationStartedAt
                && booking.orderCreationStartedAt < new Date(Date.now() - 2 * 60 * 1000);
            if (!claimIsStale) {
                return NextResponse.json({ success: false, message: 'Payment order is already being created. Please retry.' }, { status: 409 });
            }

            // Recover an order when the previous request timed out after
            // Razorpay accepted it but before our database write completed.
            // This prevents a retry from creating a second payable order.
            try {
                const recovered = await razorpay.orders.all({ receipt: `ev_${bookingId.toString()}`, count: 10 });
                const existingOrder = recovered?.items?.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))[0];
                if (existingOrder?.id) {
                    await Booking.updateOne(
                        { _id: booking._id, status: 'pending', orderId: 'creating' },
                        { $set: { orderId: existingOrder.id, orderCreationStartedAt: null } }
                    );
                    return NextResponse.json({
                        success: true,
                        orderId: existingOrder.id,
                        amount: existingOrder.amount,
                        currency: existingOrder.currency || 'INR',
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
                        bookingId,
                        reused: true,
                    });
                }
            } catch (recoveryError) {
                console.warn('Could not recover stale event payment order:', recoveryError);
            }
            booking.orderId = 'pending';
            booking.orderCreationStartedAt = null;
        }

        // ── Fresh slot availability check before initiating payment ──
        const eventDoc = await Event.findOne({
            _id: booking.event,
            status: 'published',
            date: { $gte: new Date() },
        }).select('totalSlots bookedSlots reservedSlots pricePerSlot applicationFormType customFormFields').lean();
        if (!eventDoc) {
            await releaseEventBookingHold(booking._id, { reason: 'Event is no longer bookable' });
            return NextResponse.json({ success: false, message: 'Event is no longer available for booking' }, { status: 409 });
        }

        const quote = calculateEventBookingQuote(eventDoc, booking.slots, booking.customFormResponses);
        if (quote.totalPayable <= 0) {
            return NextResponse.json({ success: false, message: 'Free events do not require a payment order.' }, { status: 400 });
        }
        booking.amountPaid = quote.totalPayable;
        booking.extraChargesTotal = quote.extraChargesTotal;
        booking.customFormResponses = quote.customFormResponses;
        const available = eventDoc.totalSlots
            - (eventDoc.bookedSlots || 0)
            - (eventDoc.reservedSlots || 0)
            + (booking.slotsReserved ? booking.slots : 0);
        if (booking.slots > available) {
            await releaseEventBookingHold(booking._id, { reason: 'Event became unavailable before payment' });
            return NextResponse.json({ 
                success: false, 
                soldOut: true,
                message: available <= 0 ? 'This event is now sold out.' : `Only ${available} slot(s) remaining.`
            }, { status: 409 });
        }

        await booking.save();

        const claimedBooking = await Booking.findOneAndUpdate(
            { _id: booking._id, user: user.userId, status: 'pending', orderId: 'pending' },
            { $set: { orderId: 'creating', orderCreationStartedAt: new Date() } },
            { new: true }
        );
        if (!claimedBooking) {
            const latest = await Booking.findById(booking._id).lean();
            if (latest?.orderId && !['pending', 'creating'].includes(latest.orderId)) {
                return NextResponse.json({
                    success: true,
                    orderId: latest.orderId,
                    amount: Math.round(latest.amountPaid * 100),
                    currency: 'INR',
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
                    bookingId,
                    reused: true,
                });
            }
            return NextResponse.json({ success: false, message: 'Payment order is already being created. Please retry.' }, { status: 409 });
        }

        const options = {
            // The payable amount is calculated and stored by the server when
            // the booking is created. Never accept a client-provided amount.
            amount: Math.round(booking.amountPaid * 100), // paise
            currency: 'INR',
            // Keep the full booking id in the gateway receipt. If the browser
            // or database connection drops after Razorpay creates the order,
            // the webhook can still reconcile the payment to this booking.
            receipt: `ev_${bookingId.toString()}`,
            notes: { bookingId, userId: user.userId },
        };

        let order;
        try {
            order = await razorpay.orders.create(options);
            await Booking.updateOne(
                { _id: booking._id, status: 'pending', orderId: 'creating' },
                { $set: { orderId: order.id, orderCreationStartedAt: null } }
            );
        } catch (error) {
            // Keep the temporary marker while the gateway outcome is
            // unknown. A stale retry can recover the order by receipt, and a
            // signed webhook can reconcile it using the receipt/notes.
            await Booking.updateOne(
                { _id: booking._id, status: 'pending', orderId: 'creating' },
                { $set: { orderCreationStartedAt: new Date() } }
            ).catch(() => {});
            throw error;
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
            bookingId,
        });
    } catch (error) {
        console.error('Event create order error:', error);
        return NextResponse.json({ success: false, message: 'Failed to create payment order' }, { status: 500 });
    }
}
