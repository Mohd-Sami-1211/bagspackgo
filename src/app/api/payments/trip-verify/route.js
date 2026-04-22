import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { TripBooking } from '@/models/tripbooking.model';
import { User } from '@/models/user.model';
import { Guide } from '@/models/guide.model';
import { Package } from '@/models/package.model';
import { getCurrentUser } from '@/lib/auth';
import { sendTripBookingConfirmation } from '@/lib/otp-service';

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Only users can verify bookings.' }, { status: 403 });

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await request.json();

        if (!bookingId) return NextResponse.json({ success: false, message: 'bookingId required' }, { status: 400 });

        if (!RAZORPAY_SECRET) {
            console.error('Razorpay secret not configured');
            return NextResponse.json({ success: false, message: 'Payment gateway not configured' }, { status: 500 });
        }

        await dbConnect();

        const booking = await TripBooking.findOne({ _id: bookingId, user: user.userId });
        if (!booking) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });

        // Verify Razorpay signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto.createHmac('sha256', RAZORPAY_SECRET).update(sign).digest('hex');
        if (expectedSign !== razorpay_signature) {
            return NextResponse.json({ success: false, message: 'Payment verification failed — invalid signature' }, { status: 400 });
        }

        // Mark booking confirmed
        booking.status = 'confirmed';
        booking.paymentId = razorpay_payment_id;
        if (razorpay_order_id) booking.orderId = razorpay_order_id;
        await booking.save();

        // Fetch related data for emails
        const [userDoc, providerDoc, packageDoc] = await Promise.all([
            User.findById(booking.user).select('username email phone').lean(),
            Guide.findById(booking.provider).select('username email phone').lean(),
            Package.findById(booking.package).select('name destination days').lean(),
        ]);

        // Send confirmation emails (non-blocking)
        (async () => {
             try {
                 await sendTripBookingConfirmation({
                     userEmail: userDoc?.email,
                     userName: userDoc?.username || 'Traveller',
                     providerEmail: providerDoc?.email,
                     providerName: providerDoc?.username || 'Guide',
                     bookingRef: booking.bookingRef,
                     packageName: packageDoc?.name || booking.packageSnapshot?.name || 'Trip Package',
                     destination: packageDoc?.destination || booking.packageSnapshot?.destination || '',
                     startDate: booking.startDate,
                     endDate: booking.endDate,
                     numPeople: booking.numPeople,
                     totalAmount: booking.totalAmount,
                     isTrek: false
                 });
             } catch (err) {
                 console.error('Booking email error:', err);
             }
        })();

        return NextResponse.json({
            success: true,
            message: 'Payment verified! Booking confirmed.',
            bookingId: booking._id.toString(),
            bookingRef: booking.bookingRef,
        });
    } catch (error) {
        console.error('Trip verify error:', error);
        return NextResponse.json({ success: false, message: 'Server error during verification' }, { status: 500 });
    }
}
