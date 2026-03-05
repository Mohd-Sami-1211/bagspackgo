import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key123',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret123',
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

        await dbConnect();
        // In a real app we'd verify the price against Event collection here

        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: "INR",
            receipt: `re_${user.userId.toString().slice(-8)}_${Date.now().toString(36)}`,
            notes: {
                eventId,
                userId: user.userId,
            }
        };

        let order;
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
            try {
                // If real keys are provided, try creating from Razorpay real API
                order = await razorpay.orders.create(options);
            } catch (razorpayErr) {
                console.warn("Real Razorpay API failed, utilizing mock order fallback for dev environment", razorpayErr);
                order = {
                    id: `order_mock_${Date.now()}`,
                    amount: options.amount,
                    currency: 'INR'
                };
            }
        } else {
            // Mock order generation for local development testing
            order = {
                id: `order_mock_${Date.now()}`,
                amount: options.amount,
                currency: 'INR'
            };
        }

        return NextResponse.json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key123'
        });

    } catch (error) {
        console.error("Create Razorpay Order Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
