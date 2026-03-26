import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TrekBooking } from '@/models/trekbooking.model';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'provider') return NextResponse.json({ success: false, message: 'Providers only' }, { status: 403 });

        const { id } = await params;
        if (!id) return NextResponse.json({ success: false, message: 'Booking ID required' }, { status: 400 });

        await dbConnect();

        const b = await TrekBooking.findById(id)
            .populate({ path: 'package', select: 'name destination days provider' })
            .populate('user', 'username email phone')
            .lean();

        if (!b) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });

        // Verify provider ownership
        if (b.provider?.toString() !== user.userId && b.package?.provider?.toString() !== user.userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized to view this booking' }, { status: 403 });
        }

        const formatted = {
            id: b._id.toString(),
            bookingRef: b.bookingRef,
            packageName: b.package?.name || b.packageSnapshot?.name || 'Trek Package',
            destination: b.package?.destination || b.packageSnapshot?.destination || '',
            days: b.package?.days || b.packageSnapshot?.days || 0,
            startDate: b.startDate,
            endDate: b.endDate,
            numPeople: b.numPeople,
            peopleRange: b.peopleRange,
            totalAmount: b.totalAmount,
            status: b.status,
            bookedBy: b.user?.username || 'User',
            bookedByEmail: b.user?.email || '',
            bookedByPhone: b.user?.phone || '',
            createdAt: b.createdAt,
            personalDetails: b.personalDetails || {},
            pickupDropoff: b.pickupDropoff || {},
            paymentId: b.paymentId,
            orderId: b.orderId,
            cancellationDetails: b.cancellationDetails || {},
        };

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Provider single trek booking error:', String(error));
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(request, context) {
    const params = await context.params;
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'provider') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { status } = await request.json();

        await dbConnect();
        const booking = await TrekBooking.findById(id).populate({ path: 'package', select: 'provider' });

        if (!booking) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });

        // Verify ownership
        const isOwner = (booking.provider?.toString() === user.userId || booking.package?.provider?.toString() === user.userId);
        if (!isOwner) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

        // Status update logic
        if (status === 'refund_initiated' && booking.status === 'cancellation_requested') {
            booking.status = 'refund_initiated';
            if (!booking.cancellationDetails) booking.cancellationDetails = {};
            booking.cancellationDetails.refundInitiatedAt = new Date();
        } else if (status === 'cancelled') {
            booking.status = 'cancelled';
            if (!booking.cancellationDetails) booking.cancellationDetails = {};
            booking.cancellationDetails.completedAt = new Date();
        } else {
            booking.status = status;
        }

        await booking.save();
        return NextResponse.json({ success: true, message: 'Booking status updated' });
    } catch (error) {
        console.error('Update trek status error:', error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
