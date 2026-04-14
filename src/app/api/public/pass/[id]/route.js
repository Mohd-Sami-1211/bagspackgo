import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Booking } from '@/models/booking.model';
import { TripBooking } from '@/models/tripbooking.model';
import { TrekBooking } from '@/models/trekbooking.model';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';


export async function GET(req, context) {
    const params = await context.params;
    const { id } = params;

    if (!id) {
        return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });
    }

    try {
        await dbConnect();

        // Use valid ObjectId for find queries if needed
        const isValidId = mongoose.Types.ObjectId.isValid(id);
        const query = isValidId ? { $or: [{ _id: id }, { bookingRef: id }] } : { bookingRef: id };

        const augmentBooking = async (booking) => {
            const { Package } = await import('@/models/package.model');
            const { GuideDetails } = await import('@/models/guidedetails.model');
            const { Guide } = await import('@/models/guide.model');

            let packageData = {};
            if (booking.package) {
                packageData = await Package.findById(booking.package).lean() || {};
            }

            let providerDetails = {};
            if (booking.provider) {
                const gd = await GuideDetails.findOne({ guide: booking.provider }).lean();
                const guideUser = await Guide.findById(booking.provider).select('username email phone').lean();
                providerDetails = {
                    companyName: gd?.companyname || gd?.agencyName || guideUser?.username || 'Verified Partner',
                    providerPhone: guideUser?.phone || gd?.contactPhone || '',
                    providerEmail: guideUser?.email || gd?.contactEmail || '',
                    instagram: gd?.socialLinks?.instagram || gd?.instagram || '',
                    facebook: gd?.socialLinks?.facebook || gd?.facebook || '',
                    website: gd?.website || ''
                };
            }

            return {
                ...booking,
                packageSnapshot: { ...booking.packageSnapshot, ...packageData },
                ...providerDetails
            };
        };

        // Check Trip Bookings
        const trip = await TripBooking.findOne(query).lean();
        if (trip) {
            const augmentedTrip = await augmentBooking(trip);
            return NextResponse.json({ success: true, type: 'trip', data: { ...augmentedTrip, bookingType: 'trip' } });
        }

        // Check Trek Bookings
        const trek = await TrekBooking.findOne(query).lean();
        if (trek) {
            const augmentedTrek = await augmentBooking(trek);
            return NextResponse.json({ success: true, type: 'trek', data: { ...augmentedTrek, bookingType: 'trek' } });
        }

        // Check Event Bookings (Events usually only have ObjectId)
        if (isValidId) {
            const eventBooking = await Booking.findOne({ _id: id })
                .populate({
                    path: 'event',
                    populate: { path: 'guide', select: 'companyName username name email phone' }
                })
                .lean();

            if (eventBooking) {
                // Format similarly to the user bookings API
                const { GuideDetails } = await import('@/models/guidedetails.model');
                const e = eventBooking.event || {};
                const gd = e.guide ? await GuideDetails.findOne({ guide: e.guide._id }).select('companyname socialLinks instagram facebook website contactPhone contactEmail').lean() : null;
                const gName = gd?.companyname || e.guide?.companyName || e.guide?.username || e.guide?.name || 'Local Organizer';

                const formattedBooking = {
                    id: eventBooking._id.toString(),
                    bookingType: 'event',
                    category: e.eventType || 'Event',
                    name: e.title,
                    guideName: gName,
                    companyName: gName,
                    guide: gName,
                    providerId: e.guide?._id?.toString() || '',
                    providerPhone: e.guide?.phone || gd?.contactPhone || '',
                    providerEmail: e.guide?.email || gd?.contactEmail || '',
                    instagram: gd?.socialLinks?.instagram || gd?.instagram || '',
                    facebook: gd?.socialLinks?.facebook || gd?.facebook || '',
                    website: gd?.website || '',
                    date: e.date || eventBooking.bookingDate,
                    duration: e.duration ? `${e.duration} days` : '1 day',
                    people: eventBooking.slots || 1,
                    destination: e.destination || e.location || 'TBD',
                    destinationLink: e.destinationLink || '',
                    location: e.location || '',
                    price: eventBooking.amountPaid || e.pricePerSlot,
                    image: e.poster || '',
                    poster: e.poster || '',
                    status: eventBooking.status,
                    highlights: e.highlights || [],
                    whatsIncluded: e.whatsIncluded || [],
                    whatsExcluded: e.whatsExcluded || [],
                    whatToBring: e.whatToBring || [],
                    restrictions: e.restrictions || [],
                    termsAndConditions: e.termsAndConditions || [],
                    pickupPoints: e.pickupPoints || [],
                    itinerary: e.itinerary || [],
                    participants: eventBooking.participants || [],
                    contactDetails: eventBooking.contactDetails || {},
                    paymentId: eventBooking.paymentId || '',
                    orderId: eventBooking.orderId || '',
                    bookingDate: eventBooking.bookingDate || eventBooking.createdAt,
                    selectedPickup: eventBooking.selectedPickup || null,
                };

                return NextResponse.json({ success: true, type: 'event', data: formattedBooking });
            }
        }

        return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    } catch (error) {
        console.error('Failed to fetch public booking details:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
