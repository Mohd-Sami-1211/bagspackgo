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
        };

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Provider single trek booking error:', String(error));
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
