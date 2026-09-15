import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { getCurrentUser } from '@/lib/auth';
import { packageHeroFor } from '@/lib/packageHero';

const PACKAGE_DETAIL_FIELDS = [
    'name', 'destination', 'days', 'category', 'packageType', 'packageCategory',
    'pricingTiers', 'activities', 'termsAndConditions', 'inclusivesList',
    'exclusivesList', 'additionalPoints', 'aboutPackage',
    'itinerary.day', 'itinerary.location', 'itinerary.agenda',
    'itinerary.travelFrom', 'itinerary.travelTo', 'itinerary.pickupTime',
    'itinerary.hotelName', 'itinerary.activities', 'itinerary.highlights',
    'itinerary.checkinTime', 'itinerary.isDayTrip', 'itinerary.hotelStars',
].join(' ');

const EVENT_DETAIL_FIELDS = [
    'title', 'eventType', 'date', 'duration', 'location', 'destination',
    'destinationLink', 'pricePerSlot', 'guide', 'highlights', 'whatsIncluded',
    'whatsExcluded', 'whatToBring', 'restrictions', 'includePickup',
    'pickupPoints', 'itinerary', 'termsAndConditions', 'sponsors', 'status',
].join(' ');

const cleanList = (value) => Array.isArray(value) ? value : [];

