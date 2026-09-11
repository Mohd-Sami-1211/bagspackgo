import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TripBooking } from '@/models/tripbooking.model';
import { Package } from '@/models/package.model';
import { getCurrentUser } from '@/lib/auth';
import mongoose from 'mongoose';
import { calculateTripBookingQuote, TripBookingValidationError } from '@/lib/tripBooking';

// GET — fetch all trip bookings for the logged-in user
export async function GET(req) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'user') return NextResponse.json({ success: false, message: 'Users only' }, { status: 403 });

        await dbConnect();

        const bookings = await TripBooking.find({ user: user.userId })
            .populate('package', 'name destination days pricingTiers activities termsAndConditions itinerary inclusivesList exclusivesList additionalPoints')
            .populate('provider', 'username email phone')
            .sort({ createdAt: -1 })
            .lean();

        // Let's also fetch GuideDetails to get company names if available
        const providerIds = [...new Set(bookings.map(b => b.provider?._id).filter(id => id))];
        const { GuideDetails } = await import('@/models/guidedetails.model');
        const guideDetailsList = await GuideDetails.find({ guide: { $in: providerIds } })
            .select('guide companyname companymobile companyemail instagram facebook website twitter')
            .lean();
        
        const companyMap = {};
        guideDetailsList.forEach(gd => {
            companyMap[gd.guide.toString()] = {
                companyName: gd.companyname,
                phone: gd.companymobile,
                email: gd.companyemail,
                instagram: gd.instagram,
                facebook: gd.facebook,
                website: gd.website,
                twitter: gd.twitter
            };
        });

        const formatted = bookings.map(b => {
            const gd = companyMap[b.provider?._id?.toString()] || {};
            return {
                id: b._id.toString(),
                bookingRef: b.bookingRef,
                type: 'trip',
                packageName: b.package?.name || b.packageSnapshot?.name || 'Trip Package',
                destination: b.package?.destination || b.packageSnapshot?.destination || '',
                guideName: gd.companyName || b.provider?.username || 'Guide',
                companyName: gd.companyName || '',
                providerEmail: gd.email || b.provider?.email || '',
                providerPhone: gd.phone || b.provider?.phone || '',
                instagram: gd.instagram || '',
                facebook: gd.facebook || '',
                website: gd.website || '',
                twitter: gd.twitter || '',
                startDate: b.startDate,
                endDate: b.endDate,
                numPeople: b.numPeople,
                category: b.category,
                totalAmount: b.totalAmount,
                status: b.status,
                days: b.package?.days || b.packageSnapshot?.days || 0,
                createdAt: b.createdAt,
                // Include missing fields for success page/pass
                personalDetails: b.personalDetails || {},
                arrivalDeparture: b.arrivalDeparture || {},
                packageSnapshot: b.packageSnapshot || {},
                paymentId: b.paymentId || '',
                paymentMode: b.paymentMode || 'full',
                amountPaid: b.amountPaid || b.totalAmount,
                remainingAmount: b.remainingAmount || 0,
                cancellationDetails: b.cancellationDetails || {},
                itinerary: b.package?.itinerary || b.packageSnapshot?.itinerary || [],
                termsAndConditions: b.package?.termsAndConditions || b.packageSnapshot?.termsAndConditions || [],
                inclusivesList: b.package?.inclusivesList || b.packageSnapshot?.inclusivesList || [],
                exclusivesList: b.package?.exclusivesList || b.packageSnapshot?.exclusivesList || [],
                additionalPoints: b.package?.additionalPoints || b.packageSnapshot?.additionalPoints || [],
            };
        });

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
            packageId, startDate, numPeople, category,
            arrivalDeparture, personalDetails, paymentMode, checkoutKey,
        } = await req.json();

        if (!packageId || !startDate || !numPeople || !checkoutKey) {
            return NextResponse.json({ success: false, message: 'Package, travel date, travellers and checkout key are required.' }, { status: 400 });
        }
        if (!mongoose.Types.ObjectId.isValid(packageId)) {
            return NextResponse.json({ success: false, message: 'Invalid package ID.' }, { status: 400 });
        }
        if (typeof checkoutKey !== 'string' || checkoutKey.length < 8 || checkoutKey.length > 120) {
            return NextResponse.json({ success: false, message: 'Invalid checkout key.' }, { status: 400 });
        }

        const existing = await TripBooking.findOne({ user: user.userId, checkoutKey });
        if (existing) {
            return NextResponse.json({
                success: true,
                bookingId: existing._id.toString(),
                bookingRef: existing.bookingRef,
                amountPaid: existing.amountPaid,
                totalAmount: existing.totalAmount,
                reused: true,
            });
        }

        const pkg = await Package.findOne({ _id: packageId, category: 'trip', status: 'active' });
        if (!pkg) {
            return NextResponse.json({ success: false, message: 'This package is no longer available for booking.' }, { status: 409 });
        }

        const quote = calculateTripBookingQuote(pkg, numPeople, paymentMode);
        const allowedCategories = ['individual', 'couple', 'group'];
        const safeCategory = allowedCategories.includes(category) ? category : pkg.packageType || 'individual';

        // Calculate end date
        const start = new Date(startDate);
        if (Number.isNaN(start.getTime())) {
            return NextResponse.json({ success: false, message: 'Choose a valid travel date.' }, { status: 400 });
        }
        if (start < new Date(Date.now() - 24 * 60 * 60 * 1000) || start > new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000)) {
            return NextResponse.json({ success: false, message: 'The selected travel date is outside the allowed range.' }, { status: 400 });
        }
        const end = new Date(start);
        end.setDate(end.getDate() + (pkg.days || 1) - 1);

        const bookingData = {
            user: user.userId,
            package: packageId,
            provider: pkg.provider,
            checkoutKey,
            category: safeCategory,
            numPeople: quote.numPeople,
            startDate: start,
            endDate: end,
            baseAmount: quote.baseAmount,
            discount: quote.discount,
            platformFee: quote.platformFee,
            taxes: quote.taxes,
            totalAmount: quote.totalAmount,
            arrivalDeparture: arrivalDeparture || {},
            personalDetails: personalDetails || {},
            packageSnapshot: {
                name: pkg.name || 'Trip Package',
                destination: pkg.destination || '',
                days: pkg.days || 1,
                perPersonPrice: quote.baseAmount / quote.numPeople,
                gatewayFee: quote.gatewayFee,
            },
            paymentMode: quote.paymentMode,
            amountPaid: quote.amountPaid,
            remainingAmount: quote.remainingAmount,
            status: 'pending',
        };

        const booking = await TripBooking.create(bookingData);
        return NextResponse.json({
            success: true,
            bookingId: booking._id.toString(),
            bookingRef: booking.bookingRef,
            amountPaid: booking.amountPaid,
            totalAmount: booking.totalAmount,
        }, { status: 201 });
    } catch (error) {
        console.error('Create trip booking error:', error);
        if (error instanceof TripBookingValidationError) {
            return NextResponse.json({ success: false, message: error.message }, { status: error.status });
        }
        if (error?.code === 11000) {
            return NextResponse.json({ success: false, message: 'This checkout is already being created. Please retry.' }, { status: 409 });
        }
        return NextResponse.json({ success: false, message: 'Could not create this booking.' }, { status: 500 });
    }
}
