import { unstable_cache } from 'next/cache';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Event } from '@/models/event.model';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';

async function queryPublicEventDetails(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await dbConnect();

    // Keep posters, galleries, sponsor logos, and organizer logos out of the
    // initial document. Those assets are served by their own cached routes.
    const [event] = await Event.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
                status: 'published',
            },
        },
        {
            $project: {
                title: 1,
                eventType: 1,
                location: 1,
                date: 1,
                duration: 1,
                totalSlots: 1,
                bookedSlots: 1,
                reservedSlots: 1,
                pricePerSlot: 1,
                destination: 1,
                destinationLink: 1,
                about: 1,
                highlights: 1,
                whatsIncluded: 1,
                whatsExcluded: 1,
                faqs: 1,
                whatToBring: 1,
                restrictions: 1,
                includePickup: 1,
                pickupPoints: 1,
                itinerary: 1,
                termsAndConditions: 1,
                visibility: 1,
                applicationFormType: 1,
                customFormFields: 1,
                rating: 1,
                reviewCount: 1,
                createdAt: 1,
                guide: 1,
                photoCount: { $size: { $ifNull: ['$photographs', []] } },
                sponsorCount: { $size: { $ifNull: ['$sponsors', []] } },
            },
        },
    ]);

    if (!event) return null;

    const [guideAccount, guideDetails] = await Promise.all([
        Guide.findById(event.guide).select('username name').lean(),
        GuideDetails.findOne({ guide: event.guide }).select('companyname pausedServices').lean(),
    ]);

    if (guideDetails?.pausedServices?.event === true) return null;

    const eventId = event._id.toString();
    const guideName = guideDetails?.companyname
        || guideAccount?.username
        || guideAccount?.name
        || 'Local Guide';

    return {
        id: eventId,
        name: event.title,
        eventType: event.eventType,
        location: event.location,
        meetingPoint: event.pickupPoints?.[0]?.location || event.location,
        date: event.date?.toISOString?.() || event.date,
        duration: `${event.duration} day${event.duration === 1 ? '' : 's'}`,
        totalSlots: event.totalSlots,
        bookedSlots: event.bookedSlots || 0,
        reservedSlots: event.reservedSlots || 0,
        slotsLeft: Math.max(0, event.totalSlots - (event.bookedSlots || 0) - (event.reservedSlots || 0)),
        price: event.pricePerSlot,
        destinationId: event.destination,
        description: event.about,
        about: event.about,
        highlights: event.highlights || [],
        whatsIncluded: event.whatsIncluded || [],
        whatsExcluded: event.whatsExcluded || [],
        faqs: event.faqs || [],
        whatToBring: event.whatToBring || [],
        restrictions: event.restrictions || [],
        includePickup: event.includePickup !== false,
        pickupPoints: event.pickupPoints || [],
        itinerary: event.itinerary || [],
        image: `/api/events/${eventId}/poster`,
        status: 'published',
        rating: event.rating || 0,
        reviewCount: event.reviewCount || 0,
        guide: {
            _id: event.guide?.toString?.() || '',
            username: guideAccount?.username || '',
            name: guideAccount?.name || '',
        },
        guideName,
        guideLogo: `/api/events/${eventId}/guide-logo`,
        photoCount: event.photoCount || 0,
        sponsorCount: event.sponsorCount || 0,
        termsAndConditions: event.termsAndConditions || [],
        destinationLink: event.destinationLink || '',
        visibility: event.visibility || 'public',
        applicationFormType: event.applicationFormType || 'default',
        customFormFields: event.customFormFields || [],
        createdAt: event.createdAt?.toISOString?.() || event.createdAt,
    };
}

export const getPublicEventDetails = unstable_cache(
    queryPublicEventDetails,
    ['public-event-details-v4'],
    { revalidate: 30 }
);