export async function GET(request, context) {
    try {
        const user = await getCurrentUser(request);
        if (!user || user.role !== 'user') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, message: 'Invalid booking ID' }, { status: 400 });
        }

        await dbConnect();
        const ownerQuery = { _id: id, user: user.userId };
        const view = new URL(request.url).searchParams.get('view');

        if (view === 'status') {
            const booking = await Booking.findOne(ownerQuery)
                .select('status cancellationDetails orderId paymentId expiresAt')
                .lean();
            if (!booking) {
                return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, booking }, {
                headers: { 'Cache-Control': 'private, no-store' },
            });
        }

        if (view === 'legacy-pass' || !view) {
            const booking = await Booking.findOne(ownerQuery)
                .populate('event', 'title eventType date duration location destination pricePerSlot guide')
                .lean();
            if (!booking) {
                return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, booking }, {
                headers: { 'Cache-Control': 'private, max-age=60, stale-while-revalidate=300' },
            });
        }

        const [eventBooking, tripBooking, trekBooking] = await Promise.all([
            Booking.findOne(ownerQuery)
                .select('event bookingDate amountPaid slots status createdAt participants contactDetails paymentId orderId selectedPickup customFormResponses cancellationDetails')
                .populate({ path: 'event', select: EVENT_DETAIL_FIELDS, populate: { path: 'guide', select: 'username name companyName email phone' } })
                .lean(),
            TripBooking.findOne(ownerQuery)
                .select('bookingRef package provider startDate endDate numPeople category totalAmount amountPaid remainingAmount paymentMode status createdAt personalDetails arrivalDeparture packageSnapshot paymentId orderId cancellationDetails')
                .populate('package', PACKAGE_DETAIL_FIELDS)
                .populate('provider', 'username name email phone')
                .lean(),
            TrekBooking.findOne(ownerQuery)
                .select('bookingRef package provider startDate endDate numPeople peopleRange totalAmount amountPaid status createdAt personalDetails pickupDropoff packageSnapshot paymentId orderId cancellationDetails')
                .populate('package', PACKAGE_DETAIL_FIELDS)
                .populate('provider', 'username name email phone')
                .lean(),
        ]);

        const source = eventBooking || tripBooking || trekBooking;
        if (!source) {
            return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        }

        const isEvent = Boolean(eventBooking);
        const isTrip = Boolean(tripBooking);
        const provider = isEvent ? eventBooking.event?.guide : source.provider;
        const providerDetails = provider?._id
            ? await GuideDetails.findOne({ guide: provider._id })
                .select('companyname companymobile companyemail instagram facebook website twitter')
                .lean()
            : null;
        const companyName = providerDetails?.companyname || provider?.companyName || provider?.username || provider?.name || 'Local Organizer';

        let data;
        if (isEvent) {
            const event = eventBooking.event;
            if (!event) {
                return NextResponse.json({ success: false, message: 'The event linked to this booking is unavailable' }, { status: 404 });
            }
            const paid = eventBooking.amountPaid ?? event.pricePerSlot ?? 0;
            data = {
                id: eventBooking._id.toString(), type: 'Event', name: event.title,
                destination: event.destination || event.location || 'TBD', location: event.location || '',
                destinationLink: event.destinationLink || '', guide: companyName, guideName: companyName, companyName,
                providerEmail: providerDetails?.companyemail || provider?.email || '',
                providerPhone: providerDetails?.companymobile || provider?.phone || '',
                people: eventBooking.slots || 1, date: event.date || eventBooking.bookingDate,
                duration: event.duration ? `${event.duration} day${event.duration === 1 ? '' : 's'}` : '1 day',
                category: event.eventType || 'Event', price: paid, totalAmount: paid, amountPaid: paid, remainingAmount: 0,
                status: eventBooking.status, createdAt: eventBooking.createdAt, bookingDate: eventBooking.bookingDate,
                paymentId: eventBooking.paymentId || '', orderId: eventBooking.orderId || '',
                cancellationDetails: eventBooking.cancellationDetails || {},
                personalDetails: { personalDetails: cleanList(eventBooking.participants) },
                participants: cleanList(eventBooking.participants), contactDetails: eventBooking.contactDetails || {},
                selectedPickup: eventBooking.selectedPickup || null, pickupPoints: cleanList(event.pickupPoints),
                includePickup: event.includePickup !== false, arrivalDeparture: {}, highlights: cleanList(event.highlights),
                inclusivesList: cleanList(event.whatsIncluded), exclusivesList: cleanList(event.whatsExcluded),
                whatToBring: cleanList(event.whatToBring), restrictions: cleanList(event.restrictions),
                itinerary: cleanList(event.itinerary), termsAndConditions: cleanList(event.termsAndConditions),
                sponsors: cleanList(event.sponsors), poster: `/api/events/${event._id.toString()}/poster`,
                passUrl: `/user/event/pass/${eventBooking._id.toString()}`,
            };
        } else {
            const pkg = source.package || {};
            const snapshot = source.packageSnapshot || {};
            const type = isTrip ? 'trip' : 'Trek';
            const packageId = pkg._id?.toString() || source.package?.toString() || '';
            data = {
                id: source._id.toString(), packageId, type,
                name: pkg.name || snapshot.name || (isTrip ? 'Trip Package' : 'Trek Package'),
                packageName: pkg.name || snapshot.name || (isTrip ? 'Trip Package' : 'Trek Package'),
                destination: pkg.destination || snapshot.destination || '', guide: companyName, guideName: companyName, companyName,
                providerEmail: providerDetails?.companyemail || provider?.email || '',
                providerPhone: providerDetails?.companymobile || provider?.phone || '',
                instagram: providerDetails?.instagram || '', facebook: providerDetails?.facebook || '',
                website: providerDetails?.website || '', twitter: providerDetails?.twitter || '',
                people: source.numPeople, numPeople: source.numPeople, date: source.startDate, startDate: source.startDate,
                endDate: source.endDate, duration: `${pkg.days || snapshot.days || 0} Days`, days: pkg.days || snapshot.days || 0,
                category: isTrip ? source.category : source.peopleRange, bookingRef: source.bookingRef,
                totalAmount: source.totalAmount, amountPaid: source.amountPaid ?? source.totalAmount,
                remainingAmount: isTrip ? (source.remainingAmount ?? Math.max(0, Number(source.totalAmount || 0) - Number(source.amountPaid ?? source.totalAmount ?? 0))) : 0,
                paymentMode: isTrip ? (source.paymentMode || 'full') : 'full', price: source.amountPaid ?? source.totalAmount,
                status: source.status, createdAt: source.createdAt, paymentId: source.paymentId || '', orderId: source.orderId || '',
                cancellationDetails: source.cancellationDetails || {}, personalDetails: source.personalDetails || {},
                arrivalDeparture: isTrip ? (source.arrivalDeparture || {}) : (source.pickupDropoff || {}),
                pickupDropoff: source.pickupDropoff || {}, packageSnapshot: snapshot,
                itinerary: cleanList(pkg.itinerary || snapshot.itinerary),
                termsAndConditions: cleanList(pkg.termsAndConditions || snapshot.termsAndConditions),
                inclusivesList: cleanList(pkg.inclusivesList || snapshot.inclusivesList),
                exclusivesList: cleanList(pkg.exclusivesList || snapshot.exclusivesList),
                additionalPoints: cleanList(pkg.additionalPoints || snapshot.additionalPoints),
                coverImage: packageHeroFor(packageId),
                passUrl: isTrip ? `/user/trip/pass/${source._id.toString()}` : `/user/trek/pass/${source._id.toString()}`,
            };
        }

        return NextResponse.json({
            success: true,
            type: isEvent ? 'event' : isTrip ? 'trip' : 'trek',
            data,
            booking: eventBooking || source,
        }, { headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=120' } });
    } catch (error) {
        console.error('Failed to fetch booking details:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
