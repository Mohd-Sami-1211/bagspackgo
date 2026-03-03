import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TrekBooking } from '@/models/trekbooking.model';
import { Package } from '@/models/package.model';
import { getCurrentUser } from '@/lib/auth';

// GET — fetch all trek bookings for the logged-in user
export async function GET(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Users only' }, { status: 403 });

        await dbConnect();

        const bookings = await TrekBooking.find({ user: user.userId })
            .populate('package', 'name destination days pricingTiers')
            .populate('provider', 'username email phone')
            .sort({ createdAt: -1 })
            .lean();

        const formatted = bookings.map(b => ({
            id: b._id.toString(),
            bookingRef: b.bookingRef,
            type: 'trek',
            packageName: b.package?.name || b.packageSnapshot?.name || 'Trek Package',
            destination: b.package?.destination || b.packageSnapshot?.destination || '',
            guideName: b.provider?.username || 'Guide',
            startDate: b.startDate,
            endDate: b.endDate,
            numPeople: b.numPeople,
            peopleRange: b.peopleRange,
            totalAmount: b.totalAmount,
            status: b.status,
            days: b.package?.days || b.packageSnapshot?.days || 0,
            createdAt: b.createdAt,
        }));

        return NextResponse.json({ success: true, count: formatted.length, data: formatted });
    } catch (error) {
        console.error('Fetch trek bookings error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

// POST — create a pending trek booking
export async function POST(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Users only' }, { status: 403 });

        await dbConnect();

        const {
            packageId, guideId, startDate, numPeople, peopleRange,
            baseAmount, discount, platformFee, taxes, totalAmount,
            pickupDropoff, personalDetails, packageSnapshot
        } = await req.json();

        if (!packageId || !startDate || !numPeople || !totalAmount) {
            return NextResponse.json({ success: false, message: `Missing required fields.` }, { status: 400 });
        }

        // Verify package exists
        let pkg = null;
        try {
            pkg = await Package.findById(packageId);
        } catch (castErr) {
            return NextResponse.json({ success: false, message: `Invalid packageId format.` }, { status: 400 });
        }
        if (!pkg) return NextResponse.json({ success: false, message: `Package not found.` }, { status: 404 });

        // Calculate end date
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + (pkg.days || packageSnapshot?.days || 1) - 1);

        const bookingData = {
            user: user.userId,
            package: packageId,
            peopleRange: peopleRange || '1-2',
            numPeople: Number(numPeople),
            startDate: start,
            endDate: end,
            baseAmount: Number(baseAmount) || 0,
            discount: Number(discount) || 0,
            platformFee: Number(platformFee) || 50,
            taxes: Number(taxes) || 0,
            totalAmount: Number(totalAmount),
            pickupDropoff: pickupDropoff || {},
            personalDetails: personalDetails || {},
            packageSnapshot: {
                name: pkg.name || packageSnapshot?.name || 'Trek Package',
                destination: pkg.destination || packageSnapshot?.destination || '',
                days: pkg.days || packageSnapshot?.days || 1,
            },
            status: 'pending',
        };

        if (guideId && guideId !== 'undefined' && guideId !== 'null') {
            bookingData.provider = guideId;
        } else if (pkg.provider) {
            bookingData.provider = pkg.provider;
        }

        const booking = await TrekBooking.create(bookingData);

        return NextResponse.json({ success: true, bookingId: booking._id.toString(), bookingRef: booking.bookingRef }, { status: 201 });
    } catch (error) {
        console.error('Create trek booking error:', error);
        return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
    }
}
