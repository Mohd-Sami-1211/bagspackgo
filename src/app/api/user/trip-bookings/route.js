import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TripBooking } from '@/models/tripbooking.model';
import { Package } from '@/models/package.model';
import { getCurrentUser } from '@/lib/auth';

// GET — fetch all trip bookings for the logged-in user
export async function GET(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Users only' }, { status: 403 });

        await dbConnect();

        const bookings = await TripBooking.find({ user: user.userId })
            .populate('package', 'name destination days pricingTiers activities')
            .populate('provider', 'username email phone')
            .sort({ createdAt: -1 })
            .lean();

        const formatted = bookings.map(b => ({
            id: b._id.toString(),
            bookingRef: b.bookingRef,
            type: 'trip',
            packageName: b.package?.name || b.packageSnapshot?.name || 'Trip Package',
            destination: b.package?.destination || b.packageSnapshot?.destination || '',
            guideName: b.provider?.username || 'Guide',
            startDate: b.startDate,
            endDate: b.endDate,
            numPeople: b.numPeople,
            category: b.category,
            totalAmount: b.totalAmount,
            status: b.status,
            days: b.package?.days || b.packageSnapshot?.days || 0,
            createdAt: b.createdAt,
        }));

        return NextResponse.json({ success: true, data: formatted });
    } catch (error) {
        console.error('Fetch trip bookings error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

// POST — create a pending trip booking
export async function POST(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Users only' }, { status: 403 });

        await dbConnect();

        const {
            packageId, guideId, startDate, numPeople, category,
            baseAmount, discount, platformFee, taxes, totalAmount,
            arrivalDeparture, personalDetails, packageSnapshot
        } = await req.json();

        console.log('[trip-bookings POST] received:', { packageId, guideId, startDate, numPeople, totalAmount });

        if (!packageId || !startDate || !numPeople || !totalAmount) {
            return NextResponse.json({ success: false, message: `Missing required fields: packageId=${packageId}, startDate=${startDate}, numPeople=${numPeople}, totalAmount=${totalAmount}` }, { status: 400 });
        }

        // Verify package exists
        let pkg = null;
        try {
            pkg = await Package.findById(packageId);
        } catch (castErr) {
            return NextResponse.json({ success: false, message: `Invalid packageId format: ${packageId}` }, { status: 400 });
        }
        if (!pkg) return NextResponse.json({ success: false, message: `Package not found for id: ${packageId}` }, { status: 404 });

        // Calculate end date
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + (pkg.days || packageSnapshot?.days || 1) - 1);

        const bookingData = {
            user: user.userId,
            package: packageId,
            category: category || 'individual',
            numPeople: Number(numPeople),
            startDate: start,
            endDate: end,
            baseAmount: Number(baseAmount) || 0,
            discount: Number(discount) || 0,
            platformFee: Number(platformFee) || 50,
            taxes: Number(taxes) || 0,
            totalAmount: Number(totalAmount),
            arrivalDeparture: arrivalDeparture || {},
            personalDetails: personalDetails || {},
            packageSnapshot: {
                name: pkg.name || packageSnapshot?.name || 'Trip Package',
                destination: pkg.destination || packageSnapshot?.destination || '',
                days: pkg.days || packageSnapshot?.days || 1,
            },
            status: 'pending',
        };

        // Only add provider if valid guideId provided
        if (guideId && guideId !== 'undefined' && guideId !== 'null') {
            bookingData.provider = guideId;
        } else if (pkg.provider) {
            bookingData.provider = pkg.provider;
        }

        const booking = await TripBooking.create(bookingData);

        console.log('[trip-bookings POST] created booking:', booking._id, 'ref:', booking.bookingRef);

        return NextResponse.json({ success: true, bookingId: booking._id.toString(), bookingRef: booking.bookingRef }, { status: 201 });
    } catch (error) {
        console.error('Create trip booking error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
