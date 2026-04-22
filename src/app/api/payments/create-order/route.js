import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// GET /api/payments/key defaults to sending public key
export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }
        if (user.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Only users can make bookings.' }, { status: 403 });
        }

        const { amount, eventId, participants } = await request.json();

        if (!amount) {
            return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay keys not configured');
            return NextResponse.json({ success: false, message: 'Payment gateway not configured' }, { status: 500 });
        }

        await dbConnect();

        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: "INR",
            receipt: `re_${user.userId.toString().slice(-8)}_${Date.now().toString(36)}`,
            notes: {
                eventId,
                userId: user.userId,
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            success: true,
            order,
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("Create Razorpay Order Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
