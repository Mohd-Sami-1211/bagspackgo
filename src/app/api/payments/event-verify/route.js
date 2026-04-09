import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { User } from '@/models/user.model';
import { Guide } from '@/models/guide.model';
import { Event } from '@/models/event.model';
import { getCurrentUser } from '@/lib/auth';
import { sendEventBookingConfirmation } from '@/lib/otp-service';

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret123';

export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Only users can verify bookings.' }, { status: 403 });

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await request.json();

        if (!bookingId) return NextResponse.json({ success: false, message: 'bookingId required' }, { status: 400 });

        await dbConnect();

        const booking = await Booking.findOne({ _id: bookingId, user: user.userId });
        if (!booking) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });

        // Verify Razorpay signature
        const isMock = razorpay_order_id?.startsWith('mock_order_') || (!razorpay_signature && !process.env.RAZORPAY_KEY_ID);
        if (!isMock && RAZORPAY_SECRET) {
            const sign = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSign = crypto.createHmac('sha256', RAZORPAY_SECRET).update(sign).digest('hex');
            if (expectedSign !== razorpay_signature) {
                return NextResponse.json({ success: false, message: 'Payment verification failed — invalid signature' }, { status: 400 });
            }
        }

        // Mark booking confirmed
        booking.status = 'confirmed';
        booking.paymentId = razorpay_payment_id || 'mock_payment';
        if (razorpay_order_id) booking.orderId = razorpay_order_id;
        
        await booking.save();

        // Update event booked slots atomically — only if enough slots remain
        const slotUpdate = await Event.findOneAndUpdate(
            { 
                _id: booking.event, 
                $expr: { $lte: [{ $add: ['$bookedSlots', booking.slots] }, '$totalSlots'] }
            },
            { $inc: { bookedSlots: booking.slots } },
            { new: true }
        );
        if (!slotUpdate) {
            // Revert booking status if slots ran out (race condition)
            booking.status = 'pending';
            await booking.save();
            return NextResponse.json({ success: false, message: 'Slots are no longer available. Booking could not be confirmed.' }, { status: 400 });
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
