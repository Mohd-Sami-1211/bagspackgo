import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TripBooking } from '@/models/tripbooking.model';
import { Package } from '@/models/package.model';
import { User } from '@/models/user.model';
import { getCurrentUser } from '@/lib/auth';

// GET — fetch all trip bookings for this provider's packages
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'provider') return NextResponse.json({ success: false, message: 'Providers only' }, { status: 403 });

        await dbConnect();

        // Find all packages belonging to this provider
        const providerPackages = await Package.find({ provider: user.userId }).select('_id name destination').lean();
        const packageIds = providerPackages.map(p => p._id);

        if (packageIds.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        // Find bookings for those packages — also include bookings where provider field matches
        const bookings = await TripBooking.find({
            $or: [
                { package: { $in: packageIds } },
                { provider: user.userId },
            ],
        })
            .populate('user', 'username email phone')
            .populate('package', 'name destination days pricingTiers')
            .sort({ createdAt: -1 })
            .lean();

        const formatted = bookings.map(b => ({
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
            cancellationDetails: b.cancellationDetails || {},
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Provider trip bookings error:', String(error), error.stack);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
