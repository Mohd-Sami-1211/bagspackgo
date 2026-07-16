import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { User } from '@/models/user.model';
import { Guide } from '@/models/guide.model';
import { Event } from '@/models/event.model';
import { getCurrentUser } from '@/lib/auth';
import { sendEventBookingConfirmation } from '@/lib/otp-service';

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Only users can verify bookings.' }, { status: 403 });

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await request.json();

        if (!bookingId) return NextResponse.json({ success: false, message: 'bookingId required' }, { status: 400 });

        await dbConnect();

        // ═══════ ATOMIC BOOKING CLAIM ═══════
        // Update the booking status to confirmed atomically. If it returns null, 
        // it means another process (like the webhook) already verified it.
        const booking = await Booking.findOneAndUpdate(
            { _id: bookingId, user: user.userId, status: 'pending' },
            { 
                $set: { 
                    status: 'confirmed', 
                    paymentId: razorpay_payment_id || 'free_event',
                    orderId: razorpay_order_id || 'free_event' 
                } 
            },
            { new: true }
        );

        if (!booking) {
            // Check if it already exists but is no longer pending
            const existing = await Booking.findOne({ _id: bookingId, user: user.userId });
            if (!existing) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
            if (existing.status === 'confirmed') {
                return NextResponse.json({ success: true, message: 'Booking already confirmed.', bookingId: existing._id.toString() });
            }
            return NextResponse.json({ success: false, message: 'Booking is no longer pending.' }, { status: 400 });
        }

        // For free events (price = 0), skip signature verification
        const isFreeEvent = razorpay_order_id?.startsWith('mock_order_free_');

        if (!isFreeEvent) {
            if (!RAZORPAY_SECRET) {
                console.error('Razorpay secret not configured');
                // Revert booking claim if gateway fails
                booking.status = 'pending';
                await booking.save();
                return NextResponse.json({ success: false, message: 'Payment gateway not configured' }, { status: 500 });
            }

            // Verify Razorpay signature
            const sign = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSign = crypto.createHmac('sha256', RAZORPAY_SECRET).update(sign).digest('hex');
            if (expectedSign !== razorpay_signature) {
                // Revert booking claim on invalid signature
                booking.status = 'pending';
                await booking.save();
                return NextResponse.json({ success: false, message: 'Payment verification failed — invalid signature' }, { status: 400 });
            }
        }

        // ═══════ ATOMIC SLOT RESERVATION ═══════
        const slotUpdate = await Event.findOneAndUpdate(
            { 
                _id: booking.event, 
                $expr: { $lte: [{ $add: ['$bookedSlots', booking.slots] }, '$totalSlots'] }
            },
            { $inc: { bookedSlots: booking.slots } },
            { new: true }
        );

        if (!slotUpdate) {
            // Slots ran out — trigger automated Razorpay refund
            let refundSuccess = false;
            if (!isFreeEvent && razorpay_payment_id) {
                try {
                    const razorpay = new Razorpay({ 
                        key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
                        key_secret: process.env.RAZORPAY_KEY_SECRET 
                    });
                    await razorpay.payments.refund(razorpay_payment_id, {
                        amount: Math.round(booking.amountPaid * 100),
                        notes: { reason: "Slots sold out during checkout" }
                    });
                    refundSuccess = true;
                } catch (refundErr) {
                    console.error('Auto-refund failed:', refundErr);
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

            return NextResponse.json({ 
                success: false, 
                soldOut: true,
                message: refundSuccess 
                    ? 'This event sold out while you were paying. A full refund has been initiated automatically.' 
                    : 'This event sold out while you were paying. Your payment will be refunded within 5-7 business days.',
                bookingId: booking._id.toString()
            }, { status: 409 });
        }

        // Fetch related data for emails
        const [userDoc, eventDoc] = await Promise.all([
            User.findById(booking.user).select('username email phone').lean(),
            Event.findById(booking.event).populate('guide', 'username email').lean(),
        ]);
        const providerDoc = eventDoc?.guide;

        // Send confirmation emails (non-blocking)
        (async () => {
             try {
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
                 console.error('Booking email error:', err);
             }
        })();

        return NextResponse.json({
            success: true,
            message: 'Payment verified! Booking confirmed.',
            bookingId: booking._id.toString()
        });
    } catch (error) {
        console.error('Event verify error:', error);
        return NextResponse.json({ success: false, message: 'Server error during verification' }, { status: 500 });
    }
}
