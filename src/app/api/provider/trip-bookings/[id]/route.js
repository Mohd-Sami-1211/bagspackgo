import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TripBooking } from '@/models/tripbooking.model';
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

        const booking = await TripBooking.findById(id)
            .populate('user', 'username email phone')
            .populate('package', 'name destination days pricingTiers')
            .lean();

        if (!booking) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        // Verify that this booking belongs to the provider (either via direct provider field or via package)
        const isProviderMatch = booking.provider?.toString() === user.userId;
        const isPackageMatch = booking.package?.provider?.toString() === user.userId; // NOTE: `package` is populated, so its `provider` might not be selected? Wait, the populate didn't select 'provider'.
        // Let's just fetch the booking and verify
        // Actually, it's safer to re-query with the condition
        const verifyBooking = await TripBooking.findOne({
            _id: id
        }).populate({
            path: 'package',
            select: 'name destination days provider',
        }).populate('user', 'username email phone').lean();

        if (!verifyBooking) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        if (verifyBooking.provider?.toString() !== user.userId && verifyBooking.package?.provider?.toString() !== user.userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized to view this booking' }, { status: 403 });
        }

        const b = verifyBooking;

        const formatted = {
            id: b._id.toString(),
            bookingRef: b.bookingRef,
            packageName: b.package?.name || b.packageSnapshot?.name || 'Trip Package',
            destination: b.package?.destination || b.packageSnapshot?.destination || '',
            days: b.package?.days || b.packageSnapshot?.days || 0,
            startDate: b.startDate,
            endDate: b.endDate,
            numPeople: b.numPeople,
            category: b.category,
            totalAmount: b.totalAmount,
            status: b.status,
            bookedBy: b.user?.username || 'User',
            bookedByEmail: b.user?.email || '',
            bookedByPhone: b.user?.phone || '',
            createdAt: b.createdAt,
            personalDetails: b.personalDetails || {},
            arrivalDeparture: b.arrivalDeparture || {},
            emergencyContact: b.personalDetails?.emergencyContact || {},
            // include payment details if relevant
            paymentId: b.paymentId,
            orderId: b.orderId
        };

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Provider single trip booking error:', String(error));
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
