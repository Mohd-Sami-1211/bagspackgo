import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { TrekBooking } from '@/models/trekbooking.model';

export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Only users can book treks.' }, { status: 403 });

        const { bookingId } = await request.json();
        if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return NextResponse.json({ success: false, message: 'A valid booking ID is required.' }, { status: 400 });
        }
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            return NextResponse.json({ success: false, message: 'Payment gateway not configured' }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        await dbConnect();

        const booking = await TrekBooking.findOne({ _id: bookingId, user: user.userId, status: 'pending' });
        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found or already processed' }, { status: 404 });
        }
        const payable = Number(booking.amountPaid || booking.totalAmount);
        if (!Number.isSafeInteger(payable) || payable < 1) {
            return NextResponse.json({ success: false, message: 'This booking has an invalid payable amount.' }, { status: 409 });
        }

        const existingOrderId = booking.orderId;
        if (existingOrderId && !['pending', 'creating'].includes(existingOrderId)) {
            return NextResponse.json({
                success: true,
                orderId: existingOrderId,
                amount: Math.round(payable * 100),
                currency: 'INR',
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
                bookingId,
                reused: true,
            });
        }

        if (existingOrderId === 'creating') {
            const stale = booking.orderCreationStartedAt
                && booking.orderCreationStartedAt < new Date(Date.now() - 2 * 60 * 1000);
            if (!stale) {
                return NextResponse.json({ success: false, message: 'Payment order is already being created. Please retry shortly.' }, { status: 409 });
            }
            try {
                const recovered = await razorpay.orders.all({ receipt: `tk_${bookingId}`, count: 10 });
                const existing = recovered?.items?.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))[0];
                if (existing?.id) {
                    if (Number(existing.amount) !== Math.round(payable * 100) || String(existing.currency).toUpperCase() !== 'INR') {
                        return NextResponse.json({ success: false, message: 'Recovered payment order does not match this booking.' }, { status: 409 });
                    }
                    await TrekBooking.updateOne(
                        { _id: booking._id, user: user.userId, status: 'pending', orderId: 'creating' },
                        { $set: { orderId: existing.id, orderCreationStartedAt: null } }
                    );
                    return NextResponse.json({
                        success: true,
                        orderId: existing.id,
                        amount: existing.amount,
                        currency: existing.currency || 'INR',
                        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
                        bookingId,
                        reused: true,
                    });
                }
            } catch (error) {
                console.warn('Could not recover stale trek order:', error);
                return NextResponse.json({
                    success: false,
                    processing: true,
                    bookingId,
                    message: 'We could not safely check the existing payment order. Please retry shortly.',
                }, { status: 503 });
            }
        }

        const claimed = await TrekBooking.findOneAndUpdate(
            {
                _id: booking._id,
                user: user.userId,
                status: 'pending',
                orderId: { $in: ['', 'pending', 'creating', null] },
            },
            { $set: { orderId: 'creating', orderCreationStartedAt: new Date() } },
            { new: true }
        );
        if (!claimed) {
            const latest = await TrekBooking.findById(booking._id).lean();
            if (latest?.orderId && !['pending', 'creating'].includes(latest.orderId)) {
                return NextResponse.json({
                    success: true,
                    orderId: latest.orderId,
                    amount: Math.round(Number(latest.amountPaid || latest.totalAmount) * 100),
                    currency: 'INR',
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
                    bookingId,
                    reused: true,
                });
            }
            return NextResponse.json({ success: false, message: 'Payment order is already being created. Please retry shortly.' }, { status: 409 });
        }

        let order;
        try {
            order = await razorpay.orders.create({
                amount: Math.round(payable * 100),
                currency: 'INR',
                receipt: `tk_${bookingId}`,
                notes: { bookingId, userId: user.userId },
            });
            await TrekBooking.updateOne(
                { _id: booking._id, user: user.userId, status: 'pending', orderId: 'creating' },
                { $set: { orderId: order.id, orderCreationStartedAt: null } }
            );
        } catch (error) {
            await TrekBooking.updateOne(
                { _id: booking._id, status: 'pending', orderId: 'creating' },
                { $set: { orderCreationStartedAt: new Date() } }
            ).catch(() => {});
            console.error('Trek payment order creation is awaiting reconciliation:', error);
            return NextResponse.json({
                success: false,
                processing: true,
                bookingId,
                message: 'The payment order status is being checked. Please do not start another payment yet.',
            }, { status: 202 });
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
        console.error('Trek create order error:', error);
        return NextResponse.json({ success: false, message: 'Failed to create payment order' }, { status: 500 });
    }
}
