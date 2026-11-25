import { revalidateTag, unstable_cache } from 'next/cache';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { Event } from '@/models/event.model';
import { Guide } from '@/models/guide.model';
import { GuideDetails } from '@/models/guidedetails.model';
import { isPublicProvider } from '@/lib/seo';
import { providerProfilePath } from '@/lib/providerSlug';
import { getEventCustomFormFields, getEventParticipantFields } from '@/lib/eventForm';
import { getPublicEventSlots } from '@/lib/eventSlots';

async function queryPublicEventDetails(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    await dbConnect();

    // Keep posters, galleries, sponsor logos, and organizer logos out of the
    // initial document. Those assets are served by their own cached routes.
    const [event] = await Event.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
                status: { $in: ['published', 'completed', 'cancelled'] },
            },
        },
        {
            $project: {
                title: 1,
                status: 1,
                eventType: 1,
                location: 1,
                date: 1,
                duration: 1,
                totalSlots: 1,
                showAvailableSlots: 1,
                showTotalSlots: 1,
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
                participantFields: 1,
                customFormFields: 1,
                rating: 1,
                reviewCount: 1,
                createdAt: 1,
                guide: 1,
                photoCount: { $size: { $ifNull: ['$photographs', []] } },
                hasPoster: { $gt: [{ $strLenCP: { $ifNull: ['$poster', ''] } }, 0] },
                sponsorCount: { $size: { $ifNull: ['$sponsors', []] } },
            },
        },
    ]);

    if (!event) return null;

    const [guideAccount, guideDetails] = await Promise.all([
        Guide.findById(event.guide).select('username name applicationStatus isActive').lean(),
        GuideDetails.findOne({ guide: event.guide }).select('companyname profileSlug pausedServices status').lean(),
    ]);

    if (!isPublicProvider(guideAccount, guideDetails) || guideDetails?.pausedServices?.event === true) return null;

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
        durationDays: event.duration,
        ...getPublicEventSlots(event),
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
        image: event.hasPoster ? `/api/events/${eventId}/poster` : '/images/EventCover.webp',
        status: event.status,
        rating: event.rating || 0,
        reviewCount: event.reviewCount || 0,
        guide: {
            _id: event.guide?.toString?.() || '',
            username: guideAccount?.username || '',
            name: guideAccount?.name || '',
        },
        guideName,
        guidePath: providerProfilePath(guideDetails?.profileSlug || guideName, event.guide?.toString()),
        guideLogo: `/api/events/${eventId}/guide-logo`,
        photoCount: event.photoCount || 0,
        sponsorCount: event.sponsorCount || 0,
        termsAndConditions: event.termsAndConditions || [],
        destinationLink: event.destinationLink || '',
        visibility: event.visibility || 'public',
        applicationFormType: event.applicationFormType || 'default',
        participantFields: getEventParticipantFields(event.participantFields),
        customFormFields: getEventCustomFormFields(event),
        createdAt: event.createdAt?.toISOString?.() || event.createdAt,
    };
}

export const getPublicEventDetails = unstable_cache(
    queryPublicEventDetails,
    ['public-event-details-v9'],
    { revalidate: 30, tags: ['public-event-details'] }
);

export function revalidatePublicEventSlots() {
    revalidateTag('public-event-details', { expire: 0 });
    revalidateTag('public-provider-profile', { expire: 0 });
}
