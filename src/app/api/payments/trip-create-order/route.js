import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import dbConnect from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { TripBooking } from '@/models/tripbooking.model';
import mongoose from 'mongoose';

export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Only users can book trips.' }, { status: 403 });

        const { bookingId } = await request.json();

        if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
            return NextResponse.json({ success: false, message: 'A valid booking ID is required.' }, { status: 400 });
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
        const booking = await TripBooking.findOne({ _id: bookingId, user: user.userId, status: 'pending' });
        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found or already processed' }, { status: 404 });
        }

        const existingOrderId = booking.orderId;
        if (existingOrderId && !['pending', 'creating'].includes(existingOrderId)) {
            return NextResponse.json({
                success: true,
                orderId: existingOrderId,
                amount: Math.round(booking.amountPaid * 100),
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
                const recovered = await razorpay.orders.all({ receipt: `tr_${bookingId}`, count: 10 });
                const existing = recovered?.items?.sort((a, b) => (b.created_at || 0) - (a.created_at || 0))[0];
                if (existing?.id) {
                    if (Number(existing.amount) !== Math.round(booking.amountPaid * 100) || String(existing.currency).toUpperCase() !== 'INR') {
                        return NextResponse.json({ success: false, message: 'Recovered payment order does not match this booking.' }, { status: 409 });
                    }
                    await TripBooking.updateOne(
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
            } catch (recoveryError) {
                console.warn('Could not recover stale trip order:', recoveryError);
                return NextResponse.json({
                    success: false,
                    processing: true,
                    bookingId,
                    message: 'We could not safely check the existing payment order. Please retry shortly.',
                }, { status: 503 });
            }
        }

        const claimed = await TripBooking.findOneAndUpdate(
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
            const latest = await TripBooking.findById(booking._id).lean();
            if (latest?.orderId && !['pending', 'creating'].includes(latest.orderId)) {
                return NextResponse.json({
                    success: true,
                    orderId: latest.orderId,
                    amount: Math.round(latest.amountPaid * 100),
                    currency: 'INR',
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
                    bookingId,
                    reused: true,
                });
            }
            return NextResponse.json({ success: false, message: 'Payment order is already being created. Please retry shortly.' }, { status: 409 });
        }

        const options = {
            // The amount comes exclusively from the server-calculated booking quote.
            amount: Math.round(booking.amountPaid * 100), // paise
            currency: 'INR',
            receipt: `tr_${bookingId}`,
            notes: { bookingId, userId: user.userId },
        };

        let order;
        try {
            order = await razorpay.orders.create(options);
            await TripBooking.updateOne(
                { _id: booking._id, user: user.userId, status: 'pending', orderId: 'creating' },
                { $set: { orderId: order.id, orderCreationStartedAt: null } }
            );
        } catch (error) {
            // Preserve the claim: a later retry can recover the gateway order by receipt.
            await TripBooking.updateOne(
                { _id: booking._id, status: 'pending', orderId: 'creating' },
                { $set: { orderCreationStartedAt: new Date() } }
            ).catch(() => {});
            console.error('Trip payment order creation is awaiting reconciliation:', error);
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
        console.error('Trip create order error:', error);
        return NextResponse.json({ success: false, message: 'Failed to create payment order' }, { status: 500 });
    }
}
