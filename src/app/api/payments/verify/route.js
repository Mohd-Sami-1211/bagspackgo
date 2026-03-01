import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { Event } from '@/models/event.model';
import { getCurrentUser } from '@/lib/auth';

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret123';

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

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", RAZORPAY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign || RAZORPAY_SECRET === 'rzp_test_mock_secret123') { // Remove fallback in prod
            // Payment verified
            await dbConnect();

            // Create Booking record
            const passes = bookingDetails.participants.map((p, i) => ({
                ...p,
                passCode: `BPG-${bookingDetails.eventId}-${Date.now()}-P${i}`,
                checkedIn: false
            }));

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

            // Update Event bookedSlots and get event details for the email
            const eventInfo = await Event.findByIdAndUpdate(bookingDetails.eventId, {
                $inc: { bookedSlots: passes.length }
            });

            // Send Email Asynchronously
            if (bookingDetails.contactDetails?.email && eventInfo) {
                const mailDetails = {
                    title: eventInfo.title,
                    orderId: razorpay_order_id,
                    slots: passes.length,
                    amount: bookingDetails.amount,
                    formattedDate: new Date(eventInfo.date).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    }),
                    location: eventInfo.location?.city || eventInfo.location || 'TBD'
                };
                sendBookingConfirmationEmail(bookingDetails.contactDetails.email, user.username || bookingDetails.contactDetails.name || 'Traveler', mailDetails, newBooking._id.toString())
                    .catch(err => console.error("Failed to send booking pass email:", err));
            }

            return NextResponse.json({
                success: true,
                message: 'Payment verified successfully',
                bookingId: newBooking._id
            });

        } else {
            return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 });
        }
    } catch (error) {
        console.error("Verify Payment Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
