import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';
import { Event } from '@/models/event.model';
import { User } from '@/models/user.model';
import { sendEventBookingConfirmation } from '@/lib/otp-service';

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
        if (expectedSignature !== signature) {
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
            // The payment ID is usually inside payload.payment if available, but for order.paid it might not be primary
            paymentId = payload.payment?.entity?.id || 'webhook_order_paid';
        }

        if (!orderId) {
            return NextResponse.json({ success: false, message: 'No order ID in payload' }, { status: 400 });
        }

        await dbConnect();

        // 1. Check Event Bookings
        let booking = await Booking.findOneAndUpdate(
            { orderId, status: 'pending' },
            { $set: { status: 'confirmed', paymentId: paymentId } },
            { new: true }
        );
        
        if (!booking) {
            const existing = await Booking.findOne({ orderId });
            if (existing) {
                return NextResponse.json({ success: true, message: 'Event booking already processed' });
            }
        } else {
            // Perform atomic slot reservation
            const slotUpdate = await Event.findOneAndUpdate(
                { 
                    _id: booking.event, 
                    $expr: { $lte: [{ $add: ['$bookedSlots', booking.slots] }, '$totalSlots'] }
                },
                { $inc: { bookedSlots: booking.slots } },
                { new: true }
            );

            if (!slotUpdate) {
                // Slots ran out — mark booking as cancelled & trigger refund
                let refundSuccess = false;
                if (paymentId && paymentId !== 'webhook_order_paid') {
                    try {
                        const Razorpay = (await import('razorpay')).default;
                        const razorpay = new Razorpay({ 
                            key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
                            key_secret: process.env.RAZORPAY_KEY_SECRET 
                        });
                        await razorpay.payments.refund(paymentId, {
                            amount: Math.round(booking.amountPaid * 100),
                            notes: { reason: "Slots sold out during checkout" }
                        });
                        refundSuccess = true;
                    } catch (refundErr) {
                        console.error('[Webhook] Auto-refund failed:', refundErr);
                    }
                }

                booking.status = refundSuccess ? 'refund_initiated' : 'cancelled';
                if (refundSuccess) {
                    booking.cancellationDetails = {
                        reason: 'Event sold out during payment',
                        refundAmount: booking.amountPaid,
                        refundInitiatedAt: new Date()
                    };
                }
                await booking.save();
                console.log(`[Webhook] Event sold out for booking ${booking._id}`);
                return NextResponse.json({ success: true, message: 'Slots full, marked as cancelled/refunded' });
            }

            // Send emails non-blocking
            (async () => {
                try {
                    const [userDoc, eventDoc] = await Promise.all([
                        User.findById(booking.user).select('username email phone').lean(),
                        Event.findById(booking.event).populate('guide', 'username email').lean(),
                    ]);
                    const providerDoc = eventDoc?.guide;

                    await sendEventBookingConfirmation({
                        userEmail: userDoc?.email,
                        userName: userDoc?.username || 'Traveller',
                        providerEmail: providerDoc?.email,
                        providerName: providerDoc?.username || 'Guide',
                        bookingId: booking._id.toString(),
                        eventName: eventDoc?.title || eventDoc?.name || 'Event Booking',
                        destination: eventDoc?.destinationId || eventDoc?.location || '',
                        eventDate: eventDoc?.date,
                        numPeople: booking.slots,
                        totalAmount: booking.amountPaid
                    });
                } catch (err) {
                    console.error('[Webhook] Email error:', err);
                }
            })();

            return NextResponse.json({ success: true, message: 'Event booking confirmed' });
        }

        // 2. Check Trip Bookings
        booking = await TripBooking.findOneAndUpdate(
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
