// app/user/events/[id]/page.js
import { notFound } from 'next/navigation';
import { cache } from 'react'; // <-- IMPORT THIS
import dbConnect from '@/lib/db';
import { Event } from '@/models/event.model';
import Main from '@/components/home/EventSection/EventDetails/Main';
import mongoose from 'mongoose';

const getCachedEvent = cache(async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  await dbConnect();

  const [event] = await Event.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'guides',
        localField: 'guide',
        foreignField: '_id',
        as: 'guide',
        pipeline: [{ $project: { username: 1 } }],
      },
    },
    { $unwind: { path: '$guide', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'guidedetails',
        localField: 'guide._id',
        foreignField: 'guide',
        as: 'guideDetails',
        pipeline: [{ $project: { companyname: 1, logo: 1 } }],
      },
    },
    { $unwind: { path: '$guideDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        title: 1, eventType: 1, location: 1, date: 1, duration: 1,
        totalSlots: 1, bookedSlots: 1, pricePerSlot: 1, destination: 1,
        about: 1, highlights: 1, whatsIncluded: 1, whatsExcluded: 1,
        faqs: 1, whatToBring: 1, restrictions: 1, includePickup: 1,
        pickupPoints: 1, itinerary: 1, poster: 1, status: 1, rating: 1,
        reviewCount: 1, photographs: 1, termsAndConditions: 1,
        destinationLink: 1, visibility: 1, applicationFormType: 1,
        customFormFields: 1, createdAt: 1,
        guideName: {
          $ifNull: ['$guideDetails.companyname', '$guide.username', 'Local Organizer'],
        },
        guideLogo: { $ifNull: ['$guideDetails.logo', ''] },
        guide: { _id: '$guide._id', username: '$guide.username' },
      },
    },
  ]);

  if (!event) return null;

  return {
    id: event._id.toString(),
    name: event.title,
    eventType: event.eventType,
    location: event.location,
    meetingPoint: event.pickupPoints?.[0]?.location || event.location,
    date: event.date?.toISOString(),
    duration: `${event.duration} Days`,
    totalSlots: event.totalSlots,
    bookedSlots: event.bookedSlots || 0,
    slotsLeft: event.totalSlots - (event.bookedSlots || 0),
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
    image: event.poster,
    status: event.status,
    rating: event.rating,
    reviewCount: event.reviewCount || 0,
    guide: event.guide?._id ? { _id: event.guide._id.toString(), username: event.guide.username } : null,
    guideName: event.guideName,
    guideLogo: event.guideLogo,
    photographs: event.photographs || [],
    termsAndConditions: event.termsAndConditions || [],
    destinationLink: event.destinationLink,
    visibility: event.visibility || 'public',
    applicationFormType: event.applicationFormType || 'default',
    customFormFields: event.customFormFields || [],
    createdAt: event.createdAt?.toISOString(),
  };
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const event = await getCachedEvent(id); 

  if (!event) return {};

  return {
    title: `${event.name} | bagspackgo`,
    description: event.about?.slice(0, 160) || 'Book this event on bagspackgo.',
    openGraph: {
      title: event.name,
      description: event.about?.slice(0, 160),
      images: event.image ? [{ url: event.image }] : [],
    },
  };
}

export default async function EventDetailsPage({ params }) {
  const { id } = await params;
  const event = await getCachedEvent(id);

  if (!event) notFound();

  return <Main event={event} />;
}