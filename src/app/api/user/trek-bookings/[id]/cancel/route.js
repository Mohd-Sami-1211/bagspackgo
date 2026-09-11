import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TrekBooking } from '@/models/trekbooking.model';
import { getCurrentUser } from '@/lib/auth';

// POST — request cancellation of a trek booking
export async function POST(req, { params }) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Users only' }, { status: 403 });

        const { id } = await params;
        await dbConnect();

        const { reason } = await req.json();

        if (typeof reason !== 'string' || !reason.trim()) {
            return NextResponse.json({ success: false, message: 'Cancellation reason is required.' }, { status: 400 });
        }

        const booking = await TrekBooking.findOne({ _id: id, user: user.userId });
        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
        }

        // Only allow cancellation of confirmed or pending bookings
        if (!['confirmed', 'pending'].includes(booking.status)) {
            return NextResponse.json({ success: false, message: `Cannot cancel a booking with status: ${booking.status}` }, { status: 400 });
        }

        const safeReason = reason.trim().slice(0, 1000);
        const ticketId = 'CAN-TREK-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const hasPayment = Boolean(booking.paymentId) || booking.status === 'confirmed';
        const paidAmount = Math.max(0, Number(booking.amountPaid || booking.totalAmount || 0));
        const refundAmt = hasPayment
            ? Math.max(0, paidAmount - Math.min(paidAmount, Number(booking.platformFee || 0)))
            : 0;

        // Keep unpaid checkouts as tombstones because an already-authorised
        // payment can still be captured after the user cancels.
        booking.status = hasPayment ? 'cancellation_requested' : 'cancelled';
        booking.cancellationDetails = {
            ticketId,
            reason: safeReason,
            requestedAt: new Date(),
            refundInitiatedAt: null,
            completedAt: null,
            refundAmount: refundAmt,
            refundStatus: refundAmt > 0 ? 'pending' : 'not_required',
        };

        await booking.save();

        return NextResponse.json({
            success: true,
            message: hasPayment ? 'Cancellation requested successfully.' : 'Pending booking cancelled.',
        });
    } catch (error) {
        console.error('Cancel trek booking error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
