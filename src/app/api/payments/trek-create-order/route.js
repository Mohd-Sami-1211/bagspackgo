import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { TrekBooking } from '@/models/trekbooking.model';

export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Only users can book treks.' }, { status: 403 });

        const { amount, bookingId } = await request.json();

        if (!amount || !bookingId) {
            return NextResponse.json({ success: false, message: 'Amount and bookingId are required' }, { status: 400 });
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
        const booking = await TrekBooking.findOne({ _id: bookingId, user: user.userId, status: 'pending' });
        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found or already processed' }, { status: 404 });
        }

        const options = {
            amount: Math.round(amount * 100), // paise
            currency: 'INR',
            receipt: `tk_${bookingId.toString().slice(-8)}_${Date.now().toString(36)}`,
            notes: { bookingId, userId: user.userId },
        };

        const order = await razorpay.orders.create(options);

        // Store orderId on the booking
        booking.orderId = order.id;
        await booking.save();

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
            bookingId,
        });
    } catch (error) {
        console.error('Trek create order error:', error);
        return NextResponse.json({ success: false, message: 'Failed to create payment order' }, { status: 500 });
    }
}
