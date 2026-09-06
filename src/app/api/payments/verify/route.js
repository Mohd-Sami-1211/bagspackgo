import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { Event } from '@/models/event.model';
import { getCurrentUser } from '@/lib/auth';
import { sendEventBookingConfirmation } from '@/lib/otp-service';

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        if (user.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Only users can verify bookings.' }, { status: 403 });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingDetails
        } = await request.json();

        if (!RAZORPAY_SECRET) {
            console.error('Razorpay secret not configured');
            return NextResponse.json({ success: false, message: 'Payment gateway not configured' }, { status: 500 });
        }

        // Verify Razorpay signature
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", RAZORPAY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return NextResponse.json({ success: false, message: 'Payment verification failed — invalid signature' }, { status: 400 });
        }

        // Payment verified — connect DB
        await dbConnect();

        const passes = bookingDetails.participants.map((p, i) => ({
            ...p,
            passCode: `BPG-${bookingDetails.eventId}-${Date.now()}-P${i}`,
            checkedIn: false
        }));

        // ═══════ ATOMIC SLOT RESERVATION ═══════
        // Guard against overselling: only increment if capacity allows.
        // This is a single atomic MongoDB operation — safe under concurrent requests.
        const slotUpdate = await Event.findOneAndUpdate(
            {
                _id: bookingDetails.eventId,
                $expr: { $lte: [{ $add: ['$bookedSlots', passes.length] }, '$totalSlots'] }
            },
            { $inc: { bookedSlots: passes.length } },
            { new: true }
        );

        if (!slotUpdate) {
            // Slots ran out — trigger automated Razorpay refund
            let refundSuccess = false;
            if (razorpay_payment_id) {
                try {
                    const razorpay = new Razorpay({
                        key_id: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                        key_secret: process.env.RAZORPAY_KEY_SECRET
                    });
                    await razorpay.payments.refund(razorpay_payment_id, {
                        amount: Math.round(bookingDetails.amount * 100),
                        notes: { reason: 'Slots sold out during checkout' }
                    });
                    refundSuccess = true;
                } catch (refundErr) {
                    console.error('[verify] Auto-refund failed:', refundErr);
                }
            }

            return NextResponse.json({
                success: false,
                soldOut: true,
                message: refundSuccess
                    ? 'This event sold out while you were paying. A full refund has been initiated automatically.'
                    : 'This event sold out while you were paying. Your payment will be refunded within 5-7 business days.',
            }, { status: 409 });
        }

        // Create Booking record after slot was atomically reserved
        const newBooking = new Booking({
            user: user.userId,
            event: bookingDetails.eventId,
            bookingDate: new Date(),
            amountPaid: bookingDetails.amount,
            slots: passes.length,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            contactDetails: bookingDetails.contactDetails,
            participants: passes,
            status: 'confirmed'
        });

        await newBooking.save();

        // Send Email Asynchronously (non-blocking)
        if (bookingDetails.contactDetails?.email && slotUpdate) {
            sendEventBookingConfirmation({
                userEmail: bookingDetails.contactDetails.email,
                userName: user.username || bookingDetails.contactDetails.name || 'Traveler',
                providerEmail: null,
                providerName: null,
                bookingId: newBooking._id.toString(),
                eventName: slotUpdate.title,
                destination: slotUpdate.location || '',
                eventDate: slotUpdate.date,
                numPeople: passes.length,
                totalAmount: bookingDetails.amount
            }).catch(err => console.error("Failed to send booking pass email:", err));
        }

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully',
            bookingId: newBooking._id
        });

    } catch (error) {
        console.error("Verify Payment Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
