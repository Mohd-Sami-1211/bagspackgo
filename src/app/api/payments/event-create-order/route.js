import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { Booking } from '@/models/booking.model';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret123',
});

export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Only users can book events.' }, { status: 403 });

        const { amount, bookingId } = await request.json();

        if (!amount || !bookingId) {
            return NextResponse.json({ success: false, message: 'Amount and bookingId are required' }, { status: 400 });
        }

        await dbConnect();

        // Verify the booking belongs to this user and is still pending
        const booking = await Booking.findOne({ _id: bookingId, user: user.userId, status: 'pending' });
        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found or already processed' }, { status: 404 });
        }

        // ── Fresh slot availability check before initiating payment ──
        const { Event } = await import('@/models/event.model');
        const eventDoc = await Event.findById(booking.event).select('totalSlots bookedSlots').lean();
        if (!eventDoc) {
            return NextResponse.json({ success: false, message: 'Event no longer exists' }, { status: 404 });
        }
        const available = eventDoc.totalSlots - (eventDoc.bookedSlots || 0);
        if (booking.slots > available) {
            // Cancel the stale pending booking
            booking.status = 'cancelled';
            await booking.save();
            return NextResponse.json({ 
                success: false, 
                soldOut: true,
                message: available <= 0 ? 'This event is now sold out.' : `Only ${available} slot(s) remaining.`
            }, { status: 409 });
        }

        const options = {
            amount: Math.round(amount * 100), // paise
            currency: 'INR',
            receipt: `ev_${bookingId.toString().slice(-8)}_${Date.now().toString(36)}`,
            notes: { bookingId, userId: user.userId },
        };

        let order;
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
            order = await razorpay.orders.create(options);
        } else {
            // Mock for dev
            order = {
                id: `mock_order_${Date.now()}`,
                amount: options.amount,
                currency: 'INR',
                receipt: options.receipt,
            };
        }

        // Store orderId on the booking
        booking.orderId = order.id;
        await booking.save();

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key123',
            bookingId,
        });
    } catch (error) {
        console.error('Event create order error:', error);
        return NextResponse.json({ success: false, message: 'Failed to create payment order' }, { status: 500 });
    }
}
